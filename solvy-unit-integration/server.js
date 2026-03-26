/**
 * SOLVY Unit Integration Server
 * Main entry point for banking API
 */

require('dotenv').config();

const express = require('express');
const app = express();

// Import handlers
const { createCustomer } = require('./api/unit/customer');
const { createDepositAccount, getBalance } = require('./api/unit/account');
const { createCard } = require('./api/unit/card');
const { handleWebhook } = require('./api/webhooks/unit');

// Middleware
app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf; } }));

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
  console.log('  GET  /health              - Health check');
  console.log('  POST /api/members/onboard - Onboard new member');
  console.log('  GET  /api/accounts/:id/balance - Get balance');
  console.log('  POST /webhooks/unit       - Unit webhooks');
  console.log('');
});

module.exports = app;
