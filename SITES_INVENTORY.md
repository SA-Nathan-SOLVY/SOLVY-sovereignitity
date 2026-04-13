# SOLVY Ecosystem — Complete Sites & Services Inventory
**Date:** April 13, 2026  
**Purpose:** DNS verification checklist for Cloudflare, Gitea, Hetzner

---

## 🌐 PRIMARY DOMAIN: ebl.beauty

### Main Website (Hetzner VPS - 46.62.235.95)

| # | URL | Path | Status | Description |
|---|-----|------|--------|-------------|
| 1 | **https://ebl.beauty** | `/` | ✅ Live | Main SOLVY website |
| 2 | **https://ebl.beauty/index.html** | `/index.html` | ✅ Live | Homepage |
| 3 | **https://ebl.beauty/about.html** | `/about.html` | ✅ Live | About page |
| 4 | **https://ebl.beauty/heritage.html** | `/heritage.html` | ✅ Live | Freedman/H.R.40/GENIUS |
| 5 | **https://ebl.beauty/manifesto.html** | `/manifesto.html` | ✅ Live | SOLVY Manifesto |
| 6 | **https://ebl.beauty/sovereignty-vs-hustle.html** | `/sovereignty-vs-hustle.html` | ✅ Live | Anti-hustle culture |
| 7 | **https://ebl.beauty/onboarding.html** | `/onboarding.html` | ✅ Live | Member onboarding |
| 8 | **https://ebl.beauty/privacy-dashboard.html** | `/privacy-dashboard.html` | ✅ Live | Privacy controls |

### Sub-Pages (ebl.beauty)

| # | URL | Path | Status | Description |
|---|-----|------|--------|-------------|
| 9 | **https://ebl.beauty/banking/index.html** | `/banking/` | ✅ Live | Banking portal |
| 10 | **https://ebl.beauty/card/solvy-card.html** | `/card/` | ✅ Live | SOLVY Card™ page |
| 11 | **https://ebl.beauty/card/card-customizer.html** | `/card/card-customizer.html` | ✅ Live | Card customization |
| 12 | **https://ebl.beauty/remittance/remittance.html** | `/remittance/` | ✅ Live | Remittance service |
| 13 | **https://ebl.beauty/invoice/invoice-management.html** | `/invoice/` | ✅ Live | Invoice management |
| 14 | **https://ebl.beauty/sps-pilot/index.html** | `/sps-pilot/` | ✅ Live | SPS Joint Venture |
| 15 | **https://ebl.beauty/community/communities.html** | `/community/` | ✅ Live | Community page |
| 16 | **https://ebl.beauty/decidey/decidey-ngo.html** | `/decidey/` | ✅ Live | DECIDEY NGO |

### Internal Tools (ebl.beauty)

| # | URL | Path | Status | Description |
|---|-----|------|--------|-------------|
| 17 | **https://ebl.beauty/internal/man-portal.html** | `/internal/man-portal.html` | ✅ Live | MAN Portal (internal) |
| 18 | **https://ebl.beauty/internal/man-demo.html** | `/internal/man-demo.html` | ✅ Live | MAN Demo |

### API Endpoints (ebl.beauty)

| # | URL | Path | Status | Description |
|---|-----|------|--------|-------------|
| 19 | **https://api.ebl.beauty** | API root | ⏳ Planned | Production API |
| 20 | **https://dev-api.ebl.beauty** | Dev API | ⏳ Planned | Development API |

---

## 🔧 SUBDOMAINS (ebl.beauty)

### Git & Development

| # | Subdomain | URL | Status | Service |
|---|-----------|-----|--------|---------|
| 21 | **gitea** | https://gitea.ebl.beauty | ✅ Live | Gitea Git server |
| 22 | **git** | https://git.ebl.beauty | ⏳ Planned | Git mirror (optional) |

### Communication & Automation

| # | Subdomain | URL | Status | Service |
|---|-----------|-----|--------|---------|
| 23 | **mail** | https://mail.ebl.beauty | 🔴 Planned | MailCow email |
| 24 | **huginn** | https://huginn.ebl.beauty | 🔴 Planned | Huginn automation |
| 25 | **decidey** | https://decidey.ebl.beauty | 🔴 Planned | DECIDEY platform |

### Internal Services

| # | Subdomain | URL | Status | Service |
|---|-----------|-----|--------|---------|
| 26 | **ops** | https://ops.ebl.beauty | 🔴 Future | Operations dashboard |

---

## 🚀 REPLIT APPS

### Primary Replit App

| # | URL | Status | Description |
|---|-----|--------|-------------|
| 27 | **https://solvy-sovereignitity--smayone.replit.app** | ✅ Live | Main SOLVY site (Replit) |
| 28 | **https://solvy-sovereignitity--smayone.replit.app/about.html** | ✅ Live | About page |
| 29 | **https://solvy-sovereignitity--smayone.replit.app/ibc/index.html** | ✅ Live | IBC section |
| 30 | **https://solvy-sovereignitity--smayone.replit.app/sps/index.html** | ✅ Live | SPS section |
| 31 | **https://solvy-sovereignitity--smayone.replit.app/heritage.html** | ✅ Live | Heritage page |
| 32 | **https://solvy-sovereignitity--smayone.replit.app/manifesto.html** | ✅ Live | Manifesto page |
| 33 | **https://solvy-sovereignitity--smayone.replit.app/sovereignty-vs-hustle.html** | ✅ Live | Sovereignty page |

### Other Replit URLs (if any)

| # | URL | Status | Description |
|---|-----|--------|-------------|
| 34 | https://sovereignitity-solvy.replit.app | ✅ Live | Original Replit (separate instance) |

---

## 🖥️ HETZNER VPS (46.62.235.95)

### Services Running

| # | Service | Port | URL | Status |
|---|---------|------|-----|--------|
| 35 | **Nginx (Web)** | 80/443 | https://ebl.beauty | ✅ Live |
| 36 | **SOLVY API** | 3000 | http://localhost:3000 | ✅ Live |
| 37 | **Gitea (via tunnel)** | 3000 (local) | https://gitea.ebl.beauty | ✅ Live |

### Planned Services

| # | Service | Port | Status |
|---|---------|------|--------|
| 38 | **MailCow** | 443 | 🔴 Planned |
| 39 | **Huginn** | 3000 | 🔴 Planned |

---

## 🐳 LOCAL SERVICES (Development)

### Docker Services (localhost)

| # | Service | Local URL | Status |
|---|---------|-----------|--------|
| 40 | **Gitea** | http://localhost:3000 | ✅ When running |
| 41 | **MailCow** | http://localhost:8080 | 🔴 Planned |
| 42 | **Huginn** | http://localhost:3001 | 🔴 Planned |

---

## 📊 DNS CHECKLIST (Cloudflare)

### A Records (Point to 46.62.235.95)

| Subdomain | Type | Target | Status |
|-----------|------|--------|--------|
| `@` (root) | A | 46.62.235.95 | ✅ Should be set |
| `*` (wildcard) | A | 46.62.235.95 | ✅ Should be set |
| `gitea` | A | 46.62.235.95 | ✅ Verify |
| `git` | A | 46.62.235.95 | ⏳ Optional |
| `api` | A | 46.62.235.95 | ⏳ Planned |
| `dev-api` | A | 46.62.235.95 | ⏳ Planned |
| `mail` | A | 46.62.235.95 | 🔴 Future |
| `huginn` | A | 46.62.235.95 | 🔴 Future |
| `decidey` | A | 46.62.235.95 | 🔴 Future |

### CNAME Records

| Subdomain | Type | Target | Status |
|-----------|------|--------|--------|
| `www` | CNAME | ebl.beauty | ✅ Verify |

---

## 🔐 GITEA REPOSITORIES

### Main Repository

| # | URL | Access | Status |
|---|-----|--------|--------|
| 43 | **https://gitea.ebl.beauty/smayone/solvy-platform** | Public | ✅ Live |
| 44 | **http://localhost:3000/smayone/solvy-platform** | Local | ✅ When running |
| 45 | **git@gitea.ebl.beauty:smayone/solvy-platform.git** | SSH | ✅ Live |

---

## 📧 EMAIL ADDRESSES (Planned)

| # | Email | Domain | Status |
|---|-------|--------|--------|
| 46 | **hello@ebl.beauty** | ebl.beauty | 🔴 Future (MailCow) |
| 47 | **support@ebl.beauty** | ebl.beauty | 🔴 Future (MailCow) |
| 48 | **members@ebl.beauty** | ebl.beauty | 🔴 Future (MailCow) |

---

## ✅ VERIFICATION SUMMARY

### Currently Live (Check These)
- [ ] https://ebl.beauty
- [ ] https://ebl.beauty/heritage.html
- [ ] https://ebl.beauty/manifesto.html
- [ ] https://ebl.beauty/sovereignty-vs-hustle.html
- [ ] https://gitea.ebl.beauty
- [ ] https://solvy-sovereignitity--smayone.replit.app

### DNS Records to Verify in Cloudflare
- [ ] A record: @ → 46.62.235.95
- [ ] A record: * → 46.62.235.95
- [ ] A record: gitea → 46.62.235.95
- [ ] CNAME: www → ebl.beauty

### Planned/Future Services
- [ ] mail.ebl.beauty (MailCow)
- [ ] huginn.ebl.beauty (Huginn)
- [ ] decidey.ebl.beauty (DECIDEY)
- [ ] api.ebl.beauty (Production API)

---

*Total Sites/Services: 48 entries*  
*Last Updated: April 13, 2026*
