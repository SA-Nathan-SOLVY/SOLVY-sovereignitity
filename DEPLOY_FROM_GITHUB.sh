#!/bin/bash

# SOLVY Deployment from GitHub to Hetzner VPS
# Uses GitHub PAT to clone/pull latest code
# Target: 46.62.235.95 (ebl.beauty)

set -e

SERVER_IP="46.62.235.95"
DOMAIN="ebl.beauty"
API_DOMAIN="api.ebl.beauty"
GITHUB_REPO="https://github.com/SA-Nathan-SOLVY/SOLVY-sovereignitity.git"
DEPLOY_DIR="/opt/solvy"
FRONTEND_DIR="/var/www/ebl.beauty"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_step() { echo -e "${GREEN}[DEPLOY]${NC} $1"; }
print_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Load GitHub token from local .env
if [ -f "solvy-unit-integration/.env" ]; then
    GITHUB_TOKEN=$(grep "GITHUB_TOKEN" solvy-unit-integration/.env | cut -d'=' -f2 | tr -d '\r')
fi

if [ -z "$GITHUB_TOKEN" ]; then
    print_error "GITHUB_TOKEN not found in solvy-unit-integration/.env"
    echo "Please set GITHUB_TOKEN=ghp_... in your .env file"
    exit 1
fi

echo "====================================="
echo "  SOLVY Deploy from GitHub"
echo "  Server: $SERVER_IP"
echo "  Domain: $DOMAIN"
echo "  Repo: $GITHUB_REPO"
echo "====================================="
echo ""

# Step 1: Check SSH access
print_step "Checking SSH access to $SERVER_IP..."
ssh -o ConnectTimeout=5 root@$SERVER_IP "echo 'SSH OK'" || {
    print_error "Cannot SSH to server. Make sure you have SSH key access."
    exit 1
}

# Step 2: Deploy via GitHub on the server
print_step "Pulling latest code from GitHub on VPS..."
ssh root@$SERVER_IP "
    set -e
    export GITHUB_TOKEN='$GITHUB_TOKEN'
    
    # Create deploy directory
    mkdir -p $DEPLOY_DIR
    cd $DEPLOY_DIR
    
    # Clone or pull
    if [ -d '.git' ]; then
        echo 'Pulling latest changes...'
        git remote set-url origin https://\$GITHUB_TOKEN@github.com/SA-Nathan-SOLVY/SOLVY-sovereignitity.git
        git fetch origin
        git reset --hard origin/main
    else
        echo 'Cloning repository...'
        git clone https://\$GITHUB_TOKEN@github.com/SA-Nathan-SOLVY/SOLVY-sovereignitity.git .
    fi
    
    echo '✅ Code updated to:' \$(git log -1 --format='%h %s')
"

# Step 3: Install backend dependencies
print_step "Installing backend dependencies..."
ssh root@$SERVER_IP "
    cd $DEPLOY_DIR/solvy-unit-integration && npm install --production
"

# Step 4: Copy .env to server
print_step "Copying environment configuration..."
rsync -avz solvy-unit-integration/.env root@$SERVER_IP:$DEPLOY_DIR/solvy-unit-integration/.env

# Step 5: Deploy frontend to nginx web root
print_step "Deploying frontend to nginx..."
ssh root@$SERVER_IP "
    mkdir -p $FRONTEND_DIR
    cp -r $DEPLOY_DIR/solvy-platform/* $FRONTEND_DIR/
    chown -R www-data:www-data $FRONTEND_DIR
"

# Step 6: Restart services
print_step "Restarting SOLVY API service..."
ssh root@$SERVER_IP "
    # Check if PM2 is managing the service
    if command -v pm2 &> /dev/null; then
        cd $DEPLOY_DIR/solvy-unit-integration
        pm2 restart solvy-api 2>/dev/null || pm2 start server.js --name solvy-api
        pm2 save
    else
        # Fallback: run with nohup
        cd $DEPLOY_DIR/solvy-unit-integration
        pkill -f 'node server.js' 2>/dev/null || true
        nohup node server.js > /var/log/solvy-api.log 2>&1 &
    fi
"

# Step 7: Reload nginx
print_step "Reloading nginx..."
ssh root@$SERVER_IP "nginx -t && systemctl reload nginx"

# Step 8: Health check
print_step "Running health checks..."
sleep 3

echo ""
echo "API Health:"
curl -s http://$SERVER_IP:3000/health || print_warn "API not responding on port 3000"

echo ""
echo "Frontend:"
curl -s -o /dev/null -w "%{http_code}" http://$SERVER_IP/ || print_warn "Frontend not responding"

echo ""
echo "====================================="
echo -e "${GREEN}  Deployment Complete!${NC}"
echo "====================================="
echo ""
echo "URLs:"
echo "  Frontend: https://$DOMAIN"
echo "  API:      https://$API_DOMAIN"
echo "  Health:   http://$SERVER_IP:3000/health"
echo ""
echo "To check logs:"
echo "  ssh root@$SERVER_IP 'pm2 logs solvy-api'"
echo "  ssh root@$SERVER_IP 'tail -f /var/log/solvy-api.log'"
echo ""
