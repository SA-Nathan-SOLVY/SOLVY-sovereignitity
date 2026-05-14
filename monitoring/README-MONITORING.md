# SOLVY Ecosystem™ — Monitoring & Alerting Setup

> **Goal:** Complete observability for your SOLVY stack on Hetzner VPS  
> **Stack:** Prometheus + Grafana + Node Exporter + Blackbox Exporter + Alertmanager  
> **Domain:** `grafana.ebl.beauty` (reverse-proxied via nginx + HTTPS)

---

## 📋 What's Included

| Component | Purpose | Port | Exposed? |
|:---|:---|:---:|:---:|
| **Prometheus** | Time-series metrics database | 9090 | ❌ localhost only |
| **Grafana** | Dashboards & visualization | 3001 | ✅ via nginx HTTPS |
| **Node Exporter** | System metrics (CPU, memory, disk, network) | 9100 | ❌ localhost only |
| **Blackbox Exporter** | HTTP endpoint probing | 9115 | ❌ localhost only |
| **Alertmanager** | Alert routing & email notifications | 9093 | ❌ localhost only |

---

## 🚀 Quick Start (5 Commands)

```bash
# 1. SSH into your VPS
ssh root@46.62.235.95

# 2. Install Docker & Docker Compose (if not already)
curl -fsSL https://get.docker.com | sh
apt install -y docker-compose-plugin apache2-utils

# 3. Install Node Exporter (system metrics)
cd /opt
bash monitoring/scripts/install-node-exporter.sh

# 4. Copy monitoring configs and run installer
cd /opt/monitoring
bash scripts/install-monitoring.sh

# 5. Get SSL for Grafana subdomain
certbot --nginx -d grafana.ebl.beauty
```

---

## 📁 Directory Structure

```
/opt/monitoring/
├── docker-compose.yml              # Docker Compose for the stack
├── secrets/
│   └── grafana_admin_password.txt  # Generated during install
├── prometheus/
│   ├── prometheus.yml              # Scrape targets & rules
│   └── alerting_rules.yml          # Alert definitions
├── alertmanager/
│   └── alertmanager.yml            # Email notification config
├── blackbox/
│   └── blackbox.yml                # HTTP probe configuration
├── grafana/
│   └── provisioning/
│       ├── datasources/
│       │   └── datasource.yml      # Auto-configure Prometheus
│       └── dashboards/
│           ├── dashboard.yml       # Dashboard provider
│           └── solvy-dashboard.json # Pre-built SOLVY dashboard
├── scripts/
│   ├── install-node-exporter.sh   # Systemd service installer
│   └── install-monitoring.sh      # Full stack installer
├── nginx-grafana.conf             # nginx reverse proxy config
└── README-MONITORING.md           # This file
```

---

## 🔧 Step-by-Step Installation

### Step 1: Install Docker & Docker Compose

```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
usermod -aG docker root

# Install Docker Compose v2
apt install -y docker-compose-plugin

# Verify
docker --version
docker compose version
```

### Step 2: Install Node Exporter

Node Exporter runs as a **systemd service** (not a container) for accurate host metrics:

```bash
cd /opt/monitoring
bash scripts/install-node-exporter.sh

# Verify
systemctl status node-exporter
curl -s http://localhost:9100/metrics | head -5
```

### Step 3: Deploy Monitoring Stack

```bash
cd /opt/monitoring

# Option A: Run the automated installer (interactive)
bash scripts/install-monitoring.sh

# Option B: Manual setup
# 1. Set Grafana password
mkdir -p secrets
echo "your-secure-password" > secrets/grafana_admin_password.txt
chmod 600 secrets/grafana_admin_password.txt

# 2. Start stack
docker compose up -d

# 3. Check status
docker compose ps
docker compose logs -f
```

### Step 4: Configure Nginx for Grafana

```bash
# Copy nginx config
cp /opt/monitoring/nginx-grafana.conf /etc/nginx/sites-available/grafana.ebl.beauty

# Create basic auth
echo "admin:$(openssl passwd -apr1)" > /etc/nginx/.grafana_htpasswd

# Enable site
ln -s /etc/nginx/sites-available/grafana.ebl.beauty /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# Get SSL certificate
certbot --nginx -d grafana.ebl.beauty
```

### Step 5: Access Grafana

Open: `https://grafana.ebl.beauty`

- **Username:** `admin`
- **Password:** (the one you set during install)
- **Basic Auth:** (the nginx layer username/password)

---

## 📊 Dashboard Overview

The pre-built dashboard (`solvy-dashboard.json`) includes:

### Row 1: System Overview (Single Stats)
- **CPU Usage** — current percentage with color thresholds
- **Memory Usage** — current percentage
- **Disk Free** — percentage free per mountpoint
- **SOLVY API Status** — up/down indicator

### Row 2: System Metrics (Time Series)
- **CPU Usage Over Time** — 5-min trend
- **Memory Usage Over Time**
- **Disk Space Available** — per mountpoint
- **Network Traffic** — receive/transmit per interface

### Row 3: API Endpoint Health
- **Endpoint Status** — up/down for each probed URL
- **API Response Time** — latency over time
- **SSL Certificate Expiry** — days until renewal needed

### Row 4: Active Alerts
- **Firing Alerts Table** — all currently firing alerts

### Row 5: SOLVY Custom Metrics (Optional)
- **Active Members** — from `member_aggregates` table
- **Total Volume (USD)** — cumulative transaction volume
- **Total Interchange (USD)** — cumulative interchange revenue

> **Note:** Custom metrics panels show data only if you add the `/metrics` endpoint to your Node.js backend (see below).

---

## 🔔 Alerting Rules

Defined in `prometheus/alerting_rules.yml`:

| Alert | Condition | Severity | Action |
|:---|:---|:---:|:---|
| `HighCPUUsage` | CPU > 90% for 5 min | ⚠️ warning | Email |
| `CriticalCPUUsage` | CPU > 95% for 2 min | 🔴 critical | Email to you + Evergreen |
| `HighMemoryUsage` | Memory > 85% for 5 min | ⚠️ warning | Email |
| `CriticalMemoryUsage` | Memory > 95% for 2 min | 🔴 critical | Email |
| `LowDiskSpace` | Disk < 10% free | ⚠️ warning | Email |
| `CriticalDiskSpace` | Disk < 5% free | 🔴 critical | Email |
| `APIEndpointDown` | Probe fails for 1 min | 🔴 critical | Email |
| `APISlowResponse` | Response > 2s for 2 min | ⚠️ warning | Email |
| `SSLCertificateExpiringSoon` | < 14 days to expiry | ⚠️ warning | Email |
| `SSLCertificateExpiringCritical` | < 7 days to expiry | 🔴 critical | Email |
| `NodeExporterDown` | Exporter unreachable | 🔴 critical | Email |

### Alertmanager Routing

- **Critical alerts** → immediate email to `sean@ebl.beauty` and `evergreen@ebl.beauty`
- **Warning alerts** → batched digest every 30 minutes
- **Resolved alerts** → notification that issue is cleared

### Email Configuration

Edit `alertmanager/alertmanager.yml` and set environment variables:

```bash
# Add to /opt/monitoring/.env or export before starting
export SMTP_FROM="alerts@ebl.beauty"
export SMTP_USER="alerts@ebl.beauty"
export SMTP_PASS="your-mailcow-password"
export ALERT_EMAIL_TO="sean@ebl.beauty"
```

Then restart Alertmanager:
```bash
cd /opt/monitoring && docker compose restart alertmanager
```

---

## 📡 Custom API Metrics (Node.js Backend)

To expose SOLVY application metrics, add the prom-client integration:

### 1. Install prom-client

```bash
cd /var/www/solvy/backend
npm install prom-client
```

### 2. Register the Route and Middleware

In your `server/index.js`, add:

```javascript
const { router: metricsRouter, metricsMiddleware } = require('./routes/metrics-custom');

// Add BEFORE other routes to capture all requests
app.use(metricsMiddleware);

// Expose /metrics endpoint for Prometheus
app.use('/metrics', metricsRouter);
```

### 3. What Gets Measured

| Metric | Type | Description |
|:---|:---|:---|
| `solvy_http_requests_total` | Counter | Total requests by method, route, status |
| `solvy_http_request_duration_seconds` | Histogram | Request latency distribution |
| `solvy_active_members` | Gauge | Unique members in last 30 days |
| `solvy_total_volume` | Gauge | Total transaction volume (USD) |
| `solvy_interchange_total` | Gauge | Total interchange revenue |
| `solvy_member_pool_usd` | Gauge | 70% member pool share |
| `solvy_support_tickets_open` | Gauge | Open support tickets |
| `solvy_nodejs_*` | Various | Node.js runtime metrics (default) |

### 4. Verify

```bash
curl http://localhost:3000/metrics | grep solvy_
```

---

## 🔒 Security

### What's Protected

| Service | Access Method |
|:---|:---|
| Grafana | HTTPS + nginx basic auth + Grafana login |
| Prometheus | localhost only (not exposed externally) |
| Alertmanager | localhost only |
| Blackbox | localhost only |
| Node Exporter | localhost only |

### Firewall Rules

```bash
# Ensure only 22, 80, 443 are public
ufw default deny incoming
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw enable

# Monitoring ports are NOT exposed to the internet
```

### SSL Certificates

Grafana uses the same Let's Encrypt certificate as the main site:

```bash
# Already set up during nginx config
certbot --nginx -d grafana.ebl.beauty
```

---

## 🛠️ Operations

### Check Service Status

```bash
# All Docker services
cd /opt/monitoring && docker compose ps

# Node Exporter
systemctl status node-exporter

# View logs
cd /opt/monitoring && docker compose logs -f prometheus
cd /opt/monitoring && docker compose logs -f grafana
cd /opt/monitoring && docker compose logs -f alertmanager
```

### Reload Prometheus Config (No Restart)

```bash
curl -X POST http://localhost:9090/-/reload
```

### Update Dashboard

1. Edit `grafana/provisioning/dashboards/solvy-dashboard.json`
2. Run: `cd /opt/monitoring && docker compose restart grafana`

### Add a New Probe Target

Edit `prometheus/prometheus.yml` → add target under `blackbox-http` → reload:

```bash
curl -X POST http://localhost:9090/-/reload
```

### Backup Grafana

```bash
# Dashboards and data are in Docker volume
# Backup the volume
docker run --rm -v solvy-monitoring_grafana-data:/source -v /backup:/backup alpine tar czf /backup/grafana-$(date +%Y%m%d).tar.gz -C /source .
```

---

## 📈 Metric Retention

Prometheus is configured to keep **30 days** of metrics:

```yaml
# In docker-compose.yml
command:
  - "--storage.tsdb.retention.time=30d"
```

To change:
```bash
cd /opt/monitoring
# Edit docker-compose.yml, then:
docker compose up -d prometheus
```

---

## 🆘 Troubleshooting

### Grafana shows "No Data"

1. Check Prometheus targets: `http://localhost:9090/targets`
2. Verify Node Exporter: `curl http://localhost:9100/metrics`
3. Check firewall: `ufw status`

### Alerts Not Sending Email

1. Check Alertmanager logs: `docker compose logs alertmanager`
2. Verify SMTP settings in `alertmanager/alertmanager.yml`
3. Test MailCow SMTP manually:
   ```bash
   swaks --to sean@ebl.beauty --from alerts@ebl.beauty --server mail.ebl.beauty:587 --auth-user alerts@ebl.beauty
   ```

### Blackbox Probes Failing

1. Check if endpoints are actually reachable from VPS:
   ```bash
   curl -I https://ebl.beauty/health
   ```
2. Check Blackbox logs: `docker compose logs blackbox`

### Prometheus Won't Start

1. Check config syntax:
   ```bash
   docker run --rm -v $(pwd)/prometheus:/etc/prometheus prom/prometheus:v2.53.0 --config.file=/etc/prometheus/prometheus.yml --dry-run
   ```
2. Check logs: `docker compose logs prometheus`

---

## 🎯 Roadmap

- [ ] Loki integration for log aggregation
- [ ] Discord webhook notifications (uncomment in alertmanager.yml)
- [ ] Uptime SLA dashboard panel
- [ ] Geographic latency monitoring (multi-region probes)
- [ ] Mobile alerting via Telegram bot

---

**SOLVY Ecosystem™ — Product of SA Nathan LLC**  
*Observe everything. Trust the data. Data sovereign by design.*
