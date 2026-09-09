# MAFO AABO Trust™ — Backend Spec (Phase 0: Go-Live)

> **Status:** Spec — ready for implementation
> **Date:** 2026-08-03
> **Trigger:** Trust is active and funded ($225,000, effective July 1, 2026). The family needs to submit **replenishment requests to the Trustee** through the site and keep the records online 24/7/365.
> **Scope:** Internal family tool first. External productization is parked as TASK-111 (MAN Trust Transparency).

---

## 1. What Phase 0 Must Do

1. **Sean Maurice Mayo (Beneficiary)** logs in and submits replenishment/supplemental-needs requests.
2. **Sean Marlon II McDaniel (Trustee)** logs in, sees pending requests, approves/rejects, records payments.
3. **Sheila Ann McDaniel (Grantor)** keeps read-only visibility (existing role).
4. **Record keeping viewable on the site** — ledger, balances, loan ratios, audit trail — 24/7.
5. All data moves out of browser `localStorage` into a **server-side database on the Hetzner VPS**.

Everything else (document vault, reports, loans UI polish) is Phase 1.

---

## 2. Architecture

Reuse the existing stack — no new frameworks:

```
Browser (existing mafo-aabo/index.html, refactored)
        │  fetch /api/mafo/*
        ▼
Nginx (VPS 46.62.235.95)  ── subdomain, SSL via Let's Encrypt
        │  proxy_pass 127.0.0.1:3002
        ▼
mafo-api  (Express, PM2 process, port 3002)
        │
        ▼
PostgreSQL on VPS  ── database: mafo_aabo
```

- **Server:** new Express service, modeled on `server/vps.mjs` (no Replit dependencies, dotenv, helmet, cors, rate-limit).
- **Database:** dedicated Postgres database `mafo_aabo` on the VPS Postgres instance. Trust records are **not** mixed into the member-platform database.
- **Frontend:** keep the existing single-page app; replace the three `localStorage` keys (`mafo_requests`, `mafo_loans`, `mafo_audit`) with API calls. Keep `ROLES`/`applyRoleUI()` permission logic — it moves server-side, UI just reflects it.
- **Process:** PM2 app `mafo-api`, port `3002`, `env_file: /var/www/mafo-aabo/.env` — same pattern as `pm2.config.cjs`.

### Hostname decision

**Decided 2026-08-03 (@sa-nathan): the trust lives at `trust.solvy.cards`** — it is family finance under the SOLVY umbrella; `ebl.beauty` is reserved for Evergreen Beauty Lounge products and services.

`solvy.cards` DNS is currently uneditable (pending Replit/name.com resolution, TASK-110). The path:

| Step | Action |
|------|--------|
| 1 | `A trust → 46.62.235.95` added to the pending Replit support request (Quinn thread) so their team applies it alongside the mail records |
| 2 | Once name.com/zone access is restored, we manage the record directly |
| 3 | Fallback if Replit stalls and go-live is urgent: temporary `trust.ebl.beauty` (Cloudflare zone we control), then migrate — but solvy.cards is the permanent home |

The deploy script defaults to `trust.solvy.cards`; a temporary domain can be passed as an argument without code changes.

---

## 3. File Tree

New/changed files:

```
Sovereignitity-Stack/
├── solvy-platform/
│   └── mafo-aabo/
│       ├── index.html              # EXISTING — refactor: localStorage → fetch()
│       ├── README.md               # EXISTING — update demo→live notes
│       └── BACKEND-SPEC.md         # THIS FILE
│
├── mafo-aabo-server/               # NEW — backend service
│   ├── server.js                   # Express entry (pattern from server/vps.mjs)
│   ├── db.js                       # pg Pool + schema init (CREATE TABLE IF NOT EXISTS)
│   ├── schema.sql                  # reference copy of the DDL below
│   ├── routes/
│   │   ├── auth.js                 # login/logout/me, session handling
│   │   ├── requests.js             # replenishment request workflow
│   │   ├── loans.js                # family loans + repayments (Phase 1)
│   │   ├── ledger.js               # record-keeping views + balances + ratios
│   │   └── audit.js                # audit trail read + CSV export
│   ├── lib/
│   │   ├── roles.js                # server-side ROLES matrix (from index.html)
│   │   └── requireRole.js          # middleware: session + permission check
│   ├── package.json                # express, pg, dotenv, helmet, cors, express-session, connect-pg-simple, bcrypt
│   ├── pm2.config.cjs              # PM2 app "mafo-api", port 3002
│   ├── .env.example                # DATABASE_URL, SESSION_SECRET, PORT=3002, TRUST_DOMAIN
│   └── deploy-hetzner.sh           # rsync + pm2 reload, pattern from root deploy-hetzner.sh
│
└── tasks/backlog/
    └── TASK-112-mafo-aabo-backend.md   # SCRUM tracking
```

On the VPS:

```
/var/www/mafo-aabo/          # backend (APP_DIR)
/var/www/trust.solvy.cards/   # built/served frontend (WEB_DIR)
/etc/nginx/sites-available/trust.solvy.cards
/etc/letsencrypt/live/trust.solvy.cards/   # certbot
```

---

## 4. Database Schema (`mafo_aabo`)

```sql
-- People & access (codes hashed with bcrypt; no plaintext like the demo)
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  role          TEXT NOT NULL CHECK (role IN ('trustee','grantor','beneficiary')),
  full_name     TEXT NOT NULL,
  access_code_hash TEXT NOT NULL,          -- bcrypt of per-person code
  active        BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Replenishment / supplemental-needs requests
-- status flow: pending → approved → paid   (or → rejected)
CREATE TABLE requests (
  id            SERIAL PRIMARY KEY,
  requested_by  INTEGER REFERENCES users(id) NOT NULL,
  vendor        TEXT NOT NULL,
  amount_cents  INTEGER NOT NULL CHECK (amount_cents > 0),
  category      TEXT NOT NULL,             -- existing UI categories
  method        TEXT NOT NULL,             -- disbursement method
  description   TEXT,
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','approved','rejected','paid')),
  trustee_note  TEXT,
  decided_by    INTEGER REFERENCES users(id),
  decided_at    TIMESTAMPTZ,
  payment_ref   TEXT,                      -- check no. / confirmation no.
  paid_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Family loans (trust lends out; repayments replenish corpus)
CREATE TABLE loans (
  id            SERIAL PRIMARY KEY,
  borrower      TEXT NOT NULL,
  amount_cents  INTEGER NOT NULL CHECK (amount_cents > 0),
  rate_bp       INTEGER DEFAULT 0,         -- basis points, e.g. 500 = 5.00%
  term_months   INTEGER DEFAULT 12,
  purpose       TEXT,
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','active','rejected','repaid')),
  trustee_note  TEXT,
  created_by    INTEGER REFERENCES users(id),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE loan_repayments (
  id            SERIAL PRIMARY KEY,
  loan_id       INTEGER REFERENCES loans(id) NOT NULL,
  amount_cents  INTEGER NOT NULL CHECK (amount_cents > 0),
  received_at   TIMESTAMPTZ DEFAULT NOW(),
  note          TEXT
);

-- Trust-level settings (single row): corpus, as-of date
CREATE TABLE trust_settings (
  id            INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  initial_funding_cents INTEGER NOT NULL DEFAULT 22500000,  -- $225,000.00
  effective_date DATE NOT NULL DEFAULT '2026-07-01'
);

-- MAN (Mandatory Audit Network) — append-only
CREATE TABLE audit_log (
  id            BIGSERIAL PRIMARY KEY,
  actor_id      INTEGER REFERENCES users(id),
  action        TEXT NOT NULL,             -- e.g. request.submitted, request.approved, loan.repayment
  entity        TEXT,                      -- 'request:5', 'loan:2'
  detail        JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Document vault (landed in Phase 0, 2026-08-06) — files AES-256-GCM encrypted
-- at rest, stored OUTSIDE the web root (UPLOAD_DIR).
-- On-disk format: [12-byte IV][16-byte GCM auth tag][ciphertext].
-- Key: env DOC_ENCRYPTION_KEY (64-char hex; openssl rand -hex 32).
CREATE TABLE documents (
  id            SERIAL PRIMARY KEY,
  uploaded_by   INTEGER REFERENCES users(id) NOT NULL,
  category      TEXT NOT NULL
                CHECK (category IN ('trust_document','promissory_note','receipt','bank_statement','other')),
  label         TEXT,
  original_filename TEXT NOT NULL,
  mime_type     TEXT NOT NULL,
  size_bytes    INTEGER NOT NULL,
  storage_path  TEXT NOT NULL,
  request_id    INTEGER REFERENCES requests(id),  -- receipts link to a request
  sha256        TEXT NOT NULL,             -- sha256 of the PLAINTEXT
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- NFCU bank ledger (landed in Phase 0, 2026-08-06) — manual entries.
-- Ledger-like: no updates/deletes; corrections are new entries with a note.
CREATE TABLE bank_transactions (
  id            SERIAL PRIMARY KEY,
  account_label TEXT NOT NULL DEFAULT 'NFCU',
  posted_on     DATE NOT NULL,
  description   TEXT NOT NULL,
  amount_cents  INTEGER NOT NULL,          -- signed: + deposit, − withdrawal
  entered_by    INTEGER REFERENCES users(id) NOT NULL,
  matched_request_id INTEGER REFERENCES requests(id),
  reconciled    BOOLEAN DEFAULT FALSE,
  note          TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
-- A paid request matches at most one bank transaction
CREATE UNIQUE INDEX bank_tx_request_unique
  ON bank_transactions(matched_request_id) WHERE matched_request_id IS NOT NULL;

-- Sessions (connect-pg-simple, same as main app)
-- table "sessions" auto-created by connect-pg-simple
```

**Money is stored in cents (INTEGER) everywhere** — never floats. Current UI uses floats; convert at the API boundary.

**Derived figures** (computed in SQL, not stored):
- `trust_balance = initial_funding − Σ(paid requests) − Σ(active loan principal) + Σ(repayments)`
- `loan_ratio = Σ(active loan principal) / initial_funding` — shown on the trustee dashboard for funding accountability.

---

## 5. Role Matrix (server-enforced)

Mirrors the existing `ROLES` config in `index.html:1046`:

| Capability | Trustee (Sean Marlon II) | Grantor (Sheila) | Beneficiary (Sean Maurice) |
|---|---|---|---|
| Submit replenishment request | — | — | ✅ |
| Approve / reject requests | ✅ | — | — |
| Record payment | ✅ | — | — |
| Create / manage loans | ✅ | — | — |
| View all records (ledger) | ✅ | ✅ | own only |
| View loan ratios | ✅ | ✅ | — |
| View audit trail | ✅ | — | — |
| Export CSV | ✅ | ✅ | own only |
| Upload documents | ✅ (any category) | — | receipts on own requests only |
| View / download documents | ✅ | ✅ | own receipts only |
| Delete documents | ✅ | — | — |
| Enter NFCU bank transactions | ✅ | — | — |
| View bank ledger + reconciliation | ✅ | ✅ (read-only) | — |
| Reconcile / unreconcile | ✅ | — | — |

Seed users (codes issued privately, hashed at seed time — **not** committed):

| Role | Person | Access |
|------|--------|--------|
| trustee | Sean Marlon II McDaniel | full admin |
| grantor | Sheila Ann McDaniel | read-only |
| beneficiary | Sean Maurice Mayo (MAFO AABO) | submit + own records |

---

## 6. API Endpoints

Base: `https://trust.solvy.cards/api/mafo` (all JSON, session cookie auth)

| Method | Path | Role | Purpose |
|--------|------|------|---------|
| POST | `/auth/login` | any | `{role, code}` → session |
| POST | `/auth/logout` | any | destroy session |
| GET | `/auth/me` | any | current user + permissions |
| POST | `/requests` | beneficiary | submit replenishment request |
| GET | `/requests` | all* | list (beneficiary sees own only) |
| POST | `/requests/:id/approve` | trustee | approve w/ note |
| POST | `/requests/:id/reject` | trustee | reject w/ note (required) |
| POST | `/requests/:id/pay` | trustee | record payment ref + date → status `paid` |
| GET | `/loans` | trustee, grantor | list loans + outstanding |
| POST | `/loans` | trustee | create loan |
| POST | `/loans/:id/repayments` | trustee | record repayment |
| GET | `/ledger/summary` | all* | balance, pending, loan ratio, totals |
| GET | `/ledger/export.csv` | all* | CSV export (respects scoping) |
| GET | `/audit` | trustee | audit trail |
| GET | `/audit/export.csv` | trustee | audit CSV |
| POST | `/documents` | trustee; beneficiary (receipt on own request) | upload (multer, 15MB, pdf/png/jpg/jpeg/webp), AES-256-GCM at rest |
| GET | `/documents` | all* | metadata list (beneficiary: own receipts only) |
| GET | `/documents/:id/file` | all* | stream decrypted file (same scoping; audited) |
| DELETE | `/documents/:id` | trustee | delete document + file |
| POST | `/bank-transactions` | trustee | manual NFCU entry (signed cents) |
| GET | `/bank-transactions` | trustee, grantor | list with SQL running balance |
| POST | `/bank-transactions/:id/reconcile` | trustee | match withdrawal → paid request (`amount_mismatch` flag allowed) |
| POST | `/bank-transactions/:id/unreconcile` | trustee | clear the match |
| GET | `/bank-transactions/export.csv` | trustee, grantor | bank ledger CSV |

`/ledger/summary` additionally returns (trustee/grantor only): `bank_balance_cents`,
`unreconciled_withdrawals`, `paid_requests_unmatched`, and
`drift_cents = bank_balance_cents − trust_balance_cents`.

Every mutation writes an `audit_log` row inside the same DB transaction.

Security: helmet, rate-limit on `/auth/login` (slow brute force), CORS restricted to the trust hostname, `secure` session cookies (HTTPS), bcrypt-hashed codes.

---

## 7. Frontend Changes (minimal)

In `solvy-platform/mafo-aabo/index.html`:

1. Delete `seedDemoData()` / `seedDemoLoans()` calls and the three `localStorage` reads (`index.html:1106-1117`).
2. Replace with `fetch('/api/mafo/...')` calls; keep all render functions — they already take the same shapes.
3. `login()` posts to `/auth/login` instead of trusting the client-side code; `applyRoleUI()` uses permissions returned by `/auth/me`.
4. Amounts arrive in cents; format in the UI layer only.
5. Add a small "replenishment request" preset in the beneficiary request form (category = `replenishment`) so the plan-of-replenishment requests are filterable.

The demo access codes (`TRUSTEE-2026` etc.) are retired at go-live; real per-person codes are set during seeding.

---

## 8. Deployment

Pattern follows root `deploy-hetzner.sh`:

```bash
# 1. Postgres on VPS (one-time)
sudo -u postgres createdb mafo_aabo
sudo -u postgres createuser mafo --pwprompt

# 2. DNS (solvy.cards zone — via Replit support until zone access is restored, TASK-110)
#    A record: trust.solvy.cards → 46.62.235.95

# 3. Deploy
cd mafo-aabo-server && ./deploy-hetzner.sh trust.solvy.cards
#    → rsync server, npm install --omit=dev, pm2 start, nginx + certbot

# 4. Seed users + trust_settings (one-time, over SSH, codes from private channel)
node scripts/seed.js
```

**Backups:** nightly `pg_dump mafo_aabo` → gzip → `/root/backups/` + weekly off-VPS copy (rsync to Sean's Mac or Hetzner Storage Box). Retention: 90 days nightly, 12 months monthly. For a trust, also export the audit CSV monthly and store with the trust papers.

---

## 9. Phases

| Phase | Scope | Depends on |
|-------|-------|-----------|
| **0 — Go-live** | auth, requests workflow, ledger summary, audit, CSV export, VPS deploy — **plus** records vault (encrypted document upload) and NFCU manual bank ledger + reconciliation, landed 2026-08-06 | Cloudflare A record only |
| 1 — Records polish | loans UI full parity, document vault UI polish (preview pane, bulk ops) | Phase 0 |
| 2 — Reporting | monthly/quarterly PDF statements, trustee certification export | Phase 1 |
| 3 — Productize | becomes TASK-111 (MAN Trust Transparency) | parked |

---

## ⚖️ Legal Notice

Record-keeping tooling only — no legal advice, no benefit determinations. The executed trust instrument (MA-SNT-A) governs; this system tracks what the Trustee decides. Per AGENTS.md: trust provisions in the UI come only from actual instruments.
