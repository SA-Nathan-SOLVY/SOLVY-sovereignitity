/**
 * SOLVY Cooperative - Vendor-Agnostic Banking API Router
 * 
 * Provides unified banking endpoints that work with EITHER Unit.co or Treasury Prime.
 * Switch vendors by setting BANKING_VENDOR environment variable.
 * 
 * Endpoints:
 *   GET  /api/banking/status          → Check vendor status
 *   GET  /api/banking/balance         → Get member account balance
 *   GET  /api/banking/transactions    → Get member transactions
 *   GET  /api/banking/cards           → List member cards
 *   POST /api/banking/card/freeze     → Freeze a card
 *   POST /api/banking/card/unfreeze   → Unfreeze a card
 *   POST /api/banking/webhook         → Receive vendor webhooks
 *   POST /api/banking/onboard         → Create member account + card
 * 
 * @module banking-router
 */

const { getVendor, isVendor } = require('./vendor-config');
const treasuryPrime = require('./adapters/treasuryprime');
const unit = require('./adapters/unit');

// ============================================
// VENDOR ROUTER HELPER
// ============================================

function getAdapter() {
  return isVendor('unit') ? unit : treasuryPrime;
}

// ============================================
// EXPRESS ROUTE HANDLERS
// ============================================

/**
 * Check banking vendor status
 * GET /api/banking/status
 */
async function statusHandler(req, res) {
  const vendor = getVendor();
  
  try {
    let connected = false;
    let message = '';
    
    if (isVendor('treasuryprime')) {
      const ping = await treasuryPrime.ping();
      connected = !!ping;
      message = 'Treasury Prime API connected';
    } else {
      connected = true;
      message = 'Unit.co configured';
    }
    
    res.json({
      vendor: vendor.name,
      vendorKey: vendor.key,
      type: vendor.type,
      connected,
      message,
      features: vendor.features,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      vendor: vendor.name,
      connected: false,
      error: error.message
    });
  }
}

/**
 * Get member account balance
 * GET /api/banking/balance?accountId=xxx
 */
async function balanceHandler(req, res) {
  try {
    const { accountId } = req.query;
    if (!accountId) {
      return res.status(400).json({ error: 'accountId required' });
    }
    
    const adapter = getAdapter();
    const balance = await adapter.getBalance(accountId);
    
    res.json({
      accountId,
      ...balance,
      vendor: getVendor().name
    });
  } catch (error) {
    console.error('[Banking Router] Balance error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get member transactions
 * GET /api/banking/transactions?accountId=xxx
 */
async function transactionsHandler(req, res) {
  try {
    const { accountId } = req.query;
    if (!accountId) {
      return res.status(400).json({ error: 'accountId required' });
    }
    
    const adapter = getAdapter();
    const transactions = await adapter.getTransactions(accountId);
    
    res.json({
      accountId,
      transactions,
      count: transactions.length,
      vendor: getVendor().name
    });
  } catch (error) {
    console.error('[Banking Router] Transactions error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * List member cards
 * GET /api/banking/cards?accountId=xxx
 */
async function cardsHandler(req, res) {
  try {
    const { accountId } = req.query;
    if (!accountId) {
      return res.status(400).json({ error: 'accountId required' });
    }
    
    const adapter = getAdapter();
    const cards = await adapter.listCards(accountId);
    
    // Normalize card data regardless of vendor
    const normalized = cards.map(card => ({
      id: card.id,
      last4: card.last4 || '••••',
      status: card.status,
      type: card.type || 'virtual',
      network: card.card_product_id ? 'visa' : 'mastercard', // Simplified
      expiry: card.expiration || card.expiry,
      createdAt: card.created_at
    }));
    
    res.json({
      accountId,
      cards: normalized,
      count: normalized.length,
      vendor: getVendor().name
    });
  } catch (error) {
    console.error('[Banking Router] Cards error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Freeze/unfreeze card
 * POST /api/banking/card/freeze
 * POST /api/banking/card/unfreeze
 */
async function cardFreezeHandler(req, res) {
  try {
    const { cardId } = req.body;
    if (!cardId) {
      return res.status(400).json({ error: 'cardId required' });
    }
    
    const frozen = req.path.includes('/freeze');
    const adapter = getAdapter();
    const result = await adapter.setCardFrozen(cardId, frozen);
    
    res.json({
      cardId,
      frozen,
      success: true,
      vendor: getVendor().name
    });
  } catch (error) {
    console.error('[Banking Router] Card freeze error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Member onboarding (account + card creation)
 * POST /api/banking/onboard
 */
async function onboardHandler(req, res) {
  try {
    const { memberId, personData, productId, cardProductId } = req.body;
    
    if (!memberId || !personData) {
      return res.status(400).json({ 
        error: 'memberId and personData required' 
      });
    }
    
    // For Treasury Prime: create person → create account → create card
    if (isVendor('treasuryprime')) {
      // Step 1: Create person application (KYC)
      const person = await treasuryPrime.createPersonApplication(personData);
      
      // Step 2: Create account application
      const accountApp = await treasuryPrime.createAccountApplication({
        productId: productId || 'default_checking',
        personApplications: [{ id: person.id, roles: ['owner', 'signer'] }],
        primaryPersonId: person.id
      });
      
      // Step 3: Create virtual card (if account approved)
      let card = null;
      if (accountApp.account_id) {
        card = await treasuryPrime.createCard({
          accountId: accountApp.account_id,
          cardProductId: cardProductId || 'default_debit',
          personId: person.id,
          type: 'virtual'
        });
      }
      
      return res.json({
        success: true,
        memberId,
        personId: person.id,
        accountApplicationId: accountApp.id,
        accountId: accountApp.account_id,
        cardId: card?.id,
        status: accountApp.status,
        vendor: 'Treasury Prime'
      });
    }
    
    // For Unit.co: generate token for White Label App
    if (isVendor('unit')) {
      const tokenData = await unit.generateToken(memberId, personData);
      return res.json({
        success: true,
        memberId,
        token: tokenData.token,
        customerId: tokenData.customerId,
        expiresAt: tokenData.expiresAt,
        vendor: 'Unit.co'
      });
    }
    
    res.status(400).json({ error: 'Unknown vendor configuration' });
  } catch (error) {
    console.error('[Banking Router] Onboard error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Webhook receiver
 * POST /api/banking/webhook
 */
async function webhookHandler(req, res) {
  try {
    const vendor = getVendor();
    
    if (isVendor('treasuryprime')) {
      const signature = req.headers['x-treasuryprime-signature'];
      const payload = JSON.stringify(req.body);
      
      if (!treasuryPrime.verifyWebhook(payload, signature)) {
        return res.status(401).json({ error: 'Invalid webhook signature' });
      }
      
      const event = treasuryPrime.processWebhook(req.body);
      
      // Handle event based on type
      switch (event.type) {
        case 'card_transaction':
          // Update member balance, trigger dividend calc
          console.log('[Webhook] Card transaction:', event.data);
          break;
        case 'account_approved':
          // Notify member their account is ready
          console.log('[Webhook] Account approved:', event.data);
          break;
        default:
          console.log('[Webhook] Unhandled event:', event.type);
      }
      
      return res.json({ received: true, type: event.type });
    }
    
    if (isVendor('unit')) {
      // Unit.co webhook handling
      console.log('[Webhook] Unit.co event:', req.body);
      return res.json({ received: true });
    }
    
    res.status(400).json({ error: 'Unknown vendor' });
  } catch (error) {
    console.error('[Banking Router] Webhook error:', error);
    // Always return 200 to prevent vendor retries
    res.status(200).json({ received: false, error: error.message });
  }
}

// ============================================
// EXPRESS ROUTER SETUP
// ============================================

function setupBankingRoutes(app) {
  // Status check
  app.get('/api/banking/status', statusHandler);
  
  // Account operations
  app.get('/api/banking/balance', balanceHandler);
  app.get('/api/banking/transactions', transactionsHandler);
  
  // Card operations
  app.get('/api/banking/cards', cardsHandler);
  app.post('/api/banking/card/freeze', cardFreezeHandler);
  app.post('/api/banking/card/unfreeze', cardFreezeHandler);
  
  // Onboarding
  app.post('/api/banking/onboard', onboardHandler);
  
  // Webhooks
  app.post('/api/banking/webhook', webhookHandler);
  
  console.log(`[Banking Router] Registered routes for vendor: ${getVendor().name}`);
}

module.exports = { setupBankingRoutes };
