# SOLVY Vendor Cost Reality Check
**Date:** May 29, 2026  
**Purpose:** Compare actual BaaS costs against our cooperative model

---

## 🔴 The Problem

Unit.co and Treasury Prime pricing may be incompatible with SOLVY's 70/20/10 cooperative model. Here's the math:

### Unit.co (from our budget estimates)

| Cost Item | Month 1 (100 members) | Month 12 (1,000 members) |
|-----------|----------------------|-------------------------|
| Platform Fee | $500 | $500 |
| Account Maintenance ($2/acct) | $200 | $2,000 |
| Physical Cards ($5/card) | $500 | $2,500 |
| Virtual Cards ($0.50/card) | $50 | $500 |
| Transaction Processing ($0.10/txn) | $1,500 | $18,000 |
| ACH ($0.25/transfer) | $250 | $3,000 |
| **TOTAL VENDOR COST** | **$3,000** | **$26,650** |
| **Per Member/Month** | **$30.00** | **$26.65** |

### Our Interchange Revenue (Optimistic)

| Metric | Month 1 | Month 12 |
|--------|---------|----------|
| Gross Interchange (1.5%) | $9,563 | $162,000 |
| Unit Revenue Share (0.3%) | -$1,913 | -$32,400 |
| **NET to SOLVY (1.2%)** | **$7,650** | **$129,600** |

### 70/20/10 Distribution at 1,000 Members

| Pool | Amount | % of Interchange |
|------|--------|-----------------|
| Member Dividends (70%) | $90,720 | 70% |
| Community Pool (20%) | $25,920 | 20% |
| Operations Reserve (10%) | $12,960 | 10% |
| **Vendor Fees (Unit.co)** | **$26,650** | **20.6%** |
| **Left for Operations** | **-$13,690** | **❌ NEGATIVE** |

**The issue:** Unit.co fees consume the ENTIRE 10% operations reserve PLUS part of the community pool. Our cooperative model breaks.

---

## 🟢 Alternative Paths

### Path A: Lithic-First (Cards Only) + Stripe Connect (Accounts)

| Component | Cost | Notes |
|-----------|------|-------|
| **Lithic** (virtual cards) | ~$0.10/card + $0.05/txn | No monthly minimum |
| **Stripe Connect Express** | $2/mo per active account + 0.25% + $0.25/txn | Deposit accounts |
| **Stripe Treasury** | $0 storage, ACH free, $2/wire | FDIC-eligible |
| **Estimated at 1,000 members** | **~$8,000-12,000/mo** | **$8-12/member/mo** |

**Savings vs Unit.co:** $14,650-18,650/month  
**Trade-off:** No white-label app; more integration work

---

### Path B: Column (The Bank Itself)

| Component | Cost | Notes |
|-----------|------|-------|
| **Column** (deposit accounts) | Monthly minimum (~$5K) + $0.50/ACH + $5/wire | Owns bank charter |
| **Lithic** (cards) | ~$0.10/card + per-txn | Card issuing |
| **Estimated at 1,000 members** | **~$10,000-15,000/mo** | **$10-15/member/mo** |

**Savings vs Unit.co:** $11,650-16,650/month  
**Trade-off:** Strict compliance; may not accept cooperative structure

---

### Path C: Direct Community Bank Partnership

| Component | Cost | Notes |
|-----------|------|-------|
| **Community Bank** (deposit accounts) | Negotiable; often lower fees for mission-aligned | Credit union or CDFI |
| **Lithic** (cards) | ~$0.10/card + per-txn | Card issuing |
| **Estimated at 1,000 members** | **~$5,000-10,000/mo** | **$5-10/member/mo** |

**Savings vs Unit.co:** $16,650-21,650/month  
**Trade-off:** Slowest to implement; requires relationship building

---

### Path D: Galileo (SoFi)

| Component | Cost | Notes |
|-----------|------|-------|
| **Galileo** | Enterprise pricing; no public rate card | Known for lower per-account costs |
| **Estimated at 1,000 members** | **Unknown — requires quote** | SoFi subsidiary |

---

## 📊 Cost Per Member Comparison

| Vendor | Per Member/Month (1,000 scale) | Cooperative Viable? |
|--------|-------------------------------|---------------------|
| **Unit.co** | $26.65 | ⚠️ Marginal — eats operations budget |
| **Treasury Prime** | ~$25-35 (estimated) | ⚠️ Similar issue |
| **Column + Lithic** | $10-15 | ✅ Viable |
| **Stripe + Lithic** | $8-12 | ✅ Viable |
| **Community Bank + Lithic** | $5-10 | ✅ Best economics |

---

## ✅ Recommendation

**Lithic is already working.** We should:

1. **Keep Lithic as our card issuer** — lowest cost, fastest to market
2. **Find a cheaper deposit account provider** — not Unit.co or TP
3. **Evaluate Column immediately** — they own their bank charter, no middleware markup
4. **Contact CDFIs/community banks** — mission-aligned, potentially lowest cost
5. **If nothing works by June 10** — Launch with Lithic + Stripe Connect as MVP, upgrade banking partner post-launch

**The 70/20/10 model requires vendor costs under $10/member/month. Unit.co at $26.65 is not sustainable.**

---

*Next step: Get actual quotes from Column and 2-3 community banks*
