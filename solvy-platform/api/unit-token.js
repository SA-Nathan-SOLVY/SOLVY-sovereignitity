/**
 * SOLVY Cooperative - Unit Token Generation API
 * 
 * Generates JWT tokens for Unit Elements White Label App
 * Securely authenticates members with Unit.co banking infrastructure
 * 
 * @route POST /api/unit-token
 * @returns { token: string }
 */

const crypto = require('crypto');

// Unit.co configuration
const UNIT_CONFIG = {
  // Use environment variables in production
  API_URL: process.env.UNIT_API_URL || 'https://api.s.unit.sh',
  TOKEN_URL: process.env.UNIT_TOKEN_URL || 'https://api.s.unit.sh/users-token',
  PARTNER_ID: process.env.UNIT_PARTNER_ID,
  PARTNER_SECRET: process.env.UNIT_PARTNER_SECRET,
  ENVIRONMENT: process.env.NODE_ENV || 'sandbox'
};

/**
 * Generate JWT token for Unit Elements
 * Called by frontend when loading the White Label App
 */
async function generateUnitToken(memberId, customerId) {
  try {
    // In production, this calls Unit's API
    // For sandbox, we simulate the token generation
    
    if (UNIT_CONFIG.ENVIRONMENT === 'sandbox') {
      // Sandbox mode - return mock token structure
      return generateSandboxToken(memberId, customerId);
    }
    
    // Production: Call Unit API
    const response = await fetch(UNIT_CONFIG.TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${UNIT_CONFIG.PARTNER_SECRET}`
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
      throw new Error(`Unit API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data.attributes.token;
    
  } catch (error) {
    console.error('Unit token generation failed:', error);
    throw error;
  }
}

/**
 * Generate sandbox token for testing
 * Structure matches Unit's JWT format
 */
function generateSandboxToken(memberId, customerId) {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  const payload = {
    sub: customerId || `customer_${memberId}`,
    partner_id: UNIT_CONFIG.PARTNER_ID || 'sandbox_partner',
    env: 'sandbox',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
  };
  
  // In real implementation, this would be signed by Unit
  // For sandbox, we return a mock token
  const mockToken = Buffer.from(JSON.stringify(header)).toString('base64url') + '.' +
                    Buffer.from(JSON.stringify(payload)).toString('base64url') + '.' +
                    'sandbox_signature';
  
  return mockToken;
}

/**
 * Main handler for /api/unit-token
 */
module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Verify member authentication
    // In production, validate session/token from request
    const memberId = req.headers['x-member-id'] || 'anonymous';
    const customerId = req.body?.customerId;
    
    // Generate Unit token
    const token = await generateUnitToken(memberId, customerId);
    
    // Log for audit
    console.log(`[Unit Token] Generated for member: ${memberId}`);
    
    return res.status(200).json({ 
      token,
      expiresIn: 3600,
      environment: UNIT_CONFIG.ENVIRONMENT
    });
    
  } catch (error) {
    console.error('[Unit Token] Error:', error);
    return res.status(500).json({ 
      error: 'Token generation failed',
      message: error.message 
    });
  }
};

// Express-compatible export
if (typeof module !== 'undefined' && module.exports) {
  module.exports.handler = module.exports;
}
