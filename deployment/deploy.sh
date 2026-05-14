#!/bin/bash
# ============================================================================
# SOLVY Ecosystem™ — Deployment Script
# Run this after setup.sh to deploy or update the application
# ============================================================================

set -e

DEPLOY_DIR="/var/www/solvy"
BACKEND_DIR="$DEPLOY_DIR/backend"
FRONTEND_DIR="$DEPLOY_DIR/frontend"
DATA_DIR="$DEPLOY_DIR/data"
LOG_DIR="$DEPLOY_DIR/logs"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[SOLVY Deploy]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[SOLVY Deploy]${NC} $1"
}

error() {
    echo -e "${RED}[SOLVY Deploy]${NC} $1"
}

info() {
    echo -e "${BLUE}[SOLVY Deploy]${NC} $1"
}

log "Starting SOLVY deployment..."

# ============================================================================
# 1. ENSURE DIRECTORIES EXIST
# ============================================================================
mkdir -p "$BACKEND_DIR" "$FRONTEND_DIR" "$DATA_DIR" "$LOG_DIR"

# ============================================================================
# 2. CHECK SOURCE FILES
# ============================================================================
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    error "backend/ and frontend/ directories not found!"
    error "Make sure you run this script from the deployment root."
    exit 1
fi

# ============================================================================
# 3. BACKUP EXISTING DATABASE
# ============================================================================
if [ -f "$DATA_DIR/solvy.sqlite" ]; then
    BACKUP_NAME="solvy.sqlite.backup.$(date +%Y%m%d-%H%M%S)"
    log "Backing up existing database to $BACKUP_NAME..."
    cp "$DATA_DIR/solvy.sqlite" "$DATA_DIR/$BACKUP_NAME"
fi

# ============================================================================
# 4. COPY BACKEND FILES
# ============================================================================
log "Copying backend files..."
rsync -av --delete \
    --exclude='node_modules' \
    --exclude='.env' \
    --exclude='data/' \
    backend/ "$BACKEND_DIR/"

# ============================================================================
# 5. COPY FRONTEND FILES
# ============================================================================
log "Copying frontend files..."
rsync -av --delete \
    --exclude='node_modules' \
    frontend/ "$FRONTEND_DIR/"

# ============================================================================
# 6. INSTALL BACKEND DEPENDENCIES
# ============================================================================
log "Installing backend dependencies..."
cd "$BACKEND_DIR"
npm install --production

# Ensure data directory is writable
chmod 775 "$DATA_DIR"
touch "$DATA_DIR/solvy.sqlite"
chmod 664 "$DATA_DIR/solvy.sqlite"

# ============================================================================
# 7. CHECK ENVIRONMENT
# ============================================================================
if [ ! -f "$BACKEND_DIR/.env" ]; then
    warn "No .env file found at $BACKEND_DIR/.env"
    warn "Copy .env.example and configure it before starting the server:"
    warn "  cp $BACKEND_DIR/.env.example $BACKEND_DIR/.env"
    warn "  nano $BACKEND_DIR/.env"
fi

# ============================================================================
# 8. CONFIGURE NGINX
# ============================================================================
log "Configuring Nginx..."
if [ -f "scripts/nginx-config.conf" ]; then
    cp scripts/nginx-config.conf /etc/nginx/sites-available/solvy
    nginx -t
    systemctl reload nginx
    log "Nginx configuration updated and reloaded."
else
    warn "nginx-config.conf not found. Skipping nginx update."
fi

# ============================================================================
# 9. START / RESTART BACKEND WITH PM2
# ============================================================================
log "Starting backend with PM2..."
cd "$BACKEND_DIR"

if pm2 list | grep -q "solvy-api"; then
    log "Restarting existing PM2 process..."
    pm2 restart solvy-api
else
    log "Starting new PM2 process..."
    pm2 start index.js --name "solvy-api" \
        --log "$LOG_DIR/app.log" \
        --error "$LOG_DIR/error.log" \
        --output "$LOG_DIR/out.log" \
        --max-memory-restart 512M \
        --restart-delay 3000 \
        --max-restarts 5
fi

pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true

# ============================================================================
# 10. VERIFY DEPLOYMENT
# ============================================================================
log "Running health checks..."
sleep 2

HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health || echo "000")

if [ "$HEALTH_STATUS" = "200" ]; then
    log "✅ Backend health check passed (HTTP 200)"
else
    warn "⚠️  Backend health check returned HTTP $HEALTH_STATUS"
    warn "Check logs: pm2 logs solvy-api"
fi

NGINX_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/health || echo "000")

if [ "$NGINX_STATUS" = "200" ]; then
    log "✅ Nginx proxy check passed (HTTP 200)"
else
    warn "⚠️  Nginx proxy check returned HTTP $NGINX_STATUS"
fi

# ============================================================================
# 11. DONE
# ============================================================================
log "========================================"
log "SOLVY deployment complete!"
log "========================================"
log ""
log "Backend:  http://localhost:3000"
log "Frontend: http://localhost (via nginx)"
log "Logs:     $LOG_DIR/"
log "Data:     $DATA_DIR/"
log ""
log "PM2 commands:"
log "  pm2 status          — View process status"
log "  pm2 logs solvy-api  — View application logs"
log "  pm2 restart solvy-api — Restart the backend"
log ""
info "If this is your first deploy, set up SSL:"
info "  certbot --nginx -d ebl.beauty -d www.ebl.beauty"
log ""
warn "Remember to:"
warn "  1. Update .env with production secrets"
warn "  2. Change the default admin key"
warn "  3. Set up SSL with Let's Encrypt"
warn "  4. Configure SUPPORT_RECIPIENTS email addresses"
