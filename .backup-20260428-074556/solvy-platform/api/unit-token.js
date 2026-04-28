/**
 * SOLVY Cooperative - Unit Token Generation API
 * 
 * Generates JWT tokens for Unit Elements White Label App
 * Securely authenticates members with Unit.co banking infrastructure
 * 
 * @route POST /api/unit-token
 * @returns { token: string, customerId: string, expiresIn: number }
 */

const crypto = require('crypto');

// Unit.co configuration - USE ENVIRONMENT VARIABLES IN PRODUCTION
const UNIT_CONFIG = {
  // API endpoints
  API_URL: process.env.UNIT_API_URL || 'https://api.s.unit.sh',
  TOKEN_URL: process.env.UNIT_TOKEN_URL || 'https://api.s.unit.sh/users-token',
  
  // Authentication - MUST be set in production
  PARTNER_ID: process.env.UNIT_PARTNER_ID,
  PARTNER_SECRET: process.env.UNIT_PARTNER_SECRET,
  ORG_ID: process.env.UNIT_ORG_ID,
  
  // Environment
  ENVIRONMENT: process.env.NODE_ENV || 'sandbox',
  
  // Token expiration (seconds)
  TOKEN_EXPIRY: 3600 // 1 hour
};

// Simple in-memory cache for tokens (use Redis in production)
const tokenCache = new Map();

/**
 * Generate or retrieve cached JWT token for Unit Elements
 * Called by frontend when loading the White Label App
 * 
 * @param {string} memberId - SOLVY member ID
 * @param {Object} memberData - Member information for customer creation
 * @returns {Object} { token, customerId, expiresAt }
 */
async function generateUnitToken(memberId, memberData = {}) {
  try {
    // Check cache first
    const cacheKey = `${memberId}_${UNIT_CONFIG.ENVIRONMENT}`;
    const cached = tokenCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now() + 300000) { // Valid for 5 more minutes
      console.log(`[Unit Token] Cache hit for member: ${memberId}`);
      return cached;
    }
    
    // Sandbox mode for testing/prelaunch
    if (UNIT_CONFIG.ENVIRONMENT === 'sandbox') {
      console.log(`[Unit Token] Generating sandbox token for member: ${memberId}`);
      const token = generateSandboxToken(memberId, memberData);
      const result = {
        token,
        customerId: `sandbox_${memberId}`,
        expiresAt: Date.now() + (UNIT_CONFIG.TOKEN_EXPIRY * 1000)
      };
      tokenCache.set(cacheKey, result);
      return result;
    }
    
    // Production: Validate credentials
    if (!UNIT_CONFIG.PARTNER_ID || !UNIT_CONFIG.PARTNER_SECRET) {
      throw new Error('Missing Unit.co credentials. Set UNIT_PARTNER_ID and UNIT_PARTNER_SECRET environment variables.');
    }
    
    // Step 1: Create or retrieve Unit customer
    const customer = await createOrGetCustomer(memberId, memberData);
    
    // Step 2: Generate user token for this customer
    const token = await createUserToken(customer.id);
    
    // Cache result
    const result = {
      token,
      customerId: customer.id,
      expiresAt: Date.now() + (UNIT_CONFIG.TOKEN_EXPIRY * 1000)
    };
    tokenCache.set(cacheKey, result);
    
    console.log(`[Unit Token] Generated production token for member: ${memberId}, customer: ${customer.id}`);
    return result;
    
  } catch (error) {
    console.error('[Unit Token] Generation failed:', error);
    throw error;
  }
}

/**
 * Create or retrieve existing Unit customer
 */
async function createOrGetCustomer(memberId, memberData) {
  // First, try to find existing customer by email
  if (memberData.email) {
    try {
      const searchResponse = await fetch(`${UNIT_CONFIG.API_URL}/customers?filter[email]=${encodeURIComponent(memberData.email)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${UNIT_CONFIG.PARTNER_SECRET}`,
          'Content-Type': 'application/vnd.api+json'
        }
      });
      
      if (searchResponse.ok) {
        const data = await searchResponse.json();
        if (data.data && data.data.length > 0) {
          console.log(`[Unit Customer] Found existing customer: ${data.data[0].id}`);
          return data.data[0];
        }
      }
    } catch (error) {
      console.warn('[Unit Customer] Search failed, will create new:', error.message);
    }
  }
  
  // Create new customer
  const customerPayload = {
    data: {
      type: 'individualCustomer',
      attributes: {
        ssn: memberData.ssn,
        fullName: {
          first: memberData.firstName,
          last: memberData.lastName
        },
        dateOfBirth: memberData.dateOfBirth,
        address: {
          street: memberData.address?.street,
          city: memberData.address?.city,
          state: memberData.address?.state,
          postalCode: memberData.address?.postalCode,
          country: 'US'
        },
        email: memberData.email,
        phone: {
          countryCode: '1',
          number: memberData.phone?.replace(/\D/g, '')
        },
        tags: {
          memberId: memberId,
          source: 'solvy_ecosystem',
          joinedAt: new Date().toISOString()
        }
      }
    }
  };
  
  const response = await fetch(`${UNIT_CONFIG.API_URL}/customers`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${UNIT_CONFIG.PARTNER_SECRET}`,
      'Content-Type': 'application/vnd.api+json'
    },
    body: JSON.stringify(customerPayload)
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create customer: ${error}`);
  }
  
  const data = await response.json();
  console.log(`[Unit Customer] Created new customer: ${data.data.id}`);
  return data.data;
}

/**
 * Create user token for authenticated customer
 */
async function createUserToken(customerId) {
  const response = await fetch(UNIT_CONFIG.TOKEN_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${UNIT_CONFIG.PARTNER_SECRET}`,
      'Content-Type': 'application/vnd.api+json'
    },
    body: JSON.stringify({
      data: {
        type: 'usersToken',
        attributes: {
          partnerId: UNIT_CONFIG.PARTNER_ID,
          customerId: customerId
        }
      }
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create user token: ${error}`);
  }
  
  const data = await response.json();
  return data.data.attributes.token;
}

/**
 * Generate sandbox token for testing/prelaunch
 * Structure matches Unit's JWT format
 */
function generateSandboxToken(memberId, memberData) {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: `customer_${memberId}`,
    partner_id: UNIT_CONFIG.PARTNER_ID || 'solvy_sandbox',
    org_id: UNIT_CONFIG.ORG_ID || 'solvy_org',
    env: 'sandbox',
    iat: now,
    exp: now + UNIT_CONFIG.TOKEN_EXPIRY,
    member_id: memberId,
    scope: 'customers accounts cards transactions'
  };
  
  // Mock JWT structure (base64url encoded)
  const mockToken = Buffer.from(JSON.stringify(header)).toString('base64url') + '.' +
                    Buffer.from(JSON.stringify(payload)).toString('base64url') + '.' +
                    crypto.randomBytes(32).toString('base64url');
  
  return mockToken;
}

/**
 * Main handler for /api/unit-token
 * Express-compatible route handler
 */
async function handler(req, res) {
  // CORS headers - adjust for production
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['https://ebl.beauty', 'https://solvy.coop', 'http://localhost:3000'];
    
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Member-ID');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      allowedMethods: ['POST']
    });
  }
  
  try {
    // Extract member info from request
    const memberId = req.headers['x-member-id'] || req.body?.memberId;
    const memberData = req.body?.memberData || {};
    
    if (!memberId) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Member ID required. Provide x-member-id header or memberId in body.'
      });
    }
    
    // Generate token
    const result = await generateUnitToken(memberId, memberData);
    
    // Log for audit (don't log sensitive data in production)
    console.log(`[Unit Token] Success - Member: ${memberId}, Env: ${UNIT_CONFIG.ENVIRONMENT}`);
    
    return res.status(200).json({
      success: true,
      token: result.token,
      customerId: result.customerId,
      expiresIn: UNIT_CONFIG.TOKEN_EXPIRY,
      expiresAt: new Date(result.expiresAt).toISOString(),
      environment: UNIT_CONFIG.ENVIRONMENT
    });
    
  } catch (error) {
    console.error('[Unit Token] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Token generation failed',
      message: UNIT_CONFIG.ENVIRONMENT === 'production' 
        ? 'Internal server error' 
        : error.message,
      environment: UNIT_CONFIG.ENVIRONMENT
    });
  }
}

// Express route setup helper
function setupRoute(app, path = '/api/unit-token') {
  app.post(path, handler);
  app.options(path, handler);
  console.log(`[Unit Token] Route registered: POST ${path}`);
}

// Module exports
module.exports = handler;
module.exports.handler = handler;
module.exports.setupRoute = setupRoute;
module.exports.generateUnitToken = generateUnitToken;
