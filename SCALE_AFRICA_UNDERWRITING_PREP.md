# Scale Africa — Future Expansion Partner Brief
**Prepared for:** SA Nathan LLC / SOLVY Ecosystem™  
**Date:** May 5, 2026  
**Status:** Phase 2/3 Partner (Post-US Launch)  
**Contact:** hello@getscale.africa | hello@enabling-scale.com

---

## ⚠️ Important Context

**GO-TO-MARKET STRATEGY: US FIRST, THEN INTERNATIONAL**

| Phase | Timeline | Market | Banking Partner |
|-------|----------|--------|-----------------|
| **Phase 1: US Launch** | Now – Jun 2026 | United States | **Unit.co** (primary) |
| **Phase 2: US Scale** | Jul – Dec 2026 | United States | Unit.co |
| **Phase 3: Int'l Expansion** | 2027–2028 | Africa, LatAm, Global South | **Scale Africa** (exploratory) |

Scale Africa (**getscale.africa**) is a **sales-led card issuing partner** focused on African markets. There is no public developer portal or self-service onboarding. This document prepares you for **future conversations** — not immediate action.

**Unit.co remains your US launch partner. Do not divert focus from Unit underwriting.**

---

## 📧 Step 1: Initial Outreach

Send this email to both addresses:
- `hello@getscale.africa`
- `hello@enabling-scale.com`

```
Subject: Exploring Future Partnership — Cooperative Fintech Expanding to Africa (2027)

Dear Scale Partnership Team,

SA Nathan LLC is launching SOLVY Ecosystem™, a cooperative financial platform 
for underserved communities. We are currently in production underwriting with 
Unit.co for our US launch (June 2026).

We are exploring African market expansion in 2027–2028 and would like to 
understand Scale's capabilities for a future partnership.

Program Highlights:
• Cooperative model: members own 70% of interchange revenue
• 45 US founding members confirmed, 100 target by June 2026
• $225,000 committed capital
• Live platform: https://ebl.beauty
• Target African markets: Kenya, Ghana, Nigeria (Year 2-3)

We would like to schedule an introductory call to discuss:
1. Scale's capabilities for US-registered entities expanding to Africa
2. Sandbox access for future technical evaluation
3. BIN sponsorship and issuer processing structure in African markets
4. Pricing for cooperative/fintech card programs

We are not seeking immediate launch — rather building relationships for 
our 2027 international expansion roadmap.

Available for a brief introductory call at your convenience.

—
Sean Mayo
Managing Member, SA Nathan LLC
hello@ebl.beauty
https://ebl.beauty
```

---

## 📋 Step 2: Documents You Already Have (Reuse from Unit.co)

| Document | Your File | Status | Notes for Scale |
|----------|-----------|--------|-----------------|
| Business Plan | `UNIT_UNDERWRITING_BUSINESS_PLAN.md` | ✅ Ready | Add African expansion section |
| Financial Projections | `UNIT_FINANCIAL_PROJECTIONS.md` | ✅ Ready | Add multi-currency (USD/NGN/KES/GHS) |
| Technical Integration | `UNIT_TECHNICAL_INTEGRATION_SPEC.md` | ✅ Ready | Scale uses different API — request specs |
| Entity Certificate | SA Nathan LLC (Texas) | ✅ Ready | May need African local entity or partnership |
| EIN / Tax ID | IRS documentation | ✅ Ready | Required for US entity verification |
| Website / App | https://ebl.beauty | ✅ Ready | Scale will review UX/compliance |

---

## 🌍 Step 3: African-Market-Specific Requirements (New)

Scale will ask for these **in addition to** your Unit.co docs:

### 3.1 Target Market Selection (For 2027–2028)

Scale operates across key African markets. Early research for future expansion:

| Market | Currency | Regulatory Body | Complexity | SOLVY Fit |
|--------|----------|-----------------|------------|-----------|
| **Kenya** | KES | CBK (Central Bank of Kenya) | Medium — fintech-friendly | ⭐ High — M-Pesa ecosystem, cooperative culture |
| **Ghana** | GHS | BoG (Bank of Ghana) | Medium — growing fintech hub | ⭐ High — West African gateway |
| **Nigeria** | NGN | CBN (Central Bank of Nigeria) | High — requires local partnership | Medium — Largest market, complex regs |
| **South Africa** | ZAR | SARB / FSCA | High — strict licensing | Medium — Saturated, high competition |
| **Egypt** | EGP | CBE | High — complex forex | Low — Not in initial roadmap |

**Recommendation for 2027:** Start with **Kenya** (M-Pesa culture + cooperative tradition) or **Ghana** (English-speaking, fintech-friendly).

### 3.2 Local Entity or Partnership Structure (Future)

For 2027–2028 African expansion, Scale will likely require ONE of these:

**Option A: Local Entity (Full Control)**
- Register subsidiary in target country (e.g., Kenya or Ghana)
- Apply for PSP (Payment Service Provider) license or equivalent
- Timeline: 6-12 months
- Cost: $50K-$200K depending on country
- **Best for:** Long-term commitment, full ownership

**Option B: Partnership with Local License Holder (Recommended)**
- Partner with existing African fintech/bank or cooperative
- Scale facilitates BIN sponsorship through their network
- SA Nathan LLC operates as "program manager" from US
- Timeline: 2-3 months after partnership secured
- Cost: Revenue share arrangement
- **Best for:** Speed to market, local expertise

**Option C: Scale Managed Services (Fastest)**
- Scale handles compliance, licensing, and local relationships
- You focus on member acquisition and product
- Timeline: 4-6 weeks to sandbox
- Cost: Higher fees, less control
- **Best for:** Testing market before full commitment

### 3.3 Enhanced KYC / KYB Requirements

African regulators require stricter identity verification:

| Requirement | US (Unit.co) | Africa (Scale) |
|-------------|--------------|----------------|
| Identity verification | SSN + selfie | National ID + biometric + address proof |
| Business verification | EIN + articles | CAC registration (NG) / BRS (KE) + tax PIN |
| PEP screening | Basic | Enhanced — many African jurisdictions on watchlists |
| Sanctions screening | OFAC | OFAC + UN + EU + local lists |
| Transaction monitoring | Standard | Real-time + suspicious activity reporting to local FIU |

### 3.4 Data Residency & Privacy

| Requirement | Details |
|-------------|---------|
| **Data localization** | Some countries (e.g., Nigeria) require citizen data stored locally |
| **POPIA** | South Africa data protection law — consent requirements |
| **NDPR** | Nigeria Data Protection Regulation — similar to GDPR |
| **Scale's role** | Ask if they provide local data hosting or if you need separate infrastructure |

### 3.5 Currency & Settlement

| Question | Why It Matters |
|----------|----------------|
| Can members hold USD and local currency? | African users often prefer USD stability |
| Settlement timeline? | T+1, T+2, or longer? Affects cash flow |
| FX markup? | Hidden fees erode member trust |
| Card currency? | USD-denominated cards vs. local currency cards |

---

## 🔧 Step 4: Technical Requirements for Scale

Scale will evaluate your tech stack. Have these ready:

### 4.1 API Integration Readiness

| Component | Unit.co (Current) | Scale (Expected) |
|-----------|-------------------|------------------|
| Card issuance API | Unit `/cards` | Scale proprietary or REST API |
| Transaction webhooks | Unit webhooks | Scale webhooks — request format |
| Balance inquiry | Unit `/accounts/{id}` | Scale equivalent |
| Freeze/unfreeze | Unit card controls | Scale card controls |
| PIN management | Unit Elements | Scale SDK or API |

**Action:** Ask Scale for:
- API documentation (OpenAPI/Swagger spec)
- Sandbox environment credentials
- Webhook payload examples
- SDK availability (iOS/Android/JS)

### 4.2 Security Requirements

| Requirement | Your Status | Scale Will Ask |
|-------------|-------------|----------------|
| PCI DSS compliance | ❓ Not mentioned | SAQ-A or higher required |
| SOC 2 Type II | ❓ Not mentioned | May be required for production |
| Encryption at rest | ✅ IndexedDB | Confirm for card data |
| Encryption in transit | ✅ HTTPS | TLS 1.3 required |
| Penetration testing | ❓ Not done | Annual pen test required |
| Bug bounty program | ❌ No | Nice to have |

### 4.3 Fraud & Risk Controls

Scale will ask about your fraud prevention strategy:

| Control | Description | Your Prep |
|---------|-------------|-----------|
| Velocity limits | Max transactions per hour/day | Define limits per member tier |
| Geographic blocking | Block high-risk countries | Configure by member profile |
| MCC restrictions | Block gambling, crypto, etc. | Define restricted categories |
| Real-time alerts | SMS/app notifications for transactions | Integration with Scale's alert system |
| Dispute process | How members report fraud | Document your process |

---

## 💰 Step 5: Financial Requirements

### 5.1 Capital Requirements

| Use | Estimated Amount | Notes |
|-----|-----------------|-------|
| Setup / onboarding fee | $5K-$25K | One-time, negotiable for cooperatives |
| Monthly minimum | $500-$2K | May be waived for first 6 months |
| Chargeback reserve | 5-10% of volume | Held for 180 days typically |
| Compliance bond | Varies by country | Some regulators require security deposit |

### 5.2 Pricing to Negotiate

| Fee Type | Typical Range | Your Target |
|----------|---------------|-------------|
| Interchange revenue share | 30-50% to you | Negotiate 60%+ (cooperative model) |
| Per-card issuance | $2-$5 | Negotiate bulk rate |
| Monthly card maintenance | $0.50-$2 | Negotiate waived for first year |
| Transaction processing | $0.10-$0.30 + % | Negotiate blended rate |
| FX conversion | 1-3% markup | Negotiate member-friendly rate |

---

## 📊 Step 6: Compliance & Regulatory Checklist

### 6.1 Documents to Prepare

| Document | Status | Priority |
|----------|--------|----------|
| SA Nathan LLC Operating Agreement | ✅ Ready | Critical |
| EIN Confirmation Letter | ✅ Ready | Critical |
| Certificate of Formation | ✅ Ready | Critical |
| Business bank account statement | ⚠️ Need to verify | Critical |
| Director/UBO identity documents | ⚠️ Need to prepare | Critical |
| Proof of address (business) | ⚠️ Need to prepare | High |
| Financial projections (3-year) | ✅ Ready | High |
| Compliance policy (AML/KYC) | ❌ Need to create | High |
| Data protection policy | ❌ Need to create | High |
| Incident response plan | ❌ Need to create | Medium |
| Business continuity plan | ❌ Need to create | Medium |

### 6.2 AML/KYC Policy (Create This)

Scale will require a written AML/KYC policy. Key sections:

1. **Customer Identification Program (CIP)**
   - What ID documents you collect
   - How you verify authenticity
   - Record retention (5+ years)

2. **Customer Due Diligence (CDD)**
   - Risk rating methodology (low/medium/high)
   - Enhanced Due Diligence (EDD) triggers
   - Ongoing monitoring procedures

3. **Suspicious Activity Monitoring**
   - Transaction monitoring rules
   - Alert escalation procedures
   - SAR/STR filing timelines

4. **OFAC/Sanctions Screening**
   - Screening frequency (real-time vs. batch)
   - List sources (OFAC, UN, EU, local)
   - Match resolution procedures

---

## 🎯 Step 7: SOLVY-Specific Positioning for Scale

### Your US Traction Is Your Best Asset

When you talk to Scale in 2027, lead with US proof:

| Point | Why Scale Cares |
|-------|-----------------|
| **Proven US cooperative model** | De-risked concept, real transaction data |
| **1,000+ US members at expansion** | Proven demand, not speculative |
| **Unit.co production live** | Technical maturity, compliance validation |
| **70/20/10 revenue share proven** | Member retention model that works |
| **ADOS/Indigenous/Global South mission** | Aligns with African development goals |
| **Transparent (MAN portal)** | Compliance-friendly, audit-ready |

### Questions to Ask Scale (When Ready)

1. "Do you support US-registered entities expanding to Africa?"
2. "What is your fastest market to launch in — Kenya, Ghana, or Nigeria?"
3. "Can you provide a sandbox API spec for technical evaluation?"
4. "What is your chargeback liability model?"
5. "Do you offer white-label card design like Unit.co?"
6. "Can we start with virtual cards only, then add physical?"
7. "What is your PCI DSS scope — do you handle most of it?"
8. "Do you have existing cooperative or community banking clients in Africa?"
9. "Can US members use cards in Africa, and vice versa?"
10. "What is your cross-border settlement timeline?"

---

## 🚫 What NOT To Do Now

| Don't | Why |
|-------|-----|
| **Don't delay Unit.co underwriting** | US launch is Phase 1. Nothing else matters until this is live. |
| **Don't register an African entity yet** | Wait until you have US product-market fit and capital. |
| **Don't commit to Scale pricing now** | You'll have more leverage with US traction data in 2027. |
| **Don't build African KYC yet** | Focus on US onboarding (SSN-based) for June launch. |
| **Don't divert development resources** | Unit.co integration, MAN portal, and First Circle onboarding are the only priorities. |

---

## ✅ ACTION CHECKLIST

### NOW — US Launch Focus (Do Not Skip)
- [ ] **Complete Unit.co underwriting** — this is your only priority
- [ ] **Launch First Circle** — 100 US members by June 19, 2026
- [ ] **Prove 70/20/10 model** — real transaction data, real dividends
- [ ] **Build US traction** — target 1,000 US members by end of 2026

### LATER — Scale Preparation (2027 Timeline)
- [ ] Revisit this document after US launch
- [ ] Update business plan with African expansion section
- [ ] Prepare Director/UBO identity documents (passport, proof of address)
- [ ] Draft AML/KYC policy (can adapt from Unit.co compliance framework)
- [ ] Decide on target African market (recommend Kenya or Ghana)
- [ ] Send exploratory email to Scale (email template included above)

### Scale Conversations (When Ready in 2027)
- [ ] Request sandbox credentials and API documentation
- [ ] Ask for pricing sheet and revenue share model
- [ ] Clarify licensing requirements for your target market
- [ ] Request references from other fintech clients
- [ ] Ask about timeline: sandbox → test → production

### After Scale Approval (Future)
- [ ] Integrate Scale API alongside Unit.co (dual-provider strategy)
- [ ] Implement African-market KYC flows
- [ ] Set up local data residency if required
- [ ] Configure fraud rules for African transaction patterns
- [ ] Test virtual card issuance in sandbox

---

## 📁 Files to Attach to Scale Outreach

1. `UNIT_UNDERWRITING_BUSINESS_PLAN.md` (updated with African expansion)
2. `UNIT_FINANCIAL_PROJECTIONS.md` (with multi-currency assumptions)
3. `UNIT_TECHNICAL_INTEGRATION_SPEC.md` (shows technical maturity)
4. SA Nathan LLC Certificate of Formation
5. EIN confirmation letter
6. Screenshot of https://ebl.beauty (live site proof)
7. First Circle member commitment summary

---

*Prepared: May 5, 2026*  
*Next step: Send outreach email to hello@getscale.africa*
