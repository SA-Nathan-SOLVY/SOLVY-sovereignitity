/**
 * SOLVY Cooperative - Treasury Prime API Adapter
 * 
 * Handles all Treasury Prime API interactions:
 * - Authentication (HTTP Basic Auth)
 * - Account management
 * - Card issuance (virtual + physical)
 * - Transaction retrieval
 * - Balance inquiries
 * - Webhook handling
 * 
 * Sandbox: https://api.sandbox.treasuryprime.com
 * Production: https://api.treasuryprime.com
 */

const https = require('https');

// Treasury Prime configuration
const TP_CONFIG = {
  BASE_URL: process.env.TP_API_URL || 'https://api.sandbox.treasuryprime.com',
  API_KEY_ID: process.env.TP_API_KEY_ID,
  API_SECRET: process.env.TP_API_SECRET,
  WEBHOOK_SECRET: process.env.TP_WEBHOOK_SECRET
};

/**
 * Make authenticated request to Treasury Prime API
 * @param {string} method - HTTP method
 * @param {string} path - API path (e.g., /account)
 * @param {Object} body - Request body (optional)
 * @returns {Promise<Object>}
 */
async function tpRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, TP_CONFIG.BASE_URL);
    const auth = Buffer.from(`${TP_CONFIG.API_KEY_ID}:${TP_CONFIG.API_SECRET}`).toString('base64');
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    if (body) {
      const bodyData = JSON.stringify(body);
      options.headers['Content-Length'] = Buffer.byteLength(bodyData);
    }

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`Treasury Prime API error: ${res.statusCode} - ${JSON.stringify(parsed)}`));
          }
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// ============================================
// ACCOUNT OPERATIONS
// ============================================

/**
 * List all accounts
 * @returns {Promise<Array>}
 */
async function listAccounts() {
  const response = await tpRequest('GET', '/account');
  return response.data || [];
}

/**
 * Get single account details
 * @param {string} accountId 
 * @returns {Promise<Object>}
 */
async function getAccount(accountId) {
  return await tpRequest('GET', `/account/${accountId}`);
}

/**
 * Get account balance
 * @param {string} accountId
 * @returns {Promise<Object>} { available_balance, current_balance }
 */
async function getBalance(accountId) {
  const account = await getAccount(accountId);
  return {
    available: account.available_balance || '0.00',
    current: account.current_balance || '0.00',
    currency: 'USD'
  };
}

/**
 * Get account transactions
 * @param {string} accountId
 * @returns {Promise<Array>}
 */
async function getTransactions(accountId) {
  const response = await tpRequest('GET', `/account/${accountId}/transaction`);
  return response.data || [];
}

// ============================================
// PERSON APPLICATION (KYC)
// ============================================

/**
 * Create person application (member onboarding)
 * @param {Object} personData
 * @returns {Promise<Object>}
 */
async function createPersonApplication(personData) {
  const body = {
    first_name: personData.firstName,
    last_name: personData.lastName,
    dob: personData.dob, // YYYY-MM-DD
    tin: personData.ssn, // SSN format
    email: personData.email,
    phone: personData.phone,
    address: {
      street_line_1: personData.address?.street,
      city: personData.address?.city,
      state: personData.address?.state,
      postal_code: personData.address?.zip
    }
  };
  return await tpRequest('POST', '/apply/person_application', body);
}

// ============================================
// ACCOUNT APPLICATION
// ============================================

/**
 * Apply for a new account
 * @param {Object} appData
 * @returns {Promise<Object>}
 */
async function createAccountApplication(appData) {
  const body = {
    account_product_id: appData.productId,
    person_applications: appData.personApplications,
    primary_person_application_id: appData.primaryPersonId
  };
  if (appData.depositId) body.deposit_id = appData.depositId;
  return await tpRequest('POST', '/apply/account_application', body);
}

// ============================================
// CARD OPERATIONS
// ============================================

/**
 * Issue a card (virtual or physical)
 * @param {Object} cardData
 * @returns {Promise<Object>}
 */
async function createCard(cardData) {
  const body = {
    account_id: cardData.accountId,
    card_product_id: cardData.cardProductId,
    person_id: cardData.personId,
    type: cardData.type || 'virtual' // 'virtual' or 'physical'
  };
  if (cardData.type === 'physical' && cardData.shippingAddress) {
    body.shipping_address = cardData.shippingAddress;
  }
  return await tpRequest('POST', '/card', body);
}

/**
 * List cards for an account
 * @param {string} accountId
 * @returns {Promise<Array>}
 */
async function listCards(accountId) {
  const response = await tpRequest('GET', `/card?account_id=${accountId}`);
  return response.data || [];
}

/**
 * Get card details
 * @param {string} cardId
 * @returns {Promise<Object>}
 */
async function getCard(cardId) {
  return await tpRequest('GET', `/card/${cardId}`);
}

/**
 * Update card (freeze, update controls, etc.)
 * @param {string} cardId
 * @param {Object} updates
 * @returns {Promise<Object>}
 */
async function updateCard(cardId, updates) {
  return await tpRequest('PATCH', `/card/${cardId}`, updates);
}

/**
 * Freeze/unfreeze card
 * @param {string} cardId
 * @param {boolean} frozen
 * @returns {Promise<Object>}
 */
async function setCardFrozen(cardId, frozen) {
  return await updateCard(cardId, { status: frozen ? 'frozen' : 'active' });
}

// ============================================
// DIGITAL WALLETS (Apple Pay / Google Pay)
// ============================================

/**
 * Provision card to Apple Pay
 * @param {string} cardId
 * @param {Object} provisioningData
 * @returns {Promise<Object>}
 */
async function provisionApplePay(cardId, provisioningData) {
  const body = {
    card_id: cardId,
    certificates: provisioningData.certificates,
    device_type: provisioningData.deviceType || 'mobile_phone',
    nonce: provisioningData.nonce,
    nonce_signature: provisioningData.nonceSignature,
    provisioning_app_version: provisioningData.appVersion
  };
  return await tpRequest('POST', `/card/${cardId}/digital_wallet_token/apple_pay`, body);
}

/**
 * Provision card to Google Pay
 * @param {string} cardId
 * @param {Object} provisioningData
 * @returns {Promise<Object>}
 */
async function provisionGooglePay(cardId, provisioningData) {
  const body = {
    card_id: cardId,
    device_type: provisioningData.deviceType || 'mobile_phone',
    wallet_account_id: provisioningData.walletAccountId
  };
  return await tpRequest('POST', `/card/${cardId}/digital_wallet_token/google_pay`, body);
}

// ============================================
// TRANSFERS
// ============================================

/**
 * Create ACH transfer
 * @param {Object} transferData
 * @returns {Promise<Object>}
 */
async function createACH(transferData) {
  const body = {
    account_id: transferData.accountId,
    amount: transferData.amount,
    direction: transferData.direction, // 'credit' or 'debit'
    counterparty_id: transferData.counterpartyId
  };
  return await tpRequest('POST', '/ach', body);
}

/**
 * Create book transfer (between accounts at same bank)
 * @param {Object} transferData
 * @returns {Promise<Object>}
 */
async function createBookTransfer(transferData) {
  const body = {
    from_account_id: transferData.fromAccountId,
    to_account_id: transferData.toAccountId,
    amount: transferData.amount,
    description: transferData.description
  };
  return await tpRequest('POST', '/book', body);
}

// ============================================
// WEBHOOK HANDLING
// ============================================

/**
 * Verify webhook signature (HMAC-SHA256)
 * @param {string} payload - Raw request body
 * @param {string} signature - X-TreasuryPrime-Signature header
 * @returns {boolean}
 */
function verifyWebhook(payload, signature) {
  if (!TP_CONFIG.WEBHOOK_SECRET) {
    console.warn('[TreasuryPrime] No webhook secret configured, skipping verification');
    return true;
  }
  
  const expected = require('crypto')
    .createHmac('sha256', TP_CONFIG.WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
  
  return require('crypto').timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

/**
 * Process incoming webhook
 * @param {Object} event - Webhook payload
 * @returns {Object} Parsed event data
 */
function processWebhook(event) {
  console.log(`[TreasuryPrime Webhook] ${event.type}:`, event);
  
  switch (event.type) {
    case 'card.authorization':
      return { type: 'card_auth', data: event };
    case 'card.clearing':
      return { type: 'card_transaction', data: event };
    case 'ach.created':
      return { type: 'ach', data: event };
    case 'account_application.approved':
      return { type: 'account_approved', data: event };
    default:
      return { type: 'unknown', data: event };
  }
}

// ============================================
// SANDBOX HELPERS
// ============================================

/**
 * Test connection to Treasury Prime
 * @returns {Promise<Object>}
 */
async function ping() {
  return await tpRequest('GET', '/ping');
}

module.exports = {
  // Config
  TP_CONFIG,
  
  // Accounts
  listAccounts,
  getAccount,
  getBalance,
  getTransactions,
  
  // Onboarding
  createPersonApplication,
  createAccountApplication,
  
  // Cards
  createCard,
  listCards,
  getCard,
  updateCard,
  setCardFrozen,
  
  // Wallets
  provisionApplePay,
  provisionGooglePay,
  
  // Transfers
  createACH,
  createBookTransfer,
  
  // Webhooks
  verifyWebhook,
  processWebhook,
  
  // Test
  ping
};
