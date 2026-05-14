#!/bin/bash
# ============================================================
# SOLVY Ecosystem™ — Node Exporter Installation Script
# ============================================================
# Run on Hetzner VPS as root.
# Installs node_exporter as a systemd service on port 9100.
#
# Usage:
#   sudo bash scripts/install-node-exporter.sh
# ============================================================

set -euo pipefail

NODE_EXPORTER_VERSION="1.8.1"
NODE_EXPORTER_USER="node-exporter"
INSTALL_DIR="/usr/local/bin"
SERVICE_FILE="/etc/systemd/system/node-exporter.service"

echo "============================================"
echo "  SOLVY Node Exporter Installer"
echo "  Version: ${NODE_EXPORTER_VERSION}"
echo "============================================"

# Create user (no shell, no home)
if ! id "${NODE_EXPORTER_USER}" &>/dev/null; then
    echo "[+] Creating user: ${NODE_EXPORTER_USER}"
    useradd --no-create-home --shell /usr/sbin/nologin "${NODE_EXPORTER_USER}"
else
    echo "[i] User ${NODE_EXPORTER_USER} already exists"
fi

# Download and install
echo "[+] Downloading node_exporter v${NODE_EXPORTER_VERSION}..."
cd /tmp
wget -q "https://github.com/prometheus/node_exporter/releases/download/v${NODE_EXPORTER_VERSION}/node_exporter-${NODE_EXPORTER_VERSION}.linux-amd64.tar.gz"

echo "[+] Extracting..."
tar xzf "node_exporter-${NODE_EXPORTER_VERSION}.linux-amd64.tar.gz"

echo "[+] Installing to ${INSTALL_DIR}..."
cp "node_exporter-${NODE_EXPORTER_VERSION}.linux-amd64/node_exporter" "${INSTALL_DIR}/"
chmod +x "${INSTALL_DIR}/node_exporter"

# Cleanup
echo "[+] Cleaning up..."
rm -rf "node_exporter-${NODE_EXPORTER_VERSION}.linux-amd64" "node_exporter-${NODE_EXPORTER_VERSION}.linux-amd64.tar.gz"

# Install systemd service
echo "[+] Installing systemd service..."
cat > "${SERVICE_FILE}" << 'EOF'
[Unit]
Description=Prometheus Node Exporter
Documentation=https://github.com/prometheus/node_exporter
Wants=network-online.target
After=network-online.target

[Service]
Type=simple
User=node-exporter
Group=node-exporter
ExecStart=/usr/local/bin/node_exporter \
  --path.procfs=/proc \
  --path.sysfs=/sys \
  --path.rootfs=/ \
  --collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc|run|var/lib/docker/.+)($$|/) \
  --collector.netclass.ignored-devices=^(lo|docker.+) \
  --collector.netdev.device-exclude=^(lo|docker.+) \
  --web.listen-address=:9100 \
  --web.telemetry-path=/metrics

Restart=always
RestartSec=5

NoNewPrivileges=true
ProtectHome=true
ProtectSystem=strict

[Install]
WantedBy=multi-user.target
EOF

# Reload and start
echo "[+] Reloading systemd..."
systemctl daemon-reload

echo "[+] Enabling node-exporter..."
systemctl enable node-exporter

echo "[+] Starting node-exporter..."
systemctl start node-exporter

# Verify
echo ""
echo "============================================"
echo "  ✅ Node Exporter Installed!"
echo "============================================"
echo "  Service:    systemctl status node-exporter"
echo "  Metrics:    curl http://localhost:9100/metrics"
echo "  Port:       9100 (localhost only)"
echo ""
echo "  Verify it's running:"
echo "    curl -s http://localhost:9100/metrics | head -5"
echo ""
