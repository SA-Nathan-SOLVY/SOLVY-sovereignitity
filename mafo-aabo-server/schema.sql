-- MAFO AABO Trust™ — Phase 0 schema (database: mafo_aabo)
-- Reference copy of the DDL applied by db.js initSchema().
-- Money is stored in integer cents everywhere — never floats.

-- People & access (codes hashed with bcrypt; no plaintext like the demo)
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  role          TEXT NOT NULL CHECK (role IN ('trustee','grantor','beneficiary')),
  full_name     TEXT NOT NULL,
  access_code_hash TEXT NOT NULL,          -- bcrypt of per-person code
  active        BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- One active user per role in Phase 0 (seed upserts by role)
CREATE UNIQUE INDEX IF NOT EXISTS users_role_key ON users(role);

-- Replenishment / supplemental-needs requests
-- status flow: pending → approved → paid   (or → rejected)
CREATE TABLE IF NOT EXISTS requests (
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
CREATE TABLE IF NOT EXISTS loans (
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

CREATE TABLE IF NOT EXISTS loan_repayments (
  id            SERIAL PRIMARY KEY,
  loan_id       INTEGER REFERENCES loans(id) NOT NULL,
  amount_cents  INTEGER NOT NULL CHECK (amount_cents > 0),
  received_at   TIMESTAMPTZ DEFAULT NOW(),
  note          TEXT
);

-- Trust-level settings (single row): corpus, as-of date
CREATE TABLE IF NOT EXISTS trust_settings (
  id            INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  initial_funding_cents INTEGER NOT NULL DEFAULT 22500000,  -- $225,000.00
  effective_date DATE NOT NULL DEFAULT '2026-07-01'
);

-- MAN (Mandatory Audit Network) — append-only
CREATE TABLE IF NOT EXISTS audit_log (
  id            BIGSERIAL PRIMARY KEY,
  actor_id      INTEGER REFERENCES users(id),
  action        TEXT NOT NULL,             -- e.g. request.submitted, request.approved, loan.repayment
  entity        TEXT,                      -- 'request:5', 'loan:2'
  detail        JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Document vault (trust docs, promissory notes, receipts, bank statements)
-- Files are AES-256-GCM encrypted at rest, stored OUTSIDE the web root
-- (UPLOAD_DIR). File format: [12-byte IV][16-byte auth tag][ciphertext].
CREATE TABLE IF NOT EXISTS documents (
  id            SERIAL PRIMARY KEY,
  uploaded_by   INTEGER REFERENCES users(id) NOT NULL,
  category      TEXT NOT NULL
                CHECK (category IN ('trust_document','promissory_note','receipt','bank_statement','other')),
  label         TEXT,
  original_filename TEXT NOT NULL,
  mime_type     TEXT NOT NULL,
  size_bytes    INTEGER NOT NULL,          -- plaintext size
  storage_path  TEXT NOT NULL,             -- encrypted blob location (outside web root)
  request_id    INTEGER REFERENCES requests(id),  -- receipts link to a request
  sha256        TEXT NOT NULL,             -- sha256 of the PLAINTEXT (integrity check)
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- NFCU bank ledger (manual entries; ledger-like: no updates/deletes,
-- corrections are new entries with a note)
CREATE TABLE IF NOT EXISTS bank_transactions (
  id            SERIAL PRIMARY KEY,
  account_label TEXT NOT NULL DEFAULT 'NFCU',
  posted_on     DATE NOT NULL,
  description   TEXT NOT NULL,
  amount_cents  INTEGER NOT NULL,          -- signed: + deposit/credit, − withdrawal/debit
  entered_by    INTEGER REFERENCES users(id) NOT NULL,
  matched_request_id INTEGER REFERENCES requests(id),
  reconciled    BOOLEAN DEFAULT FALSE,
  note          TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- A paid request can be matched to at most one bank transaction
CREATE UNIQUE INDEX IF NOT EXISTS bank_tx_request_unique
  ON bank_transactions(matched_request_id) WHERE matched_request_id IS NOT NULL;

-- Sessions (connect-pg-simple, same as main app)
-- table "session" auto-created by connect-pg-simple
