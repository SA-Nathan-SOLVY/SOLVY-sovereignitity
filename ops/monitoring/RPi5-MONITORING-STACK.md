# Raspberry Pi 5 Monitoring Stack
## SOLVY Infrastructure Monitoring

**Hardware:** Raspberry Pi 5 (8GB RAM recommended)  
**OS:** Raspberry Pi OS (64-bit)  
**Network:** Tailscale VPN  
**Purpose:** Monitor all SOLVY infrastructure (VPS, Gitea, MailCow, Huginn)

---

## Overview

This monitoring stack provides:

- 📊 **Grafana** - Beautiful dashboards and visualization
- 📈 **Prometheus** - Time-series data collection
- 🔄 **PM2** - Node.js process monitoring
- 🌐 **Node Exporter** - System metrics
- 🐳 **cAdvisor** - Docker container metrics
- 🔔 **AlertManager** - Alert routing and management
- 🔒 **Tailscale** - Secure VPN access

**Monitored Systems:**
- VPS (Gitea, MailCow, Huginn)
- Raspberry Pi 5 itself
- Docker containers
- System resources
- Application logs

---

## Hardware Setup

### Raspberry Pi 5 Requirements

| Component | Specification |
|-----------|---------------|
| Board | Raspberry Pi 5 (8GB) |
| Storage | 128GB+ SSD via USB or NVMe HAT |
| Power | Official Pi 5 power supply (27W) |
| Cooling | Active cooler or fan case |
| Network | Ethernet + WiFi |

### Why Pi 5?
- Low power consumption (~5-8W idle)
- Always-on monitoring
- Isolated from production systems
- Cost-effective
- Tailscale for secure remote access

---

## Installation

### Step 1: Prepare Raspberry Pi OS

```bash
# Download Raspberry Pi Imager
# https://www.raspberrypi.com/software/

# Flash Raspberry Pi OS (64-bit) to SSD
# Enable SSH and set credentials in Imager

# Boot and update
sudo apt update && sudo apt full-upgrade -y
sudo reboot
```

### Step 2: Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add pi user to docker group
sudo usermod -aG docker pi

# Install Docker Compose
sudo apt install -y docker-compose-plugin

# Verify
docker --version
docker compose version

# Reboot to apply group changes
sudo reboot
```

### Step 3: Install Tailscale

```bash
# Install Tailscale
curl -fsSL https://tailscale.com/install.sh | sh

# Authenticate
sudo tailscale up

# You'll see a link - open in browser and login
# Note the Tailscale IP (e.g., 100.x.x.x)

# Enable SSH over Tailscale
sudo tailscale up --ssh

# Verify
ip addr show tailscale0
tailscale status
```

**Save the Tailscale IP!** You'll use it to access Grafana securely.

### Step 4: Create Monitoring Directory Structure

```bash
# Create directory
sudo mkdir -p /opt/monitoring
cd /opt/monitoring
sudo chown -R pi:pi /opt/monitoring

# Create subdirectories
mkdir -p {prometheus,grafana,alertmanager,pm2,logs}
```

---

## Monitoring Stack Setup

### Step 5: Prometheus Configuration

```bash
cd /opt/monitoring/prometheus
nano prometheus.yml
```

Add:

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']

rule_files:
  - /etc/prometheus/rules/*.yml

scrape_configs:
  # Prometheus itself
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  # Raspberry Pi (Node Exporter)
  - job_name: 'raspberry-pi'
    static_configs:
      - targets: ['node-exporter:9100']

  # VPS - Gitea
  - job_name: 'vps-gitea'
    static_configs:
      - targets: ['vps-ip:9100']
    relabel_configs:
      - source_labels: [__address__]
        target_label: instance
        replacement: 'vps-gitea'

  # VPS - Docker Containers
  - job_name: 'vps-docker'
    static_configs:
      - targets: ['vps-ip:8080']
    relabel_configs:
      - source_labels: [__address__]
        target_label: instance
        replacement: 'vps-docker'

  # MailCow (if exposing metrics)
  - job_name: 'mailcow'
    static_configs:
      - targets: ['mail.solvy.coop:9099']

  # Huginn (if exposing metrics)
  - job_name: 'huginn'
    static_configs:
      - targets: ['automation.solvy.coop:3000']

  # cAdvisor (Docker metrics)
  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']
```

Create alert rules:

```bash
mkdir -p rules
nano rules/alerts.yml
```

Add:

```yaml
groups:
  - name: solvy-alerts
    rules:
      # High CPU alert
      - alert: HighCPUUsage
        expr: 100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage detected"
          description: "CPU usage is above 80% for more than 5 minutes"

      # High memory alert
      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100 > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage detected"
          description: "Memory usage is above 85%"

      # Disk space alert
      - alert: LowDiskSpace
        expr: (node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"}) * 100 < 10
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Low disk space"
          description: "Disk space is below 10%"

      # Service down alert
      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service is down"
          description: "{{ $labels.job }} is down"

      # Gitea down
      - alert: GiteaDown
        expr: probe_success{job="gitea-http"} == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Gitea is unreachable"
```

### Step 6: Docker Compose for Monitoring Stack

```bash
cd /opt/monitoring
nano docker-compose.yml
```

Add:

```yaml
version: '3.8'

services:
  # Prometheus - Metrics collection
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    restart: unless-stopped
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'
      - '--web.console.libraries=/usr/share/prometheus/console_libraries'
      - '--web.console.templates=/usr/share/prometheus/consoles'
      - '--web.enable-lifecycle'
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - ./prometheus/rules:/etc/prometheus/rules:ro
      - prometheus_data:/prometheus
    networks:
      - monitoring

  # Grafana - Visualization
  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    restart: unless-stopped
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=solvy_monitoring_2025
      - GF_USERS_ALLOW_SIGN_UP=false
      - GF_SERVER_ROOT_URL=https://monitoring.solvy.coop
      - GF_INSTALL_PLUGINS=grafana-clock-panel,grafana-simple-json-datasource
    ports:
      - "3000:3000"
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning:ro
    networks:
      - monitoring
    depends_on:
      - prometheus

  # Node Exporter - System metrics
  node-exporter:
    image: prom/node-exporter:latest
    container_name: node-exporter
    restart: unless-stopped
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    networks:
      - monitoring

  # cAdvisor - Docker metrics
  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    container_name: cadvisor
    restart: unless-stopped
    privileged: true
    devices:
      - /dev/kmsg:/dev/kmsg
    ports:
      - "8080:8080"
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker:/var/lib/docker:ro
      - /cgroup:/cgroup:ro
    networks:
      - monitoring

  # AlertManager - Alert handling
  alertmanager:
    image: prom/alertmanager:latest
    container_name: alertmanager
    restart: unless-stopped
    ports:
      - "9093:9093"
    volumes:
      - ./alertmanager/alertmanager.yml:/etc/alertmanager/alertmanager.yml:ro
      - alertmanager_data:/alertmanager
    networks:
      - monitoring

  # Blackbox Exporter - Endpoint probing
  blackbox-exporter:
    image: prom/blackbox-exporter:latest
    container_name: blackbox-exporter
    restart: unless-stopped
    ports:
      - "9115:9115"
    volumes:
      - ./blackbox/blackbox.yml:/etc/blackbox_exporter/config.yml:ro
    networks:
      - monitoring

volumes:
  prometheus_data:
  grafana_data:
  alertmanager_data:

networks:
  monitoring:
    driver: bridge
```

### Step 7: AlertManager Configuration

```bash
mkdir -p alertmanager
nano alertmanager/alertmanager.yml
```

Add:

```yaml
global:
  smtp_smarthost: 'mail.solvy.coop:587'
  smtp_from: 'alerts@solvy.coop'
  smtp_auth_username: 'alerts@solvy.coop'
  smtp_auth_password: 'your_email_password'

route:
  group_by: ['alertname', 'severity']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'team-emails'
  routes:
    - match:
        severity: critical
      receiver: 'critical-alerts'
      continue: true

receivers:
  - name: 'team-emails'
    email_configs:
      - to: 'team@solvy.coop'
        subject: 'SOLVY Monitoring Alert: {{ .GroupLabels.alertname }}'
        body: |
          {{ range .Alerts }}
          Alert: {{ .Annotations.summary }}
          Description: {{ .Annotations.description }}
          Instance: {{ .Labels.instance }}
          {{ end }}

  - name: 'critical-alerts'
    email_configs:
      - to: 'sean@solvy.coop, nathan@solvy.coop'
        subject: '🚨 CRITICAL: {{ .GroupLabels.alertname }}'

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'instance']
```

### Step 8: Blackbox Exporter Configuration

```bash
mkdir -p blackbox
nano blackbox/blackbox.yml
```

Add:

```yaml
modules:
  http_2xx:
    prober: http
    timeout: 5s
    http:
      method: GET
      valid_status_codes: [200, 301, 302]
      follow_redirects: true
      fail_if_ssl: false

  http_post_2xx:
    prober: http
    http:
      method: POST

tcp_connect:
  prober: tcp
  timeout: 5s

icmp:
  prober: icmp
  timeout: 5s
```

### Step 9: Start Monitoring Stack

```bash
cd /opt/monitoring

# Pull images
docker compose pull

# Start services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

---

## PM2 Setup (Application Monitoring)

### Install PM2

```bash
# Install Node.js first if not installed
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Setup PM2 startup
pm2 startup systemd
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u pi --hp /home/pi

# Save PM2 config
pm2 save
```

### PM2 Monitoring Script

```bash
mkdir -p /opt/monitoring/pm2
cd /opt/monitoring/pm2
nano monitor.js
```

Add:

```javascript
// Simple PM2 monitoring endpoint
const http = require('http');
const { exec } = require('child_process');

const PORT = 3001;

const server = http.createServer((req, res) => {
  if (req.url === '/metrics') {
    exec('pm2 jlist', (error, stdout) => {
      if (error) {
        res.writeHead(500);
        res.end('Error');
        return;
      }
      
      const processes = JSON.parse(stdout);
      let metrics = '';
      
      processes.forEach(proc => {
        const name = proc.name;
        const status = proc.pm2_env.status === 'online' ? 1 : 0;
        const memory = proc.monit.memory;
        const cpu = proc.monit.cpu;
        
        metrics += `pm2_process_status{name="${name}"} ${status}\n`;
        metrics += `pm2_process_memory{name="${name}"} ${memory}\n`;
        metrics += `pm2_process_cpu{name="${name}"} ${cpu}\n`;
      });
      
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(metrics);
    });
  } else {
    res.writeHead(200);
    res.end('PM2 Monitor');
  }
});

server.listen(PORT, () => {
  console.log(`PM2 Monitor running on port ${PORT}`);
});
```

Run with PM2:

```bash
pm2 start monitor.js --name pm2-monitor
pm2 save
```

Add to Prometheus scrape config:

```yaml
- job_name: 'pm2'
  static_configs:
    - targets: ['localhost:3001']
```

---

## Grafana Configuration

### Access Grafana

```
URL: http://TAILSCALE_IP:3000
Username: admin
Password: solvy_monitoring_2025
```

### Add Data Source

1. Configuration → Data Sources → Add data source
2. Select **Prometheus**
3. URL: `http://prometheus:9090`
4. Save & Test

### Import Dashboards

Import these dashboards (ID numbers):

| Dashboard | ID | Purpose |
|-----------|-----|---------|
| Node Exporter Full | 1860 | System metrics |
| Docker Monitoring | 193 | Container metrics |
| Prometheus 2.0 | 3662 | Prometheus stats |
| Blackbox Exporter | 7587 | Endpoint monitoring |

Steps:
1. Create → Import
2. Enter dashboard ID
3. Select Prometheus data source
4. Import

---

## Tailscale Access

### Secure Access Setup

On Raspberry Pi:

```bash
# Enable Tailscale SSH
sudo tailscale up --ssh --accept-dns

# Check IP
tailscale ip -4
# Note: 100.x.x.x
```

On your Mac:

```bash
# Install Tailscale
brew install tailscale

# Login
sudo tailscale up

# SSH to Pi (no password needed with Tailscale SSH)
ssh pi@100.x.x.x

# Or access Grafana
open http://100.x.x.x:3000
```

### Tailscale ACL (Optional Security)

In Tailscale Admin Console:

```json
{
  "acls": [
    {
      "action": "accept",
      "src": ["group:solvy-team"],
      "dst": ["100.x.x.x:22", "100.x.x.x:3000"]
    }
  ]
}
```

---

## Maintenance

### Daily Checks

```bash
# Check all services
docker compose ps

# Check disk space
df -h

# Check memory
free -h

# Check CPU temp (Pi specific)
vcgencmd measure_temp
```

### Weekly Updates

```bash
# Update containers
cd /opt/monitoring
docker compose pull
docker compose up -d

# Clean up old images
docker system prune -f

# Update Pi
sudo apt update && sudo apt upgrade -y

# Reboot if needed
sudo reboot
```

### Backup

```bash
# Backup script
#!/bin/bash
BACKUP_DIR="/backup/monitoring/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

# Backup Prometheus data
docker run --rm -v monitoring_prometheus_data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/prometheus.tar.gz -C /data .

# Backup Grafana
docker run --rm -v monitoring_grafana_data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/grafana.tar.gz -C /data .

# Backup configs
cp -r /opt/monitoring/prometheus $BACKUP_DIR/
cp -r /opt/monitoring/alertmanager $BACKUP_DIR/
cp /opt/monitoring/docker-compose.yml $BACKUP_DIR/

echo "Backup complete: $BACKUP_DIR"
```

Add to crontab:
```bash
0 2 * * 0 /opt/monitoring/backup.sh
```

---

## Troubleshooting

### High CPU on Pi

```bash
# Check what's using CPU
top

# Check Docker stats
docker stats

# Restart heavy containers
docker compose restart cadvisor
```

### Grafana Not Accessible

```bash
# Check container
docker compose logs grafana

# Check if port is listening
sudo netstat -tlnp | grep 3000

# Restart
docker compose restart grafana
```

### Prometheus Not Scraping

```bash
# Check targets
open http://PI_IP:9090/targets

# Check config
promtool check config /etc/prometheus/prometheus.yml

# Reload config
curl -X POST http://localhost:9090/-/reload
```

---

## Resources

- **Grafana Docs:** https://grafana.com/docs/
- **Prometheus Docs:** https://prometheus.io/docs/
- **PM2 Docs:** https://pm2.keymetrics.io/docs/
- **Tailscale:** https://tailscale.com/kb/
- **Pi Monitoring:** https://github.com/oijkn/Docker-Raspberry-PI-Monitoring

---

**Setup Date:** _______________  
**Admin:** _______________  
**Tailscale IP:** _______________  
**Grafana URL:** http://100.x.x.x:3000
