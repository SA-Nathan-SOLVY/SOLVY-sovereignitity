/**
 * SOLVY Ecosystem™ — Banking Router
 * ============================================================
 * Handles banking transaction data from multiple vendors.
 * Current vendor: Stripe (BANKING_VENDOR=stripe)
 *
 * Security:
 *   - No raw customer PII exposed in transaction responses
 *   - Generic error messages on failures
 *   - All Stripe calls use existing stripeClient.ts (no new credential paths)
 * ============================================================
 */

import { Request, Response, Router } from 'express';
import { getUncachableStripeClient } from './stripeClient';

const router = Router();

// ── Vendor Selection ──────────────────────────────────────────────────────────

export const ACTIVE_VENDOR = (): string => {
  return process.env.BANKING_VENDOR || 'mock';
};

// ── Transaction Types ─────────────────────────────────────────────────────────

export interface BankingTransaction {
  id: string;
  date: string;
  amount: number;           // in cents
  currency: string;
  description: string;
  status: string;
  customer?: string;        // anonymized / hashed if needed
  receiptUrl?: string;
  source: 'stripe' | 'mock';
}

// ── Stripe Vendor Implementation ──────────────────────────────────────────────

async function stripeGetTransactions(
  from?: string,
  to?: string,
  limit: number = 100
): Promise<BankingTransaction[]> {
  const stripe = await getUncachableStripeClient();

  const params: any = {
    limit: Math.min(limit, 100),
    expand: ['data.customer'],
  };

  if (from) {
    params.created = { gte: Math.floor(new Date(from).getTime() / 1000) };
  }
  if (to) {
    params.created = {
      ...params.created,
      lte: Math.floor(new Date(to).getTime() / 1000),
    };
  }

  const charges = await stripe.charges.list(params);

  return charges.data.map((charge: any) => ({
    id: charge.id,
    date: new Date(charge.created * 1000).toISOString(),
    amount: charge.amount,
    currency: charge.currency,
    description: charge.description || 'SOLVY Card Transaction',
    status: charge.status,
    customer: charge.customer?.email
      ? hashCustomerEmail(charge.customer.email)
      : undefined,
    receiptUrl: charge.receipt_url || undefined,
    source: 'stripe',
  }));
}

async function stripeGetBalance(): Promise<{
  available: number;
  pending: number;
  currency: string;
}> {
  const stripe = await getUncachableStripeClient();
  const balance = await stripe.balance.retrieve();
  const available = balance.available.find((b: any) => b.currency === 'usd');
  const pending = balance.pending.find((b: any) => b.currency === 'usd');

  return {
    available: available?.amount || 0,
    pending: pending?.amount || 0,
    currency: 'usd',
  };
}

// ── Mock Vendor Implementation ────────────────────────────────────────────────

function mockGetTransactions(
  from?: string,
  to?: string
): BankingTransaction[] {
  const txs: BankingTransaction[] = [
    {
      id: 'mock-tx-001',
      date: '2026-05-10T14:30:00Z',
      amount: 499,
      currency: 'usd',
      description: 'Founding Member Fee — Monthly',
      status: 'succeeded',
      customer: 'member-a1b2c3',
      source: 'mock',
    },
    {
      id: 'mock-tx-002',
      date: '2026-05-09T09:15:00Z',
      amount: 12500,
      currency: 'usd',
      description: 'First Circle Equity Deposit',
      status: 'succeeded',
      customer: 'member-d4e5f6',
      source: 'mock',
    },
    {
      id: 'mock-tx-003',
      date: '2026-05-08T18:45:00Z',
      amount: 2500,
      currency: 'usd',
      description: 'Data Pool Contribution — Spending Patterns',
      status: 'succeeded',
      customer: 'member-g7h8i9',
      source: 'mock',
    },
  ];

  if (from || to) {
    const fromMs = from ? new Date(from).getTime() : 0;
    const toMs = to ? new Date(to).getTime() : Date.now();
    return txs.filter((t) => {
      const ts = new Date(t.date).getTime();
      return ts >= fromMs && ts <= toMs;
    });
  }

  return txs;
}

function mockGetBalance() {
  return {
    available: 15499,
    pending: 3200,
    currency: 'usd',
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function hashCustomerEmail(email: string): string {
  // Simple hash for anonymization — not cryptographically secure,
  // but sufficient to avoid exposing raw emails in API responses
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `member-${Math.abs(hash).toString(16).substring(0, 8)}`;
}

// ── Route Handlers ────────────────────────────────────────────────────────────

router.get('/transactions', async (req: Request, res: Response) => {
  try {
    const { from, to, limit } = req.query;
    const vendor = ACTIVE_VENDOR();

    let transactions: BankingTransaction[] = [];

    if (vendor === 'stripe') {
      try {
        transactions = await stripeGetTransactions(
          from as string | undefined,
          to as string | undefined,
          limit ? parseInt(limit as string, 10) : 100
        );
      } catch (stripeErr: any) {
        console.error('[Banking] Stripe fetch failed:', stripeErr.message);
        // If Stripe fails and vendor IS stripe, we should not silently fall back
        // to mock data in production. Return error.
        if (process.env.NODE_ENV === 'production') {
          return res.status(503).json({
            error: 'Banking provider unavailable',
            details: 'Stripe connection failed',
          });
        }
        // In dev, fall back to mock with a warning
        transactions = mockGetTransactions(from as string | undefined, to as string | undefined);
        res.set('X-Banking-Fallback', 'mock');
      }
    } else {
      transactions = mockGetTransactions(from as string | undefined, to as string | undefined);
    }

    res.json({
      vendor,
      count: transactions.length,
      transactions,
    });
  } catch (err: any) {
    console.error('[Banking] Transactions error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve transactions' });
  }
});

router.get('/balance', async (_req: Request, res: Response) => {
  try {
    const vendor = ACTIVE_VENDOR();
    let balance;

    if (vendor === 'stripe') {
      try {
        balance = await stripeGetBalance();
      } catch (stripeErr: any) {
        console.error('[Banking] Stripe balance failed:', stripeErr.message);
        if (process.env.NODE_ENV === 'production') {
          return res.status(503).json({
            error: 'Banking provider unavailable',
          });
        }
        balance = mockGetBalance();
        res.set('X-Banking-Fallback', 'mock');
      }
    } else {
      balance = mockGetBalance();
    }

    res.json({ vendor, balance });
  } catch (err: any) {
    console.error('[Banking] Balance error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve balance' });
  }
});

// ── Exports ───────────────────────────────────────────────────────────────────

export { stripeGetTransactions, stripeGetBalance };
export default router;
