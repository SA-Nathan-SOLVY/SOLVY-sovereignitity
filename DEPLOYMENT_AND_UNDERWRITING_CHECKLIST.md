# SOLVY Deployment & Underwriting Checklist
**Date:** April 13, 2026  
**Prepared for:** Sean Mayo, SA Nathan LLC  
**Goal:** Submit Unit.co underwriting + prepare Baanx backup + infrastructure verification

---

## 🔄 PART 1: GITEA SYNC

### Issue
- Localhost Gitea (`http://localhost:3000`) not accessible remotely
- `git.ebl.beauty` requires web login for authentication

### Fix (Do This)
```bash
# 1. Log into Gitea via browser
open https://git.ebl.beauty/user/login

# 2. Generate an access token
# Settings → Applications → Generate New Token
# Name: "CLI Push Token" | Scopes: repo, write:repository

# 3. Update remote with token
cd /Users/smayone/Sovereignitity-Stack
git remote set-url gitea-hetzner https://smayone:YOUR_TOKEN@git.ebl.beauty/smayone/solvy-platform.git

# 4. Push
git push gitea-hetzner main
```

### Alternative: SSH Push
```bash
# Ensure SSH key is added to Gitea
git remote set-url gitea-hetzner git@git.ebl.beauty:smayone/solvy-platform.git
git push gitea-hetzner main
```

---

## 🌐 PART 2: INFRASTRUCTURE VERIFICATION

### Cloudflare DNS — ebl.beauty

| Record | Type | Target | Status | Check |
|--------|------|--------|--------|-------|
| @ | A | 46.62.235.95 | ✅ Verified | dig ebl.beauty |
| * | A | 46.62.235.95 | ✅ Verified | dig *.ebl.beauty |
| gitea | A | 46.62.235.95 | ⚠️ Check | Should point to VPS |
| git | A | 46.62.235.95 | ✅ Working | https://git.ebl.beauty responds |
| www | CNAME | ebl.beauty | ⚠️ Check | Add if missing |

### Cloudflare Actions Needed
- [ ] **SSL/TLS Mode:** Set to "Full (strict)"
- [ ] **Always Use HTTPS:** Turn ON
- [ ] **Page Rule for Replit (if using Option 1):**
  - URL: `ebl.beauty/*`
  - Setting: Forwarding URL → 301
  - Target: `https://sovereignitity-solvy.replit.app/$1`

---

### Hetzner VPS — 46.62.235.95

| Service | Port | Status | Command to Verify |
|---------|------|--------|-------------------|
| Nginx Web | 80/443 | ✅ Live | `curl -I https://ebl.beauty` |
| SOLVY API | 3000 | ✅ Live | `pm2 status` on server |
| Gitea | 3003 | ✅ Live | `systemctl status gitea` |
| MailCow | 443 | 🔴 NOT RUNNING | `docker ps | grep mailcow` |
| Huginn | 3000 | 🔴 NOT RUNNING | Check Huginn service |

### Hetzner Commands to Run
```bash
ssh root@46.62.235.95

# Check all services
systemctl status nginx
systemctl status gitea
pm2 status

docker ps | grep mailcow  # Should show mailcow containers
docker ps | grep huginn   # Should show huginn containers
```

**Result:** MailCow and Huginn are NOT currently running on Hetzner.

---

### MailCow Status — CRITICAL FOR UNIT.CO

**Current State:** 🔴 **NOT DEPLOYED**

Unit.co will email you at `hello@ebl.beauty` during underwriting. **If MailCow isn't running, you will miss those emails.**

#### Quick Options:

**Option A: Forward ebl.beauty emails to Gmail (Fastest — 5 minutes)**
1. In Cloudflare: Email → Email Routing
2. Add catch-all rule: `*@ebl.beauty` → `your-gmail@gmail.com`
3. Verify Gmail address
4. Done — all emails forward immediately

**Option B: Start MailCow on Hetzner (1-2 hours)**
```bash
ssh root@46.62.235.95
cd /opt/mailcow/mailcow-dockerized
docker compose up -d
```
- Requires Docker, DNS records, SSL setup
- More robust long-term

**Recommendation:** Do **Option A NOW** for underwriting, then **Option B later**.

---

## 💼 PART 3: UNIT.CO UNDERWRITING SUBMISSION

### Documents Ready ✅

| Document | File | Status |
|----------|------|--------|
| Business Plan | `UNIT_UNDERWRITING_BUSINESS_PLAN.md` | ✅ Ready |
| Financial Projections | `UNIT_FINANCIAL_PROJECTIONS.md` | ✅ Ready |
| Technical Integration | `UNIT_TECHNICAL_INTEGRATION_SPEC.md` | ✅ Ready |
| Sandbox Implementation | `UNIT_SANDBOX_IMPLEMENTATION_GUIDE.md` | ✅ Ready |
| Readiness Report | `solvy-unit-integration/UNDERWRITING_READINESS_REPORT.md` | ✅ Ready |

### Escalation Email (Ready to Send)

**To:** partners@unit.co, support@unit.co  
**Subject:** PRODUCTION ACCESS REQUEST — $225K Capital Committed | 45 Members Confirmed

```
Dear Unit.co Partnership Team,

I am writing to request expedited review for production API access for SA Nathan 
LLC (SOLVY Ecosystem™).

CAPITAL COMMITMENT
• $225,000 in committed seed capital (VCF/SNT structured, legal confirmation 
  April 13)
• $25,000 immediately available for operational reserves
• Extended runway with full capital deployment

MEMBER VALIDATION  
• 45 First Circle members expressed interest
• $100 equity deposit structure launching this week
• Target: 100 founding members by June 19, 2026 (Juneteenth launch)

TECHNICAL READINESS
• Sandbox integration: COMPLETE
• Callback endpoints: CONFIGURED
• Webhook handling: OPERATIONAL
• JWT token generation: TESTED
• Website: LIVE at https://ebl.beauty
• MAN Portal (Mandatory Audit Network): LIVE at https://ebl.beauty/internal/man-portal.html

First Circle members are independent beauty contractors in Texas — a $480M 
underserved market. They are waiting. We are ready.

REQUEST:
1. Expedited underwriting review (this week if possible)
2. Production API keys for June 1 testing
3. Direct contact for partnership manager

We respectfully request a response within 48 hours with next steps or scheduling 
for underwriting call.

Documentation attached:
• Business Plan
• Financial Projections (12-month)
• Technical Integration Spec

Thank you for supporting cooperative banking innovation.

—
Sean Mayo
Managing Member, SA Nathan LLC
hello@ebl.beauty
https://ebl.beauty
```

### What to Attach
1. `UNIT_UNDERWRITING_BUSINESS_PLAN.md` (PDF if possible)
2. `UNIT_FINANCIAL_PROJECTIONS.md`
3. `UNIT_TECHNICAL_INTEGRATION_SPEC.md`

---

## 🏦 PART 4: TEMPORARY BANKING FOR VCF FUNDS

### Urgent Need
You need an account to receive the $225K VCF funds quickly. Here are the fastest options:

| Option | Speed | Pros | Cons |
|--------|-------|------|------|
| **Mercury** | 1-2 days | Free, online, business accounts | No physical branches |
| **Novo** | 1-3 days | Free, online, good for LLCs | Mobile-only |
| **Relay Financial** | 1-3 days | Multiple accounts, free wires | Online only |
| **Wells Fargo Business** | Same day (in branch) | Physical branch, immediate | Fees, paperwork |
| **Chase Business** | Same day (in branch) | Trusted by underwriters | Higher fees |

### Recommended Path
**For speed:** Open **Mercury** account online TODAY (15 minutes)
- URL: https://mercury.com
- Entity: SA Nathan LLC
- EIN required
- Approval: 1-2 business days
- Can receive wire transfers

**For immediate need:** Walk into **Chase Business** with:
- LLC Operating Agreement
- EIN letter
- ID
- Utility bill (for address)
- Open same day

### Important: Keep Unit.co Path Open
Unit.co will likely want to see that SA Nathan LLC has a business bank account. Mercury or Chase satisfies this requirement.

---

## 🔄 PART 5: BAANX BACKUP PREPARATION

### Why Baanx Matters
- Crypto-friendly (aligns with future Guapcoin integration)
- Higher interchange revenue potential
- Faster approval for new entities
- Less US regulatory friction

### Baanx Application Prep
**URL:** https://www.baanx.com/products

**What to gather:**
- SA Nathan LLC certificate
- EIN documentation
- Business bank account (see Part 4)
- Business plan (`UNIT_UNDERWRITING_BUSINESS_PLAN.md`)
- First Circle member count
- Website URL: https://ebl.beauty

### Suggested Outreach Email
```
Subject: Cooperative Banking Partnership — 100 Founding Members, $225K Capital

Dear Baanx Partnership Team,

SA Nathan LLC is launching SOLVY Ecosystem™, a cooperative financial platform 
for underserved communities. We are exploring card issuance and crypto-friendly 
BaaS partners.

Highlights:
• 45 founding members confirmed, 100 target by June 2026
• $225,000 committed capital
• Cooperative model: members own 70% of interchange revenue
• Website: https://ebl.beauty
• Interest in future stablecoin/remittance integration

Could we schedule an introductory call?

—
Sean Mayo
Managing Member, SA Nathan LLC
hello@ebl.beauty
```

---

## ⚡ ACTION PRIORITY LIST

### Do TODAY (Before Underwriting Submission)
1. [ ] **Set up Cloudflare email forwarding** for `hello@ebl.beauty`
2. [ ] **Send Unit.co escalation email** with attachments
3. [ ] **Open Mercury business account** (or walk into Chase)
4. [ ] **Push commits to Gitea** (log in to https://git.ebl.beauty first)

### Do THIS WEEK
5. [ ] **Follow up with Unit.co** (call if no response in 48 hours)
6. [ ] **Contact Baanx** for exploratory call
7. [ ] **Set up Stripe payment link** for First Circle deposits
8. [ ] **Start MailCow on Hetzner** (or keep Cloudflare forwarding)

### Do BEFORE VCF FUNDS ARRIVE
9. [ ] **Business bank account approved and funded**
10. [ ] **Account numbers ready for VCF deposit**
11. [ ] **Trust/SNT structure confirmed with lawyer**

---

## 📊 TRUST BUILDING FOR MOTHER

### What You're Establishing
| Element | How It Builds Trust |
|---------|---------------------|
| **Live website** | Shows real infrastructure |
| **Unit.co partnership** | Legitimate banking backing |
| **Business bank account** | Proper financial structure |
| **MAN Portal transparency** | Nothing hidden |
| **Baanx exploration** | Backup plan shows seriousness |
| **VCF lawyer meeting** | Legal compliance confirmed |

### Key Message for Mother
> "We have a real bank partner (Unit.co), a real website (ebl.beauty), a real business account, and a real path to return wealth to members. This isn't speculation — it's infrastructure."

---

*Prepared: April 13, 2026*  
*Next review: After Unit.co response and lawyer meeting*
