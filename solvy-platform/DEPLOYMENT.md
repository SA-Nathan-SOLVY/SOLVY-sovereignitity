# SOLVY Platform Deployment Guide

## Overview

This document provides instructions for deploying the SOLVY platform to production environments.

**Production Setup (matches Replit):**
- **Domains:** `ebl.beauty`, `solvy.cards`, `solvy-sovereignitity--smayone.replit.app`
- **Compute:** 2 vCPU / 4 GiB RAM / Autoscale
- **Database:** PostgreSQL 15 (production)
- **Visibility:** Public

## Project Structure

```
solvy-platform/
├── index.html                    # Main landing page
├── about.html                    # About page
├── heritage.html                 # Heritage page
├── manifesto.html                # Manifesto page
├── banking/                      # Member banking portal
│   └── index.html
├── card/
│   ├── solvy-card.html          # Card interface
│   └── card-customizer.html     # Card customization
├── sps-pilot/
│   └── index.html               # SPS replenishment feed
├── payment/
│   └── payment.html             # Payment processing
├── invoice/
│   └── invoice-management.html  # Invoice management
├── remittance/
│   └── remittance.html          # Remittance
├── community/
│   └── communities.html         # Community
├── decidey/
│   └── decidey-ngo.html         # DECIDEY NGO
├── operations/
│   └── operations-dashboard.html # Operations
├── api/                          # Backend API
├── backend/                      # Node.js backend (production)
│   ├── src/
│   └── package.json
├── frontend/                     # React frontend (production)
│   ├── src/
│   └── package.json
├── assets/                       # Static assets
├── Dockerfile                    # Docker configuration
├── docker-compose.yml            # Docker Compose with PostgreSQL
├── nginx-proxy.conf              # Nginx multi-domain config
└── DEPLOYMENT.md                 # This file
```

## Production Domains

| Domain | Purpose |
|--------|---------|
| `ebl.beauty` | Main SOLVY Ecosystem platform |
| `solvy.cards` | SOLVY Card™ product pages |
| `solvy-sovereignitity--smayone.replit.app` | Replit mirror |
| `api.ebl.beauty` | API gateway |

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Domains
DOMAIN=ebl.beauty
DOMAIN_CARDS=solvy.cards
DOMAIN_REPLIT=solvy-sovereignitity--smayone.replit.app

# Database
DB_PASSWORD=your_secure_password
DATABASE_URL=postgresql://solvy:your_password@db:5432/solvy

# Unit.co Banking
UNIT_API_TOKEN=your_token
UNIT_API_URL=https://api.s.unit.sh
UNIT_ORG_ID=your_org_id

# Webhook Security
SOLVY_WEBHOOK_SECRET=your_secret

# JWT
JWT_SECRET=your_jwt_secret_min_32_chars

# AgentMail Email
AGENTMAIL_API_KEY=am_...
```

## Deployment Options

### Option 1: Docker Compose (Recommended for VPS)

```bash
# Build and run with PostgreSQL
docker-compose up -d

# Access at http://localhost:8080
# Nginx proxy at ports 80/443
```

**Resource Limits (matches Replit Production):**
- Web: 2 vCPU / 4 GiB RAM
- API: 1 vCPU / 2 GiB RAM
- DB: 1 vCPU / 2 GiB RAM

### Option 2: PM2 + Nginx (Bare Metal)

```bash
# Install dependencies
npm install --omit=dev

# Start with PM2 (cluster mode, 2 instances)
pm2 start pm2.config.cjs

# Configure Nginx with SSL
sudo cp nginx-proxy.conf /etc/nginx/sites-available/solvy
sudo ln -s /etc/nginx/sites-available/solvy /etc/nginx/sites-enabled/
sudo certbot --nginx -d ebl.beauty -d solvy.cards
sudo systemctl reload nginx
```

### Option 3: Hetzner VPS (Automated)

```bash
cd unified-ecosystem
./deploy-hetzner.sh ebl.beauty
```

### Option 4: Replit Mirror

```bash
cd replit-deploy
# Copy .env.example to .env and fill in values
cp .env.example .env
# Deploy with Docker
docker-compose up -d
```

## SSL Certificates

Using Let's Encrypt:

```bash
# Obtain certificates for all domains
sudo certbot --nginx \
  -d ebl.beauty \
  -d www.ebl.beauty \
  -d solvy.cards \
  -d www.solvy.cards \
  -d api.ebl.beauty
```

## Database Setup

PostgreSQL is included in docker-compose. For bare metal:

```bash
# Install PostgreSQL 15
sudo apt install postgresql-15

# Create database
sudo -u postgres psql -c "CREATE USER solvy WITH PASSWORD 'your_password';"
sudo -u postgres psql -c "CREATE DATABASE solvy OWNER solvy;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE solvy TO solvy;"
```

## Pre-Deployment Checklist

- [ ] All `.env` values filled in
- [ ] SSL certificates obtained for all domains
- [ ] DNS A records point to VPS IP (46.62.235.95)
- [ ] Firewall ports 80, 443, 3000, 5432 open
- [ ] Database migrations run
- [ ] Health check endpoints responding
- [ ] Mobile responsiveness tested

## Post-Deployment Verification

1. Visit `https://ebl.beauty` — main platform loads
2. Visit `https://solvy.cards` — card pages load
3. Test API: `curl https://api.ebl.beauty/health`
4. Test database connectivity
5. Verify SSL certificates

## Monitoring

```bash
# Container status
docker-compose ps

# Logs
docker-compose logs -f web
docker-compose logs -f api
docker-compose logs -f db

# PM2 status (if using PM2)
pm2 status
pm2 logs solvy-api
```

## Scaling

To match Replit autoscale behavior on VPS:

```bash
# Scale web containers
docker-compose up -d --scale web=2

# Or use PM2 cluster mode (already configured for 2 instances)
pm2 reload solvy-api
```

## Support

For deployment assistance, contact: support@ebl.beauty
