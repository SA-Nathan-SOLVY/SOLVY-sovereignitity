/**
 * MAFO AABO Trust™ — document vault (encrypted at rest).
 *
 * Files are AES-256-GCM encrypted before hitting disk (lib/crypto.js),
 * stored OUTSIDE the web root under UPLOAD_DIR (default ./uploads).
 * On-disk format: [12-byte IV][16-byte auth tag][ciphertext]; the row
 * stores sha256 of the plaintext for integrity verification.
 *
 * Scoping:
 *   trustee   — upload any category, list/download/delete all
 *   grantor   — list/download all (read-only)
 *   beneficiary — list/download only receipts linked to their own requests;
 *                 upload category 'receipt' linked to a request they own
 */
import { Router } from 'express';
import multer from 'multer';
import crypto from 'crypto';
import fsp from 'fs/promises';
import path from 'path';
import pool, { audit } from '../db.js';
import { requireAuth, requirePerm } from '../lib/requireRole.js';
import { encryptBuffer, decryptBuffer, sha256Hex } from '../lib/crypto.js';

const router = Router();

const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || './uploads');
const MAX_BYTES = 15 * 1024 * 1024; // 15MB
const ALLOWED_MIME = new Set(['application/pdf', 'image/png', 'image/jpeg', 'image/webp']);
const CATEGORIES = new Set(['trust_document', 'promissory_note', 'receipt', 'bank_statement', 'other']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      return cb(new Error('Only pdf/png/jpg/jpeg/webp files are allowed'));
    }
    cb(null, true);
  },
});

/** Run multer and map its errors (bad mime, oversize) to clean 4xx JSON. */
function uploadSingle(req, res, next) {
  upload.single('file')(req, res, err => {
    if (!err) return next();
    const client = err.code === 'LIMIT_FILE_SIZE' || /allowed/i.test(err.message);
    res.status(client ? 400 : 500).json({
      error: err.code === 'LIMIT_FILE_SIZE' ? 'File exceeds the 15MB limit' : err.message,
    });
  });
}

const SELECT = `
  SELECT d.id, d.category, d.label, d.original_filename, d.mime_type, d.size_bytes,
         d.request_id, d.sha256, d.created_at, u.full_name AS uploaded_by_name
    FROM documents d
    JOIN users u ON u.id = d.uploaded_by
`;

/** Can this user see this document row? */
async function canAccess(user, doc) {
  if (user.permissions.viewAllDocuments) return true;
  if (doc.category !== 'receipt' || !doc.request_id) return false;
  const r = await pool.query('SELECT requested_by FROM requests WHERE id = $1', [doc.request_id]);
  return r.rows.length > 0 && r.rows[0].requested_by === user.id;
}

// POST /documents — trustee: any category; beneficiary: receipt on own request
router.post('/', requireAuth, uploadSingle, async (req, res) => {
  try {
    const { category, label, request_id } = req.body || {};
    if (!req.file) return res.status(400).json({ error: 'file is required' });
    if (!category || !CATEGORIES.has(category)) {
      return res.status(400).json({ error: `category must be one of: ${[...CATEGORIES].join(', ')}` });
    }

    let requestId = null;
    if (req.user.permissions.canUploadDocuments) {
      // trustee — any category; optional receipt link
      if (category === 'receipt' && request_id) requestId = Number(request_id);
    } else if (req.user.permissions.canUploadReceipt) {
      // beneficiary — receipts only, on a request they own
      if (category !== 'receipt') {
        return res.status(403).json({ error: 'Beneficiaries may only upload receipts' });
      }
      if (!request_id) return res.status(400).json({ error: 'request_id is required for receipts' });
      requestId = Number(request_id);
      const own = await pool.query('SELECT requested_by FROM requests WHERE id = $1', [requestId]);
      if (own.rows.length === 0) return res.status(404).json({ error: 'Request not found' });
      if (own.rows[0].requested_by !== req.user.id) {
        return res.status(403).json({ error: 'You can only attach receipts to your own requests' });
      }
    } else {
      return res.status(403).json({ error: 'Forbidden: insufficient role permissions' });
    }

    const plaintext = req.file.buffer;
    const blob = encryptBuffer(plaintext);
    await fsp.mkdir(UPLOAD_DIR, { recursive: true });
    const storagePath = path.join(UPLOAD_DIR, `${crypto.randomUUID()}.enc`);
    await fsp.writeFile(storagePath, blob);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const r = await client.query(
        `INSERT INTO documents
           (uploaded_by, category, label, original_filename, mime_type, size_bytes,
            storage_path, request_id, sha256)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
        [req.user.id, category, label || null, req.file.originalname, req.file.mimetype,
         plaintext.length, storagePath, requestId, sha256Hex(plaintext)]
      );
      const id = r.rows[0].id;
      await audit(client, req.user.id, 'document.uploaded', `document:${id}`,
        { category, label: label || null, original_filename: req.file.originalname,
          size_bytes: plaintext.length, request_id: requestId });
      await client.query('COMMIT');
      const full = await pool.query(`${SELECT} WHERE d.id = $1`, [id]);
      res.status(201).json({ document: full.rows[0] });
    } catch (err) {
      await client.query('ROLLBACK');
      await fsp.unlink(storagePath).catch(() => {}); // don't leave orphans
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[MafoDocs] Upload error:', err);
    if (err.message.includes('DOC_ENCRYPTION_KEY')) {
      return res.status(503).json({ error: 'Document vault not configured' });
    }
    res.status(err.message.includes('allowed') ? 400 : 500).json({ error: err.message });
  }
});

// GET /documents — metadata list, scoped
router.get('/', requireAuth, async (req, res) => {
  try {
    let rows;
    if (req.user.permissions.viewAllDocuments) {
      rows = (await pool.query(`${SELECT} ORDER BY d.created_at DESC`)).rows;
    } else {
      rows = (await pool.query(
        `${SELECT} JOIN requests rq ON rq.id = d.request_id
         WHERE d.category = 'receipt' AND rq.requested_by = $1
         ORDER BY d.created_at DESC`,
        [req.user.id]
      )).rows;
    }
    res.json({ documents: rows });
  } catch (err) {
    console.error('[MafoDocs] List error:', err);
    res.status(500).json({ error: 'Failed to list documents' });
  }
});

// GET /documents/:id/file — stream decrypted file, scoped. Audited.
router.get('/:id/file', requireAuth, async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM documents WHERE id = $1', [req.params.id]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'Document not found' });
    const doc = r.rows[0];
    if (!(await canAccess(req.user, doc))) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const blob = await fsp.readFile(doc.storage_path);
    const plaintext = decryptBuffer(blob);
    if (sha256Hex(plaintext) !== doc.sha256) {
      console.error(`[MafoDocs] Integrity check failed for document:${doc.id}`);
      return res.status(500).json({ error: 'File integrity check failed' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await audit(client, req.user.id, 'document.downloaded', `document:${doc.id}`,
        { original_filename: doc.original_filename });
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    res.setHeader('Content-Type', doc.mime_type);
    res.setHeader('Content-Disposition',
      `inline; filename="${doc.original_filename.replace(/"/g, '')}"`);
    res.send(plaintext);
  } catch (err) {
    console.error('[MafoDocs] Download error:', err);
    res.status(500).json({ error: 'Failed to read document' });
  }
});

// DELETE /documents/:id — trustee only. Audited.
router.delete('/:id', requirePerm('canDeleteDocuments'), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const r = await client.query(
      'DELETE FROM documents WHERE id = $1 RETURNING id, storage_path, original_filename',
      [req.params.id]
    );
    if (r.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Document not found' });
    }
    const doc = r.rows[0];
    await audit(client, req.user.id, 'document.deleted', `document:${doc.id}`,
      { original_filename: doc.original_filename });
    await client.query('COMMIT');
    await fsp.unlink(doc.storage_path).catch(() => {}); // best-effort file cleanup
    res.json({ deleted: doc.id });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[MafoDocs] Delete error:', err);
    res.status(500).json({ error: 'Failed to delete document' });
  } finally {
    client.release();
  }
});

export default router;
