/**
 * SOLVY Cooperative - Unit.co API Adapter
 * 
 * Refactored from unit-token.js into a reusable adapter module.
 * Handles all Unit.co API interactions for the banking router.
 */

const crypto = require('crypto');

const UNIT_CONFIG = {
  API_URL: process.env.UNIT_API_URL || 'https://api.s.unit.sh',
  TOKEN_URL: process.env.UNIT_TOKEN_URL || 'https://api.s.unit.sh/users-token',
  PARTNER_ID: process.env.UNIT_PARTNER_ID,
  PARTNER_SECRET: process.env.UNIT_PARTNER_SECRET,
  ORG_ID: process.env.UNIT_ORG_ID,
  ENVIRONMENT: process.env.NODE_ENV || 'sandbox',
  TOKEN_EXPIRY: 3600
};

const tokenCache = new Map();

/**
 * Generate Unit.co JWT token for White Label App
 */
async function generateToken(memberId, memberData = {}) {
  const cacheKey = `${memberId}_${UNIT_CONFIG.ENVIRONMENT}`;
  const cached = tokenCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now() + 300000) {
    return cached;
  }
  
  if (UNIT_CONFIG.ENVIRONMENT === 'sandbox') {
    const token = generateSandboxToken(memberId, memberData);
    const result = {
      token,
      customerId: `sandbox_${memberId}`,
      expiresAt: Date.now() + (UNIT_CONFIG.TOKEN_EXPIRY * 1000)
    };
    tokenCache.set(cacheKey, result);
    return result;
  }
  
  throw new Error('Unit.co production token generation not yet implemented');
}

function generateSandboxToken(memberId, memberData) {
  const header = Buffer.from(JSON.stringify({
    alg: 'HS256',
    typ: 'JWT'
  })).toString('base64url');
  
  const payload = Buffer.from(JSON.stringify({
    sub: memberId,
    partner_id: UNIT_CONFIG.PARTNER_ID || 'solvy_sandbox',
    org_id: UNIT_CONFIG.ORG_ID || 'solvy_org',
    env: 'sandbox',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + UNIT_CONFIG.TOKEN_EXPIRY,
    member: {
      id: memberId,
      email: memberData.email || `${memberId}@solvy.member`,
      first_name: memberData.firstName || 'Test',
      last_name: memberData.lastName || 'Member'
    }
  })).toString('base64url');
  
  const signature = crypto
    .createHmac('sha256', UNIT_CONFIG.PARTNER_SECRET || 'sandbox_secret')
    .update(`${header}.${payload}`)
    .digest('base64url');
  
  return `${header}.${payload}.${signature}`;
}

/**
 * Get account balance (placeholder - Unit.co implementation)
 */
async function getBalance(accountId) {
  // Unit.co specific implementation
  return { available: '0.00', current: '0.00', currency: 'USD' };
}

/**
 * Get transactions (placeholder)
 */
async function getTransactions(accountId) {
  return [];
}

/**
 * Freeze/unfreeze card (placeholder)
 */
async function setCardFrozen(cardId, frozen) {
  return { success: true };
}

/**
 * List cards (placeholder)
 */
async function listCards(accountId) {
  return [];
}

module.exports = {
  UNIT_CONFIG,
  generateToken,
  getBalance,
  getTransactions,
  setCardFrozen,
  listCards
};
