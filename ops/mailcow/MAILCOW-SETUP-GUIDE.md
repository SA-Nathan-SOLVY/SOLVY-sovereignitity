# MailCow Mail Exchange Server Setup
## SOLVY Cooperative Email Infrastructure

**Purpose:** Self-hosted email server for SOLVY team and members  
**Platform:** Docker on VPS or dedicated server  
**Domain:** mail.solvy.coop / solvy.coop  

---

## Overview

MailCow provides:
- 📧 Complete email server (SMTP, IMAP, POP3)
- 🌐 Webmail (SOGo)
- 🔐 DKIM, SPF, DMARC security
- 📱 Mobile device support
- 🔒 TLS encryption
- 🗂️ Calendar & contacts

---

## Prerequisites

### Hardware Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 2 cores | 4+ cores |
| RAM | 4 GB | 8+ GB |
| Storage | 50 GB | 100+ GB |
| Network | 100 Mbps | 1 Gbps |

### Software Requirements
- Docker 20.10+
- Docker Compose 2.x
- Linux (Ubuntu 22.04 LTS recommended)
- Valid domain name (solvy.coop)
- Static IP address

### DNS Requirements

Configure these DNS records BEFORE installation:

```dns
; A Records
mail.solvy.coop.     A     YOUR_SERVER_IP
webmail.solvy.coop.  A     YOUR_SERVER_IP

; MX Record
solvy.coop.          MX    10 mail.solvy.coop.

; SPF Record
solvy.coop.          TXT   "v=spf1 mx ~all"

; DKIM & DMARC - Will be added after setup
```

---

## Installation

### Step 1: Prepare Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y docker.io docker-compose-plugin git curl

# Enable Docker
sudo systemctl enable docker
sudo systemctl start docker

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### Step 2: Clone MailCow

```bash
# Create directory
sudo mkdir -p /opt/mailcow
cd /opt/mailcow

# Clone repository
sudo git clone https://github.com/mailcow/mailcow-dockerized

# Fix permissions
sudo chown -R $USER:$USER mailcow-dockerized
cd mailcow-dockerized
```

### Step 3: Configure MailCow

```bash
# Generate configuration
./generate_config.sh

# You'll be asked:
# - Mail server hostname: mail.solvy.coop
# - Timezone: America/New_York
# - HTTP bind port: 80
# - HTTPS bind port: 443
```

Edit configuration:

```bash
# Edit mailcow.conf
nano mailcow.conf

# Important settings to verify:
MAILCOW_HOSTNAME=mail.solvy.coop
TZ=America/New_York
HTTP_PORT=80
HTTPS_PORT=443
HTTP_BIND=0.0.0.0
HTTPS_BIND=0.0.0.0

# Optional: Disable ClamAV if memory constrained
SKIP_CLAMD=y

# Optional: Disable Solr if memory constrained
SKIP_SOLR=y
```

### Step 4: Start MailCow

```bash
# Pull images
docker compose pull

# Start services
docker compose up -d

# Watch startup (optional)
docker compose logs -f
```

Wait for "mailcow is ready" message (can take 5-10 minutes on first start).

### Step 5: Access Admin Panel

```
URL: https://mail.solvy.coop
Username: admin
Password: Check with: docker compose logs --tail=100 mailcowui | grep -i password
```

**Change admin password immediately!**

---

## Post-Installation Configuration

### Step 1: Complete DNS Setup

Add these records after MailCow is running:

```dns
; DKIM - Generated in MailCow admin panel
default._domainkey.solvy.coop.  TXT  "v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQ..."

; DMARC
_dmarc.solvy.coop.  TXT  "v=DMARC1; p=quarantine; rua=mailto:dmarc@solvy.coop"

; Autodiscover (Outlook)
_autodiscover._tcp.solvy.coop.  SRV  0 0 443 mail.solvy.coop.

; Autoconfig (Thunderbird)
autoconfig.solvy.coop.  CNAME  mail.solvy.coop.
autodiscover.solvy.coop.  CNAME  mail.solvy.coop.
```

### Step 2: Create Mail Domains

1. Login to https://mail.solvy.coop
2. Configuration → Mail Setup → Add domain
3. Enter: `solvy.coop`
4. Enable DKIM signing
5. Save

### Step 3: Create Mailboxes

Create mailboxes for team:

| Mailbox | Purpose | Quota |
|---------|---------|-------|
| sean@solvy.coop | SCRUM Master | 10 GB |
| nathan@solvy.coop | Tech Lead | 10 GB |
| team@solvy.coop | Distribution list | N/A |
| support@solvy.coop | Support | 20 GB |
| noreply@solvy.coop | Automated | 1 GB |

---

## Security Hardening

### 1. Firewall Configuration

```bash
# UFW rules
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw allow 25/tcp      # SMTP
sudo ufw allow 587/tcp     # Submission
sudo ufw allow 993/tcp     # IMAPS
sudo ufw allow 995/tcp     # POP3S
sudo ufw enable
```

### 2. SSL/TLS Certificates

MailCow uses Let's Encrypt automatically. Verify:

```bash
# Check certificate status
docker compose exec acme-mailcow /usr/local/bin/acme.sh --list

# Force renewal if needed
docker compose exec acme-mailcow /usr/local/bin/acme.sh --cron
```

### 3. Fail2Ban

```bash
# Edit fail2ban configuration
nano data/conf/fail2ban/fail2ban.conf

# Enable and configure jails
docker compose restart fail2ban-mailcow
```

### 4. Backup Configuration

```bash
# Create backup directory
mkdir -p /backup/mailcow

# Add to crontab
crontab -e

# Add line:
0 2 * * * cd /opt/mailcow/mailcow-dockerized && ./helper-scripts/backup_and_restore.sh backup all
```

---

## Monitoring

### Health Checks

```bash
# Check all services
docker compose ps

# Check logs
docker compose logs --tail=100

# Check specific service
docker compose logs postfix-mailcow

# Check mail queue
docker compose exec postfix-mailcow postqueue -p
```

### Metrics

MailCow exports Prometheus metrics:

```
http://mail.solvy.coop:9099/metrics
```

Add to Prometheus config:

```yaml
scrape_configs:
  - job_name: 'mailcow'
    static_configs:
      - targets: ['mail.solvy.coop:9099']
```

---

## Maintenance

### Daily

```bash
# Check disk space
df -h

# Check mail queue
docker compose exec postfix-mailcow postqueue -p | tail -1

# Check for errors
docker compose logs --tail=50 | grep -i error
```

### Weekly

```bash
# Update MailCow
cd /opt/mailcow/mailcow-dockerized
docker compose pull
docker compose up -d

# Clean up old images
docker system prune -f

# Verify backups
ls -lh /backup/mailcow/
```

### Monthly

```bash
# Full backup test
# Check SSL certificate expiry
docker compose exec acme-mailcow /usr/local/bin/acme.sh --list

# Review logs for issues
# Update server packages
sudo apt update && sudo apt upgrade -y
```

---

## Troubleshooting

### Can't Send Email

```bash
# Check postfix logs
docker compose logs postfix-mailcow --tail=100

# Check DNS
dig MX solvy.coop
dig TXT solvy.coop

# Test SMTP
telnet mail.solvy.coop 587

# Check RBL (blacklist)
# Use: https://mxtoolbox.com/blacklists.aspx
```

### Can't Receive Email

```bash
# Check dovecot logs
docker compose logs dovecot-mailcow --tail=100

# Check port 25 is open
sudo netstat -tlnp | grep :25

# Test from external
# Use: https://mxtoolbox.com/diagnostic.aspx
```

### SSL Certificate Issues

```bash
# Force renewal
docker compose exec acme-mailcow /usr/local/bin/acme.sh --cron --force

# Check certificate
echo | openssl s_client -servername mail.solvy.coop -connect mail.solvy.coop:443 2>/dev/null | openssl x509 -noout -dates
```

---

## Integration with SOLVY

### User Registration

When new SOLVY member registers:
1. Create mailbox in MailCow
2. Send credentials via secure channel
3. User can access webmail at https://mail.solvy.coop/SOGo

### API Access

```bash
# MailCow API documentation
# https://mail.solvy.coop/api

# Example: Create mailbox
curl -X POST \
  https://mail.solvy.coop/api/v1/add/mailbox \
  -H 'X-API-Key: YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "local_part": "newuser",
    "domain": "solvy.coop",
    "name": "New User",
    "quota": "1073741824",
    "password": "temppass123",
    "password2": "temppass123"
  }'
```

---

## Resources

- **MailCow Docs:** https://docs.mailcow.email/
- **Admin Panel:** https://mail.solvy.coop
- **Webmail:** https://mail.solvy.coop/SOGo
- **API Docs:** https://mail.solvy.coop/api
- **Community:** https://github.com/mailcow/mailcow-dockerized/discussions

---

**Setup Date:** _______________  
**Admin:** _______________  
**Domain:** solvy.coop
