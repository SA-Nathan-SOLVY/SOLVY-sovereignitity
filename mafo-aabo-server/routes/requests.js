/**
 * MAFO AABO Trust™ — replenishment / supplemental-needs request workflow.
 * status flow: pending → approved → paid   (or → rejected)
 * Every mutation writes an audit_log row inside the same transaction.
 */
import { Router } from 'express';
import pool, { audit } from '../db.js';
import { requireAuth, requirePerm } from '../lib/requireRole.js';

const router = Router();

const SELECT = `
  SELECT r.id, r.vendor, r.amount_cents, r.category, r.method, r.description,
         r.status, r.trustee_note, r.payment_ref, r.paid_at, r.created_at,
         r.decided_at, u.full_name AS requested_by_name
    FROM requests r
    JOIN users u ON u.id = r.requested_by
`;

// POST /requests — beneficiary submits a request (amount in integer cents)
router.post('/', requirePerm('canRequest'), async (req, res) => {
  const { vendor, amount_cents, category, method, description } = req.body || {};
  if (!vendor || !category || !method) {
    return res.status(400).json({ error: 'vendor, category and method are required' });
  }
  if (!Number.isInteger(amount_cents) || amount_cents <= 0) {
    return res.status(400).json({ error: 'amount_cents must be a positive integer' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const r = await client.query(
      `INSERT INTO requests (requested_by, vendor, amount_cents, category, method, description)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [req.user.id, vendor, amount_cents, category, method, description || null]
    );
    const id = r.rows[0].id;
    await audit(client, req.user.id, 'request.submitted', `request:${id}`,
      { vendor, amount_cents, category, method });
    await client.query('COMMIT');
    const full = await pool.query(`${SELECT} WHERE r.id = $1`, [id]);
    res.status(201).json({ request: full.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[MafoRequests] Submit error:', err);
    res.status(500).json({ error: 'Failed to submit request' });
  } finally {
    client.release();
  }
});

// GET /requests — trustee/grantor see all; beneficiary sees own only
router.get('/', requireAuth, async (req, res) => {
  try {
    const scoped = req.user.permissions.viewAllExpenses;
    const sql = scoped ? `${SELECT} ORDER BY r.created_at DESC`
                       : `${SELECT} WHERE r.requested_by = $1 ORDER BY r.created_at DESC`;
    const r = await pool.query(sql, scoped ? [] : [req.user.id]);
    res.json({ requests: r.rows });
  } catch (err) {
    console.error('[MafoRequests] List error:', err);
    res.status(500).json({ error: 'Failed to list requests' });
  }
});

/** Shared transition helper: validate current status, update, audit — one tx.
 *  extraFields are extra SET clauses using $5+; extraParams are their values. */
async function transition(req, res, id, { from, to, action, extraFields = '', extraParams = [], detail }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const cur = await client.query('SELECT status FROM requests WHERE id = $1 FOR UPDATE', [id]);
    if (cur.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Request not found' });
    }
    if (cur.rows[0].status !== from) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: `Request is '${cur.rows[0].status}', expected '${from}'` });
    }
    await client.query(
      `UPDATE requests SET status = $2, trustee_note = $3, decided_by = $4, decided_at = NOW() ${extraFields}
       WHERE id = $1`,
      [id, to, req.body?.note ?? null, req.user.id, ...extraParams]
    );
    await audit(client, req.user.id, action, `request:${id}`, detail(req));
    await client.query('COMMIT');
    const full = await pool.query(`${SELECT} WHERE r.id = $1`, [id]);
    res.json({ request: full.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`[MafoRequests] ${action} error:`, err);
    res.status(500).json({ error: 'Failed to update request' });
  } finally {
    client.release();
  }
}

// POST /requests/:id/approve — trustee, with note
router.post('/:id/approve', requirePerm('canApprove'), (req, res) =>
  transition(req, res, req.params.id, {
    from: 'pending', to: 'approved', action: 'request.approved', extraFields: '',
    detail: r => ({ note: r.body?.note ?? null }),
  })
);

// POST /requests/:id/reject — trustee, note required
router.post('/:id/reject', requirePerm('canApprove'), (req, res) => {
  if (!req.body?.note || !String(req.body.note).trim()) {
    return res.status(400).json({ error: 'A trustee note is required to reject a request' });
  }
  return transition(req, res, req.params.id, {
    from: 'pending', to: 'rejected', action: 'request.rejected', extraFields: '',
    detail: r => ({ note: r.body.note }),
  });
});

// POST /requests/:id/pay — trustee records payment ref + date → status 'paid'
router.post('/:id/pay', requirePerm('canPay'), (req, res) => {
  const { payment_ref, paid_at } = req.body || {};
  if (!payment_ref || !String(payment_ref).trim()) {
    return res.status(400).json({ error: 'payment_ref is required' });
  }
  const paidAt = paid_at && !Number.isNaN(Date.parse(paid_at)) ? new Date(paid_at) : new Date();
  return transition(req, res, req.params.id, {
    from: 'approved', to: 'paid', action: 'request.paid',
    extraFields: ', payment_ref = $5, paid_at = $6',
    extraParams: [payment_ref, paidAt],
    detail: r => ({ payment_ref, paid_at: paidAt.toISOString() }),
  });
});

export default router;
