import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import { runMigrations } from 'stripe-replit-sync';
import { getStripeSync, getUncachableStripeClient, getStripePublishableKey } from './stripeClient';
import { WebhookHandlers } from './webhookHandlers';

const app = express();
const PORT = 3001;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDatabase() {
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
      res.status(200).json({ received: true });
    } catch (error: any) {
      console.error('Webhook error:', error.message);
      res.status(400).json({ error: 'Webhook processing error' });
    }
  }
);

app.use(cors());
app.use(express.json());

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

    const existing = await pool.query('SELECT id FROM founding_members WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Member with this email already exists' });
    }

    const stripe = await getUncachableStripeClient();
    const customer = await stripe.customers.create({
      email,
      name: `${firstName} ${lastName}`,
      phone,
      address: {
        line1: addressLine1,
        city: addressCity,
        state: addressState,
        postal_code: addressZip,
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
    `, [email, firstName, lastName, phone, addressLine1, addressCity, addressState, addressZip, customer.id, memberNumber]);

    res.json({ 
      success: true, 
      member: result.rows[0],
      customerId: customer.id
    });
  } catch (error: any) {
    console.error('Application error:', error);
    res.status(500).json({ error: error.message });
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

async function start() {
  await initDatabase();
  await initStripe();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SOLVY API server running on port ${PORT}`);
  });
}

start().catch(console.error);
