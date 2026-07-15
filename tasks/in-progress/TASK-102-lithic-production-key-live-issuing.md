# TASK-102: Lithic Production Key + Live Card Issuing

## 📋 Metadata

| Field | Value |
|-------|-------|
| **Type** | Task |
| **Priority** | Critical |
| **Status** | In Progress |
| **Assignee** | @sa-nathan |
| **SCRUM Master** | @sean |
| **Sprint** | Resumption Sprint — July 2026 |
| **Story Points** | 8 |
| **Estimated Hours** | 12–16 hours |
| **Due Date** | 2026-07-22 (escalation decision date) |

---

## 📝 Description

Secure Lithic production API credentials and complete end-to-end live card issuing. This is the critical blocker for the SOLVY Card™ program. Sandbox integration is complete and verified; only the production API key and production program configuration remain.

---

## ✅ Acceptance Criteria

- [x] Lithic sandbox integration re-tested and confirmed working (July 15, 2026)
- [x] Production key request email refreshed with trust account / NFCU updates
- [ ] Production key request email sent to Lithic
- [ ] Production API key received and stored securely in `.env`
- [ ] Production environment configured (`LITHIC_API_URL=https://api.lithic.com`)
- [ ] Production ping / account connectivity verified
- [ ] Production virtual card created successfully
- [ ] Production webhook endpoint configured and tested
- [ ] End-to-end member card issuance flow tested

**Definition of Done:**
- [ ] Production API key secured
- [ ] At least one live virtual card created in production
- [ ] Webhook delivery verified
- [ ] Documentation updated
- [ ] No launch-blocking card-issuing issues remaining

---

## 🔧 Technical Notes

### Files Involved
- `solvy-platform/api/adapters/lithic.js`
- `solvy-platform/api/vendor-config.js`
- `solvy-platform/api/banking-router.js`
- `solvy-platform/server/.env.example`
- `solvy-unit-integration/.env.example`
- `tests/test-lithic-sandbox.js` (adapt for production smoke test)

### Environment Variables
```bash
LITHIC_API_URL=https://api.lithic.com
LITHIC_API_KEY=prod_...
LITHIC_WEBHOOK_SECRET=...
BANKING_VENDOR=lithic
```

### Production Smoke Test
After receiving the production key, run a minimal production smoke test:
1. `lithic.ping()` against `https://api.lithic.com`
2. List production accounts
3. Create one virtual card
4. Verify webhook signature path

---

## 📎 Related

- **Parent Epic:** EPIC-002 — Card Issuing
- **Related Tasks:** TASK-090, TASK-091, TASK-107
- **Vendor Status:** `VENDOR_OUTREACH_STATUS.md`
- **Email Drafts:** `drafts/lithic-production-key-request.md`, `drafts/lithic-production-key-request-ebl-fallback.md`
- **Follow-ups:** `drafts/lithic-follow-up-day3.md`, `drafts/lithic-follow-up-day7.md`
- **Huginn Scenario:** `ops/huginn/scenarios/lithic-outreach.json`

---

## 💬 Discussion Log

### 2026-07-15 - @sa-nathan
Resumed after relocation. Sandbox re-tested successfully. Production key request email refreshed to reflect active trust account with EIN and ~$200k available, plus Navy Federal Credit Union accounts being opened.

---

## 🏷️ Labels

```
Type: vendor
Priority: critical
Status: in-progress
Component: backend
Sprint: resumption-july-2026
```

---

## 🔄 Change Log

| Date | Change | By |
|------|--------|-----|
| 2026-07-15 | Resumed; sandbox retested; draft refreshed | @sa-nathan |
