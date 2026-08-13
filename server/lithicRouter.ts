import express from 'express';
import { getLithicClient, isLithicConfigured } from './lithicClient';

const router = express.Router();

const STAFF_CODE = process.env.STAFF_ACCESS_CODE;

function requireStaff(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.headers['x-staff-token'];
  if (!STAFF_CODE || !token || token !== STAFF_CODE) {
    return res.status(403).json({ error: 'Staff access required.' });
  }
  next();
}

// Public: lets the UI know whether the integration is ready, without leaking the key.
router.get('/status', (_req, res) => {
  res.json({ configured: isLithicConfigured(), environment: 'sandbox' });
});

// Issue a new virtual debit card (sandbox).
router.post('/cards', requireStaff, async (req, res) => {
  try {
    const { memo, spendLimit, spendLimitDuration } = req.body || {};
    const client = getLithicClient();
    const params: any = {
      type: 'VIRTUAL',
      state: 'OPEN',
    };
    if (memo) params.memo = String(memo);
    if (spendLimit != null && !Number.isNaN(Number(spendLimit))) {
      // Lithic spend limits are in minor units (cents).
      params.spend_limit = Math.round(Number(spendLimit) * 100);
    }
    if (spendLimitDuration) params.spend_limit_duration = String(spendLimitDuration);

    const card: any = await (client as any).cards.create(params);
    res.json({
      token: card.token,
      pan: card.pan,
      cvv: card.cvv,
      expMonth: card.exp_month,
      expYear: card.exp_year,
      lastFour: card.last_four,
      state: card.state,
      type: card.type,
      memo: card.memo,
      spendLimit: card.spend_limit,
      spendLimitDuration: card.spend_limit_duration,
      created: card.created,
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// List issued cards (no full PAN — only last four).
router.get('/cards', requireStaff, async (_req, res) => {
  try {
    const client = getLithicClient();
    const cards: any[] = [];
    for await (const card of (client as any).cards.list({ page_size: 50 })) {
      cards.push({
        token: card.token,
        lastFour: card.last_four,
        state: card.state,
        type: card.type,
        memo: card.memo,
        spendLimit: card.spend_limit,
        spendLimitDuration: card.spend_limit_duration,
        created: card.created,
      });
      if (cards.length >= 50) break;
    }
    res.json({ cards });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// List recent transactions, optionally scoped to one card.
router.get('/transactions', requireStaff, async (req, res) => {
  try {
    const client = getLithicClient();
    const cardToken = req.query.cardToken ? String(req.query.cardToken) : undefined;
    const listParams: any = { page_size: 50 };
    if (cardToken) listParams.card_token = cardToken;
    const txns: any[] = [];
    for await (const txn of (client as any).transactions.list(listParams)) {
      txns.push({
        token: txn.token,
        amount: txn.amount,
        status: txn.status,
        result: txn.result,
        merchant: txn.merchant?.descriptor ?? txn.descriptor ?? null,
        cardToken: txn.card_token,
        created: txn.created,
      });
      if (txns.length >= 50) break;
    }
    res.json({ transactions: txns });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Sandbox-only: simulate an authorization against a card PAN so transactions appear.
router.post('/simulate/authorize', requireStaff, async (req, res) => {
  try {
    const { pan, amount, descriptor } = req.body || {};
    if (!pan) return res.status(400).json({ error: 'pan is required to simulate a transaction.' });
    const client = getLithicClient();
    const result: any = await (client as any).transactions.simulateAuthorization({
      pan: String(pan),
      amount: Math.round(Number(amount || 0) * 100),
      descriptor: descriptor ? String(descriptor) : 'SANDBOX MERCHANT',
    });
    res.json({ token: result.token, debuggingRequestId: result.debugging_request_id });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
