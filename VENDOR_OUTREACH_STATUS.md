# SOLVY Vendor Outreach — Live Status Tracker
**Last Updated:** May 29, 2026  
**Launch Target:** June 19, 2026 (21 days)  
**Owner:** SA Nathan LLC / Sean Mayo  

---

## ⚠️ CRITICAL FINDINGS

| Issue | Impact | Action Required |
|-------|--------|-----------------|
| **Treasury Prime sandbox invite EXPIRED** (May 13) | 🔴 HIGH | Request new invite immediately |
| **Unit.co production access still pending** (since April 13) | 🔴 HIGH | Escalation email needed NOW |
| **No vendor API keys in .env** | 🔴 HIGH | Need actual credentials, not placeholders |
| **No evidence emails were sent** | 🟡 MEDIUM | Send tracked outreach today |

**Bottom line:** We have documentation but no live card-issuing sandbox. 21 days to launch.

---

## 📊 Vendor Pipeline

### 1. Unit.co (Primary)
| Field | Status |
|-------|--------|
| Sandbox access | ✅ Had access — API token is placeholder in .env |
| Production access | ⏳ Pending since April 13, 2026 |
| Last contact | ❌ Unknown — no response logged |
| Cards issued | ❌ None |
| Next action | **Send escalation email today** |

### 2. Treasury Prime (Backup — Sandbox ACTIVE ✅)
| Field | Status |
|-------|--------|
| Sandbox access | ✅ **ACTIVE** — https://app.sandbox.treasuryprime.com/accounts/accounts |
| API keys | ⚠️ Need to confirm if generated |
| Integration code | ✅ Built (vendor-config.js, adapters, router) |
| Cards issued | ❌ None yet |
| Next action | **Generate API keys and test connection** |

### 3. Mercury (Business Account — Not Card Issuer)
| Field | Status |
|-------|--------|
| Account opened | ❌ Unknown — not confirmed in docs |
| Purpose | Hold $225K VCF funds + underwriting proof |
| Cards for members | ❌ N/A — Mercury doesn't issue cards to third parties |
| Next action | **Open if not done** |

### 4. Lithic (Card Issuing — INTEGRATION COMPLETE ✅)
| Field | Status |
|-------|--------|
| Sandbox access | ✅ **ACTIVE** — https://app.lithic.com/programs/a246dd6b-efe2-49dc-82f1-b1a71c27c97d/sandbox/dashboard |
| API keys | ✅ **CONFIGURED** — Key ending in `...7ad5` active |
| Integration code | ✅ **BUILT** — `api/adapters/lithic.js` + `vendor-config.js` + `banking-router.js` |
| Cards issued | ✅ **TESTED** — Virtual card created successfully (token: `138be3af...`) |
| Freeze/unfreeze | ✅ **TESTED** — Working via PATCH |
| Transaction sim | ⚠️ Partial — Authorization simulation needs parameter tweak |
| Next action | **Ready for member onboarding flow integration** |

### 5. Baanx (Crypto Backup — Phase 2)
| Field | Status |
|-------|--------|
| Contacted | ❌ No |
| Purpose | Crypto-to-fiat card for future |
| Next action | Defer to post-launch |

---

## 📧 Emails to Send TODAY

### Email 1: Treasury Prime — New Sandbox Request
**To:** support@treasuryprime.com, partnerships@treasuryprime.com  
**Subject:** RE: Sandbox Invitation Expired — SA Nathan LLC (SOLVY Ecosystem™)

> Our sandbox invitation (org: SA Nathan-EBL Logo, sent ~May 5) expired before we could activate API keys. We are 21 days from launch and need immediate re-instatement. Can you extend or re-send the invitation? Our integration code is complete and ready to test.

**Status:** 🔴 NOT SENT

---

### Email 2: Unit.co — Production Escalation
**To:** partners@unit.co, support@unit.co  
**Subject:** PRODUCTION ACCESS ESCALATION — 45 Days No Response | Juneteenth Launch Imminent

> We submitted our underwriting package on April 13 with $225K capital committed and 45 members confirmed. We have received no response in 45 days. Our cooperative launch is June 19. Please advise on status or we will be forced to proceed with an alternative provider.

**Status:** 🔴 NOT SENT

---

## ✅ Action Checklist

- [ ] Send Treasury Prime sandbox re-request email
- [ ] Send Unit.co escalation email
- [ ] Confirm Mercury business account status (open if needed)
- [ ] Update .env with actual API keys when received
- [ ] Test card issuance in first available sandbox
- [ ] Update this tracker after each vendor response

---

## 🎯 Decision Matrix

| Scenario | Path |
|----------|------|
| Treasury Prime re-activates sandbox quickly | **Use TP as primary** (already default in vendor-config.js) |
| Unit.co responds with production keys | Parallel-test both; pick best interchange terms |
| Neither TP nor Unit responds by June 5 | **Proceed with Lithic** — we have a working sandbox |

---

*Tracker maintained by: AI Development Partners*  
*Next review: After vendor responses*
