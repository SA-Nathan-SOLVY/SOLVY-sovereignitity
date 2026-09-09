/**
 * MAFO AABO Trust™ — NFCU bank ledger (manual entries).
 *
 * Ledger-like: entries are never updated or deleted. Corrections are new
 * offsetting entries with a note. Reconciliation links a withdrawal to a
 * PAID request (a paid request matches at most one bank transaction —
 * enforced by the unique partial index bank_tx_request_unique).
 *
 * Access: trustee write, trustee+grantor read, beneficiary none.
 */
import { Router } from 'express';
import pool, { audit } from '../db.js';
import { requirePerm } from '../lib/requireRole.js';

const router = Router();

// GET /bank-transactions — list with running balance computed in SQL
router.get('/', requirePerm('viewBank'), async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT b.id, b.account_label, b.posted_on, b.description, b.amount_cents,
             b.matched_request_id, b.reconciled, b.note, b.created_at,
             u.full_name AS entered_by_name,
             SUM(b.amount_cents) OVER (ORDER BY b.posted_on, b.id)::BIGINT AS running_balance_cents
        FROM bank_transactions b
        JOIN users u ON u.id = b.entered_by
       ORDER BY b.posted_on DESC, b.id DESC
    `);
    res.json({ transactions: r.rows });
  } catch (err) {
    console.error('[MafoBank] List error:', err);
    res.status(500).json({ error: 'Failed to list bank transactions' });
  }
});

// POST /bank-transactions — trustee enters a manual NFCU entry
router.post('/', requirePerm('canManageBank'), async (req, res) => {
  const { account_label, posted_on, description, amount_cents, note } = req.body || {};
  if (!posted_on || Number.isNaN(Date.parse(posted_on))) {
    return res.status(400).json({ error: 'posted_on (YYYY-MM-DD) is required' });
  }
  if (!description || !String(description).trim()) {
    return res.status(400).json({ error: 'description is required' });
  }
  if (!Number.isInteger(amount_cents) || amount_cents === 0) {
    return res.status(400).json({ error: 'amount_cents must be a non-zero integer (signed)' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const r = await client.query(
      `INSERT INTO bank_transactions (account_label, posted_on, description, amount_cents, entered_by, note)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [account_label || 'NFCU', posted_on, description.trim(), amount_cents, req.user.id, note || null]
    );
    const id = r.rows[0].id;
    await audit(client, req.user.id, 'bank.entry', `bank:${id}`,
      { posted_on, description: description.trim(), amount_cents });
    await client.query('COMMIT');
    const full = await pool.query('SELECT * FROM bank_transactions WHERE id = $1', [id]);
    res.status(201).json({ transaction: full.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[MafoBank] Entry error:', err);
    res.status(500).json({ error: 'Failed to record bank entry' });
  } finally {
    client.release();
  }
});

// POST /bank-transactions/:id/reconcile — match a withdrawal to a PAID request
router.post('/:id/reconcile', requirePerm('canManageBank'), async (req, res) => {
  const requestId = Number(req.body?.request_id);
  if (!Number.isInteger(requestId)) {
    return res.status(400).json({ error: 'request_id is required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const txRes = await client.query(
      'SELECT * FROM bank_transactions WHERE id = $1 FOR UPDATE', [req.params.id]
    );
    if (txRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Bank transaction not found' });
    }
    const tx = txRes.rows[0];
    if (tx.reconciled) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Transaction is already reconciled' });
    }
    if (tx.amount_cents >= 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Only withdrawals (negative amounts) reconcile to requests' });
    }

    const reqRes = await client.query(
      'SELECT id, status, amount_cents FROM requests WHERE id = $1 FOR UPDATE', [requestId]
    );
    if (reqRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Request not found' });
    }
    const requestRow = reqRes.rows[0];
    if (requestRow.status !== 'paid') {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: `Request is '${requestRow.status}' — only paid requests reconcile` });
    }
    const dup = await client.query(
      'SELECT id FROM bank_transactions WHERE matched_request_id = $1', [requestId]
    );
    if (dup.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: `Request ${requestId} is already matched to bank transaction ${dup.rows[0].id}` });
    }

    const amountMismatch = Math.abs(tx.amount_cents) !== requestRow.amount_cents;
    await client.query(
      'UPDATE bank_transactions SET matched_request_id = $2, reconciled = TRUE WHERE id = $1',
      [tx.id, requestId]
    );
    await audit(client, req.user.id, 'bank.reconciled', `bank:${tx.id}`,
      { request_id: requestId, bank_amount_cents: tx.amount_cents,
        request_amount_cents: requestRow.amount_cents, amount_mismatch: amountMismatch });
    await client.query('COMMIT');
    const full = await pool.query('SELECT * FROM bank_transactions WHERE id = $1', [tx.id]);
    res.json({ transaction: full.rows[0], amount_mismatch: amountMismatch });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[MafoBank] Reconcile error:', err);
    res.status(500).json({ error: 'Failed to reconcile' });
  } finally {
    client.release();
  }
});

// POST /bank-transactions/:id/unreconcile — clear the match
router.post('/:id/unreconcile', requirePerm('canManageBank'), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const txRes = await client.query(
      'SELECT * FROM bank_transactions WHERE id = $1 FOR UPDATE', [req.params.id]
    );
    if (txRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Bank transaction not found' });
    }
    const tx = txRes.rows[0];
    if (!tx.reconciled) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Transaction is not reconciled' });
    }
    await client.query(
      'UPDATE bank_transactions SET matched_request_id = NULL, reconciled = FALSE WHERE id = $1',
      [tx.id]
    );
    await audit(client, req.user.id, 'bank.unreconciled', `bank:${tx.id}`,
      { previous_request_id: tx.matched_request_id });
    await client.query('COMMIT');
    const full = await pool.query('SELECT * FROM bank_transactions WHERE id = $1', [tx.id]);
    res.json({ transaction: full.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[MafoBank] Unreconcile error:', err);
    res.status(500).json({ error: 'Failed to unreconcile' });
  } finally {
    client.release();
  }
});

function csvEscape(v) {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// GET /bank-transactions/export.csv — trustee/grantor
router.get('/export.csv', requirePerm('viewBank'), async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT b.id, b.posted_on, b.description, b.amount_cents, b.reconciled,
             b.matched_request_id, b.note, u.full_name AS entered_by_name,
             SUM(b.amount_cents) OVER (ORDER BY b.posted_on, b.id)::BIGINT AS running_balance_cents
        FROM bank_transactions b JOIN users u ON u.id = b.entered_by
       ORDER BY b.posted_on, b.id
    `);
    const header = 'id,posted_on,description,amount_cents,running_balance_cents,reconciled,matched_request_id,note,entered_by';
    const lines = r.rows.map(t => [
      t.id, t.posted_on?.toISOString().slice(0, 10), t.description, t.amount_cents,
      t.running_balance_cents, t.reconciled, t.matched_request_id, t.note, t.entered_by_name,
    ].map(csvEscape).join(','));
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition',
      `attachment; filename="Mafo-Aabo-Bank-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send([header, ...lines].join('\n') + '\n');
  } catch (err) {
    console.error('[MafoBank] Export error:', err);
    res.status(500).json({ error: 'Failed to export bank ledger' });
  }
});

export default router;
