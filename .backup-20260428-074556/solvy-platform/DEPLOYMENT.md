# SOLVY Platform Deployment Guide

## Overview

This document provides instructions for deploying the SOLVY platform to various environments.

## Project Structure

```
solvy-platform/
├── index.html                    # Main landing page (EBL)
├── card/
│   ├── solvy-card.html          # Card interface
│   └── card-customizer.html     # Card customization
├── sps-pilot/
│   └── index.html               # SPS replenishment feed
├── payment/
│   └── payment.html             # Payment processing (coming soon)
├── invoice/
│   └── invoice-management.html  # Invoice management (coming soon)
├── remittance/
│   └── remittance.html          # Remittance (coming soon)
├── community/
│   └── communities.html         # Community (coming soon)
├── decidey/
│   └── decidey-ngo.html         # DECIDEY NGO (coming soon)
├── operations/
│   └── operations-dashboard.html # Operations (coming soon)
├── docs/
│   └── CARD-API-DOCUMENTATION.md
├── assets/                      # Static assets (logos, images)
├── Dockerfile                   # Docker configuration
└── docker-compose.yml           # Docker Compose configuration
```

## Deployment Options

### Option 1: Docker (Recommended for Local/Server)

```bash
# Build and run
docker-compose up -d

# Access at http://localhost:8080
```

### Option 2: Static Hosting (Netlify, Vercel, Cloudflare Pages)

1. Upload the `solvy-platform` folder contents
2. Configure build settings (none needed - static site)
3. Deploy

### Option 3: Nginx Server

```bash
# Copy files to nginx html directory
sudo cp -r solvy-platform/* /var/www/html/

# Ensure proper permissions
sudo chown -R www-data:www-data /var/www/html/
```

### Option 4: Replit

The platform is currently hosted on Replit. To update:

1. Upload files to Replit
2. Click "Run" or use the Deploy button
3. Update environment variables if needed

## Environment Variables

No environment variables required for basic static deployment.

For future API integration:
- `API_BASE_URL` - Backend API endpoint
- `STRIPE_PUBLIC_KEY` - Payment processing
- `AUTH_DOMAIN` - Authentication provider

## Pre-Deployment Checklist

- [ ] All HTML pages are complete
- [ ] Assets are properly linked
- [ ] Navigation works between pages
- [ ] Mobile responsiveness tested
- [ ] No broken links

## Post-Deployment Verification

1. Visit main page: `/`
2. Test navigation to all sections
3. Verify all links work
4. Test on mobile device

## Custom Domain Setup

### Netlify
1. Go to Domain Settings
2. Add custom domain
3. Configure DNS records

### Vercel
1. Go to Project Settings > Domains
2. Add domain
3. Configure DNS

### Traditional Server
Configure nginx or Apache virtual host to point to the deployment directory.

## Maintenance

### Updating Content

1. Make changes to files locally
2. Rebuild Docker container or
3. Re-upload to hosting provider

### Monitoring

- Set up uptime monitoring (UptimeRobot, Pingdom)
- Monitor error logs
- Track performance metrics

## Support

For deployment assistance, contact: support@solvy.coop
