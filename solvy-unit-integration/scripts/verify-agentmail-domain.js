#!/usr/bin/env node
/**
 * Verify AgentMail DNS Records for solvy.cards
 * Checks SPF, DKIM, and DMARC are correctly configured in Cloudflare.
 *
 * Usage:
 *   node scripts/verify-agentmail-domain.js
 *
 * Requires: Node.js built-in dns module (no external dependencies)
 */

const dns = require('dns').promises;

const DOMAIN = process.argv[2] || 'solvy.cards';

async function checkSPF() {
  try {
    const records = await dns.resolveTxt(DOMAIN);
    const spf = records.flat().find((r) => r.startsWith('v=spf1'));
    if (spf && spf.includes('agentmail.to')) {
      console.log('✅ SPF:', spf);
      return true;
    }
    console.log('❌ SPF: No agentmail.to include found');
    console.log('   Found:', spf || '(none)');
    return false;
  } catch (e) {
    console.log('❌ SPF: DNS lookup failed —', e.message);
    return false;
  }
}

async function checkDKIM() {
  try {
    const records = await dns.resolveCname(`agentmail._domainkey.${DOMAIN}`);
    if (records.includes('dkim.agentmail.to')) {
      console.log('✅ DKIM: agentmail._domainkey → dkim.agentmail.to');
      return true;
    }
    console.log('❌ DKIM: Expected dkim.agentmail.to, got:', records.join(', '));
    return false;
  } catch (e) {
    console.log('❌ DKIM: DNS lookup failed —', e.message);
    return false;
  }
}

async function checkDMARC() {
  try {
    const records = await dns.resolveTxt(`_dmarc.${DOMAIN}`);
    const dmarc = records.flat().find((r) => r.startsWith('v=DMARC1'));
    if (dmarc) {
      console.log('✅ DMARC:', dmarc);
      return true;
    }
    console.log('❌ DMARC: No v=DMARC1 record found');
    return false;
  } catch (e) {
    console.log('❌ DMARC: DNS lookup failed —', e.message);
    return false;
  }
}

async function checkMX() {
  try {
    const records = await dns.resolveMx(DOMAIN);
    console.log('ℹ️  MX records found:', records.map((r) => r.exchange).join(', '));
  } catch (e) {
    console.log('ℹ️  MX: No MX records (OK if not receiving email directly)');
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  Verifying AgentMail DNS for: ${DOMAIN}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  const [spfOk, dkimOk, dmarcOk] = await Promise.all([
    checkSPF(),
    checkDKIM(),
    checkDMARC(),
  ]);

  await checkMX();

  console.log('\n───────────────────────────────────────────────────────────────');
  if (spfOk && dkimOk && dmarcOk) {
    console.log('✅ ALL RECORDS VERIFIED');
    console.log(`   Go to https://console.agentmail.to → Domains → Add ${DOMAIN}`);
  } else {
    console.log('❌ SOME RECORDS MISSING');
    console.log('   1. Add the missing records in Cloudflare (DNS only, gray cloud)');
    console.log('   2. Wait 5 minutes for propagation');
    console.log('   3. Run this script again');
  }
  console.log('───────────────────────────────────────────────────────────────');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
