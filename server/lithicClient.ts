import Lithic from 'lithic';

// Lithic is wired directly (there is no Replit connector for it). The sandbox
// API key is supplied via the LITHIC_API_KEY secret. Sandbox issues test card
// numbers only — never real PANs.

let client: Lithic | null = null;
let cachedKey: string | undefined;

export function isLithicConfigured(): boolean {
  return !!process.env.LITHIC_API_KEY;
}

export function getLithicClient(): Lithic {
  const apiKey = process.env.LITHIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      'LITHIC_API_KEY is not configured. Add it in Replit Secrets to enable debit-card issuing.'
    );
  }
  // Recreate the client if the key changed (e.g. secret updated at runtime).
  if (!client || cachedKey !== apiKey) {
    client = new Lithic({
      apiKey,
      environment: 'sandbox',
    });
    cachedKey = apiKey;
  }
  return client;
}
