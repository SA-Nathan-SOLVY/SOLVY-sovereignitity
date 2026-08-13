# SOLVY Vendor Outreach — Live Status Tracker
**Last Updated:** July 15, 2026  
**Owner:** SA Nathan LLC / Evergreen Mayo, CEO · Managing Owner  

---

## ⚠️ CRITICAL FINDINGS

| Issue | Impact | Action Required |
|-------|--------|-----------------|
| **Lithic production API key still pending** | 🔴 HIGH | Production key request email refreshed and ready to send today |
| **Juneteenth launch window passed** | 🔴 HIGH | Reset launch milestone; resume with trust account funding now in place |
| **Unit.co production access still pending** | 🟡 MEDIUM | No response since April; keep as backup only |
| **Treasury Prime sandbox invite expired** | 🟡 MEDIUM | Can re-request if Lithic falls through |

**Bottom line:** Lithic sandbox integration is verified and working. Production API key is the only blocker for card issuing. Trust account with EIN and ~$200k is now active.

---

## 📊 Vendor Pipeline

### 1. Unit.co (Paused — Backup)
| Field | Status |
|-------|--------|
| Sandbox access | ✅ Had access — API token is placeholder in .env |
| Production access | ⏳ Pending since April 13, 2026 |
| Last contact | ❌ No response logged |
| Cards issued | ❌ None |
| Next action | **Keep as fallback; do not actively escalate unless Lithic fails** |

### 2. Treasury Prime (Paused — Backup)
| Field | Status |
|-------|--------|
| Sandbox access | ⚠️ Invite expired (~May 13) |
| API keys | ❌ Not generated |
| Integration code | ✅ Built (vendor-config.js, adapters, router) |
| Cards issued | ❌ None yet |
| Next action | **Re-request sandbox only if Lithic does not deliver** |

### 3. Mercury (Business Account — Not Card Issuer)
| Field | Status |
|-------|--------|
| Account opened | ❌ Unknown — not confirmed in docs |
| Purpose | Hold operational funds + underwriting proof |
| Cards for members | ❌ N/A — Mercury doesn't issue cards to third parties |
| Next action | **Defer; Navy Federal being used for operational banking** |

### 4. Lithic (Card Issuing — PRIMARY ✅)
| Field | Status |
|-------|--------|
| Sandbox access | ✅ **ACTIVE** — re-tested July 15, 2026 |
| API keys | ✅ **CONFIGURED** — Key ending in `...7ad5` active |
| Integration code | ✅ **BUILT** — `api/adapters/lithic.js` + `vendor-config.js` + `banking-router.js` |
| Cards issued | ✅ **TESTED** — Virtual card created successfully |
| Freeze/unfreeze | ✅ **TESTED** — Working via PATCH |
| Transaction sim | ✅ **TESTED** — Authorization simulated |
| KYC document capture | ✅ **DONE** — On-device ID + liveness + face-match (TASK-107) |
| Production key | ⏳ **PENDING** — refreshed request ready to send July 15 |
| Next action | **Send production key request; escalate if no response by July 22** |

### 5. Navy Federal Credit Union (Operational Banking)
| Field | Status |
|-------|--------|
| Account status | ⏳ Being opened now |
| Purpose | Operational/funding accounts while card vendor is finalized |
| Cards for members | ❌ N/A — not a BaaS card issuer |
| Next action | **Confirm account opening and fund with trust account** |

### 6. Baanx (Crypto Backup — Phase 2)
| Field | Status |
|-------|--------|
| Contacted | ❌ No |
| Purpose | Crypto-to-fiat card for future |
| Next action | Defer to post-launch |

---

## 💰 Funding / Entity Update

| Item | Status |
|------|--------|
| Trust account with EIN | ✅ Active |
| Available capital | ~$200,000 |
| Operational bank | Navy Federal Credit Union — accounts being opened |
| Card issuing | Pending Lithic production key |

---

## 📧 Emails to Send TODAY

### Email 1: Lithic — Production API Key Request
**To:** support@lithic.com, partnerships@lithic.com, sales@lithic.com  
**Subject:** Production API Access Request — SA Nathan LLC / SOLVY Ecosystem™

> Sandbox integration is complete and re-tested July 15. We have an active trust account with EIN and ~$200k available. We require production API access immediately to serve our founding members. Our cooperative program has 45 confirmed founding members.

**Send from:** `partnerships@ebl.beauty` (ready now via MailCow)  
**Status:** 🟢 DRAFT READY — `drafts/lithic-production-key-request-ebl-fallback.md`  
**Send options:**
- Fastest: `node ops/mailcow/send-from-ebl.beauty.js` (requires `PARTNERSHIPS_EBL_PASS`)
- Manual: MailCow SOGo webmail → copy fallback draft

**Follow-ups drafted:**
- Day 3: `drafts/lithic-follow-up-day3.md`
- Day 7: `drafts/lithic-follow-up-day7.md`

---

## ✅ Action Checklist

- [x] Re-test Lithic sandbox integration (July 15)
- [x] Refresh Lithic production key request email with trust account / NFCU info
- [ ] Send Lithic production key request email
- [ ] Open Navy Federal Credit Union accounts
- [ ] Confirm trust account wire/transfer capability to NFCU
- [ ] Update SCRUM board and task files for post-Juneteenth sprint
- [ ] Set new launch milestone once Lithic production key received
- [ ] Update .env with actual production API keys when received
- [ ] Test production card issuance in Lithic production environment
- [ ] Update this tracker after Lithic response

---

## 🎯 Decision Matrix

| Scenario | Path |
|----------|------|
| Lithic delivers production key by July 22 | **Proceed with Lithic as primary card vendor** |
| Lithic declines or no response by July 22 | **Escalate to sales/partnerships + prepare Treasury Prime re-request** |
| Unit.co responds with production keys | Parallel-test; pick best interchange terms |
| Navy Federal accounts open before card vendor | Use NFCU for operational banking and member funding rails |

---

*Tracker maintained by: AI Development Partners*  
*Next review: After Lithic response or July 22, whichever comes first*
