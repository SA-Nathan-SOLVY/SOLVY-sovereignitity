# SOLVY Operations & Infrastructure

**Purpose:** Infrastructure setup guides and operational documentation  
**Owner:** DevOps Team / SCRUM Master  
**Last Updated:** March 25, 2025

---

## 📁 Directory Structure

```
ops/
├── README.md                     # This file
├── mailcow/                      # Email server
│   └── MAILCOW-SETUP-GUIDE.md
├── huginn/                       # Automation platform
│   └── HUGINN-SETUP-GUIDE.md
├── monitoring/                   # RPi5 monitoring stack
│   └── RPi5-MONITORING-STACK.md
├── scripts/                      # Utility scripts
│   └── (deployment scripts)
└── docs/                         # Operational docs
    └── (runbooks, procedures)
```

---

## 🚀 Infrastructure Components

| Component | Purpose | Status | Guide |
|-----------|---------|--------|-------|
| **Gitea** | Git server | 🟡 Setup Tomorrow | `gitea-tunnel-setup/` |
| **MailCow** | Email server | 🔴 Planned | `mailcow/MAILCOW-SETUP-GUIDE.md` |
| **Huginn** | Automation | 🔴 Planned | `huginn/HUGINN-SETUP-GUIDE.md` |
| **Monitoring** | Metrics & Alerts | 🔴 Planned | `monitoring/RPi5-MONITORING-STACK.md` |

---

## 📋 Setup Priority

### Phase 1: Core Infrastructure (This Week)
1. ✅ **Gitea** - Code repository (Tomorrow)
2. ⏳ **MailCow** - Team email (Next week)

### Phase 2: Automation & Monitoring (Next Sprint)
3. ⏳ **Huginn** - Marketing automation
4. ⏳ **Monitoring Stack** - RPi5 with Grafana/Prometheus

### Phase 3: Going to Market
5. ⏳ **Huginn workflows** - Automated sequences
6. ⏳ **Monitoring alerts** - Production readiness

---

## 🔧 Quick Reference

### Gitea (Code Repository)
```bash
cd gitea-tunnel-setup
./manage.sh start      # Start server
./manage.sh tunnel     # Start public access
./manage.sh status     # Check status
```

**URLs:**
- Local: http://localhost:3000
- Public: https://gitea.ebl.beauty

### MailCow (Email)
```bash
# After setup
cd /opt/mailcow/mailcow-dockerized
docker compose up -d
```

**URLs:**
- Admin: https://mail.solvy.coop
- Webmail: https://mail.solvy.coop/SOGo

### Huginn (Automation)
```bash
# After setup
cd /opt/huginn
docker compose up -d
```

**URL:** https://automation.solvy.coop

### Monitoring (RPi5)
```bash
# On Raspberry Pi
cd /opt/monitoring
docker compose up -d
```

**URL:** http://100.x.x.x:3000 (Tailscale)

---

## 👥 Roles & Responsibilities

| Component | Primary | Secondary | Documentation |
|-----------|---------|-----------|---------------|
| Gitea | @devops | @sa-nathan | `GITEA_SETUP_INSTRUCTIONS.md` |
| MailCow | @devops | @sa-nathan | `ops/mailcow/` |
| Huginn | @sa-nathan | @sean | `ops/huginn/` |
| Monitoring | @devops | @sa-nathan | `ops/monitoring/` |

---

## 📊 Infrastructure Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE (DNS/SSL)                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
       ┌───────────────┼───────────────┐
       │               │               │
┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
│   Gitea     │ │  MailCow    │ │   Huginn    │
│  (Git)      │ │  (Email)    │ │(Automation) │
│             │ │             │ │             │
│gitea.ebl    │ │mail.solvy   │ │automation   │
│.beauty      │ │.coop        │ │.solvy.coop  │
└─────────────┘ └─────────────┘ └─────────────┘
                       │
       ┌───────────────┘
       │
┌──────▼──────────────────────────────────────────────────────┐
│              TAILSCALE VPN (Secure Network)                  │
└──────┬──────────────────────────────────────────────────────┘
       │
┌──────▼──────┐
│  RPi5       │
│ Monitoring  │
│             │
│ Prometheus  │
│ Grafana     │
│ AlertManager│
└─────────────┘
```

---

## 🎯 Success Criteria

### Phase 1 Complete When:
- [ ] Gitea accessible at https://gitea.ebl.beauty
- [ ] All code pushed to Gitea
- [ ] Team accounts created
- [ ] MailCow sending/receiving email

### Phase 2 Complete When:
- [ ] Huginn running automation workflows
- [ ] RPi5 monitoring all systems
- [ ] Alerts configured and tested

### Phase 3 Complete When:
- [ ] Member onboarding automated
- [ ] Marketing sequences active
- [ ] Full monitoring coverage

---

## 🚨 Escalation

**Infrastructure Down:**
1. Check: `./manage.sh status` or `docker compose ps`
2. Restart: `./manage.sh restart`
3. Escalate: @sa-nathan

**Security Incident:**
1. Isolate affected system
2. Document: Screenshot/logs
3. Escalate: @sa-nathan immediately

**Need New Infrastructure:**
1. Create task: `ops/docs/INFRA-REQUEST.md`
2. Assign: @devops
3. Review: @sa-nathan

---

## 📚 Documentation Standards

When adding new infrastructure:

1. Create setup guide in appropriate subdirectory
2. Include: prerequisites, installation, configuration, troubleshooting
3. Add to this README index
4. Update infrastructure diagram
5. Test procedure before documenting

---

**Questions?** Contact @sa-nathan or @devops
