#!/bin/bash
# Sync replit-app-live static files to Hetzner VPS
# Run from project root

set -e

VPS="root@46.62.235.95"
SOURCE="replit-app-live/"
DEST="/var/www/solvy.cards"
DEST_EBL="/var/www/ebl.beauty"

echo "▶ Syncing $SOURCE → $VPS:$DEST"

# Sync to solvy.cards
rsync -avz --delete \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='cloudflare-deploy' \
  "$SOURCE" "$VPS:$DEST/"

# Also sync to ebl.beauty
echo "▶ Syncing $SOURCE → $VPS:$DEST_EBL"
rsync -avz --delete \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='cloudflare-deploy' \
  "$SOURCE" "$VPS:$DEST_EBL/"

# Set correct ownership
ssh "$VPS" "chown -R www-data:www-data $DEST $DEST_EBL"

# Reload nginx
ssh "$VPS" "nginx -t && systemctl reload nginx"

echo "✅ Sync complete. https://solvy.cards is updated."
