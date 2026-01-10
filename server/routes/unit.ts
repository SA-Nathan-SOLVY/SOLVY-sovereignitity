import express from 'express';
import * as jose from 'jose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const privateKeyPath = path.join(__dirname, '../private-key.json');
let privateKey: any;

try {
  const jwk = JSON.parse(fs.readFileSync(privateKeyPath, 'utf8'));
  jose.importJWK(jwk, 'RS256').then(key => {
    privateKey = key;
    console.log('Sovereign Identity Key Loaded');
  });
} catch (err) {
  console.error('Failed to load private key:', err);
}

router.get('/token', async (req, res) => {
  try {
    if (!privateKey) return res.status(500).json({ error: 'Not ready' });
    
    const jwt = await new jose.SignJWT({ scope: 'read write' })
      .setProtectedHeader({ alg: 'RS256', kid: 'solvy-sovereign-key-1' })
      .setIssuedAt()
      .setIssuer('http://46.62.235.95:3001' )
      .setAudience('https://api.unit.co' )
      .setExpirationTime('1h')
      .sign(privateKey);
    
    res.json({ token: jwt });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
