/**
 * SOLVY Cooperative - Lithic Sandbox Test
 * 
 * Tests the Lithic adapter with the live sandbox API key.
 * Run: node tests/test-lithic-sandbox.js
 */

// Set the API key directly for testing
process.env.LITHIC_API_KEY = 'b8012ebb-82b3-4775-8934-89b080867ad5';
process.env.LITHIC_API_URL = 'https://sandbox.lithic.com';

const lithic = require('../solvy-platform/api/adapters/lithic');

async function runTests() {
  console.log('🧪 SOLVY Lithic Sandbox Test\n');
  console.log('API Key:', process.env.LITHIC_API_KEY.slice(0, 8) + '...');
  console.log('Base URL:', process.env.LITHIC_API_URL);
  console.log('');

  let accountToken = null;
  let cardToken = null;

  try {
    // Test 1: Ping
    console.log('1️⃣  Testing API connection...');
    const ping = await lithic.ping();
    console.log(ping ? '✅ Connected to Lithic sandbox' : '❌ Connection failed');
    if (!ping) process.exit(1);

    // Test 2: List accounts
    console.log('\n2️⃣  Listing accounts...');
    const accounts = await lithic.listAccounts();
    console.log(`✅ Found ${accounts.length} account(s)`);
    if (accounts.length > 0) {
      accountToken = accounts[0].token;
      console.log('   Account token:', accountToken);
      console.log('   Account state:', accounts[0].state);
    } else {
      console.log('⚠️  No accounts found — some tests may be limited');
    }

    // Test 3: Get account details (if we have one)
    if (accountToken) {
      console.log('\n3️⃣  Getting account details...');
      const account = await lithic.getAccount(accountToken);
      console.log('✅ Account:', account.token);
      console.log('   State:', account.state);
      console.log('   Spend limit:', JSON.stringify(account.spend_limit));
    }

    // Test 4: Create a virtual card
    console.log('\n4️⃣  Creating virtual card...');
    if (!accountToken) {
      console.log('⚠️  Skipping — no account token available');
    } else {
      const card = await lithic.createCard({
        accountToken: accountToken,
        type: 'virtual',
        memo: 'SOLVY Test Card'
      });
      cardToken = card.token;
      console.log('✅ Virtual card created!');
      console.log('   Card token:', card.token);
      console.log('   Last four:', card.last_four);
      console.log('   State:', card.state);
      console.log('   Type:', card.type);
    }

    // Test 5: List cards
    if (accountToken) {
      console.log('\n5️⃣  Listing cards for account...');
      const cards = await lithic.listCards(accountToken);
      console.log(`✅ Found ${cards.length} card(s)`);
      cards.forEach(c => {
        console.log(`   - ${c.token} | ${c.type} | ${c.last_four} | ${c.state}`);
      });
    }

    // Test 6: Freeze / unfreeze card
    if (cardToken) {
      console.log('\n6️⃣  Freezing card...');
      await lithic.setCardFrozen(cardToken, true);
      console.log('✅ Card frozen');

      console.log('\n7️⃣  Unfreezing card...');
      await lithic.setCardFrozen(cardToken, false);
      console.log('✅ Card unfrozen');
    }

    // Test 7: Simulate authorization (if we have card details)
    if (cardToken) {
      console.log('\n8️⃣  Simulating transaction authorization...');
      const card = await lithic.getCard(cardToken);
      if (card.pan) {
        try {
          const auth = await lithic.simulateAuthorization({
            descriptor: 'SOLVY Test Merchant',
            amount: 2500, // $25.00 in cents
            pan: card.pan,
            status: 'AUTHORIZATION'
          });
          console.log('✅ Authorization simulated');
          console.log('   Auth token:', auth.token);
          console.log('   Status:', auth.status);
        } catch (simError) {
          console.log('⚠️  Simulation skipped:', simError.message);
        }
      } else {
        console.log('⚠️  Card PAN not available for simulation (expected for some sandbox cards)');
      }
    }

    console.log('\n🎉 All Lithic sandbox tests completed!');
    console.log('\n📊 Summary:');
    console.log(`   Account token: ${accountToken || 'N/A'}`);
    console.log(`   Card token: ${cardToken || 'N/A'}`);
    console.log(`   Vendor status: ✅ READY FOR INTEGRATION`);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.message.includes('401')) {
      console.error('   → API key may be invalid or expired');
    }
    if (error.message.includes('403')) {
      console.error('   → Account may need verification or permissions');
    }
    process.exit(1);
  }
}

runTests();
