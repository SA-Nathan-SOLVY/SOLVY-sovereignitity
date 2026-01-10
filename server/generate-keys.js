import { generateKeyPair, exportJWK } from 'jose';
import fs from 'fs';

async function generateKeys() {
  console.log('Generating RSA-256 Key Pair for Sovereign Identity...');
  
  // Generate RSA key pair
  const { publicKey, privateKey } = await generateKeyPair('RS256', {
    extractable: true,
  });

  // Export Private Key (Keep this SECRET!)
  const privateJwk = await exportJWK(privateKey);
  // Add Key ID (kid) and Use (sig)
  privateJwk.kid = 'solvy-sovereign-key-1';
  privateJwk.use = 'sig';
  privateJwk.alg = 'RS256';

  // Export Public Key (This goes to JWKS)
  const publicJwk = await exportJWK(publicKey);
  publicJwk.kid = 'solvy-sovereign-key-1';
  publicJwk.use = 'sig';
  publicJwk.alg = 'RS256';

  // Save to files
  fs.writeFileSync('private-key.json', JSON.stringify(privateJwk, null, 2));
  fs.writeFileSync('jwks.json', JSON.stringify({ keys: [publicJwk] }, null, 2));

  console.log('✅ Keys generated successfully!');
  console.log('🔒 private-key.json -> Use this to sign tokens');
  console.log('🌍 jwks.json -> Serve this at /.well-known/jwks.json');
}

generateKeys().catch(console.error);
