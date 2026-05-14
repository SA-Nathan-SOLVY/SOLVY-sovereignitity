/**
 * SOLVY Metrics Server — Main Entry Point
 * ============================================================
 * Data Sovereignty Guarantee:
 * This server ONLY stores anonymized, aggregated metrics.
 * Individual transaction data (merchant names, exact timestamps,
 * transaction IDs) is NEVER received, stored, or processed.
 *
 * The server stores:
 *   - total_volume, transaction_count, category_sums
 *   - member_id_hash (SHA-256, irreversible)
 *   - period totals and timestamps
 *
 * The server NEVER stores:
 *   - Individual transaction details
 *   - Merchant names or locations
 *   - Exact transaction timestamps
 *   - Raw member identifiers (email, name, etc.)
 * ============================================================
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const metricsRoutes = require('./routes/metrics');
const supportRoutes = require('./routes/support');

// Prometheus metrics (optional — install with: npm install prom-client)
let customMetrics = null;
try {
  customMetrics = require('./routes/metrics-custom');
  console.log('[METRICS] Prometheus custom metrics loaded');
} catch (err) {
  console.log('[METRICS] prom-client not installed — custom metrics disabled');
  console.log('[METRICS] Run: npm install prom-client  to enable');
}

const app = express();

// ============================================================================
// PROMETHEUS METRICS MIDDLEWARE (must be first to capture all requests)
// ============================================================================
if (customMetrics) {
  app.use(customMetrics.metricsMiddleware);
  app.use('/metrics', customMetrics.router);
  console.log('[METRICS] /metrics endpoint registered for Prometheus scraping');
}

// ============================================================================
// STATIC FILES (Admin dashboard, etc.)
// ============================================================================
app.use(express.static('public'));

// ============================================================================
// SECURITY MIDDLEWARE
// ============================================================================

// Helmet for secure HTTP headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"]
    }
  }
}));

// CORS — only allow configured origins
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., mobile apps, curl)
    if (!origin) return callback(null, true);

    if (config.cors.origins.includes(origin) || config.isDevelopment) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.security.rateLimitWindowMs,
  max: config.security.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      status: 'error',
      message: 'Too many requests — please slow down'
    });
  }
});
app.use(limiter);

// Body parser — aggregates are small, keep limit tight
app.use(express.json({ limit: '10kb' }));

// ============================================================================
// ROUTES
// ============================================================================

app.use('/api', metricsRoutes);
app.use('/api', supportRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'SOLVY Metrics API',
    version: '1.0.0',
    description: 'Anonymized aggregate metrics server — individual data never stored',
    endpoints: {
      health: 'GET /health',
      submitMetrics: 'POST /api/metrics',
      listMetrics: 'GET /api/metrics',
      summary: 'GET /api/metrics/summary'
    },
    dataSovereignty: true,
    documentation: 'See README.md'
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint not found'
  });
});

// Global error handler — never leak internal details
app.use((err, req, res, next) => {
  console.error('[SERVER] Unhandled error:', err);

  // Log stack trace in development only
  if (config.isDevelopment) {
    console.error(err.stack);
  }

  res.status(err.status || 500).json({
    status: 'error',
    message: config.isDevelopment ? err.message : 'Internal server error'
  });
});

// ============================================================================
// START SERVER
// ============================================================================

function start() {
  app.listen(config.port, () => {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║  SOLVY Ecosystem™ — Metrics API Server                     ║');
    console.log('║  Data Sovereignty: Individual transactions NEVER stored    ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log(`║  Port:      ${config.port.toString().padEnd(52)} ║`);
    console.log(`║  Database:  ${config.database.url.padEnd(52)} ║`);
    console.log(`║  Mode:      ${config.nodeEnv.padEnd(52)} ║`);
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('');
  });
}

// Auto-start if run directly
if (require.main === module) {
  start();
}

module.exports = { app, start };
