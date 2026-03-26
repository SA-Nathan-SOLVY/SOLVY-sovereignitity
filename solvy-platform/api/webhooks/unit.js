/**
 * SOLVY Cooperative - Unit.co Webhook Handler
 * 
 * Processes transaction events from Unit.co banking platform
 * Captures interchange revenue for 70/20/10 distribution
 * 
 * @route POST /api/webhooks/unit
 * @security HMAC-SHA256 signature verification
 */

const crypto = require('crypto');

// Webhook configuration
const WEBHOOK_CONFIG = {
  SECRET: process.env.UNIT_WEBHOOK_SECRET || 'your_webhook_secret',
  INTERCHANGE_RATE: 0.015, // 1.5% average interchange
  SOLVY_SHARE: 0.20,       // SOLVY gets 20% of interchange
  
  // 70/20/10 Distribution
  DISTRIBUTION: {
    MEMBERS: 0.70,
    COMMUNITY: 0.20,
    OPERATIONS: 0.10
  }
};

/**
 * Verify webhook signature from Unit
 */
function verifySignature(payload, signature) {
  const expected = crypto
    .createHmac('sha256', WEBHOOK_CONFIG.SECRET)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

/**
 * Process transaction authorization event
 * Captures interchange revenue
 */
async function processAuthorization(event) {
  const { data } = event;
  const transaction = data.attributes;
  
  // Calculate interchange revenue
  const amount = parseFloat(transaction.amount);
  const interchangeRevenue = amount * WEBHOOK_CONFIG.INTERCHANGE_RATE * WEBHOOK_CONFIG.SOLVY_SHARE;
  
  // Apply 70/20/10 distribution
  const distribution = {
    members: interchangeRevenue * WEBHOOK_CONFIG.DISTRIBUTION.MEMBERS,
    community: interchangeRevenue * WEBHOOK_CONFIG.DISTRIBUTION.COMMUNITY,
    operations: interchangeRevenue * WEBHOOK_CONFIG.DISTRIBUTION.OPERATIONS,
    total: interchangeRevenue,
    transactionId: data.id,
    timestamp: new Date().toISOString()
  };
  
  // Store for dividend calculation
  await storeRevenue(distribution);
  
  // Update member's contribution (for weighted dividends)
  await updateMemberContribution(
    transaction.customerId,
    amount,
    interchangeRevenue
  );
  
  console.log(`[Interchange] Captured $${interchangeRevenue.toFixed(4)} from tx ${data.id}`);
  
  return distribution;
}

/**
 * Store revenue in database
 */
async function storeRevenue(distribution) {
  // In production: store in database
  // For now, log to console
  console.log('[Revenue Distribution]', {
    members: `$${distribution.members.toFixed(4)}`,
    community: `$${distribution.community.toFixed(4)}`,
    operations: `$${distribution.operations.toFixed(4)}`
  });
  
  // TODO: Store in database for quarterly dividend calculation
  // db.interchange_revenue.insert(distribution)
}

/**
 * Update member's transaction contribution
 * Used for weighted dividend distribution
 */
async function updateMemberContribution(customerId, amount, interchange) {
  // TODO: Update member's contribution record
  // This enables weighted distribution (members who transact more get more)
  console.log(`[Member Contribution] ${customerId}: $${amount.toFixed(2)} tx, $${interchange.toFixed(4)} interchange`);
}

/**
 * Process card status changes
 */
async function processCardEvent(event) {
  const { data } = event;
  console.log(`[Card Event] ${data.attributes.status} for card ${data.id}`);
  
  // Handle card activation, freezing, etc.
  return { processed: true };
}

/**
 * Process account events
 */
async function processAccountEvent(event) {
  const { data } = event;
  console.log(`[Account Event] ${data.attributes.status} for account ${data.id}`);
  
  // Handle account status changes
  return { processed: true };
}

/**
 * Main webhook handler
 */
module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Unit-Signature');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const payload = JSON.stringify(req.body);
    const signature = req.headers['x-unit-signature'] || req.headers['X-Unit-Signature'];
    
    // Verify signature in production
    if (process.env.NODE_ENV === 'production') {
      if (!signature || !verifySignature(payload, signature)) {
        console.error('[Webhook] Invalid signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }
    
    const event = req.body;
    const eventType = event.data?.type;
    
    console.log(`[Webhook] Received ${eventType}`);
    
    let result;
    
    switch (eventType) {
      case 'authorization':
        result = await processAuthorization(event);
        break;
        
      case 'card':
        result = await processCardEvent(event);
        break;
        
      case 'account':
        result = await processAccountEvent(event);
        break;
        
      default:
        console.log(`[Webhook] Unhandled event type: ${eventType}`);
        result = { acknowledged: true };
    }
    
    // Acknowledge receipt
    return res.status(200).json({
      received: true,
      type: eventType,
      result
    });
    
  } catch (error) {
    console.error('[Webhook] Error:', error);
    return res.status(500).json({ 
      error: 'Webhook processing failed',
      message: error.message 
    });
  }
};

// Export for testing
module.exports.verifySignature = verifySignature;
module.exports.processAuthorization = processAuthorization;
