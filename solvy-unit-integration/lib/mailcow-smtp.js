/**
 * SOLVY Cooperative — Mailcow SMTP Client
 *
 * Replaces AgentMail with self-hosted Mailcow SMTP.
 * All transactional and support email goes through your own infrastructure.
 *
 * Environment:
 *   MAILCOW_SMTP_HOST    → Mailcow SMTP host (e.g., mail.solvy.cards)
 *   MAILCOW_SMTP_PORT    → 587 (STARTTLS) or 465 (SMTPS)
 *   MAILCOW_SMTP_USER    → SMTP username (e.g., noreply@solvy.cards)
 *   MAILCOW_SMTP_PASS    → SMTP password
 *   MAILCOW_SMTP_SECURE  → true for 465, false for 587
 *   MAILCOW_FROM_NAME    → Display name for outbound email
 */

const nodemailer = require('nodemailer');

const SMTP_HOST = process.env.MAILCOW_SMTP_HOST;
const SMTP_PORT = parseInt(process.env.MAILCOW_SMTP_PORT, 10) || 587;
const SMTP_USER = process.env.MAILCOW_SMTP_USER;
const SMTP_PASS = process.env.MAILCOW_SMTP_PASS;
const SMTP_SECURE = process.env.MAILCOW_SMTP_SECURE === 'true' || SMTP_PORT === 465;
const FROM_NAME = process.env.MAILCOW_FROM_NAME || 'SOLVY Ecosystem';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn('[Mailcow] SMTP not fully configured. Set MAILCOW_SMTP_HOST, USER, and PASS.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: true,
    },
  });

  console.log('[Mailcow] SMTP transporter ready:', SMTP_HOST + ':' + SMTP_PORT);
  return transporter;
}

/**
 * Send email via Mailcow SMTP
 * @param {Object} params
 * @param {string} params.from    — sender address (defaults to SMTP_USER)
 * @param {string} params.to      — recipient address
 * @param {string} params.subject — email subject
 * @param {string} params.text    — plain text body
 * @param {string} [params.html]  — HTML body
 * @param {string} [params.replyTo] — reply-to address
 * @returns {Promise<Object>}     — { messageId, accepted, rejected }
 */
async function sendEmail({ from, to, subject, text, html, replyTo }) {
  const t = getTransporter();
  if (!t) {
    throw new Error('[Mailcow] SMTP not configured');
  }

  const info = await t.sendMail({
    from: `"${FROM_NAME}" <${from || SMTP_USER}>`,
    to,
    subject,
    text,
    html,
    replyTo,
  });

  console.log('[Mailcow] Sent:', info.messageId, 'to:', to);
  return info;
}

/**
 * Verify SMTP connection (health check)
 * @returns {Promise<boolean>}
 */
async function verifyConnection() {
  const t = getTransporter();
  if (!t) return false;
  try {
    await t.verify();
    return true;
  } catch (err) {
    console.error('[Mailcow] SMTP verification failed:', err.message);
    return false;
  }
}

module.exports = {
  sendEmail,
  verifyConnection,
  getTransporter,
};
