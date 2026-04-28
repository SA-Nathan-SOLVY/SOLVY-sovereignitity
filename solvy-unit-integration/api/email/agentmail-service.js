/**
 * SOLVY Email Service — AgentMail Integration
 * Handles transactional emails and customer support conversations.
 *
 * Replaces Resend with AgentMail's inbox-based API for:
 * - Transactional: welcome, notifications, receipts
 * - Support: 2-way conversations at support@ebl.beauty
 */

const {
  sendEmail,
  replyToMessage,
  listMessages,
  getSupportInboxId,
  getNoreplyInboxId,
  getHelloInboxId,
} = require('../../lib/agentmail');

// ============================================================
// TRANSACTIONAL EMAILS
// ============================================================

/**
 * Send welcome email to new SOLVY member
 * @param {string} to - Member email address
 * @param {Object} member - Member data
 * @param {string} member.firstName
 * @returns {Promise<Object>} Sent message
 */
async function sendWelcomeEmail(to, member = {}) {
  const firstName = member.firstName || 'New Member';
  const noreplyInbox = getNoreplyInboxId();

  if (!noreplyInbox) {
    console.warn('[EmailService] NOREPLY inbox not configured. Skipping welcome email.');
    return null;
  }

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

Questions? Reply to this email or contact support@ebl.beauty.

Own your spend. Own your future. — SOLVY Ecosystem™
Product of SA Nathan LLC
`;

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Welcome to SOLVY</title></head>
<body style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#0f172a;">
  <div style="text-align:center;margin-bottom:24px;">
    <h1 style="color:#22c55e;">SOLVY Ecosystem™</h1>
    <p style="font-size:18px;color:#64748b;">Welcome, ${firstName}!</p>
  </div>
  <p>You're now part of a cooperative financial platform built for generational wealth.</p>
  <h3 style="color:#22c55e;">What's Next</h3>
  <ul>
    <li>Complete your profile in the MAN Portal</li>
    <li>Order your SOLVY Card™ (member-owned debit)</li>
    <li>Explore the Data Marketplace — your spending data earns you revenue</li>
  </ul>
  <h3 style="color:#22c55e;">The 70/20/10 Model</h3>
  <ul>
    <li><strong>70%</strong> of interchange revenue → Member Pool (yours)</li>
    <li><strong>20%</strong> → Community Development</li>
    <li><strong>10%</strong> → Sovereign Fund (emergency reserve)</li>
  </ul>
  <p style="background:#f0fdf4;padding:16px;border-radius:8px;margin-top:24px;">
    <strong>When you spend with your SOLVY Card™, you're not just a customer — you're an owner.</strong>
  </p>
  <p>Questions? Reply to this email or contact <a href="mailto:support@ebl.beauty">support@ebl.beauty</a>.</p>
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
  <p style="font-size:12px;color:#94a3b8;text-align:center;">
    Own your spend. Own your future. — SOLVY Ecosystem™<br>
    Product of SA Nathan LLC
  </p>
</body>
</html>`;

  return sendEmail(noreplyInbox, { to, subject, text, html, replyTo: getSupportInboxId() });
}

/**
 * Send First Circle deposit confirmation
 * @param {string} to - Member email
 * @param {Object} deposit - Deposit details
 * @returns {Promise<Object>} Sent message
 */
async function sendDepositConfirmation(to, deposit = {}) {
  const noreplyInbox = getNoreplyInboxId();
  if (!noreplyInbox) return null;

  const subject = 'SOLVY — First Circle Deposit Confirmed';
  const text = `Your First Circle deposit of $${deposit.amount || 0} has been received.

Status: ${deposit.status || 'Processing'}
Transaction ID: ${deposit.transactionId || 'N/A'}

Thank you for joining the First Circle. Your deposit helps fund cooperative infrastructure and earns you founding member status.

Own your spend. Own your future. — SOLVY Ecosystem™
`;

  return sendEmail(noreplyInbox, { to, subject, text, replyTo: getSupportInboxId() });
}

/**
 * Send data pool contribution receipt
 * @param {string} to - Member email
 * @param {Object} contribution - Contribution details
 * @returns {Promise<Object>} Sent message
 */
async function sendDataPoolReceipt(to, contribution = {}) {
  const noreplyInbox = getNoreplyInboxId();
  if (!noreplyInbox) return null;

  const subject = 'SOLVY — Data Pool Contribution Received';
  const text = `Thank you for contributing to the "${contribution.poolName || 'Data Pool'}".

Your anonymized data helps researchers and partners understand cooperative economic patterns — and generates revenue shared back to members under our 70/20/10 model.

Pool: ${contribution.poolName || 'N/A'}
Contribution ID: ${contribution.id || 'N/A'}
Estimated Earnings: $${contribution.estimatedEarnings || 0}

You can opt out at any time from the Privacy Dashboard.

Own your spend. Own your future. — SOLVY Ecosystem™
`;

  return sendEmail(noreplyInbox, { to, subject, text, replyTo: getSupportInboxId() });
}

// ============================================================
// CUSTOMER SUPPORT — 2-WAY CONVERSATIONS
// ============================================================

/**
 * Send an AI-drafted support reply from support@ebl.beauty
 * @param {string} to - Customer email
 * @param {string} subject - Subject line
 * @param {string} text - Plain text reply body
 * @param {string} [html] - HTML reply body
 * @param {string} [inReplyTo] - Original message ID to thread
 * @returns {Promise<Object>} Sent message
 */
async function sendSupportReply(to, subject, text, html, inReplyTo) {
  const supportInbox = getSupportInboxId();
  if (!supportInbox) {
    throw new Error('[EmailService] SUPPORT inbox not configured');
  }

  const fullText = `${text}\n\n---\nSOLVY Ecosystem™ Support\nNeed human help? Reply HUMAN\n`;
  const fullHtml = html
    ? `${html}<hr><p style="font-size:12px;color:#94a3b8;">SOLVY Ecosystem™ Support<br>Need human help? Reply HUMAN</p>`
    : undefined;

  if (inReplyTo) {
    return replyToMessage(supportInbox, inReplyTo, { text: fullText, html: fullHtml });
  }

  return sendEmail(supportInbox, { to, subject, text: fullText, html: fullHtml });
}

/**
 * List recent support emails for the admin dashboard
 * @param {number} [limit=20] - Number of messages
 * @returns {Promise<Array>} Messages
 */
async function getSupportInboxMessages(limit = 20) {
  const supportInbox = getSupportInboxId();
  if (!supportInbox) return [];

  const result = await listMessages(supportInbox, { limit });
  return result.messages || [];
}

/**
 * Handle inbound email webhook from AgentMail
 * Routes to appropriate handler based on intent classification.
 * @param {Object} payload - AgentMail webhook payload
 */
async function handleInboundEmail(payload) {
  const { inboxId, messageId, from, subject, extractedText, text } = payload;
  const body = extractedText || text || '';

  console.log('[EmailService] Inbound email from:', from, 'Subject:', subject);

  // Auto-escalation keywords
  const escalationKeywords = /dispute|fraud|unauthorized|angry|lawyer|sue|human/i;
  if (escalationKeywords.test(subject) || escalationKeywords.test(body)) {
    console.log('[EmailService] 🚨 Auto-escalating to human queue');
    // TODO: Queue for human review (store in DB or send to ops dashboard)
    return { action: 'escalated', reason: 'keyword_match' };
  }

  // Member requests human explicitly
  if (/\bHUMAN\b/i.test(body)) {
    console.log('[EmailService] 🚨 Member requested human agent');
    return { action: 'escalated', reason: 'human_requested' };
  }

  // Simple FAQ routing (to be expanded with Kimi API integration)
  if (/\b(password|login|account|card|balance)\b/i.test(subject + ' ' + body)) {
    return { action: 'faq', category: 'account_issue', messageId };
  }
  if (/\b(fee|charge|cost|price|how much)\b/i.test(subject + ' ' + body)) {
    return { action: 'faq', category: 'pricing_faq', messageId };
  }
  if (/\b(cooperative|vote|proposal|member)\b/i.test(subject + ' ' + body)) {
    return { action: 'faq', category: 'governance_faq', messageId };
  }

  return { action: 'classify', messageId, from, subject, body };
}

module.exports = {
  // Transactional
  sendWelcomeEmail,
  sendDepositConfirmation,
  sendDataPoolReceipt,
  // Support
  sendSupportReply,
  getSupportInboxMessages,
  handleInboundEmail,
};
