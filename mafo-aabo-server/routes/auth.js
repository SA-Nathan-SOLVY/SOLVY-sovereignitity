/**
 * MAFO AABO Trust™ — auth routes: login / logout / me
 * Codes are bcrypt-hashed per-person credentials seeded from env vars.
 */
import { Router } from 'express';
import bcrypt from 'bcrypt';
import pool, { audit } from '../db.js';
import { permissionsFor } from '../lib/roles.js';
import { requireAuth } from '../lib/requireRole.js';

const router = Router();

function publicUser(u) {
  return {
    id: u.id,
    role: u.role,
    fullName: u.full_name ?? u.fullName,
    permissions: permissionsFor(u.role),
  };
}

// POST /auth/login  { role, code } → session
router.post('/login', async (req, res) => {
  const { role, code } = req.body || {};
  if (!role || !code) return res.status(400).json({ error: 'role and code are required' });

  try {
    const r = await pool.query(
      'SELECT id, role, full_name, access_code_hash FROM users WHERE role = $1 AND active = TRUE',
      [role]
    );
    // Compare against every active user of that role (normally one) so a wrong
    // role+code pair never reveals which part failed.
    let matched = null;
    for (const u of r.rows) {
      if (await bcrypt.compare(String(code), u.access_code_hash)) { matched = u; break; }
    }
    if (!matched) return res.status(401).json({ error: 'Invalid access code' });

    await new Promise((resolve, reject) =>
      req.session.regenerate(err => (err ? reject(err) : resolve()))
    );
    req.session.userId = matched.id;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await audit(client, matched.id, 'auth.login', `user:${matched.id}`, { role: matched.role });
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    res.json({ user: publicUser(matched) });
  } catch (err) {
    console.error('[MafoAuth] Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('mafo.sid');
    res.json({ success: true });
  });
});

// GET /auth/me → current user + permissions
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

export default router;
