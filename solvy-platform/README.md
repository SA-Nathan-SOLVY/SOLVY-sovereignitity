# SOLVY Platform

**America's First P2P Payment Platform** - Member-owned cooperative financial infrastructure for veterans, freelancers, and small businesses.

## 🏗️ Architecture Overview

```
solvy-platform/
├── frontend/                 # React app (nitty.ebl.beauty, decidey.ebl.beauty)
│   ├── src/api/             # Abstracted API layer (stripe, mercury, persona, clerk)
│   └── ...                  # React components, hooks, pages
├── backend/                  # Node.js/Express API server
│   ├── routes/              # API endpoints
│   ├── controllers/         # Business logic
│   ├── middleware/          # Auth, validation, logging
│   └── models/              # Data models
├── scripts/                  # Automation scripts
│   ├── deploy-mvp.sh        # Deploy to Hetzner VPS (Stripe/Mercury phase)
│   └── cutover-sovereign.sh # Future: Switch to sovereign infrastructure
├── docker/                   # Dockerfiles for services
├── kubernetes/               # K8s manifests for scaling (future)
└── docs/                     # Architecture decisions, runbooks, API specs
    ├── architecture/         # ADRs, system design docs
    ├── runbooks/             # Operational procedures
    └── api-specs/            # API documentation
```

## 🚀 Deployment Phases

### Phase 1: MVP (Current) - Stripe + Mercury
- **Payment Processing**: Stripe
- **Banking**: Mercury
- **KYC**: Persona ($1-2 per verification)
- **Auth**: Clerk (free up to 10K users)
- **Email**: Resend (free 3K emails/month)
- **Admin**: Tooljet (self-hosted, free)
- **Hosting**: Hetzner VPS ($10/month)

**Deploy command:**
```bash
./scripts/deploy-mvp.sh
```

### Phase 2: Sovereign Infrastructure (Future)
- **Payment Processing**: Direct card network integration
- **Banking**: Own banking charter or partner bank
- **Infrastructure**: Self-hosted, decentralized
- **Data**: Full sovereignty, no third-party dependencies

**Cutover command:**
```bash
./scripts/cutover-sovereign.sh
```

## 💰 Revenue Model

- **Interchange fees**: 1.5-2.5% per transaction
- **Optional membership**: $5-10/month
- **Average revenue**: ~$15/month per active member

**Projections:**
- 100 members: $18K/year
- 1K members: $180K/year
- 10K members: $1.8M/year

## 🛡️ Core Values

1. **Member Ownership** - Cooperative structure, members own the platform
2. **Economic Sovereignty** - Breaking systemic barriers to wealth building
3. **Data Privacy** - Self-sovereign identity, no data exploitation
4. **Transparency** - Mandatory Audit Network (MAN) for full accountability

## 📚 Key Concepts

### SOVEREIGNITITY™
Self-sovereign identity system combining:
- Digital identity ownership
- Cooperative governance
- Economic empowerment
- Data sovereignty

### SPS (Supplier Payment System)
Reverse inventory system where suppliers upload invoices, EBL (pilot partner) pays via SOLVY Card, earning interchange fees.

### DECIDEY NGO
Educational nonprofit teaching:
- Financial literacy
- Cooperative economics
- Digital sovereignty
- Economic justice

## 🌐 Live Sites

- **SOLVY Card**: https://nitty.ebl.beauty
- **DECIDEY NGO**: https://decidey.ebl.beauty
- **EBL Pilot**: https://ebl.beauty
- **Remittance**: https://remittance.ebl.beauty

## 📖 Documentation

See `/docs` folder for:
- Architecture Decision Records (ADRs)
- Deployment runbooks
- API specifications
- Onboarding guides for new developers

## 🤝 Contributing

This is a cooperative platform. All contributors can become member-owners.

---

**Built with:** React, TypeScript, Node.js, Tailwind CSS, Stripe, Mercury, Persona, Clerk, Resend, Tooljet

**Inspired by:** Marcus Garvey, MLK, Malcolm X - continuing the legacy of economic sovereignty in the digital age.
