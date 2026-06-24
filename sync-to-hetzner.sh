#!/bin/bash
# Sync SOLVY React PWA + backend to Hetzner VPS
# Run from project root
#
# Current stack:
#   - Frontend: solvy-cards/ (Vite + React + Capacitor)
#   - Backend:  solvy-unit-integration/ (Node.js + Express)
#   - Shared:   solvy-platform/ (adapters, routers used by backend)
#   - VPS:      46.62.235.95 (Ubuntu + Nginx + PM2)
#   - Web root: /var/www/ebl.beauty and /var/www/solvy.cards
#   - Backend:  /opt/solvy/solvy-unit-integration (PM2 solvy-api)

set -e

VPS="root@46.62.235.95"
FRONTEND_SOURCE="solvy-cards/dist"
DEST_EBL="/var/www/ebl.beauty"
DEST_SOLVY="/var/www/solvy.cards"
BACKEND_SOURCE="solvy-unit-integration"
BACKEND_DEST="/opt/solvy/solvy-unit-integration"
PLATFORM_SOURCE="solvy-platform"
PLATFORM_DEST="/opt/solvy/solvy-platform"

echo "▶ Building solvy-cards for production..."
cd solvy-cards
npm run build
cd ..

if [ ! -d "$FRONTEND_SOURCE" ]; then
  echo "❌ Build failed: $FRONTEND_SOURCE not found"
  exit 1
fi

echo "▶ Syncing $FRONTEND_SOURCE → $VPS:$DEST_EBL"
rsync -avz --delete \
  --exclude='.git' \
  --exclude='node_modules' \
  "$FRONTEND_SOURCE/" "$VPS:$DEST_EBL/"

echo "▶ Syncing $FRONTEND_SOURCE → $VPS:$DEST_SOLVY"
rsync -avz --delete \
  --exclude='.git' \
  --exclude='node_modules' \
  "$FRONTEND_SOURCE/" "$VPS:$DEST_SOLVY/"

echo "▶ Syncing backend $BACKEND_SOURCE → $VPS:$BACKEND_DEST"
rsync -avz --delete \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.env' \
  "$BACKEND_SOURCE/" "$VPS:$BACKEND_DEST/"

echo "▶ Syncing platform $PLATFORM_SOURCE → $VPS:$PLATFORM_DEST"
rsync -avz --delete \
  --exclude='.git' \
  --exclude='node_modules' \
  "$PLATFORM_SOURCE/" "$VPS:$PLATFORM_DEST/"

# Install backend dependencies and restart PM2 process
ssh "$VPS" << REMOTE
  set -e
  cd "$BACKEND_DEST"
  npm install

  if pm2 list | grep -q "solvy-api"; then
    echo "▶ Stopping existing solvy-api..."
    pm2 delete solvy-api 2>/dev/null || true
  fi
  echo "▶ Starting solvy-api via PM2..."
  pm2 start "$BACKEND_DEST/server.js" --name solvy-api
  pm2 save

  echo "▶ Setting web root permissions..."
  chown -R www-data:www-data "$DEST_EBL"
  chmod -R 755 "$DEST_EBL"
  chown -R www-data:www-data "$DEST_SOLVY"
  chmod -R 755 "$DEST_SOLVY"

  echo "▶ Reloading nginx..."
  nginx -t && systemctl reload nginx
REMOTE

echo "✅ Sync complete."
echo "   Frontend: https://solvy.cards | https://ebl.beauty"
echo "   Backend health: https://solvy.cards/health"
echo ""
echo "⚠️  Reminder: ensure $BACKEND_DEST/.env has LITHIC_API_KEY and other secrets."
