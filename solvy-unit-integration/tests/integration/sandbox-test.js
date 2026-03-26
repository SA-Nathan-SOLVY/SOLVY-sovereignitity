/**
 * Unit.co Sandbox Integration Test
 * Tests complete member onboarding flow
 */

require('dotenv').config();

const { createCustomer } = require('../../api/unit/customer');
const { createDepositAccount, getBalance } = require('../../api/unit/account');
const { createCard } = require('../../api/unit/card');

// Test data (Unit sandbox test SSNs)
const testMember = {
  id: 'test-001',
  firstName: 'Eva',
  lastName: 'Evergreen',
  ssn: '000000001', // Always approves in sandbox
  dateOfBirth: '1985-06-19',
  email: 'eva.evergreen@test.solvy.coop',
  phone: '555-123-4567',
  address: {
    street: '123 Beauty Lane',
    city: 'Houston',
    state: 'TX',
    zip: '77001'
  },
  businessName: "Eva's Beauty Lounge",
  cohort: 'first_circle'
};

const runTest = async () => {
  console.log('🧪 SOLVY Unit Sandbox Integration Test');
  console.log('=====================================\n');
  
  try {
    // Step 1: Create customer
    console.log('1️⃣ Creating customer...');
    const customer = await createCustomer(testMember);
    console.log('✅ Customer created:', customer.data.id);
    console.log('   Name:', customer.data.attributes.fullName.first, customer.data.attributes.fullName.last);
    console.log('   Email:', customer.data.attributes.email);
    
    // Step 2: Create account
    console.log('\n2️⃣ Creating deposit account...');
    const account = await createDepositAccount(customer.data.id);
    console.log('✅ Account created:', account.data.id);
    console.log('   Type:', account.data.attributes.depositProduct);
    console.log('   Balance:', account.data.attributes.balance);
    
    // Step 3: Check balance
    console.log('\n3️⃣ Getting balance...');
    const balance = await getBalance(account.data.id);
    console.log('✅ Balance retrieved:');
    console.log('   Available:', balance.available);
    console.log('   Total:', balance.total);
    
    // Step 4: Create card
    console.log('\n4️⃣ Creating SOLVY card...');
    const card = await createCard(account.data.id, testMember.address);
    console.log('✅ Card created:', card.data.id);
    console.log('   Last 4:', card.data.attributes.lastFourDigits);
    console.log('   Expiration:', card.data.attributes.expirationDate);
    console.log('   Status:', card.data.attributes.status);
    
    // Success summary
    console.log('\n=====================================');
    console.log('🎉 All tests passed!');
    console.log('=====================================');
    console.log('\nMember successfully onboarded:');
    console.log('  Customer ID:', customer.data.id);
    console.log('  Account ID:', account.data.id);
    console.log('  Card ID:', card.data.id);
    console.log('  Card ending in:', card.data.attributes.lastFourDigits);
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
};

// Run test
runTest();
