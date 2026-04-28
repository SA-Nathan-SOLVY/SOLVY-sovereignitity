#!/usr/bin/env node
/**
 * SOLVY AgentMail Support Listener
 * Sovereignty-first: zero persistence. Emails are printed to console only.
 *
 * Reads inbound emails via WebSocket (no public URL needed).
 * No database writes. No file writes. No central storage.
 *
 * Usage:
 *   export AGENTMAIL_API_KEY=am_...
 *   export AGENTMAIL_SUPPORT_INBOX_ID=...   # from setup-agentmail-inbox.js
 *   node scripts/agentmail-support-listener.js
 *
 * Press Ctrl+C to stop. All email data remains ephemeral.
 */

require('dotenv').config({ path: '../.env' });

const { AgentMailClient } = require('agentmail');

// ─── Configuration ──────────────────────────────────────────────────
const API_KEY = process.env.AGENTMAIL_API_KEY;
const INBOX_ID = process.env.AGENTMAIL_SUPPORT_INBOX_ID;

// ─── Validation ─────────────────────────────────────────────────────
if (!API_KEY) {
  console.error('❌ AGENTMAIL_API_KEY not set.');
  console.error('   export AGENTMAIL_API_KEY=am_...');
  process.exit(1);
}
if (!INBOX_ID) {
  console.error('❌ AGENTMAIL_SUPPORT_INBOX_ID not set.');
  console.error('   Run: node scripts/setup-agentmail-inbox.js');
  process.exit(1);
}

// ─── Client ─────────────────────────────────────────────────────────
const client = new AgentMailClient({ apiKey: API_KEY });

// ─── Graceful Shutdown ──────────────────────────────────────────────
let socket = null;

function shutdown(signal) {
  console.log(`\n[${signal}] Shutting down listener. No data persisted.`);
  if (socket) {
    try { socket.close(); } catch (_) { /* noop */ }
  }
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// ─── Main Listener ──────────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  SOLVY Ecosystem™ — AgentMail Support Listener');
  console.log('  Inbox:', INBOX_ID);
  console.log('  Mode:   Ephemeral (no storage)');
  console.log('  Press Ctrl+C to stop');
  console.log('═══════════════════════════════════════════════════════════════\n');

  try {
    socket = await client.websockets.connect();

    // ── Connection open ────────────────────────────────────────────
    socket.on('open', () => {
      console.log('[WebSocket] Connected to AgentMail');

      socket.sendSubscribe({
        type: 'subscribe',
        inboxIds: [INBOX_ID],
        eventTypes: ['message.received'],
      });

      console.log('[WebSocket] Subscribed to inbox:', INBOX_ID);
      console.log('[WebSocket] Waiting for emails...\n');
    });

    // ── Incoming message ───────────────────────────────────────────
    socket.on('message', (event) => {
      if (event.type === 'subscribed') {
        console.log('[WebSocket] Subscription confirmed:', event.inboxIds);
        return;
      }

      if (event.type === 'message_received') {
        const msg = event.message;
        const receivedAt = new Date().toISOString();

        // ── Sovereignty: print only, never store ───────────────────
        console.log('┌─────────────────────────────────────────────────────────────┐');
        console.log('│  📧 NEW EMAIL RECEIVED');
        console.log('├─────────────────────────────────────────────────────────────┤');
        console.log(`│  Time:     ${receivedAt}`);
        console.log(`│  From:     ${msg.from_ || 'unknown'}`);
        console.log(`│  To:       ${Array.isArray(msg.to) ? msg.to.join(', ') : msg.to}`);
        console.log(`│  Subject:  ${msg.subject || '(no subject)'}`);
        console.log(`│  Message:  ${msg.messageId}`);
        console.log(`│  Thread:   ${msg.threadId || 'new'}`);
        console.log('├─────────────────────────────────────────────────────────────┤');
        console.log('│  BODY (plain text):');
        console.log('│');

        // Prefer extracted_text (reply content without quoted history)
        const body = msg.extractedText || msg.text || '(no plain text body)';
        const lines = body.split('\n');
        lines.forEach((line) => {
          // Wrap long lines at 58 chars for display
          const wrapped = line.match(/.{1,58}/g) || [line];
          wrapped.forEach((segment) => {
            console.log(`│  ${segment.padEnd(57, ' ')}│`);
          });
        });

        console.log('├─────────────────────────────────────────────────────────────┤');
        console.log(`│  Attachments: ${msg.attachments?.length || 0}`);
        console.log('└─────────────────────────────────────────────────────────────┘');
        console.log('');

        // ── Auto-escalation check (sovereignty: log only, no action) ─
        const bodyLower = (msg.text || '').toLowerCase();
        const subjectLower = (msg.subject || '').toLowerCase();
        const combined = `${subjectLower} ${bodyLower}`;

        const escalated =
          /\b(dispute|fraud|unauthorized|lawyer|sue|litigation)\b/.test(combined) ||
          /\bhuman\b/i.test(bodyLower);

        if (escalated) {
          console.log('⚠️  AUTO-ESCALATION TRIGGERED — Human review recommended');
          console.log('');
        }
      }
    });

    // ── Connection close ───────────────────────────────────────────
    socket.on('close', (event) => {
      console.log(`[WebSocket] Disconnected (code: ${event.code}, reason: ${event.reason || 'none'})`);
      console.log('[WebSocket] Reconnecting in 5 seconds...');
      setTimeout(main, 5000);
    });

    // ── Error ──────────────────────────────────────────────────────
    socket.on('error', (error) => {
      console.error('[WebSocket] Error:', error.message || error);
    });

  } catch (error) {
    console.error('[WebSocket] Failed to connect:', error.message);
    if (error.body?.message) {
      console.error('   Details:', error.body.message);
    }
    console.log('[WebSocket] Retrying in 10 seconds...');
    setTimeout(main, 10000);
  }
}

main();
