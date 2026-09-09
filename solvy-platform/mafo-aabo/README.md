# MAFO AABO Special Needs Trust™ — Family Trust Portal

> **Live record-keeping** — backed by the `mafo-api` server and Postgres. Authorized family members only. Record-keeping tool only; the executed trust instrument governs.

## Overview

This is the record-keeping portal for the **MAFO AABO SPECIAL NEEDS TRUST**, a first-party self-settled special needs trust under 42 U.S.C. § 1396p(d)(4)(A), effective **July 1, 2026**, with EIN **42-6978754**.

The trust was established by **Sheila Ann McDaniel** (Settlor/Grantor) for the sole benefit of **Sean Maurice Mayo (MAFO AABO)** (Beneficiary), with **Sean Marlon II McDaniel** serving as initial Trustee.

### Access

Personal access codes are issued privately and bcrypt-hashed at seed time (see `mafo-aabo-server/scripts/seed.js`). The old demo codes (`TRUSTEE-2026`, `SHEILA-250K`, `SMM-TRUST-2026`) are **retired**.

| Role | Person | Access |
|------|--------|--------|
| **Trustee & SCRUM Master** | Sean Marlon II McDaniel | Full admin: approve/reject requests, execute payments, create/manage family loans, view audit trail |
| **Grantor** | Sheila Ann McDaniel | Read-only: view trust balance, distributions, loans, and the "Sheila Care" protections |
| **Beneficiary** | Sean Maurice Mayo (MAFO AABO) | Submit replenishment/supplemental-needs requests, view own distributions, read relevant trust provisions |

## Key Trust Facts

- **Trust name:** MAFO AABO SPECIAL NEEDS TRUST
- **EIN:** 42-6978754
- **Effective date:** July 1, 2026
- **Governing law:** Texas
- **Initial funding:** $225,000.00
- **Source of funds:** Gift from Sheila Ann McDaniel to Beneficiary from her September 11th Victim Compensation Fund award, Claim No. VCF0110104
- **Gift Letter date:** June 19, 2026
- **Trust mailing address:** 11817 Serval Street, Godley, TX 76044
- **Successor Trustee:** Evergreen P. Mayo

## How to Run

The portal is served by the backend (`mafo-aabo-server/server.js`), which also exposes the `/api/mafo/*` API:

```bash
cd mafo-aabo-server
DATABASE_URL=postgresql://... SESSION_SECRET=... node server.js
# Open http://localhost:3002/
```

See `BACKEND-SPEC.md` for the full architecture and `mafo-aabo-server/deploy-hetzner.sh` for VPS deployment.

## Features

- **Role-based login** with server-issued session cookies (8h)
- **Dashboard** customized for each role: trust-card hero (balance, masked EIN), activity feed (requests + audit for trustee), and inline-SVG spending charts (paid-by-category donut, 6-month paid bars)
- **Requests:** replenishment/supplemental-needs request → approve/reject → pay workflow; clicking any row opens a detail sheet with a Submitted → Trustee Review → Approved → Paid status stepper (Rejected shown as terminal)
- **Family Loans:** trust lends to family ventures; repayments replenish the trust corpus; trustee sees a loan-utilization ring
- **Trust Document:** full SNT instrument summary based on the executed trust agreement
- **Sheila Care:** explains how the trust protects Sheila under the disabled-child exception
- **Audit Trail:** MAN (Mandatory Audit Network) activity log, append-only, written with every mutation
- **Document Vault:** AES-256-GCM encrypted uploads (trust documents, promissory notes, receipts, bank statements) stored outside the web root; beneficiaries attach receipts to their own requests
- **NFCU / Reconcile:** manual Navy Federal ledger with running balance, withdrawal→paid-request reconciliation, and drift detection (bank vs. books)
- **CSV exports:** ledger (role-scoped), bank ledger (trustee/grantor), and audit trail (trustee)
- **UI:** Apple Card–style single-file design (no external assets — CSP-safe); toast notifications, skeleton loaders, friendly empty states; desktop sidebar collapses to a bottom tab bar (Dashboard / Expenses / Loans / Documents / More) ≤900px, and modals become slide-up bottom sheets ≤600px

## Data

All records live server-side in the dedicated Postgres database `mafo_aabo` (money in integer cents). The browser keeps nothing but the session cookie — the old `localStorage` keys (`mafo_requests`, `mafo_loans`, `mafo_audit`) are gone.

## Files

- `index.html` — single-page trust portal (fetch-driven, no framework)
- `README.md` — this file
- `BACKEND-SPEC.md` — Phase 0 backend spec
- `../../mafo-aabo-server/` — Express + Postgres backend

## Legal Notice

This portal is based on the trust instrument provided by the user (MA-SNT-A.pdf / MA-EIN.pdf content). It is a record-keeping summary only and does not replace the executed legal instrument or qualified legal counsel.

---

SA Nathan LLC · SOLVY Ecosystem™ · Product of a Texas cooperative
