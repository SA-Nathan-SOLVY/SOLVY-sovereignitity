/**
 * SOLVY Cooperative - JWT Authentication Server
 * 
 * Serves JWKS (JSON Web Key Set) for Unit.co integration
 * Runs on port 3001 as configured in Unit dashboard
 * 
 * JWKS Endpoint: http://46.62.235.95:3001/.well-known/jwks.json
 */

const http = require('http');
const crypto = require('crypto');

// Configuration
const CONFIG = {
  PORT: 3001,
  HOST: '0.0.0.0', // Listen on all interfaces
  JWKS_PATH: '/.well-known/jwks.json',
  HEALTH_PATH: '/health'
};

/**
 * Generate RSA Key Pair for JWT signing
 * In production, load from secure storage (HashiCorp Vault, AWS KMS, etc.)
 */
function generateKeyPair() {
  return crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'jwk' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });
}

// Generate or load keys
let keyPair;
try {
  // Try to load existing keys from environment or file
  if (process.env.JWT_PRIVATE_KEY && process.env.JWT_PUBLIC_KEY) {
    keyPair = {
      privateKey: process.env.JWT_PRIVATE_KEY,
      publicKey: JSON.parse(process.env.JWT_PUBLIC_KEY)
    };
    console.log('[Auth] Loaded keys from environment');
  } else {
    // Generate new keys (only for development!)
    console.log('[Auth] Generating new RSA key pair...');
    const { publicKey, privateKey } = generateKeyPair();
    keyPair = { publicKey, privateKey };
    
    // Log public key for manual configuration
    console.log('[Auth] Public Key (JWK):');
    console.log(JSON.stringify(publicKey, null, 2));
  }
} catch (error) {
  console.error('[Auth] Key generation failed:', error);
  process.exit(1);
}

/**
 * Build JWKS (JSON Web Key Set)
 */
function getJWKS() {
  const jwk = keyPair.publicKey;
  
  // Add key ID and usage
  const key = {
    ...jwk,
    kid: 'solvy-key-1',
    use: 'sig',
    alg: 'RS256',
    kty: 'RSA'
  };
  
  return {
    keys: [key]
  };
}

/**
 * Generate JWT for Unit.co
 */
function generateUnitJWT(customerId) {
  const now = Math.floor(Date.now() / 1000);
  
  const header = {
    alg: 'RS256',
    typ: 'JWT',
    kid: 'solvy-key-1'
  };
  
  const payload = {
    sub: customerId,
    iss: 'http://46.62.235.95:3001',
    aud: 'https://api.unit.co',
    iat: now,
    exp: now + 3600, // 1 hour
    jti: crypto.randomUUID()
  };
  
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  
  const signature = crypto.createSign('RSA-SHA256')
    .update(signingInput)
    .sign(keyPair.privateKey, 'base64url');
  
  return `${signingInput}.${signature}`;
}

/**
 * HTTP Request Handler
 */
function handleRequest(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  const url = new URL(req.url, `http://${req.headers.host}`);
  
  // JWKS Endpoint - Required by Unit.co
  if (url.pathname === CONFIG.JWKS_PATH) {
    console.log(`[Auth] JWKS request from ${req.socket.remoteAddress}`);
    res.writeHead(200);
    res.end(JSON.stringify(getJWKS(), null, 2));
    return;
  }
  
  // Health check
  if (url.pathname === CONFIG.HEALTH_PATH) {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'ok', service: 'solvy-auth' }));
    return;
  }
  
  // Generate JWT for member (internal use)
  if (url.pathname === '/token' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { customerId } = JSON.parse(body);
        const token = generateUnitJWT(customerId);
        res.writeHead(200);
        res.end(JSON.stringify({ token }));
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid request' }));
      }
    });
    return;
  }
  
  // 404
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
}

// Start server
const server = http.createServer(handleRequest);

server.listen(CONFIG.PORT, CONFIG.HOST, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║     SOLVY Cooperative - Authentication Server          ║
╠════════════════════════════════════════════════════════╣
║  JWKS: http://${CONFIG.HOST}:${CONFIG.PORT}${CONFIG.JWKS_PATH}    ║
║  Health: http://${CONFIG.HOST}:${CONFIG.PORT}${CONFIG.HEALTH_PATH}         ║
╚════════════════════════════════════════════════════════╝
  `);
  console.log('[Auth] Server running. Unit.co can now validate JWTs.');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Auth] Shutting down...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('[Auth] Shutting down...');
  server.close(() => process.exit(0));
});
