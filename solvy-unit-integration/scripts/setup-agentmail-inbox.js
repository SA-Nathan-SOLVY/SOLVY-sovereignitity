/**
 * SOLVY AgentMail Inbox Setup
 * Creates support@solvy.cards (or support@agentmail.to if custom domain not ready)
 *
 * Run once:
 *   node scripts/setup-agentmail-inbox.js
 *
 * Requires AGENTMAIL_API_KEY in environment.
 */

require('dotenv').config({ path: '../.env' });

const { AgentMailClient } = require('agentmail');

const API_KEY = process.env.AGENTMAIL_API_KEY;

if (!API_KEY) {
  console.error('❌ AGENTMAIL_API_KEY not set.');
  console.error('   Get one at https://console.agentmail.to or run:');
  console.error('   export AGENTMAIL_API_KEY=am_...');
  process.exit(1);
}

const client = new AgentMailClient({ apiKey: API_KEY });

async function main() {
  try {
    console.log('🔧 Creating SOLVY support inbox...\n');

    // Create inbox with username "support"
    // If custom domain solvy.cards is verified, pass domain: 'solvy.cards'
    // Otherwise uses default @agentmail.to domain
    const inbox = await client.inboxes.create({
      username: 'support',
      // domain: 'solvy.cards',  // Uncomment after domain verification in AgentMail Console
      displayName: 'SOLVY Ecosystem™ Support',
      clientId: 'solvy-support-inbox-v1',
    });

    console.log('✅ Inbox created!\n');
    console.log('   Inbox ID:   ', inbox.inboxId);
    console.log('   Email:      ', inbox.emailAddress);
    console.log('   Display:    ', inbox.displayName);
    console.log('');
    console.log('👉 Add this to your .env file:');
    console.log(`   AGENTMAIL_SUPPORT_INBOX_ID=${inbox.inboxId}`);
    console.log('');
    console.log('   If using @agentmail.to, forward your domain email to:');
    console.log(`   ${inbox.emailAddress}`);
    console.log('');
    console.log('   Or verify solvy.cards in AgentMail Console and re-run with domain set.');

  } catch (error) {
    console.error('❌ Failed to create inbox:', error.message);
    if (error.body?.message) {
      console.error('   Details:', error.body.message);
    }
    process.exit(1);
  }
}

main();
