# SOLVY Stack Budget
## Complete Cost Breakdown for SA Nathan LLC

**Document Version**: 1.0  
**Date**: March 29, 2026  
**Entity**: SA Nathan LLC (SOLVY Cooperative)  
**Fiscal Year**: 2026

---

## 📊 EXECUTIVE SUMMARY

| Category | Monthly | Year 1 Total |
|----------|---------|--------------|
| **Infrastructure & Hosting** | $85 | $1,020 |
| **Banking & Unit.co** | $500-7,250* | $87,000 |
| **Insurance (MOLI)** | $2,083 | $25,000 |
| **Technology & SaaS** | $450 | $5,400 |
| **Legal & Compliance** | $3,000 | $36,000 |
| **Personnel** | $6,000 | $72,000 |
| **Marketing & Growth** | $1,500 | $18,000 |
| **Admin & Other** | $1,270 | $15,240 |
| **TOTAL OPERATING** | **$14,888** | **$259,660** |

*Unit costs scale with member count (see Banking section)

**One-Time Setup**: $30,500  
**Break-Even**: Month 4 (150 members)  
**Cash Required to Launch**: $25,000

---

## 🖥️ 1. INFRASTRUCTURE & HOSTING

### 1.1 Production VPS (Hetzner)

| Component | Specs | Monthly Cost | Annual Cost |
|-----------|-------|--------------|-------------|
| **Hetzner VPS** | 4 vCPU, 8GB RAM, 160GB SSD | €12.40 (~$13.50) | $162 |
| **Backup Storage** | 100GB | €2.50 (~$2.70) | $32 |
| **Floating IP** | Static IP | €1.00 (~$1.10) | $13 |
| **Bandwidth** | 20TB included | $0 | $0 |
| **Subtotal** | | **$17.30** | **$207** |

**Notes:**
- Primary domain: ebl.beauty (46.62.235.95)
- Hosts: SOLVY Platform, Unit Integration API, MOLI Portal
- Scalable to CPX31 (8 vCPU, 16GB) at €26.50/mo when needed

### 1.2 Monitoring Infrastructure (Raspberry Pi 5)

| Component | Specs | One-Time | Monthly |
|-----------|-------|----------|---------|
| **Raspberry Pi 5** | 8GB RAM | $85 | - |
| **NVMe SSD** | 256GB | $45 | - |
| **Power Supply** | Official 27W | $15 | - |
| **Cooling** | Active cooler | $10 | - |
| **Case** | Official case | $12 | - |
| **Tailscale** | VPN (5 devices free) | - | $0 |
| **Subtotal** | | **$167** | **$0** |

**Running Cost:** ~$1/month electricity (5-8W)

### 1.3 Domain & DNS

| Service | Provider | Monthly | Annual |
|---------|----------|---------|--------|
| **ebl.beauty** | Porkbun/Namecheap | - | $15 |
| **solvy.coop** | Reserved | - | $30 |
| **api.ebl.beauty** | Subdomain | - | $0 |
| **Cloudflare** | DNS + CDN + WAF (Pro tier) | $20 | $240 |
| **Subtotal** | | **$24** | **$285** |

> **Receipt**: Cloudflare Pro Plan — $240/yr (purchased May 4, 2026)
> - Covers: solvy.cards + ebl.beauty (WAF, bot detection, CDN, image optimization)
> - Added by: Kimi Code CLI

### 1.4 SSL Certificates

| Service | Cost | Notes |
|---------|------|-------|
| **Let's Encrypt** | Free | Auto-renew via Certbot |
| **Cloudflare Origin** | Free | Additional security |
| **Subtotal** | **$0** | |

### Infrastructure Summary

| Period | Cost |
|--------|------|
| **One-Time (Pi 5 setup)** | $167 |
| **Monthly Recurring** | $22 |
| **Year 1 Total** | $1,020 |

---

## 💳 2. BANKING & UNIT.CO

### 2.1 Unit.co Platform Fees

| Fee Type | Rate | Month 1 (100 members) | Month 12 (1,000 members) |
|----------|------|----------------------|-------------------------|
| **Monthly Platform Fee** | $500/mo | $500 | $500 |
| **Account Maintenance** | $2/account | $200 | $2,000 |
| **Card Issuance (Physical)** | $5/card | $500 | $2,500 |
| **Card Issuance (Virtual)** | $0.50/card | $50 | $500 |
| **Transaction Processing** | $0.10/txn | $1,500 | $18,000 |
| **ACH Transfers** | $0.25/transfer | $250 | $3,000 |
| **Wire Transfers** | $15/outgoing | $30 | $150 |
| **TOTAL** | | **$3,030** | **$26,650** |

*Note: Early months lower; assumes growth trajectory*

### 2.2 Interchange Revenue (Offset)

| Metric | Month 1 | Month 12 |
|--------|---------|----------|
| Transaction Volume | $637,500 | $10,800,000 |
| Gross Interchange (1.5%) | $9,563 | $162,000 |
| Unit Revenue Share (0.3%) | $1,913 | $32,400 |
| **NET to SOLVY (1.2%)** | **$7,650** | **$129,600** |

**Net Unit Costs after Interchange:**
- Month 1: $3,030 fees - $7,650 revenue = **+$4,620 profit**
- Month 12: $26,650 fees - $129,600 revenue = **+$102,950 profit**

### 2.3 MOLI Loan Processing

| Fee Type | Rate | Notes |
|----------|------|-------|
| **Processing Fee** | 0.5% | Deducted from loan amount |
| **ACH to Card** | $0 | Internal book transfer |
| **OneAmerica API** | TBD | When live integration available |

### Banking Summary

| Period | Gross Fees | Interchange Offset | Net Cost |
|--------|-----------|-------------------|----------|
| **Year 1** | $87,000 | $259,200 | **-$172,200** (Net Positive) |

---

## 🛡️ 3. INSURANCE (MOLI)

### 3.1 OneAmerica Whole Life Policy

| Component | Details | Annual Cost |
|-----------|---------|-------------|
| **Base Policy** | $500K face, PUA rider | $20,000 |
| **Premium Load** | ~5% | $1,000 |
| **Policy Fees** | Monthly admin | $200 |
| **Subtotal** | | **$21,200** |

### 3.2 Cooperative MOLI Pool (Future)

| Component | Target | Annual |
|-----------|--------|--------|
| **Pool Premiums** | 10 member policies | $50,000 |
| **Admin Overhead** | 10% | $5,000 |
| **Subtotal** | | **$55,000** |

*Note: Pool activates after Sheila's policy cash value reaches $250K*

### Insurance Summary

| Policy | Monthly | Annual |
|--------|---------|--------|
| Sheila's IBC Policy | $1,767 | $21,200 |
| MOLI Pool (Phase 2) | $4,583 | $55,000 |
| **Current** | **$1,767** | **$21,200** |

---

## 🛠️ 4. TECHNOLOGY & SAAS

### 4.1 Development Tools

| Service | Tier | Monthly | Annual |
|---------|------|---------|--------|
| **GitHub/Gitea** | Self-hosted | $0 | $0 |
| **VSCodium** | Open source | $0 | $0 |
| **Docker Hub** | Free tier | $0 | $0 |
| **Subtotal** | | **$0** | **$0** |

### 4.2 Monitoring & Observability

| Service | Tier | Monthly | Annual |
|---------|------|---------|--------|
| **Datadog** | Pro (5 hosts) | $75 | $900 |
| **Grafana Cloud** | Free tier | $0 | $0 |
| **Prometheus** | Self-hosted | $0 | $0 |
| **Uptime Robot** | Pro (100 monitors) | $15 | $180 |
| **Subtotal** | | **$90** | **$1,080** |

### 4.3 Communication

| Service | Tier | Monthly | Annual |
|---------|------|---------|--------|
| **MailCow** | Self-hosted | $0 | $0 |
| **Mailgun** | Concept (10K emails) | $0 | $0 |
| **Huginn** | Self-hosted | $0 | $0 |
| **Subtotal** | | **$0** | **$0** |

### 4.4 Security

| Service | Tier | Monthly | Annual |
|---------|------|---------|--------|
| **1Password** | Teams (10 users) | $20 | $240 |
| **Tailscale** | Personal (free) | $0 | $0 |
| **Cloudflare WAF** | Pro | $20 | $240 |
| **Subtotal** | | **$40** | **$480** |

### 4.5 Productivity

| Service | Tier | Monthly | Annual |
|---------|------|---------|--------|
| **Notion** | Plus (10 guests) | $10 | $120 |
| **Figma** | Professional | $15 | $180 |
| **Whimsical** | Pro | $12 | $144 |
| **Subtotal** | | **$37** | **$444** |

### 4.6 Backup & Storage

| Service | Tier | Monthly | Annual |
|---------|------|---------|--------|
| **BorgBackup** | Self-hosted | $0 | $0 |
| **Backblaze B2** | 100GB | $0.50 | $6 |
| **Subtotal** | | **$0.50** | **$6** |

### Technology Summary

| Category | Monthly | Annual |
|----------|---------|--------|
| Monitoring | $90 | $1,080 |
| Security | $40 | $480 |
| Productivity | $37 | $444 |
| Backup | $0.50 | $6 |
| **TOTAL** | **$167.50** | **$2,010** |

---

## ⚖️ 5. LEGAL & COMPLIANCE

### 5.1 Entity & Governance

| Service | Cost | Frequency |
|---------|------|-----------|
| **WY LLC Filing** | $100 | One-time |
| **WY Annual Report** | $60 | Annual |
| **Registered Agent** | $50 | Annual |
| **Operating Agreement** | $2,500 | One-time |
| **Bylaws Drafting** | $1,500 | One-time |
| **Subtotal (Recurring)** | | **$110/year** |

### 5.2 Banking & MSB Compliance

| Service | Cost | Frequency |
|---------|------|-----------|
| **MSB Registration** | $2,000 | One-time |
| **MSB Renewal** | $500 | Annual |
| **Surety Bond (TX)** | $500 | Annual |
| **Compliance Program** | $5,000 | One-time |
| **Subtotal (Recurring)** | | **$1,000/year** |

### 5.3 Legal Counsel

| Service | Monthly | Annual |
|---------|---------|--------|
| **General Counsel Retainer** | $1,500 | $18,000 |
| **Elder Law Attorney (SNT)** | $500 | $6,000 |
| **Banking Specialist** | $500 | $6,000 |
| **Subtotal** | **$2,500** | **$30,000** |

### 5.4 Compliance Personnel

| Role | Hours/Week | Monthly | Annual |
|------|-----------|---------|--------|
| **Compliance Officer (Part-time)** | 10 | $583 | $7,000 |
| **AML Monitoring Tools** | - | $50 | $600 |
| **Subtotal** | **$633** | **$7,600** |

### Legal Summary

| Category | Monthly | Annual |
|----------|---------|--------|
| Entity Maintenance | $10 | $110 |
| MSB Compliance | $83 | $1,000 |
| Legal Counsel | $2,500 | $30,000 |
| Compliance Ops | $633 | $7,600 |
| **TOTAL** | **$3,226** | **$38,710** |

*Note: Includes one-time setup costs of $11,150 in first year*

---

## 👥 6. PERSONNEL

### 6.1 Core Team (Year 1)

| Role | FTE | Monthly | Annual |
|------|-----|---------|--------|
| **Executive (Sean - passive)** | 0.2 | $4,000 | $48,000 |
| **Technical Lead** | 0.5 | $2,000 | $24,000 |
| **Subtotal** | **0.7** | **$6,000** | **$72,000** |

### 6.2 Contractors & Advisors

| Role | Hours | Monthly | Annual |
|------|-------|---------|--------|
| **Tax Accountant** | Quarterly | $400 | $1,200 |
| **Bookkeeper** | Monthly | $200 | $2,400 |
| **Community Manager** | As needed | $200 | $2,400 |
| **Subtotal** | | **$800** | **$6,000** |

### Personnel Summary

| Category | Monthly | Annual |
|----------|---------|--------|
| Core Team | $6,000 | $72,000 |
| Contractors | $800 | $6,000 |
| **TOTAL** | **$6,800** | **$78,000** |

---

## 📢 7. MARKETING & GROWTH

### 7.1 Digital Marketing

| Channel | Monthly | Annual | Notes |
|---------|---------|--------|-------|
| **Meta Ads** | $500 | $6,000 | Facebook/Instagram |
| **Google Ads** | $300 | $3,600 | Local search |
| **Content Creation** | $200 | $2,400 | Canva Pro, etc. |
| **Subtotal** | **$1,000** | **$12,000** | |

### 7.2 Events & Community

| Event | Cost | Frequency |
|-------|------|-----------|
| **Juneteenth Launch** | $2,500 | One-time |
| **Quarterly Meetups** | $500 | $2,000/year |
| **SPS Partnership Events** | $300 | $3,600/year |
| **Subtotal (Recurring)** | **$467** | **$5,600** |

### 7.3 Referral Program

| Component | Monthly | Annual |
|-----------|---------|--------|
| **Referral Bonuses** | $200 | $2,400 |
| **Tracking Software** | $0 | $0 (self-built) |
| **Subtotal** | **$200** | **$2,400** |

### Marketing Summary

| Category | Monthly | Annual |
|----------|---------|--------|
| Digital Marketing | $1,000 | $12,000 |
| Events | $467 | $5,600 |
| Referrals | $200 | $2,400 |
| **TOTAL** | **$1,667** | **$20,000** |

---

## 📋 8. ADMINISTRATION & OTHER

### 8.1 Insurance

| Policy | Annual | Monthly |
|--------|--------|---------|
| **General Liability** | $1,200 | $100 |
| **Cyber Liability** | $2,400 | $200 |
| **E&O (Directors)** | $1,800 | $150 |
| **Subtotal** | **$5,400** | **$450** |

### 8.2 Office & Misc

| Item | Monthly | Annual |
|------|---------|--------|
| **Virtual Office** | $50 | $600 |
| **Office Supplies** | $50 | $600 |
| **Software Licenses** | $100 | $1,200 |
| **Banking Fees** | $50 | $600 |
| **Professional Development** | $100 | $1,200 |
| **Miscellaneous** | $100 | $1,200 |
| **Subtotal** | **$450** | **$5,400** |

### 8.3 Accounting

| Service | Monthly | Annual |
|---------|---------|--------|
| **QuickBooks** | $30 | $360 |
| **CPA Review** | $400 | $4,800 |
| **Subtotal** | **$430** | **$5,160** |

### Admin Summary

| Category | Monthly | Annual |
|----------|---------|--------|
| Insurance | $450 | $5,400 |
| Office & Misc | $450 | $5,400 |
| Accounting | $430 | $5,160 |
| **TOTAL** | **$1,330** | **$15,960** |

---

## 💰 ONE-TIME SETUP COSTS

### Pre-Launch (Month 0)

| Category | Item | Cost |
|----------|------|------|
| **Legal Entity** | WY LLC Filing | $100 |
| | Operating Agreement | $2,500 |
| | Bylaws | $1,500 |
| **Compliance** | MSB Registration | $2,000 |
| | Compliance Program | $5,000 |
| | Surety Bond | $500 |
| **Technology** | Development | $10,000 |
| | Pi 5 Monitoring Setup | $167 |
| **Marketing** | Branding/Design | $3,000 |
| | Website Development | $3,000 |
| | Launch Event | $2,500 |
| **Other** | Misc Setup | $233 |
| **TOTAL ONE-TIME** | | **$30,500** |

---

## 📈 COST SCALING MODEL

### Variable Costs by Member Count

| Members | Unit Fees | Infrastructure | Support | **Monthly Total** |
|---------|-----------|----------------|---------|-------------------|
| 100 | $3,030 | $25 | $500 | **$14,888** |
| 250 | $4,500 | $45 | $750 | **$18,250** |
| 500 | $7,500 | $65 | $1,000 | **$23,750** |
| 1,000 | $13,750 | $100 | $1,500 | **$33,500** |
| 2,000 | $26,500 | $150 | $2,500 | **$52,500** |

*Note: Fixed costs (legal, insurance, core personnel) remain constant while Unit fees and support scale*

---

## 🎯 BUDGET SCENARIOS

### Conservative (150 members Year 1)

| Category | Annual |
|----------|--------|
| Revenue | $150,000 |
| Costs | $200,000 |
| **Net** | **-$50,000** |

### Base Case (1,000 members Year 1)

| Category | Annual |
|----------|--------|
| Revenue | $292,500 |
| Costs | $259,660 |
| **Net** | **+$32,840** |

### Optimistic (2,000 members Year 1)

| Category | Annual |
|----------|--------|
| Revenue | $450,000 |
| Costs | $380,000 |
| **Net** | **+$70,000** |

---

## 📋 CASH FLOW TIMELINE

| Month | Members | Revenue | Costs | Cash Flow | Cumulative |
|-------|---------|---------|-------|-----------|------------|
| 0 | - | - | $30,500 | -$30,500 | -$30,500 |
| 1 | 100 | $17,650 | $14,888 | +$2,762 | -$27,738 |
| 3 | 150 | $23,108 | $15,200 | +$7,908 | -$12,000 |
| 6 | 350 | $36,288 | $17,500 | +$18,788 | +$25,000 |
| 9 | 600 | $53,040 | $20,000 | +$33,040 | +$120,000 |
| 12 | 1,000 | $129,600 | $25,000 | +$104,600 | +$334,000 |

---

## ✅ BUDGET CHECKLIST

### Pre-Launch (Month 0)
- [ ] $25,000 initial capital secured
- [ ] $30,500 one-time costs allocated
- [ ] Hetzner VPS provisioned ($17/mo)
- [ ] Domains registered ($45/year)
- [ ] OneAmerica policy current ($1,767/mo)
- [ ] Legal retainers signed ($2,500/mo)
- [ ] Unit sandbox access confirmed

### Monthly Monitoring
- [ ] Unit fee reconciliation
- [ ] Interchange revenue tracking
- [ ] 70/20/10 distribution calculation
- [ ] MOLI loan processing fees
- [ ] Infrastructure uptime monitoring
- [ ] Legal/compliance budget review

### Quarterly Review
- [ ] Budget vs. actual analysis
- [ ] Cost scaling assessment
- [ ] Member growth projection update
- [ ] Insurance policy review
- [ ] Vendor contract renewals

---

## 📞 VENDOR CONTACTS

| Vendor | Service | Contact | Cost |
|--------|---------|---------|------|
| Hetzner | VPS Hosting | hetzner.com | $17/mo |
| OneAmerica | Life Insurance | oneamerica.com | $1,767/mo |
| Unit.co | Banking API | unit.co | Variable |
| Datadog | Monitoring | datadog.com | $75/mo |
| 1Password | Password Mgmt | 1password.com | $20/mo |
| Cloudflare | DNS/CDN | cloudflare.com | $20/mo |

---

**Document ID**: SOLVY-BUDGET-2026-001  
**Last Updated**: March 29, 2026  
**Next Review**: April 30, 2026  
**Owner**: SA Nathan LLC Finance Committee
