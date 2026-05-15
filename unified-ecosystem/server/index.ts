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
} from './emailService';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const app = express();
const PORT = IS_PRODUCTION ? (process.env.PORT ? parseInt(process.env.PORT) : 5000) : 3001;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDatabase() {
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

  await pool.query(`
    CREATE TABLE IF NOT EXISTS data_pool_optins (
      id SERIAL PRIMARY KEY,
      member_email TEXT NOT NULL,
      pool_id TEXT NOT NULL,
      opted_in_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(member_email, pool_id)
    )
  `);

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
  handler: (req, res) => res.status(429).json({ error: 'Too many requests — please slow down' }),
});
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => res.status(429).json({ error: 'Too many requests — please slow down' }),
});
app.use('/api/', apiLimiter);
app.use('/api/contact', strictLimiter);
app.use('/api/founding-member/apply', strictLimiter);
app.use('/api/prelaunch/commit', strictLimiter);

app.use(express.json());

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

app.get('/api/data-pools/my-optins', strictLimiter, async (req, res) => {
  try {
    const { email } = req.query as Record<string, string>;
    if (!email) return res.status(400).json({ error: 'email is required' });
    const result = await pool.query(
      `SELECT pool_id FROM data_pool_optins WHERE member_email = $1`,
      [email.toLowerCase().trim()]
    );
    res.json({ optins: result.rows.map((r: any) => r.pool_id) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/data-pools/optin', async (req, res) => {
  try {
    const { email, poolId } = req.body;
    if (!email || !poolId) return res.status(400).json({ error: 'email and poolId are required' });
    const valid = DATA_POOLS.find((p) => p.id === poolId);
    if (!valid) return res.status(404).json({ error: 'Unknown pool' });
    await pool.query(
      `INSERT INTO data_pool_optins (member_email, pool_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [email.toLowerCase().trim(), poolId]
    );
    res.json({ success: true, poolId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/data-pools/optin', async (req, res) => {
  try {
    const { email, poolId } = req.body;
    if (!email || !poolId) return res.status(400).json({ error: 'email and poolId are required' });
    await pool.query(
      `DELETE FROM data_pool_optins WHERE member_email = $1 AND pool_id = $2`,
      [email.toLowerCase().trim(), poolId]
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
  
  await setupAuth(app);
  registerAuthRoutes(app);
  
  try {
    await initStripe();
  } catch (stripeError: any) {
    console.warn('Stripe initialization skipped:', stripeError.message);
    console.warn('Stripe features will be unavailable until connected.');
  }

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
  });
}

start().catch(console.error);
