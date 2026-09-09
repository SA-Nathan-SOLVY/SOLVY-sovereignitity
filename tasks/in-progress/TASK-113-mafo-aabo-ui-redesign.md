# TASK-113: Mafo Aabo Trust Portal — Apple Card–Style UI Redesign

## 📋 Metadata

| Field | Value |
|-------|-------|
| **Type** | Feature (UI/UX) |
| **Priority** | Medium |
| **Status** | In Progress |
| **Assignee** | @sa-nathan |
| **SCRUM Master** | @sean |
| **Sprint** | TBD |
| **Story Points** | 5 |

---

## 📝 Description

Redesign `solvy-platform/mafo-aabo/index.html` (single-file portal served by `mafo-api`, CSP = inline only) into an Apple Card/Apple Pay–style interface and add four usability features on top of the existing Phase-0 backend (TASK-112).

## ✅ Acceptance Criteria

- [x] CSS overhaul: `#f5f5f7` background, white 18–24px-radius cards, soft layered shadows, pill buttons (primary = solid navy `#0f1e2c`), `tabular-nums` amounts, gold `#f59e0b` accents
- [x] Desktop sidebar refined (translucent navy, gold active pill); ≤900px collapses to fixed bottom tab bar (Dashboard / Expenses / Loans / Documents / More)
- [x] Modals = centered cards with backdrop blur on desktop; slide-up bottom sheets with drag handle ≤600px
- [x] Dashboard: dark navy gradient trust-card hero (balance, masked EIN `•••• 8754`, role subtitle; grantor variant shows original gift vs remaining)
- [x] Dashboard activity feed (requests for all roles + audit entries when `viewAudit`)
- [x] Hand-rolled inline SVG charts: paid-by-category donut + 6-month paid bar chart (by `paid_at`); trustee loan-utilization ring on Loans view
- [x] Request detail sheet with status stepper (Submitted → Trustee Review → Approved → Paid; Rejected terminal red); trustee Approve/Reject/Pay + beneficiary receipt upload moved into the sheet; inline table buttons kept
- [x] `toast(message, type)` replaces all `alert()` calls; `confirm()` replaced with styled confirm sheet
- [x] Skeleton shimmer placeholders during `showView()` refreshes; icon + message empty states replace bare "No X" cells
- [x] Trust instrument (`view-document`) and Sheila Care (`view-sheila`) legal text byte-identical (wording diff = empty)
- [x] Single-file constraint held — no external scripts/styles/fonts/CDN; no backend changes; all element IDs and role-gating classes preserved

## 🔗 Related

- **Backend:** TASK-112 (`mafo-aabo-server/`, Phase 0)
- **File:** `solvy-platform/mafo-aabo/index.html`

## 🔄 Change Log

| Date | Change | By |
|------|--------|-----|
| 2026-09-09 | Created; redesign implemented per approved plan (hawk-namor-elektra). `node --check` passes on extracted inline script; HTML tag balance verified; no external resources; legal text verified unchanged against pre-edit snapshot. Backend server/tests intentionally not run here — integration verification by reviewer | @kimi |
