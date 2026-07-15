# TASK-108: Open Navy Federal Credit Union Accounts

## 📋 Metadata

| Field | Value |
|-------|-------|
| **Type** | Task |
| **Priority** | High |
| **Status** | To Do |
| **Assignee** | @sa-nathan |
| **SCRUM Master** | @sean |
| **Sprint** | Resumption Sprint — July 2026 |
| **Story Points** | 5 |
| **Estimated Hours** | 6–10 hours |
| **Due Date** | 2026-07-18 |

---

## 📝 Description

Open operational banking accounts with Navy Federal Credit Union to hold trust/operational funds and serve as funding rails while the Lithic card-issuing production setup is finalized.

---

## ✅ Acceptance Criteria

- [ ] Navy Federal membership/application submitted for SA Nathan LLC / trust entity
- [ ] Business checking account opened
- [ ] Online banking access configured
- [ ] Trust account funds (~$200k) transfer path confirmed
- [ ] Debit cards / ACH credentials secured
- [ ] Account details documented securely (not in repo)
- [ ] Routing/account numbers available for vendor underwriting if needed

**Definition of Done:**
- [ ] Accounts are open and accessible
- [ ] Funds can move from trust account to NFCU
- [ ] Documentation stored in secure location
- [ ] Vendor outreach updated with NFCU confirmation

---

## 🔧 Technical Notes

### Entity Considerations
- Determine whether account is opened under:
  - SA Nathan LLC (Texas LLC)
  - Trust entity (if separate EIN)
- Confirm Navy Federal business account requirements (articles, EIN, operating agreement, ID)

### Documents Likely Needed
- EIN confirmation letter
- Operating agreement / trust documents
- Articles of organization
- Personal ID for authorized signer(s)
- Proof of address

### Secure Documentation
- Do NOT commit account numbers to git
- Store in password manager or secure vault
- Reference only in `.env` files

---

## 📎 Related

- **Parent Epic:** EPIC-008 — Operational Banking
- **Related Tasks:** TASK-102 (Lithic production key)
- **Vendor Status:** `VENDOR_OUTREACH_STATUS.md`

---

## 💬 Discussion Log

### 2026-07-15 - @sa-nathan
Task created as part of resumption sprint. Trust account with EIN and ~$200k is active; NFCU accounts needed for operational banking and vendor underwriting.

---

## 🏷️ Labels

```
Type: chore
Priority: high
Status: to-do
Component: finance
Sprint: resumption-july-2026
```

---

## 🔄 Change Log

| Date | Change | By |
|------|--------|-----|
| 2026-07-15 | Created | @sean |
