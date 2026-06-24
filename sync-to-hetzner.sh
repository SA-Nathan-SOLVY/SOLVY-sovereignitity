#!/bin/bash
# Sync SOLVY React PWA + backend to Hetzner VPS
# Run from project root
#
# Current stack:
#   - Frontend: solvy-cards/ (Vite + React + Capacitor)
#   - Backend:  solvy-unit-integration/ (Node.js + Express)
#   - VPS:      46.62.235.95 (Ubuntu + Nginx + PM2)
#   - Web root: /var/www/ebl.beauty (also serves solvy.cards via Nginx)

set -e

VPS="root@46.62.235.95"
SOURCE="solvy-cards/dist"
DEST="/var/www/ebl.beauty"
DEST_SOLVY="/var/www/solvy.cards"
BACKEND_SOURCE="solvy-unit-integration"
BACKEND_DEST="/opt/solvy"

echo "▶ Building solvy-cards for production..."
cd solvy-cards
npm run build
cd ..

if [ ! -d "$SOURCE" ]; then
  echo "❌ Build failed: $SOURCE not found"
  exit 1
fi

echo "▶ Syncing $SOURCE → $VPS:$DEST"
rsync -avz --delete \
  --exclude='.git' \
  --exclude='node_modules' \
  "$SOURCE/" "$VPS:$DEST/"

if [ -d "$DEST_SOLVY" ]; then
  echo "▶ Syncing $SOURCE → $VPS:$DEST_SOLVY"
  rsync -avz --delete \
    --exclude='.git' \
    --exclude='node_modules' \
    "$SOURCE/" "$VPS:$DEST_SOLVY/"
fi

echo "▶ Syncing backend $BACKEND_SOURCE → $VPS:$BACKEND_DEST"
rsync -avz --delete \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.env' \
  "$BACKEND_SOURCE/" "$VPS:$BACKEND_DEST/"

# Install backend dependencies and restart PM2 process
ssh "$VPS" << 'REMOTE'
  cd /opt/solvy
  npm install
  if pm2 list | grep -q "solvy-api"; then
    echo "▶ Restarting solvy-api via PM2..."
    pm2 restart solvy-api
  else
    echo "▶ Starting solvy-api via PM2..."
    pm2 start server.js --name solvy-api -- --port 3000
    pm2 save
  fi
  pm2 startup systemd -u root --hp /root 2>/dev/null || true

  echo "▶ Setting web root permissions..."
  chown -R www-data:www-data /var/www/ebl.beauty
  chmod -R 755 /var/www/ebl.beauty
  if [ -d "/var/www/solvy.cards" ]; then
    chown -R www-data:www-data /var/www/solvy.cards
    chmod -R 755 /var/www/solvy.cards
  fi

  echo "▶ Reloading nginx..."
  nginx -t && systemctl reload nginx
REMOTE

echo "✅ Sync complete."
echo "   Frontend: https://solvy.cards"
echo "   Backend health: https://solvy.cards/health"
echo ""
echo "⚠️  Reminder: ensure /opt/solvy/.env has LITHIC_API_KEY and other secrets."
