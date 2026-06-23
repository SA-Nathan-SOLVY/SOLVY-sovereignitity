/**
 * SOLVY Cooperative - Lithic API Adapter
 *
 * Handles all Lithic API interactions:
 * - Card issuance (virtual + physical)
 * - Transaction retrieval
 * - Account holder management (KYC/KYB)
 * - KYC document upload
 * - Balance inquiries (via account endpoint)
 * - Webhook handling
 *
 * Sandbox: https://sandbox.lithic.com
 * Production: https://api.lithic.com
 * Docs: https://docs.lithic.com
 */

const https = require('https');

// Lithic configuration
const LITHIC_CONFIG = {
  BASE_URL: process.env.LITHIC_API_URL || 'https://sandbox.lithic.com',
  API_KEY: process.env.LITHIC_API_KEY,
  WEBHOOK_SECRET: process.env.LITHIC_WEBHOOK_SECRET
};

/**
 * Make authenticated request to Lithic API
 * @param {string} method - HTTP method
 * @param {string} path - API path (e.g., /v1/cards)
 * @param {Object} body - Request body (optional)
 * @param {Object} extraHeaders - Additional headers (optional)
 * @returns {Promise<Object>}
 */
async function lithicRequest(method, path, body = null, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, LITHIC_CONFIG.BASE_URL);

    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Authorization': `${LITHIC_CONFIG.API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...extraHeaders
      }
    };

    let bodyData = null;
    if (body) {
      bodyData = typeof body === 'string' ? body : JSON.stringify(body);
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
            reject(new Error(`Lithic API error: ${res.statusCode} - ${JSON.stringify(parsed)}`));
          }
        } catch (e) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data);
          } else {
            reject(new Error(`Lithic API error: ${res.statusCode} - ${data}`));
          }
        }
      });
    });

    req.on('error', reject);
    if (bodyData) req.write(bodyData);
    req.end();
  });
}

/**
 * Upload a binary image to a pre-signed URL returned by Lithic.
 * @param {string} uploadUrl
 * @param {Buffer} imageBuffer
 * @param {string} contentType
 * @returns {Promise<Object>}
 */
async function uploadToPresignedUrl(uploadUrl, imageBuffer, contentType = 'image/jpeg') {
  return new Promise((resolve, reject) => {
    const url = new URL(uploadUrl);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
        'Content-Length': imageBuffer.length
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, status: res.statusCode });
        } else {
          reject(new Error(`Upload failed: ${res.statusCode} - ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(imageBuffer);
    req.end();
  });
}

// ============================================
// ACCOUNT HOLDER OPERATIONS
// ============================================

/**
 * Create an individual account holder (KYC).
 *
 * Recommended workflow for SOLVY members: 'KYC_BASIC' or 'KYC_ADVANCED'.
 * The legacy flat payload is still supported via createLegacyAccountHolder().
 *
 * @param {Object} params
 * @param {string} params.workflow - 'KYC_BASIC' | 'KYC_ADVANCED' | 'KYC_EXEMPT' | 'KYC_BYO'
 * @param {Object} params.individual - { first_name, last_name, dob, phone_number, email, government_id, address }
 * @param {string} params.tosTimestamp - Terms-of-service acceptance timestamp
 * @param {string} params.idempotencyToken
 * @returns {Promise<Object>}
 */
async function createAccountHolder(params) {
  const body = {
    workflow: params.workflow || 'KYC_BASIC',
    tos_timestamp: params.tosTimestamp || new Date().toISOString(),
    idempotency_token: params.idempotencyToken || `solvy_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    individual: {
      first_name: params.firstName,
      last_name: params.lastName,
      dob: params.dob,
      phone_number: params.phone,
      email: params.email,
      government_id: params.governmentId,
      address: {
        address1: params.address?.street,
        address2: params.address?.street2,
        city: params.address?.city,
        state: params.address?.state,
        postal_code: params.address?.postalCode || params.address?.zip,
        country: params.address?.country || 'USA'
      }
    }
  };

  // Remove undefined fields
  Object.keys(body.individual).forEach(key => {
    if (body.individual[key] === undefined) delete body.individual[key];
  });
  Object.keys(body.individual.address).forEach(key => {
    if (body.individual.address[key] === undefined) delete body.individual.address[key];
  });

  return await lithicRequest('POST', '/v1/account_holders', body);
}

/**
 * Legacy account holder creation (flat payload).
 * Kept for backward compatibility with existing tests.
 */
async function createLegacyAccountHolder(personData) {
  const body = {
    first_name: personData.firstName,
    last_name: personData.lastName,
    phone_number: personData.phone,
    email: personData.email,
    address: {
      line1: personData.address?.street,
      city: personData.address?.city,
      state: personData.address?.state,
      postal_code: personData.address?.postalCode || personData.address?.zip,
      country: personData.address?.country || 'USA'
    },
    token: personData.token || `person_${Date.now()}`,
    external_id: personData.externalId || personData.memberId
  };

  if (personData.businessName) {
    body.business_account_token = personData.businessToken;
  }

  return await lithicRequest('POST', '/v1/account_holders', body);
}

/**
 * Get account holder status
 * @param {string} token - Account holder token
 * @returns {Promise<Object>}
 */
async function getAccountHolder(token) {
  return await lithicRequest('GET', `/v1/account_holders/${token}`);
}

/**
 * Initiate KYC document upload for an account holder.
 * Returns pre-signed upload URLs for front/back images.
 *
 * @param {string} accountHolderToken
 * @param {string} documentType - e.g., 'drivers_license', 'passport', 'state_id'
 * @param {string} entityToken - optional entity token for business owners
 * @returns {Promise<Object>}
 */
async function initiateDocumentUpload(accountHolderToken, documentType = 'drivers_license', entityToken = null) {
  const body = {
    document_type: documentType,
    ...(entityToken ? { entity_token: entityToken } : {})
  };
  return await lithicRequest('POST', `/v1/account_holders/${accountHolderToken}/documents`, body);
}

/**
 * Upload front/back ID images using pre-signed URLs from initiateDocumentUpload.
 *
 * @param {Object} uploadResponse - response from initiateDocumentUpload
 * @param {Buffer} frontImageBuffer
 * @param {Buffer} backImageBuffer
 * @returns {Promise<Object>}
 */
async function uploadKycDocuments(uploadResponse, frontImageBuffer, backImageBuffer) {
  const frontUrl = uploadResponse.upload_url_front || uploadResponse.front_upload_url;
  const backUrl = uploadResponse.upload_url_back || uploadResponse.back_upload_url;

  if (!frontUrl || !backUrl) {
    throw new Error('Missing pre-signed upload URLs in Lithic response');
  }

  await uploadToPresignedUrl(frontUrl, frontImageBuffer, 'image/jpeg');
  await uploadToPresignedUrl(backUrl, backImageBuffer, 'image/jpeg');

  return { success: true };
}

// ============================================
// ACCOUNT OPERATIONS
// ============================================

/**
 * List Lithic accounts
 * @returns {Promise<Array>}
 */
async function listAccounts() {
  const response = await lithicRequest('GET', '/v1/accounts');
  return response.data || [];
}

/**
 * Get account details
 * @param {string} accountToken
 * @returns {Promise<Object>}
 */
async function getAccount(accountToken) {
  return await lithicRequest('GET', `/v1/accounts/${accountToken}`);
}

/**
 * Get account balance
 * @param {string} accountToken
 * @returns {Promise<Object>}
 */
async function getBalance(accountToken) {
  const account = await getAccount(accountToken);
  return {
    available: account.spend_limit?.available || 0,
    current: account.spend_limit?.daily || 0,
    currency: 'USD',
    accountToken: account.token
  };
}

// ============================================
// CARD OPERATIONS
// ============================================

/**
 * Create a card (virtual or physical)
 * @param {Object} params
 * @returns {Promise<Object>}
 */
async function createCard(params) {
  const body = {
    type: (params.type || 'VIRTUAL').toUpperCase(),
    account_token: params.accountToken,
    card_program_token: params.cardProgramToken,
    carrier: params.carrier,
    shipping_address: params.shippingAddress,
    spend_limit: params.spendLimit,
    spend_limit_duration: params.spendLimitDuration || 'TRANSACTION',
    state: params.state || 'OPEN',
    memo: params.memo || 'SOLVY Card'
  };

  if (!body.account_token) {
    throw new Error('account_token is required for Lithic card creation');
  }

  Object.keys(body).forEach(key => {
    if (body[key] === undefined) delete body[key];
  });

  return await lithicRequest('POST', '/v1/cards', body);
}

/**
 * List cards for an account
 * @param {string} accountToken
 * @returns {Promise<Array>}
 */
async function listCards(accountToken) {
  const response = await lithicRequest('GET', `/v1/cards?account_token=${accountToken}`);
  return response.data || [];
}

/**
 * Get single card
 * @param {string} cardToken
 * @returns {Promise<Object>}
 */
async function getCard(cardToken) {
  return await lithicRequest('GET', `/v1/cards/${cardToken}`);
}

/**
 * Update card state (freeze/unfreeze)
 * @param {string} cardToken
 * @param {boolean} frozen
 * @returns {Promise<Object>}
 */
async function setCardFrozen(cardToken, frozen) {
  const state = frozen ? 'PAUSED' : 'OPEN';
  return await lithicRequest('PATCH', `/v1/cards/${cardToken}`, { state });
}

/**
 * Reissue card
 * @param {string} cardToken
 * @param {Object} options
 * @returns {Promise<Object>}
 */
async function reissueCard(cardToken, options = {}) {
  const body = {
    shipping_address: options.shippingAddress,
    carrier: options.carrier
  };
  return await lithicRequest('POST', `/v1/cards/${cardToken}/reissue`, body);
}

// ============================================
// TRANSACTION OPERATIONS
// ============================================

/**
 * Get transactions for an account
 * @param {string} accountToken
 * @param {Object} options
 * @returns {Promise<Array>}
 */
async function getTransactions(accountToken, options = {}) {
  let url = `/v1/transactions?account_token=${accountToken}`;
  if (options.begin) url += `&begin=${options.begin}`;
  if (options.end) url += `&end=${options.end}`;
  if (options.limit) url += `&limit=${options.limit}`;

  const response = await lithicRequest('GET', url);
  return response.data || [];
}

// ============================================
// SIMULATION (SANDBOX ONLY)
// ============================================

/**
 * Simulate a card authorization
 * @param {Object} params
 * @returns {Promise<Object>}
 */
async function simulateAuthorization(params) {
  const body = {
    descriptor: params.descriptor || 'Test Merchant',
    amount: params.amount,
    pan: params.pan,
    cvv: params.cvv,
    expiration: params.expiration,
    status: params.status || 'AUTHORIZATION'
  };
  return await lithicRequest('POST', '/v1/simulate/authorize', body);
}

/**
 * Simulate a card clearing
 * @param {Object} params
 * @returns {Promise<Object>}
 */
async function simulateClearing(params) {
  const body = {
    token: params.token,
    amount: params.amount
  };
  return await lithicRequest('POST', '/v1/simulate/clearing', body);
}

// ============================================
// WEBHOOK HANDLING
// ============================================

/**
 * Verify Lithic webhook signature
 * @param {string} payload - Raw request body
 * @param {string} signature - X-Lithic-Signature header
 * @returns {boolean}
 */
function verifyWebhook(payload, signature) {
  if (!LITHIC_CONFIG.WEBHOOK_SECRET) {
    console.warn('[Lithic] No webhook secret configured, skipping verification');
    return true;
  }

  const crypto = require('crypto');
  const expected = crypto
    .createHmac('sha256', LITHIC_CONFIG.WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

/**
 * Process Lithic webhook payload
 * @param {Object} body
 * @returns {Object}
 */
function processWebhook(body) {
  return {
    type: body.event_type,
    data: body.payload || body,
    raw: body
  };
}

// ============================================
// HEALTH CHECK
// ============================================

/**
 * Ping Lithic API
 * @returns {Promise<boolean>}
 */
async function ping() {
  try {
    await lithicRequest('GET', '/v1/accounts');
    return true;
  } catch (error) {
    console.error('[Lithic] Ping failed:', error.message);
    return false;
  }
}

// ============================================
// MODULE EXPORTS
// ============================================

module.exports = {
  // Account holders / KYC
  createAccountHolder,
  createLegacyAccountHolder,
  getAccountHolder,
  initiateDocumentUpload,
  uploadKycDocuments,

  // Accounts
  listAccounts,
  getAccount,
  getBalance,

  // Cards
  createCard,
  listCards,
  getCard,
  setCardFrozen,
  reissueCard,

  // Transactions
  getTransactions,

  // Simulation
  simulateAuthorization,
  simulateClearing,

  // Webhooks
  verifyWebhook,
  processWebhook,

  // Health
  ping,

  // Config access
  config: LITHIC_CONFIG
};
