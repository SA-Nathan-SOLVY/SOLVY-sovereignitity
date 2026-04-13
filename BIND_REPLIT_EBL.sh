#!/bin/bash
# BIND Replit + ebl.beauty for Unified Web Presence
# Usage: ./BIND_REPLIT_EBL.sh [option]
# Options: replit-primary | hetzner-primary | git-sync

set -e

echo "🔄 SOLVY Web Unification Script"
echo "================================"
echo ""

# Configuration
REPLIT_URL="https://sovereignitity-solvy.replit.app"
EBL_DOMAIN="ebl.beauty"
HETZNER_IP="46.62.235.95"
SOURCE_DIR="replit-deploy"

# Check option
OPTION=${1:-"replit-primary"}

case $OPTION in
  "replit-primary")
    echo "✅ OPTION: Replit as Primary"
    echo "   - Replit: $REPLIT_URL"
    echo "   - ebl.beauty: Redirects to Replit"
    echo ""
    
    echo "📋 Setup Instructions:"
    echo "1. In Cloudflare DNS:"
    echo "   - Add CNAME: @ → sovereignitity-solvy.replit.app"
    echo "   - Add Page Rule: ebl.beauty/* → $REPLIT_URL/\$1"
    echo ""
    echo "2. In Replit:"
    echo "   - Ensure all files from $SOURCE_DIR/ are uploaded"
    echo "   - Test: $REPLIT_URL/heritage.html"
    echo ""
    echo "3. Test the binding:"
    echo "   - curl -I https://ebl.beauty"
    echo "   - Should redirect to: $REPLIT_URL"
    echo ""
    ;;
    
  "hetzner-primary")
    echo "✅ OPTION: Hetzner (ebl.beauty) as Primary"
    echo "   - ebl.beauty: Serves from Hetzner VPS"
    echo "   - Replit: Can mirror or be separate"
    echo ""
    
    read -p "Deploy replit-deploy/ to Hetzner? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      echo "🚀 Deploying to Hetzner..."
      
      # Sync files
      rsync -avz --delete \
        --exclude='.git' \
        --exclude='.env' \
        --exclude='node_modules' \
        ./$SOURCE_DIR/ \
        root@$HETZNER_IP:/var/www/ebl.beauty/
      
      # Set permissions
      ssh root@$HETZNER_IP "chown -R www-data:www-data /var/www/ebl.beauty && chmod -R 755 /var/www/ebl.beauty"
      
      echo "✅ Deployed to https://$EBL_DOMAIN"
      echo ""
      echo "Test: curl -I https://$EBL_DOMAIN/heritage.html"
    fi
    ;;
    
  "git-sync")
    echo "✅ OPTION: Git-Sync (Gitea as Source of Truth)"
    echo "   - Git: https://gitea.ebl.beauty"
    echo "   - Push to git → Deploys everywhere"
    echo ""
    
    echo "📋 Setup Instructions:"
    echo "1. Commit all replit-deploy/ content to Gitea:"
    echo "   git add replit-deploy/"
    echo "   git commit -m 'feat: unified web content'"
    echo "   git push gitea main"
    echo ""
    echo "2. Configure Replit Auto-Deploy:"
    echo "   - Replit → Deploy → Connect to Git"
    echo "   - Select: https://gitea.ebl.beauty/smayone/solvy-platform"
    echo ""
    echo "3. Configure Hetzner Webhook:"
    echo "   - Gitea → Repository Settings → Webhooks"
    echo "   - Add webhook to trigger Hetzner pull"
    echo ""
    ;;
    
  *)
    echo "❌ Unknown option: $OPTION"
    echo "Usage: ./BIND_REPLIT_EBL.sh [replit-primary|hetzner-primary|git-sync]"
    exit 1
    ;;
esac

echo ""
echo "📊 Current Content Status:"
echo "==========================="
echo "Files in $SOURCE_DIR/:"
ls -1 ./$SOURCE_DIR/*.html 2>/dev/null | xargs -n1 basename
echo ""
echo "Subdirectories:"
ls -1d ./$SOURCE_DIR/*/ 2>/dev/null | xargs -n1 basename

echo ""
echo "✨ Next Steps:"
echo "1. Choose your preferred option above"
echo "2. Configure DNS in Cloudflare"
echo "3. Test all URLs"
echo "4. Update SITES_INVENTORY.md"
