# SOVEREIGNITITY Stack

## SOLVY Ecosystem™ — Cooperative Financial Platform

**Mission:** Build generational wealth infrastructure for families who survived slavery, displacement, and colonialism through cooperative economic ownership.

**Status:** 🎯 Foundation Phase — Building for First Circle pilot launch  
**Launch Target:** June 19, 2026 (Juneteenth)  
**Entity:** SA Nathan LLC (Wyoming cooperative)

---

## 🎯 Current Focus: Foundation First

We are intentionally focused on **core infrastructure** before advanced features. MOLI and other Phase 2 features are paused.

### What's Being Built Now
- ✅ Unit.co banking integration (cards, accounts, transactions)
- ✅ First Circle pilot (100 founding members)
- ✅ Legal structure (WY LLC, MSB registration)
- ✅ Core website and member portal
- ✅ 70/20/10 cooperative economics

### What's Paused (Phase 2)
- ⏸️ MOLI (Membership Owned Life Insurance) — [see phase2-moli/](solvy-platform/phase2-moli/)
- ⏸️ Mobile apps
- ⏸️ Advanced analytics
- ⏸️ Multi-state expansion

**Why:** Prove the core model first. MOLI requires scale. [Read the full rationale →](FOCUS_FOUNDATION_FIRST.md)

---

## 📚 Key Documents

| Document | Purpose |
|----------|---------|
| [📊 Foundation Status](FOUNDATION_STATUS.md) | Weekly progress dashboard |
| [🎯 Foundation Focus](FOCUS_FOUNDATION_FIRST.md) | Why we're pausing MOLI, priorities |
| [💰 Budget](SOLVY_STACK_BUDGET.md) | Complete cost breakdown |
| [💵 Budget Cheat Sheet](SOLVY_BUDGET_CHEAT_SHEET.md) | Quick reference |
| [™️ Trademark Guide](TRADEMARK_WEBSITE_LABELING_GUIDE.md) | SOLVY Ecosystem™ / SOLVY Card™ usage |
| [📜 Manifesto](SOLVY%20MANIFESTO.md) | The Sheila Mandate |

### For Development
- [🏗️ Unit Integration](solvy-platform/banking/UNIT-INTEGRATION.md)
- [💻 Hetzner Setup](HETZNER_SETUP.md)
- [🔒 Gitea Setup](GITEA-SETUP-CHECKLIST.md)

### For Legal/Compliance
- [⚖️ Constitutional Framework](FIRST_CIRCLE_CONSTITUTIONAL_FRAMEWORK.md)
- [📋 Sheila Clause](SHEILA_CLAUSE_FOR_ATTORNEY.md)
- [📄 SNT Promissory Note](SNT_PROMISSORY_NOTE.md)

---

## 🏗️ Repository Structure

```
SOVEREIGNITITY-Stack/
├── solvy-platform/           # Main web platform
│   ├── index.html           # Homepage (SOLVY Ecosystem™)
│   ├── about.html           # About page with acronym
│   ├── onboarding.html      # Unit.co member onboarding
│   ├── banking/             # Member banking portal
│   ├── card/                # SOLVY Card™ product pages
│   ├── api/                 # Backend APIs
│   └── phase2-moli/         # ⏸️ PAUSED: MOLI features
├── solvy-unit-integration/  # Unit.co API integration
├── ops/                     # Infrastructure (Gitea, MailCow, etc.)
├── manus-deploy/            # Deployed website versions
├── replit-deploy/           # Replit deployments
└── *.md                     # Documentation
```

---

## 🚀 Quick Start

### For Development
```bash
# Clone repository
git clone https://gitea.ebl.beauty/smayone/solvy-platform.git

# Start local server
cd solvy-platform
python3 -m http.server 8000

# Open http://localhost:8000
```

### For Deployment
```bash
# Deploy to Hetzner VPS
./DEPLOY_TO_HETZNER.sh

# Or manually:
ssh root@46.62.235.95
cd /opt/solvy
docker-compose up -d
```

---

## 💳 The SOLVY Model

### 70/20/10 Economics
- **70%** — Member patronage dividends
- **20%** — Community development pool
- **10%** — Operations reserve

### The Sheila Mandate
> "Leave them better than I received."
> — Sheila McDaniel, Grantor

Every feature, every decision, every line of code serves this mandate.

---

## 👥 Team

| Role | Name | Status |
|------|------|--------|
| Trust Protector | Sean Mayo | Passive (TDIU compliant) |
| Legal Counsel | (Engaging) | Retainer pending |
| AI Development Partners | Kimi Code & Replit | Primary development partner |
| Technical Advisor | DeepSeek AI | Mathematical modeling, business logic |
| First Circle | 45 confirmed, 55 pending | Pilot cohort |

---

## 📅 Timeline

| Date | Milestone |
|------|-----------|
| April 15 | Unit integration complete |
| May 1 | Legal structure complete |
| June 19 | **JUNETEENTH LAUNCH** 🚀 |
| September | First dividend distribution |
| 2027 | MOLI Phase 2 (1,000+ members) |

---

## 🤝 Partners

- **Unit.co** — Banking infrastructure
- **SPS Joint Venture** — Pilot partner #2
- **Evergreen Beauty Lounge** — Pilot partner #1

---

## 📞 Contact

- **Website:** https://ebl.beauty
- **Gitea:** https://gitea.ebl.beauty
- **Entity:** SA Nathan LLC

---

## 📜 License & Trademarks

- **SOLVY Ecosystem™** — Trademark pending
- **SOLVY Card™** — Product of SA Nathan LLC
- **Code:** Proprietary (cooperative ownership)

---

**Foundation first. The iron fist, digital.** 🛡️
