#!/bin/bash
# ============================================================================
# SOLVY Ecosystem™ — VPS Setup Script
# Run this ONCE on a fresh Ubuntu 22.04 Hetzner VPS
# ============================================================================

set -e

SERVER_IP="${SERVER_IP:-46.62.235.95}"
DOMAIN="${DOMAIN:-ebl.beauty}"
DEPLOY_DIR="/var/www/solvy"
BACKEND_DIR="$DEPLOY_DIR/backend"
FRONTEND_DIR="$DEPLOY_DIR/frontend"
DATA_DIR="$DEPLOY_DIR/data"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[SOLVY Setup]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[SOLVY Setup]${NC} $1"
}

error() {
    echo -e "${RED}[SOLVY Setup]${NC} $1"
}

log "Starting SOLVY server setup..."
log "Target: $SERVER_IP ($DOMAIN)"

# ============================================================================
# 1. SYSTEM UPDATE
# ============================================================================
log "Updating system packages..."
apt-get update
apt-get upgrade -y

# ============================================================================
# 2. INSTALL DEPENDENCIES
# ============================================================================
log "Installing core dependencies..."
apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    nginx \
    sqlite3 \
    ufw \
    fail2ban \
    certbot \
    python3-certbot-nginx \
    rsync

# ============================================================================
# 3. INSTALL NODE.JS 20.x
# ============================================================================
log "Installing Node.js 20.x..."
if ! command -v node &> /dev/null || [ "$(node -v | cut -d'v' -f2 | cut -d'.' -f1)" != "20" ]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

log "Node.js version: $(node -v)"
log "npm version: $(npm -v)"

# ============================================================================
# 4. INSTALL PM2 (Process Manager)
# ============================================================================
log "Installing PM2..."
npm install -g pm2

# ============================================================================
# 5. CREATE DEPLOYMENT USER (Optional but Recommended)
# ============================================================================
if ! id -u solvy &>/dev/null; then
    log "Creating 'solvy' deployment user..."
    useradd -m -s /bin/bash solvy || true
    usermod -aG sudo solvy || true
fi

# ============================================================================
# 6. CREATE DIRECTORY STRUCTURE
# ============================================================================
log "Creating deployment directories..."
mkdir -p "$BACKEND_DIR"
mkdir -p "$FRONTEND_DIR"
mkdir -p "$DATA_DIR"
mkdir -p "$DEPLOY_DIR/scripts"
mkdir -p "$DEPLOY_DIR/logs"

chown -R solvy:solvy "$DEPLOY_DIR" 2>/dev/null || chown -R www-data:www-data "$DEPLOY_DIR"
chmod 755 "$DEPLOY_DIR"
chmod 775 "$DATA_DIR"

# ============================================================================
# 7. CONFIGURE FIREWALL
# ============================================================================
log "Configuring UFW firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https
ufw --force enable

log "UFW status:"
ufw status

# ============================================================================
# 8. CONFIGURE FAIL2BAN
# ============================================================================
log "Configuring Fail2Ban..."
systemctl enable fail2ban
systemctl start fail2ban

# ============================================================================
# 9. CONFIGURE NGINX
# ============================================================================
log "Configuring Nginx..."
rm -f /etc/nginx/sites-enabled/default

# We'll copy the real config during deploy.sh
cat > /etc/nginx/sites-available/solvy << 'EOF'
# Placeholder - will be replaced by deploy.sh
# Run: ./scripts/deploy.sh to complete nginx setup
EOF

ln -sf /etc/nginx/sites-available/solvy /etc/nginx/sites-enabled/solvy
nginx -t
systemctl reload nginx
systemctl enable nginx

# ============================================================================
# 10. SETUP LOGROTATE
# ============================================================================
log "Configuring logrotate..."
cat > /etc/logrotate.d/solvy << 'EOF'
/var/www/solvy/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0644 solvy solvy
}
EOF

# ============================================================================
# 11. DONE
# ============================================================================
log "========================================"
log "SOLVY server setup complete!"
log "========================================"
log ""
log "Next steps:"
log "  1. Copy your .env file to $BACKEND_DIR/.env"
log "  2. Run: ./scripts/deploy.sh"
log "  3. Set up SSL: certbot --nginx -d $DOMAIN -d www.$DOMAIN"
log ""
log "Directories created:"
log "  Backend:  $BACKEND_DIR"
log "  Frontend: $FRONTEND_DIR"
log "  Data:     $DATA_DIR"
log ""
warn "Remember to change the default admin key in .env!"
