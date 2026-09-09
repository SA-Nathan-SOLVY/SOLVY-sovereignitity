# TASK-112: Mafo Aabo Backend — Go-Live (Phase 0)

## 📋 Metadata

| Field | Value |
|-------|-------|
| **Type** | Feature |
| **Priority** | High (family ops — not launch-blocking for SOLVY Card) |
| **Status** | In Review (Phase 0 code complete; deploy pending) |
| **Assignee** | @sa-nathan |
| **SCRUM Master** | @sean |
| **Sprint** | TBD — next sprint after Resumption Sprint closeout |
| **Story Points** | 8 |
| **Spec** | `solvy-platform/mafo-aabo/BACKEND-SPEC.md` |

---

## 📝 Description

The Mafo Aabo Special Needs Trust is active and funded ($225,000, effective 2026-07-01). Build the Phase 0 backend so the family can execute the **plan of replenishment**: beneficiary submits requests online, trustee approves/pays, and all record keeping (ledger, balances, loan ratios, audit trail) is viewable on the site 24/7/365 — replacing the `localStorage` demo data with a real database on the Hetzner VPS.

## ✅ Acceptance Criteria

- [x] Postgres schema per spec §4 (applied by `mafo-aabo-server/db.js`; verified locally on Docker Postgres)
- [x] Express service `mafo-api` (PM2 config, port 3002) per spec §2/§3 — PM2/nginx deploy on VPS still pending
- [x] Server-enforced role matrix per spec §5 (trustee / grantor / beneficiary)
- [x] Sean Maurice (beneficiary) can log in and submit replenishment requests
- [x] Sean Marlon II (trustee) can approve/reject/pay with notes + payment refs
- [x] Ledger summary shows balance, pending, loan ratio; audit trail append-only
- [x] Frontend refactored from `localStorage` to API calls per spec §7
- [x] Document vault: encrypted upload (AES-256-GCM, outside web root), download, delete; beneficiary receipt upload on own requests; scoping enforced server-side
- [x] NFCU bank ledger: manual entries (signed cents), SQL running balance, reconcile/unreconcile with duplicate-match protection
- [x] Reconciliation summary: `bank_balance_cents`, `unreconciled_withdrawals`, `paid_requests_unmatched`, `drift_cents` in `/ledger/summary` (trustee/grantor)
- [x] Frontend: Documents view, NFCU/Reconcile view, attach-receipt affordance on beneficiary's paid requests
- [ ] Live at `trust.solvy.cards` — A record `trust → 46.62.235.95` added to the pending Replit support request (DNS zone locked until TASK-110 resolves)
- [ ] Nightly `pg_dump` backups + monthly audit CSV export routine
- [ ] Demo access codes retired; real per-person codes seeded privately (never committed)

## 🔗 Related

- **Spec:** `solvy-platform/mafo-aabo/BACKEND-SPEC.md`
- **Existing app:** `solvy-platform/mafo-aabo/index.html` (ROLES at line 1046)
- **Parked product version:** TASK-111 (MAN Trust Transparency)
- **DNS dependency:** TASK-110 (solvy.cards zone access)

## 🔄 Change Log

| Date | Change | By |
|------|--------|-----|
| 2026-08-03 | Created from spec request; Phase 0 scoped for replenishment go-live | @kimi |
| 2026-08-05 | Phase 0 built: `mafo-aabo-server/` (Express+Postgres, port 3002), frontend refactored to `/api/mafo/*`, vitest+supertest suite green, full replenishment workflow verified via curl locally. Moved backlog → review. Deploy to VPS intentionally not run (awaiting go-ahead + real seed codes) | @kimi |
| 2026-08-06 | Browser testing found two bugs — fixed in `server.js`: CSP now allows inline scripts/handlers (single-file portal), and CORS allows `http://localhost:3002` in non-production. Phase 0 scope expansion landed: document vault (`documents` table, AES-256-GCM at rest via `DOC_ENCRYPTION_KEY`, `routes/documents.js`), NFCU manual bank ledger (`bank_transactions` table, `routes/bank.js`, reconcile/unreconcile with unique-match enforcement), ledger summary extended with bank balance + drift. Frontend: Documents + NFCU/Reconcile views + attach-receipt on paid requests. Test suite now 33 passing (2 files). Live curl smoke verified: encrypted upload/download round-trip byte-identical, NFCU withdrawal reconciled to paid REQ-1, drift math correct | @kimi |
| 2026-09-09 | UI redesign landed on the Phase-0 frontend (TASK-113): Apple Card–style restyle, trust-card hero, activity feed, inline-SVG charts, request detail sheet with status stepper, toasts/skeletons/empty states, mobile bottom tab bar + bottom sheets. No backend/API/schema changes; legal text byte-identical | @kimi |
