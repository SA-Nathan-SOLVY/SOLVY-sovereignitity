#!/bin/bash
# ============================================================
# SOLVY Ecosystem™ — Full Monitoring Stack Installer
# ============================================================
# One-command setup for Prometheus + Grafana + Blackbox + Alertmanager
# on Hetzner VPS running Ubuntu 22.04.
#
# Prerequisites:
#   - Docker & Docker Compose installed (see README)
#   - Node Exporter installed (run install-node-exporter.sh first)
#   - /opt/monitoring directory created
#
# Usage:
#   sudo bash install-monitoring.sh
# ============================================================

set -euo pipefail

MONITORING_DIR="/opt/monitoring"
SECRETS_DIR="${MONITORING_DIR}/secrets"
NGINX_AVAILABLE="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"

echo "============================================"
echo "  SOLVY Monitoring Stack Installer"
echo "============================================"

# Check root
if [ "$(id -u)" -ne 0 ]; then
    echo "❌ This script must be run as root. Use: sudo bash install-monitoring.sh"
    exit 1
fi

# Check Docker
if ! command -v docker &>/dev/null; then
    echo "❌ Docker not found. Install first:"
    echo "   curl -fsSL https://get.docker.com | sh"
    exit 1
fi

if ! command -v docker-compose &>/dev/null && ! docker compose version &>/dev/null; then
    echo "❌ Docker Compose not found. Install first:"
    echo "   apt install -y docker-compose-plugin"
    exit 1
fi

# Create directory structure
echo "[+] Creating monitoring directory: ${MONITORING_DIR}"
mkdir -p "${MONITORING_DIR}"
mkdir -p "${SECRETS_DIR}"

# Create Grafana admin password secret
echo "[+] Setting up Grafana admin password..."
if [ ! -f "${SECRETS_DIR}/grafana_admin_password.txt" ]; then
    read -sp "Enter Grafana admin password: " GRAFANA_PASS
    echo
    echo -n "${GRAFANA_PASS}" > "${SECRETS_DIR}/grafana_admin_password.txt"
    chmod 600 "${SECRETS_DIR}/grafana_admin_password.txt"
    echo "✅ Password saved to ${SECRETS_DIR}/grafana_admin_password.txt"
else
    echo "[i] Grafana password already exists"
fi

# Copy configs (assumes this script is run from the monitoring/ directory or with files copied)
echo "[+] Checking configuration files..."

required_files=(
    "docker-compose.yml"
    "prometheus/prometheus.yml"
    "prometheus/alerting_rules.yml"
    "alertmanager/alertmanager.yml"
    "blackbox/blackbox.yml"
    "grafana/provisioning/datasources/datasource.yml"
    "grafana/provisioning/dashboards/dashboard.yml"
    "grafana/provisioning/dashboards/solvy-dashboard.json"
)

for file in "${required_files[@]}"; do
    if [ ! -f "${MONITORING_DIR}/${file}" ] && [ ! -f "./${file}" ]; then
        echo "⚠️  Missing config file: ${file}"
        echo "    Copy monitoring configs to ${MONITORING_DIR}/ first."
    fi
done

# Check if we're running from the monitoring directory
if [ -f "./docker-compose.yml" ]; then
    echo "[+] Copying local configs to ${MONITORING_DIR}..."
    cp -r ./* "${MONITORING_DIR}/"
fi

# Fix ownership
echo "[+] Setting permissions..."
chmod 600 "${SECRETS_DIR}/grafana_admin_password.txt" 2>/dev/null || true

# Create nginx config for Grafana
echo "[+] Setting up nginx for Grafana..."
if [ -f "${MONITORING_DIR}/nginx-grafana.conf" ]; then
    cp "${MONITORING_DIR}/nginx-grafana.conf" "${NGINX_AVAILABLE}/grafana.ebl.beauty"
    
    # Create basic auth file
    if [ ! -f "/etc/nginx/.grafana_htpasswd" ]; then
        echo "[+] Creating basic auth for Grafana..."
        read -p "Enter username for Grafana basic auth [admin]: " AUTH_USER
        AUTH_USER=${AUTH_USER:-admin}
        if command -v htpasswd &>/dev/null; then
            htpasswd -c "/etc/nginx/.grafana_htpasswd" "${AUTH_USER}"
        else
            echo "⚠️  htpasswd not found. Install apache2-utils, then run:"
            echo "   apt install -y apache2-utils"
            echo "   htpasswd -c /etc/nginx/.grafana_htpasswd ${AUTH_USER}"
        fi
    fi
    
    # Enable site
    if [ ! -L "${NGINX_ENABLED}/grafana.ebl.beauty" ]; then
        ln -s "${NGINX_AVAILABLE}/grafana.ebl.beauty" "${NGINX_ENABLED}/"
    fi
    
    nginx -t && systemctl reload nginx
fi

# Start monitoring stack
echo ""
echo "[+] Starting monitoring stack with Docker Compose..."
cd "${MONITORING_DIR}"

# Use docker compose (v2) or docker-compose (v1)
if docker compose version &>/dev/null; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

${COMPOSE_CMD} pull
${COMPOSE_CMD} up -d

# Verify
echo ""
echo "[+] Verifying services..."
sleep 5

echo ""
echo "  Prometheus:     curl -s http://localhost:9090/-/healthy"
curl -s http://localhost:9090/-/healthy || echo "    ⚠️  Prometheus not responding yet (may need more time)"

echo "  Grafana:        curl -s http://localhost:3001/api/health"
curl -s http://localhost:3001/api/health || echo "    ⚠️  Grafana not responding yet"

echo "  Alertmanager:   curl -s http://localhost:9093/-/healthy"
curl -s http://localhost:9093/-/healthy || echo "    ⚠️  Alertmanager not responding yet"

echo "  Blackbox:       curl -s http://localhost:9115"
curl -s http://localhost:9115 | head -1 || echo "    ⚠️  Blackbox not responding yet"

echo ""
echo "============================================"
echo "  ✅ Monitoring Stack Installed!"
echo "============================================"
echo ""
echo "  📊 Grafana Dashboard:   https://grafana.ebl.beauty"
echo "  🔥 Prometheus:          http://localhost:9090 (localhost only)"
echo "  🔔 Alertmanager:        http://localhost:9093 (localhost only)"
echo "  🌐 Blackbox:            http://localhost:9115 (localhost only)"
echo ""
echo "  📋 Useful Commands:"
echo "    cd ${MONITORING_DIR} && ${COMPOSE_CMD} logs -f"
echo "    cd ${MONITORING_DIR} && ${COMPOSE_CMD} restart"
echo "    systemctl status node-exporter"
echo ""
echo "  🔐 Default Grafana login:"
echo "    Username: admin"
echo "    Password: (the one you just set)"
echo ""
echo "  ⚠️  IMPORTANT: Run certbot for grafana.ebl.beauty:"
echo "    certbot --nginx -d grafana.ebl.beauty"
echo ""
