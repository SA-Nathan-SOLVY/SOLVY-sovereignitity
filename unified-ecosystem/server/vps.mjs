/**
 * SOLVY Ecosystem – VPS Production Server
 * Runs on Hetzner (or any Linux VPS).
 * NO Replit-specific dependencies.
 *
 * Serves:
 *   - React SPA static files from ../dist/
 *   - All /api/* routes via Express
 *
 * Required env vars (set in /var/www/solvy-ecosystem/.env):
 *   DATABASE_URL, STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY,
 *   STRIPE_WEBHOOK_SECRET, UNIT_API_TOKEN, UNIT_CUSTOMER_ID,
 *   DOMAIN (e.g. nitty.ebl.beauty), PORT (default 3001)
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';
import Stripe from 'stripe';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const PORT    = process.env.PORT    || 3001;
const DOMAIN  = process.env.DOMAIN  || 'nitty.ebl.beauty';
const BASE_URL = `https://${DOMAIN}`;

// ── Database ──────────────────────────────────────────────────────────────────
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS founding_members (
      id                   SERIAL PRIMARY KEY,
      email                TEXT UNIQUE NOT NULL,
      first_name           TEXT NOT NULL,
      last_name            TEXT NOT NULL,
      phone                TEXT,
      address_line1        TEXT,
      address_city         TEXT,
      address_state        TEXT,
      address_zip          TEXT,
      stripe_customer_id   TEXT,
      stripe_subscription_id TEXT,
      member_number        TEXT UNIQUE,
      status               TEXT DEFAULT 'pending',
      kyc_verified         BOOLEAN DEFAULT FALSE,
      created_at           TIMESTAMP DEFAULT NOW(),
      updated_at           TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('✓ Database tables ready');
}

// ── Stripe ────────────────────────────────────────────────────────────────────
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not set');
  return new Stripe(key, { apiVersion: '2024-06-20' });
}

// ── App ───────────────────────────────────────────────────────────────────────
const app = express();

app.use(cors());

// Stripe webhook must receive raw body BEFORE json middleware
app.post(
  '/api/stripe/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig    = req.headers['stripe-signature'];
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!sig || !secret) return res.status(400).json({ error: 'Missing webhook config' });

    try {
      const stripe = getStripe();
      const event  = stripe.webhooks.constructEvent(req.body, sig, secret);
      console.log(`Webhook: ${event.type}`);
      res.json({ received: true });
    } catch (err) {
      console.error('Webhook error:', err.message);
      res.status(400).json({ error: err.message });
    }
  }
);

app.use(express.json());

// ── API: Unit.co banking token ────────────────────────────────────────────────
app.get('/api/unit/token', async (req, res) => {
  const { UNIT_API_TOKEN, UNIT_CUSTOMER_ID } = process.env;
  if (!UNIT_API_TOKEN || !UNIT_CUSTOMER_ID)
    return res.status(503).json({ error: 'Unit banking not configured' });

  try {
    const r = await fetch(`https://api.s.unit.sh/customers/${UNIT_CUSTOMER_ID}/token`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${UNIT_API_TOKEN}`,
        'Content-Type': 'application/vnd.api+json',
      },
      body: JSON.stringify({
        data: {
          type: 'customerToken',
          attributes: { scope: 'transactions cards accounts payments' },
        },
      }),
    });

    if (!r.ok) {
      const txt = await r.text();
      console.error('Unit error:', txt);
      return res.status(502).json({ error: 'Failed to generate banking token' });
    }

    const data  = await r.json();
    const token = data?.data?.attributes?.token;
    if (!token) return res.status(502).json({ error: 'No token in Unit response' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── API: Stripe publishable key ───────────────────────────────────────────────
app.get('/api/stripe/publishable-key', (_req, res) => {
  const key = process.env.STRIPE_PUBLISHABLE_KEY;
  if (!key) return res.status(503).json({ error: 'Stripe not configured' });
  res.json({ publishableKey: key });
});

// ── API: Founding member apply ────────────────────────────────────────────────
app.post('/api/founding-member/apply', async (req, res) => {
  const { email, firstName, lastName, phone,
          addressLine1, addressCity, addressState, addressZip } = req.body;

  if (!email || !firstName || !lastName)
    return res.status(400).json({ error: 'Email, first name, and last name are required' });

  try {
    const existing = await pool.query(
      'SELECT id FROM founding_members WHERE email = $1', [email]
    );
    if (existing.rows.length > 0)
      return res.status(409).json({ error: 'Member with this email already exists' });

    const stripe   = getStripe();
    const customer = await stripe.customers.create({
      email,
      name: `${firstName} ${lastName}`,
      phone,
      address: {
        line1: addressLine1, city: addressCity,
        state: addressState, postal_code: addressZip, country: 'US',
      },
      metadata: { founding_member: 'true', application_date: new Date().toISOString() },
    });

    const count        = await pool.query('SELECT COUNT(*) FROM founding_members');
    const memberNumber = `FM-${String(parseInt(count.rows[0].count) + 1).padStart(4, '0')}`;

    const result = await pool.query(`
      INSERT INTO founding_members
        (email, first_name, last_name, phone, address_line1, address_city,
         address_state, address_zip, stripe_customer_id, member_number, status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'pending_payment')
      RETURNING *
    `, [email, firstName, lastName, phone, addressLine1,
        addressCity, addressState, addressZip, customer.id, memberNumber]);

    res.json({ success: true, member: result.rows[0], customerId: customer.id });
  } catch (err) {
    console.error('Apply error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── API: Stripe checkout ──────────────────────────────────────────────────────
app.post('/api/founding-member/checkout', async (req, res) => {
  const { customerId, priceId } = req.body;
  if (!customerId || !priceId)
    return res.status(400).json({ error: 'Customer ID and Price ID are required' });

  try {
    const stripe  = getStripe();
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${BASE_URL}/member-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${BASE_URL}/apply`,
      metadata: { founding_member: 'true' },
    });
    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── API: Verify session ───────────────────────────────────────────────────────
app.get('/api/founding-member/verify/:sessionId', async (req, res) => {
  try {
    const stripe  = getStripe();
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);

    if (session.payment_status === 'paid' && session.customer) {
      await pool.query(
        `UPDATE founding_members
            SET status = 'active', stripe_subscription_id = $1, updated_at = NOW()
          WHERE stripe_customer_id = $2`,
        [session.subscription, session.customer]
      );
      const r = await pool.query(
        'SELECT member_number, first_name, last_name FROM founding_members WHERE stripe_customer_id = $1',
        [session.customer]
      );
      res.json({ success: true, member: r.rows[0], status: 'active' });
    } else {
      res.json({ success: false, status: session.payment_status });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── API: Health check ─────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', env: 'vps', domain: DOMAIN, ts: new Date().toISOString() });
});

// ── Serve React SPA static files ──────────────────────────────────────────────
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ── Start ─────────────────────────────────────────────────────────────────────
async function start() {
  await initDatabase();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✓ SOLVY VPS server running on port ${PORT}`);
    console.log(`  Domain : ${DOMAIN}`);
    console.log(`  Env    : production`);
  });
}

start().catch(err => {
  console.error('Failed to start:', err);
  process.exit(1);
});
