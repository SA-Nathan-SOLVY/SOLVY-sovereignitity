/**
 * SOLVY Cooperative - Lithic API Adapter (TypeScript)
 *
 * Handles Lithic API interactions:
 * - Account holder management (KYC/KYB)
 * - KYC document upload
 * - Card issuance (virtual + physical)
 * - Transaction retrieval
 * - Balance inquiries
 * - Webhook handling
 *
 * Sandbox: https://sandbox.lithic.com
 * Production: https://api.lithic.com
 */

import https from 'https';

const LITHIC_CONFIG = {
  BASE_URL: process.env.LITHIC_API_URL || 'https://sandbox.lithic.com',
  API_KEY: process.env.LITHIC_API_KEY || '',
  WEBHOOK_SECRET: process.env.LITHIC_WEBHOOK_SECRET || '',
};

interface LithicRequestOptions {
  method: string;
  path: string;
  body?: object | string;
  extraHeaders?: Record<string, string>;
}

function lithicRequest<T = any>(method: string, path: string, body: object | string | null = null, extraHeaders: Record<string, string> = {}): Promise<T> {
  return new Promise((resolve, reject) => {
    const url = new URL(path, LITHIC_CONFIG.BASE_URL);

    const options: https.RequestOptions = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method,
      headers: {
        'Authorization': LITHIC_CONFIG.API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...extraHeaders,
      },
    };

    let bodyData: string | null = null;
    if (body) {
      bodyData = typeof body === 'string' ? body : JSON.stringify(body);
      options.headers!['Content-Length'] = Buffer.byteLength(bodyData).toString();
    }

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed as T);
          } else {
            reject(new Error(`Lithic API error: ${res.statusCode} - ${JSON.stringify(parsed)}`));
          }
        } catch (e) {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data as T);
          } else {
            reject(new Error(`Lithic API error: ${res.statusCode} - ${data}`));
          }
        }
      });
    });

    req.on('error', reject);
    if (bodyData) req.write(bodyData);
    req.end();
  });
}

function uploadToPresignedUrl(uploadUrl: string, imageBuffer: Buffer, contentType = 'image/jpeg'): Promise<{ success: boolean; status: number }> {
  return new Promise((resolve, reject) => {
    const url = new URL(uploadUrl);
    const options: https.RequestOptions = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
        'Content-Length': imageBuffer.length,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, status: res.statusCode });
        } else {
          reject(new Error(`Upload failed: ${res.statusCode} - ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(imageBuffer);
    req.end();
  });
}

// ============================================
// ACCOUNT HOLDER OPERATIONS
// ============================================

export interface LithicAddress {
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

export interface CreateAccountHolderParams {
  workflow?: 'KYC_BASIC' | 'KYC_ADVANCED' | 'KYC_EXEMPT' | 'KYC_BYO';
  firstName: string;
  lastName: string;
  dob?: string;
  phone?: string;
  email: string;
  governmentId?: string;
  address?: LithicAddress;
  tosTimestamp?: string;
  idempotencyToken?: string;
}

export async function createAccountHolder(params: CreateAccountHolderParams): Promise<any> {
  const body: any = {
    workflow: params.workflow || 'KYC_BASIC',
    tos_timestamp: params.tosTimestamp || new Date().toISOString(),
    idempotency_token:
      params.idempotencyToken || `solvy_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    individual: {
      first_name: params.firstName,
      last_name: params.lastName,
      dob: params.dob,
      phone_number: params.phone,
      email: params.email,
      government_id: params.governmentId,
      address: params.address
        ? {
            address1: params.address.address1,
            address2: params.address.address2,
            city: params.address.city,
            state: params.address.state,
            postal_code: params.address.postal_code,
            country: params.address.country || 'USA',
          }
        : undefined,
    },
  };

  // Remove undefined fields
  Object.keys(body.individual).forEach((key) => {
    if (body.individual[key] === undefined) delete body.individual[key];
  });
  if (body.individual.address) {
    Object.keys(body.individual.address).forEach((key) => {
      if (body.individual.address[key] === undefined) delete body.individual.address[key];
    });
  }

  return await lithicRequest('POST', '/v1/account_holders', body);
}

export async function getAccountHolder(token: string): Promise<any> {
  return await lithicRequest('GET', `/v1/account_holders/${token}`);
}

export async function initiateDocumentUpload(
  accountHolderToken: string,
  documentType: string = 'drivers_license',
  entityToken: string | null = null
): Promise<any> {
  const body: any = { document_type: documentType };
  if (entityToken) body.entity_token = entityToken;
  return await lithicRequest('POST', `/v1/account_holders/${accountHolderToken}/documents`, body);
}

export async function uploadKycDocuments(
  uploadResponse: any,
  frontImageBuffer: Buffer,
  backImageBuffer: Buffer
): Promise<{ success: boolean }> {
  const frontUrl = uploadResponse.upload_url_front || uploadResponse.front_upload_url;
  const backUrl = uploadResponse.upload_url_back || uploadResponse.back_upload_url;

  if (!frontUrl || !backUrl) {
    throw new Error('Missing pre-signed upload URLs in Lithic response');
  }

  await uploadToPresignedUrl(frontUrl, frontImageBuffer, 'image/jpeg');
  await uploadToPresignedUrl(backUrl, backImageBuffer, 'image/jpeg');

  return { success: true };
}

// ============================================
// ACCOUNT OPERATIONS
// ============================================

export async function listAccounts(): Promise<any[]> {
  const response = await lithicRequest<any>('GET', '/v1/accounts');
  return response.data || [];
}

export async function getAccount(accountToken: string): Promise<any> {
  return await lithicRequest('GET', `/v1/accounts/${accountToken}`);
}

export async function getBalance(accountToken: string): Promise<{ available: number; current: number; currency: string; accountToken: string }> {
  const account = await getAccount(accountToken);
  return {
    available: account.spend_limit?.available || 0,
    current: account.spend_limit?.daily || 0,
    currency: 'USD',
    accountToken: account.token,
  };
}

// ============================================
// CARD OPERATIONS
// ============================================

export interface CreateCardParams {
  type?: 'VIRTUAL' | 'PHYSICAL';
  accountToken: string;
  cardProgramToken?: string;
  carrier?: string;
  shippingAddress?: any;
  spendLimit?: number;
  spendLimitDuration?: 'TRANSACTION' | 'MONTHLY' | 'ANNUALLY' | 'LIFETIME';
  state?: 'OPEN' | 'PAUSED';
  memo?: string;
}

export async function createCard(params: CreateCardParams): Promise<any> {
  const body: any = {
    type: (params.type || 'VIRTUAL').toUpperCase(),
    account_token: params.accountToken,
    card_program_token: params.cardProgramToken,
    carrier: params.carrier,
    shipping_address: params.shippingAddress,
    spend_limit: params.spendLimit,
    spend_limit_duration: params.spendLimitDuration || 'TRANSACTION',
    state: params.state || 'OPEN',
    memo: params.memo || 'SOLVY Card',
  };

  if (!body.account_token) {
    throw new Error('account_token is required for Lithic card creation');
  }

  Object.keys(body).forEach((key) => {
    if (body[key] === undefined) delete body[key];
  });

  return await lithicRequest('POST', '/v1/cards', body);
}

export async function listCards(accountToken: string): Promise<any[]> {
  const response = await lithicRequest<any>('GET', `/v1/cards?account_token=${accountToken}`);
  return response.data || [];
}

export async function getCard(cardToken: string): Promise<any> {
  return await lithicRequest('GET', `/v1/cards/${cardToken}`);
}

export async function setCardFrozen(cardToken: string, frozen: boolean): Promise<any> {
  const state = frozen ? 'PAUSED' : 'OPEN';
  return await lithicRequest('PATCH', `/v1/cards/${cardToken}`, { state });
}

export async function reissueCard(cardToken: string, options: { shippingAddress?: any; carrier?: string } = {}): Promise<any> {
  const body: any = {
    shipping_address: options.shippingAddress,
    carrier: options.carrier,
  };
  return await lithicRequest('POST', `/v1/cards/${cardToken}/reissue`, body);
}

// ============================================
// TRANSACTION OPERATIONS
// ============================================

export async function getTransactions(accountToken: string, options: { begin?: string; end?: string; limit?: number } = {}): Promise<any[]> {
  let url = `/v1/transactions?account_token=${accountToken}`;
  if (options.begin) url += `&begin=${options.begin}`;
  if (options.end) url += `&end=${options.end}`;
  if (options.limit) url += `&limit=${options.limit}`;

  const response = await lithicRequest<any>('GET', url);
  return response.data || [];
}

// ============================================
// SIMULATION (SANDBOX ONLY)
// ============================================

export interface SimulateAuthorizationParams {
  descriptor?: string;
  amount: number;
  pan?: string;
  cvv?: string;
  expiration?: string;
  status?: string;
}

export async function simulateAuthorization(params: SimulateAuthorizationParams): Promise<any> {
  const body: any = {
    descriptor: params.descriptor || 'Test Merchant',
    amount: params.amount,
    pan: params.pan,
    cvv: params.cvv,
    expiration: params.expiration,
    status: params.status || 'AUTHORIZATION',
  };
  return await lithicRequest('POST', '/v1/simulate/authorize', body);
}

export async function simulateClearing(params: { token: string; amount: number }): Promise<any> {
  const body = { token: params.token, amount: params.amount };
  return await lithicRequest('POST', '/v1/simulate/clearing', body);
}

// ============================================
// WEBHOOK HANDLING
// ============================================

import crypto from 'crypto';

export function verifyWebhook(payload: string, signature: string): boolean {
  if (!LITHIC_CONFIG.WEBHOOK_SECRET) {
    console.warn('[Lithic] No webhook secret configured, skipping verification');
    return true;
  }

  const expected = crypto.createHmac('sha256', LITHIC_CONFIG.WEBHOOK_SECRET).update(payload).digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function processWebhook(body: any): { type: string; data: any; raw: any } {
  return {
    type: body.event_type,
    data: body.payload || body,
    raw: body,
  };
}

// ============================================
// HEALTH CHECK
// ============================================

export async function ping(): Promise<boolean> {
  try {
    await lithicRequest('GET', '/v1/accounts');
    return true;
  } catch (error: any) {
    console.error('[Lithic] Ping failed:', error.message);
    return false;
  }
}

export const config = LITHIC_CONFIG;
