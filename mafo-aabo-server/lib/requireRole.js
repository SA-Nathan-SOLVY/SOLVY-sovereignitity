/**
 * MAFO AABO Trust™ — session + permission middleware.
 *
 * requireAuth          → 401 unless a session user is loaded
 * requirePerm('canApprove') → 403 unless the session user's role has the flag
 */
import pool from '../db.js';
import { permissionsFor } from './roles.js';

/** Load the session user onto req.user (id, role, full_name, permissions). */
export async function loadUser(req, res, next) {
  if (!req.session?.userId) return next();
  try {
    const r = await pool.query(
      'SELECT id, role, full_name FROM users WHERE id = $1 AND active = TRUE',
      [req.session.userId]
    );
    if (r.rows.length === 0) {
      req.session.destroy(() => {});
      return next();
    }
    const u = r.rows[0];
    req.user = { id: u.id, role: u.role, fullName: u.full_name, permissions: permissionsFor(u.role) };
    next();
  } catch (err) {
    next(err);
  }
}

export function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  next();
}

export function requirePerm(perm) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (!req.user.permissions?.[perm]) {
      return res.status(403).json({ error: 'Forbidden: insufficient role permissions' });
    }
    next();
  };
}
