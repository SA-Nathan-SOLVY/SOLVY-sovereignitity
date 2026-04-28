# SOLVY Platform Deployment Scripts

This directory contains automation scripts for deploying and managing the SOLVY platform.

## Available Scripts

### `deploy-mvp.sh`
Deploy the SOLVY platform to Hetzner VPS with Stripe/Mercury infrastructure.

**Usage:**
```bash
./deploy-mvp.sh [environment]
```

**Environments:**
- `production` (default) - Deploy to live sites
- `staging` - Deploy to staging environment

**What it does:**
1. Pre-flight checks (SSH, dependencies, VPS connectivity)
2. Build React frontend
3. Deploy to all sites (nitty, decidey, ebl, remittance)
4. Verify SSL certificates
5. Test deployments
6. Restart Nginx
7. Optional: Tag deployment in Git

**Example:**
```bash
cd /home/ubuntu/SOLVY-sovereignitity/solvy-platform/scripts
./deploy-mvp.sh production
```

---

### `cutover-sovereign.sh`
Transition from Stripe/Mercury to fully sovereign infrastructure.

⚠️ **WARNING:** This is a MAJOR migration. Test thoroughly in staging first!

**Usage:**
```bash
./cutover-sovereign.sh [environment]
```

**Environments:**
- `staging` - Test cutover in staging
- `production` - Execute production cutover

**What it does:**
1. Pre-cutover checklist (banking charter, card network, compliance)
2. Enable maintenance mode
3. Create data snapshot
4. Switch payment processing (Stripe → Sovereign)
5. Switch banking (Mercury → Sovereign)
6. Update frontend API layer
7. Run smoke tests
8. Disable maintenance mode

**Example:**
```bash
cd /home/ubuntu/SOLVY-sovereignitity/solvy-platform/scripts
./cutover-sovereign.sh staging  # Test first!
./cutover-sovereign.sh production  # Only after staging success
```

---

## Prerequisites

Before running any scripts:

1. **SSH Access:**
   ```bash
   # Ensure SSH key exists
   ls -la ~/.ssh/id_rsa_decidey
   
   # Test VPS connection
   ssh -i ~/.ssh/id_rsa_decidey root@46.62.235.95 "echo 'Connected'"
   ```

2. **Dependencies:**
   ```bash
   # Install pnpm
   npm install -g pnpm
   
   # Verify installation
   pnpm --version
   ```

3. **Git Access:**
   ```bash
   # Clone repository
   git clone https://github.com/SA-Nathan-SOLVY/SOLVY-sovereignitity.git
   
   # Navigate to scripts
   cd SOLVY-sovereignitity/solvy-platform/scripts
   ```

---

## Deployment Workflow

### Standard Deployment (Weekly)

```bash
# 1. Pull latest changes
git pull origin main

# 2. Run deployment
./deploy-mvp.sh production

# 3. Monitor for 30 minutes
# Check error rates, response times, user reports
```

### Emergency Hotfix

```bash
# 1. Create hotfix branch
git checkout -b hotfix/critical-bug

# 2. Make minimal changes
# Fix ONLY the critical bug

# 3. Deploy immediately
./deploy-mvp.sh production

# 4. Monitor closely for 1 hour

# 5. Merge to main
git checkout main
git merge hotfix/critical-bug
git push origin main
```

### Sovereign Infrastructure Cutover

```bash
# 1. Complete pre-cutover checklist (1 week before)
# See docs/runbooks/deployment-runbook.md

# 2. Test in staging
./cutover-sovereign.sh staging

# 3. If staging successful, schedule production cutover
# Send member communication (48 hours notice)

# 4. Execute production cutover
./cutover-sovereign.sh production

# 5. Monitor for 48 hours
# Be ready to rollback if issues arise
```

---

## Troubleshooting

### Script fails with "SSH key not found"

```bash
chmod 600 ~/.ssh/id_rsa_decidey
```

### Script fails with "VPS not reachable"

```bash
ping 46.62.235.95
ssh -i ~/.ssh/id_rsa_decidey root@46.62.235.95
```

### Script fails with "Build failed"

```bash
cd ../frontend
pnpm install
pnpm build
```

### Deployment successful but site not loading

```bash
# Check Nginx status
ssh -i ~/.ssh/id_rsa_decidey root@46.62.235.95 "systemctl status nginx"

# Restart Nginx
ssh -i ~/.ssh/id_rsa_decidey root@46.62.235.95 "systemctl restart nginx"
```

---

## References

- **Deployment Runbook:** `/docs/runbooks/deployment-runbook.md`
- **Architecture Docs:** `/docs/architecture/`
- **VPS Details:** Hetzner VPS (46.62.235.95)
- **GitHub Repo:** https://github.com/SA-Nathan-SOLVY/SOLVY-sovereignitity

---

**Last Updated:** December 12, 2024
