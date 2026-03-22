# SOLVY Platform - Gitea Deployment Guide

## Overview

This guide covers deploying the SOLVY platform using **Gitea** (self-hosted Git) instead of GitHub.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         INTERNET                                 │
│  ┌──────────────┐    ┌──────────────────┐    ┌──────────────┐   │
│  │   Users      │───▶│  Cloudflare      │───▶│   Gitea      │   │
│  │              │    │  Tunnel          │    │   Server     │   │
│  └──────────────┘    └──────────────────┘    └──────┬───────┘   │
└──────────────────────────────────────────────────────┼──────────┘
                                                       │
                              ┌────────────────────────┼──────────┐
                              │     DOCKER HOST        │          │
                              │  ┌─────────────────────▼───────┐  │
                              │  │      Gitea Container        │  │
                              │  │      - Git repos            │  │
                              │  │      - CI/CD (Drone/Act)    │  │
                              │  └─────────────────────────────┘  │
                              │  ┌─────────────────────────────┐  │
                              │  │    PostgreSQL Container     │  │
                              │  └─────────────────────────────┘  │
                              │  ┌─────────────────────────────┐  │
                              │  │   Cloudflared Container     │  │
                              │  └─────────────────────────────┘  │
                              └───────────────────────────────────┘
```

## Prerequisites

1. **Gitea Server** - Already set up in `../gitea-tunnel-setup/`
2. **Docker & Docker Compose**
3. **Cloudflare Tunnel** - For external access

## Step 1: Start Gitea Server

```bash
cd ../gitea-tunnel-setup
./manage.sh start
```

Access Gitea at:
- Local: http://localhost:3000
- External: https://gitea.ebl.beauty (via Cloudflare tunnel)

## Step 2: Create Repository in Gitea

1. Log in to your Gitea instance
2. Click "+" → "New Repository"
3. Repository Name: `solvy-platform`
4. Description: "SOLVY Cooperative Financial Platform"
5. Visibility: Private (or Public)
6. Check "Initialize Repository"
7. Click "Create Repository"

## Step 3: Push SOLVY Code to Gitea

```bash
cd solvy-platform

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial SOLVY platform commit"

# Add Gitea remote (replace with your Gitea URL)
git remote add gitea https://gitea.ebl.beauty/smayone/solvy-platform.git

# Push to Gitea
git push -u gitea main
```

## Step 4: Enable Gitea Actions (CI/CD)

Gitea has built-in Actions (similar to GitHub Actions):

1. Go to Repository Settings → Actions
2. Enable Actions
3. Add `.gitea/workflows/deploy.yml`:

```yaml
name: Deploy SOLVY Platform

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to server
        run: |
          # Your deployment commands here
          echo "Deploying SOLVY platform..."
```

## Step 5: Deploy Static Site

### Option A: Gitea Pages (if available)
Some Gitea instances support static hosting similar to GitHub Pages.

### Option B: Self-Hosted Nginx

```bash
# On your server
cd /var/www

# Clone from Gitea
git clone https://gitea.ebl.beauty/smayone/solvy-platform.git

# Set up nginx
sudo cp solvy-platform/nginx.conf /etc/nginx/sites-available/solvy
sudo ln -s /etc/nginx/sites-available/solvy /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### Option C: Docker Deployment

```bash
cd solvy-platform

# Build and run
docker-compose up -d

# Access at http://localhost:8080
```

## Step 6: Set Up Auto-Deploy Webhook (Optional)

Create a webhook in Gitea to auto-deploy on push:

1. Repository Settings → Webhooks
2. Add Webhook → Gitea
3. Target URL: `https://your-deploy-server/webhook`
4. Secret: Your webhook secret
5. Events: Push

## Management Commands

```bash
# View repository on Gitea
open https://gitea.ebl.beauty/smayone/solvy-platform

# Pull latest changes
git pull gitea main

# Push updates
git push gitea main

# Check Gitea status
cd ../gitea-tunnel-setup
./manage.sh status
```

## Migrating from GitHub

If you have existing code on GitHub:

```bash
# Add Gitea as additional remote
git remote add gitea https://gitea.ebl.beauty/smayone/solvy-platform.git

# Push all branches and tags
git push gitea --all
git push gitea --tags

# Set Gitea as default
git remote set-url origin https://gitea.ebl.beauty/smayone/solvy-platform.git
```

## Backup Strategy

```bash
# Backup Gitea (includes all repos)
cd ../gitea-tunnel-setup
./manage.sh backup

# This creates:
# - Database dump
# - Git repositories
# - Configuration files
```

## Troubleshooting

### Cannot push to Gitea
```bash
# Check Gitea is running
curl http://localhost:3000/api/healthz

# Check credentials
git remote -v

# Try with token
# Generate token in Gitea: Settings → Applications → Generate Token
```

### Repository not found
```bash
# Ensure repository exists on Gitea
# Check URL is correct
git remote set-url gitea https://gitea.ebl.beauty/USER/REPO.git
```

## Security Notes

- Use HTTPS for all Git operations
- Enable 2FA on Gitea accounts
- Use deploy tokens instead of passwords
- Restrict repository access appropriately
- Regular backups via `./manage.sh backup`

## Support

For Gitea issues: Check `../gitea-tunnel-setup/README.md`
For deployment issues: Contact DevOps team
