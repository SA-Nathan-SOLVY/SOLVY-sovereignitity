/**
 * MAFO AABO Trust™ — family loans + repayments.
 * Trustee creates loans (created = active: the trustee's creation IS the
 * approval in Phase 0). Repay/loan UI polish beyond this is Phase 1.
 * Outstanding = principal − Σ(repayments); fully repaid → status 'repaid'.
 */
import { Router } from 'express';
import pool, { audit } from '../db.js';
import { requirePerm } from '../lib/requireRole.js';

const router = Router();

const SELECT_BASE = `
  SELECT l.id, l.borrower, l.amount_cents, l.rate_bp, l.term_months, l.purpose,
         l.status, l.trustee_note, l.created_at,
         COALESCE(SUM(rp.amount_cents), 0)::INTEGER AS repaid_cents,
         (l.amount_cents - COALESCE(SUM(rp.amount_cents), 0))::INTEGER AS outstanding_cents
    FROM loans l
    LEFT JOIN loan_repayments rp ON rp.loan_id = l.id
`;
const SELECT_LIST   = `${SELECT_BASE} GROUP BY l.id ORDER BY l.created_at DESC`;
const SELECT_SINGLE = `${SELECT_BASE} WHERE l.id = $1 GROUP BY l.id`;

// GET /loans — trustee, grantor (list loans + outstanding)
router.get('/', requirePerm('viewLoans'), async (req, res) => {
  try {
    const r = await pool.query(SELECT_LIST);
    res.json({ loans: r.rows });
  } catch (err) {
    console.error('[MafoLoans] List error:', err);
    res.status(500).json({ error: 'Failed to list loans' });
  }
});

// POST /loans — trustee creates a loan (amount in integer cents)
router.post('/', requirePerm('canCreateLoan'), async (req, res) => {
  const { borrower, amount_cents, rate_bp = 0, term_months = 12, purpose } = req.body || {};
  if (!borrower || !purpose) {
    return res.status(400).json({ error: 'borrower and purpose are required' });
  }
  if (!Number.isInteger(amount_cents) || amount_cents <= 0) {
    return res.status(400).json({ error: 'amount_cents must be a positive integer' });
  }
  if (!Number.isInteger(rate_bp) || rate_bp < 0 || !Number.isInteger(term_months) || term_months <= 0) {
    return res.status(400).json({ error: 'rate_bp and term_months must be non-negative/positive integers' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const r = await client.query(
      `INSERT INTO loans (borrower, amount_cents, rate_bp, term_months, purpose, status, created_by)
       VALUES ($1, $2, $3, $4, $5, 'active', $6) RETURNING id`,
      [borrower, amount_cents, rate_bp, term_months, purpose, req.user.id]
    );
    const id = r.rows[0].id;
    await audit(client, req.user.id, 'loan.created', `loan:${id}`,
      { borrower, amount_cents, rate_bp, term_months });
    await client.query('COMMIT');
    const full = await pool.query(SELECT_SINGLE, [id]);
    res.status(201).json({ loan: full.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[MafoLoans] Create error:', err);
    res.status(500).json({ error: 'Failed to create loan' });
  } finally {
    client.release();
  }
});

// POST /loans/:id/repayments — trustee records a repayment (integer cents)
router.post('/:id/repayments', requirePerm('canCreateLoan'), async (req, res) => {
  const { amount_cents, note } = req.body || {};
  if (!Number.isInteger(amount_cents) || amount_cents <= 0) {
    return res.status(400).json({ error: 'amount_cents must be a positive integer' });
  }
  const loanId = req.params.id;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const cur = await client.query(
      'SELECT amount_cents, status FROM loans WHERE id = $1 FOR UPDATE',
      [loanId]
    );
    if (cur.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Loan not found' });
    }
    const loan = cur.rows[0];
    if (loan.status !== 'active') {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: `Loan is '${loan.status}', expected 'active'` });
    }
    const rep = await client.query(
      'SELECT COALESCE(SUM(amount_cents),0)::INTEGER AS repaid FROM loan_repayments WHERE loan_id = $1',
      [loanId]
    );
    const outstanding = loan.amount_cents - rep.rows[0].repaid;
    if (amount_cents > outstanding) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: `Repayment exceeds outstanding balance (${outstanding} cents)` });
    }

    await client.query(
      'INSERT INTO loan_repayments (loan_id, amount_cents, note) VALUES ($1, $2, $3)',
      [loanId, amount_cents, note || null]
    );
    const newOutstanding = outstanding - amount_cents;
    if (newOutstanding === 0) {
      await client.query(`UPDATE loans SET status = 'repaid' WHERE id = $1`, [loanId]);
    }
    await audit(client, req.user.id, 'loan.repayment', `loan:${loanId}`,
      { amount_cents, outstanding_cents: newOutstanding });
    await client.query('COMMIT');
    const full = await pool.query(SELECT_SINGLE, [loanId]);
    res.json({ loan: full.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[MafoLoans] Repayment error:', err);
    res.status(500).json({ error: 'Failed to record repayment' });
  } finally {
    client.release();
  }
});

export default router;
