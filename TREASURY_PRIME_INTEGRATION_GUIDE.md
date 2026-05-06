# Treasury Prime Integration Guide for SOLVY
**Status:** Sandbox Active ✅  
**Organization:** SA Nathan-EBL Logo  
**Sandbox URL:** https://app.sandbox.treasuryprime.com  
**Invite Expires:** May 13, 2026 (7 days)  
**Last Updated:** May 5, 2026

---

## ✅ What Just Happened

You received a Treasury Prime sandbox invitation. This means:
- **Pre-funded accounts** already created ($5K each)
- **API keys** ready to generate
- **Full card issuing** capability available NOW
- **No underwriting wait** — sandbox is live immediately

---

## 🔑 Step 1: Get Your API Keys (Do This Now)

1. Go to: https://app.sandbox.treasuryprime.com/auth/login?invitation=wLLSdM9xlL0CXsIZp9ocrngIndPgu7Bb&organization=org_xtpZDwNSbUgWvvYE&organization_name=1kqxcdmwkx3
2. Set up your account
3. Click **"Create API Keys"**
4. Save the **Secret Key** (shown once only!)

**You will get:**
- `API Key ID` (like a username)
- `API Secret Key` (like a password)

---

## 🧪 Step 2: Test the API (5 minutes)

Store your keys and test with curl:

```bash
# Replace with your actual keys
export TP_API_KEY_ID="your_api_key_id"
export TP_API_SECRET="your_api_secret"

# Test ping
curl -u "$TP_API_KEY_ID:$TP_API_SECRET" \
  https://api.sandbox.treasuryprime.com/ping

# List pre-funded accounts
curl -u "$TP_API_KEY_ID:$TP_API_SECRET" \
  https://api.sandbox.treasuryprime.com/account

# Get account balance (replace with actual account ID from above)
curl -u "$TP_API_KEY_ID:$TP_API_SECRET" \
  https://api.sandbox.treasuryprime.com/account/acct_2w458dsi392h2m
```

**Expected response:** Account with $5,000 balance.

---

## 💳 What Treasury Prime Does for SOLVY

Treasury Prime = **Full BaaS** (same as Unit.co)

| Feature | SOLVY Use Case | API Endpoint |
|---------|---------------|--------------|
| **Open deposit accounts** | Member checking accounts | `POST /apply/account_application` |
| **Issue virtual cards** | Instant SOLVY Card™ | `POST /card` |
| **Issue physical cards** | Mail physical SOLVY Card™ | `POST /card` + shipping |
| **ACH transfers** | Direct deposit, bill pay | `POST /ach` |
| **Book transfers** | Move money between members | `POST /book` |
| **Wire transfers** | Large transfers | `POST /wire` |
| **FedNow** | Instant payments 24/7 | `POST /fednow` |
| **Check deposit** | Mobile check deposit | `POST /check_deposit` |
| **Green Dot cash** | Cash load at 90K+ retail | `POST /greendot` |
| **Apple Pay / Google Pay** | Mobile wallet | `POST /provision_with_apple_pay` |
| **KYC verification** | Member identity check | `POST /apply/kyc` |
| **Card controls** | Freeze/unfreeze, limits | `PATCH /card/:id` |
| **Real-time webhooks** | Transaction notifications | `POST /webhook` |
| **Card auth loop** | Approve/decline transactions | `POST /card_auth_loop_endpoint` |

**Card processor:** Marqeta (under the hood) — industry standard, used by Square, DoorDash, etc.

---

## 🏦 Step 3: Open a Member Account (Sandbox)

```bash
# Create a person application (KYC)
curl -X POST https://api.sandbox.treasuryprime.com/apply/person_application \
  -u "$TP_API_KEY_ID:$TP_API_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "Member",
    "dob": "1990-01-01",
    "email": "test@solvy.member",
    "phone": "5125550100",
    "ssn": "000000001",
    "address": {
      "street_line_1": "123 Main St",
      "city": "Austin",
      "state": "TX",
      "postal_code": "78701"
    }
  }'

# Create account application
curl -X POST https://api.sandbox.treasuryprime.com/apply/account_application \
  -u "$TP_API_KEY_ID:$TP_API_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "account_product_id": "your_account_product_id",
    "person_id": "person_id_from_above",
    "initial_deposit": {
      "amount": "100.00",
      "currency": "USD"
    }
  }'
```

---

## 💳 Step 4: Issue a Card (Sandbox)

```bash
# Issue virtual card
curl -X POST https://api.sandbox.treasuryprime.com/card \
  -u "$TP_API_KEY_ID:$TP_API_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "account_id": "acct_from_above",
    "card_product_id": "your_card_product_id",
    "person_id": "person_id_from_above",
    "type": "virtual"
  }'
```

**Response includes:** Card number, expiry, CVV — ready to use immediately.

---

## 📊 How Interchange Works with Treasury Prime

Same model as Unit.co:

```
Member swipes SOLVY Card → Marqeta processes → Interchange generated
→ Treasury Prime distributes → SOLVY gets ~0.90-1.00%
→ SOLVY distributes 70/20/10
```

**Revenue share is negotiated per partnership.** You'll discuss this with Treasury Prime during your production application.

---

## 🔄 Comparison: Treasury Prime vs Unit.co

| Feature | Treasury Prime | Unit.co |
|---------|---------------|---------|
| **Sandbox speed** | ✅ Instant (you have it now) | ✅ 1-2 weeks |
| **Deposit accounts** | ✅ Yes | ✅ Yes |
| **Virtual cards** | ✅ Yes | ✅ Yes |
| **Physical cards** | ✅ Yes | ✅ Yes |
| **ACH** | ✅ Yes | ✅ Yes |
| **Wire** | ✅ Yes | ✅ Yes |
| **FedNow** | ✅ Yes | ❌ No |
| **Check deposit** | ✅ Yes | ❌ No |
| **Green Dot cash** | ✅ Yes | ❌ No |
| **Card processor** | Marqeta | Unit proprietary |
| **Multi-bank** | ✅ Yes (redundancy) | ❌ No (Thread Bank only) |
| **Self-serve API** | ✅ Yes | ⚠️ Partner approval |
| **White-label app** | ⚠️ Build your own | ✅ "Ready To Launch" |

**Key difference:** Unit.co gives you a pre-built white-label app. Treasury Prime gives you APIs — you build the UI. But you already have ebl.beauty built, so Treasury Prime's API-first approach may actually fit better.

---

## 🚀 Step 5: Your Parallel Path Strategy

You now have TWO active sandboxes. Here's how to use them:

### Path A: Treasury Prime (Active Now)
```
Week 1: Build API integration (accounts, cards, transfers)
Week 2: Connect to SOLVY frontend (ebl.beauty)
Week 3: Test member onboarding end-to-end
Week 4: Apply for production
```

### Path B: Unit.co (Keep Pushing)
```
Keep escalating Unit.co weekly
If they approve before Treasury Prime → use Unit.co
If Treasury Prime approves first → use Treasury Prime
```

**Winner:** Whichever gives you production first.

---

## ⚠️ Important Notes

1. **Organization name:** Your org shows as `1kqxcdmwkx3` — this is temporary. You can rename it in settings.

2. **Invite expires:** May 13, 2026. Accept it today.

3. **No free production:** Sandbox is free, but production requires:
   - Completed integration
   - Compliance review
   - Revenue share agreement
   - Background checks

4. **Cooperative model:** Be upfront that SOLVY is member-owned. Ask about:
   - Revenue share for cooperatives
   - Patronage dividend reporting
   - 1099-INT filing (they support this!)

---

## 📁 Files to Create Next

1. `solvy-platform/api/treasuryprime-token.js` — JWT/API auth handler
2. `solvy-platform/js/services/treasuryprime.js` — Frontend integration
3. Update `solvy-platform/underwriting.html` — Add Treasury Prime as partner

---

## 📞 Treasury Prime Contacts

- **Docs:** https://docs.treasuryprime.com
- **Support:** In-app chat (sandbox)
- **Sales:** partnerships@treasuryprime.com

---

*This is your fastest path to production. Treasury Prime sandbox is live. Unit.co is not. Start building.*
