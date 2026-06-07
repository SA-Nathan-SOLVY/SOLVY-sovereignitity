#!/bin/bash
# ============================================================
# SOLVY Production Deployment Script
# Deploys the `production` branch to Hetzner VPS (46.62.235.95)
# Baseline: b54a7a42d + EBL pilot partner reorganization
# Launch Target: June 19, 2026 (Juneteenth)
# ============================================================

set -e

VPS_IP="46.62.235.95"
VPS_USER="root"
DEPLOY_PATH="/var/www/solvy.cards"
BRANCH="production"
REPO="https://github.com/SA-Nathan-SOLVY/SOLVY-sovereignitity.git"

echo "🚀 SOLVY Production Deployment"
echo "================================"
echo "Branch: $BRANCH"
echo "Target: $VPS_IP:$DEPLOY_PATH"
echo "Launch: June 19, 2026"
echo ""

# Step 1: Ensure we are on production branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
    echo "❌ ERROR: You must be on the '$BRANCH' branch to deploy."
    echo "   Current branch: $CURRENT_BRANCH"
    echo "   Run: git checkout $BRANCH"
    exit 1
fi

# Step 2: Verify clean working tree
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ ERROR: Working tree is not clean. Commit or stash changes first."
    git status --short
    exit 1
fi

# Step 3: Show what we're deploying
echo "📦 Deploying commit:"
git log -1 --oneline
echo ""

# Step 4: Push branch to remotes
echo "📤 Pushing $BRANCH to GitHub..."
git push github $BRANCH

echo "📤 Pushing $BRANCH to Hetzner Gitea..."
git push gitea-hetzner $BRANCH 2>/dev/null || echo "   (Gitea push skipped or failed)"

# Step 5: Deploy to Hetzner via SSH
echo ""
echo "🖥️  Deploying to Hetzner VPS..."
ssh $VPS_USER@$VPS_IP << 'REMOTE_COMMANDS'
    set -e
    echo "[VPS] Updating production code..."
    
    # Ensure deploy path exists
    mkdir -p /var/www/solvy.cards
    cd /var/www/solvy.cards
    
    # Clone or pull latest production branch
    if [ -d ".git" ]; then
        git fetch origin production
        git reset --hard origin/production
    else
        git clone -b production --single-branch https://github.com/SA-Nathan-SOLVY/SOLVY-sovereignitity.git .
    fi
    
    # Sync solvy-platform static files to nginx web root
    echo "[VPS] Syncing static files..."
    rsync -av --delete solvy-platform/ /var/www/html/ 2>/dev/null || cp -r solvy-platform/* /var/www/html/
    
    # Set proper permissions
    chown -R www-data:www-data /var/www/html
    chmod -R 755 /var/www/html
    
    # Restart nginx
    echo "[VPS] Restarting nginx..."
    systemctl restart nginx
    
    # Verify Node API is running (if applicable)
    if [ -f "solvy-unit-integration/server.js" ]; then
        echo "[VPS] Checking API service..."
        pm2 describe solvy-api >/dev/null 2>&1 && pm2 restart solvy-api || echo "[VPS] API service not managed by PM2 (manual start required)"
    fi
    
    echo "[VPS] ✅ Production deployment complete."
REMOTE_COMMANDS

echo ""
echo "================================"
echo "✅ DEPLOYMENT SUCCESSFUL"
echo "================================"
echo "Site: https://solvy.cards"
echo "Pilot: https://solvy.cards/pilots/evergreen/"
echo "Commit: $(git rev-parse --short HEAD)"
echo "Time: $(date)"
echo ""
echo "🎯 Next steps for Juneteenth Launch:"
echo "   1. Verify solvy.cards loads correctly"
echo "   2. Verify /pilots/evergreen/ loads"
echo "   3. Test SOLVY Card application flow"
echo "   4. Confirm Lithic sandbox demo is ready on dev branch"
echo "   5. Send Tavonia Evans outreach (on main branch)"
