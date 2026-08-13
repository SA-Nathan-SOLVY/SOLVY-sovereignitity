import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { Pool } from 'pg';
import rateLimit from 'express-rate-limit';
import { runMigrations } from 'stripe-replit-sync';
import { getStripeSync, getUncachableStripeClient, getStripePublishableKey } from './stripeClient';
import { WebhookHandlers } from './webhookHandlers';
import { setupAuth, registerAuthRoutes, authStorage } from './replit_integrations/auth';
import {
  sendMemberWelcome,
  sendFirstCircleConfirmation,
  sendPrelaunchAck,
  sendContactNotification,
  sendEBLPaymentNotification,
  sendEBLCustomerReceipt,
} from './emailService';
import bankingRouter from './bankingRouter';
import lithicRouter from './lithicRouter';
import { getMemberSession, requireVerifiedMember, registerMemberAuthRoutes } from './memberAuth';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const IS_TEST = process.env.NODE_ENV === 'test';
export const app = express();
const PORT = IS_PRODUCTION ? (process.env.PORT ? parseInt(process.env.PORT) : 5000) : 3001;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS first_circle_deposits (
      id SERIAL PRIMARY KEY,
      session_id TEXT UNIQUE NOT NULL,
      member_id TEXT,
      member_name TEXT,
      customer_email TEXT,
      amount_total INTEGER,
      currency TEXT DEFAULT 'usd',
      payment_status TEXT,
      deposit_type TEXT DEFAULT 'first_circle_equity',
      stripe_event_id TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS founding_members (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT,
      address_line1 TEXT,
      address_city TEXT,
      address_state TEXT,
      address_zip TEXT,
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      member_number TEXT UNIQUE,
      status TEXT DEFAULT 'pending',
      kyc_verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);
  
  await pool.query(`
    CREATE TABLE IF NOT EXISTS prelaunch_commitments (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      monthly_pledge NUMERIC(10,2) NOT NULL,
      committed_at DATE NOT NULL DEFAULT CURRENT_DATE,
      status TEXT DEFAULT 'committed',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR PRIMARY KEY,
      email VARCHAR UNIQUE,
      first_name VARCHAR,
      last_name VARCHAR,
      profile_image_url VARCHAR,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS payment_links (
      purpose TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      stripe_id TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  // Durable record of verified member identities. A member is created/updated on
  // every successful email verification (see memberAuth.upsertMember), so we can
  // recognize returning members across devices and after they clear cookies. No
  // PII beyond the email is stored here; public displays keep their existing masking.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS members (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      first_verified_at TIMESTAMPTZ DEFAULT NOW(),
      last_verified_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS data_pool_optins (
      id SERIAL PRIMARY KEY,
      member_email TEXT NOT NULL,
      pool_id TEXT NOT NULL,
      opted_in_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(member_email, pool_id)
    )
  `);
  // Optionally link an opt-in to the stored member record; older rows stay null.
  await pool.query(`ALTER TABLE data_pool_optins ADD COLUMN IF NOT EXISTS member_id INTEGER REFERENCES members(id)`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS data_pool_sales (
      id SERIAL PRIMARY KEY,
      pool_id TEXT NOT NULL,
      pool_name TEXT NOT NULL,
      buyer TEXT NOT NULL,
      gross_amount NUMERIC(12,2) NOT NULL,
      contributing_members INTEGER DEFAULT 0,
      sale_date DATE DEFAULT CURRENT_DATE,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  // EPIC-001: Local-First Data Architecture.
  // Only PII-free aggregates are ever stored here — raw member transactions
  // live exclusively on the member's device (IndexedDB). Aggregates auto-purge
  // after 30 days (see purgeStaleAggregates).
  await pool.query(`
    CREATE TABLE IF NOT EXISTS data_pool_aggregates (
      id SERIAL PRIMARY KEY,
      pool_id TEXT NOT NULL,
      contributor_id TEXT NOT NULL,
      aggregate JSONB NOT NULL,
      contributed_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(pool_id, contributor_id)
    )
  `);

  // Member governance — recorded votes on data-use changes.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS data_use_proposals (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      pool_id TEXT,
      threshold INTEGER NOT NULL DEFAULT 5,
      status TEXT NOT NULL DEFAULT 'open',
      created_by TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  // Member-submitted proposals record who raised them; backfill for older tables.
  await pool.query(`ALTER TABLE data_use_proposals ADD COLUMN IF NOT EXISTS created_by TEXT`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS data_use_votes (
      id SERIAL PRIMARY KEY,
      proposal_id INTEGER NOT NULL REFERENCES data_use_proposals(id) ON DELETE CASCADE,
      voter_email TEXT NOT NULL,
      choice TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(proposal_id, voter_email)
    )
  `);
  // Optionally link a vote to the stored member record; older rows stay null.
  await pool.query(`ALTER TABLE data_use_votes ADD COLUMN IF NOT EXISTS member_id INTEGER REFERENCES members(id)`);

  // Seed governance proposals — idempotent.
  const proposalCount = await pool.query('SELECT COUNT(*)::int AS cnt FROM data_use_proposals');
  if (proposalCount.rows[0].cnt === 0) {
    const seedProposals = [
      {
        title: 'License Diaspora Spending Patterns to the Urban Institute',
        description: 'Approve a one-time research license of the anonymized Diaspora Spending Patterns aggregate to the Urban Institute. Revenue follows the 70/20/10 cooperative split. No individual records are ever shared.',
        pool_id: 'spending-patterns',
        threshold: 5,
      },
      {
        title: 'Set pooled-aggregate retention to 30 days',
        description: 'Ratify a hard 30-day retention limit on all server-stored pooled aggregates, after which they are automatically and permanently purged.',
        pool_id: null,
        threshold: 5,
      },
    ];
    for (const p of seedProposals) {
      await pool.query(
        `INSERT INTO data_use_proposals (title, description, pool_id, threshold) VALUES ($1,$2,$3,$4)`,
        [p.title, p.description, p.pool_id, p.threshold]
      );
    }
  }

  // Seed founding prelaunch commitments — idempotent, safe to run on every startup
  await pool.query(`
    INSERT INTO prelaunch_commitments (name, email, monthly_pledge, committed_at, status)
    SELECT 'Sean Mayo', 'sean.mayo@ebl.beauty', 20000.00, '2025-06-19', 'committed'
    WHERE NOT EXISTS (SELECT 1 FROM prelaunch_commitments WHERE email = 'sean.mayo@ebl.beauty')
  `);
  await pool.query(`
    INSERT INTO prelaunch_commitments (name, email, monthly_pledge, committed_at, status)
    SELECT 'Evergreen Mayo', 'evergreen.mayo@ebl.beauty', 10000.00, '2025-06-19', 'committed'
    WHERE NOT EXISTS (SELECT 1 FROM prelaunch_commitments WHERE email = 'evergreen.mayo@ebl.beauty')
  `);
  await pool.query(`
    INSERT INTO prelaunch_commitments (name, email, monthly_pledge, committed_at, status)
    SELECT 'Sheila McDaniel', 'sheila.mcdaniel@ebl.beauty', 100000.00, '2025-06-19', 'committed'
    WHERE NOT EXISTS (SELECT 1 FROM prelaunch_commitments WHERE email = 'sheila.mcdaniel@ebl.beauty')
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS uw_documents (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      url TEXT NOT NULL,
      category TEXT DEFAULT 'General',
      visible_to_partners BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS uw_files (
      id SERIAL PRIMARY KEY,
      original_name TEXT NOT NULL,
      mimetype TEXT NOT NULL,
      size INTEGER NOT NULL,
      data TEXT NOT NULL,
      uploaded_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS uw_checklist_items (
      id SERIAL PRIMARY KEY,
      category TEXT NOT NULL,
      label TEXT NOT NULL,
      done BOOLEAN DEFAULT false,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  const checkCount = await pool.query('SELECT COUNT(*) FROM uw_checklist_items');
  if (parseInt(checkCount.rows[0].count) === 0) {
    const seed = [
      { category: '🏛️ Business Entity', label: 'Certificate of Formation / Articles of Organization', done: true, sort: 1 },
      { category: '🏛️ Business Entity', label: 'EIN / Federal Tax ID (SS-4)', done: true, sort: 2 },
      { category: '🏛️ Business Entity', label: 'Business address & registered agent', done: true, sort: 3 },
      { category: '🏛️ Business Entity', label: 'Operating Agreement / Cooperative Bylaws', done: true, sort: 4 },
      { category: '🏛️ Business Entity', label: 'Ownership structure documentation', done: false, sort: 5 },
      { category: '👤 Control Person / Beneficial Owners', label: 'Government-issued ID — Control Person', done: true, sort: 1 },
      { category: '👤 Control Person / Beneficial Owners', label: 'Date of birth & SSN verification', done: true, sort: 2 },
      { category: '👤 Control Person / Beneficial Owners', label: 'Proof of US residency', done: true, sort: 3 },
      { category: '👤 Control Person / Beneficial Owners', label: 'Cooperative member-ownership structure', done: false, sort: 4 },
      { category: '👤 Control Person / Beneficial Owners', label: 'Program Director designation letter', done: false, sort: 5 },
      { category: '📊 Card Program Description', label: 'Card type: Debit card program', done: true, sort: 1 },
      { category: '📊 Card Program Description', label: 'Target market documentation', done: true, sort: 2 },
      { category: '📊 Card Program Description', label: 'Projected monthly transaction volume (prelaunch data)', done: true, sort: 3 },
      { category: '📊 Card Program Description', label: 'Revenue model: 70/20/10 cooperative split', done: true, sort: 4 },
      { category: '📊 Card Program Description', label: 'Pilot merchant agreement — live and processing', done: true, sort: 5 },
      { category: '🛡️ Compliance Documentation', label: 'KYC Policy (ID, SSN, residency, DOB)', done: true, sort: 1 },
      { category: '🛡️ Compliance Documentation', label: 'AML / BSA Policy', done: true, sort: 2 },
      { category: '🛡️ Compliance Documentation', label: 'OFAC screening process', done: true, sort: 3 },
      { category: '🛡️ Compliance Documentation', label: 'Privacy Policy & Data Sovereignty Statement', done: false, sort: 4 },
      { category: '🛡️ Compliance Documentation', label: 'Financial education program (DECIDEY NGO)', done: true, sort: 5 },
      { category: '💰 Financial Documentation', label: 'Prelaunch commitment data — aggregate', done: true, sort: 1 },
      { category: '💰 Financial Documentation', label: 'Annual projected interchange revenue', done: true, sort: 2 },
      { category: '💰 Financial Documentation', label: 'Year 1–3 revenue model (70/20/10)', done: true, sort: 3 },
      { category: '💰 Financial Documentation', label: 'Founding equity deposits documentation', done: false, sort: 4 },
      { category: '💰 Financial Documentation', label: 'MAN audit network transparency records', done: true, sort: 5 },
      { category: '🤝 Integration Readiness', label: 'Merchant processing proof — Pilot #1 live', done: true, sort: 1 },
      { category: '🤝 Integration Readiness', label: 'Web3 / multi-rail infrastructure MOU', done: false, sort: 2 },
      { category: '🤝 Integration Readiness', label: 'Fiat ↔ digital asset bridge agreement', done: false, sort: 3 },
      { category: '🤝 Integration Readiness', label: 'MOLI / IBC underwriting relationship documentation', done: false, sort: 4 },
      { category: '🤝 Integration Readiness', label: 'Member onboarding flow documentation', done: true, sort: 5 },
    ];
    for (const item of seed) {
      await pool.query(
        'INSERT INTO uw_checklist_items (category, label, done, sort_order) VALUES ($1,$2,$3,$4)',
        [item.category, item.label, item.done, item.sort]
      );
    }
  }

  // EBL service prices — admin-editable so Eva can update prices without a code deploy.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ebl_service_prices (
      service_type TEXT PRIMARY KEY,
      default_amount NUMERIC(10,2) NOT NULL,
      label TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  // Seed default prices — idempotent, only inserts service types not already present.
  const eblPriceSeed = [
    { service_type: 'hair',   default_amount: '65.00', label: 'Typical range: $45 – $150+' },
    { service_type: 'nail',   default_amount: '45.00', label: 'Typical range: $35 – $80' },
    { service_type: 'beauty', default_amount: '55.00', label: 'Typical range: $25 – $120' },
    { service_type: 'reign',  default_amount: '25.00', label: 'Monthly subscription: ~$25' },
  ];
  for (const p of eblPriceSeed) {
    await pool.query(
      `INSERT INTO ebl_service_prices (service_type, default_amount, label)
       VALUES ($1, $2, $3)
       ON CONFLICT (service_type) DO NOTHING`,
      [p.service_type, p.default_amount, p.label]
    );
  }

  console.log('Database tables ready');
}

async function initStripe() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL required');
  }

  console.log('Initializing Stripe schema...');
  await runMigrations({ databaseUrl });
  console.log('Stripe schema ready');

  const stripeSync = await getStripeSync();

  console.log('Setting up managed webhook...');
  const webhookBaseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`;
  try {
    const result = await stripeSync.findOrCreateManagedWebhook(
      `${webhookBaseUrl}/api/stripe/webhook`
    );
    if (result?.webhook) {
      console.log(`Webhook configured: ${result.webhook.url}`);
    } else {
      console.log('Webhook setup completed (no URL returned)');
    }
  } catch (webhookError: any) {
    console.log('Webhook setup skipped:', webhookError.message);
  }

  console.log('Syncing Stripe data...');
  stripeSync.syncBackfill()
    .then(() => console.log('Stripe data synced'))
    .catch((err: any) => console.error('Error syncing Stripe data:', err));
}

app.post(
  '/api/stripe/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const signature = req.headers['stripe-signature'];
    if (!signature) {
      return res.status(400).json({ error: 'Missing stripe-signature' });
    }

    try {
      const sig = Array.isArray(signature) ? signature[0] : signature;
      await WebhookHandlers.processWebhook(req.body as Buffer, sig);

      // Parse for First Circle deposit handling
      try {
        const event = JSON.parse((req.body as Buffer).toString('utf8'));
        if (event.type === 'checkout.session.completed') {
          const session = event.data?.object ?? {};
          if (session.metadata?.depositType === 'first_circle_equity') {
            await pool.query(
              `INSERT INTO first_circle_deposits
                (session_id, member_id, member_name, customer_email, amount_total, currency, payment_status, deposit_type, stripe_event_id)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
               ON CONFLICT (session_id) DO UPDATE SET payment_status = EXCLUDED.payment_status`,
              [
                session.id,
                session.metadata?.memberId ?? 'unknown',
                session.metadata?.memberName ?? '',
                session.customer_email,
                session.amount_total,
                session.currency ?? 'usd',
                session.payment_status,
                'first_circle_equity',
                event.id,
              ]
            );
            console.log('[Stripe] ✅ First Circle deposit recorded:', session.id);

            // Send deposit confirmation email (non-blocking)
            if (session.customer_email) {
              sendFirstCircleConfirmation({
                email: session.customer_email,
                name: session.metadata?.memberName || session.customer_email,
                amount: session.amount_total ?? 10000,
                sessionId: session.id,
              }).catch((err: any) => console.error('[Email] First Circle confirmation failed:', err.message));
            }
          }

          // EBL service payment — notify Eva
          if (session.metadata?.paymentType === 'ebl_service') {
            console.log('[Stripe] EBL service payment completed:', session.id);
            sendEBLPaymentNotification({
              amount: session.amount_total ?? 0,
              serviceType: session.metadata?.serviceType ?? '',
              customerName: session.metadata?.customerName ?? '',
              customerPhone: session.metadata?.customerPhone ?? '',
              sessionId: session.id,
            }).catch((err: any) => console.error('[Email] EBL payment notification failed:', err.message));

            // Also send the customer a branded receipt (non-blocking).
            // EBL checkout doesn't pre-fill customer_email, so fall back to the
            // email Stripe collected during checkout (customer_details.email).
            const customerEmail = session.customer_email || session.customer_details?.email;
            if (customerEmail) {
              sendEBLCustomerReceipt({
                email: customerEmail,
                amount: session.amount_total ?? 0,
                serviceType: EBL_SERVICE_LABELS[session.metadata?.serviceType] ?? session.metadata?.serviceType ?? '',
                customerName: session.metadata?.customerName ?? '',
                sessionId: session.id,
              }).catch((err: any) => console.error('[Email] EBL customer receipt failed:', err.message));
            }
          }
        }
      } catch (parseErr: any) {
        console.warn('[Stripe] Webhook parse warning:', parseErr.message);
      }

      res.status(200).json({ received: true });
    } catch (error: any) {
      console.error('Webhook error:', error.message);
      res.status(400).json({ error: 'Webhook processing error' });
    }
  }
);

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'https://solvy.cards,https://www.solvy.cards,https://nitty.ebl.beauty,https://ebl.beauty').split(',').map(o => o.trim());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin) || ALLOWED_ORIGINS.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
}));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  // Rate limits are keyed by IP; under test every request shares one IP, so the
  // limiter would block the suite. Disable it only when running tests.
  skip: () => IS_TEST,
  handler: (req, res) => res.status(429).json({ error: 'Too many requests — please slow down' }),
});
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => IS_TEST,
  handler: (req, res) => res.status(429).json({ error: 'Too many requests — please slow down' }),
});
app.use('/api/', apiLimiter);
app.use('/api/contact', strictLimiter);
app.use('/api/founding-member/apply', strictLimiter);
app.use('/api/prelaunch/commit', strictLimiter);
app.use('/api/banking', strictLimiter);
app.use('/api/tax/export', strictLimiter);

app.use(express.json());

// Member identity verification (email one-time code). Registered before the
// governance/data-pool routes so its session middleware is available to them.
const memberSession = getMemberSession();
registerMemberAuthRoutes(app, strictLimiter, pool);

app.use('/api/lithic', lithicRouter);

app.get('/api/unit/token', requireStaffToken, async (req, res) => {
  try {
    const unitApiToken = process.env.UNIT_API_TOKEN;
    const unitCustomerId = process.env.UNIT_CUSTOMER_ID;

    if (!unitApiToken || !unitCustomerId) {
      return res.status(503).json({ error: 'Unit banking not configured' });
    }

    const response = await fetch(
      `https://api.s.unit.sh/customers/${unitCustomerId}/token`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${unitApiToken}`,
          'Content-Type': 'application/vnd.api+json',
        },
        body: JSON.stringify({
          data: {
            type: 'customerToken',
            attributes: { scope: 'transactions cards accounts payments' },
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Unit token error:', err);
      return res.status(502).json({ error: 'Failed to generate banking token' });
    }

    const data = await response.json() as any;
    const token = data?.data?.attributes?.token;

    if (!token) {
      return res.status(502).json({ error: 'No token in Unit response' });
    }

    res.json({ token });
  } catch (error: any) {
    console.error('Unit token error:', error.message);
    res.status(500).json({ error: 'Banking token generation failed' });
  }
});

app.get('/api/unit/prefill', requireStaffToken, async (req, res) => {
  try {
    const { email, customerId } = req.query as Record<string, string>;

    if (!email && !customerId) {
      return res.status(400).json({ error: 'email or customerId required' });
    }

    let member: any = null;

    if (email) {
      const result = await pool.query(
        'SELECT * FROM founding_members WHERE email = $1',
        [email]
      );
      member = result.rows[0] ?? null;
    } else if (customerId) {
      const result = await pool.query(
        'SELECT * FROM founding_members WHERE stripe_customer_id = $1',
        [customerId]
      );
      member = result.rows[0] ?? null;
    }

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json({
      email: member.email,
      firstName: member.first_name,
      lastName: member.last_name,
      phone: member.phone ?? undefined,
      address: {
        street: member.address_line1 ?? undefined,
        city: member.address_city ?? undefined,
        state: member.address_state ?? undefined,
        postalCode: member.address_zip ?? undefined,
        country: 'US',
      },
    });
  } catch (error: any) {
    console.error('Unit prefill error:', error.message);
    res.status(500).json({ error: 'Member lookup failed' });
  }
});

app.get('/api/unit/users', requireStaffToken, async (req, res) => {
  try {
    const { email, memberId } = req.query as Record<string, string>;

    if (email) {
      const result = await pool.query(
        'SELECT member_number, email, first_name, last_name, status, kyc_verified, created_at FROM founding_members WHERE email = $1',
        [email]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      const m = result.rows[0];
      return res.json({
        memberId: m.member_number,
        email: m.email,
        firstName: m.first_name,
        lastName: m.last_name,
        status: m.status,
        kycVerified: m.kyc_verified,
        memberSince: m.created_at,
      });
    }

    if (memberId) {
      const result = await pool.query(
        'SELECT member_number, email, first_name, last_name, status, kyc_verified, created_at FROM founding_members WHERE member_number = $1',
        [memberId]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      const m = result.rows[0];
      return res.json({
        memberId: m.member_number,
        email: m.email,
        firstName: m.first_name,
        lastName: m.last_name,
        status: m.status,
        kycVerified: m.kyc_verified,
        memberSince: m.created_at,
      });
    }

    const result = await pool.query(
      'SELECT member_number, email, first_name, last_name, status, kyc_verified, created_at FROM founding_members ORDER BY created_at DESC LIMIT 100'
    );
    res.json({
      users: result.rows.map((m: any) => ({
        memberId: m.member_number,
        email: m.email,
        firstName: m.first_name,
        lastName: m.last_name,
        status: m.status,
        kycVerified: m.kyc_verified,
        memberSince: m.created_at,
      })),
    });
  } catch (error: any) {
    console.error('Unit users error:', error.message);
    res.status(500).json({ error: 'User lookup failed' });
  }
});

app.post('/api/prelaunch/commit', async (req, res) => {
  try {
    const { name, email, pledge } = req.body;
    if (!name || !email || !pledge) {
      return res.status(400).json({ error: 'name, email, and pledge are required' });
    }
    const result = await pool.query(
      `INSERT INTO prelaunch_commitments (name, email, monthly_pledge)
       VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING
       RETURNING *`,
      [name.trim(), email.trim().toLowerCase(), parseFloat(pledge)]
    );
    // Send acknowledgement email (non-blocking)
    sendPrelaunchAck({
      email: email.trim().toLowerCase(),
      name: name.trim(),
      pledge: parseFloat(pledge),
    }).catch((err: any) => console.error('[Email] Prelaunch ack failed:', err.message));

    res.json({ success: true, commitment: result.rows[0] ?? null });
  } catch (error: any) {
    console.error('Prelaunch commit error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/prelaunch/commitments', requireStaffToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM prelaunch_commitments ORDER BY created_at DESC'
    );
    res.json({ commitments: result.rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Staff-only gate for underwriting endpoints — NO DEFAULT
const STAFF_CODE = process.env.STAFF_ACCESS_CODE;
if (!STAFF_CODE) {
  console.error('[SECURITY] STAFF_ACCESS_CODE not set. Staff endpoints will be inaccessible.');
}

// EBL merchant gate — lets Evergreen Beauty Lounge view their OWN transaction
// history. Deliberately separate from STAFF_CODE so the merchant view never
// exposes cooperative/platform splits or other staff-only data.
const EBL_CODE = process.env.EBL_ACCESS_CODE;
if (!EBL_CODE) {
  console.error('[SECURITY] EBL_ACCESS_CODE not set. EBL merchant view will be inaccessible.');
}

// Partner review tokens — 4 slots, no company names stored here
const UW_TOKENS: Record<string, string> = {
  A: process.env.UW_TOKEN_A || '',
  B: process.env.UW_TOKEN_B || '',
  C: process.env.UW_TOKEN_C || '',
  D: process.env.UW_TOKEN_D || '',
};

function resolvePartnerSlot(token: string): string | null {
  if (!token) return null;
  for (const [slot, val] of Object.entries(UW_TOKENS)) {
    if (val && val === token) return slot;
  }
  if (STAFF_CODE && token === STAFF_CODE) return 'ADMIN';
  return null;
}

app.post('/api/uwreview/verify', (req, res) => {
  const { token } = req.body;
  const slot = resolvePartnerSlot(token);
  if (slot) {
    res.json({ authorized: true, slot });
  } else {
    res.status(403).json({ authorized: false });
  }
});

// Document management — staff write, partner read
app.get('/api/uw/documents', async (req, res) => {
  const staffToken = req.headers['x-staff-token'] as string;
  const reviewToken = req.headers['x-review-token'] as string;
  const isStaff = staffToken === STAFF_CODE;
  const isPartner = !!resolvePartnerSlot(reviewToken);
  if (!isStaff && !isPartner) return res.status(403).json({ error: 'Unauthorized' });
  try {
    const filter = isStaff ? '' : 'WHERE visible_to_partners = true';
    const result = await pool.query(`SELECT * FROM uw_documents ${filter} ORDER BY category, created_at DESC`);
    res.json({ documents: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/uw/documents', requireStaffToken, async (req, res) => {
  const { title, description, url, category, visible_to_partners } = req.body;
  if (!title || !url) return res.status(400).json({ error: 'Title and URL are required.' });
  try {
    const result = await pool.query(
      `INSERT INTO uw_documents (title, description, url, category, visible_to_partners) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [title.trim(), description?.trim() || '', url.trim(), category || 'General', visible_to_partners !== false]
    );
    res.json({ document: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/uw/documents/:id', requireStaffToken, async (req, res) => {
  const { id } = req.params;
  const { title, description, url, category, visible_to_partners } = req.body;
  try {
    const result = await pool.query(
      `UPDATE uw_documents SET title=COALESCE($1,title), description=COALESCE($2,description), url=COALESCE($3,url), category=COALESCE($4,category), visible_to_partners=COALESCE($5,visible_to_partners) WHERE id=$6 RETURNING *`,
      [title, description, url, category, visible_to_partners, id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ document: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/uw/documents/:id', requireStaffToken, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM uw_documents WHERE id=$1', [id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// File upload — store as base64 in DB for deployment persistence
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

app.post('/api/uw/upload', requireStaffToken, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided' });
  try {
    const b64 = req.file.buffer.toString('base64');
    const result = await pool.query(
      'INSERT INTO uw_files (original_name, mimetype, size, data) VALUES ($1,$2,$3,$4) RETURNING id, original_name, mimetype, size, uploaded_at',
      [req.file.originalname, req.file.mimetype, req.file.size, b64]
    );
    const fileId = result.rows[0].id;
    res.json({ file: result.rows[0], url: `/api/uw/files/${fileId}` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/uw/files/:id', async (req, res) => {
  const staffToken = req.headers['x-staff-token'] as string;
  const reviewToken = req.headers['x-review-token'] as string;
  const isStaff = staffToken === STAFF_CODE;
  const isPartner = !!resolvePartnerSlot(reviewToken);
  if (!isStaff && !isPartner) return res.status(403).json({ error: 'Unauthorized' });
  try {
    const result = await pool.query('SELECT original_name, mimetype, data FROM uw_files WHERE id=$1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'File not found' });
    const { original_name, mimetype, data } = result.rows[0];
    const buf = Buffer.from(data, 'base64');
    res.set('Content-Type', mimetype);
    res.set('Content-Disposition', `inline; filename="${original_name}"`);
    res.send(buf);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Checklist endpoints
app.get('/api/uw/checklist', async (req, res) => {
  const staffToken = req.headers['x-staff-token'] as string;
  const reviewToken = req.headers['x-review-token'] as string;
  const isStaff = staffToken === STAFF_CODE;
  const isPartner = !!resolvePartnerSlot(reviewToken);
  if (!isStaff && !isPartner) return res.status(403).json({ error: 'Unauthorized' });
  try {
    const result = await pool.query('SELECT * FROM uw_checklist_items ORDER BY category, sort_order');
    res.json({ items: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/uw/checklist/:id', requireStaffToken, async (req, res) => {
  const { done } = req.body;
  try {
    const result = await pool.query(
      'UPDATE uw_checklist_items SET done=$1 WHERE id=$2 RETURNING *',
      [done, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ item: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/uwreview/checklist', async (req, res) => {
  const token = req.headers['x-review-token'] as string;
  if (!token || !resolvePartnerSlot(token)) return res.status(403).json({ error: 'Unauthorized' });
  try {
    const result = await pool.query('SELECT * FROM uw_checklist_items ORDER BY category, sort_order');
    res.json({ items: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/uwreview/summary', async (req, res) => {
  const token = req.headers['x-review-token'] as string;
  if (!token || !resolvePartnerSlot(token)) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  try {
    const [prelaunch, members, kycVerified] = await Promise.all([
      pool.query(`SELECT COUNT(*) AS total, COALESCE(SUM(monthly_pledge::numeric),0) AS total_volume, COALESCE(AVG(monthly_pledge::numeric),0) AS avg_pledge FROM prelaunch_commitments`),
      pool.query(`SELECT COUNT(*) AS total FROM prelaunch_commitments WHERE status = 'active'`),
      pool.query(`SELECT COUNT(*) AS total FROM prelaunch_commitments WHERE status = 'kyc_verified'`),
    ]);
    const totalVolume = parseFloat(prelaunch.rows[0].total_volume) || 0;
    res.json({
      totalCommitments: parseInt(prelaunch.rows[0].total) || 0,
      totalPledgedVolume: totalVolume,
      avgPledge: parseFloat(prelaunch.rows[0].avg_pledge) || 0,
      annualLow: totalVolume * 12 * 0.005,
      annualHigh: totalVolume * 12 * 0.010,
      interchangeRate: '0.5%–1.0%',
      kycVerified: parseInt(kycVerified.rows[0].total) || 0,
      activeMembers: parseInt(members.rows[0].total) || 0,
      pilotMerchantsLive: 1,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

function requireStaffToken(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.headers['x-staff-token'];
  if (!STAFF_CODE || !token || token !== STAFF_CODE) {
    return res.status(403).json({ error: 'Staff access required. This page is for internal use only.' });
  }
  next();
}

app.post('/api/underwriting/verify', (req, res) => {
  const { code } = req.body;
  if (code && code === STAFF_CODE) {
    res.json({ authorized: true });
  } else {
    res.status(403).json({ authorized: false, error: 'Invalid access code.' });
  }
});

app.get('/api/underwriting/summary', requireStaffToken, async (req, res) => {
  try {
    const [prelaunch, members, activeMembers, kycVerified] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*)::int            AS total_commitments,
          COALESCE(SUM(monthly_pledge), 0)::float  AS total_monthly_pledge,
          COALESCE(AVG(monthly_pledge), 0)::float  AS avg_monthly_pledge
        FROM prelaunch_commitments
      `),
      pool.query(`SELECT COUNT(*)::int AS total FROM founding_members`),
      pool.query(`SELECT COUNT(*)::int AS total FROM founding_members WHERE status = 'active'`),
      pool.query(`SELECT COUNT(*)::int AS total FROM founding_members WHERE kyc_verified = true`),
    ]);

    const totalPledged = prelaunch.rows[0].total_monthly_pledge;
    const interchangeLow = totalPledged * 0.005;
    const interchangeHigh = totalPledged * 0.01;

    res.json({
      prelaunch: {
        totalCommitments: prelaunch.rows[0].total_commitments,
        totalPledgedVolume: totalPledged,
        avgPledgeAmount: prelaunch.rows[0].avg_monthly_pledge,
      },
      members: {
        total: members.rows[0].total,
        active: activeMembers.rows[0].total,
        kycVerified: kycVerified.rows[0].total,
      },
      interchange: {
        annualLow: interchangeLow,
        annualHigh: interchangeHigh,
        rate: '0.5% – 1.0%',
      },
      cooperative: {
        memberShare: '70%',
        operationsShare: '20%',
        sovereignFund: '10%',
      },
      pilotPartners: [
        { name: 'Evergreen Beauty Lounge', status: 'Live', processor: 'Stripe', number: 1 },
        { name: 'SPS Joint Venture', status: 'Active', processor: 'SOLVY', number: 2 },
      ],
    });
  } catch (error: any) {
    console.error('Underwriting summary error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/unit/banking', (req, res) => {
  const baseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`;
  res.redirect(`${baseUrl}/banking`);
});

app.get('/api/unit/reactivation', (req, res) => {
  const baseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`;
  res.redirect(`${baseUrl}/banking?reactivation=true`);
});

app.get('/api/stripe/publishable-key', async (req, res) => {
  try {
    const key = await getStripePublishableKey();
    res.json({ publishableKey: key });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.id, p.name, p.description, p.metadata, p.active,
             pr.id as price_id, pr.unit_amount, pr.currency, pr.recurring
      FROM stripe.products p
      LEFT JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true
      WHERE p.active = true
    `);
    res.json({ products: result.rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/founding-member/apply', async (req, res) => {
  try {
    const { email, firstName, lastName, phone, addressLine1, addressCity, addressState, addressZip } = req.body;

    if (!email || !firstName || !lastName) {
      return res.status(400).json({ error: 'Email, first name, and last name are required' });
    }

    // Input validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || email.length > 254) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    if (firstName.length > 100 || lastName.length > 100) {
      return res.status(400).json({ error: 'Name too long' });
    }
    if (phone && !/^[\d\s\-\+\(\)]+$/.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }
    if (addressZip && !/^\d{5}(-\d{4})?$/.test(addressZip)) {
      return res.status(400).json({ error: 'Invalid ZIP code' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();

    const existing = await pool.query('SELECT id FROM founding_members WHERE email = $1', [cleanEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Member with this email already exists' });
    }

    const stripe = await getUncachableStripeClient();
    const customer = await stripe.customers.create({
      email: cleanEmail,
      name: `${cleanFirstName} ${cleanLastName}`,
      phone: phone?.trim(),
      address: {
        line1: addressLine1?.trim(),
        city: addressCity?.trim(),
        state: addressState?.trim(),
        postal_code: addressZip?.trim(),
        country: 'US',
      },
      metadata: {
        founding_member: 'true',
        application_date: new Date().toISOString(),
      }
    });

    const memberCount = await pool.query('SELECT COUNT(*) FROM founding_members');
    const memberNumber = `FM-${String(parseInt(memberCount.rows[0].count) + 1).padStart(4, '0')}`;

    const result = await pool.query(`
      INSERT INTO founding_members (email, first_name, last_name, phone, address_line1, address_city, address_state, address_zip, stripe_customer_id, member_number, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending_payment')
      RETURNING *
    `, [cleanEmail, cleanFirstName, cleanLastName, phone, addressLine1, addressCity, addressState, addressZip, customer.id, memberNumber]);

    // Send welcome email (non-blocking)
    sendMemberWelcome({
      email: cleanEmail,
      firstName: cleanFirstName,
      memberNumber,
    }).catch((err: any) => console.error('[Email] Welcome email failed:', err.message));

    res.json({ 
      success: true, 
      member: result.rows[0],
      customerId: customer.id
    });
  } catch (error: any) {
    console.error('Application error:', error);
    res.status(500).json({ error: 'Application failed' });
  }
});

app.post('/api/founding-member/checkout', async (req, res) => {
  try {
    const { customerId, priceId } = req.body;

    if (!customerId || !priceId) {
      return res.status(400).json({ error: 'Customer ID and Price ID are required' });
    }

    const stripe = await getUncachableStripeClient();
    const baseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${baseUrl}/member-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/apply`,
      metadata: {
        founding_member: 'true',
      }
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (error: any) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/founding-member/verify/:sessionId', async (req, res) => {
  try {
    const stripe = await getUncachableStripeClient();
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    
    if (session.payment_status === 'paid' && session.customer) {
      await pool.query(
        `UPDATE founding_members 
         SET status = 'active', 
             stripe_subscription_id = $1,
             updated_at = NOW()
         WHERE stripe_customer_id = $2`,
        [session.subscription, session.customer]
      );
      
      const result = await pool.query(
        'SELECT member_number, first_name, last_name FROM founding_members WHERE stripe_customer_id = $1',
        [session.customer]
      );
      
      res.json({ 
        success: true, 
        member: result.rows[0],
        status: 'active'
      });
    } else {
      res.json({ success: false, status: session.payment_status });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── First Circle Deposits listing ──────────────────────────────────────────

app.get('/api/stripe/deposits', requireStaffToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, session_id, member_id, member_name, customer_email,
              amount_total, currency, payment_status, deposit_type, created_at
         FROM first_circle_deposits
        ORDER BY created_at DESC`
    );
    res.json({ success: true, count: result.rowCount, deposits: result.rows });
  } catch (error: any) {
    console.error('Deposits error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to retrieve deposits' });
  }
});

// ─── First Circle Equity Deposit — $100 one-time payment ───────────────────

const FIRST_CIRCLE_AMOUNT = 10000; // $100.00 in cents

app.post('/api/stripe/create-checkout-session', async (req, res) => {
  try {
    const { email, name, memberId, successUrl, cancelUrl } = req.body as Record<string, string>;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const stripe = await getUncachableStripeClient();
    const baseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0] ?? 'solvy.cards'}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'SOLVY First Circle Membership',
              description: '$100 equity deposit — member-owned cooperative',
            },
            unit_amount: FIRST_CIRCLE_AMOUNT,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: email,
      metadata: {
        memberId: memberId ?? 'unknown',
        memberName: name ?? '',
        depositType: 'first_circle_equity',
        source: 'solvy_onboarding',
      },
      success_url: successUrl ?? `${baseUrl}/member-success?session_id={CHECKOUT_SESSION_ID}&deposit=true`,
      cancel_url: cancelUrl ?? `${baseUrl}/apply`,
    });

    res.json({ success: true, sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('[Stripe] First Circle checkout error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── EBL Service Payment (Stripe card now; Lithic SOLVY debit cards later) ───

const EBL_SERVICE_LABELS: Record<string, string> = {
  hair: 'EBL Hair Services',
  nail: 'EBL Nail Services',
  beauty: 'EBL Beauty Services',
  reign: 'Reign by EBL',
};

// ─── EBL Service Prices ──────────────────────────────────────────────────────
// Prices live in the database so Eva can update them from the merchant dashboard
// without a code deploy. GET is public (the payment form reads it on load);
// updates require the EBL merchant access code (x-ebl-token).

app.get('/api/ebl/prices', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT service_type, default_amount, label FROM ebl_service_prices'
    );
    const prices: Record<string, { default: string; label: string }> = {};
    for (const row of result.rows) {
      prices[row.service_type] = {
        default: Number(row.default_amount).toFixed(2),
        label: row.label ?? '',
      };
    }
    res.json({ prices });
  } catch (error: any) {
    console.error('[EBL] prices fetch error:', error);
    res.status(500).json({ error: 'Could not load prices.' });
  }
});

app.put('/api/ebl/prices', async (req, res) => {
  const eblToken = req.headers['x-ebl-token'] as string | undefined;
  const isEbl = !!EBL_CODE && eblToken === EBL_CODE;
  if (!isEbl) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { prices } = req.body ?? {};
  if (!prices || typeof prices !== 'object') {
    return res.status(400).json({ error: 'Expected a prices object.' });
  }

  const sanitizeLabel = (value: unknown) =>
    String(value ?? '')
      .replace(/[<>]/g, '')
      .replace(/[\u0000-\u001f\u007f]/g, '')
      .trim()
      .slice(0, 120);

  try {
    for (const [serviceType, value] of Object.entries(prices as Record<string, any>)) {
      if (!EBL_SERVICE_LABELS[serviceType]) {
        return res.status(400).json({ error: `Unknown service type: ${serviceType}` });
      }
      const numericAmount = Number(value?.default);
      if (!Number.isFinite(numericAmount) || numericAmount < 0.5) {
        return res.status(400).json({
          error: `Price for ${serviceType} must be at least $0.50.`,
        });
      }
      await pool.query(
        `INSERT INTO ebl_service_prices (service_type, default_amount, label, updated_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (service_type)
         DO UPDATE SET default_amount = EXCLUDED.default_amount,
                       label = EXCLUDED.label,
                       updated_at = NOW()`,
        [serviceType, numericAmount.toFixed(2), sanitizeLabel(value?.label)]
      );
    }

    const result = await pool.query(
      'SELECT service_type, default_amount, label FROM ebl_service_prices'
    );
    const updated: Record<string, { default: string; label: string }> = {};
    for (const row of result.rows) {
      updated[row.service_type] = {
        default: Number(row.default_amount).toFixed(2),
        label: row.label ?? '',
      };
    }
    res.json({ success: true, prices: updated });
  } catch (error: any) {
    console.error('[EBL] prices update error:', error);
    res.status(500).json({ error: 'Could not update prices.' });
  }
});

app.post('/api/ebl/checkout', async (req, res) => {
  try {
    const { serviceType, amount, customerName, customerPhone } = req.body as Record<string, string>;

    const numericAmount = Number(amount);
    if (!serviceType || !EBL_SERVICE_LABELS[serviceType]) {
      return res.status(400).json({ success: false, error: 'Please select a valid service.' });
    }
    if (!Number.isFinite(numericAmount) || numericAmount < 0.5) {
      return res.status(400).json({ success: false, error: 'Amount must be at least $0.50.' });
    }

    // Sanitize free-text fields: strip control/markup chars and cap length before
    // they enter Stripe metadata (and downstream notification emails).
    const sanitizeText = (value: unknown, maxLen: number) =>
      String(value ?? '')
        .replace(/[<>]/g, '')
        .replace(/[\u0000-\u001f\u007f]/g, '')
        .trim()
        .slice(0, maxLen);
    const safeCustomerName = sanitizeText(customerName, 120);
    const safeCustomerPhone = sanitizeText(customerPhone, 40);

    const unitAmount = Math.round(numericAmount * 100);
    const stripe = await getUncachableStripeClient();
    const baseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0] ?? 'solvy.cards'}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: EBL_SERVICE_LABELS[serviceType],
              description: 'Evergreen Beauty Lounge — Licensed Texas Cosmetology Services',
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: {
        paymentType: 'ebl_service',
        serviceType,
        customerName: safeCustomerName,
        customerPhone: safeCustomerPhone,
        source: 'ebl_page',
      },
      success_url: `${baseUrl}/ebl?payment=success&session_id={CHECKOUT_SESSION_ID}#pay`,
      cancel_url: `${baseUrl}/ebl?payment=cancelled#pay`,
    });

    res.json({ success: true, sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('[Stripe] EBL checkout error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── EBL Transactions ───────────────────────────────────────────────────────
// Single source of truth for EBL payment history, pulled live from Stripe.
// Staff (x-staff-token) get the full interchange split for underwriting.
// The EBL merchant (x-ebl-token) gets a privacy-trimmed view of their OWN
// history: date, service, amount and only their 20% interchange share — never
// the cooperative (70%) or platform (10%) splits or customer emails.

const EBL_INTERCHANGE_RATE = 0.008; // 0.8% of transaction value
const EBL_SHARE = 0.20;             // EBL merchant's portion of interchange
const COOP_SHARE = 0.70;            // cooperative membership portion
const PLATFORM_SHARE = 0.10;        // platform/sovereign-fund portion

// Verify an EBL merchant access code (mirrors /api/underwriting/verify).
app.post('/api/ebl/verify', (req, res) => {
  const { code } = req.body ?? {};
  if (EBL_CODE && code === EBL_CODE) {
    res.json({ authorized: true });
  } else {
    res.status(403).json({ authorized: false, error: 'Invalid access code.' });
  }
});

app.get('/api/ebl/transactions', async (req, res) => {
  const staffToken = req.headers['x-staff-token'] as string | undefined;
  const eblToken = req.headers['x-ebl-token'] as string | undefined;
  const isStaff = !!STAFF_CODE && staffToken === STAFF_CODE;
  const isEbl = !!EBL_CODE && eblToken === EBL_CODE;
  if (!isStaff && !isEbl) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const stripe = await getUncachableStripeClient();

    // Walk the FULL Stripe session history via auto-pagination — not just the
    // first page. The accumulated cooperative membership total is a running
    // balance over all time, so it must not be truncated to the latest 100
    // sessions or it would silently undercount as volume grows.
    type EblSession = Awaited<ReturnType<typeof stripe.checkout.sessions.retrieve>>;
    const eblSessions: EblSession[] = [];
    // Eva's accruing share of the pooled cooperative (70%) membership funds.
    // In the cooperative model the 70% coop portion of interchange is pooled and
    // distributed back to members later based on their membership. We surface the
    // coop portion generated by Eva's OWN activity as a single running total
    // ("pending distribution") — never a per-transaction split, never the 10%
    // platform portion, and never another member's data. This total is computed
    // over Eva's ENTIRE history (full pagination) so it keeps accruing correctly
    // even past the first 100 sessions.
    let accumulatedPatronage = 0; // cents
    for await (const s of stripe.checkout.sessions.list({ limit: 100 })) {
      if (s.metadata?.paymentType !== 'ebl_service' || s.payment_status !== 'paid') {
        continue;
      }
      eblSessions.push(s);
      accumulatedPatronage += (s.amount_total ?? 0) * EBL_INTERCHANGE_RATE * COOP_SHARE;
    }

    // The transaction table is capped to the most recent sessions for display;
    // the accumulated membership total above is intentionally decoupled from this
    // cap and reflects full history.
    const MAX_DISPLAYED = 100;
    const displaySessions = eblSessions
      .slice()
      .sort((a, b) => (b.created ?? 0) - (a.created ?? 0))
      .slice(0, MAX_DISPLAYED);

    const transactions = displaySessions.map((s) => {
      const amount = s.amount_total ?? 0; // cents
      const serviceType = s.metadata?.serviceType ?? '';
      const interchangeTotal = amount * EBL_INTERCHANGE_RATE;
      const interchangeEbl = interchangeTotal * EBL_SHARE;
      const base = {
        id: s.id,
        session_id: s.id,
        service_type: EBL_SERVICE_LABELS[serviceType] ?? serviceType ?? 'EBL Service',
        amount_total: amount,
        currency: s.currency ?? 'usd',
        payment_status: s.payment_status,
        payment_type: 'card',
        interchange_ebl: interchangeEbl,
        created_at: new Date((s.created ?? 0) * 1000).toISOString(),
      };
      if (isStaff) {
        // Full split — underwriting only.
        return {
          ...base,
          customer_name: s.metadata?.customerName ?? '',
          customer_email: s.customer_email ?? '',
          interchange_cooperative: interchangeTotal * COOP_SHARE,
          interchange_platform: interchangeTotal * PLATFORM_SHARE,
        };
      }
      // Merchant view — no coop/platform splits, no customer email.
      return {
        ...base,
        customer_name: s.metadata?.customerName ?? '',
      };
    });

    transactions.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const format = (req.query.format as string | undefined) ?? 'json';
    if (format === 'csv') {
      // Merchant-safe export: date, customer, service, amount, EBL 20% share.
      // Never the cooperative (70%) or platform (10%) splits or internal data.
      const headers = ['Date', 'Customer', 'Service', 'Amount (USD)', 'Your Share 20% (USD)'];
      const escapeCsv = (val: string | number) => {
        const str = String(val ?? '');
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };
      const rows = transactions.map((t) =>
        [
          new Date(t.created_at).toISOString().split('T')[0],
          t.customer_name ?? '',
          t.service_type ?? '',
          ((t.amount_total ?? 0) / 100).toFixed(2),
          ((t.interchange_ebl ?? 0) / 100).toFixed(2),
        ]
          .map(escapeCsv)
          .join(',')
      );
      const totalAmount = transactions.reduce((sum, t) => sum + (t.amount_total ?? 0), 0);
      const totalShare = transactions.reduce((sum, t) => sum + (t.interchange_ebl ?? 0), 0);
      const totalRow = [
        'TOTAL',
        `${transactions.length} payments`,
        '',
        (totalAmount / 100).toFixed(2),
        (totalShare / 100).toFixed(2),
      ]
        .map(escapeCsv)
        .join(',');
      const csv = [headers.join(','), ...rows, totalRow].join('\n');

      const today = new Date().toISOString().split('T')[0];
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="ebl-payment-history-${today}.csv"`);
      return res.send(csv);
    }

    const payload: Record<string, unknown> = { transactions, count: transactions.length };
    // Merchant view gets the running cooperative membership total awaiting
    // distribution. Staff already see the full per-transaction split.
    if (isEbl && !isStaff) {
      payload.accumulated_patronage = accumulatedPatronage;
    }

    res.json(payload);
  } catch (err: any) {
    console.error('[EBL] Transactions fetch failed:', err.message);
    res.status(500).json({ error: 'Failed to load EBL transactions' });
  }
});

app.get('/api/stripe/session-status', async (req, res) => {
  try {
    const { sessionId } = req.query as Record<string, string>;
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    const stripe = await getUncachableStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    res.json({
      success: true,
      status: session.payment_status,
      customerEmail: session.customer_email,
      amountTotal: session.amount_total,
      metadata: session.metadata,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── First Circle Stripe Payment Link ───────────────────────────────────────

app.get('/api/stripe/first-circle-link', async (req, res) => {
  try {
    // Return cached link if available
    const cached = await pool.query(
      `SELECT url FROM payment_links WHERE purpose = 'first_circle'`
    );
    if (cached.rows.length > 0) {
      return res.json({ success: true, url: cached.rows[0].url, cached: true });
    }

    const stripe = await getUncachableStripeClient();
    const baseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0] ?? 'solvy.cards'}`;

    // Find or create the First Circle product + price
    let priceId: string | undefined;

    const existingProducts = await stripe.products.search({
      query: "metadata['type']:'first_circle_equity' AND active:'true'",
    });

    if (existingProducts.data.length > 0) {
      const prod = existingProducts.data[0];
      const prices = await stripe.prices.list({ product: prod.id, active: true });
      const match = prices.data.find((p) => p.unit_amount === 10000 && !p.recurring);
      if (match) priceId = match.id;
    }

    if (!priceId) {
      const product = await stripe.products.create({
        name: 'SOLVY First Circle Membership',
        description: '$100 equity deposit — founding member of SOLVY Ecosystem™ cooperative',
        metadata: { type: 'first_circle_equity', source: 'solvy_onboarding' },
      });
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: 10000,
        currency: 'usd',
      });
      priceId = price.id;
    }

    // Create the Payment Link
    const link = await stripe.paymentLinks.create({
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { depositType: 'first_circle_equity', source: 'solvy_payment_link' },
      after_completion: {
        type: 'redirect',
        redirect: { url: `${baseUrl}/first-circle-deposit?success=true&session_id={CHECKOUT_SESSION_ID}` },
      },
      custom_fields: [
        { key: 'membername', label: { type: 'custom', custom: 'Full Name' }, type: 'text' },
      ],
      collect_phone_number: 'never',
    });

    // Cache it
    await pool.query(
      `INSERT INTO payment_links (purpose, url, stripe_id)
       VALUES ('first_circle', $1, $2)
       ON CONFLICT (purpose) DO UPDATE SET url = EXCLUDED.url, stripe_id = EXCLUDED.stripe_id`,
      [link.url, link.id]
    );

    res.json({ success: true, url: link.url, linkId: link.id });
  } catch (error: any) {
    console.error('[Stripe] Payment link error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/stripe/first-circle-link', async (req, res) => {
  try {
    await pool.query(`DELETE FROM payment_links WHERE purpose = 'first_circle'`);
    res.json({ success: true, message: 'Payment link cache cleared. Next request will regenerate.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── Data Marketplace ────────────────────────────────────────────────────────

const DATA_POOLS = [
  {
    id: 'spending-patterns',
    name: 'Diaspora Spending Patterns',
    category: 'Consumer Behavior',
    description: 'Anonymized aggregate of member spending categories, frequency, and regional patterns. Used by researchers, consumer brands, and policy makers.',
  },
  {
    id: 'remittance-behavior',
    name: 'Remittance Behavior Data',
    category: 'International Finance',
    description: 'How cooperative members use global remittance: destination countries, frequency, and amounts — fully anonymized and aggregated.',
  },
  {
    id: 'financial-access',
    name: 'Financial Access Gaps',
    category: 'Financial Inclusion',
    description: 'Patterns in underbanked service needs, credit history gaps, and financial barrier experiences across the cooperative.',
  },
  {
    id: 'community-commerce',
    name: 'Community Commerce Trends',
    category: 'Community Economics',
    description: 'Local business spend, cooperative commerce patterns, and economic activity in underserved communities.',
  },
];

app.get('/api/data-pools', async (req, res) => {
  try {
    const counts = await pool.query(
      `SELECT pool_id, COUNT(*)::int AS optin_count FROM data_pool_optins GROUP BY pool_id`
    );
    const countMap: Record<string, number> = {};
    for (const row of counts.rows) countMap[row.pool_id] = row.optin_count;
    const pools = DATA_POOLS.map((p) => ({ ...p, optinCount: countMap[p.id] ?? 0 }));
    res.json({ pools });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/data-pools/my-optins', strictLimiter, memberSession, requireVerifiedMember, async (req, res) => {
  try {
    // Identity comes from the verified session, never a client-supplied email.
    const email = req.session.verifiedEmail!;
    const result = await pool.query(
      `SELECT pool_id FROM data_pool_optins WHERE member_email = $1`,
      [email]
    );
    res.json({ optins: result.rows.map((r: any) => r.pool_id) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/data-pools/optin', memberSession, requireVerifiedMember, async (req, res) => {
  try {
    const { poolId } = req.body;
    const email = req.session.verifiedEmail!;
    if (!poolId) return res.status(400).json({ error: 'poolId is required' });
    const valid = DATA_POOLS.find((p) => p.id === poolId);
    if (!valid) return res.status(404).json({ error: 'Unknown pool' });
    const memberId = req.session.memberId ?? null;
    await pool.query(
      `INSERT INTO data_pool_optins (member_email, pool_id, member_id)
       VALUES ($1, $2, COALESCE($3, (SELECT id FROM members WHERE email = $1)))
       ON CONFLICT DO NOTHING`,
      [email, poolId, memberId]
    );
    res.json({ success: true, poolId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/data-pools/optin', memberSession, requireVerifiedMember, async (req, res) => {
  try {
    const { poolId } = req.body;
    const email = req.session.verifiedEmail!;
    if (!poolId) return res.status(400).json({ error: 'poolId is required' });
    await pool.query(
      `DELETE FROM data_pool_optins WHERE member_email = $1 AND pool_id = $2`,
      [email, poolId]
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/data-pools/revenue', async (req, res) => {
  try {
    const [totals, byPool, recent] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*)::int AS total_sales,
          COALESCE(SUM(gross_amount), 0)::float AS total_gross,
          COALESCE(SUM(gross_amount * 0.70), 0)::float AS member_pool,
          COALESCE(SUM(gross_amount * 0.20), 0)::float AS operations,
          COALESCE(SUM(gross_amount * 0.10), 0)::float AS sovereign_fund
        FROM data_pool_sales
      `),
      pool.query(`
        SELECT pool_id, pool_name,
               COUNT(*)::int AS sale_count,
               COALESCE(SUM(gross_amount), 0)::float AS total_gross
        FROM data_pool_sales GROUP BY pool_id, pool_name ORDER BY total_gross DESC
      `),
      pool.query(`
        SELECT id, pool_name, buyer, gross_amount::float, contributing_members,
               sale_date, notes, created_at
        FROM data_pool_sales ORDER BY created_at DESC LIMIT 10
      `),
    ]);
    res.json({
      totals: totals.rows[0],
      byPool: byPool.rows,
      recentSales: recent.rows,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/data-pools/sale', async (req, res) => {
  try {
    const { poolId, buyer, grossAmount, contributingMembers, saleDate, notes } = req.body;
    if (!poolId || !buyer || !grossAmount) {
      return res.status(400).json({ error: 'poolId, buyer, and grossAmount are required' });
    }
    const poolDef = DATA_POOLS.find((p) => p.id === poolId);
    if (!poolDef) return res.status(404).json({ error: 'Unknown pool' });
    const optinCount = await pool.query(
      `SELECT COUNT(*)::int AS cnt FROM data_pool_optins WHERE pool_id = $1`,
      [poolId]
    );
    const members = contributingMembers ?? optinCount.rows[0].cnt ?? 0;
    const result = await pool.query(
      `INSERT INTO data_pool_sales (pool_id, pool_name, buyer, gross_amount, contributing_members, sale_date, notes)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6::date, CURRENT_DATE), $7)
       RETURNING *`,
      [poolId, poolDef.name, buyer, parseFloat(grossAmount), members, saleDate ?? null, notes ?? null]
    );
    res.json({ success: true, sale: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/data-pools/export/:poolId', async (req, res) => {
  try {
    const { poolId } = req.params;
    const poolDef = DATA_POOLS.find((p) => p.id === poolId);
    if (!poolDef) return res.status(404).json({ error: 'Unknown pool' });

    const optinResult = await pool.query(
      `SELECT COUNT(*)::int AS member_count FROM data_pool_optins WHERE pool_id = $1`,
      [poolId]
    );
    const memberCount = optinResult.rows[0].member_count;

    const dataset = {
      pool: poolDef,
      exportedAt: new Date().toISOString(),
      memberCount,
      privacyNote: 'All data is anonymized and aggregated. No individual member data is included.',
      governanceNote: 'This dataset was approved by member vote via the MAN (Mandatory Audit Network).',
      aggregateSummary: {
        contributingMembers: memberCount,
        dataPoints: memberCount * 12,
        geographicScope: 'United States (state-level only)',
        timePeriod: 'Rolling 12 months',
        granularity: 'Aggregate only — no individual records',
      },
      revenueTerms: {
        memberPoolShare: '70%',
        operationsShare: '20%',
        sovereignFundShare: '10%',
        distributionSchedule: 'Quarterly',
      },
    };

    res.setHeader('Content-Disposition', `attachment; filename="${poolId}-dataset.json"`);
    res.setHeader('Content-Type', 'application/json');
    res.json(dataset);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── EPIC-001: Local-First Data — contribution boundary ──────────────────────
// Field names that must NEVER appear in a contributed payload. The contribution
// boundary rejects any payload containing these (deeply), enforcing that raw
// per-member data stays on the device.
const FORBIDDEN_AGG_KEYS = new Set([
  'email', 'name', 'firstname', 'lastname', 'fullname', 'phone', 'address',
  'ssn', 'dob', 'birthdate', 'account', 'accountnumber', 'cardnumber', 'card',
  'iban', 'routing', 'merchant', 'description', 'memo', 'note', 'notes',
  'transactions', 'transaction', 'rows', 'row', 'raw', 'records', 'record',
  'items', 'date', 'timestamp', 'memberemail', 'member', 'userid', 'user',
]);

const RETENTION_DAYS = 30;
let nextPurgeAt: Date | null = null;
let lastPurgedCount = 0;

async function purgeStaleAggregates() {
  try {
    const result = await pool.query(
      `DELETE FROM data_pool_aggregates
       WHERE contributed_at < NOW() - INTERVAL '${RETENTION_DAYS} days'`
    );
    lastPurgedCount = result.rowCount ?? 0;
    if (lastPurgedCount > 0) {
      console.log(`[purge] Removed ${lastPurgedCount} pooled aggregate(s) older than ${RETENTION_DAYS} days`);
    }
  } catch (err: any) {
    console.error('[purge] Failed to purge stale aggregates:', err.message);
  }
  nextPurgeAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
}

// Mask an email for member-facing display (e.g. "x***y@domain"). Returns null
// for empty/missing values so callers can substitute their own placeholder.
function maskEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  const [user, domain] = String(email).split('@');
  if (!user) return null;
  const maskedUser = user.length <= 2 ? user[0] + '*' : user[0] + '***' + user[user.length - 1];
  return `${maskedUser}@${domain ?? '—'}`;
}

// Value-level PII patterns: an aggregate is counts/totals only — any string that
// looks like an email, phone, or long account/card-like digit run is raw data.
const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const PHONE_RE = /(?:\+?\d[\s().-]?){9,}/;          // 9+ digits with separators
const LONG_DIGITS_RE = /\d{9,}/;                     // SSN/account/card-like runs
// Category labels are short human words: letters, spaces, &, /, - only.
const CATEGORY_KEY_RE = /^[a-zA-Z][a-zA-Z &/-]{0,59}$/;
// Opaque contributor token: uuid/random hex/base-style id, never an email or name.
const CONTRIBUTOR_ID_RE = /^[a-zA-Z0-9_-]{8,80}$/;

function findPiiValue(value: any, depth = 0): string | null {
  if (depth > 6 || value === null) return null;
  if (typeof value === 'string') {
    if (EMAIL_RE.test(value)) return 'email-like value';
    if (LONG_DIGITS_RE.test(value)) return 'account-like number';
    if (PHONE_RE.test(value)) return 'phone-like value';
    return null;
  }
  if (typeof value !== 'object') return null;
  if (Array.isArray(value)) {
    for (const item of value) {
      const nested = findPiiValue(item, depth + 1);
      if (nested) return nested;
    }
    return null;
  }
  for (const key of Object.keys(value)) {
    // Keys are also free-form text — scan them for PII patterns too.
    const keyHit = findPiiValue(key, depth + 1);
    if (keyHit) return keyHit;
    const nested = findPiiValue(value[key], depth + 1);
    if (nested) return nested;
  }
  return null;
}

function findForbiddenKey(value: any, depth = 0): string | null {
  if (depth > 6 || value === null || typeof value !== 'object') return null;
  if (Array.isArray(value)) {
    // Arrays of objects look like raw rows — reject outright.
    for (const item of value) {
      if (item !== null && typeof item === 'object') return 'array-of-objects';
      const nested = findForbiddenKey(item, depth + 1);
      if (nested) return nested;
    }
    return null;
  }
  for (const key of Object.keys(value)) {
    if (FORBIDDEN_AGG_KEYS.has(key.toLowerCase())) return key;
    const nested = findForbiddenKey(value[key], depth + 1);
    if (nested) return nested;
  }
  return null;
}

// Accept ONLY an anonymized, PII-free aggregate. Raw rows / identifiers are rejected.
app.post('/api/data-pools/contribute', async (req, res) => {
  try {
    const { poolId, contributorId, aggregate } = req.body || {};
    if (!poolId || !contributorId || !aggregate || typeof aggregate !== 'object') {
      return res.status(400).json({ error: 'poolId, contributorId and aggregate are required' });
    }
    if (!DATA_POOLS.find((p) => p.id === poolId)) {
      return res.status(404).json({ error: 'Unknown pool' });
    }
    // contributorId must be an opaque random token — never an email, name, or PII.
    if (!CONTRIBUTOR_ID_RE.test(String(contributorId))) {
      return res.status(422).json({
        error: 'Contribution rejected: contributorId must be an opaque token (8-80 chars, letters/digits/_/-), not an email or any identifying value.',
      });
    }
    const forbidden = findForbiddenKey(aggregate);
    if (forbidden) {
      return res.status(422).json({
        error: `Contribution rejected: payload appears to contain raw or identifying data ("${forbidden}"). Only anonymized aggregates may be contributed.`,
      });
    }
    const piiHit = findPiiValue(aggregate);
    if (piiHit) {
      return res.status(422).json({
        error: `Contribution rejected: payload contains an ${piiHit}. Aggregates must hold only category labels, counts, and totals.`,
      });
    }
    // Whitelist the aggregate shape — strip anything unexpected before storing.
    const safeCategories: Record<string, { count: number; total: number }> = {};
    if (aggregate.categories && typeof aggregate.categories === 'object') {
      for (const [cat, v] of Object.entries<any>(aggregate.categories)) {
        // Category keys must look like short human labels, not free-form data.
        if (!CATEGORY_KEY_RE.test(String(cat))) {
          return res.status(422).json({
            error: `Contribution rejected: category label "${String(cat).slice(0, 30)}" is not a valid short category name.`,
          });
        }
        safeCategories[String(cat).slice(0, 60)] = {
          count: Number(v?.count) || 0,
          total: Number(v?.total) || 0,
        };
      }
    }
    const safeAggregate = {
      transactionCount: Number(aggregate.transactionCount) || 0,
      totalSpend: Number(aggregate.totalSpend) || 0,
      periodMonths: Number(aggregate.periodMonths) || 0,
      categories: safeCategories,
    };
    await pool.query(
      `INSERT INTO data_pool_aggregates (pool_id, contributor_id, aggregate, contributed_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (pool_id, contributor_id)
       DO UPDATE SET aggregate = EXCLUDED.aggregate, contributed_at = NOW()`,
      [poolId, String(contributorId).slice(0, 80), safeAggregate]
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Withdraw a contributed aggregate (leaving a pool).
app.delete('/api/data-pools/contribute', async (req, res) => {
  try {
    const { poolId, contributorId } = req.body || {};
    if (!poolId || !contributorId) {
      return res.status(400).json({ error: 'poolId and contributorId are required' });
    }
    await pool.query(
      `DELETE FROM data_pool_aggregates WHERE pool_id = $1 AND contributor_id = $2`,
      [poolId, contributorId]
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Pooled-aggregate dashboard: contribution counts + retention window + next purge.
app.get('/api/data-pools/aggregates', async (req, res) => {
  try {
    const byPool = await pool.query(`
      SELECT pool_id,
             COUNT(*)::int AS contributor_count,
             MIN(contributed_at) AS oldest_contributed_at,
             MAX(contributed_at) AS newest_contributed_at
      FROM data_pool_aggregates
      GROUP BY pool_id
    `);
    const total = await pool.query(`SELECT COUNT(*)::int AS cnt FROM data_pool_aggregates`);
    res.json({
      retentionDays: RETENTION_DAYS,
      nextPurgeAt: nextPurgeAt ? nextPurgeAt.toISOString() : null,
      lastPurgedCount,
      totalContributions: total.rows[0].cnt,
      byPool: byPool.rows,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Governance — recorded member votes on data-use changes ───────────────────
// Public read of proposals. `memberSession` is applied (without requiring a
// verified member) so that, when the viewer happens to be a verified member, we
// can flag the proposals they authored — that drives the author-only "Withdraw"
// control without ever exposing the raw author email to anyone.
app.get('/api/governance/proposals', memberSession, async (req, res) => {
  try {
    const viewerEmail = req.session?.verifiedEmail ?? null;
    const result = await pool.query(`
      SELECT p.id, p.title, p.description, p.pool_id, p.threshold, p.status, p.created_at, p.created_by,
             COALESCE(SUM(CASE WHEN v.choice = 'yes' THEN 1 ELSE 0 END), 0)::int AS yes_votes,
             COALESCE(SUM(CASE WHEN v.choice = 'no' THEN 1 ELSE 0 END), 0)::int AS no_votes
      FROM data_use_proposals p
      LEFT JOIN data_use_votes v ON v.proposal_id = p.id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);
    // Surface a masked author for member-submitted proposals (same masking as
    // vote history). Seeded proposals have no created_by and are attributed to SOLVY.
    const proposals = result.rows.map((r: any) => {
      const { created_by, ...rest } = r;
      const mine = !!viewerEmail && !!created_by && created_by === viewerEmail;
      return { ...rest, author: maskEmail(created_by) ?? 'Seeded by SOLVY', mine };
    });
    res.json({ proposals });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Members may raise their own data-use proposal for the community to vote on.
// Identity is the verified session email (not a free-text field) and the author
// must be on the member roster — the same eligibility rule that gates voting.
app.post('/api/governance/proposals', strictLimiter, memberSession, requireVerifiedMember, async (req, res) => {
  try {
    const verifiedEmail = req.session.verifiedEmail!;
    const { title, description, poolId, threshold } = req.body || {};

    if (typeof title !== 'string' || typeof description !== 'string') {
      return res.status(400).json({ error: 'title and description are required' });
    }
    const cleanTitle = title.trim();
    const cleanDescription = description.trim();
    if (cleanTitle.length < 8 || cleanTitle.length > 160) {
      return res.status(400).json({ error: 'Title must be between 8 and 160 characters.' });
    }
    if (cleanDescription.length < 20 || cleanDescription.length > 2000) {
      return res.status(400).json({ error: 'Description must be between 20 and 2000 characters.' });
    }

    // Reject raw/PII content — proposals are public, so they must never carry an
    // email, phone, or account/SSN/card-like number in the title or description.
    for (const field of [cleanTitle, cleanDescription]) {
      if (EMAIL_RE.test(field)) {
        return res.status(400).json({ error: 'Proposals cannot contain an email address. Keep them about the data-use change, not individuals.' });
      }
      if (PHONE_RE.test(field) || LONG_DIGITS_RE.test(field)) {
        return res.status(400).json({ error: 'Proposals cannot contain phone numbers or account/ID-like numbers. Keep them free of personal data.' });
      }
    }

    // Optional pool must reference a real data pool.
    let cleanPoolId: string | null = null;
    if (poolId !== undefined && poolId !== null && poolId !== '') {
      const valid = DATA_POOLS.find((p) => p.id === poolId);
      if (!valid) return res.status(400).json({ error: 'Unknown data pool.' });
      cleanPoolId = valid.id;
    }

    // Threshold: a positive whole number within a sane range.
    let cleanThreshold = 5;
    if (threshold !== undefined && threshold !== null && threshold !== '') {
      const n = Number(threshold);
      if (!Number.isInteger(n) || n < 1 || n > 1000) {
        return res.status(400).json({ error: 'Approval threshold must be a whole number between 1 and 1000.' });
      }
      cleanThreshold = n;
    }

    // Membership eligibility — same roster check as voting.
    const eligible = await pool.query(
      `SELECT 1 WHERE EXISTS (
         SELECT 1 FROM founding_members WHERE LOWER(email) = $1
         UNION ALL SELECT 1 FROM prelaunch_commitments WHERE LOWER(email) = $1
         UNION ALL SELECT 1 FROM first_circle_deposits WHERE LOWER(customer_email) = $1
         UNION ALL SELECT 1 FROM data_pool_optins WHERE LOWER(member_email) = $1
       )`,
      [verifiedEmail]
    );
    if (eligible.rows.length === 0) {
      return res.status(403).json({
        error: 'Only members can raise proposals. This email is not on the member roster — join as a founding member, commit at prelaunch, deposit to the First Circle, or opt into a data pool to become eligible.',
      });
    }

    const inserted = await pool.query(
      `INSERT INTO data_use_proposals (title, description, pool_id, threshold, created_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [cleanTitle, cleanDescription, cleanPoolId, cleanThreshold, verifiedEmail]
    );
    res.json({ success: true, id: inserted.rows[0].id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/governance/proposals/:id/votes', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT voter_email, choice, created_at FROM data_use_votes
       WHERE proposal_id = $1 ORDER BY created_at DESC`,
      [parseInt(req.params.id)]
    );
    // Mask voter identity for member-facing transparency.
    const votes = result.rows.map((r: any) => ({
      voter: maskEmail(r.voter_email) ?? '—',
      choice: r.choice,
      created_at: r.created_at,
    }));
    res.json({ votes });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/governance/proposals/:id/vote', strictLimiter, memberSession, requireVerifiedMember, async (req, res) => {
  try {
    const proposalId = parseInt(req.params.id);
    const { choice } = req.body || {};
    // Identity is the verified session email, not a free-text field — this is what
    // makes "one vote per member" enforceable against a real, confirmed identity.
    const verifiedEmail = req.session.verifiedEmail!;
    if (choice !== 'yes' && choice !== 'no') {
      return res.status(400).json({ error: 'choice ("yes" or "no") is required' });
    }
    const prop = await pool.query(`SELECT * FROM data_use_proposals WHERE id = $1`, [proposalId]);
    if (prop.rows.length === 0) return res.status(404).json({ error: 'Proposal not found' });
    if (prop.rows[0].status !== 'open') {
      return res.status(409).json({ error: 'Voting on this proposal is closed' });
    }
    // Membership eligibility: only emails on an existing member roster may vote.
    // The verified session identity (above) proves the email belongs to the voter;
    // the rosters below are the source of truth for who is actually a member.
    const normalizedEmail = verifiedEmail;
    const eligible = await pool.query(
      `SELECT 1 WHERE EXISTS (
         SELECT 1 FROM founding_members WHERE LOWER(email) = $1
         UNION ALL SELECT 1 FROM prelaunch_commitments WHERE LOWER(email) = $1
         UNION ALL SELECT 1 FROM first_circle_deposits WHERE LOWER(customer_email) = $1
         UNION ALL SELECT 1 FROM data_pool_optins WHERE LOWER(member_email) = $1
       )`,
      [normalizedEmail]
    );
    if (eligible.rows.length === 0) {
      return res.status(403).json({
        error: 'Only members can vote. This email is not on the member roster — join as a founding member, commit at prelaunch, deposit to the First Circle, or opt into a data pool to become eligible.',
      });
    }
    const voterMemberId = req.session.memberId ?? null;
    await pool.query(
      `INSERT INTO data_use_votes (proposal_id, voter_email, choice, member_id)
       VALUES ($1, $2, $3, COALESCE($4, (SELECT id FROM members WHERE email = $2)))
       ON CONFLICT (proposal_id, voter_email) DO UPDATE SET choice = EXCLUDED.choice, created_at = NOW()`,
      [proposalId, verifiedEmail, choice, voterMemberId]
    );
    // Recount and apply threshold.
    const tally = await pool.query(
      `SELECT
         COALESCE(SUM(CASE WHEN choice = 'yes' THEN 1 ELSE 0 END), 0)::int AS yes_votes,
         COALESCE(SUM(CASE WHEN choice = 'no' THEN 1 ELSE 0 END), 0)::int AS no_votes
       FROM data_use_votes WHERE proposal_id = $1`,
      [proposalId]
    );
    const yesVotes = tally.rows[0].yes_votes;
    const threshold = prop.rows[0].threshold;
    let status = prop.rows[0].status;
    if (yesVotes >= threshold) {
      await pool.query(`UPDATE data_use_proposals SET status = 'approved' WHERE id = $1`, [proposalId]);
      status = 'approved';
    }
    res.json({ success: true, yesVotes, noVotes: tally.rows[0].no_votes, threshold, status });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// The author of a proposal may withdraw it — useful when it's a duplicate,
// mistaken, or no longer relevant. Only the original author (matched against the
// verified session email and `created_by`) can withdraw, and only while the
// proposal is still open. Withdrawn proposals no longer accept votes.
app.post('/api/governance/proposals/:id/close', strictLimiter, memberSession, requireVerifiedMember, async (req, res) => {
  try {
    const proposalId = parseInt(req.params.id);
    if (!Number.isInteger(proposalId)) {
      return res.status(400).json({ error: 'Invalid proposal id.' });
    }
    const verifiedEmail = req.session.verifiedEmail!;
    const prop = await pool.query(`SELECT * FROM data_use_proposals WHERE id = $1`, [proposalId]);
    if (prop.rows.length === 0) return res.status(404).json({ error: 'Proposal not found' });

    const proposal = prop.rows[0];
    // Only the original author may withdraw. Seeded proposals (no created_by)
    // have no author and can never be withdrawn through this endpoint.
    if (!proposal.created_by || proposal.created_by !== verifiedEmail) {
      return res.status(403).json({ error: 'Only the member who raised this proposal can withdraw it.' });
    }
    if (proposal.status !== 'open') {
      return res.status(409).json({ error: 'Only an open proposal can be withdrawn.' });
    }

    await pool.query(`UPDATE data_use_proposals SET status = 'withdrawn' WHERE id = $1`, [proposalId]);
    res.json({ success: true, status: 'withdrawn' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

  // ─── Banking Routes ──────────────────────────────────────────────────────────

  app.use('/api/banking', bankingRouter);

  // ─── Tax Export (Staff-only) ─────────────────────────────────────────────────

  app.get('/api/tax/export', requireStaffToken, async (req, res) => {
    try {
      const { from, to, format = 'json' } = req.query as Record<string, string>;

      // Input validation
      if (!from || !to) {
        return res.status(400).json({ error: 'from and to date parameters are required (YYYY-MM-DD)' });
      }
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(from) || !dateRegex.test(to)) {
        return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
      }
      const fromDate = new Date(from);
      const toDate = new Date(to);
      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        return res.status(400).json({ error: 'Invalid date range' });
      }
      if (fromDate > toDate) {
        return res.status(400).json({ error: 'from date must be before to date' });
      }
      if (toDate > new Date()) {
        return res.status(400).json({ error: 'to date cannot be in the future' });
      }
      const maxRange = 365 * 24 * 60 * 60 * 1000;
      if (toDate.getTime() - fromDate.getTime() > maxRange) {
        return res.status(400).json({ error: 'Date range cannot exceed 1 year' });
      }
      if (format !== 'json' && format !== 'csv') {
        return res.status(400).json({ error: 'format must be json or csv' });
      }

      interface TaxEvent {
        category: string;
        source: string;
        event_id: string;
        date: string;
        gross: number;
        patronage_70pct: number;
        operations_20pct: number;
        sovereign_fund_10pct: number;
        description: string;
        customer: string;
        notes: string;
      }

      const events: TaxEvent[] = [];

      // 1. Stripe charges (EBL revenue)
      try {
        const stripe = await getUncachableStripeClient();
        const charges = await stripe.charges.list({
          limit: 100,
          created: {
            gte: Math.floor(fromDate.getTime() / 1000),
            lte: Math.floor(toDate.getTime() / 1000),
          },
        });
        for (const charge of charges.data) {
          if (charge.status !== 'succeeded') continue;
          events.push({
            category: 'revenue',
            source: 'stripe_charge',
            event_id: charge.id,
            date: new Date(charge.created * 1000).toISOString().split('T')[0],
            gross: charge.amount / 100,
            patronage_70pct: (charge.amount / 100) * 0.70,
            operations_20pct: (charge.amount / 100) * 0.20,
            sovereign_fund_10pct: (charge.amount / 100) * 0.10,
            description: charge.description || 'EBL Payment',
            customer: charge.customer?.email || 'unknown',
            notes: `Receipt: ${charge.receipt_url || 'N/A'}`,
          });
        }
      } catch (stripeErr: any) {
        console.error('[Tax] Stripe fetch failed:', stripeErr.message);
      }

      // 2. Member fees (founding members who joined in range)
      try {
        const memberResult = await pool.query(
          `SELECT member_number, email, created_at
             FROM founding_members
            WHERE created_at >= $1
              AND created_at <= $2
              AND status = 'active'`,
          [from, to]
        );
        for (const m of memberResult.rows) {
          const fee = 4.99;
          events.push({
            category: 'member_fee',
            source: 'founding_member',
            event_id: m.member_number,
            date: new Date(m.created_at).toISOString().split('T')[0],
            gross: fee,
            patronage_70pct: fee * 0.70,
            operations_20pct: fee * 0.20,
            sovereign_fund_10pct: fee * 0.10,
            description: 'Founding Member Monthly Fee',
            customer: m.email,
            notes: '',
          });
        }
      } catch (dbErr: any) {
        console.error('[Tax] Member fetch failed:', dbErr.message);
      }

      // 3. Data pool sales
      try {
        const salesResult = await pool.query(
          `SELECT id, pool_name, buyer, gross_amount, sale_date, notes
             FROM data_pool_sales
            WHERE sale_date >= $1
              AND sale_date <= $2`,
          [from, to]
        );
        for (const s of salesResult.rows) {
          events.push({
            category: 'data_sale',
            source: 'data_marketplace',
            event_id: s.id,
            date: new Date(s.sale_date).toISOString().split('T')[0],
            gross: parseFloat(s.gross_amount),
            patronage_70pct: parseFloat(s.gross_amount) * 0.70,
            operations_20pct: parseFloat(s.gross_amount) * 0.20,
            sovereign_fund_10pct: parseFloat(s.gross_amount) * 0.10,
            description: `Data Pool: ${s.pool_name}`,
            customer: s.buyer,
            notes: s.notes || '',
          });
        }
      } catch (dbErr: any) {
        console.error('[Tax] Data pool fetch failed:', dbErr.message);
      }

      // Sort by date descending
      events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Calculate totals
      const totals = events.reduce(
        (acc, e) => ({
          gross: acc.gross + e.gross,
          patronage_70pct: acc.patronage_70pct + e.patronage_70pct,
          operations_20pct: acc.operations_20pct + e.operations_20pct,
          sovereign_fund_10pct: acc.sovereign_fund_10pct + e.sovereign_fund_10pct,
        }),
        { gross: 0, patronage_70pct: 0, operations_20pct: 0, sovereign_fund_10pct: 0 }
      );

      if (format === 'csv') {
        const headers = ['category', 'source', 'event_id', 'date', 'gross', 'patronage_70pct', 'operations_20pct', 'sovereign_fund_10pct', 'description', 'customer', 'notes'];
        const escapeCsv = (val: string | number) => {
          const str = String(val ?? '');
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        };
        const rows = events.map((e) =>
          headers.map((h) => escapeCsv((e as any)[h])).join(',')
        );
        const totalRow = headers.map((h) =>
          escapeCsv(h === 'date' ? 'TOTAL' : h === 'description' ? `${events.length} events` : (totals as any)[h] || '')
        ).join(',');
        const csv = [headers.join(','), ...rows, totalRow].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="solvy-tax-export-${from}-to-${to}.csv"`);
        return res.send(csv);
      }

      res.json({
        period: { from, to },
        event_count: events.length,
        totals: {
          gross: Math.round(totals.gross * 100) / 100,
          patronage_70pct: Math.round(totals.patronage_70pct * 100) / 100,
          operations_20pct: Math.round(totals.operations_20pct * 100) / 100,
          sovereign_fund_10pct: Math.round(totals.sovereign_fund_10pct * 100) / 100,
        },
        events,
      });
    } catch (err: any) {
      console.error('[Tax] Export error:', err.message);
      res.status(500).json({ error: 'Tax export failed' });
    }
  });

  // ─── Contact Form ─────────────────────────────────────────────────────────────

app.post('/api/contact', strictLimiter, async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'name, email, and message are required' });
    }
    // Input validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || email.length > 254) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    if (name.length > 200 || (subject && subject.length > 200)) {
      return res.status(400).json({ error: 'Input too long' });
    }
    if (message.length > 5000) {
      return res.status(400).json({ error: 'Message too long (max 5000 characters)' });
    }
    // Sanitize newlines to prevent header injection
    const cleanName = name.trim().replace(/[\r\n]/g, ' ');
    const cleanEmail = email.trim().toLowerCase().replace(/[\r\n]/g, '');
    const cleanSubject = (subject ?? 'General Inquiry').trim().replace(/[\r\n]/g, ' ');
    const cleanMessage = message.trim();
    await sendContactNotification({
      fromName: cleanName,
      fromEmail: cleanEmail,
      subject: cleanSubject,
      message: cleanMessage,
    });
    res.json({ success: true });
  } catch (error: any) {
    console.error('Contact form error:', error.message);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// ────────────────────────────────────────────────────────────────────────────

async function start() {
  await initDatabase();

  // EPIC-001: enforce 30-day retention on pooled aggregates.
  // Non-fatal: a hiccup here must not prevent the server from binding its port.
  try {
    await purgeStaleAggregates();
  } catch (purgeError: any) {
    console.warn('Initial aggregate purge skipped:', purgeError.message);
  }
  setInterval(() => {
    purgeStaleAggregates().catch((err: any) =>
      console.warn('Scheduled aggregate purge failed:', err.message)
    );
  }, 24 * 60 * 60 * 1000);

  await setupAuth(app);
  registerAuthRoutes(app);

  if (IS_PRODUCTION) {
    const distPath = path.join(__dirname, '..', 'dist');

    // Explicit PDF route — ensures correct Content-Type and bypasses static middleware quirks for large files
    app.get('/presentations/:filename', (req, res) => {
      const filename = path.basename(req.params.filename); // prevent path traversal
      const filePath = path.join(distPath, 'presentations', filename);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      res.sendFile(filePath, (err) => {
        if (err) {
          console.error(`[PDF] Error serving ${filename}:`, err.message);
          if (!res.headersSent) res.status(404).json({ error: 'Presentation not found' });
        } else {
          console.log(`[PDF] Served: ${filename}`);
        }
      });
    });

    app.use(express.static(distPath));
    app.get('/{*path}', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log(`Serving static files from ${distPath}`);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SOLVY API server running on port ${PORT} [${IS_PRODUCTION ? 'production' : 'development'}]`);

    // Stripe init makes external API calls — run it AFTER the port is bound so
    // slow/failed Stripe calls can never block the deployment health check.
    initStripe().catch((stripeError: any) => {
      console.warn('Stripe initialization skipped:', stripeError.message);
      console.warn('Stripe features will be unavailable until connected.');
    });
  });
}

// Under test the app is imported (via supertest) without binding a port or
// running the full startup orchestration; tests call initDatabase() themselves.
if (!IS_TEST) {
  start().catch(console.error);
}
