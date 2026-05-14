/**
 * SOLVY Metrics Server — Routes
 * POST /api/metrics — Receive aggregated metrics from members
 * GET /api/metrics/summary — Admin dashboard summary (API key protected)
 * GET /health — Health check for load balancers
 */

const express = require('express');
const router = express.Router();
const AggregatedMetric = require('../models/AggregatedMetric');
const config = require('../config');

// ============================================================================
// SECURITY HELPERS
// ============================================================================

/**
 * Middleware: validate admin API key for protected endpoints
 */
function requireApiKey(req, res, next) {
  const providedKey = req.headers.authorization?.replace(/^Bearer\s+/i, '')
    || req.headers['x-api-key'];

  if (!providedKey || providedKey !== config.security.adminApiKey) {
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized — valid API key required'
    });
  }

  next();
}

/**
 * Middleware: reject requests containing individual transaction data
 */
function rejectIndividualData(req, res, next) {
  const rejection = AggregatedMetric.validateForIndividualData(req.body);
  if (rejection) {
    console.warn('[SECURITY] Rejected payload with individual data:', rejection.error);
    return res.status(400).json({
      status: 'error',
      message: rejection.error
    });
  }
  next();
}

// ============================================================================
// ROUTES
// ============================================================================

/**
 * POST /api/metrics
 * Receive anonymized aggregated metrics from a member's device.
 * Stores only totals — never individual transaction data.
 */
router.post('/metrics', rejectIndividualData, (req, res) => {
  try {
    const body = req.body;

    // Validate required fields
    const required = [
      'memberIdHash', 'totalVolume', 'transactionCount',
      'categorySums', 'totalInterchange', 'memberPoolShare',
      'periodStart', 'periodEnd'
    ];
    const missing = required.filter(field => body[field] === undefined);
    if (missing.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: `Missing required fields: ${missing.join(', ')}`
      });
    }

    // Validate types
    if (typeof body.totalVolume !== 'number' || body.totalVolume < 0) {
      return res.status(400).json({ status: 'error', message: 'totalVolume must be a non-negative number' });
    }
    if (!Number.isInteger(body.transactionCount) || body.transactionCount < 0) {
      return res.status(400).json({ status: 'error', message: 'transactionCount must be a non-negative integer' });
    }
    if (typeof body.categorySums !== 'object' || Array.isArray(body.categorySums)) {
      return res.status(400).json({ status: 'error', message: 'categorySums must be an object' });
    }
    if (typeof body.memberIdHash !== 'string' || body.memberIdHash.length < 16) {
      return res.status(400).json({ status: 'error', message: 'memberIdHash must be a valid hash string' });
    }

    // Store the aggregated metric
    const record = AggregatedMetric.create({
      memberIdHash: body.memberIdHash,
      timestamp: body.timestamp || new Date().toISOString(),
      totalVolume: body.totalVolume,
      transactionCount: body.transactionCount,
      categorySums: body.categorySums,
      totalInterchange: body.totalInterchange,
      memberPoolShare: body.memberPoolShare,
      periodStart: body.periodStart,
      periodEnd: body.periodEnd,
      clientVersion: body.clientVersion || null
    });

    console.log(`[API] Stored aggregate for member ${record.memberIdHash.substring(0, 8)}... volume=$${record.totalVolume}`);

    return res.status(201).json({
      status: 'accepted',
      recordId: record.id,
      receivedAt: record.receivedAt
    });

  } catch (error) {
    console.error('[API] Error storing metrics:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

/**
 * GET /api/metrics
 * Retrieve aggregated metrics with optional filtering.
 * Protected by API key.
 */
router.get('/metrics', requireApiKey, (req, res) => {
  try {
    const filters = {
      memberIdHash: req.query.memberHash || null,
      startDate: req.query.startDate || null,
      endDate: req.query.endDate || null,
      limit: req.query.limit || 100,
      offset: req.query.offset || 0
    };

    const records = AggregatedMetric.findAll(filters);
    const count = AggregatedMetric.count(filters);

    return res.json({
      status: 'ok',
      count,
      aggregates: records
    });

  } catch (error) {
    console.error('[API] Error retrieving metrics:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

/**
 * GET /api/metrics/summary
 * Global summary across all members.
 * Returns only totals — never individual member data.
 * Protected by API key.
 */
router.get('/metrics/summary', requireApiKey, (req, res) => {
  try {
    const summary = AggregatedMetric.getSummary();

    return res.json({
      status: 'ok',
      ...summary
    });

  } catch (error) {
    console.error('[API] Error generating summary:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

/**
 * GET /health
 * Health check for load balancers and monitoring.
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'solvy-metrics-api',
    version: '1.0.0'
  });
});

module.exports = router;
