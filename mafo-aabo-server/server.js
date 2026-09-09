/**
 * MAFO AABO Trust™ — API server (Phase 0: Go-Live)
 * Runs on Hetzner (or any Linux VPS). NO Replit-specific dependencies.
 * Pattern follows server/vps.mjs.
 *
 * Serves:
 *   - Static frontend (solvy-platform/mafo-aabo/index.html)
 *   - /api/mafo/* routes via Express
 *
 * Required env vars (see .env.example):
 *   DATABASE_URL, SESSION_SECRET, PORT (default 3002), TRUST_DOMAIN
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import path from 'path';
import { fileURLToPath } from 'url';

import pool, { initSchema } from './db.js';
import { loadUser } from './lib/requireRole.js';
import authRoutes from './routes/auth.js';
import requestRoutes from './routes/requests.js';
import loanRoutes from './routes/loans.js';
import ledgerRoutes from './routes/ledger.js';
import auditRoutes from './routes/audit.js';
import documentRoutes from './routes/documents.js';
import bankRoutes from './routes/bank.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3002;
const TRUST_DOMAIN = process.env.TRUST_DOMAIN || 'trust.solvy.cards';
const IS_PROD = process.env.NODE_ENV === 'production';
const IS_TEST = process.env.NODE_ENV === 'test';

const app = express();

// ── Security headers ──────────────────────────────────────────────────────────
// The portal is a single self-contained HTML file with an inline <script> and
// inline onclick handlers, so CSP must allow inline scripts/styles for it.
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      frameAncestors: ["'self'"],
      upgradeInsecureRequests: null, // stays compatible with local http dev
    },
  },
}));
app.use((req, res, next) => {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow'); // internal family tool
  next();
});

// ── CORS: restricted to the trust hostname ────────────────────────────────────
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || `https://${TRUST_DOMAIN}`)
  .split(',').map(o => o.trim());
// Local development serves the portal from the same origin over http://localhost
if (!IS_PROD) {
  ALLOWED_ORIGINS.push('http://localhost:3002', 'http://127.0.0.1:3002');
}
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // same-origin / curl
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
}));

app.use(express.json());

// ── Sessions (Postgres-backed; secure cookies in production only) ────────────
const PgSession = connectPgSimple(session);
if (IS_PROD) app.set('trust proxy', 1); // behind Nginx
app.use(session({
  name: 'mafo.sid',
  store: new PgSession({ pool, createTableIfMissing: true }),
  secret: process.env.SESSION_SECRET || 'mafo-dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: IS_PROD,           // HTTPS-only in production; HTTP works locally
    sameSite: 'lax',
    maxAge: 8 * 60 * 60 * 1000, // 8 hours
  },
}));

app.use(loadUser);

// ── Rate limiting ─────────────────────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // slow brute force on access codes
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => IS_TEST,
  handler: (req, res) => res.status(429).json({ error: 'Too many attempts — please try again later' }),
});
app.use('/api/mafo/auth/login', loginLimiter);

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/mafo/auth', authRoutes);
app.use('/api/mafo/requests', requestRoutes);
app.use('/api/mafo/loans', loanRoutes);
app.use('/api/mafo/ledger', ledgerRoutes);
app.use('/api/mafo/audit', auditRoutes);
app.use('/api/mafo/documents', documentRoutes);
app.use('/api/mafo/bank-transactions', bankRoutes);

app.get('/api/mafo/health', (_req, res) => {
  res.json({ status: 'ok', service: 'mafo-api', ts: new Date().toISOString() });
});

// ── Static frontend (single-page app) ─────────────────────────────────────────
const webDir = process.env.WEB_DIR || path.join(__dirname, '..', 'solvy-platform', 'mafo-aabo');
app.use(express.static(webDir));
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(webDir, 'index.html'));
});

// ── Start (skipped when imported by tests) ────────────────────────────────────
export async function start() {
  await initSchema();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✓ MAFO AABO API running on port ${PORT}`);
    console.log(`  Domain : ${TRUST_DOMAIN}`);
    console.log(`  Env    : ${process.env.NODE_ENV || 'development'}`);
  });
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === __filename;
if (isMain) {
  start().catch(err => {
    console.error('Failed to start:', err);
    process.exit(1);
  });
}

export default app;
