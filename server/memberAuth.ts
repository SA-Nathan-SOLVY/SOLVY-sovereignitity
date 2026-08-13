import crypto from 'crypto';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import type { Pool } from 'pg';
import type { Express, RequestHandler, Request, Response } from 'express';
import { sendMemberVerificationCode } from './emailService';

// ─── Member identity verification ─────────────────────────────────────────────
// The public app has no traditional login. To make governance votes and data-pool
// opt-ins trustworthy, a member must first prove they control an email address by
// entering a one-time code we send to it. The verified email is then held in a
// server-side session and used as the member's identity — votes and opt-ins are
// tied to that verified identity instead of a free-text email typed into a form.

declare module 'express-session' {
  interface SessionData {
    verifiedEmail?: string;
    memberId?: number;
    pendingEmail?: string;
    pendingCodeHash?: string;
    pendingExpiresAt?: number;
    pendingAttempts?: number;
  }
}

const CODE_TTL_MS = 10 * 60 * 1000; // codes expire after 10 minutes
const MAX_ATTEMPTS = 5;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function hashCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

function timingSafeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'hex');
  const bufB = Buffer.from(b, 'hex');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// Dedicated session middleware for member verification. It uses its own cookie
// name and store table so it never collides with the Replit OIDC/passport session
// (which is set up separately and only used for staff/admin auth). A single shared
// instance is reused across every member-scoped route.
let _memberSession: RequestHandler | null = null;
export function getMemberSession(): RequestHandler {
  if (_memberSession) return _memberSession;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: 7 * 24 * 60 * 60,
    tableName: 'member_sessions',
  });
  _memberSession = session({
    name: 'solvy.member',
    secret: process.env.SESSION_SECRET || 'dev-only-insecure-secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: IS_PRODUCTION ? true : 'auto',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  });
  return _memberSession;
}

// Record (or refresh) a verified member identity in the durable `members` table.
// Called on every successful verification so returning members are recognized
// across devices and after they clear cookies. Returns the member row id, which
// vote/opt-in flows can optionally link to. Only the email is stored — no other PII.
export async function upsertMember(pool: Pool, email: string): Promise<number | null> {
  const normalized = email.toLowerCase().trim();
  const result = await pool.query(
    `INSERT INTO members (email) VALUES ($1)
     ON CONFLICT (email) DO UPDATE SET last_verified_at = NOW()
     RETURNING id`,
    [normalized]
  );
  return result.rows[0]?.id ?? null;
}

// Guard for endpoints that require a verified member identity.
export const requireVerifiedMember: RequestHandler = (req, res, next) => {
  if (!req.session?.verifiedEmail) {
    return res.status(401).json({ error: 'Please verify your member email before continuing.' });
  }
  next();
};

export function registerMemberAuthRoutes(app: Express, limiter: RequestHandler, pool: Pool): void {
  const memberSession = getMemberSession();

  // Step 1 — request a one-time code to a member email.
  app.post('/api/member-auth/request-code', limiter, memberSession, async (req: Request, res: Response) => {
    try {
      const rawEmail = String(req.body?.email ?? '').toLowerCase().trim();
      if (!rawEmail || !EMAIL_RE.test(rawEmail)) {
        return res.status(400).json({ error: 'A valid email is required.' });
      }

      const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
      req.session.pendingEmail = rawEmail;
      req.session.pendingCodeHash = hashCode(code);
      req.session.pendingExpiresAt = Date.now() + CODE_TTL_MS;
      req.session.pendingAttempts = 0;
      // Requesting a fresh code abandons any previously verified identity in this
      // session until the new code is confirmed.
      req.session.verifiedEmail = undefined;
      req.session.memberId = undefined;

      const sent = await sendMemberVerificationCode({ email: rawEmail, code });

      if (!sent) {
        if (IS_PRODUCTION) {
          return res.status(503).json({ error: 'Verification email service is unavailable. Please try again later.' });
        }
        // Dev only (no email provider configured): surface the code so the flow
        // remains testable. This branch is never reachable in production.
        console.log(`[MemberAuth] DEV verification code for ${rawEmail}: ${code}`);
        return res.json({ success: true, devCode: code });
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Step 2 — confirm the code and establish the verified identity.
  app.post('/api/member-auth/verify-code', limiter, memberSession, async (req: Request, res: Response) => {
    try {
      const code = String(req.body?.code ?? '').trim();
      const { pendingEmail, pendingCodeHash, pendingExpiresAt } = req.session;

      if (!pendingEmail || !pendingCodeHash || !pendingExpiresAt) {
        return res.status(400).json({ error: 'No verification in progress. Request a new code.' });
      }
      if (Date.now() > pendingExpiresAt) {
        req.session.pendingEmail = undefined;
        req.session.pendingCodeHash = undefined;
        req.session.pendingExpiresAt = undefined;
        req.session.pendingAttempts = undefined;
        return res.status(400).json({ error: 'This code has expired. Request a new one.' });
      }

      req.session.pendingAttempts = (req.session.pendingAttempts ?? 0) + 1;
      if (req.session.pendingAttempts > MAX_ATTEMPTS) {
        req.session.pendingEmail = undefined;
        req.session.pendingCodeHash = undefined;
        req.session.pendingExpiresAt = undefined;
        req.session.pendingAttempts = undefined;
        return res.status(429).json({ error: 'Too many incorrect attempts. Request a new code.' });
      }

      if (!/^\d{6}$/.test(code) || !timingSafeEqualHex(hashCode(code), pendingCodeHash)) {
        return res.status(400).json({ error: 'Incorrect code. Please try again.' });
      }

      // Persist the verified identity so returning members are recognized on any
      // device. This upserts (first/last verified timestamps) rather than duplicates.
      try {
        req.session.memberId = (await upsertMember(pool, pendingEmail)) ?? undefined;
      } catch (err) {
        // A failure to record the durable member must not block verification —
        // the session is still the source of truth for gating.
        console.error('[MemberAuth] Failed to upsert member record:', err);
      }

      req.session.verifiedEmail = pendingEmail;
      req.session.pendingEmail = undefined;
      req.session.pendingCodeHash = undefined;
      req.session.pendingExpiresAt = undefined;
      req.session.pendingAttempts = undefined;

      res.json({ success: true, email: pendingEmail });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Who is the currently verified member (if any)?
  app.get('/api/member-auth/me', memberSession, (req: Request, res: Response) => {
    res.json({ email: req.session?.verifiedEmail ?? null });
  });

  // Sign the verified member out of this browser session.
  app.post('/api/member-auth/logout', memberSession, (req: Request, res: Response) => {
    if (req.session) {
      req.session.verifiedEmail = undefined;
      req.session.memberId = undefined;
      req.session.pendingEmail = undefined;
      req.session.pendingCodeHash = undefined;
      req.session.pendingExpiresAt = undefined;
      req.session.pendingAttempts = undefined;
    }
    res.json({ success: true });
  });

  return;
}
