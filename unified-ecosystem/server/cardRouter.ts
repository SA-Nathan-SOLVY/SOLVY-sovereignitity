/**
 * SOLVY Card Issuing Router (Lithic)
 * ==================================
 * API routes for debit card lifecycle:
 * - Account holder (KYC) creation
 * - KYC document upload
 * - Virtual/physical card creation
 * - Card state management (freeze/unfreeze)
 * - Transaction history
 * - Sandbox simulation
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import * as lithic from './lithicAdapter';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// ── Helpers ───────────────────────────────────────────────────────────────────

function handleError(res: Response, error: any, defaultMsg = 'Card operation failed') {
  console.error('[Card Router] Error:', error.message || error);
  const status = error.message?.includes('401') ? 401 : error.message?.includes('403') ? 403 : 500;
  res.status(status).json({ success: false, error: error.message || defaultMsg });
}

// ── Health ────────────────────────────────────────────────────────────────────

router.get('/health', async (_req: Request, res: Response) => {
  try {
    const ok = await lithic.ping();
    res.json({ success: ok, vendor: 'lithic', mode: lithic.config.BASE_URL.includes('sandbox') ? 'sandbox' : 'production' });
  } catch (error: any) {
    handleError(res, error, 'Lithic health check failed');
  }
});

// ── Account Holders (KYC) ─────────────────────────────────────────────────────

router.post('/account-holders', async (req: Request, res: Response) => {
  try {
    const result = await lithic.createAccountHolder(req.body);
    res.json({ success: true, accountHolder: result });
  } catch (error: any) {
    handleError(res, error, 'Failed to create account holder');
  }
});

router.get('/account-holders/:token', async (req: Request, res: Response) => {
  try {
    const result = await lithic.getAccountHolder(req.params.token);
    res.json({ success: true, accountHolder: result });
  } catch (error: any) {
    handleError(res, error, 'Failed to get account holder');
  }
});

router.post(
  '/account-holders/:token/documents',
  upload.fields([{ name: 'front', maxCount: 1 }, { name: 'back', maxCount: 1 }]),
  async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      const documentType = (req.body.documentType as string) || 'drivers_license';

      const uploadResponse = await lithic.initiateDocumentUpload(token, documentType);

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const front = files?.front?.[0]?.buffer;
      const back = files?.back?.[0]?.buffer;

      if (!front || !back) {
        return res.status(400).json({ success: false, error: 'Front and back ID images are required' });
      }

      await lithic.uploadKycDocuments(uploadResponse, front, back);
      res.json({ success: true, documentUpload: uploadResponse });
    } catch (error: any) {
      handleError(res, error, 'Failed to upload KYC documents');
    }
  }
);

// ── Cards ─────────────────────────────────────────────────────────────────────

router.post('/cards', async (req: Request, res: Response) => {
  try {
    const result = await lithic.createCard(req.body);
    res.json({ success: true, card: result });
  } catch (error: any) {
    handleError(res, error, 'Failed to create card');
  }
});

router.get('/cards', async (req: Request, res: Response) => {
  try {
    const accountToken = req.query.accountToken as string;
    if (!accountToken) {
      return res.status(400).json({ success: false, error: 'accountToken query param required' });
    }
    const result = await lithic.listCards(accountToken);
    res.json({ success: true, cards: result });
  } catch (error: any) {
    handleError(res, error, 'Failed to list cards');
  }
});

router.get('/cards/:token', async (req: Request, res: Response) => {
  try {
    const result = await lithic.getCard(req.params.token);
    res.json({ success: true, card: result });
  } catch (error: any) {
    handleError(res, error, 'Failed to get card');
  }
});

router.patch('/cards/:token/state', async (req: Request, res: Response) => {
  try {
    const { frozen } = req.body;
    if (typeof frozen !== 'boolean') {
      return res.status(400).json({ success: false, error: 'frozen boolean required' });
    }
    const result = await lithic.setCardFrozen(req.params.token, frozen);
    res.json({ success: true, card: result });
  } catch (error: any) {
    handleError(res, error, 'Failed to update card state');
  }
});

// ── Transactions ──────────────────────────────────────────────────────────────

router.get('/transactions', async (req: Request, res: Response) => {
  try {
    const accountToken = req.query.accountToken as string;
    if (!accountToken) {
      return res.status(400).json({ success: false, error: 'accountToken query param required' });
    }
    const result = await lithic.getTransactions(accountToken, {
      begin: req.query.begin as string,
      end: req.query.end as string,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
    });
    res.json({ success: true, transactions: result });
  } catch (error: any) {
    handleError(res, error, 'Failed to get transactions');
  }
});

// ── Simulation (sandbox only) ─────────────────────────────────────────────────

router.post('/simulate/authorize', async (req: Request, res: Response) => {
  try {
    const result = await lithic.simulateAuthorization(req.body);
    res.json({ success: true, authorization: result });
  } catch (error: any) {
    handleError(res, error, 'Failed to simulate authorization');
  }
});

router.post('/simulate/clearing', async (req: Request, res: Response) => {
  try {
    const result = await lithic.simulateClearing(req.body);
    res.json({ success: true, clearing: result });
  } catch (error: any) {
    handleError(res, error, 'Failed to simulate clearing');
  }
});

// ── Webhook ───────────────────────────────────────────────────────────────────

router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-lithic-signature'] as string;
    const payload = JSON.stringify(req.body);

    if (lithic.config.WEBHOOK_SECRET && (!signature || !lithic.verifyWebhook(payload, signature))) {
      return res.status(401).json({ success: false, error: 'Invalid webhook signature' });
    }

    const event = lithic.processWebhook(req.body);
    console.log('[Lithic Webhook]', event.type, event.data);

    // TODO: Persist relevant events to database (card created, transaction, etc.)

    res.json({ received: true, type: event.type });
  } catch (error: any) {
    handleError(res, error, 'Webhook processing failed');
  }
});

export default router;
