#!/bin/bash

################################################################################
# SOLVY Platform - MVP Deployment Script
# 
# Deploys the SOLVY platform to Hetzner VPS with Stripe/Mercury infrastructure
# 
# Usage: ./deploy-mvp.sh [environment]
# Environments: staging, production
################################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
VPS_HOST="46.62.235.95"
VPS_USER="root"
SSH_KEY="$HOME/.ssh/id_rsa_decidey"
FRONTEND_DIR="../frontend"
BACKEND_DIR="../backend"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         SOLVY Platform - MVP Deployment                   ║${NC}"
echo -e "${BLUE}║         Environment: ${ENVIRONMENT}                        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

################################################################################
# Pre-flight checks
################################################################################

echo -e "${YELLOW}[1/8] Running pre-flight checks...${NC}"

# Check if SSH key exists
if [ ! -f "$SSH_KEY" ]; then
    echo -e "${RED}❌ SSH key not found: $SSH_KEY${NC}"
    exit 1
fi

# Check if frontend directory exists
if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}❌ Frontend directory not found: $FRONTEND_DIR${NC}"
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}❌ pnpm is not installed. Install with: npm install -g pnpm${NC}"
    exit 1
fi

# Test VPS connection
if ! ssh -i "$SSH_KEY" -o ConnectTimeout=5 "$VPS_USER@$VPS_HOST" "echo 'Connection successful'" &> /dev/null; then
    echo -e "${RED}❌ Cannot connect to VPS: $VPS_HOST${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Pre-flight checks passed${NC}"
echo ""

################################################################################
# Build frontend
################################################################################

echo -e "${YELLOW}[2/8] Building frontend (React app)...${NC}"

cd "$FRONTEND_DIR"

# Install dependencies
echo "Installing dependencies..."
pnpm install --frozen-lockfile

# Build for production
echo "Building for production..."
pnpm build

if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build failed - dist directory not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Frontend built successfully${NC}"
echo ""

################################################################################
# Deploy to nitty.ebl.beauty (SOLVY Card site)
################################################################################

echo -e "${YELLOW}[3/8] Deploying to nitty.ebl.beauty...${NC}"

scp -i "$SSH_KEY" -r dist/* "$VPS_USER@$VPS_HOST:/var/www/nitty.ebl.beauty/"

echo -e "${GREEN}✅ nitty.ebl.beauty deployed${NC}"
echo ""

################################################################################
# Deploy to decidey.ebl.beauty (DECIDEY NGO site)
################################################################################

echo -e "${YELLOW}[4/8] Deploying to decidey.ebl.beauty...${NC}"

scp -i "$SSH_KEY" -r dist/* "$VPS_USER@$VPS_HOST:/var/www/decidey.ebl.beauty/"

echo -e "${GREEN}✅ decidey.ebl.beauty deployed${NC}"
echo ""

################################################################################
# Verify SSL certificates
################################################################################

echo -e "${YELLOW}[5/8] Verifying SSL certificates...${NC}"

ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" << 'ENDSSH'
certbot certificates | grep -E "(decidey|nitty|ebl|remittance)\.ebl\.beauty"
ENDSSH

echo -e "${GREEN}✅ SSL certificates verified${NC}"
echo ""

################################################################################
# Test deployments
################################################################################

echo -e "${YELLOW}[6/8] Testing deployments...${NC}"

SITES=(
    "https://nitty.ebl.beauty"
    "https://decidey.ebl.beauty"
    "https://ebl.beauty"
    "https://remittance.ebl.beauty"
)

for site in "${SITES[@]}"; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$site")
    if [ "$HTTP_CODE" -eq 200 ]; then
        echo -e "${GREEN}✅ $site - OK ($HTTP_CODE)${NC}"
    else
        echo -e "${RED}❌ $site - FAILED ($HTTP_CODE)${NC}"
    fi
done

echo ""

################################################################################
# Restart Nginx (if needed)
################################################################################

echo -e "${YELLOW}[7/8] Restarting Nginx...${NC}"

ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" << 'ENDSSH'
nginx -t && systemctl reload nginx
ENDSSH

echo -e "${GREEN}✅ Nginx restarted${NC}"
echo ""

################################################################################
# Deployment summary
################################################################################

echo -e "${YELLOW}[8/8] Deployment summary${NC}"
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              🚀 Deployment Successful! 🚀                  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Live Sites:${NC}"
echo -e "  • SOLVY Card:    https://nitty.ebl.beauty"
echo -e "  • DECIDEY NGO:   https://decidey.ebl.beauty"
echo -e "  • EBL Pilot:     https://ebl.beauty"
echo -e "  • Remittance:    https://remittance.ebl.beauty"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo -e "  1. Test all pages and navigation"
echo -e "  2. Verify signup flow at https://nitty.ebl.beauty/signup.html"
echo -e "  3. Check MAN transparency page at https://decidey.ebl.beauty/man.html"
echo -e "  4. Monitor logs: ssh $VPS_USER@$VPS_HOST 'tail -f /var/log/nginx/access.log'"
echo ""
echo -e "${GREEN}Deployment completed at: $(date)${NC}"
echo ""

################################################################################
# Optional: Tag this deployment in Git
################################################################################

read -p "Tag this deployment in Git? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    TAG="deploy-mvp-$(date +%Y%m%d-%H%M%S)"
    git tag -a "$TAG" -m "MVP deployment to Hetzner VPS - $ENVIRONMENT"
    git push origin "$TAG"
    echo -e "${GREEN}✅ Tagged as: $TAG${NC}"
fi

echo ""
echo -e "${BLUE}Happy building! 🛡️ SOLVY${NC}"
