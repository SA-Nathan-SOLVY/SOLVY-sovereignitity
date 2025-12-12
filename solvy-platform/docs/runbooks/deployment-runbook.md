# SOLVY Platform Deployment Runbook

**Version:** 1.0  
**Last Updated:** December 12, 2024  
**Owner:** Platform Engineering Team  
**On-Call:** TBD

---

## Overview

This runbook provides step-by-step procedures for deploying the SOLVY platform to production. It covers both routine deployments (bug fixes, features) and major infrastructure changes (cutover to sovereign infrastructure).

---

## Prerequisites

Before deploying, ensure you have:

- [ ] SSH access to Hetzner VPS (46.62.235.95)
- [ ] SSH key configured (`~/.ssh/id_rsa_decidey`)
- [ ] Git access to repository (SA-Nathan-SOLVY/SOLVY-sovereignitity)
- [ ] `pnpm` installed locally
- [ ] Access to monitoring dashboards
- [ ] Emergency rollback plan reviewed

---

## Deployment Types

### 1. Standard Deployment (Features, Bug Fixes)

**Frequency:** Weekly  
**Risk Level:** Low  
**Downtime:** None (rolling deployment)

**Steps:**

```bash
# 1. Pull latest code
cd /home/ubuntu/SOLVY-sovereignitity/solvy-platform
git pull origin main

# 2. Run deployment script
cd scripts
./deploy-mvp.sh production

# 3. Monitor deployment
# Watch for errors in output
# Script will test all sites automatically

# 4. Verify deployment
# Visit each site and test key flows:
# - https://nitty.ebl.beauty (SOLVY Card)
# - https://decidey.ebl.beauty (DECIDEY NGO)
# - https://ebl.beauty (EBL Pilot)
# - https://remittance.ebl.beauty (Remittance)

# 5. Monitor for 30 minutes
# Check error rates, response times, user reports
```

**Rollback Procedure:**

```bash
# If deployment fails, rollback to previous version
git revert HEAD
./deploy-mvp.sh production
```

---

### 2. Emergency Hotfix

**Frequency:** As needed  
**Risk Level:** Medium  
**Downtime:** <5 minutes

**Steps:**

```bash
# 1. Create hotfix branch
git checkout -b hotfix/critical-bug-fix

# 2. Make minimal changes
# Fix ONLY the critical bug, nothing else

# 3. Test locally
cd frontend
pnpm install
pnpm build
pnpm preview

# 4. Deploy immediately
cd ../scripts
./deploy-mvp.sh production

# 5. Monitor closely for 1 hour
# Be ready to rollback if issues arise

# 6. Merge hotfix to main
git checkout main
git merge hotfix/critical-bug-fix
git push origin main
```

---

### 3. Infrastructure Cutover (Stripe → Sovereign)

**Frequency:** Once (Phase 2 → Phase 3 transition)  
**Risk Level:** HIGH  
**Downtime:** 2-4 hours (planned maintenance)

**Pre-Cutover Checklist (Complete 1 week before):**

- [ ] Banking charter approved or partner bank agreement signed
- [ ] Direct card network integration tested in staging
- [ ] Data migration scripts tested and validated
- [ ] Rollback procedures documented and rehearsed
- [ ] Member communication sent (48 hours notice)
- [ ] Support team trained on new system
- [ ] Monitoring and alerting configured
- [ ] Compliance approvals obtained
- [ ] Emergency contacts notified
- [ ] Backup systems verified

**Cutover Day Timeline:**

```
00:00 - Pre-cutover meeting (all hands)
01:00 - Enable maintenance mode
02:00 - Create data snapshot
03:00 - Begin cutover script
04:00 - Switch payment processing
05:00 - Switch banking infrastructure
06:00 - Deploy new frontend
07:00 - Run smoke tests
08:00 - Disable maintenance mode
09:00 - Monitor system health
12:00 - Post-cutover retrospective
```

**Cutover Commands:**

```bash
# 1. Final pre-cutover checks
cd /home/ubuntu/SOLVY-sovereignitity/solvy-platform/scripts
./pre-cutover-checks.sh

# 2. Run cutover script
./cutover-sovereign.sh production

# 3. Follow prompts carefully
# Script will guide through each phase
# Confirm each step before proceeding

# 4. Monitor system health
# Watch dashboards for:
# - Transaction success rates
# - Error rates
# - Response times
# - Member reports
```

**Rollback Procedure (If Cutover Fails):**

```bash
# 1. Immediately enable maintenance mode
ssh root@46.62.235.95 "systemctl stop nginx"

# 2. Restore data snapshot
./restore-snapshot.sh [snapshot-id]

# 3. Revert to Stripe/Mercury
git checkout [pre-cutover-tag]
./deploy-mvp.sh production

# 4. Disable maintenance mode
ssh root@46.62.235.95 "systemctl start nginx"

# 5. Notify members of rollback
# Send email via Resend API

# 6. Schedule post-mortem
# Document what went wrong
# Plan fixes before retry
```

---

## Monitoring and Alerting

### Key Metrics to Monitor

| Metric | Normal Range | Alert Threshold | Critical Threshold |
|--------|--------------|-----------------|-------------------|
| **Response Time** | <200ms | >500ms | >1000ms |
| **Error Rate** | <0.1% | >1% | >5% |
| **Transaction Success** | >99% | <95% | <90% |
| **Uptime** | 99.9% | <99% | <95% |
| **CPU Usage** | <50% | >80% | >95% |
| **Memory Usage** | <60% | >85% | >95% |
| **Disk Usage** | <70% | >85% | >95% |

### Monitoring Commands

```bash
# Check system health
ssh root@46.62.235.95 "top -n 1"

# Check Nginx logs
ssh root@46.62.235.95 "tail -f /var/log/nginx/access.log"
ssh root@46.62.235.95 "tail -f /var/log/nginx/error.log"

# Check disk usage
ssh root@46.62.235.95 "df -h"

# Check SSL certificates
ssh root@46.62.235.95 "certbot certificates"

# Test site availability
curl -I https://nitty.ebl.beauty
curl -I https://decidey.ebl.beauty
curl -I https://ebl.beauty
curl -I https://remittance.ebl.beauty
```

---

## Common Issues and Solutions

### Issue 1: Site Not Loading (502 Bad Gateway)

**Symptoms:** Users see "502 Bad Gateway" error

**Diagnosis:**
```bash
ssh root@46.62.235.95 "systemctl status nginx"
```

**Solution:**
```bash
# Restart Nginx
ssh root@46.62.235.95 "systemctl restart nginx"

# If that doesn't work, check logs
ssh root@46.62.235.95 "tail -100 /var/log/nginx/error.log"
```

---

### Issue 2: SSL Certificate Expired

**Symptoms:** Browser shows "Your connection is not private"

**Diagnosis:**
```bash
ssh root@46.62.235.95 "certbot certificates"
```

**Solution:**
```bash
# Renew certificates
ssh root@46.62.235.95 "certbot renew"
ssh root@46.62.235.95 "systemctl reload nginx"
```

---

### Issue 3: Deployment Script Fails

**Symptoms:** `deploy-mvp.sh` exits with error

**Diagnosis:**
```bash
# Check error message in script output
# Common causes:
# - SSH key not found
# - VPS not reachable
# - Build failed
# - Disk full
```

**Solution:**
```bash
# If SSH key issue
chmod 600 ~/.ssh/id_rsa_decidey

# If VPS not reachable
ping 46.62.235.95

# If build failed
cd frontend
pnpm install
pnpm build

# If disk full
ssh root@46.62.235.95 "df -h"
ssh root@46.62.235.95 "du -sh /var/www/*"
```

---

### Issue 4: High Error Rate After Deployment

**Symptoms:** Monitoring shows >1% error rate

**Diagnosis:**
```bash
# Check error logs
ssh root@46.62.235.95 "tail -100 /var/log/nginx/error.log"

# Check browser console for frontend errors
# Open https://nitty.ebl.beauty
# Press F12 → Console tab
```

**Solution:**
```bash
# Rollback immediately
git revert HEAD
./deploy-mvp.sh production

# Investigate root cause
# Fix in development
# Test thoroughly before redeploying
```

---

## Emergency Contacts

| Role | Name | Contact | Availability |
|------|------|---------|--------------|
| **Platform Owner** | Nathan | TBD | 24/7 |
| **Lead Engineer** | TBD | TBD | Business hours |
| **DevOps** | TBD | TBD | On-call rotation |
| **Support Lead** | TBD | TBD | Business hours |

---

## Post-Deployment Checklist

After every deployment:

- [ ] All sites loading correctly
- [ ] Navigation working across all sites
- [ ] Signup flow tested
- [ ] Payment processing tested (if applicable)
- [ ] Error rates normal (<0.1%)
- [ ] Response times normal (<200ms)
- [ ] SSL certificates valid
- [ ] Monitoring dashboards green
- [ ] No user reports of issues
- [ ] Deployment tagged in Git
- [ ] Team notified of successful deployment

---

## Deployment History

| Date | Version | Type | Deployed By | Notes |
|------|---------|------|-------------|-------|
| 2024-12-12 | v1.0 | Initial | Nathan + Manus AI | First production deployment |
| TBD | TBD | TBD | TBD | TBD |

---

## References

- **Deployment Script:** `/solvy-platform/scripts/deploy-mvp.sh`
- **Cutover Script:** `/solvy-platform/scripts/cutover-sovereign.sh`
- **Architecture Docs:** `/solvy-platform/docs/architecture/`
- **VPS Access:** `ssh root@46.62.235.95 -i ~/.ssh/id_rsa_decidey`
- **GitHub Repo:** https://github.com/SA-Nathan-SOLVY/SOLVY-sovereignitity

---

**Document Version:** 1.0  
**Next Review:** Monthly (or after major incident)
