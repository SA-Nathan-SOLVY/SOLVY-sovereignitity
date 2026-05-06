# SOLVY Vendor Reality Check
**Date:** May 5, 2026  
**Purpose:** Honest assessment of Mercury, Baanx, AlchemyPay vs. Unit.co  
**Bottom line:** Only Unit.co (and true BaaS card issuers) can give SOLVY members FDIC-insured debit cards.

---

## 🔴 The Hard Truth

| Vendor | What They Actually Do | Can They Issue SOLVY Cards? |
|--------|----------------------|----------------------------|
| **Unit.co** | White-label BaaS — you issue cards to YOUR members via Thread Bank | ✅ YES — this is the only one that does what you need |
| **Mercury** | Business bank account FOR businesses (like Chase for startups) | ❌ NO — they don't let you issue cards to third parties |
| **Baanx** | Crypto-to-fiat card (spend Bitcoin/USDC as dollars) | ⚠️ PARTIAL — crypto cards, not traditional debit |
| **AlchemyPay** | Crypto on/off ramp (buy crypto with fiat, sell crypto for fiat) | ❌ NO — no card issuing at all |

**Your previous docs said it best:** *"Previously explored Mercury, but approval process timeline was not viable"* — because Mercury was never the right tool for the job.

---

## 📋 Deep Dive: What Each Vendor Actually Offers

### 1. Mercury — Business Banking (Not Card Issuing Platform)

**What Mercury is:** A neobank for startups — like Chase, but online and faster.

**What Mercury does:**
- Open a business checking account for SA Nathan LLC
- Give SA Nathan LLC a corporate debit card
- Process ACH/wires for SA Nathan LLC
- Provide treasury management

**What Mercury does NOT do:**
- ❌ Let you create accounts for SOLVY members
- ❌ Let you issue cards to SOLVY members
- ❌ Provide APIs for member onboarding
- ❌ Handle KYC for your members
- ❌ Share interchange revenue with you

**How SOLVY could use Mercury:**
- **Business account for SA Nathan LLC** — to hold the $225K VCF funds
- **Operational banking** — pay vendors, receive revenue
- **NOT for member card issuing**

**Timeline:** 1-2 days for account opening  
**Cost:** Free basic account  
**Action:** Open this ANYWAY — you need a business bank account for underwriting.

---

### 2. Baanx — Crypto-to-Card Bridge

**What Baanx is:** A BaaS that lets crypto projects issue cards members can load with crypto and spend as fiat.

**What Baanx does:**
- Issue Visa/Mastercard cards
- Cards spend crypto (BTC, ETH, USDC, etc.) converted to fiat at point of sale
- White-label card programs
- Crypto-friendly compliance

**What Baanx does NOT do:**
- ❌ Issue traditional FDIC-insured debit cards
- ❌ Hold USD deposits for members
- ❌ Provide checking accounts
- ❌ Work like a traditional bank

**How SOLVY could use Baanx:**
- **Phase 2/3: Crypto card integration** — members load Guapcoin/USDC, spend anywhere
- **International expansion** — crypto cards work globally without local banking licenses
- **NOT a replacement for Unit.co US debit cards**

**Timeline:** 2-4 months (partnership model)  
**Cost:** Partnership + revenue share (not published)  
**Action:** Explore AFTER US launch, not before.

---

### 3. AlchemyPay — Crypto On/Off Ramp

**What AlchemyPay is:** A payment gateway that lets users buy crypto with fiat (on-ramp) or sell crypto for fiat (off-ramp).

**What AlchemyPay does:**
- Fiat → Crypto (buy BTC/USDC with debit card/bank transfer)
- Crypto → Fiat (sell crypto, receive bank transfer)
- Supports 100+ fiat currencies
- Plug-in widget for websites/apps

**What AlchemyPay does NOT do:**
- ❌ Issue cards of any kind
- ❌ Hold member deposits
- ❌ Provide banking services
- ❌ KYC/AML for ongoing accounts

**How SOLVY could use AlchemyPay:**
- **Future feature:** Let members buy Guapcoin with their SOLVY Card
- **Future feature:** Cash out crypto dividends to fiat
- **NOT a card issuer, NOT a bank replacement**

**Timeline:** 2-4 weeks for sandbox  
**Cost:** Transaction fees (1-3% per conversion)  
**Action:** Explore for crypto features, not core banking.

---

## 🟢 Actual Unit.co Alternatives for Card Issuing

If Unit.co stalls, these are the **real alternatives** that do what Unit.co does:

| Vendor | FDIC Insured? | US Focus? | Cooperative Friendly? | Sandbox Speed | Notes |
|--------|--------------|-----------|----------------------|---------------|-------|
| **Unit.co** | ✅ Thread Bank | ✅ Yes | ⚠️ Unknown | 1-2 weeks | Your current path |
| **Treasury Prime** | ✅ Partner banks | ✅ Yes | ⚠️ Unknown | 2-4 weeks | Strong API, used by Mercury |
| **Lithic** | ⚠️ Not directly | ✅ Yes | ⚠️ Unknown | 1-2 weeks | Card issuing only, no deposits |
| **Stripe Issuing** | ⚠️ Not directly | ✅ Yes | ⚠️ Unknown | 1-2 weeks | Big brand, strict underwriting |
| **Bond** | ✅ Partner banks | ✅ Yes | ⚠️ Unknown | 2-4 weeks | Good for embedded finance |
| **Highnote** | ✅ Partner banks | ✅ Yes | ⚠️ Unknown | 2-4 weeks | Strong virtual card focus |
| **Deserve** | ✅ Partner banks | ✅ Yes | ⚠️ Unknown | 2-4 weeks | Popular with fintechs |

**Important:** None of these are confirmed to support cooperative ownership structures. You'd need to ask each one directly.

---

## 🎯 Recommended Multi-Vendor Architecture

Here's how to use ALL these vendors together (the right way):

```
┌─────────────────────────────────────────────────────────────┐
│                      SOLVY ECOSYSTEM™                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐ │
│  │  UNIT.CO    │    │   MERCURY   │    │    BAANX        │ │
│  │  (Primary)  │    │  (Business) │    │  (Crypto Phase2)│ │
│  │             │    │             │    │                 │ │
│  │ • Member    │    │ • SA Nathan │    │ • Guapcoin      │ │
│  │   debit     │    │   LLC acct  │    │   card          │ │
│  │   cards     │    │ • $225K VCF │    │ • Global        │ │
│  │ • Checking  │    │   funds     │    │   spend         │ │
│  │   accounts  │    │ • Ops       │    │ • Crypto-native │ │
│  │ • 70/20/10  │    │   banking   │    │   members       │ │
│  │   revenue   │    │             │    │                 │ │
│  │   share     │    │             │    │                 │ │
│  └─────────────┘    └─────────────┘    └─────────────────┘ │
│         │                  │                  │             │
│         ▼                  ▼                  ▼             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              ALCHEMYPAY (Future Feature)             │   │
│  │                                                      │   │
│  │  • Buy Guapcoin with SOLVY Card                      │   │
│  │  • Cash out crypto dividends                         │   │
│  │  • Fiat ↔ Crypto bridge                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Immediate Action Plan

### Do TODAY (While Waiting for Unit.co)

| Priority | Action | Vendor | Why |
|----------|--------|--------|-----|
| **1** | Open Mercury business account | Mercury | You need this for VCF funds + underwriting proof |
| **2** | Email Unit.co escalation | Unit.co | Still your best path — don't abandon |
| **3** | Reach out to Treasury Prime | Treasury Prime | Best Unit.co alternative if they stall |
| **4** | Reach out to Lithic | Lithic | Fastest sandbox, card-only (no deposits) |

### Mercury Account Opening (Do This Now)

**URL:** https://mercury.com  
**Entity:** SA Nathan LLC  
**What you need:**
- EIN letter from IRS
- LLC Operating Agreement
- Your ID (passport/driver's license)
- Business address
- 15 minutes online

**Why this matters for Unit.co underwriting:**
- Unit.co wants to see you have a real business bank account
- Mercury is free and fast
- Shows financial maturity

---

## 📧 Outreach Templates

### Treasury Prime (Unit.co Alternative)

```
To: partnerships@treasuryprime.com
Subject: Cooperative Card Program — 100 Founding Members, $225K Capital

Dear Treasury Prime Team,

SA Nathan LLC is launching SOLVY Ecosystem™, a cooperative financial platform 
where members own 70% of interchange revenue. We are exploring card issuing 
partners for our US launch.

Program Details:
• Entity: SA Nathan LLC (Texas)
• Model: Cooperative ownership (members are owners)
• Members: 45 confirmed, 100 target by June 2026
• Capital: $225,000 committed
• Website: https://ebl.beauty

Key Questions:
1. Do you support cooperative ownership structures?
2. What is your sandbox timeline and requirements?
3. Can we white-label cards with our branding?
4. What is your revenue share model for interchange?

We have complete technical integration specs and are ready for sandbox 
evaluation immediately.

—
Sean Mayo
Managing Member, SA Nathan LLC
hello@ebl.beauty
```

### Lithic (Fast Card Issuing)

```
To: sales@lithic.com
Subject: Fintech Card Program — Cooperative Model, Immediate Sandbox Ready

Dear Lithic Team,

SA Nathan LLC is building SOLVY Ecosystem™, a cooperative debit card program 
for underserved communities. We need a card issuing partner with fast sandbox 
access.

What we need:
- Virtual + physical debit cards
- White-label branding
- Real-time transaction webhooks
- Member-level card controls

Our tech stack is React/Node.js, API-ready, and we can integrate within days.

Can we schedule a technical overview call this week?

—
Sean Mayo
Managing Member, SA Nathan LLC
hello@ebl.beauty
https://ebl.beauty
```

---

## ⚠️ What NOT To Do

| Don't | Why |
|-------|-----|
| **Don't wait for Unit.co alone** | Parallel-path with Treasury Prime or Lithic |
| **Don't think Mercury replaces Unit.co** | Mercury is YOUR bank account, not a member card issuer |
| **Don't launch with Baanx as primary** | Crypto cards exclude non-crypto members |
| **Don't build around AlchemyPay** | They're a payment plugin, not a bank |
| **Don't hide cooperative structure** | Be upfront — some vendors won't support it, better to know early |

---

## 🏁 Bottom Line

**Unit.co is still your best bet.** But don't wait with one vendor.

**Parallel path strategy:**
1. **Keep pushing Unit.co** (escalate, call, email weekly)
2. **Open Mercury today** (15 minutes, free, needed anyway)
3. **Contact Treasury Prime + Lithic** this week (backup card issuers)
4. **File Baanx and AlchemyPay** under "2027 crypto features"

The vendor that gets you to market fastest wins. Don't let one stalled vendor kill your June 19 launch.

---

*Prepared: May 5, 2026*  
*Next review: After Mercury account opening + Treasury Prime response*
