/**
 * Unit.co Transaction Webhook Handler
 * Receives real transaction events from Unit.co sandbox/production
 * Stores in MAN IndexedDB via API bridge
 * 
 * SOLVY Ecosystem™ — Real-time transaction processing
 * @version 1.0
 */

const express = require('express');
const crypto = require('crypto');
const router = express.Router();

// Configuration
const UNIT_WEBHOOK_SECRET = process.env.UNIT_WEBHOOK_SECRET || 'your_webhook_secret_here';
const SOLVY_ENV = process.env.SOLVY_ENV || 'sandbox';

// In-memory store for demo (replace with Redis/DB in production)
const pendingTransactions = new Map();

/**
 * Verify Unit.co webhook signature
 * @param {string} payload - Raw request body
 * @param {string} signature - X-Unit-Signature header
 * @returns {boolean}
 */
function verifyWebhookSignature(payload, signature) {
  const expected = crypto
    .createHmac('sha256', UNIT_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

/**
 * Calculate 70/20/10 split from interchange
 * @param {number} transactionAmount 
 * @returns {Object}
 */
function calculateSolvySplit(transactionAmount) {
  // Interchange is typically 1.2-1.5% for debit cards
  const interchangeRate = 0.012;
  const interchangeRevenue = transactionAmount * interchangeRate;
  
  return {
    memberPool: interchangeRevenue * 0.70,      // 70%
    operationsPool: interchangeRevenue * 0.20,  // 20%
    sovereignFund: interchangeRevenue * 0.10,   // 10%
    totalInterchange: interchangeRevenue,
    transactionAmount: transactionAmount
  };
}

/**
 * Transform Unit.co transaction to MAN format
 * @param {Object} unitEvent 
 * @returns {Object}
 */
function transformToMANFormat(unitEvent) {
  const data = unitEvent.data || unitEvent.attributes || {};
  
  return {
    id: data.id || unitEvent.id,
    timestamp: new Date(data.createdAt || Date.now()).getTime(),
    amount: parseFloat(data.amount || 0),
    merchant: data.merchantName || data.merchant?.name || 'Unknown Merchant',
    card_last4: data.cardLastFourDigits || '****',
    status: mapUnitStatus(data.status),
    interchange: calculateSolvySplit(parseFloat(data.amount || 0)),
    metadata: {
      unitEventType: unitEvent.type,
      unitAccountId: data.accountId,
      unitCustomerId: data.customerId,
      network: data.network || 'Visa',
      processedAt: Date.now()
    }
  };
}

/**
 * Map Unit.co status to SOLVY status
 */
function mapUnitStatus(unitStatus) {
  const statusMap = {
    'Authorized': 'pending',
    'Completed': 'settled',
    'Declined': 'declined',
    'Reversed': 'refunded',
    'Pending': 'pending'
  };
  return statusMap[unitStatus] || 'pending';
}

/**
 * POST /webhooks/unit/transactions
 * Main webhook endpoint for Unit.co transaction events
 */
router.post('/transactions', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // Verify signature
    const signature = req.headers['x-unit-signature'] || req.headers['X-Unit-Signature'];
    if (!signature) {
      console.error('[UnitWebhook] Missing signature');
      return res.status(401).json({ error: 'Missing signature' });
    }

    const payload = req.body;
    if (!verifyWebhookSignature(payload, signature)) {
      console.error('[UnitWebhook] Invalid signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Parse event
    const event = JSON.parse(payload);
    console.log('[UnitWebhook] Received event:', event.type, event.id);

    // Handle different event types
    switch (event.type) {
      case 'transaction.created':
      case 'transaction.updated':
        await handleTransactionEvent(event);
        break;
      
      case 'card.transaction.approved':
        await handleCardTransaction(event);
        break;
      
      case 'card.transaction.declined':
        await handleDeclinedTransaction(event);
        break;
      
      default:
        console.log('[UnitWebhook] Unhandled event type:', event.type);
    }

    // Always return 200 to acknowledge receipt
    res.status(200).json({ 
      received: true, 
      event: event.type,
      id: event.id 
    });

  } catch (error) {
    console.error('[UnitWebhook] Error:', error);
    // Still return 200 to prevent Unit.co retries
    res.status(200).json({ 
      received: true, 
      error: 'Processing error logged' 
    });
  }
});

/**
 * Handle transaction created/updated events
 */
async function handleTransactionEvent(event) {
  const manTransaction = transformToMANFormat(event);
  
  // Store in pending queue (will be picked up by client or synced)
  pendingTransactions.set(manTransaction.id, manTransaction);
  
  console.log('[UnitWebhook] Transaction processed:', {
    id: manTransaction.id,
    merchant: manTransaction.merchant,
    amount: manTransaction.amount,
    memberPool: manTransaction.interchange.memberPool.toFixed(2)
  });

  // TODO: Notify connected clients via WebSocket
  // TODO: Trigger threshold checks for proposals
  // TODO: Update aggregated metrics in central DB (anonymized)
}

/**
 * Handle card transaction approved
 */
async function handleCardTransaction(event) {
  const data = event.data || {};
  
  console.log('[UnitWebhook] Card transaction approved:', {
    cardLast4: data.cardLastFourDigits,
    amount: data.amount,
    merchant: data.merchantName
  });

  await handleTransactionEvent(event);
}

/**
 * Handle declined transactions
 */
async function handleDeclinedTransaction(event) {
  const data = event.data || {};
  
  console.log('[UnitWebhook] Card transaction declined:', {
    cardLast4: data.cardLastFourDigits,
    amount: data.amount,
    reason: data.declineReason
  });
}

/**
 * GET /webhooks/unit/pending
 * Endpoint for MAN dashboard to fetch pending transactions
 */
router.get('/pending', async (req, res) => {
  const memberId = req.headers['x-member-id'];
  
  if (!memberId) {
    return res.status(400).json({ error: 'Missing member ID' });
  }

  // Get transactions for this member (in real implementation, filter by member)
  const transactions = Array.from(pendingTransactions.values());
  
  // Clear pending after fetch
  pendingTransactions.clear();
  
  res.json({
    count: transactions.length,
    transactions: transactions
  });
});

/**
 * POST /webhooks/unit/simulate
 * Sandbox simulation endpoint for testing
 */
router.post('/simulate', express.json(), async (req, res) => {
  if (SOLVY_ENV !== 'sandbox') {
    return res.status(403).json({ error: 'Simulation only available in sandbox' });
  }

  const { amount, merchant, cardLast4 = '1234' } = req.body;
  
  if (!amount || !merchant) {
    return res.status(400).json({ error: 'Missing amount or merchant' });
  }

  // Create simulated Unit.co event
  const simulatedEvent = {
    type: 'transaction.created',
    id: 'sim_' + Date.now(),
    data: {
      id: 'tx_' + Date.now(),
      type: 'purchaseTransaction',
      attributes: {
        createdAt: new Date().toISOString(),
        amount: amount,
        merchantName: merchant,
        cardLastFourDigits: cardLast4,
        status: 'Completed',
        direction: 'Debit'
      }
    }
  };

  await handleTransactionEvent(simulatedEvent);

  const split = calculateSolvySplit(parseFloat(amount));

  res.json({
    simulated: true,
    transaction: transformToMANFormat(simulatedEvent),
    solvySplit: {
      memberPool70: split.memberPool.toFixed(2),
      operations20: split.operationsPool.toFixed(2),
      sovereign10: split.sovereignFund.toFixed(2),
      totalInterchange: split.totalInterchange.toFixed(2)
    }
  });
});

/**
 * GET /webhooks/unit/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    env: SOLVY_ENV,
    pendingCount: pendingTransactions.size,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
