/**
 * Email API Routes — AgentMail Integration
 * SOLVY Ecosystem™
 *
 * Endpoints:
 *   POST /api/email/send-welcome        → Send welcome email
 *   POST /api/email/send-deposit        → Send deposit confirmation
 *   POST /api/email/send-pool-receipt   → Send data pool receipt
 *   POST /api/email/support-reply       → Send support reply
 *   GET  /api/email/support-inbox       → List support messages
 *   POST /webhooks/agentmail            → Receive AgentMail inbound emails
 */

const express = require('express');
const router = express.Router();
const {
  sendWelcomeEmail,
  sendDepositConfirmation,
  sendDataPoolReceipt,
  sendSupportReply,
  getSupportInboxMessages,
  handleInboundEmail,
} = require('./agentmail-service');

// ============================================================
// TRANSACTIONAL EMAIL ENDPOINTS
// ============================================================

/**
 * POST /api/email/send-welcome
 * Send welcome email to a new member
 */
router.post('/send-welcome', async (req, res) => {
  try {
    const { to, firstName } = req.body;
    if (!to) {
      return res.status(400).json({ error: 'Recipient email (to) required' });
    }

    const message = await sendWelcomeEmail(to, { firstName });
    if (!message) {
      return res.status(503).json({ error: 'Email service not configured (missing inbox)' });
    }

    res.json({ success: true, messageId: message.messageId });
  } catch (error) {
    console.error('[EmailAPI] Welcome email failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/email/send-deposit
 * Send First Circle deposit confirmation
 */
router.post('/send-deposit', async (req, res) => {
  try {
    const { to, amount, status, transactionId } = req.body;
    if (!to) {
      return res.status(400).json({ error: 'Recipient email (to) required' });
    }

    const message = await sendDepositConfirmation(to, { amount, status, transactionId });
    if (!message) {
      return res.status(503).json({ error: 'Email service not configured' });
    }

    res.json({ success: true, messageId: message.messageId });
  } catch (error) {
    console.error('[EmailAPI] Deposit email failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/email/send-pool-receipt
 * Send data pool contribution receipt
 */
router.post('/send-pool-receipt', async (req, res) => {
  try {
    const { to, poolName, id, estimatedEarnings } = req.body;
    if (!to) {
      return res.status(400).json({ error: 'Recipient email (to) required' });
    }

    const message = await sendDataPoolReceipt(to, { poolName, id, estimatedEarnings });
    if (!message) {
      return res.status(503).json({ error: 'Email service not configured' });
    }

    res.json({ success: true, messageId: message.messageId });
  } catch (error) {
    console.error('[EmailAPI] Pool receipt failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// CUSTOMER SUPPORT ENDPOINTS
// ============================================================

/**
 * POST /api/email/support-reply
 * Send a support reply (admin/AI agent use)
 */
router.post('/support-reply', async (req, res) => {
  try {
    const { to, subject, text, html, inReplyTo } = req.body;
    if (!to || !subject || !text) {
      return res.status(400).json({ error: 'to, subject, and text are required' });
    }

    const message = await sendSupportReply(to, subject, text, html, inReplyTo);
    res.json({ success: true, messageId: message.messageId });
  } catch (error) {
    console.error('[EmailAPI] Support reply failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/email/support-inbox
 * List recent messages in the support inbox
 */
router.get('/support-inbox', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const messages = await getSupportInboxMessages(limit);
    res.json({ success: true, count: messages.length, messages });
  } catch (error) {
    console.error('[EmailAPI] Support inbox list failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// AGENTMAIL WEBHOOK — INBOUND EMAILS
// ============================================================

/**
 * POST /inbound
 * Receive inbound emails from AgentMail webhook
 * Mounted at /webhooks/agentmail in server.js
 */
router.post('/inbound', async (req, res) => {
  try {
    // Verify webhook signature if AGENTMAIL_WEBHOOK_SECRET is set
    const secret = process.env.AGENTMAIL_WEBHOOK_SECRET;
    if (secret) {
      const signature = req.headers['x-agentmail-signature'];
      const crypto = require('crypto');
      const expected = crypto
        .createHmac('sha256', secret)
        .update(req.rawBody || JSON.stringify(req.body))
        .digest('hex');
      if (signature !== expected) {
        console.warn('[EmailWebhook] Invalid signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    const result = await handleInboundEmail(req.body);
    console.log('[EmailWebhook] Processed:', result.action, result.reason || result.category || '');

    res.json({ received: true, ...result });
  } catch (error) {
    console.error('[EmailWebhook] Processing failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Separate webhook handler for mounting at /webhooks/agentmail
const handleAgentMailWebhook = async (req, res) => {
  try {
    const secret = process.env.AGENTMAIL_WEBHOOK_SECRET;
    if (secret) {
      const signature = req.headers['x-agentmail-signature'];
      const crypto = require('crypto');
      const expected = crypto
        .createHmac('sha256', secret)
        .update(req.rawBody || JSON.stringify(req.body))
        .digest('hex');
      if (signature !== expected) {
        console.warn('[EmailWebhook] Invalid signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    const result = await handleInboundEmail(req.body);
    console.log('[EmailWebhook] Processed:', result.action, result.reason || result.category || '');

    res.json({ received: true, ...result });
  } catch (error) {
    console.error('[EmailWebhook] Processing failed:', error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = router;
module.exports.handleAgentMailWebhook = handleAgentMailWebhook;
