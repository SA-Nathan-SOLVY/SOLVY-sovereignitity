#!/bin/bash
# SOLVY Platform Deployment Script
# Run this on your Hetzner VPS (46.62.235.95) as root

set -e  # Exit on error

echo "🚀 Starting SOLVY Platform Deployment..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/SA-Nathan-SOLVY/SOLVY-sovereignitity.git"
WEB_DIR="/var/www/solvy-platform"
NGINX_AVAILABLE="/etc/nginx/sites-available/solvy-complete"
NGINX_ENABLED="/etc/nginx/sites-enabled/solvy-complete"

echo -e "${BLUE}Step 1: Checking if web directory exists...${NC}"
if [ -d "$WEB_DIR/.git" ]; then
    echo -e "${GREEN}✓ Git repository exists, pulling latest changes...${NC}"
    cd "$WEB_DIR"
    git pull origin main
else
    echo -e "${BLUE}Creating new deployment from GitHub...${NC}"
    
    # Backup existing files if any
    if [ -d "$WEB_DIR" ]; then
        echo -e "${BLUE}Backing up existing files...${NC}"
        mv "$WEB_DIR" "${WEB_DIR}.backup.$(date +%Y%m%d_%H%M%S)"
    fi
    
    # Clone repository
    echo -e "${BLUE}Cloning repository...${NC}"
    git clone "$REPO_URL" "$WEB_DIR"
fi

echo -e "${BLUE}Step 2: Setting file permissions...${NC}"
chown -R www-data:www-data "$WEB_DIR"
chmod -R 755 "$WEB_DIR"
echo -e "${GREEN}✓ Permissions set${NC}"

echo -e "${BLUE}Step 3: Checking Nginx configuration...${NC}"
if [ -f "$NGINX_AVAILABLE" ]; then
    echo -e "${GREEN}✓ Nginx config exists${NC}"
    
    # Create symlink if it doesn't exist
    if [ ! -L "$NGINX_ENABLED" ]; then
        echo -e "${BLUE}Creating symlink...${NC}"
        ln -s "$NGINX_AVAILABLE" "$NGINX_ENABLED"
    fi
else
    echo -e "${RED}⚠ Warning: Nginx config not found at $NGINX_AVAILABLE${NC}"
    echo -e "${RED}Please upload nginx-solvy-complete.conf first${NC}"
fi

echo -e "${BLUE}Step 4: Testing Nginx configuration...${NC}"
if nginx -t; then
    echo -e "${GREEN}✓ Nginx configuration is valid${NC}"
    
    echo -e "${BLUE}Step 5: Reloading Nginx...${NC}"
    systemctl reload nginx
    echo -e "${GREEN}✓ Nginx reloaded${NC}"
else
    echo -e "${RED}✗ Nginx configuration has errors${NC}"
    echo -e "${RED}Please fix the configuration before proceeding${NC}"
    exit 1
fi

echo -e "${BLUE}Step 6: Checking Nginx status...${NC}"
systemctl status nginx --no-pager | head -n 5

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Your SOLVY Platform should now be live at:${NC}"
echo -e "${GREEN}http://46.62.235.95${NC}"
echo ""
echo -e "${BLUE}Subdomains (after DNS setup):${NC}"
echo "  • https://nitty.ebl.beauty (main site)"
echo "  • https://decidey.ebl.beauty (DECIDEY NGO)"
echo "  • https://admin.ebl.beauty (admin dashboard)"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Test the site at http://46.62.235.95"
echo "  2. Add DNS A records for subdomains"
echo "  3. Install SSL certificates with Certbot"
echo ""
