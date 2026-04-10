# SOLVY Prelaunch Deployment Guide
## Get Unit.co Banking Live on ebl.beauty

**Last Updated:** March 31, 2026  
**Goal:** Working onboarding flow for First Circle members

---

## 🚀 QUICK START (15 minutes)

### Prerequisites
- [ ] Hetzner VPS running (46.62.235.95)
- [ ] Domain pointing to VPS (ebl.beauty)
- [ ] Unit.co sandbox credentials
- [ ] SSL certificates (Let's Encrypt)

### Deploy Now

```bash
# 1. SSH to server
ssh root@46.62.235.95

# 2. Pull latest code
cd /opt/solvy
git pull

# 3. Install dependencies
cd solvy-platform/api
npm install

# 4. Set environment variables
nano .env
# Add:
# UNIT_API_URL=https://api.s.unit.sh
# UNIT_PARTNER_ID=your_sandbox_partner_id
# UNIT_PARTNER_SECRET=your_sandbox_secret
# NODE_ENV=sandbox

# 5. Start API server
pm2 restart solvy-api || pm2 start server.js --name solvy-api

# 6. Test
curl http://localhost:3000/api/unit-token \
  -X POST \
  -H "Content-Type: application/json" \
  -H "X-Member-ID: test_123" \
  -d '{}'

# 7. Deploy frontend
cp -r /opt/solvy/solvy-platform/* /var/www/ebl.beauty/

# 8. Verify
open https://ebl.beauty/onboarding.html
```

---

## 📋 DETAILED DEPLOYMENT

### Step 1: Server Setup (If Not Done)

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PM2 (process manager)
npm install -g pm2

# Install Nginx
apt install -y nginx

# Create app directory
mkdir -p /opt/solvy
mkdir -p /var/www/ebl.beauty
```

### Step 2: API Server Deployment

```bash
# Navigate to API directory
cd /opt/solvy/solvy-platform/api

# Install dependencies
npm install express node-fetch cors

# Create environment file
cat > .env << 'EOF'
# Unit.co Configuration
UNIT_API_URL=https://api.s.unit.sh
UNIT_TOKEN_URL=https://api.s.unit.sh/users-token
UNIT_PARTNER_ID=your_partner_id_here
UNIT_PARTNER_SECRET=your_secret_here
UNIT_ORG_ID=your_org_id_here

# Environment
NODE_ENV=sandbox

# Security
ALLOWED_ORIGINS=https://ebl.beauty,https://www.ebl.beauty

# Server
PORT=3000
EOF

# Create simple Express server
cat > server.js << 'EOF'
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import Unit token handler
const unitTokenHandler = require('./unit-token');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://ebl.beauty'],
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Unit token endpoint
app.post('/api/unit-token', unitTokenHandler);
app.options('/api/unit-token', unitTokenHandler);

// Serve static files (frontend)
app.use(express.static('/var/www/ebl.beauty'));

// Start server
app.listen(PORT, '127.0.0.1', () => {
  console.log(`SOLVY API running on port ${PORT}`);
});
EOF

# Start with PM2
pm2 start server.js --name "solvy-api" \
  --env PORT=3000 \
  --restart-delay 3000 \
  --max-restarts 5

# Save PM2 config
pm2 save
pm2 startup
```

### Step 3: Nginx Configuration

```bash
# Create Nginx config
cat > /etc/nginx/sites-available/ebl.beauty << 'EOF'
server {
    listen 80;
    server_name ebl.beauty www.ebl.beauty;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ebl.beauty www.ebl.beauty;

    # SSL certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/ebl.beauty/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ebl.beauty/privkey.pem;
    
    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Frontend static files
    location / {
        root /var/www/ebl.beauty;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API proxy to Node.js
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/ebl.beauty /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx config
nginx -t

# Reload Nginx
systemctl reload nginx
```

### Step 4: Frontend Deployment

```bash
# Copy frontend files
cp -r /opt/solvy/solvy-platform/*.html /var/www/ebl.beauty/
cp -r /opt/solvy/solvy-platform/card /var/www/ebl.beauty/
cp -r /opt/solvy/solvy-platform/banking /var/www/ebl.beauty/
cp -r /opt/solvy/solvy-platform/assets /var/www/ebl.beauty/ 2>/dev/null || echo "No assets folder"

# Set permissions
chown -R www-data:www-data /var/www/ebl.beauty
chmod -R 755 /var/www/ebl.beauty

# Update API_BASE in onboarding.html
# Change: API_BASE: 'http://localhost:3000'
# To: API_BASE: 'https://ebl.beauty'
sed -i "s|API_BASE: window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://ebl.beauty'|'https://ebl.beauty'|g" /var/www/ebl.beauty/onboarding.html
```

### Step 5: SSL Certificates (Let's Encrypt)

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Obtain certificates
certbot --nginx -d ebl.beauty -d www.ebl.beauty --non-interactive --agree-tos --email admin@ebl.beauty

# Auto-renewal (automatically configured)
# Test renewal: certbot renew --dry-run
```

### Step 6: Testing

```bash
# Test 1: Health check
curl https://ebl.beauty/health

# Test 2: Token API (should return sandbox token)
curl -X POST https://ebl.beauty/api/unit-token \
  -H "Content-Type: application/json" \
  -H "X-Member-ID: test_deploy" \
  -d '{"memberData": {"email": "test@example.com"}}'

# Test 3: Frontend loads
open https://ebl.beauty/onboarding.html
```

---

## 🔧 TROUBLESHOOTING

### Issue: API returns 502 Bad Gateway
```bash
# Check if API is running
pm2 status
pm2 logs solvy-api

# Restart if needed
pm2 restart solvy-api
```

### Issue: CORS errors in browser
```bash
# Check allowed origins in .env
# Should include: https://ebl.beauty

# Update and restart
pm2 restart solvy-api
```

### Issue: SSL certificate error
```bash
# Renew certificate
certbot renew --force-renewal
systemctl reload nginx
```

### Issue: Unit app doesn't load
```bash
# Check browser console for errors
# Verify jwt-token is being set
# Check that Unit script loads: https://ui.s.unit.sh

# Test manually
curl -I https://ui.s.unit.sh/release/latest/components-extended.js
```

---

## ✅ PRELAUNCH CHECKLIST

### Technical
- [ ] API server running on port 3000
- [ ] Nginx proxying /api/ to Node.js
- [ ] SSL certificates valid
- [ ] Frontend deployed to /var/www/ebl.beauty
- [ ] Onboarding page loads without errors
- [ ] Token generation returns valid JWT
- [ ] Unit Elements initializes with token

### Security
- [ ] Environment variables set (not in code)
- [ ] SSL enforced (HTTP redirects to HTTPS)
- [ ] CORS configured for ebl.beauty only
- [ ] No sensitive data in frontend code
- [ ] PM2 running with auto-restart

### Unit.co
- [ ] Sandbox credentials working
- [ ] Token format validated
- [ ] Customer creation flow tested
- [ ] KYC flow accessible

### Monitoring
- [ ] Health check endpoint responding
- [ ] PM2 monitoring active
- [ ] Nginx access logs rotating
- [ ] Error logging configured

---

## 🎯 NEXT STEPS AFTER DEPLOYMENT

### Immediate (This Week)
1. Submit Unit production application
2. Test complete onboarding flow
3. Invite 5 beta testers
4. Monitor error logs

### Short-term (Next 30 Days)
1. Switch to production credentials when approved
2. Process first 10 member applications
3. Refine onboarding based on feedback
4. Set up monitoring alerts

---

## 📞 SUPPORT

**Server Issues:**
- Check: `pm2 logs solvy-api`
- Check: `tail -f /var/log/nginx/error.log`

**Unit.co Issues:**
- Verify: `curl https://api.s.unit.sh/health`
- Check credentials in `.env`

**Frontend Issues:**
- Clear browser cache
- Check browser console for JS errors
- Verify API_BASE is set correctly

---

**Document ID:** SOLVY-DEPLOY-2026-001  
**Status:** Ready for deployment  
**Estimated Time:** 15-30 minutes
