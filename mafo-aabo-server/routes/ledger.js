/**
 * MAFO AABO Trust™ — ledger: record-keeping views, balances, ratios, CSV export.
 *
 * Derived figures (spec §4, computed in SQL — never stored):
 *   trust_balance = initial_funding − Σ(paid requests) − Σ(active loan principal) + Σ(repayments)
 *   loan_ratio    = Σ(active loan principal) / initial_funding   (trustee/grantor only)
 */
import { Router } from 'express';
import pool from '../db.js';
import { requireAuth } from '../lib/requireRole.js';

const router = Router();

async function computeSummary(user) {
  const settings = await pool.query('SELECT initial_funding_cents, effective_date FROM trust_settings WHERE id = 1');
  const initial = settings.rows[0]?.initial_funding_cents ?? 0;
  const effectiveDate = settings.rows[0]?.effective_date ?? null;

  const paid = await pool.query(
    `SELECT COALESCE(SUM(amount_cents),0)::INTEGER AS s, COUNT(*)::INTEGER AS n
       FROM requests WHERE status = 'paid'`
  );
  const pending = await pool.query(
    `SELECT COALESCE(SUM(amount_cents),0)::INTEGER AS s, COUNT(*)::INTEGER AS n
       FROM requests WHERE status = 'pending'`
  );
  const approved = await pool.query(
    `SELECT COALESCE(SUM(amount_cents),0)::INTEGER AS s, COUNT(*)::INTEGER AS n
       FROM requests WHERE status = 'approved'`
  );
  const loanAgg = await pool.query(
    `SELECT COALESCE(SUM(l.amount_cents),0)::INTEGER AS principal,
            COALESCE((SELECT SUM(rp.amount_cents) FROM loan_repayments rp),0)::INTEGER AS repayments,
            COUNT(*)::INTEGER AS n
       FROM loans l WHERE l.status = 'active'`
  );

  const paidCents = paid.rows[0].s;
  const activePrincipal = loanAgg.rows[0].principal;
  const repaymentsCents = loanAgg.rows[0].repayments;
  const balance = initial - paidCents - activePrincipal + repaymentsCents;

  const summary = {
    initial_funding_cents: initial,
    effective_date: effectiveDate,
    trust_balance_cents: balance,
    paid_cents: paidCents,
    paid_count: paid.rows[0].n,
    pending_cents: pending.rows[0].s,
    pending_count: pending.rows[0].n,
    approved_cents: approved.rows[0].s,
    approved_count: approved.rows[0].n,
  };

  if (user.permissions.viewLoanRatios) {
    summary.active_loan_principal_cents = activePrincipal;
    summary.active_loan_count = loanAgg.rows[0].n;
    summary.repayments_cents = repaymentsCents;
    summary.loan_ratio = initial > 0 ? activePrincipal / initial : 0;
  }

  // NFCU bank reconciliation figures — trustee/grantor only (spec §5)
  if (user.permissions.viewBank) {
    const bank = await pool.query(
      `SELECT COALESCE(SUM(amount_cents),0)::BIGINT AS balance,
              COUNT(*) FILTER (WHERE amount_cents < 0 AND NOT reconciled)::INTEGER AS unreconciled_withdrawals
         FROM bank_transactions`
    );
    const unmatched = await pool.query(
      `SELECT COUNT(*)::INTEGER AS n FROM requests r
        WHERE r.status = 'paid'
          AND NOT EXISTS (SELECT 1 FROM bank_transactions b WHERE b.matched_request_id = r.id)`
    );
    summary.bank_balance_cents = Number(bank.rows[0].balance);
    summary.unreconciled_withdrawals = bank.rows[0].unreconciled_withdrawals;
    summary.paid_requests_unmatched = unmatched.rows[0].n;
    // drift: does the NFCU account agree with the books?
    summary.drift_cents = summary.bank_balance_cents - balance;
  }

  // Beneficiary: own request totals only (loan figures omitted above).
  if (!user.permissions.viewAllExpenses) {
    const mine = await pool.query(
      `SELECT COALESCE(SUM(amount_cents) FILTER (WHERE status = 'paid'),0)::INTEGER AS my_paid_cents,
              COUNT(*) FILTER (WHERE status = 'pending')::INTEGER AS my_pending_count
         FROM requests WHERE requested_by = $1`,
      [user.id]
    );
    summary.my_paid_cents = mine.rows[0].my_paid_cents;
    summary.my_pending_count = mine.rows[0].my_pending_count;
    delete summary.paid_cents;
    delete summary.paid_count;
    delete summary.pending_cents;
    delete summary.pending_count;
    delete summary.approved_cents;
    delete summary.approved_count;
  }

  return summary;
}

function csvEscape(v) {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// GET /ledger/summary — all roles; fields scoped by permission
router.get('/summary', requireAuth, async (req, res) => {
  try {
    res.json({ summary: await computeSummary(req.user) });
  } catch (err) {
    console.error('[MafoLedger] Summary error:', err);
    res.status(500).json({ error: 'Failed to compute ledger summary' });
  }
});

// GET /ledger/export.csv — requests CSV, respects beneficiary scoping
router.get('/export.csv', requireAuth, async (req, res) => {
  try {
    const scoped = req.user.permissions.viewAllExpenses;
    const sql = `
      SELECT r.id, r.created_at, r.vendor, r.category, r.amount_cents, r.status,
             u.full_name AS requested_by_name, r.payment_ref, r.paid_at
        FROM requests r JOIN users u ON u.id = r.requested_by
        ${scoped ? '' : 'WHERE r.requested_by = $1'}
       ORDER BY r.created_at`;
    const r = await pool.query(sql, scoped ? [] : [req.user.id]);

    const header = 'id,date,vendor,category,amount_cents,status,requested_by,payment_ref,paid_at';
    const lines = r.rows.map(row => [
      row.id, row.created_at?.toISOString(), row.vendor, row.category,
      row.amount_cents, row.status, row.requested_by_name,
      row.payment_ref, row.paid_at?.toISOString().slice(0, 10),
    ].map(csvEscape).join(','));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition',
      `attachment; filename="Mafo-Aabo-Ledger-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send([header, ...lines].join('\n') + '\n');
  } catch (err) {
    console.error('[MafoLedger] Export error:', err);
    res.status(500).json({ error: 'Failed to export ledger' });
  }
});

export default router;
