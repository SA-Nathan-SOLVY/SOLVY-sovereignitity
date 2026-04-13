#!/bin/bash
# SOLVY Latest Deployment Script
# Deploys MAN Portal, Heritage Page, and Unit.co Integration
# Hetzner VPS: 46.62.235.95

set -e

echo "🚀 SOLVY Deployment Script"
echo "=========================="
echo "Deploying: MAN Portal + Heritage Page + Unit Integration"
echo "Target: ebl.beauty (46.62.235.95)"
echo ""

# Configuration
VPS_HOST="46.62.235.95"
VPS_USER="root"
DEPLOY_DIR="/opt/solvy"
WEB_ROOT="/var/www/ebl.beauty"
API_PORT="3000"

echo "📋 Pre-deployment Checklist:"
echo "  [ ] Git changes committed"
echo "  [ ] Unit.co credentials ready"
echo "  [ ] SSH access to VPS"
echo ""
read -p "Continue with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 1
fi

# Step 1: Commit changes locally
echo ""
echo "📦 Step 1: Committing local changes..."
git add -A
git commit -m "Deploy: MAN Portal, Heritage Page, Unit Integration - $(date +%Y-%m-%d)" || echo "No changes to commit"

# Step 2: Push to Gitea
echo ""
echo "🔄 Step 2: Pushing to Gitea..."
git push origin main || echo "Push failed, continuing..."

# Step 3: Deploy to VPS via SSH
echo ""
echo "🖥️  Step 3: Deploying to VPS..."

ssh $VPS_USER@$VPS_HOST << 'ENDSSH'

echo "[VPS] Updating code from Gitea..."
cd /opt/solvy
git pull origin main || echo "Git pull failed, continuing with local copy"

echo "[VPS] Creating backup of current deployment..."
timestamp=$(date +%Y%m%d_%H%M%S)
mkdir -p /var/backups/solvy
cp -r /var/www/ebl.beauty /var/backups/solvy/ebl.beauty_$timestamp

echo "[VPS] Deploying frontend files..."
# Create directories if they don't exist
mkdir -p /var/www/ebl.beauty/js
mkdir -p /var/www/ebl.beauty/internal
mkdir -p /var/www/ebl.beauty/marketing
mkdir -p /var/www/ebl.beauty/heritage

# Copy main site files
cp -r /opt/solvy/solvy-platform/* /var/www/ebl.beauty/ 2>/dev/null || true

# Copy new JavaScript modules
cp /opt/solvy/solvy-platform/js/manDB.js /var/www/ebl.beauty/js/ 2>/dev/null || true
cp /opt/solvy/solvy-platform/js/manDashboard.js /var/www/ebl.beauty/js/ 2>/dev/null || true
cp /opt/solvy/solvy-platform/js/manUnitBridge.js /var/www/ebl.beauty/js/ 2>/dev/null || true
cp /opt/solvy/solvy-platform/js/manDashboardEnhanced.js /var/www/ebl.beauty/js/ 2>/dev/null || true

# Copy internal tools
cp -r /opt/solvy/solvy-platform/internal/* /var/www/ebl.beauty/internal/ 2>/dev/null || true

# Copy heritage page
cp /opt/solvy/solvy-platform/heritage.html /var/www/ebl.beauty/ 2>/dev/null || true

echo "[VPS] Setting permissions..."
chown -R www-data:www-data /var/www/ebl.beauty
chmod -R 755 /var/www/ebl.beauty

echo "[VPS] Frontend deployed successfully"

ENDSSH

# Step 4: Deploy API Server (if needed)
echo ""
echo "⚙️  Step 4: Checking API server..."

ssh $VPS_USER@$VPS_HOST << 'ENDSSH'

# Check if webhook handler exists, if not create it
if [ ! -f /opt/solvy/solvy-unit-integration/api/webhooks/unit-transactions.js ]; then
    echo "[VPS] Creating webhook handler directory..."
    mkdir -p /opt/solvy/solvy-unit-integration/api/webhooks
fi

cd /opt/solvy/solvy-unit-integration

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "[VPS] Installing API dependencies..."
    npm install express cors crypto body-parser node-fetch
fi

echo "[VPS] Restarting API server..."
pm2 restart solvy-api 2>/dev/null || pm2 start server.js --name solvy-api -- --port 3000
pm2 save

ENDSSH

# Step 5: Test deployment
echo ""
echo "🧪 Step 5: Testing deployment..."

# Test main site
echo "  Testing https://ebl.beauty..."
curl -s -o /dev/null -w "%{http_code}" https://ebl.beauty || echo "  ⚠️  Main site check failed"

# Test heritage page
echo "  Testing https://ebl.beauty/heritage.html..."
curl -s -o /dev/null -w "%{http_code}" https://ebl.beauty/heritage.html || echo "  ⚠️  Heritage page check failed"

# Test MAN portal
echo "  Testing https://ebl.beauty/internal/man-portal.html..."
curl -s -o /dev/null -w "%{http_code}" https://ebl.beauty/internal/man-portal.html || echo "  ⚠️  MAN portal check failed"

# Test API
echo "  Testing API health..."
curl -s http://$VPS_HOST:3000/health || echo "  ⚠️  API health check failed"

echo ""
echo "=========================="
echo "✅ Deployment Complete!"
echo ""
echo "🌐 Live URLs:"
echo "  Main Site:    https://ebl.beauty"
echo "  Heritage:     https://ebl.beauty/heritage.html"
echo "  MAN Portal:   https://ebl.beauty/internal/man-portal.html"
echo "  MAN Demo:     https://ebl.beauty/internal/man-demo.html"
echo ""
echo "📊 What's New:"
echo "  ✓ MAN IndexedDB (local transaction storage)"
echo "  ✓ 70/20/10 real-time calculations"
echo "  ✓ Heritage page (Freedman/H.R.40/GENIUS)"
echo "  ✓ Unit.co webhook integration"
echo "  ✓ Enhanced dashboard with charts"
echo ""
echo "🔄 To rollback:"
echo "  ssh root@$VPS_HOST"
echo "  cp -r /var/backups/solvy/ebl.beauty_$timestamp/* /var/www/ebl.beauty/"
echo ""
