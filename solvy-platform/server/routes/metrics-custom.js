/**
 * SOLVY Ecosystem™ — Custom Prometheus Metrics Endpoint
 * =====================================================
 * Exposes application-level metrics for Prometheus scraping.
 *
 * Metrics exposed:
 *   - solvy_http_requests_total    — HTTP request counter (by method, route, status)
 *   - solvy_http_request_duration  — Request latency histogram
 *   - solvy_active_members         — Gauge of active members (from DB)
 *   - solvy_total_volume           — Gauge of total transaction volume
 *   - solvy_interchange_total      — Gauge of total interchange earned
 *   - solvy_support_tickets_open   — Gauge of open support tickets
 *
 * Installation:
 *   1. npm install prom-client
 *   2. Add this file to your server
 *   3. Import and register in server/index.js
 *
 * Scraped by Prometheus job: "solvy-backend" (see monitoring/prometheus/prometheus.yml)
 */

const client = require('prom-client');
const express = require('express');
const db = require('../db');

const router = express.Router();

// ----------------------------------------------------------
// Create a Registry for SOLVY metrics
// ----------------------------------------------------------
const register = new client.Registry();

// Default metrics (Node.js runtime: memory, CPU, event loop, etc.)
client.collectDefaultMetrics({
  register,
  prefix: 'solvy_nodejs_',
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
});

// ----------------------------------------------------------
// Custom SOLVY Metrics
// ----------------------------------------------------------

// HTTP request counter
const httpRequestsTotal = new client.Counter({
  name: 'solvy_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

// HTTP request duration histogram
const httpRequestDuration = new client.Histogram({
  name: 'solvy_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

// Active members gauge (updated on each scrape)
const activeMembersGauge = new client.Gauge({
  name: 'solvy_active_members',
  help: 'Number of active members (unique member_id_hash in last 30 days)',
  registers: [register],
});

// Total transaction volume gauge
const totalVolumeGauge = new client.Gauge({
  name: 'solvy_total_volume',
  help: 'Total transaction volume across all members (USD)',
  registers: [register],
});

// Total interchange gauge
const totalInterchangeGauge = new client.Gauge({
  name: 'solvy_interchange_total',
  help: 'Total interchange revenue (USD)',
  registers: [register],
});

// Member pool share gauge
const memberPoolGauge = new client.Gauge({
  name: 'solvy_member_pool_usd',
  help: 'Total member pool share (70% of interchange)',
  registers: [register],
});

// Open support tickets gauge
const supportTicketsGauge = new client.Gauge({
  name: 'solvy_support_tickets_open',
  help: 'Number of open support tickets',
  registers: [register],
});

// ----------------------------------------------------------
// Middleware: Record HTTP metrics for every request
// ----------------------------------------------------------
function metricsMiddleware(req, res, next) {
  // Skip metrics endpoint itself to avoid loops
  if (req.path === '/metrics') {
    return next();
  }

  const start = Date.now();
  const route = req.route ? req.route.path : req.path;

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const labels = {
      method: req.method,
      route: route,
      status_code: res.statusCode,
    };

    httpRequestsTotal.inc(labels);
    httpRequestDuration.observe(labels, duration);
  });

  next();
}

// ----------------------------------------------------------
// Update gauges from SQLite before each scrape
// ----------------------------------------------------------
async function updateCustomMetrics() {
  try {
    // Active members (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const activeRow = db.prepare(
      'SELECT COUNT(DISTINCT member_id_hash) as count FROM member_aggregates WHERE timestamp >= ?'
    ).get(thirtyDaysAgo);
    activeMembersGauge.set(activeRow?.count || 0);

    // Total volume & interchange (all time)
    const summaryRow = db.prepare(
      'SELECT SUM(total_volume) as volume, SUM(total_interchange) as interchange, SUM(member_pool_share) as pool FROM member_aggregates'
    ).get();
    totalVolumeGauge.set(summaryRow?.volume || 0);
    totalInterchangeGauge.set(summaryRow?.interchange || 0);
    memberPoolGauge.set(summaryRow?.pool || 0);

    // Open support tickets
    const ticketRow = db.prepare(
      "SELECT COUNT(*) as count FROM support_tickets WHERE status != 'resolved' AND status != 'closed'"
    ).get();
    supportTicketsGauge.set(ticketRow?.count || 0);

  } catch (err) {
    // Fail silently — metrics should never break the app
    console.error('[Metrics] Failed to update custom gauges:', err.message);
  }
}

// ----------------------------------------------------------
// /metrics endpoint — scraped by Prometheus
// ----------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    // Update dynamic gauges before serving
    await updateCustomMetrics();

    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    console.error('[Metrics] Error serving /metrics:', err);
    res.status(500).end(err.message);
  }
});

// ----------------------------------------------------------
// Exports
// ----------------------------------------------------------
module.exports = {
  router,
  metricsMiddleware,
  register,
};
