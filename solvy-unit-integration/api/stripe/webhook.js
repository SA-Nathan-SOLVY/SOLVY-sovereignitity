/**
 * SOLVY Stripe Webhook Handler
 * 
 * Processes Stripe events for First Circle deposits
 * and records them for member onboarding tracking.
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const crypto = require('crypto');

// In-memory store for demo (replace with DB in production)
const depositRecords = [];

/**
 * Verify Stripe webhook signature
 */
function verifyStripeSignature(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');

  const elements = signature.split(',');
  const signatureHash = elements.find(el => el.startsWith('v1='))?.split('=')[1];

  return signatureHash === expected;
}

/**
 * Process checkout.session.completed
 */
async function processCheckoutCompleted(session) {
  const deposit = {
    sessionId: session.id,
    memberId: session.metadata?.memberId || 'unknown',
    depositType: session.metadata?.depositType || 'first_circle_equity',
    customerEmail: session.customer_email,
    amountTotal: session.amount_total,
    currency: session.currency,
    paymentStatus: session.payment_status,
    createdAt: new Date().toISOString()
  };

  depositRecords.push(deposit);

  console.log('[Stripe] ✅ First Circle deposit recorded:', deposit);

  // TODO: In production, store in database and trigger member onboarding
  // await db.deposits.create(deposit);

  return { processed: true, deposit };
}

/**
 * POST /webhooks/stripe
 * Main Stripe webhook endpoint
 */
async function handleStripeWebhook(req, res) {
  const payload = req.rawBody || JSON.stringify(req.body);
  const signature = req.headers['stripe-signature'];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  // Verify signature in production
  if (process.env.NODE_ENV === 'production' && secret) {
    if (!signature || !verifyStripeSignature(payload, signature, secret)) {
      console.error('[Stripe] Invalid signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }
  }

  const event = req.body;
  console.log('[Stripe] Webhook received:', event.type);

  try {
    let result;

    switch (event.type) {
      case 'checkout.session.completed':
        result = await processCheckoutCompleted(event.data.object);
        break;

      case 'payment_intent.succeeded':
        result = { acknowledged: true, type: 'payment_intent.succeeded' };
        break;

      case 'payment_intent.payment_failed':
        console.log('[Stripe] Payment failed:', event.data.object.id);
        result = { acknowledged: true, status: 'failed' };
        break;

      default:
        console.log('[Stripe] Unhandled event:', event.type);
        result = { acknowledged: true };
    }

    return res.status(200).json({
      received: true,
      type: event.type,
      result
    });

  } catch (error) {
    console.error('[Stripe] Webhook error:', error);
    return res.status(500).json({
      error: 'Webhook processing failed',
      message: error.message
    });
  }
}

/**
 * GET /api/stripe/deposits
 * Admin endpoint to list recorded deposits
 */
function listDeposits(req, res) {
  res.json({
    success: true,
    count: depositRecords.length,
    deposits: depositRecords
  });
}

module.exports = {
  handleStripeWebhook,
  listDeposits
};
