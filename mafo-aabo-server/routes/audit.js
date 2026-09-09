/**
 * MAFO AABO Trust™ — audit trail read + CSV export (trustee only).
 * MAN (Mandatory Audit Network) — append-only, written in the same
 * transaction as every mutation.
 */
import { Router } from 'express';
import pool from '../db.js';
import { requirePerm } from '../lib/requireRole.js';

const router = Router();

const SELECT = `
  SELECT a.id, a.action, a.entity, a.detail, a.created_at,
         u.full_name AS actor_name, u.role AS actor_role
    FROM audit_log a
    LEFT JOIN users u ON u.id = a.actor_id
   ORDER BY a.created_at DESC, a.id DESC
`;

// GET /audit — trustee
router.get('/', requirePerm('viewAudit'), async (req, res) => {
  try {
    const r = await pool.query(`${SELECT} LIMIT 500`);
    res.json({ audit: r.rows });
  } catch (err) {
    console.error('[MafoAudit] List error:', err);
    res.status(500).json({ error: 'Failed to list audit trail' });
  }
});

function csvEscape(v) {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// GET /audit/export.csv — trustee
router.get('/export.csv', requirePerm('viewAudit'), async (req, res) => {
  try {
    const r = await pool.query(SELECT);
    const header = 'id,timestamp,action,entity,actor,role,detail';
    const lines = r.rows.map(a => [
      a.id, a.created_at?.toISOString(), a.action, a.entity,
      a.actor_name || 'System', a.actor_role || 'system',
      typeof a.detail === 'string' ? a.detail : JSON.stringify(a.detail),
    ].map(csvEscape).join(','));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition',
      `attachment; filename="Mafo-Aabo-Audit-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send([header, ...lines].join('\n') + '\n');
  } catch (err) {
    console.error('[MafoAudit] Export error:', err);
    res.status(500).json({ error: 'Failed to export audit trail' });
  }
});

export default router;
