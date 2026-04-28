/**
 * SOLVY Cooperative - Stripe Webhook Handler
 * 
 * Processes payment events from Stripe
 * Integrates with 70/20/10 economic model
 * 
 * @route POST /api/webhooks/stripe
 * @security Stripe signature verification
 */

const crypto = require('crypto');

// Stripe configuration
const STRIPE_CONFIG = {
  SECRET: process.env.STRIPE_WEBHOOK_SECRET, // whsec_...
  API_KEY: process.env.STRIPE_SECRET_KEY
};

/**
 * Verify Stripe webhook signature
 */
function verifyStripeSignature(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');
  
  // Stripe signatures are in format: t=timestamp,v1=signature
  const elements = signature.split(',');
  const signatureHash = elements.find(el => el.startsWith('v1='))?.split('=')[1];
  
  return signatureHash === expected;
}

/**
 * Process payment intent succeeded
 */
async function processPaymentSuccess(event) {
  const payment = event.data.object;
  const amount = payment.amount; // in cents
  
  console.log(`[Stripe] Payment succeeded: $${(amount/100).toFixed(2)}`);
  
  // Calculate SOLVY's share if applicable
  // Example: 1% platform fee on payments
  const platformFee = Math.round(amount * 0.01);
  
  // Apply 70/20/10 to platform fees
  const distribution = {
    members: Math.round(platformFee * 0.70),
    community: Math.round(platformFee * 0.20),
    operations: Math.round(platformFee * 0.10),
    total: platformFee,
    paymentId: payment.id,
    timestamp: new Date().toISOString()
  };
  
  // Store for dividend calculation
  await storePaymentRevenue(distribution);
  
  return { processed: true, fee: platformFee };
}

/**
 * Store payment revenue
 */
async function storePaymentRevenue(distribution) {
  // In production: store in database
  console.log('[Payment Revenue]', {
    amount: `$${(distribution.total/100).toFixed(2)}`,
    members: `$${(distribution.members/100).toFixed(2)}`,
    community: `$${(distribution.community/100).toFixed(2)}`,
    operations: `$${(distribution.operations/100).toFixed(2)}`
  });
  
  // TODO: Store in database
  // db.payment_revenue.insert(distribution)
}

/**
 * Process failed payments
 */
async function processPaymentFailed(event) {
  const payment = event.data.object;
  console.log(`[Stripe] Payment failed: ${payment.id}`);
  
  // TODO: Notify member, update transaction status
  return { processed: true, status: 'failed' };
}

/**
 * Main webhook handler
 */
module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Stripe-Signature');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const payload = JSON.stringify(req.body);
    const signature = req.headers['stripe-signature'];
    
    // Verify signature in production
    if (process.env.NODE_ENV === 'production' && STRIPE_CONFIG.SECRET) {
      if (!signature || !verifyStripeSignature(payload, signature, STRIPE_CONFIG.SECRET)) {
        console.error('[Stripe] Invalid signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }
    
    const event = req.body;
    
    console.log(`[Stripe] Received ${event.type}`);
    
    let result;
    
    switch (event.type) {
      case 'payment_intent.succeeded':
        result = await processPaymentSuccess(event);
        break;
        
      case 'payment_intent.payment_failed':
        result = await processPaymentFailed(event);
        break;
        
      case 'charge.succeeded':
        result = { acknowledged: true };
        break;
        
      default:
        console.log(`[Stripe] Unhandled event: ${event.type}`);
        result = { acknowledged: true };
    }
    
    return res.status(200).json({
      received: true,
      type: event.type,
      result
    });
    
  } catch (error) {
    console.error('[Stripe] Error:', error);
    return res.status(500).json({ 
      error: 'Webhook processing failed',
      message: error.message 
    });
  }
};

// Export for testing
module.exports.verifyStripeSignature = verifyStripeSignature;
module.exports.processPaymentSuccess = processPaymentSuccess;
