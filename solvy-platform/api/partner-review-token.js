/**
 * SOLVY Cooperative - Partner Review Token API
 * 
 * Generates temporary access tokens for Unit.co partner review
 * Allows Unit.co underwriting team to review the app without creating production accounts
 * 
 * @route POST /api/partner-review-token
 * @body { reviewType: 'underwriting' | 'app' | 'onboarding', reviewerEmail: string }
 * @returns { token: string, reviewUrl: string, expiresAt: string }
 */

const crypto = require('crypto');

// Review configuration
const REVIEW_CONFIG = {
  // Secret for signing review tokens (set in .env)
  REVIEW_SECRET: process.env.SOLVY_REVIEW_SECRET || 'solvy-review-local-only',
  
  // Token expiration (24 hours for review)
  TOKEN_EXPIRY_MS: 24 * 60 * 60 * 1000,
  
  // Allowed reviewer domains
  ALLOWED_DOMAINS: [
    'unit.co',
    'threadbank.com',
  ],
  
  // Review types and their URLs
  REVIEW_URLS: {
    underwriting: 'https://solvy.cards/underwriting',
    app: 'https://ebl.beauty',
    onboarding: 'https://ebl.beauty/onboarding',
    ios: 'https://solvy.cards/card-ios-app',
    android: 'https://solvy.cards/card-android-app'
  }
};

// In-memory review session tracking (use DB in production)
const reviewSessions = new Map();

/**
 * Generate partner review token
 * 
 * @param {string} reviewerEmail - Unit.co reviewer email
 * @param {string} reviewType - Type of review (underwriting, app, onboarding)
 * @param {string} staffCode - Internal staff verification code
 * @returns {Object} Review session with token and URL
 */
async function generateReviewToken(reviewerEmail, reviewType = 'underwriting', staffCode = null) {
  try {
    // Validate reviewer email domain
    const domain = reviewerEmail.split('@')[1];
    if (!REVIEW_CONFIG.ALLOWED_DOMAINS.some(d => domain.toLowerCase().endsWith(d))) {
      throw new Error('Invalid reviewer domain. Must be a Unit.co or Thread Bank email.');
    }
    
    // Validate staff code (if configured)
    if (process.env.SOLVY_REVIEW_STAFF_CODE && staffCode !== process.env.SOLVY_REVIEW_STAFF_CODE) {
      throw new Error('Invalid staff code');
    }
    
    // Generate unique review session
    const sessionId = crypto.randomUUID();
    const token = crypto.createHmac('sha256', REVIEW_CONFIG.REVIEW_SECRET)
      .update(`${sessionId}:${reviewerEmail}:${Date.now()}`)
      .digest('hex');
    
    const expiresAt = Date.now() + REVIEW_CONFIG.TOKEN_EXPIRY_MS;
    
    // Create review session
    const session = {
      sessionId,
      token,
      reviewerEmail,
      reviewType,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(expiresAt).toISOString(),
      status: 'active',
      reviewUrl: REVIEW_CONFIG.REVIEW_URLS[reviewType] || REVIEW_CONFIG.REVIEW_URLS.underwriting
    };
    
    reviewSessions.set(token, session);
    
    console.log(`[Partner Review] Created session for ${reviewerEmail} - Type: ${reviewType}`);
    
    return {
      success: true,
      token,
      reviewUrl: `${session.reviewUrl}?review_token=${token}&reviewer=${encodeURIComponent(reviewerEmail)}`,
      directUrl: session.reviewUrl,
      expiresAt: session.expiresAt,
      sessionId
    };
    
  } catch (error) {
    console.error('[Partner Review] Token generation failed:', error);
    throw error;
  }
}

/**
 * Validate review token
 * 
 * @param {string} token - Review token from URL
 * @returns {Object} Session info or null if invalid
 */
function validateReviewToken(token) {
  const session = reviewSessions.get(token);
  
  if (!session) {
    return { valid: false, reason: 'Token not found' };
  }
  
  if (new Date(session.expiresAt) < new Date()) {
    return { valid: false, reason: 'Token expired' };
  }
  
  if (session.status !== 'active') {
    return { valid: false, reason: 'Session revoked' };
  }
  
  return { 
    valid: true, 
    reviewerEmail: session.reviewerEmail,
    reviewType: session.reviewType,
    expiresAt: session.expiresAt
  };
}

/**
 * Express route handler for /api/partner-review-token
 */
async function handler(req, res) {
  // CORS
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['https://ebl.beauty', 'https://solvy.cards', 'http://localhost:3000'];
    
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { reviewerEmail, reviewType, staffCode } = req.body || {};
    
    if (!reviewerEmail) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'reviewerEmail is required'
      });
    }
    
    const result = await generateReviewToken(reviewerEmail, reviewType, staffCode);
    
    return res.status(200).json(result);
    
  } catch (error) {
    console.error('[Partner Review] Error:', error);
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
}

// Express route setup
function setupRoute(app, path = '/api/partner-review-token') {
  app.post(path, handler);
  app.options(path, handler);
  console.log(`[Partner Review] Route registered: POST ${path}`);
}

module.exports = handler;
module.exports.handler = handler;
module.exports.setupRoute = setupRoute;
module.exports.generateReviewToken = generateReviewToken;
module.exports.validateReviewToken = validateReviewToken;
