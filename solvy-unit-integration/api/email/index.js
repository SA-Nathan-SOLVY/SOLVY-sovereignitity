/**
 * Email API Routes — Mailcow SMTP Integration
 * SOLVY Cooperative
 *
 * All outbound email is sent via self-hosted Mailcow SMTP.
 * Inbound email is handled by Mailcow sieve rules → Huginn.
 *
 * Endpoints:
 *   POST /api/email/send-welcome        → Send welcome email
 *   POST /api/email/send-deposit        → Send deposit confirmation
 *   POST /api/email/send-pool-receipt   → Send data pool receipt
 *   POST /api/email/support-reply       → Send support reply
 */

const express = require('express');
const router = express.Router();
const {
  sendWelcomeEmail,
  sendDepositConfirmation,
  sendDataPoolReceipt,
  sendSupportReply,
} = require('./mailcow-service');

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

    const info = await sendWelcomeEmail(to, { firstName });
    res.json({ success: true, messageId: info.messageId });
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

    const info = await sendDepositConfirmation(to, { amount, status, transactionId });
    res.json({ success: true, messageId: info.messageId });
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

    const info = await sendDataPoolReceipt(to, { poolName, id, estimatedEarnings });
    res.json({ success: true, messageId: info.messageId });
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
    const { to, subject, text, html } = req.body;
    if (!to || !subject || !text) {
      return res.status(400).json({ error: 'to, subject, and text are required' });
    }

    const info = await sendSupportReply(to, subject, text, html);
    res.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('[EmailAPI] Support reply failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// MAILCOW HEALTH CHECK
// ============================================================

/**
 * GET /api/email/status
 * Verify Mailcow SMTP connection
 */
router.get('/status', async (req, res) => {
  try {
    const { verifyConnection } = require('../../lib/mailcow-smtp');
    const connected = await verifyConnection();
    res.json({ provider: 'Mailcow', connected, timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ provider: 'Mailcow', connected: false, error: error.message });
  }
});

module.exports = router;
