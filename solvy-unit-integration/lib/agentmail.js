/**
 * AgentMail Client Wrapper
 * SOLVY Ecosystem™ — AI-native email for agents
 *
 * Handles both transactional and 2-way conversational email.
 * Replaces Resend with AgentMail's inbox-based API.
 */

const { AgentMailClient } = require('agentmail');

const API_KEY = process.env.AGENTMAIL_API_KEY;
const SUPPORT_INBOX_ID = process.env.AGENTMAIL_SUPPORT_INBOX_ID;
const NOREPLY_INBOX_ID = process.env.AGENTMAIL_NOREPLY_INBOX_ID;
const HELLO_INBOX_ID = process.env.AGENTMAIL_HELLO_INBOX_ID;

let client = null;

/**
 * Get or create the AgentMail client instance
 * @returns {AgentMailClient}
 */
function getClient() {
  if (!client) {
    if (!API_KEY) {
      throw new Error('[AgentMail] AGENTMAIL_API_KEY not set in environment');
    }
    client = new AgentMailClient({ apiKey: API_KEY });
    console.log('[AgentMail] Client initialized');
  }
  return client;
}

/**
 * Create a new inbox for a specific purpose
 * @param {Object} options - Inbox creation options
 * @param {string} [options.username] - Username portion of email address
 * @param {string} [options.domain] - Custom domain (requires paid plan)
 * @param {string} [options.displayName] - Display name for sent emails
 * @param {string} [options.clientId] - Idempotency key
 * @returns {Promise<Object>} Created inbox
 */
async function createInbox(options = {}) {
  const c = getClient();
  const inbox = await c.inboxes.create(options);
  console.log('[AgentMail] Inbox created:', inbox.inboxId, inbox.emailAddress);
  return inbox;
}

/**
 * Send a transactional email from a specific inbox
 * @param {string} inboxId - Sender inbox ID
 * @param {Object} params - Email parameters
 * @param {string} params.to - Recipient email
 * @param {string} params.subject - Email subject
 * @param {string} params.text - Plain text body
 * @param {string} [params.html] - HTML body
 * @param {string} [params.replyTo] - Reply-to address
 * @returns {Promise<Object>} Sent message
 */
async function sendEmail(inboxId, { to, subject, text, html, replyTo }) {
  const c = getClient();
  const message = await c.inboxes.messages.send(inboxId, {
    to,
    subject,
    text,
    html,
    replyTo,
  });
  console.log('[AgentMail] Email sent:', message.messageId, 'to:', to);
  return message;
}

/**
 * List messages in an inbox
 * @param {string} inboxId - Inbox to query
 * @param {Object} [options] - Query options
 * @param {number} [options.limit=20] - Max messages to return
 * @param {string} [options.pageToken] - Pagination token
 * @returns {Promise<Object>} Messages list
 */
async function listMessages(inboxId, options = {}) {
  const c = getClient();
  return c.inboxes.messages.list(inboxId, {
    limit: options.limit || 20,
    pageToken: options.pageToken,
  });
}

/**
 * Get a specific message by ID
 * @param {string} inboxId - Inbox containing the message
 * @param {string} messageId - Message ID
 * @returns {Promise<Object>} Message details
 */
async function getMessage(inboxId, messageId) {
  const c = getClient();
  return c.inboxes.messages.get(inboxId, messageId);
}

/**
 * Reply to an existing message (maintains thread)
 * @param {string} inboxId - Sender inbox ID
 * @param {string} messageId - Message to reply to
 * @param {Object} params - Reply parameters
 * @param {string} params.text - Plain text reply
 * @param {string} [params.html] - HTML reply
 * @returns {Promise<Object>} Sent reply message
 */
async function replyToMessage(inboxId, messageId, { text, html }) {
  const c = getClient();
  const message = await c.inboxes.messages.reply(inboxId, messageId, {
    text,
    html,
  });
  console.log('[AgentMail] Reply sent:', message.messageId);
  return message;
}

/**
 * Subscribe to real-time email events via webhook
 * @param {string} inboxId - Inbox to subscribe
 * @param {string} webhookUrl - Your webhook endpoint URL
 * @param {string[]} [events=['message.received']] - Events to subscribe to
 * @returns {Promise<Object>} Webhook subscription
 */
async function createWebhook(inboxId, webhookUrl, events = ['message.received']) {
  const c = getClient();
  // AgentMail webhook API — create subscription
  const webhook = await c.webhooks.create({
    inboxId,
    url: webhookUrl,
    events,
  });
  console.log('[AgentMail] Webhook created:', webhook.id, '→', webhookUrl);
  return webhook;
}

// Convenience getters for SOLVY's standard inboxes
function getSupportInboxId() { return SUPPORT_INBOX_ID; }
function getNoreplyInboxId() { return NOREPLY_INBOX_ID; }
function getHelloInboxId() { return HELLO_INBOX_ID; }

module.exports = {
  getClient,
  createInbox,
  sendEmail,
  listMessages,
  getMessage,
  replyToMessage,
  createWebhook,
  getSupportInboxId,
  getNoreplyInboxId,
  getHelloInboxId,
};
