# SOLVY Ecosystem™ — CI/CD Pipeline Setup

> **Goal:** Push code → Gitea Actions automatically deploys to your Hetzner VPS  
> **Target:** Gitea (self-hosted at gitea.ebl.beauty)  
> **Also works with:** GitHub Actions (same YAML syntax)

---

## 📋 What the Pipeline Does

```
git push origin main
        │
        ▼
┌─────────────────────────────┐
│  1. Test Job                │
│     - Syntax check JS files │
│     - Verify scripts exist  │
│     - Check frontend files  │
└─────────────────────────────┘
        │
        ▼ (only if tests pass)
┌─────────────────────────────┐
│  2. Prepare Job             │
│     - Run prepare-local.sh  │
│     - Create deploy tarball │
└─────────────────────────────┘
        │
        ▼
┌─────────────────────────────┐
│  3. Deploy Job              │
│     - Upload to VPS (rsync) │
│     - Execute deploy.sh     │
│     - Run health checks     │
└─────────────────────────────┘
        │
        ▼
   🎉 Live on ebl.beauty
```

---

## 🔧 Step 1: Enable Gitea Actions

### On Your Gitea Server

1. Log in as admin to `https://gitea.ebl.beauty`
2. Go to **Site Administration → Actions**
3. Enable Actions if not already enabled
4. Note: Gitea Actions uses the same YAML syntax as GitHub Actions

---

## 🔐 Step 2: Generate SSH Deployment Keys

Run this on your **local Mac**:

```bash
cd /Users/smayone/Sovereignitity-Stack
bash scripts/setup-deploy-keys.sh
```

This generates:
- `~/.ssh/solvy-deploy-keys/solvy-deploy` (private key — for Gitea)
- `~/.ssh/solvy-deploy-keys/solvy-deploy.pub` (public key — for VPS)

### Add Public Key to VPS

```bash
ssh-copy-id -i ~/.ssh/solvy-deploy-keys/solvy-deploy.pub root@46.62.235.95
```

Or manually:
```bash
# On VPS:
echo "YOUR_PUBLIC_KEY_CONTENT" >> ~/.ssh/authorized_keys
```

### Test the Key

```bash
ssh -i ~/.ssh/solvy-deploy-keys/solvy-deploy root@46.62.235.95 'echo Connected!'
```

---

## 🔑 Step 3: Add Secrets to Gitea

### Navigate to Secrets

```
https://gitea.ebl.beauty/smayone/solvy-platform/settings/secrets/actions
```

### Add These Secrets

| Secret Name | Value | Description |
| :--- | :--- | :--- |
| `SSH_PRIVATE_KEY` | Full content of `~/.ssh/solvy-deploy-keys/solvy-deploy` | Private key for VPS access |
| `VPS_HOST` | `46.62.235.95` | Your Hetzner VPS IP |
| `VPS_USER` | `root` | SSH username |

### How to Add Each Secret

1. Click **"Add Secret"**
2. Enter the name (e.g., `SSH_PRIVATE_KEY`)
3. Paste the value
4. Click **"Add Secret"**

> ⚠️ **IMPORTANT:** The private key value must include the `BEGIN OPENSSH PRIVATE KEY` and `END OPENSSH PRIVATE KEY` lines.

---

## 🚀 Step 4: Push the Workflow

The workflow file is already in your repository:

```bash
git add .gitea/workflows/deploy.yml
git commit -m "Add CI/CD deployment pipeline"
git push origin main
```

### Verify the Workflow is Active

Go to:
```
https://gitea.ebl.beauty/smayone/solvy-platform/actions
```

You should see the "Deploy to Production" workflow.

---

## ✅ Step 5: Test the Pipeline

Make a small change and push:

```bash
# Edit any file
echo "<!-- Deploy test: $(date) -->" >> solvy-platform/welcome.html

# Commit and push
git add .
git commit -m "Test CI/CD pipeline"
git push origin main
```

### Watch the Pipeline Run

1. Go to `https://gitea.ebl.beauty/smayone/solvy-platform/actions`
2. Click on the running workflow
3. Watch the logs in real-time:
   - Test job
   - Prepare job
   - Deploy job

### Verify Deployment

```bash
curl https://ebl.beauty/health
curl -H "Authorization: Bearer YOUR_ADMIN_KEY" https://ebl.beauty/api/metrics/summary
```

---

## 🎛️ Manual Deploy (Bypass CI)

If you need to deploy immediately:

### Option 1: Gitea Web UI
```
Repository → Actions → Deploy to Production → Run workflow
```

### Option 2: Local SSH
```bash
ssh root@46.62.235.95 "cd /root/solvy-deployment && ./scripts/deploy.sh"
```

---

## 🔄 Pipeline Behavior

| Trigger | What Happens |
| :--- | :--- |
| `git push origin main` | Full test → prepare → deploy |
| Markdown-only push | Skipped (paths-ignore) |
| `workflow_dispatch` | Manual deploy (can choose environment) |
| Test failure | Deploy job is skipped |

---

## 🛠️ Troubleshooting

### Pipeline fails at "Setup SSH"

```
Error: ssh-private-key is invalid
```

**Fix:** Regenerate the key and ensure the full private key (including headers) is in the secret.

### Pipeline fails at "Execute deploy script"

```
Error: deploy.sh not found or not executable
```

**Fix:** Ensure `deployment/scripts/prepare-local.sh` ran successfully and copied the scripts.

### Pipeline passes but site is not updated

**Check:**
```bash
ssh root@46.62.235.95
pm2 logs solvy-api
nginx -t
```

### Health check fails after deploy

```bash
# Check if backend is running
ssh root@46.62.235.95 "pm2 status"

# Check backend directly
curl http://localhost:3000/health

# Check nginx proxy
curl http://localhost/health
```

---

## 🔒 Security Best Practices

- [ ] The `SSH_PRIVATE_KEY` secret is **never** logged in pipeline output (masked by Gitea)
- [ ] The deployment key has **no passphrase** (required for automation)
- [ ] The deployment key is **only** used for CI/CD (not for daily SSH)
- [ ] To revoke: remove the public key from `~/.ssh/authorized_keys` on the VPS
- [ ] Rotate the key every 90 days for maximum security

---

## 📁 Files in This Pipeline

| File | Purpose |
| :--- | :--- |
| `.gitea/workflows/deploy.yml` | The CI/CD workflow definition |
| `scripts/setup-deploy-keys.sh` | Generates SSH keys for CI/CD |
| `deployment/scripts/prepare-local.sh` | Organizes files before deploy |
| `deployment/scripts/deploy.sh` | Runs on VPS to apply changes |

---

## 🎯 Next Steps

1. ✅ Generate SSH keys (`setup-deploy-keys.sh`)
2. ✅ Add public key to VPS
3. ✅ Add secrets to Gitea
4. ✅ Push workflow to repository
5. ✅ Test with a small change
6. 🔄 Future: Add staging environment (optional)

---

**SOLVY Ecosystem™ — Product of SA Nathan LLC**  
*Push to deploy. Data sovereign by design.*
