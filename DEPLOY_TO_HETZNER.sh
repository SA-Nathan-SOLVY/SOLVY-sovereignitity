#!/bin/bash

# SOLVY Deployment Script for Hetzner VPS
# IP: 46.62.235.95
# Target: ebl.beauty

set -e

SERVER_IP="46.62.235.95"
DOMAIN="ebl.beauty"
API_DOMAIN="api.ebl.beauty"

echo "====================================="
echo "  SOLVY Deployment to Hetzner VPS"
echo "  Server: $SERVER_IP"
echo "  Domain: $DOMAIN"
echo "====================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_step() {
    echo -e "${GREEN}[STEP]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Step 1: Check SSH access
print_step "Checking SSH access to $SERVER_IP..."
ssh -o ConnectTimeout=5 root@$SERVER_IP "echo 'SSH OK'" || {
    echo "ERROR: Cannot SSH to server. Make sure you have SSH key access."
    exit 1
}

# Step 2: Create deployment directory
print_step "Creating deployment directory..."
ssh root@$SERVER_IP "mkdir -p /opt/solvy && mkdir -p /opt/solvy/solvy-platform"

# Step 3: Copy files
print_step "Copying SOLVY API files..."
rsync -avz --exclude 'node_modules' solvy-unit-integration/ root@$SERVER_IP:/opt/solvy/

print_step "Copying SOLVY frontend files..."
rsync -avz solvy-platform/ root@$SERVER_IP:/opt/solvy/solvy-platform/

# Step 4: Create environment file
print_step "Creating environment configuration..."
ssh root@$SERVER_IP "cat > /opt/solvy/.env << 'EOF'
UNIT_API_TOKEN=your_unit_api_token_here
UNIT_API_URL=https://api.s.unit.sh
UNIT_ORG_ID=your_unit_org_id_here
SOLVY_ENV=production
SOLVY_WEBHOOK_SECRET=$(openssl rand -hex 32)
SOLVY_PORT=3000
EOF"

print_warning "Edit /opt/solvy/.env on the server with your actual Unit credentials!"

# Step 5: Install Docker if needed
print_step "Checking Docker installation..."
ssh root@$SERVER_IP "which docker || (apt-get update && apt-get install -y docker.io docker-compose)"

# Step 6: Start services
print_step "Starting SOLVY services..."
ssh root@$SERVER_IP "cd /opt/solvy && docker-compose -f docker-compose.prod.yml up -d --build"

# Step 7: Check status
print_step "Checking service status..."
sleep 5
ssh root@$SERVER_IP "docker ps | grep solvy"

# Step 8: Test endpoints
print_step "Testing endpoints..."
curl -s http://$SERVER_IP:3000/health || echo "API not responding yet (may need more time)"
curl -s http://$SERVER_IP/ || echo "Nginx not responding yet"

echo ""
echo "====================================="
echo "  Deployment Complete!"
echo "====================================="
echo ""
echo "Next steps:"
echo "1. SSH to server: ssh root@$SERVER_IP"
echo "2. Edit config: nano /opt/solvy/.env"
echo "3. Add your Unit API token"
echo "4. Restart: cd /opt/solvy && docker-compose restart"
echo ""
echo "Once DNS is configured:"
echo "  Frontend: https://$DOMAIN"
echo "  API: https://$API_DOMAIN"
echo ""
