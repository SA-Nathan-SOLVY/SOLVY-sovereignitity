/**
 * SOLVY Email Service — Mailcow SMTP Integration
 *
 * Replaces AgentMail with self-hosted Mailcow for all outbound email:
 * - Transactional: welcome, deposit confirmations, pool receipts
 * - Support: replies from support@solvy.cards
 *
 * Inbound email handling is done via Mailcow + Huginn (self-hosted).
 * No external SaaS dependencies.
 */

const { sendEmail } = require('../../lib/mailcow-smtp');

const SUPPORT_EMAIL = process.env.SOLVY_SUPPORT_EMAIL || 'support@solvy.cards';
const NOREPLY_EMAIL = process.env.SOLVY_NOREPLY_EMAIL || 'noreply@solvy.cards';
const HELLO_EMAIL   = process.env.SOLVY_HELLO_EMAIL   || 'hello@solvy.cards';

// ============================================================
// TRANSACTIONAL EMAILS
// ============================================================

/**
 * Send welcome email to new SOLVY member
 * @param {string} to — Member email
 * @param {Object} member — { firstName }
 */
async function sendWelcomeEmail(to, member = {}) {
  const firstName = member.firstName || 'New Member';

  const subject = 'Welcome to SOLVY Ecosystem™ — Own Your Spend. Own Your Future.';
  const text = `Hi ${firstName},

Welcome to SOLVY Ecosystem™! You're now part of a cooperative financial platform built for generational wealth.

WHAT'S NEXT:
• Complete your profile in the MAN Portal
• Order your SOLVY Card™ (member-owned debit)
• Explore the Data Marketplace — your spending data earns you revenue

OUR 70/20/10 MODEL:
• 70% of interchange revenue → Member Pool (yours)
• 20% → Community Development
• 10% → Sovereign Fund (emergency reserve)

When you spend with your SOLVY Card™, you're not just a customer — you're an owner.

Questions? Reply to this email or contact ${SUPPORT_EMAIL}.

Own your spend. Own your future. — SOLVY Ecosystem™
Product of SA Nathan LLC
`;

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Welcome to SOLVY</title></head>
<body style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#0f172a;">
  <div style="text-align:center;margin-bottom:24px;">
    <h1 style="color:#9333ea;">SOLVY Ecosystem™</h1>
    <p style="font-size:18px;color:#64748b;">Welcome, ${firstName}!</p>
  </div>
  <p>You're now part of a cooperative financial platform built for generational wealth.</p>
  <h3 style="color:#9333ea;">What's Next</h3>
  <ul>
    <li>Complete your profile in the MAN Portal</li>
    <li>Order your SOLVY Card™ (member-owned debit)</li>
    <li>Explore the Data Marketplace — your spending data earns you revenue</li>
  </ul>
  <h3 style="color:#9333ea;">The 70/20/10 Model</h3>
  <ul>
    <li><strong>70%</strong> of interchange revenue → Member Pool (yours)</li>
    <li><strong>20%</strong> → Community Development</li>
    <li><strong>10%</strong> → Sovereign Fund (emergency reserve)</li>
  </ul>
  <p style="background:#f3e8ff;padding:16px;border-radius:8px;margin-top:24px;">
    <strong>When you spend with your SOLVY Card™, you're not just a customer — you're an owner.</strong>
  </p>
  <p>Questions? Reply to this email or contact <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p>
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
  <p style="font-size:12px;color:#94a3b8;text-align:center;">
    Own your spend. Own your future. — SOLVY Ecosystem™<br>
    Product of SA Nathan LLC
  </p>
</body>
</html>`;

  return sendEmail({ from: NOREPLY_EMAIL, to, subject, text, html, replyTo: SUPPORT_EMAIL });
}

/**
 * Send First Circle deposit confirmation
 * @param {string} to — Member email
 * @param {Object} deposit — { amount, status, transactionId }
 */
async function sendDepositConfirmation(to, deposit = {}) {
  const subject = 'SOLVY — First Circle Deposit Confirmed';
  const text = `Your First Circle deposit of $${deposit.amount || 0} has been received.

Status: ${deposit.status || 'Processing'}
Transaction ID: ${deposit.transactionId || 'N/A'}

Thank you for joining the First Circle. Your deposit helps fund cooperative infrastructure and earns you founding member status.

Own your spend. Own your future. — SOLVY Ecosystem™
`;

  return sendEmail({ from: NOREPLY_EMAIL, to, subject, text, replyTo: SUPPORT_EMAIL });
}

/**
 * Send data pool contribution receipt
 * @param {string} to — Member email
 * @param {Object} contribution — { poolName, id, estimatedEarnings }
 */
async function sendDataPoolReceipt(to, contribution = {}) {
  const subject = 'SOLVY — Data Pool Contribution Received';
  const text = `Thank you for contributing to the "${contribution.poolName || 'Data Pool'}".

Your anonymized data helps researchers and partners understand cooperative economic patterns — and generates revenue shared back to members under our 70/20/10 model.

Pool: ${contribution.poolName || 'N/A'}
Contribution ID: ${contribution.id || 'N/A'}
Estimated Earnings: $${contribution.estimatedEarnings || 0}

You can opt out at any time from the Privacy Dashboard.

Own your spend. Own your future. — SOLVY Ecosystem™
`;

  return sendEmail({ from: NOREPLY_EMAIL, to, subject, text, replyTo: SUPPORT_EMAIL });
}

// ============================================================
// CUSTOMER SUPPORT
// ============================================================

/**
 * Send a support reply from support@solvy.cards
 * @param {string} to — Customer email
 * @param {string} subject — Subject line
 * @param {string} text — Plain text body
 * @param {string} [html] — HTML body
 */
async function sendSupportReply(to, subject, text, html) {
  const fullText = `${text}\n\n---\nSOLVY Ecosystem™ Support\nNeed human help? Reply to this email.\n`;
  const fullHtml = html
    ? `${html}<hr><p style="font-size:12px;color:#94a3b8;">SOLVY Ecosystem™ Support<br>Need human help? Reply to this email.</p>`
    : undefined;

  return sendEmail({ from: SUPPORT_EMAIL, to, subject, text: fullText, html: fullHtml });
}

// ============================================================
// INBOUND EMAIL (handled by Mailcow + Huginn, not this file)
// ============================================================

/**
 * Stub for inbound email handling.
 * Mailcow delivers inbound mail to Huginn for automation/routing.
 * This function exists only for API compatibility.
 */
async function handleInboundEmail(payload) {
  console.log('[EmailService] Inbound email should be handled by Mailcow → Huginn pipeline');
  return { action: 'forwarded_to_huginn', note: 'Configure Mailcow sieve rules to POST to Huginn' };
}

module.exports = {
  sendWelcomeEmail,
  sendDepositConfirmation,
  sendDataPoolReceipt,
  sendSupportReply,
  handleInboundEmail,
};
