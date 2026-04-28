/**
 * SOLVY PWA - Metrics API Endpoint
 * Phase 3 & 4: Anonymized Aggregated Metrics + Threshold-Based Triggers
 * 
 * Node.js/Express backend API for receiving and serving aggregated metrics
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// ============================================
// IN-MEMORY STORAGE (Replace with database in production)
// ============================================

const cooperativeMetrics = {
  totalVolume: 0,
  totalTransactionCount: 0,
  uniqueMemberHashes: new Set(),
  categoryTotals: {},
  lastUpdated: null,
  thresholdHistory: {}
};

// ============================================
// MIDDLEWARE
// ============================================

/**
 * Validate that request contains only aggregates
 * Rejects any request with individual transaction data
 */
const validateAggregatesOnly = (req, res, next) => {
  // List of fields that indicate individual transaction data
  const prohibitedFields = [
    'transactions',
    'transactionDetails',
    'transactionId',
    'merchantId',
    'merchantName',
    'cardNumber',
    'cardLastFour',
    'individualTransactions'
  ];
  
  const bodyFields = Object.keys(req.body);
  
  for (const field of prohibitedFields) {
    if (bodyFields.includes(field) || req.body[field] !== undefined) {
      return res.status(400).json({ 
        error: 'Individual transaction data not accepted. Send aggregates only.',
        rejectedField: field,
        acceptedFields: [
          'totalVolume',
          'transactionCount',
          'categorySums',
          'uniqueCategories',
          'recentVolume',
          'recentTransactionCount',
          'memberHash',
          'timestamp'
        ]
      });
    }
  }
  
  next();
};

/**
 * Rate limiting middleware (simple implementation)
 * In production, use express-rate-limit
 */
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per window

const rateLimiter = (req, res, next) => {
  const clientIp = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!rateLimit.has(clientIp)) {
    rateLimit.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }
  
  const clientLimit = rateLimit.get(clientIp);
  
  if (now > clientLimit.resetTime) {
    rateLimit.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }
  
  if (clientLimit.count >= RATE_LIMIT_MAX) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      retryAfter: Math.ceil((clientLimit.resetTime - now) / 1000)
    });
  }
  
  clientLimit.count++;
  next();
};

// ============================================
// ROUTES
// ============================================

/**
 * POST /api/metrics
 * Receive aggregated metrics from clients
 * Only accepts anonymized aggregate data
 */
router.post('/metrics', 
  rateLimiter,
  validateAggregatesOnly,
  async (req, res) => {
    try {
      const { 
        totalVolume, 
        transactionCount, 
        categorySums, 
        uniqueCategories,
        recentVolume,
        recentTransactionCount,
        memberHash,
        timestamp 
      } = req.body;
      
      // Validate required fields
      if (typeof totalVolume !== 'number' || typeof transactionCount !== 'number') {
        return res.status(400).json({
          error: 'Missing required fields: totalVolume and transactionCount must be numbers'
        });
      }
      
      // Validate memberHash format (should be hex string)
      if (!memberHash || !/^[a-f0-9]{64}$/i.test(memberHash)) {
        return res.status(400).json({
          error: 'Invalid memberHash. Must be a valid SHA-256 hash (64 hex characters).'
        });
      }
      
      // Idempotent update - check if we've seen this memberHash recently
      const isNewMember = !cooperativeMetrics.uniqueMemberHashes.has(memberHash);
      
      // Update running totals
      cooperativeMetrics.totalVolume += totalVolume;
      cooperativeMetrics.totalTransactionCount += transactionCount;
      cooperativeMetrics.uniqueMemberHashes.add(memberHash);
      cooperativeMetrics.lastUpdated = new Date().toISOString();
      
      // Update category totals
      if (categorySums && typeof categorySums === 'object') {
        for (const [category, amount] of Object.entries(categorySums)) {
          if (typeof amount === 'number') {
            cooperativeMetrics.categoryTotals[category] = 
              (cooperativeMetrics.categoryTotals[category] || 0) + amount;
          }
        }
      }
      
      // Check for threshold crossings
      const thresholdNotifications = checkThresholds();
      
      // Log for monitoring (in production, use proper logging)
      console.log(`[Metrics] Received from member: ${memberHash.substring(0, 16)}...`, {
        isNewMember,
        totalVolume,
        transactionCount,
        newTotalVolume: cooperativeMetrics.totalVolume,
        memberCount: cooperativeMetrics.uniqueMemberHashes.size
      });
      
      res.json({ 
        success: true,
        received: {
          totalVolume,
          transactionCount,
          memberHash: memberHash.substring(0, 16) + '...'
        },
        cooperativeTotals: {
          totalVolume: cooperativeMetrics.totalVolume,
          totalTransactionCount: cooperativeMetrics.totalTransactionCount,
          uniqueMembers: cooperativeMetrics.uniqueMemberHashes.size
        },
        notifications: thresholdNotifications,
        isNewMember
      });
      
    } catch (error) {
      console.error('[Metrics] Error processing metrics:', error);
      res.status(500).json({ 
        error: 'Failed to process metrics',
        message: error.message 
      });
    }
  }
);

/**
 * GET /api/cooperative/metrics
 * Public cumulative totals for threshold monitoring
 */
router.get('/cooperative/metrics', async (req, res) => {
  try {
    // Return public metrics
    const metrics = {
      totalVolume: Math.round(cooperativeMetrics.totalVolume * 100) / 100,
      memberCount: cooperativeMetrics.uniqueMemberHashes.size,
      totalTransactionCount: cooperativeMetrics.totalTransactionCount,
      categoryTotals: Object.fromEntries(
        Object.entries(cooperativeMetrics.categoryTotals).map(([k, v]) => [
          k, 
          Math.round(v * 100) / 100
        ])
      ),
      lastUpdated: cooperativeMetrics.lastUpdated,
      currentThresholds: cooperativeMetrics.thresholdHistory
    };
    
    // Add cache headers for performance
    res.setHeader('Cache-Control', 'public, max-age=10');
    
    res.json(metrics);
    
  } catch (error) {
    console.error('[Metrics] Error retrieving metrics:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve metrics',
      message: error.message 
    });
  }
});

/**
 * GET /api/cooperative/metrics/stream
 * Server-Sent Events endpoint for real-time updates
 */
router.get('/cooperative/metrics/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Send initial data
  const sendUpdate = () => {
    const data = {
      totalVolume: cooperativeMetrics.totalVolume,
      memberCount: cooperativeMetrics.uniqueMemberHashes.size,
      timestamp: new Date().toISOString()
    };
    
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };
  
  sendUpdate();
  
  // Send updates every 30 seconds
  const intervalId = setInterval(sendUpdate, 30000);
  
  // Clean up on client disconnect
  req.on('close', () => {
    clearInterval(intervalId);
  });
});

/**
 * GET /api/cooperative/thresholds
 * Get all thresholds with their current status
 */
router.get('/cooperative/thresholds', (req, res) => {
  const THRESHOLDS = [
    { id: 'volume_50', type: 'volume', value: 500000, message: '50% to collective action!' },
    { id: 'volume_75', type: 'volume', value: 750000, message: '75% to collective action!' },
    { id: 'volume_100', type: 'volume', value: 1000000, message: 'Vote now: Pool data for better rates?' },
    { id: 'members_1000', type: 'member_count', value: 1000, message: 'New voting category available!' },
    { id: 'members_5000', type: 'member_count', value: 5000, message: 'Major milestone: 5,000 members!' },
    { id: 'members_10000', type: 'member_count', value: 10000, message: '10,000 members strong! 🎉' }
  ];
  
  const thresholdsWithStatus = THRESHOLDS.map(threshold => {
    const current = threshold.type === 'volume' 
      ? cooperativeMetrics.totalVolume 
      : cooperativeMetrics.uniqueMemberHashes.size;
    
    return {
      ...threshold,
      current: Math.round(current * 100) / 100,
      percentage: Math.min(100, Math.round((current / threshold.value) * 100)),
      achieved: current >= threshold.value,
      achievedAt: cooperativeMetrics.thresholdHistory[threshold.id] || null
    };
  });
  
  res.json({
    thresholds: thresholdsWithStatus,
    lastUpdated: cooperativeMetrics.lastUpdated
  });
});

/**
 * POST /api/cooperative/reset
 * Admin endpoint to reset metrics (for testing)
 * In production, require authentication
 */
router.post('/cooperative/reset', (req, res) => {
  // In production, add admin authentication here
  
  cooperativeMetrics.totalVolume = 0;
  cooperativeMetrics.totalTransactionCount = 0;
  cooperativeMetrics.uniqueMemberHashes.clear();
  cooperativeMetrics.categoryTotals = {};
  cooperativeMetrics.lastUpdated = new Date().toISOString();
  cooperativeMetrics.thresholdHistory = {};
  
  res.json({ 
    success: true, 
    message: 'Cooperative metrics reset' 
  });
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if any thresholds have been crossed
 * Returns array of notification objects
 */
function checkThresholds() {
  const THRESHOLDS = [
    { id: 'volume_50', type: 'volume', value: 500000 },
    { id: 'volume_75', type: 'volume', value: 750000 },
    { id: 'volume_100', type: 'volume', value: 1000000 },
    { id: 'members_1000', type: 'member_count', value: 1000 },
    { id: 'members_5000', type: 'member_count', value: 5000 },
    { id: 'members_10000', type: 'member_count', value: 10000 }
  ];
  
  const notifications = [];
  
  for (const threshold of THRESHOLDS) {
    const current = threshold.type === 'volume' 
      ? cooperativeMetrics.totalVolume 
      : cooperativeMetrics.uniqueMemberHashes.size;
    
    const previous = cooperativeMetrics.thresholdHistory[threshold.id] || 0;
    
    // Check if we just crossed this threshold
    if (current >= threshold.value && previous < threshold.value) {
      cooperativeMetrics.thresholdHistory[threshold.id] = current;
      
      notifications.push({
        thresholdId: threshold.id,
        type: threshold.type,
        value: threshold.value,
        current: current,
        crossed: true
      });
    }
  }
  
  return notifications;
}

// ============================================
// DATABASE ADAPTER INTERFACE
// ============================================

/**
 * Example database adapter for production use
 * Replace in-memory storage with actual database
 */
const dbAdapter = {
  /**
   * Add metrics to running totals
   * @param {Object} data - Metrics data
   */
  async addToTotals(data) {
    // Example implementation for PostgreSQL:
    /*
    const query = `
      INSERT INTO cooperative_metrics (member_hash, volume, transaction_count, categories, timestamp)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (member_hash) 
      DO UPDATE SET 
        volume = cooperative_metrics.volume + EXCLUDED.volume,
        transaction_count = cooperative_metrics.transaction_count + EXCLUDED.transaction_count,
        categories = cooperative_metrics.categories || EXCLUDED.categories,
        timestamp = NOW()
    `;
    await db.query(query, [
      data.memberHash,
      data.volume,
      data.count,
      JSON.stringify(data.categories)
    ]);
    */
    
    // Current in-memory implementation
    cooperativeMetrics.totalVolume += data.volume;
    cooperativeMetrics.totalTransactionCount += data.count;
    cooperativeMetrics.uniqueMemberHashes.add(data.memberHash);
    
    if (data.categories) {
      for (const [category, amount] of Object.entries(data.categories)) {
        cooperativeMetrics.categoryTotals[category] = 
          (cooperativeMetrics.categoryTotals[category] || 0) + amount;
      }
    }
    
    cooperativeMetrics.lastUpdated = new Date().toISOString();
  },
  
  /**
   * Get current totals
   * @returns {Object} - Current cooperative totals
   */
  async getTotals() {
    // Example implementation for PostgreSQL:
    /*
    const result = await db.query(`
      SELECT 
        SUM(volume) as total_volume,
        SUM(transaction_count) as total_transactions,
        COUNT(DISTINCT member_hash) as unique_members,
        JSON_OBJECT_AGG(category, amount) as category_totals
      FROM cooperative_metrics
      CROSS JOIN LATERAL jsonb_each_text(categories) AS cats(category, amount)
    `);
    return result.rows[0];
    */
    
    // Current in-memory implementation
    return {
      totalVolume: cooperativeMetrics.totalVolume,
      totalTransactionCount: cooperativeMetrics.totalTransactionCount,
      uniqueMemberHashes: cooperativeMetrics.uniqueMemberHashes.size,
      categoryTotals: cooperativeMetrics.categoryTotals,
      lastUpdated: cooperativeMetrics.lastUpdated,
      thresholdHistory: cooperativeMetrics.thresholdHistory
    };
  }
};

// ============================================
// EXPORT
// ============================================

module.exports = router;
module.exports.dbAdapter = dbAdapter;
module.exports.cooperativeMetrics = cooperativeMetrics;
