/**
 * Data Pool API
 * Server-side API for temporary encrypted data pool
 * 
 * This module handles:
 * - Receiving encrypted data contributions
 * - Storing encrypted blobs with expiration
 * - Manager-only access to decrypted data
 * - Audit logging
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// ============================================================================
// MIDDLEWARE
// ============================================================================

/**
 * Authentication middleware - verifies member session
 */
const memberAuth = async (req, res, next) => {
  // Verify JWT or session token
  const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.session;
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    // Verify token and extract member ID
    // In production, use proper JWT verification
    const decoded = verifyToken(token); // Implementation depends on auth system
    req.memberId = decoded.memberId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid authentication' });
  }
};

/**
 * Manager authentication middleware - verifies cooperative manager status
 */
const managerAuth = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.session;
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    const decoded = verifyToken(token);
    
    // Check if user has manager role
    if (!decoded.roles?.includes('manager') && !decoded.isAdmin) {
      return res.status(403).json({ error: 'Manager access required' });
    }
    
    req.managerId = decoded.memberId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid authentication' });
  }
};

/**
 * Rate limiting middleware for contributions
 */
const contributionRateLimit = async (req, res, next) => {
  const memberHash = req.body.memberHash;
  const key = `contribution:${memberHash}:${req.body.proposalId}`;
  
  // Check if already contributed (using Redis or similar)
  const hasContributed = await checkRateLimit(key, 3600); // 1 hour cooldown
  
  if (hasContributed) {
    return res.status(429).json({ 
      error: 'Contribution already recorded for this proposal',
      retryAfter: 3600
    });
  }
  
  next();
};

// ============================================================================
// ROUTES
// ============================================================================

/**
 * POST /api/data-pool/contribute
 * Submit encrypted data to the temporary pool
 * 
 * Request body:
 * - proposalId: UUID of the proposal
 * - encryptedData: Base64-encoded encrypted payload
 * - memberHash: SHA-256 hash of member ID (for deduplication)
 * - contributedAt: ISO timestamp
 * - dataFingerprint: Hash of data for integrity verification
 */
router.post('/contribute', memberAuth, contributionRateLimit, async (req, res) => {
  const { proposalId, encryptedData, memberHash, contributedAt, dataFingerprint } = req.body;
  
  // Validate required fields
  if (!proposalId || !encryptedData || !memberHash) {
    return res.status(400).json({ 
      error: 'Missing required fields: proposalId, encryptedData, memberHash' 
    });
  }
  
  // Validate proposal exists and is active
  const proposal = await db.query(
    'SELECT id, status FROM proposals WHERE id = $1',
    [proposalId]
  );
  
  if (proposal.rows.length === 0) {
    return res.status(404).json({ error: 'Proposal not found' });
  }
  
  if (proposal.rows[0].status !== 'active') {
    return res.status(400).json({ error: 'Proposal is not accepting contributions' });
  }
  
  // Verify member hasn't already contributed to this pool
  const existing = await db.query(
    'SELECT id FROM data_pool_contributions WHERE proposal_id = $1 AND member_hash = $2',
    [proposalId, memberHash]
  );
  
  if (existing.rows.length > 0) {
    return res.status(409).json({ 
      error: 'Already contributed to this pool',
      contributionId: existing.rows[0].id
    });
  }
  
  // Calculate expiration date (30 days from now)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  
  try {
    // Store encrypted contribution
    const result = await db.query(
      `INSERT INTO data_pool_contributions 
       (proposal_id, member_hash, encrypted_data, data_fingerprint, contributed_at, expires_at, member_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, expires_at`,
      [proposalId, memberHash, encryptedData, dataFingerprint, contributedAt, expiresAt, req.memberId]
    );
    
    const contributionId = result.rows[0].id;
    
    // Log to audit trail
    await db.query(
      `INSERT INTO data_pool_audit_log 
       (event_type, proposal_id, member_hash, details, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [
        'CONTRIBUTION_CREATED',
        proposalId,
        memberHash,
        JSON.stringify({ 
          contributionId, 
          expiresAt,
          dataSize: encryptedData.length 
        })
      ]
    );
    
    res.status(201).json({
      success: true,
      contributionId,
      expiresAt: result.rows[0].expires_at,
      message: 'Contribution recorded successfully'
    });
    
  } catch (error) {
    console.error('Error storing contribution:', error);
    res.status(500).json({ error: 'Failed to store contribution' });
  }
});

/**
 * GET /api/data-pool/contributions/:proposalId
 * Get all decrypted contributions for a proposal (MANAGER ONLY)
 * 
 * Request body:
 * - decryptionKey: The pool decryption key (provided securely)
 */
router.get('/contributions/:proposalId', managerAuth, async (req, res) => {
  const { proposalId } = req.params;
  const { decryptionKey } = req.body;
  
  if (!decryptionKey) {
    return res.status(400).json({ error: 'Decryption key required' });
  }
  
  try {
    // Fetch all contributions for this proposal
    const contributions = await db.query(
      `SELECT id, member_hash, encrypted_data, data_fingerprint, 
              contributed_at, expires_at
       FROM data_pool_contributions 
       WHERE proposal_id = $1 AND expires_at > NOW()
       ORDER BY contributed_at ASC`,
      [proposalId]
    );
    
    // Decrypt each contribution
    const decryptedContributions = await Promise.all(
      contributions.rows.map(async (contribution) => {
        try {
          const decryptedData = await decryptData(
            contribution.encrypted_data, 
            decryptionKey
          );
          
          return {
            contributionId: contribution.id,
            memberHash: contribution.member_hash,
            contributedAt: contribution.contributed_at,
            expiresAt: contribution.expires_at,
            data: decryptedData
          };
        } catch (error) {
          // Log decryption failure but don't expose details
          await db.query(
            `INSERT INTO data_pool_audit_log 
             (event_type, proposal_id, details, created_at)
             VALUES ($1, $2, $3, NOW())`,
            [
              'DECRYPTION_FAILED',
              proposalId,
              JSON.stringify({ 
                contributionId: contribution.id,
                error: error.message 
              })
            ]
          );
          
          return {
            contributionId: contribution.id,
            memberHash: contribution.member_hash,
            contributedAt: contribution.contributed_at,
            error: 'Decryption failed'
          };
        }
      })
    );
    
    // Log access
    await db.query(
      `INSERT INTO data_pool_audit_log 
       (event_type, proposal_id, member_hash, details, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [
        'MANAGER_ACCESS',
        proposalId,
        await hashMemberId(req.managerId),
        JSON.stringify({ 
          contributionCount: contributions.rows.length,
          accessedAt: new Date().toISOString()
        })
      ]
    );
    
    res.json({
      proposalId,
      contributionCount: contributions.rows.length,
      contributions: decryptedContributions
    });
    
  } catch (error) {
    console.error('Error fetching contributions:', error);
    res.status(500).json({ error: 'Failed to fetch contributions' });
  }
});

/**
 * GET /api/data-pool/status/:proposalId
 * Get contribution status for current member
 */
router.get('/status/:proposalId', memberAuth, async (req, res) => {
  const { proposalId } = req.params;
  const memberHash = await hashMemberId(req.memberId);
  
  try {
    const result = await db.query(
      `SELECT contributed_at, expires_at 
       FROM data_pool_contributions 
       WHERE proposal_id = $1 AND member_hash = $2`,
      [proposalId, memberHash]
    );
    
    if (result.rows.length === 0) {
      return res.json({
        hasContributed: false,
        canContribute: true
      });
    }
    
    const contribution = result.rows[0];
    const isExpired = new Date(contribution.expires_at) < new Date();
    
    res.json({
      hasContributed: true,
      canContribute: isExpired, // Can contribute again if expired
      contributedAt: contribution.contributed_at,
      expiresAt: contribution.expires_at,
      isExpired
    });
    
  } catch (error) {
    console.error('Error checking contribution status:', error);
    res.status(500).json({ error: 'Failed to check status' });
  }
});

/**
 * GET /api/data-pool/stats/:proposalId
 * Get aggregate statistics for a proposal (MANAGER ONLY)
 * Returns counts and metadata without exposing individual contributions
 */
router.get('/stats/:proposalId', managerAuth, async (req, res) => {
  const { proposalId } = req.params;
  
  try {
    const result = await db.query(
      `SELECT 
        COUNT(*) as total_contributions,
        COUNT(CASE WHEN expires_at > NOW() THEN 1 END) as active_contributions,
        MIN(contributed_at) as first_contribution,
        MAX(contributed_at) as last_contribution,
        MIN(expires_at) as next_expiration
       FROM data_pool_contributions 
       WHERE proposal_id = $1`,
      [proposalId]
    );
    
    const stats = result.rows[0];
    
    res.json({
      proposalId,
      totalContributions: parseInt(stats.total_contributions),
      activeContributions: parseInt(stats.active_contributions),
      firstContribution: stats.first_contribution,
      lastContribution: stats.last_contribution,
      nextExpiration: stats.next_expiration
    });
    
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

/**
 * GET /api/data-pool/key
 * Get pool encryption key (requires special authorization)
 * In production, this should use a more secure key exchange mechanism
 */
router.get('/key', memberAuth, async (req, res) => {
  const { proposalId } = req.query;
  
  if (!proposalId) {
    return res.status(400).json({ error: 'proposalId required' });
  }
  
  try {
    // Verify member is eligible to contribute to this proposal
    const memberHash = await hashMemberId(req.memberId);
    
    const hasVoted = await db.query(
      'SELECT 1 FROM votes WHERE proposal_id = $1 AND member_hash = $2',
      [proposalId, memberHash]
    );
    
    if (hasVoted.rows.length === 0) {
      return res.status(403).json({ 
        error: 'Must vote on proposal before accessing pool key' 
      });
    }
    
    // In production, use a proper key management service
    // This is a simplified example - the key should be encrypted
    // with the member's public key or delivered via secure channel
    const poolKey = await getPoolKey(proposalId);
    
    res.json({
      key: poolKey,
      expiresIn: 3600 // Key valid for 1 hour
    });
    
  } catch (error) {
    console.error('Error retrieving pool key:', error);
    res.status(500).json({ error: 'Failed to retrieve pool key' });
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Decrypt data using AES-256-GCM
 * @param {string} encryptedData - Base64-encoded encrypted data
 * @param {string} key - Decryption key
 * @returns {Promise<Object>} - Decrypted data
 */
async function decryptData(encryptedData, key) {
  // Decode base64
  const combined = Buffer.from(encryptedData, 'base64');
  
  // Extract IV (12 bytes) and ciphertext
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  
  // Derive key using SHA-256 (same as client)
  const keyBuffer = crypto.createHash('sha256').update(key).digest();
  
  // Create decipher
  const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, iv);
  
  // Decrypt
  let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  
  // Parse JSON
  return JSON.parse(decrypted);
}

/**
 * Hash member ID using SHA-256
 * @param {string} memberId - Member ID
 * @returns {Promise<string>} - Hex-encoded hash
 */
async function hashMemberId(memberId) {
  return crypto.createHash('sha256').update(memberId).digest('hex');
}

/**
 * Get pool encryption key
 * In production, integrate with AWS KMS, HashiCorp Vault, etc.
 * @param {string} proposalId - Proposal ID
 * @returns {Promise<string>} - Pool key
 */
async function getPoolKey(proposalId) {
  // Retrieve or generate key for this proposal
  // This is a placeholder - implement proper key management
  const keyRecord = await db.query(
    'SELECT key FROM data_pool_keys WHERE proposal_id = $1 AND active = true',
    [proposalId]
  );
  
  if (keyRecord.rows.length === 0) {
    throw new Error('No active key found for this proposal');
  }
  
  return keyRecord.rows[0].key;
}

/**
 * Placeholder for token verification
 * Implement based on your authentication system
 */
function verifyToken(token) {
  // Use your JWT library here
  // Example with jsonwebtoken:
  // return jwt.verify(token, process.env.JWT_SECRET);
  throw new Error('Token verification not implemented');
}

/**
 * Placeholder for rate limit check
 * Implement using Redis or similar
 */
async function checkRateLimit(key, ttl) {
  // Example with Redis:
  // const exists = await redis.get(key);
  // if (!exists) await redis.setex(key, ttl, '1');
  // return !!exists;
  return false;
}

// ============================================================================
// DATABASE SCHEMA (for reference)
// ============================================================================

const SCHEMA = `
-- Data pool contributions table
CREATE TABLE data_pool_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  member_hash VARCHAR(64) NOT NULL,  -- SHA-256 for deduplication
  encrypted_data TEXT NOT NULL,  -- Base64 encoded, encrypted blob
  data_fingerprint VARCHAR(16),  -- For integrity verification
  contributed_at TIMESTAMP NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  member_id UUID,  -- Optional: actual member ID for internal use
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(proposal_id, member_hash)
);

-- Data pool audit log
CREATE TABLE data_pool_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,
  proposal_id UUID REFERENCES proposals(id),
  member_hash VARCHAR(64),
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Data pool keys (managed by system)
CREATE TABLE data_pool_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID REFERENCES proposals(id),
  key VARCHAR(255) NOT NULL,  -- In production, encrypt this column
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  rotated_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_data_pool_proposal ON data_pool_contributions(proposal_id);
CREATE INDEX idx_data_pool_member ON data_pool_contributions(member_hash);
CREATE INDEX idx_data_pool_expires ON data_pool_contributions(expires_at);
CREATE INDEX idx_data_pool_audit_proposal ON data_pool_audit_log(proposal_id);
`;

// Export router
module.exports = router;
module.exports.SCHEMA = SCHEMA;
