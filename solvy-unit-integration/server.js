/**
 * SOLVY Unit Integration Server
 * Main entry point for banking API
 */

require('dotenv').config();

const express = require('express');
const app = express();

// Import handlers
const { setupBankingRoutes } = require('../solvy-platform/api/banking-router');
const { createCustomer } = require('./api/unit/customer');
const { createDepositAccount, getBalance } = require('./api/unit/account');
const { createCard } = require('./api/unit/card');
const { handleWebhook } = require('./api/webhooks/unit');
const { getUnitToken } = require('./api/auth/unit-token');
const { createCheckoutSession, getSessionStatus } = require('./api/stripe/checkout');
const { handleStripeWebhook, listDeposits } = require('./api/stripe/webhook');
const marketplace = require('./api/marketplace/data-pool');
const emailRoutes = require('./api/email');
const { handleAgentMailWebhook } = require('./api/email');
const moliRoutes = require('./api/moli');

// Middleware
app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf; } }));

// Vendor-agnostic banking routes (Unit.co OR Treasury Prime)
setupBankingRoutes(app);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'solvy-unit-integration', timestamp: new Date() });
});

// ==================== API ROUTES ====================

/**
 * POST /api/members/onboard
 * Complete member onboarding flow
 */
app.post('/api/members/onboard', async (req, res) => {
  try {
    const memberData = req.body;
    
    console.log('🚀 Starting onboarding for:', memberData.email);
    
    // Step 1: Create Unit customer
    const customer = await createCustomer(memberData);
    console.log('✅ Customer created:', customer.data.id);
    
    // Step 2: Create deposit account
    const account = await createDepositAccount(customer.data.id);
    console.log('✅ Account created:', account.data.id);
    
    // Step 3: Create SOLVY card
    const card = await createCard(account.data.id, memberData.address);
    console.log('✅ Card created:', card.data.id);
    
    // Return success
    res.json({
      success: true,
      member: {
        unitCustomerId: customer.data.id,
        unitAccountId: account.data.id,
        unitCardId: card.data.id,
        cardLastFour: card.data.attributes.lastFourDigits
      }
    });
    
  } catch (error) {
    console.error('❌ Onboarding error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/accounts/:accountId/balance
 * Get account balance
 */
app.get('/api/accounts/:accountId/balance', async (req, res) => {
  try {
    const balance = await getBalance(req.params.accountId);
    res.json(balance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/auth/unit-token
 * Generate JWT for Unit Ready To Launch
 */
app.post('/api/auth/unit-token', getUnitToken);

/**
 * POST /webhooks/unit
 * Unit webhook endpoint
 */
app.post('/webhooks/unit', handleWebhook);

// ==================== STRIPE ROUTES ====================

/**
 * POST /api/stripe/create-checkout-session
 * Create Stripe Checkout for First Circle deposit
 */
app.post('/api/stripe/create-checkout-session', createCheckoutSession);

/**
 * GET /api/stripe/session-status
 * Check checkout session status
 */
app.get('/api/stripe/session-status', getSessionStatus);

/**
 * GET /api/stripe/deposits
 * List recorded deposits (admin)
 */
app.get('/api/stripe/deposits', listDeposits);

/**
 * POST /webhooks/stripe
 * Stripe webhook endpoint
 */
app.post('/webhooks/stripe', handleStripeWebhook);

// ==================== DATA MARKETPLACE ROUTES ====================

/**
 * GET /api/marketplace/pools
 * List all available data pools
 */
app.get('/api/marketplace/pools', marketplace.listPools);

/**
 * POST /api/marketplace/pools
 * Create a new data pool (manager/admin)
 */
app.post('/api/marketplace/pools', marketplace.createPool);

/**
 * POST /api/marketplace/contribute
 * Member submits anonymized aggregate data to a pool
 */
app.post('/api/marketplace/contribute', marketplace.contribute);

/**
 * GET /api/marketplace/pools/:poolId/dataset
 * Get bundled dataset as JSON
 */
app.get('/api/marketplace/pools/:poolId/dataset', marketplace.getDatasetJson);

/**
 * GET /api/marketplace/pools/:poolId/dataset.csv
 * Download bundled dataset as CSV
 */
app.get('/api/marketplace/pools/:poolId/dataset.csv', marketplace.downloadDatasetCsv);

/**
 * POST /api/marketplace/pools/:poolId/sale
 * Record a dataset sale
 */
app.post('/api/marketplace/pools/:poolId/sale', marketplace.recordSale);

/**
 * GET /api/marketplace/revenue
 * Get overall marketplace revenue summary
 */
app.get('/api/marketplace/revenue', marketplace.getRevenue);

/**
 * GET /api/marketplace/member/:memberHash/earnings
 * Get a member's estimated earnings from data pool contributions
 */
app.get('/api/marketplace/member/:memberHash/earnings', marketplace.getMemberEarnings);

/**
 * GET /api/marketplace/pools/:poolId/status/:memberHash
 * Check if a member has contributed to a pool
 */
app.get('/api/marketplace/pools/:poolId/status/:memberHash', marketplace.getContributionStatus);

// ==================== EMAIL ROUTES (AgentMail) ====================

/**
 * POST /api/email/send-welcome
 * POST /api/email/send-deposit
 * POST /api/email/send-pool-receipt
 * POST /api/email/support-reply
 * GET  /api/email/support-inbox
 */
app.use('/api/email', emailRoutes);

// MOLI Policy Service Request routes (PDF generation + Mailcow SMTP)
app.use('/api/moli', moliRoutes);

/**
 * POST /webhooks/agentmail
 * AgentMail inbound email webhook
 */
app.post('/webhooks/agentmail', handleAgentMailWebhook);

// ==================== SERVER START ====================

const PORT = process.env.SOLVY_PORT || 3000;

app.listen(PORT, () => {
  console.log('=================================');
  console.log('  SOLVY Unit Integration Server');
  console.log('  Environment:', process.env.SOLVY_ENV || 'sandbox');
  console.log('  Port:', PORT);
  console.log('=================================');
  console.log('');
  console.log('Endpoints:');
  console.log('  GET  /health                    - Health check');
  console.log('  GET  /api/banking/status        - Active banking vendor');
  console.log('  GET  /api/banking/balance       - Get balance (vendor-agnostic)');
  console.log('  GET  /api/banking/transactions  - Get transactions');
  console.log('  GET  /api/banking/cards         - List cards');
  console.log('  POST /api/banking/card/freeze   - Freeze/unfreeze card');
  console.log('  POST /api/banking/onboard       - Onboard member + card');
  console.log('  POST /api/members/onboard       - Onboard new member (Unit legacy)');
  console.log('  GET  /api/accounts/:id/balance  - Get balance (Unit legacy)');
  console.log('  POST /api/auth/unit-token       - Unit JWT token');
  console.log('  POST /webhooks/unit             - Unit webhooks');
  console.log('  POST /webhooks/stripe           - Stripe webhooks');
  console.log('  GET  /api/marketplace/pools     - Data marketplace pools');
  console.log('  POST /api/marketplace/contribute - Submit anonymized data');
  console.log('  GET  /api/marketplace/revenue   - Data pool revenue summary');
  console.log('  POST /api/email/send-welcome    - Send welcome email (AgentMail)');
  console.log('  POST /api/email/support-reply   - Send support reply (AgentMail)');
  console.log('  POST /webhooks/agentmail        - Inbound email webhook');
  console.log('');
  console.log('  POST /api/moli/submit           - MOLI policy service request');
  console.log('  GET  /api/moli/status           - MOLI service status');
  console.log('  POST /api/moli/test-pdf         - Generate test PDF');
  console.log('');
});

module.exports = app;
