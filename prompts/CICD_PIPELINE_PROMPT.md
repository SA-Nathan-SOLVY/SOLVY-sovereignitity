## ✅ Kimi Prompt — CI/CD Pipeline (Gitea Actions / GitHub Actions)

Copy and paste this directly into Kimi Code (VS Codium) or the Kimi chat interface.

---

```text
Kimi, I need a CI/CD pipeline that automatically deploys my SOLVY full stack to my Hetzner VPS whenever I push code to my Git repository. My Git server is Gitea (self-hosted at gitea.ebl.beauty), which supports Gitea Actions (syntax-compatible with GitHub Actions).

Create the following:

## 1. GitHub/Gitea Actions Workflow

Create `.gitea/workflows/deploy.yml` (or `.github/workflows/deploy.yml`) that:

**Triggers:**
- Push to `main` or `master` branch
- Manual trigger (workflow_dispatch) for emergency deploys

**Jobs:**

### Job 1: Test
- Check out the repository
- Install Node.js dependencies in the backend
- Run a basic health check (e.g., verify `node --check` on all JS files)
- Verify the deployment scripts exist and are executable

### Job 2: Deploy
- Depends on: Test (must pass first)
- Check out the repository
- Run the local preparation script (`deployment/scripts/prepare-local.sh`) to organize files
- Copy the deployment package to the VPS via rsync over SSH
- SSH into the VPS and execute the deploy script

**Secrets required:**
- `SSH_PRIVATE_KEY` — private key for SSH access to the VPS
- `VPS_HOST` — IP address (e.g., `46.62.235.95`)
- `VPS_USER` — username (e.g., `root` or `solvy`)
- `ADMIN_API_KEY` — production admin API key (optional, can be in .env)

## 2. SSH Key Setup Script

Create `scripts/setup-deploy-keys.sh` that:
- Generates an SSH key pair specifically for CI/CD deployment
- Displays the public key (to be added to the VPS's `~/.ssh/authorized_keys`)
- Provides instructions for adding the private key as a Gitea/GitHub secret

## 3. Gitea/GitHub Secret Instructions

Provide clear instructions for setting up repository secrets:

**In Gitea:**
- Go to Repository Settings → Secrets/Variables → Actions
- Add `SSH_PRIVATE_KEY` — the full private key content
- Add `VPS_HOST` — `46.62.235.95`
- Add `VPS_USER` — `root`

**In GitHub:**
- Go to Repository Settings → Secrets and variables → Actions
- Add the same secrets

## 4. Workflow File Requirements

The workflow should:
- Use `appleboy/scp-action` or `appleboy/ssh-action` (or rsync via ssh-agent) to copy files
- Set a timeout of 10 minutes for the deploy job
- Log all steps verbosely
- Send a notification (console log is fine) on success or failure
- Skip the deploy if only markdown/documentation files changed (optional optimization)

## 5. Rollback Strategy

Include a simple rollback mechanism:
- Before deploying, tag the current deployment with a timestamp
- If the deploy fails health checks, automatically restore the previous working version
- Document how to manually trigger a rollback via workflow_dispatch

## 6. Environment Branches (Optional)

Support multiple environments:
- `main` branch → production deploy (ebl.beauty)
- `staging` branch → staging deploy (staging.ebl.beauty or different port)

## 7. Testing the Pipeline

Provide a test script or curl command to verify the deployment after the pipeline runs:
```bash
curl https://ebl.beauty/health
curl -H "Authorization: Bearer $ADMIN_API_KEY" https://ebl.beauty/api/metrics/summary
```

## Constraints

- Keep it simple — this is a small cooperative, not a Fortune 500 company
- Use GitHub Actions syntax (compatible with Gitea Actions)
- Do not store SSH keys in the repository
- Ensure the private key secret is masked in logs
- Include helpful comments in the YAML file

After generating the code, provide:
1. The complete workflow YAML file
2. The SSH key setup script
3. Step-by-step instructions for configuring Gitea/GitHub secrets
4. A note about using `workflow_dispatch` for manual deploys
```

---

## ✅ What Kimi Will Generate

| File | Purpose |
| :--- | :--- |
| `.gitea/workflows/deploy.yml` | CI/CD workflow (test + deploy) |
| `scripts/setup-deploy-keys.sh` | SSH key generation for CI/CD |
| `CI-CD-SETUP.md` | Instructions for secrets and testing |

---

## ✅ How It Works

```
You push to main branch
        │
        ▼
┌─────────────────────┐
│  Gitea Actions      │
│  1. Test job        │
│     - Checkout code │
│     - Verify syntax │
│     - Check scripts │
│  2. Deploy job      │
│     - Prepare files │
│     - rsync to VPS  │
│     - SSH + deploy  │
│     - Health check  │
└─────────────────────┘
        │
        ▼
   Hetzner VPS updated
```

---

## ✅ Testing the Pipeline

After setting up secrets and pushing the workflow:

```bash
# Make a small change and push
git add .
git commit -m "Update landing page copy"
git push origin main

# Watch the pipeline run in Gitea:
# Repository → Actions → Deploy to Production
```

---

## ✅ Manual Deploy (Bypass CI)

If you need to deploy immediately without waiting for CI:

```bash
# In Gitea: Repository → Actions → Deploy to Production → Run workflow
# Or locally:
ssh root@46.62.235.95 "cd /root/solvy-deployment && ./scripts/deploy.sh"
```

---

*Paste the prompt above into Kimi Code to generate the complete CI/CD pipeline.*
