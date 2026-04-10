# FOUNDATION FIRST: SOLVY Development Priorities

**Date:** March 29, 2026  
**Status:** 🎯 ACTIVE — MOLI paused, core foundation prioritized  
**Target:** First Circle pilot launch (100 members)

---

## 🛑 PAUSED: MOLI (Membership Owned Life Insurance)

MOLI development is **intentionally paused** until core foundation is solid:

| Component | Status | Resume When |
|-----------|--------|-------------|
| OneAmerica API integration | ❌ Paused | Post-pilot (1,000+ members) |
| MOLI loan portal | ⚠️ Code complete | 6 months post-launch |
| Policy pool expansion | ❌ Paused | Sheila's CV reaches $250K |
| MOLI marketing | ❌ Paused | Core product proven |

**Why:** MOLI is a powerful future feature, but it distracts from proving the core model. Sean's existing OneAmerica policy continues building cash value as a foundation asset, but member-facing MOLI features wait.

---

## 🎯 ACTIVE: Core Foundation

### Priority 1: Unit.co Banking Integration (Weeks 1-4)

```
┌─────────────────────────────────────────────────────────────┐
│  MUST HAVE FOR LAUNCH                                       │
├─────────────────────────────────────────────────────────────┤
│  ✅ Unit sandbox access              [DONE]                │
│  ✅ API token generation             [DONE]                │
│  ⬜ White Label App integration      [IN PROGRESS]         │
│  ⬜ Customer onboarding flow         [IN PROGRESS]         │
│  ⬜ Card issuance (virtual + physical)                     │
│  ⬜ Transaction processing                                 │
│  ⬜ Webhook handling                                       │
└─────────────────────────────────────────────────────────────┘
```

**Files to Focus:**
- `solvy-platform/onboarding.html` — Unit Elements integration
- `solvy-unit-integration/api/unit/` — Backend APIs
- `solvy-platform/banking/index.html` — Member portal

### Priority 2: Cooperative Structure (Weeks 2-6)

```
┌─────────────────────────────────────────────────────────────┐
│  LEGAL & GOVERNANCE                                         │
├─────────────────────────────────────────────────────────────┤
│  ⬜ WY LLC filing complete                                   │
│  ⬜ Operating Agreement with Descendant Class clause         │
│  ⬜ MSB registration (Texas)                                │
│  ⬜ Surety bond ($25K)                                      │
│  ⬜ Bank account for SA Nathan LLC                          │
│  ⬜ Member agreement templates                              │
└─────────────────────────────────────────────────────────────┘
```

**Files to Focus:**
- `FIRST_CIRCLE_CONSTITUTIONAL_FRAMEWORK.md` — Governance
- `GITEA-SETUP-CHECKLIST.md` — Infrastructure

### Priority 3: First Circle Member Acquisition (Weeks 4-12)

```
┌─────────────────────────────────────────────────────────────┐
│  PILOT COHORT: 100 MEMBERS                                  │
├─────────────────────────────────────────────────────────────┤
│  ⬜ SPS partnership agreement finalized                     │
│  ⬜ EBL (Evergreen Beauty Lounge) pilot live                │
│  ⬜ Member onboarding flow tested                           │
│  ⬜ 70/20/10 distribution calculation working               │
│  ⬜ First dividend distribution (Month 3)                   │
└─────────────────────────────────────────────────────────────┘
```

### Priority 4: Basic Infrastructure (Ongoing)

```
┌─────────────────────────────────────────────────────────────┐
│  TECHNOLOGY STACK                                           │
├─────────────────────────────────────────────────────────────┤
│  ✅ Hetzner VPS provisioned          [DONE]                │
│  ✅ Domain (ebl.beauty) registered   [DONE]                │
│  ✅ Basic website deployed           [DONE]                │
│  ⬜ SSL certificates (Let's Encrypt)                       │
│  ⬜ Backup system (Borg + Backblaze)                       │
│  ⬜ Monitoring (Pi 5 + Datadog)                            │
│  ⬜ Security hardening                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 WHAT TO BUILD NOW vs. LATER

### BUILD NOW (Pre-Launch)

| Feature | Why Critical | Owner |
|---------|--------------|-------|
| Unit.co card issuance | Core product | Technical |
| Member onboarding (KYC) | Legal requirement | Unit/Technical |
| Transaction processing | Revenue generation | Unit/Technical |
| 70/20/10 tracking | Cooperative identity | Technical |
| SPS integration | Pilot partner | Business |
| Basic website | Marketing | Technical |

### BUILD LATER (Post-Launch)

| Feature | Why Deferred | Target |
|---------|--------------|--------|
| MOLI loans | Complex, requires scale | 6+ months |
| Mobile app | Web-first MVP | Year 2 |
| Advanced analytics | Nice-to-have | Year 2 |
| Multi-state expansion | Prove model first | Year 2 |
| AI features | Foundation first | Year 2 |

---

## 🗓️ SIMPLIFIED TIMELINE

```
MONTH 1 (April 2026)
├── Week 1-2: Unit integration, legal filings
├── Week 3-4: Onboarding flow, card issuance
└── Deliverable: Working card demo

MONTH 2 (May 2026)
├── Week 1-2: EBL pilot testing
├── Week 3-4: SPS integration
└── Deliverable: 10 beta members

MONTH 3 (June 2026) — JUNETEENTH LAUNCH
├── Week 1-2: First Circle onboarding (100 members)
├── Week 3-4: Marketing, community building
└── Deliverable: Live cooperative with members

MONTHS 4-6 (July-September 2026)
├── First dividend calculation
├── Bug fixes, optimizations
├── Member feedback loop
└── Deliverable: Proven 70/20/10 model

MONTHS 7-12 (October 2026 - March 2027)
├── Scale to 500+ members
├── MOLI re-evaluation
├── Additional features
└── Deliverable: Sustainable cooperative
```

---

## 💰 BUDGET FOCUS: FOUNDATION ONLY

### Immediate Costs (Next 3 Months)

| Category | Amount | Purpose |
|----------|--------|---------|
| **Legal** | $10,000 | LLC, MSB, agreements |
| **Unit.co** | $3,000 | Sandbox + initial fees |
| **Infrastructure** | $500 | VPS, domains, SSL |
| **Marketing** | $2,000 | Launch materials |
| **Buffer** | $4,500 | Contingency |
| **TOTAL** | **$20,000** | **Foundation only** |

### Excluded (MOLI/Phase 2)

| Category | Amount | Deferred Until |
|----------|--------|----------------|
| OneAmerica API dev | $5,000 | 6+ months |
| MOLI portal marketing | $3,000 | Post-pilot |
| Insurance pool | $50,000 | 1,000+ members |

---

## ✅ DAILY FOCUS CHECKLIST

### For Technical Team
- [ ] Unit API integration working?
- [ ] Card issuance functional?
- [ ] Member can onboard end-to-end?
- [ ] Transactions processing?

### For Business Team
- [ ] Legal filings submitted?
- [ ] SPS contract signed?
- [ ] First Circle list finalized?
- [ ] Launch event planned?

### For Sean (Trust Protector)
- [ ] TDIU compliance maintained (passive role only)
- [ ] Sheila Mandate narrative consistent
- [ ] Legal counsel engaged for LLC docs
- [ ] No active management (advisory only)

---

## 🚫 ANTI-PATTERNS (What NOT to Do)

### ❌ Don't Build Yet
- MOLI loan application flow
- Complex analytics dashboards
- Mobile apps
- Multi-state MSB licenses
- Advanced AI features

### ❌ Don't Over-Engineer
- Perfect website (MVP is fine)
- Complex governance voting (start simple)
- Custom banking software (use Unit)
- Fancy marketing (word-of-mouth first)

### ❌ Don't Get Distracted
- Chasing investors (prove model first)
- Building features members didn't ask for
- Perfecting logo/design (™ is enough)
- Expanding before proving

---

## 🎯 SUCCESS CRITERIA (Foundation)

### Minimum Viable Cooperative
- [ ] 100 First Circle members onboarded
- [ ] Cards working (virtual + physical)
- [ ] Transactions processing
- [ ] First dividend calculated (even if small)
- [ ] No compliance issues
- [ ] Positive member feedback

### When to Resume MOLI
- [ ] 1,000+ active members
- [ ] Sheila's policy CV > $250K
- [ ] Core model proven
- [ ] Development bandwidth available
- [ ] Member demand for loans

---

## 📞 ESCALATION

**Stuck on technical?** → Check Unit docs, then Kimi  
**Stuck on legal?** → General counsel  
**Stuck on business?** → SPS partnership focus  
**Tempted to build MOLI?** → Re-read this document

---

**Foundation first. MOLI later. Prove the model. Scale with intention.**

**Document ID:** SOLVY-FOUNDATION-FOCUS-2026-001  
**Last Updated:** March 29, 2026  
**Review:** Weekly until launch
