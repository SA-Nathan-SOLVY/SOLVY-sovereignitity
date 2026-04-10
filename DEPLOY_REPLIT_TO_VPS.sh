#!/bin/bash

# SOLVY Website Deployment Script
# Deploys the complete static website (replit-original iteration) to VPS with Cloudflare Tunnel
# Target: Hetzner VPS (46.62.235.95) or any VPS

set -e

# Configuration
SERVER_IP="${SERVER_IP:-46.62.235.95}"
SERVER_USER="${SERVER_USER:-root}"
DEPLOY_DIR="/opt/solvy-web"
LOCAL_DIR="replit-deploy"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_step() { echo -e "${GREEN}[STEP]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo "====================================="
echo "  SOLVY Website Deployment"
echo "  Version: Complete Static (Original)"
echo "  Source: $LOCAL_DIR/"
echo "  Target: $SERVER_USER@$SERVER_IP"
echo "  Dir: $DEPLOY_DIR"
echo "====================================="
echo ""

# Step 1: Check SSH access
print_step "Checking SSH access to $SERVER_IP..."
ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "echo 'SSH OK'" || {
    print_error "Cannot SSH to server. Make sure you have SSH key access."
    echo "Run: ssh-copy-id $SERVER_USER@$SERVER_IP"
    exit 1
}

# Step 2: Create deployment directory
print_step "Creating deployment directory on server..."
ssh $SERVER_USER@$SERVER_IP "mkdir -p $DEPLOY_DIR && rm -rf $DEPLOY_DIR/*"

# Step 3: Copy files to server
print_step "Copying website files to server..."
rsync -avz --exclude '.DS_Store' --exclude '.git' $LOCAL_DIR/ $SERVER_USER@$SERVER_IP:$DEPLOY_DIR/

# Step 4: Install Docker if needed
print_step "Checking Docker installation..."
ssh $SERVER_USER@$SERVER_IP "which docker || (apt-get update && apt-get install -y docker.io docker-compose)"

# Step 5: Check for tunnel token
if [ -f .env ] && grep -q "TUNNEL_TOKEN" .env && ! grep -q "your_cloudflare_tunnel_token" .env; then
    print_step "Copying Cloudflare Tunnel token..."
    scp .env $SERVER_USER@$SERVER_IP:$DEPLOY_DIR/
else
    print_warning "No Cloudflare Tunnel token found in .env"
    print_step "Creating .env template on server..."
    ssh $SERVER_USER@$SERVER_IP "cat > $DEPLOY_DIR/.env << 'EOF'
# Cloudflare Tunnel Token
# Get this from: https://one.dash.cloudflare.com > Networks > Tunnels
TUNNEL_TOKEN=your_cloudflare_tunnel_token_here
EOF"
fi

# Step 6: Build and start services
print_step "Building and starting Docker containers..."
ssh $SERVER_USER@$SERVER_IP "cd $DEPLOY_DIR && docker-compose down 2>/dev/null || true"
ssh $SERVER_USER@$SERVER_IP "cd $DEPLOY_DIR && docker-compose build --no-cache"
ssh $SERVER_USER@$SERVER_IP "cd $DEPLOY_DIR && docker-compose up -d web"

# Step 7: Start tunnel if token is configured
if ssh $SERVER_USER@$SERVER_IP "grep -q 'TUNNEL_TOKEN' $DEPLOY_DIR/.env 2>/dev/null && ! grep -q 'your_cloudflare_tunnel_token' $DEPLOY_DIR/.env 2>/dev/null"; then
    print_step "Starting Cloudflare Tunnel..."
    ssh $SERVER_USER@$SERVER_IP "cd $DEPLOY_DIR && docker-compose --profile tunnel up -d tunnel"
else
    print_warning "Cloudflare Tunnel not started - token not configured"
fi

# Step 8: Verify deployment
print_step "Verifying deployment..."
sleep 3
ssh $SERVER_USER@$SERVER_IP "docker ps | grep solvy"

# Step 9: Test local endpoint
print_step "Testing local endpoint..."
if ssh $SERVER_USER@$SERVER_IP "curl -s http://localhost:8080 | grep -q 'SOLVY'"; then
    echo -e "${GREEN}✓ Website is running successfully!${NC}"
else
    print_warning "Could not verify website. Check logs: ssh $SERVER_USER@$SERVER_IP 'cd $DEPLOY_DIR && docker-compose logs web'"
fi

echo ""
echo "====================================="
echo -e "  ${GREEN}Deployment Complete!${NC}"
echo "====================================="
echo ""
echo "Server: $SERVER_IP"
echo "Deploy directory: $DEPLOY_DIR"
echo ""

if ssh $SERVER_USER@$SERVER_IP "grep -q 'your_cloudflare_tunnel_token' $DEPLOY_DIR/.env 2>/dev/null || ! grep -q 'TUNNEL_TOKEN' $DEPLOY_DIR/.env 2>/dev/null"; then
    echo "⚠️  Cloudflare Tunnel not configured!"
    echo ""
    echo "To enable public access:"
    echo "  1. SSH to server: ssh $SERVER_USER@$SERVER_IP"
    echo "  2. Edit: nano $DEPLOY_DIR/.env"
    echo "  3. Add your TUNNEL_TOKEN from Cloudflare"
    echo "  4. Run: cd $DEPLOY_DIR && docker-compose --profile tunnel up -d tunnel"
    echo ""
    echo "Or set up tunnel on Cloudflare:"
    echo "  1. Go to https://one.dash.cloudflare.com"
    echo "  2. Networks > Tunnels > Create Tunnel"
    echo "  3. Select Cloudflared, name it 'solvy-web'"
    echo "  4. Public Hostname: solvy.yourdomain.com"
    echo "  5. Type: HTTP, URL: localhost:8080"
    echo "  6. Copy token and add to $DEPLOY_DIR/.env"
else
    echo "✓ Cloudflare Tunnel is configured"
    echo "  Website should be accessible via your Cloudflare domain"
fi

echo ""
echo "Management commands:"
echo "  SSH:        ssh $SERVER_USER@$SERVER_IP"
echo "  Logs:       ssh $SERVER_USER@$SERVER_IP 'cd $DEPLOY_DIR && docker-compose logs -f web'"
echo "  Restart:    ssh $SERVER_USER@$SERVER_IP 'cd $DEPLOY_DIR && docker-compose restart'"
echo "  Stop:       ssh $SERVER_USER@$SERVER_IP 'cd $DEPLOY_DIR && docker-compose stop'"
echo ""
