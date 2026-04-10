/**
 * SOLVY Unit.co Integration Test Suite
 * 
 * Tests the complete flow:
 * 1. Token generation API
 * 2. Frontend token fetching
 * 3. Unit Elements initialization
 * 
 * Run with: node tests/test-unit-integration.js
 */

const fetch = require('node-fetch');

// Test configuration
const CONFIG = {
  // Change this to test different environments
  API_BASE: process.env.API_URL || 'http://localhost:3000',
  // API_BASE: 'https://ebl.beauty', // Production
  
  TEST_MEMBER_ID: 'test_' + Date.now(),
  TIMEOUT: 10000 // 10 seconds
};

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, type = 'info') {
  const color = type === 'success' ? colors.green 
    : type === 'error' ? colors.red 
    : type === 'warning' ? colors.yellow 
    : colors.blue;
  console.log(`${color}${message}${colors.reset}`);
}

// Test 1: Health check
async function testHealthCheck() {
  log('\n📋 Test 1: API Health Check', 'info');
  
  try {
    const response = await fetch(`${CONFIG.API_BASE}/health`, {
      timeout: CONFIG.TIMEOUT
    });
    
    if (response.ok) {
      log('✅ API is running', 'success');
      return true;
    } else {
      log(`❌ API health check failed: ${response.status}`, 'error');
      return false;
    }
  } catch (error) {
    log(`❌ Cannot connect to API: ${error.message}`, 'error');
    log(`   Make sure server is running on ${CONFIG.API_BASE}`, 'warning');
    return false;
  }
}

// Test 2: Token generation
async function testTokenGeneration() {
  log('\n📋 Test 2: Token Generation API', 'info');
  
  try {
    const response = await fetch(`${CONFIG.API_BASE}/api/unit-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Member-ID': CONFIG.TEST_MEMBER_ID
      },
      body: JSON.stringify({
        memberId: CONFIG.TEST_MEMBER_ID,
        memberData: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@solvy.coop',
          source: 'test_script'
        }
      }),
      timeout: CONFIG.TIMEOUT
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      log(`❌ Token generation failed: ${data.message || response.status}`, 'error');
      return false;
    }
    
    if (!data.token) {
      log('❌ No token in response', 'error');
      return false;
    }
    
    // Validate JWT structure (3 parts separated by dots)
    const parts = data.token.split('.');
    if (parts.length !== 3) {
      log('❌ Invalid JWT structure', 'error');
      return false;
    }
    
    log('✅ Token generated successfully', 'success');
    log(`   Token length: ${data.token.length} characters`);
    log(`   Customer ID: ${data.customerId}`);
    log(`   Environment: ${data.environment}`);
    log(`   Expires in: ${data.expiresIn} seconds`);
    
    return data.token;
    
  } catch (error) {
    log(`❌ Token generation error: ${error.message}`, 'error');
    return false;
  }
}

// Test 3: Token validation
async function testTokenValidation(token) {
  log('\n📋 Test 3: Token Validation', 'info');
  
  try {
    // Decode JWT payload (middle part)
    const parts = token.split('.');
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    
    log('✅ Token decodes successfully', 'success');
    log(`   Subject: ${payload.sub}`);
    log(`   Partner ID: ${payload.partner_id || payload.org_id}`);
    log(`   Environment: ${payload.env}`);
    log(`   Issued at: ${new Date(payload.iat * 1000).toISOString()}`);
    log(`   Expires at: ${new Date(payload.exp * 1000).toISOString()}`);
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      log('⚠️  Token is expired', 'warning');
    } else {
      const minutes = Math.floor((payload.exp - now) / 60);
      log(`   Valid for: ${minutes} more minutes`);
    }
    
    return true;
    
  } catch (error) {
    log(`❌ Token validation failed: ${error.message}`, 'error');
    return false;
  }
}

// Test 4: CORS headers
async function testCorsHeaders() {
  log('\n📋 Test 4: CORS Configuration', 'info');
  
  try {
    const response = await fetch(`${CONFIG.API_BASE}/api/unit-token`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://ebl.beauty',
        'Access-Control-Request-Method': 'POST'
      },
      timeout: CONFIG.TIMEOUT
    });
    
    const allowOrigin = response.headers.get('access-control-allow-origin');
    const allowMethods = response.headers.get('access-control-allow-methods');
    
    if (allowOrigin && allowMethods) {
      log('✅ CORS headers present', 'success');
      log(`   Allow-Origin: ${allowOrigin}`);
      log(`   Allow-Methods: ${allowMethods}`);
      return true;
    } else {
      log('⚠️  CORS headers may be missing', 'warning');
      return false;
    }
    
  } catch (error) {
    log(`❌ CORS test failed: ${error.message}`, 'error');
    return false;
  }
}

// Test 5: Error handling
async function testErrorHandling() {
  log('\n📋 Test 5: Error Handling', 'info');
  
  // Test missing member ID
  try {
    const response = await fetch(`${CONFIG.API_BASE}/api/unit-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
      timeout: CONFIG.TIMEOUT
    });
    
    const data = await response.json();
    
    if (response.status === 400 && data.error) {
      log('✅ Properly rejects missing member ID', 'success');
    } else {
      log('⚠️  Unexpected response for invalid request', 'warning');
    }
    
  } catch (error) {
    log(`❌ Error handling test failed: ${error.message}`, 'error');
  }
  
  // Test wrong method
  try {
    const response = await fetch(`${CONFIG.API_BASE}/api/unit-token`, {
      method: 'GET',
      timeout: CONFIG.TIMEOUT
    });
    
    if (response.status === 405) {
      log('✅ Properly rejects GET requests', 'success');
      return true;
    } else {
      log('⚠️  Should return 405 for GET requests', 'warning');
      return false;
    }
    
  } catch (error) {
    log(`❌ Method test failed: ${error.message}`, 'error');
    return false;
  }
}

// Test 6: Load test (multiple tokens)
async function testLoadGeneration() {
  log('\n📋 Test 6: Load Test (5 concurrent requests)', 'info');
  
  const requests = Array(5).fill().map((_, i) => {
    return fetch(`${CONFIG.API_BASE}/api/unit-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Member-ID': `load_test_${i}_${Date.now()}`
      },
      body: JSON.stringify({
        memberId: `load_test_${i}`,
        memberData: { source: 'load_test' }
      }),
      timeout: CONFIG.TIMEOUT
    });
  });
  
  const start = Date.now();
  
  try {
    const responses = await Promise.all(requests);
    const duration = Date.now() - start;
    
    const successes = responses.filter(r => r.ok).length;
    
    log(`✅ ${successes}/5 requests successful`, 'success');
    log(`   Total time: ${duration}ms`);
    log(`   Average: ${Math.round(duration / 5)}ms per request`);
    
    return successes === 5;
    
  } catch (error) {
    log(`❌ Load test failed: ${error.message}`, 'error');
    return false;
  }
}

// Main test runner
async function runTests() {
  log('╔════════════════════════════════════════════════╗', 'info');
  log('║   SOLVY Unit.co Integration Test Suite        ║', 'info');
  log('╚════════════════════════════════════════════════╝', 'info');
  log(`Testing against: ${CONFIG.API_BASE}\n`);
  
  const results = {
    health: await testHealthCheck(),
    token: false,
    validation: false,
    cors: await testCorsHeaders(),
    errors: await testErrorHandling(),
    load: false
  };
  
  // Only continue if health check passed
  if (results.health) {
    const token = await testTokenGeneration();
    results.token = !!token;
    
    if (token) {
      results.validation = await testTokenValidation(token);
      results.load = await testLoadGeneration();
    }
  }
  
  // Summary
  log('\n╔════════════════════════════════════════════════╗', 'info');
  log('║                   TEST SUMMARY                 ║', 'info');
  log('╚════════════════════════════════════════════════╝', 'info');
  
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, result]) => {
    const icon = result ? '✅' : '❌';
    const color = result ? 'success' : 'error';
    log(`${icon} ${test.toUpperCase()}: ${result ? 'PASS' : 'FAIL'}`, color);
  });
  
  log(`\n${passed}/${total} tests passed`, passed === total ? 'success' : 'warning');
  
  if (passed === total) {
    log('\n🎉 All tests passed! Ready for prelaunch.', 'success');
    process.exit(0);
  } else {
    log('\n⚠️  Some tests failed. Check errors above.', 'warning');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  log(`\n💥 Fatal error: ${error.message}`, 'error');
  process.exit(1);
});
