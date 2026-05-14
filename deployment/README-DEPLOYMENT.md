# SOLVY Ecosystem™ — Deployment Guide

> **Target:** Hetzner VPS (Ubuntu 22.04) at `46.62.235.95`  
> **Domain:** `ebl.beauty`  
> **Stack:** Node.js 20 + Express + SQLite + Nginx + PM2

---

## 📋 Prerequisites

- A Hetzner VPS running Ubuntu 22.04
- A domain name pointing to your VPS (`ebl.beauty` → `46.62.235.95`)
- SSH access to the VPS
- Your local machine with the SOLVY codebase

---

## 🚀 Quick Start (One-Line Deploy)

If you've already run `setup.sh` and configured `.env`:

```bash
ssh root@46.62.235.95
cd /var/www/solvy
./scripts/deploy.sh
```

---

## 📁 Deployment Package Structure

```
deployment/
├── backend/              # Copy of solvy-platform/server/
├── frontend/             # Copy of solvy-platform/ (HTML/JS/CSS)
├── scripts/
│   ├── setup.sh          # One-time server provisioning
│   ├── deploy.sh         # Deploy or update the application
│   └── nginx-config.conf # Nginx reverse proxy config
├── solvy.service         # Systemd service file (alternative to PM2)
└── README-DEPLOYMENT.md  # This file
```

---

## 🔧 Step 1: Prepare the Deployment Package (Local Machine)

### 1.1 Organize Files

From your project root, create the deployment structure:

```bash
cd /Users/smayone/Sovereignitity-Stack

# Create deployment directories
mkdir -p deployment/backend deployment/frontend

# Copy backend (Node.js server)
cp -r solvy-platform/server/* deployment/backend/

# Copy frontend files
cp solvy-platform/welcome.html deployment/frontend/index.html
cp solvy-platform/privacy-sovereignty.html deployment/frontend/
cp solvy-platform/banking/index.html deployment/frontend/banking.html
cp solvy-platform/ai-chat-demo.html deployment/frontend/
cp -r solvy-platform/js deployment/frontend/
cp -r solvy-platform/css deployment/frontend/ 2>/dev/null || true
cp -r solvy-platform/assets deployment/frontend/ 2>/dev/null || true
```

### 1.2 Configure Environment Variables

```bash
cd deployment/backend
cp .env.example .env
nano .env  # Edit with your production secrets
```

**Required `.env` values:**

```bash
PORT=3000
DATABASE_URL=sqlite:/var/www/solvy/data/solvy.sqlite
ADMIN_API_KEY=GENERATE_A_STRONG_RANDOM_KEY_HERE
MEMBER_HASH_SALT=solvy_aggregation_salt_2025
MAILCOW_HOST=mail.ebl.beauty
MAILCOW_USER=noreply@ebl.beauty
MAILCOW_PASS=your-mailcow-password
SUPPORT_EMAIL=support@ebl.beauty
SUPPORT_FROM=noreply@ebl.beauty
SUPPORT_RECIPIENTS=sean@solvy.cards,evergreen@solvy.cards
ALLOWED_ORIGINS=https://ebl.beauty,https://www.ebl.beauty
NODE_ENV=production
```

> ⚠️ **Generate a strong admin key:**
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

---

## 🖥️ Step 2: Upload to VPS

### Option A: rsync (Recommended)

```bash
cd /Users/smayone/Sovereignitity-Stack
rsync -avz --delete deployment/ root@46.62.235.95:/root/solvy-deployment/
```

### Option B: scp

```bash
cd /Users/smayone/Sovereignitity-Stack
tar czf solvy-deployment.tar.gz deployment/
scp solvy-deployment.tar.gz root@46.62.235.95:/root/
ssh root@46.62.235.95 "tar xzf /root/solvy-deployment.tar.gz && mv deployment /root/solvy-deployment"
```

---

## ⚙️ Step 3: Server Setup (Run Once)

SSH into your VPS and run the setup script:

```bash
ssh root@46.62.235.95
cd /root/solvy-deployment
chmod +x scripts/setup.sh
./scripts/setup.sh
```

This will:
- Update Ubuntu packages
- Install Node.js 20, npm, git, nginx, sqlite3
- Install PM2 (process manager)
- Create the `/var/www/solvy` directory structure
- Configure UFW firewall (allow SSH, HTTP, HTTPS)
- Configure Fail2Ban
- Set up log rotation

---

## 🚀 Step 4: Deploy the Application

```bash
ssh root@46.62.235.95
cd /root/solvy-deployment
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

This will:
- Copy backend files to `/var/www/solvy/backend/`
- Copy frontend files to `/var/www/solvy/frontend/`
- Install Node.js dependencies
- Configure Nginx
- Start/restart the backend with PM2
- Run health checks

---

## 🔒 Step 5: SSL with Let's Encrypt

```bash
ssh root@46.62.235.95
certbot --nginx -d ebl.beauty -d www.ebl.beauty
```

Follow the prompts. Certbot will:
- Obtain SSL certificates
- Automatically update the Nginx config for HTTPS
- Set up auto-renewal

**Test auto-renewal:**
```bash
certbot renew --dry-run
```

---

## ✅ Step 6: Verify Deployment

### Backend Health Check
```bash
curl http://localhost:3000/health
# Expected: {"status":"ok","timestamp":"...","service":"solvy-metrics-api"}
```

### Nginx Proxy Check
```bash
curl http://localhost/health
# Expected: Same response (proxied through nginx)
```

### API Endpoints
```bash
# Test metrics summary (requires API key)
curl -H "Authorization: Bearer YOUR_ADMIN_API_KEY" \
  http://localhost:3000/api/metrics/summary

# Test support request
curl -X POST http://localhost:3000/api/support/request \
  -H "Content-Type: application/json" \
  -d '{"memberEmail":"test@example.com","message":"Test"}'
```

### Public URLs (after DNS propagation)
- **Landing page:** `https://ebl.beauty`
- **Back office:** `https://ebl.beauty/back-office.html`
- **Privacy page:** `https://ebl.beauty/privacy-sovereignty.html`
- **Health check:** `https://ebl.beauty/health`

---

## 📊 Monitoring & Logs

### PM2 Commands
```bash
pm2 status              # View all processes
pm2 logs solvy-api      # View application logs
pm2 monit               # Real-time monitoring dashboard
pm2 restart solvy-api   # Restart backend
pm2 reload solvy-api    # Zero-downtime reload
```

### Nginx Logs
```bash
tail -f /var/www/solvy/logs/nginx-access.log
tail -f /var/www/solvy/logs/nginx-error.log
```

### System Logs
```bash
journalctl -u solvy -f          # If using systemd instead of PM2
systemctl status nginx
```

---

## 🔄 Updating the Application

When you make code changes locally:

```bash
# 1. On your local machine, re-organize and upload
cd /Users/smayone/Sovereignitity-Stack
rsync -avz --delete deployment/ root@46.62.235.95:/root/solvy-deployment/

# 2. On the VPS, re-run deploy
ssh root@46.62.235.95 "cd /root/solvy-deployment && ./scripts/deploy.sh"
```

The deploy script automatically:
- Backs up the SQLite database
- Copies new files
- Installs dependencies
- Restarts the backend
- Reloads nginx

---

## 🛠️ Troubleshooting

### Backend won't start
```bash
pm2 logs solvy-api
# Check for missing .env variables or port conflicts
```

### Nginx errors
```bash
nginx -t                    # Test configuration
systemctl status nginx      # Check service status
tail -f /var/log/nginx/error.log
```

### Database issues
```bash
ls -la /var/www/solvy/data/     # Check permissions
sqlite3 /var/www/solvy/data/solvy.sqlite ".tables"  # Verify database
```

### SSL certificate issues
```bash
certbot certificates        # List certificates
certbot renew --force-renewal  # Force renewal
```

---

## 🔐 Security Checklist

- [ ] Changed default `ADMIN_API_KEY` (not `admin123`)
- [ ] Set strong `MAILCOW_PASS`
- [ ] Configured `SUPPORT_RECIPIENTS` with real emails
- [ ] UFW firewall enabled (only 22, 80, 443 open)
- [ ] Fail2Ban running
- [ ] SSL certificate installed and auto-renewing
- [ ] No `.env` file committed to git
- [ ] No secrets in frontend code
- [ ] SQLite database not accessible via web

---

## 📦 Alternative: Systemd Instead of PM2

If you prefer systemd over PM2:

```bash
# Copy the service file
cp /root/solvy-deployment/solvy.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable solvy
systemctl start solvy

# Check status
systemctl status solvy
journalctl -u solvy -f
```

> Note: The deploy script uses PM2 by default. If using systemd, update `deploy.sh` to use `systemctl restart solvy` instead of `pm2 restart`.

---

## 🗺️ Architecture Summary

```
Internet
    │
    ▼
┌─────────────────────────────────────┐
│  Cloudflare / DNS (ebl.beauty)      │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│  Hetzner VPS (46.62.235.95)         │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  Nginx (443/80)             │    │
│  │  • SSL termination          │    │
│  │  • Static files (/frontend) │    │
│  │  • API proxy (/api → :3000) │    │
│  └─────────────────────────────┘    │
│           │                         │
│  ┌────────┴──────────────────┐      │
│  │  Node.js (localhost:3000) │      │
│  │  • Express API            │      │
│  │  • SQLite (/data)         │      │
│  │  • Nodemailer → MailCow   │      │
│  └─────────────────────────────┘    │
│                                     │
│  Data: /var/www/solvy/data/         │
│  Logs: /var/www/solvy/logs/         │
└─────────────────────────────────────┘
```

---

## 📞 Support

- **Deployment issues:** Check logs first (`pm2 logs`, `nginx -t`, `journalctl`)
- **Code issues:** Review the AGENTS.md in the project root
- **Infrastructure:** See `ops/` directory in the project for additional scripts

**SOLVY Ecosystem™ — Product of SA Nathan LLC**  
*Data Sovereign by Design*
