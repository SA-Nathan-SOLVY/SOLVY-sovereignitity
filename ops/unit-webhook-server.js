/**
 * Unit.co Webhook Handler
 * Receives callbacks from Unit when customer/account/application events occur
 */

const express = require('express');
const crypto = require('crypto');

// Webhook secret from Unit dashboard (set this in .env for production)
const WEBHOOK_SECRET = process.env.UNIT_WEBHOOK_SECRET || 'your-webhook-secret';

// In-memory store for recent events (use Redis/DB in production)
const recentEvents = new Map();
const MAX_EVENTS = 1000;

/**
 * Verify Unit webhook signature
 */
function verifyWebhookSignature(payload, signature, secret) {
  if (!signature || !secret) return true; // Skip verification in sandbox
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Handle incoming Unit webhooks
 */
async function handleWebhook(req, res) {
  const signature = req.headers['x-unit-signature'];
  const payload = JSON.stringify(req.body);
  
  // Verify signature (skip in sandbox)
  if (process.env.NODE_ENV === 'production') {
    if (!verifyWebhookSignature(payload, signature, WEBHOOK_SECRET)) {
      console.error('[Webhook] Invalid signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }
  }
  
  const event = req.body;
  const eventId = event.data?.id || Date.now();
  
  // Deduplicate events
  if (recentEvents.has(eventId)) {
    return res.status(200).json({ received: true, duplicate: true });
  }
  
  // Store event
  recentEvents.set(eventId, {
    ...event,
    receivedAt: new Date().toISOString()
  });
  
  // Cleanup old events
  if (recentEvents.size > MAX_EVENTS) {
    const firstKey = recentEvents.keys().next().value;
    recentEvents.delete(firstKey);
  }
  
  // Process event based on type
  const eventType = event.data?.type;
  console.log('[Webhook] Received:', eventType, eventId);
  
  switch (eventType) {
    case 'customer.created':
      await handleCustomerCreated(event.data);
      break;
    case 'customer.updated':
      await handleCustomerUpdated(event.data);
      break;
    case 'application.approved':
      await handleApplicationApproved(event.data);
      break;
    case 'application.denied':
      await handleApplicationDenied(event.data);
      break;
    case 'account.opened':
      await handleAccountOpened(event.data);
      break;
    case 'card.activated':
      await handleCardActivated(event.data);
      break;
    default:
      console.log('[Webhook] Unhandled event type:', eventType);
  }
  
  res.status(200).json({ received: true });
}

// Event handlers
async function handleCustomerCreated(data) {
  console.log('[Webhook] Customer created:', data.id);
  // TODO: Store in database, send welcome email
  // await db.customers.insert({...})
  // await sendEmail('welcome', data.attributes.email)
}

async function handleCustomerUpdated(data) {
  console.log('[Webhook] Customer updated:', data.id);
  // TODO: Update customer record
}

async function handleApplicationApproved(data) {
  console.log('[Webhook] Application approved:', data.id);
  // TODO: Notify user, update status
}

async function handleApplicationDenied(data) {
  console.log('[Webhook] Application denied:', data.id);
  // TODO: Notify user with reason
}

async function handleAccountOpened(data) {
  console.log('[Webhook] Account opened:', data.id);
  // TODO: Update member status, send congratulations
}

async function handleCardActivated(data) {
  console.log('[Webhook] Card activated:', data.id);
  // TODO: Update card status, notify user
}

// Routes
module.exports = (app) => {
  // Unit webhook endpoint
  app.post('/api/webhooks/unit', express.raw({ type: 'application/json' }), handleWebhook);
  
  // Get recent events (for debugging)
  app.get('/api/webhooks/unit/events', (req, res) => {
    const events = Array.from(recentEvents.values()).reverse();
    res.json({ events, count: events.length });
  });
  
  // Health check
  app.get('/api/webhooks/unit/health', (req, res) => {
    res.json({ status: 'ok', eventsStored: recentEvents.size });
  });
};
