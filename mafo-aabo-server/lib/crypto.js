/**
 * MAFO AABO Trust™ — AES-256-GCM file encryption (project convention).
 *
 * Key: env DOC_ENCRYPTION_KEY — 64-char hex (32 bytes).
 *   Generate: openssl rand -hex 32
 *
 * On-disk format (single .enc blob, no sidecar):
 *   [12-byte IV][16-byte GCM auth tag][ciphertext]
 * The documents table stores the sha256 of the PLAINTEXT for integrity.
 */
import crypto from 'crypto';

const IV_LEN = 12;
const TAG_LEN = 16;

export function getDocKey() {
  const hex = process.env.DOC_ENCRYPTION_KEY;
  if (!hex || !/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error('DOC_ENCRYPTION_KEY must be set (64-char hex — openssl rand -hex 32)');
  }
  return Buffer.from(hex, 'hex');
}

/** Encrypt a Buffer → single blob [iv][tag][ciphertext]. */
export function encryptBuffer(plaintext) {
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv('aes-256-gcm', getDocKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]);
}

/** Decrypt a blob produced by encryptBuffer. Throws on tamper/wrong key. */
export function decryptBuffer(blob) {
  const iv = blob.subarray(0, IV_LEN);
  const tag = blob.subarray(IV_LEN, IV_LEN + TAG_LEN);
  const ciphertext = blob.subarray(IV_LEN + TAG_LEN);
  const decipher = crypto.createDecipheriv('aes-256-gcm', getDocKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

export function sha256Hex(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}
