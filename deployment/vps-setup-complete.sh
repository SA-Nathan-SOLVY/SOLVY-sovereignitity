#!/bin/bash
# ============================================================================
# SOLVY Ecosystem™ — Complete VPS Setup Script
# Run this ONCE on a fresh Ubuntu 22.04/24.04 VPS
#
# What this installs:
#   - System: updates, timezone, swap, sysctl tuning
#   - Node.js 20.x + npm + PM2 (process manager)
#   - Nginx (reverse proxy + static files)
#   - Docker + Docker Compose
#   - Certbot (Let's Encrypt SSL)
#   - UFW firewall + Fail2Ban
#   - Gitea (self-hosted Git server via Docker)
#   - Monitoring stack (Prometheus + Grafana + Alertmanager via Docker)
#   - Directory structure for SOLVY app
#   - Logrotate + unattended-upgrades
#
# Usage:
#   scp deployment/vps-setup-complete.sh root@YOUR_VPS_IP:/root/
#   ssh root@YOUR_VPS_IP
#   chmod +x /root/vps-setup-complete.sh
#   ./vps-setup-complete.sh
# ============================================================================

set -e

# ─── Configuration ──────────────────────────────────────────────────────────
SERVER_IP="${SERVER_IP:-$(curl -s ifconfig.me)}"
DOMAIN="${DOMAIN:-solvy.cards}"
EBL_DOMAIN="${EBL_DOMAIN:-ebl.beauty}"
GITEA_DOMAIN="${GITEA_DOMAIN:-gitea.ebl.beauty}"
GRAFANA_DOMAIN="${GRAFANA_DOMAIN:-grafana.ebl.beauty}"
DEPLOY_DIR="${DEPLOY_DIR:-/var/www/ebl.beauty}"
APP_DIR="${APP_DIR:-/opt/solvy}"
MONITORING_DIR="${MONITORING_DIR:-/opt/monitoring}"
GITEA_DIR="${GITEA_DIR:-/opt/gitea}"
SOLVY_USER="${SOLVY_USER:-solvy}"
SWAP_SIZE="${SWAP_SIZE:-2G}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

log()   { echo -e "${GREEN}[SOLVY]${NC} $1"; }
info()  { echo -e "${BLUE}[SOLVY]${NC} $1"; }
warn()  { echo -e "${YELLOW}[SOLVY]${NC} $1"; }
error() { echo -e "${RED}[SOLVY]${NC} $1"; }
step()  { echo -e "\n${CYAN}${BOLD}▶ $1${NC}"; }

# ─── Pre-flight Checks ──────────────────────────────────────────────────────
if [ "$EUID" -ne 0 ]; then
    error "This script must be run as root. Use: sudo ./vps-setup-complete.sh"
    exit 1
fi

if [ ! -f /etc/os-release ]; then
    error "Cannot detect OS. This script requires Ubuntu 22.04/24.04."
    exit 1
fi

UBUNTU_VERSION=$(grep VERSION_ID /etc/os-release | cut -d'"' -f2)
if [[ ! "$UBUNTU_VERSION" =~ ^(22|24)\. ]]; then
    warn "Detected Ubuntu $UBUNTU_VERSION. This script is tested on 22.04/24.04."
    read -p "Continue anyway? [y/N] " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

step "SOLVY Ecosystem™ — Complete VPS Setup"
log "SOLVY: $DOMAIN | EBL: $EBL_DOMAIN | Server: $SERVER_IP"
log "User:   $SOLVY_USER"
log "Ubuntu: $UBUNTU_VERSION"

# ─── 1. SYSTEM UPDATE & BASE PACKAGES ───────────────────────────────────────
step "1/14 — Updating system packages..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get upgrade -y -qq
apt-get install -y -qq \
    curl wget git build-essential \
    nginx sqlite3 ufw fail2ban \
    certbot python3-certbot-nginx \
    rsync htop unzip jq \
    software-properties-common \
    apt-transport-https ca-certificates \
    gnupg lsb-release \
    logrotate unattended-upgrades \
    bc

# ─── 2. TIMEZONE & LOCALE ───────────────────────────────────────────────────
step "2/14 — Configuring timezone..."
timedatectl set-timezone America/Chicago || timedatectl set-timezone UTC
log "Timezone set to: $(timedatectl | grep "Time zone" | awk '{print $3}')"

# ─── 3. SWAP FILE ───────────────────────────────────────────────────────────
step "3/14 — Setting up swap ($SWAP_SIZE)..."
if [ ! -f /swapfile ]; then
    fallocate -l "$SWAP_SIZE" /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=$(echo "$SWAP_SIZE" | sed 's/G/*1024/' | bc)
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    log "Swap created and enabled."
else
    warn "Swap file already exists."
fi

# ─── 4. SYSCTL TUNING ───────────────────────────────────────────────────────
step "4/14 — Applying kernel/network tuning..."
cat >> /etc/sysctl.conf << 'EOF'

# SOLVY Ecosystem™ — Performance Tuning
# Increase file descriptors
fs.file-max = 65535

# TCP performance
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_fin_timeout = 15
net.ipv4.tcp_keepalive_time = 300
net.ipv4.tcp_max_syn_backlog = 65536
net.ipv4.tcp_slow_start_after_idle = 0

# Connection tracking
net.netfilter.nf_conntrack_max = 65535

# VM settings for containers
vm.swappiness = 10
vm.dirty_ratio = 15
vm.dirty_background_ratio = 5
EOF
sysctl -p > /dev/null 2>&1 || true
log "Kernel tuning applied."

# ─── 5. INSTALL NODE.JS 20.x ────────────────────────────────────────────────
step "5/14 — Installing Node.js 20.x..."
if ! command -v node &> /dev/null || [ "$(node -v | cut -d'v' -f2 | cut -d'.' -f1)" != "20" ]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
    apt-get install -y -qq nodejs
fi
node_version=$(node -v)
npm_version=$(npm -v)
log "Node.js: $node_version"
log "npm:     $npm_version"

# ─── 6. INSTALL PM2 ─────────────────────────────────────────────────────────
step "6/14 — Installing PM2 (process manager)..."
npm install -g pm2@latest
pm2 startup systemd -u root --hp /root > /dev/null 2>&1 || true
log "PM2 installed: $(pm2 -v)"

# ─── 7. INSTALL DOCKER & DOCKER COMPOSE ─────────────────────────────────────
step "7/14 — Installing Docker & Docker Compose..."
if ! command -v docker &> /dev/null; then
    # Remove old versions if any
    for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do
        apt-get remove -y "$pkg" 2>/dev/null || true
    done

    # Add Docker's official GPG key
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg

    # Add repository
    echo \
        "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
        $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
        tee /etc/apt/sources.list.d/docker.list > /dev/null

    apt-get update -qq
    apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    # Enable Docker
    systemctl enable docker
    systemctl start docker

    log "Docker installed: $(docker --version)"
    log "Docker Compose: $(docker compose version)"
else
    log "Docker already installed: $(docker --version)"
fi

# ─── 8. CREATE SOLVY USER ───────────────────────────────────────────────────
step "8/14 — Creating deployment user ($SOLVY_USER)..."
if ! id -u "$SOLVY_USER" &>/dev/null; then
    useradd -m -s /bin/bash "$SOLVY_USER"
    usermod -aG sudo,docker "$SOLVY_USER"
    log "User '$SOLVY_USER' created and added to sudo,docker groups."
else
    usermod -aG docker "$SOLVY_USER" 2>/dev/null || true
    warn "User '$SOLVY_USER' already exists."
fi

# ─── 9. DIRECTORY STRUCTURE ─────────────────────────────────────────────────
step "9/14 — Creating directory structure..."
mkdir -p "$DEPLOY_DIR"/{frontend,backend,data,logs}
mkdir -p "$APP_DIR"
mkdir -p "$MONITORING_DIR"/{prometheus,grafana,alertmanager,blackbox,secrets,scripts}
mkdir -p "$GITEA_DIR"

# Set ownership
chown -R "$SOLVY_USER:$SOLVY_USER" "$DEPLOY_DIR" "$APP_DIR" "$MONITORING_DIR" "$GITEA_DIR" 2>/dev/null || \
    chown -R root:root "$DEPLOY_DIR" "$APP_DIR" "$MONITORING_DIR" "$GITEA_DIR"

chmod 755 "$DEPLOY_DIR" "$APP_DIR" "$MONITORING_DIR" "$GITEA_DIR"
chmod 775 "$DEPLOY_DIR/data"
chmod 775 "$DEPLOY_DIR/logs"

log "Directories created:"
log "  App:       $DEPLOY_DIR"
log "  Backend:   $APP_DIR"
log "  Monitor:   $MONITORING_DIR"
log "  Gitea:     $GITEA_DIR"

# ─── 10. CONFIGURE UFW FIREWALL ─────────────────────────────────────────────
step "10/14 — Configuring UFW firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh      comment 'SSH'
ufw allow http     comment 'HTTP'
ufw allow https    comment 'HTTPS'
ufw allow 2222/tcp comment 'Gitea SSH' 2>/dev/null || true
ufw --force enable
log "Firewall active:"
ufw status | grep -E "(Status|To|ALLOW)" || true

# ─── 11. CONFIGURE FAIL2BAN ─────────────────────────────────────────────────
step "11/14 — Configuring Fail2Ban..."
cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5
backend = systemd

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
port = http,https
logpath = /var/log/nginx/error.log
EOF

systemctl enable fail2ban
systemctl restart fail2ban
log "Fail2Ban configured and running."

# ─── 12. CONFIGURE NGINX ────────────────────────────────────────────────────
step "12/14 — Configuring Nginx..."
rm -f /etc/nginx/sites-enabled/default

# Main SOLVY nginx config
cat > /etc/nginx/sites-available/solvy << 'NGINXEOF'
# ============================================================================
# SOLVY Ecosystem™ — Nginx Configuration
# ============================================================================

# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;
limit_req_zone $binary_remote_addr zone=support_limit:10m rate=10r/m;

# ─── HTTP: Redirect to HTTPS ────────────────────────────────────────────────
server {
    listen 80;
    listen [::]:80;
    server_name ebl.beauty www.ebl.beauty;

    # Let’s Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

# ─── HTTPS: Main SOLVY Site ─────────────────────────────────────────────────
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;

    server_name ebl.beauty www.ebl.beauty;
    root /var/www/ebl.beauty/frontend;
    index index.html welcome.html;

    # SSL (certbot will populate these)
    ssl_certificate /etc/letsencrypt/live/ebl.beauty/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ebl.beauty/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Static assets — long cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 6M;
        access_log off;
        add_header Cache-Control "public, immutable";
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 5s;
        proxy_read_timeout 10s;
    }

    # API routes
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 5s;
        proxy_send_timeout 10s;
        proxy_read_timeout 30s;
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }

    # Support endpoint — stricter rate limiting
    location /api/support/ {
        limit_req zone=support_limit burst=5 nodelay;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Default — serve static files
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Logging
    access_log /var/www/ebl.beauty/logs/nginx-access.log;
    error_log /var/www/ebl.beauty/logs/nginx-error.log;
}
NGINXEOF

ln -sf /etc/nginx/sites-available/solvy /etc/nginx/sites-enabled/solvy

# Create certbot webroot
mkdir -p /var/www/certbot

nginx -t && systemctl reload nginx
systemctl enable nginx
log "Nginx configured and running."

# ─── 13. LOGROTATE & AUTO-UPDATES ───────────────────────────────────────────
step "13/14 — Configuring logrotate & auto-updates..."

cat > /etc/logrotate.d/solvy << 'EOF'
/var/www/ebl.beauty/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0644 root root
}
EOF

# Enable unattended-upgrades for security patches
cat > /etc/apt/apt.conf.d/50unattended-upgrades << 'EOF'
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}-security";
    "${distro_id}ESMApps:${distro_codename}-apps-security";
    "${distro_id}ESM:${distro_codename}-infra-security";
};
Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::MinimalSteps "true";
Unattended-Upgrade::InstallOnShutdown "false";
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
EOF

cat > /etc/apt/apt.conf.d/20auto-upgrades << 'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Download-Upgradeable-Packages "1";
APT::Periodic::AutocleanInterval "7";
APT::Periodic::Unattended-Upgrade "1";
EOF

systemctl enable unattended-upgrades
systemctl start unattended-upgrades
log "Logrotate and unattended-upgrades configured."

# ─── 14. CREATE ENVIRONMENT TEMPLATES ───────────────────────────────────────
step "14/14 — Creating environment templates..."

# App .env template
cat > "$DEPLOY_DIR/backend/.env.example" << 'EOF'
# ============================================================================
# SOLVY Ecosystem™ — Production Environment Variables
# COPY THIS FILE TO .env AND FILL IN REAL VALUES
# NEVER COMMIT .env TO GIT
# ============================================================================

# ─── Server ─────────────────────────────────────────────────────────────────
PORT=3000
NODE_ENV=production
ALLOWED_ORIGINS=https://ebl.beauty,https://www.ebl.beauty

# ─── Unit.co Banking (Required) ─────────────────────────────────────────────
UNIT_API_TOKEN=
UNIT_API_URL=https://api.s.unit.sh
UNIT_ORG_ID=
UNIT_WEBHOOK_SECRET=

# ─── Stripe (Required) ──────────────────────────────────────────────────────
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# ─── AgentMail Email (Required) ─────────────────────────────────────────────
AGENTMAIL_API_KEY=
AGENTMAIL_SUPPORT_INBOX_ID=
AGENTMAIL_NOREPLY_INBOX_ID=
AGENTMAIL_HELLO_INBOX_ID=
AGENTMAIL_WEBHOOK_SECRET=

# ─── DeepSeek AI (Optional) ─────────────────────────────────────────────────
DEEPSEEK_API_KEY=
DEEPSEEK_API_URL=https://api.deepseek.com/v1

# ─── Security ───────────────────────────────────────────────────────────────
ADMIN_API_KEY=CHANGE_THIS_TO_A_STRONG_RANDOM_KEY
MEMBER_HASH_SALT=solvy_aggregation_salt_2025
JWT_SECRET=
WEBHOOK_SECRET=

# ─── Database ───────────────────────────────────────────────────────────────
DATABASE_URL=sqlite:/var/www/ebl.beauty/data/solvy.sqlite

# ─── Support Email ──────────────────────────────────────────────────────────
SUPPORT_EMAIL=support@ebl.beauty
SUPPORT_FROM=noreply@ebl.beauty
SUPPORT_RECIPIENTS=support@ebl.beauty
EOF

# Gitea .env template
cat > "$GITEA_DIR/.env.example" << 'EOF'
# Gitea Configuration
POSTGRES_PASSWORD=CHANGE_THIS_PASSWORD
GITEA_DOMAIN=gitea.ebl.beauty
GITEA_ROOT_URL=https://gitea.ebl.beauty/
GITEA_SSH_DOMAIN=gitea.ebl.beauty
GITEA_SSH_PORT=2222
TUNNEL_TOKEN=          # Cloudflare tunnel token (optional)
EOF

# Monitoring secrets template
mkdir -p "$MONITORING_DIR/secrets"
echo "admin" > "$MONITORING_DIR/secrets/grafana_admin_password.txt"
chmod 600 "$MONITORING_DIR/secrets/grafana_admin_password.txt"

chown -R "$SOLVY_USER:$SOLVY_USER" "$DEPLOY_DIR" "$APP_DIR" "$MONITORING_DIR" "$GITEA_DIR" 2>/dev/null || true

# ─── DONE ───────────────────────────────────────────────────────────────────
echo ""
step "✅ SOLVY VPS Setup Complete!"
echo ""
log "========================================"
log "Server:   $SERVER_IP"
log "Domain:   $DOMAIN"
log "User:     $SOLVY_USER"
echo ""
info "INSTALLED:"
info "  • Node.js $(node -v) + npm $(npm -v)"
info "  • PM2 $(pm2 -v)"
info "  • $(docker --version)"
info "  • $(docker compose version)"
info "  • Nginx $(nginx -v 2>&1 | grep -o '[0-9.]*' | head -1)"
info "  • Certbot + UFW + Fail2Ban"
echo ""
warn "NEXT STEPS:"
warn "  1. SSH hardening: edit /etc/ssh/sshd_config (disable root login, change port)"
warn "  2. Copy .env: cp $DEPLOY_DIR/backend/.env.example $DEPLOY_DIR/backend/.env"
warn "  3. Edit .env: nano $DEPLOY_DIR/backend/.env  ← FILL IN ALL VALUES"
warn "  4. SSL cert: certbot --nginx -d $DOMAIN -d www.$DOMAIN -d $EBL_DOMAIN -d www.$EBL_DOMAIN"
warn "  5. Deploy app: clone repo + run deployment script"
warn "  6. Grafana password: change $MONITORING_DIR/secrets/grafana_admin_password.txt"
echo ""
log "DIRECTORIES:"
log "  App:       $DEPLOY_DIR"
log "  Source:    $APP_DIR"
log "  Monitor:   $MONITORING_DIR"
log "  Gitea:     $GITEA_DIR"
echo ""
log "COMMANDS:"
log "  pm2 status         — View Node.js processes"
log "  pm2 logs solvy-api — View app logs"
log "  nginx -t           — Test nginx config"
log "  ufw status         — View firewall rules"
log "  docker ps          — View containers"
echo ""
log "========================================"
log "Foundation first. The iron fist, digital. 🛡️"
