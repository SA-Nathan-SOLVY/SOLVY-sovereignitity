#!/bin/bash
# SOLVY Initial Server Setup Script
# Run this on your Hetzner VPS to deploy everything from scratch

set -e  # Exit on error

echo "🚀 SOLVY Initial Server Setup"
echo "=============================="

# Configuration
DOMAIN="ebl.beauty"
APP_DIR="/opt/solvy"
WEB_DIR="/var/www/ebl.beauty"
API_PORT="3000"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +%H:%M:%S)]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: System Update
log "Step 1: Updating system packages..."
apt update && apt upgrade -y

# Step 2: Install Dependencies
log "Step 2: Installing dependencies..."
apt install -y \
    nodejs \
    npm \
    git \
    nginx \
    curl \
    certbot \
    python3-certbot-nginx \
    pm2 \
    2>/dev/null || {
    # If pm2 not in apt, install via npm
    npm install -g pm2
}

# Step 3: Create Directories
log "Step 3: Creating directory structure..."
mkdir -p $APP_DIR
mkdir -p $WEB_DIR
mkdir -p $APP_DIR/solvy-platform/api
mkdir -p $APP_DIR/solvy-platform/tests

# Step 4: Create API Server Files
log "Step 4: Creating API server..."

cat > $APP_DIR/solvy-platform/api/unit-token.js << 'APIEOF'
/**
 * SOLVY Unit Token Generation API
 */

const UNIT_CONFIG = {
  API_URL: process.env.UNIT_API_URL || 'https://api.s.unit.sh',
  TOKEN_URL: process.env.UNIT_TOKEN_URL || 'https://api.s.unit.sh/users-token',
  PARTNER_ID: process.env.UNIT_PARTNER_ID,
  PARTNER_SECRET: process.env.UNIT_PARTNER_SECRET,
  ENVIRONMENT: process.env.NODE_ENV || 'sandbox',
  TOKEN_EXPIRY: 3600
};

const tokenCache = new Map();

function generateSandboxToken(memberId, memberData) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: `customer_${memberId}`,
    partner_id: UNIT_CONFIG.PARTNER_ID || 'solvy_sandbox',
    env: 'sandbox',
    iat: now,
    exp: now + UNIT_CONFIG.TOKEN_EXPIRY,
    member_id: memberId
  };
  
  return Buffer.from(JSON.stringify(header)).toString('base64url') + '.' +
         Buffer.from(JSON.stringify(payload)).toString('base64url') + '.' +
         'sandbox_signature';
}

async function generateUnitToken(memberId, memberData = {}) {
  try {
    const cacheKey = `${memberId}_${UNIT_CONFIG.ENVIRONMENT}`;
    const cached = tokenCache.get(cacheKey);
    
    if (cached && cached.expiresAt > Date.now() + 300000) {
      return cached;
    }
    
    if (UNIT_CONFIG.ENVIRONMENT === 'sandbox') {
      const token = generateSandboxToken(memberId, memberData);
      const result = {
        token,
        customerId: `sandbox_${memberId}`,
        expiresAt: Date.now() + (UNIT_CONFIG.TOKEN_EXPIRY * 1000)
      };
      tokenCache.set(cacheKey, result);
      return result;
    }
    
    throw new Error('Production mode not configured');
    
  } catch (error) {
    console.error('[Unit Token] Error:', error);
    throw error;
  }
}

async function handler(req, res) {
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [`https://${process.env.DOMAIN || 'ebl.beauty'}`];
    
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Member-ID');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const memberId = req.headers['x-member-id'] || req.body?.memberId;
    
    if (!memberId) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Member ID required'
      });
    }
    
    const result = await generateUnitToken(memberId, req.body?.memberData);
    
    return res.status(200).json({
      success: true,
      token: result.token,
      customerId: result.customerId,
      expiresIn: UNIT_CONFIG.TOKEN_EXPIRY,
      environment: UNIT_CONFIG.ENVIRONMENT
    });
    
  } catch (error) {
    console.error('[Unit Token] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Token generation failed',
      message: error.message
    });
  }
}

module.exports = handler;
module.exports.handler = handler;
APIEOF

# Step 5: Create Server.js
log "Step 5: Creating Express server..."

cat > $APP_DIR/solvy-platform/api/server.js << 'SERVEREOF'
const express = require('express');
const cors = require('cors');
const unitTokenHandler = require('./unit-token');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://ebl.beauty'],
  credentials: true
}));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'SOLVY API'
  });
});

app.post('/api/unit-token', unitTokenHandler);
app.options('/api/unit-token', unitTokenHandler);

app.listen(PORT, '127.0.0.1', () => {
  console.log(`SOLVY API running on port ${PORT}`);
});
SERVEREOF

# Step 6: Create package.json
log "Step 6: Creating package.json..."

cat > $APP_DIR/solvy-platform/api/package.json << 'PACKEOF'
{
  "name": "solvy-api",
  "version": "1.0.0",
  "description": "SOLVY Ecosystem API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "NODE_ENV=development node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  }
}
PACKEOF

# Step 7: Install API Dependencies
log "Step 7: Installing API dependencies..."
cd $APP_DIR/solvy-platform/api
npm install

# Step 8: Create Environment File
log "Step 8: Creating environment configuration..."

cat > $APP_DIR/.env << 'ENVEOF'
# Unit.co Configuration (SANDBOX MODE)
UNIT_API_URL=https://api.s.unit.sh
UNIT_TOKEN_URL=https://api.s.unit.sh/users-token
UNIT_PARTNER_ID=sandbox_partner
UNIT_PARTNER_SECRET=sandbox_secret
UNIT_ORG_ID=sandbox_org

# Environment
NODE_ENV=sandbox
PORT=3000

# Security
ALLOWED_ORIGINS=https://ebl.beauty,https://www.ebl.beauty
DOMAIN=ebl.beauty
ENVEOF

# Step 9: Create Frontend Files
log "Step 9: Creating frontend files..."

# Create index.html
cat > $WEB_DIR/index.html << 'INDEXEOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SOLVY Ecosystem™ | Own Your Spend. Own Your Future.</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0f172a;
      color: white;
      min-height: 100vh;
    }
    .navbar {
      background: rgba(30, 41, 59, 0.95);
      padding: 1rem 2rem;
      border-bottom: 1px solid #22c55e;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo {
      font-size: 1.5rem;
      font-weight: 800;
      color: #22c55e;
      text-decoration: none;
    }
    .nav-links {
      display: flex;
      gap: 2rem;
    }
    .nav-links a {
      color: #94a3b8;
      text-decoration: none;
      font-weight: 500;
    }
    .nav-links a:hover {
      color: #22c55e;
    }
    .hero {
      text-align: center;
      padding: 5rem 2rem;
    }
    .hero h1 {
      font-size: 3.5rem;
      margin-bottom: 1rem;
      background: linear-gradient(135deg, #22c55e, #16a34a);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero p {
      font-size: 1.25rem;
      color: #94a3b8;
      max-width: 600px;
      margin: 0 auto 2rem;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #22c55e, #16a34a);
      color: white;
      padding: 1rem 2rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 1.1rem;
    }
    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      max-width: 1200px;
      margin: 4rem auto;
      padding: 0 2rem;
    }
    .feature {
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.3);
      border-radius: 12px;
      padding: 2rem;
      text-align: center;
    }
    .feature h3 {
      color: #22c55e;
      margin-bottom: 1rem;
    }
    .feature p {
      color: #94a3b8;
    }
    footer {
      text-align: center;
      padding: 3rem 2rem;
      border-top: 1px solid rgba(34, 197, 94, 0.2);
      margin-top: 4rem;
    }
    .footer-logo {
      font-size: 2rem;
      font-weight: 800;
      color: #22c55e;
      margin-bottom: 1rem;
    }
  </style>
</head>
<body>
  <nav class="navbar">
    <a href="/" class="logo">👑 SOLVY Ecosystem™</a>
    <div class="nav-links">
      <a href="/onboarding.html">Get Card</a>
      <a href="/about.html">About</a>
    </div>
  </nav>
  
  <section class="hero">
    <h1>Own your spend.<br>Own your future.</h1>
    <p>SOLVY Ecosystem™ is a cooperative neobank where members own the profits. Get your SOLVY Card™ and earn dividends from every swipe.</p>
    <a href="/onboarding.html" class="btn">Apply for SOLVY Card™</a>
  </section>
  
  <section class="features">
    <div class="feature">
      <h3>70/20/10 Model</h3>
      <p>70% of profits to members, 20% to operations, 10% to sovereign fund. Transparent and fair.</p>
    </div>
    <div class="feature">
      <h3>Member Owned</h3>
      <p>Every member is an owner. $100 equity stake gets you voting rights and profit sharing.</p>
    </div>
    <div class="feature">
      <h3>Data Sovereignty</h3>
      <p>Your data belongs to you. Local-first architecture keeps your information private.</p>
    </div>
  </section>
  
  <footer>
    <div class="footer-logo">👑 SOLVY Ecosystem™</div>
    <p style="color: #64748b;">A cooperative neobank owned by the people who use it.</p>
    <p style="color: #94a3b8; margin-top: 1rem;">© 2026 SOLVY Ecosystem™ — All Rights Reserved</p>
  </footer>
</body>
</html>
INDEXEOF

# Create onboarding.html (simplified working version)
cat > $WEB_DIR/onboarding.html << 'ONBOARDEOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Join SOLVY Ecosystem™ | Open Your Account</title>
  <style>
    :root {
      --solvy-green: #22c55e;
      --solvy-dark: #0f172a;
      --solvy-gray: #94a3b8;
    }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--solvy-dark);
      color: white;
      margin: 0;
      min-height: 100vh;
    }
    .header {
      background: rgba(30, 41, 59, 0.95);
      padding: 1rem 2rem;
      border-bottom: 1px solid var(--solvy-green);
    }
    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--solvy-green);
      text-decoration: none;
    }
    .container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 0 1rem;
    }
    .onboarding-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .onboarding-header h1 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, var(--solvy-green), #16a34a);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .onboarding-header p {
      color: var(--solvy-gray);
    }
    #loading {
      text-align: center;
      padding: 4rem;
      color: var(--solvy-green);
    }
    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid rgba(34, 197, 94, 0.2);
      border-top-color: var(--solvy-green);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    #error {
      background: #ef4444;
      color: white;
      padding: 1.5rem;
      border-radius: 12px;
      margin: 2rem 0;
      display: none;
      text-align: center;
    }
    #unit-container {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      min-height: 600px;
      display: none;
    }
    .back-link {
      color: var(--solvy-green);
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }
  </style>
</head>
<body>
  <header class="header">
    <div class="header-content">
      <a href="/" class="logo">👑 SOLVY Ecosystem™</a>
      <span style="color: var(--solvy-gray);">First Circle Member Onboarding</span>
    </div>
  </header>
  
  <div class="container">
    <a href="/" class="back-link">← Back to Home</a>
    
    <div class="onboarding-header">
      <h1>Join SOLVY Ecosystem™</h1>
      <p>Become a member-owner. Get your SOLVY Card™.</p>
    </div>
    
    <div id="error">
      <h3>⚠️ Unable to Load Application</h3>
      <p id="error-message">We're having trouble connecting. Please try again.</p>
      <button onclick="initApp()" style="background: white; color: #ef4444; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 1rem;">Try Again</button>
    </div>
    
    <div id="loading">
      <div class="spinner"></div>
      <p>Connecting to SOLVY Banking...</p>
    </div>
    
    <div id="unit-container">
      <unit-elements-white-label-app 
        id="unit-app"
        jwt-token="">
      </unit-elements-white-label-app>
    </div>
  </div>
  
  <script async src="https://ui.s.unit.sh/release/latest/components-extended.js"></script>
  
  <script>
    const API_BASE = window.location.hostname === 'localhost' 
      ? 'http://localhost:3000' 
      : '';
    
    async function fetchToken() {
      const response = await fetch(`${API_BASE}/api/unit-token`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Member-ID': 'member_' + Date.now()
        },
        body: JSON.stringify({})
      });
      
      if (!response.ok) throw new Error('Token fetch failed');
      const data = await response.json();
      return data.token;
    }
    
    async function initApp() {
      document.getElementById('loading').style.display = 'block';
      document.getElementById('error').style.display = 'none';
      document.getElementById('unit-container').style.display = 'none';
      
      try {
        // Wait for Unit script
        let attempts = 0;
        while (!customElements.get('unit-elements-white-label-app') && attempts < 50) {
          await new Promise(r => setTimeout(r, 100));
          attempts++;
        }
        
        const token = await fetchToken();
        document.getElementById('unit-app').setAttribute('jwt-token', token);
        
        document.getElementById('loading').style.display = 'none';
        document.getElementById('unit-container').style.display = 'block';
      } catch (error) {
        console.error('Init error:', error);
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error').style.display = 'block';
      }
    }
    
    window.addEventListener('load', initApp);
  </script>
</body>
</html>
ONBOARDEOF

# Step 10: Configure Nginx
log "Step 10: Configuring Nginx..."

# Backup existing config
[ -f /etc/nginx/sites-available/ebl.beauty ] && cp /etc/nginx/sites-available/ebl.beauty /etc/nginx/sites-available/ebl.beauty.bak.$(date +%s)

cat > /etc/nginx/sites-available/ebl.beauty << 'NGINXEOF'
server {
    listen 80;
    server_name ebl.beauty www.ebl.beauty;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ebl.beauty www.ebl.beauty;

    ssl_certificate /etc/letsencrypt/live/ebl.beauty/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ebl.beauty/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    root /var/www/ebl.beauty;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
}
NGINXEOF

# Enable site
ln -sf /etc/nginx/sites-available/ebl.beauty /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx config
nginx -t || warn "Nginx config test failed - may need SSL certificates"

# Step 11: Start API Server
log "Step 11: Starting API server with PM2..."

# Create PM2 ecosystem file
cat > $APP_DIR/ecosystem.config.js << 'PM2EOF'
module.exports = {
  apps: [{
    name: 'solvy-api',
    script: './solvy-platform/api/server.js',
    cwd: '/opt/solvy',
    env: {
      NODE_ENV: 'sandbox',
      PORT: 3000
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    restart_delay: 3000,
    max_restarts: 5,
    min_uptime: '10s'
  }]
};
PM2EOF

# Start with PM2
cd $APP_DIR
pm2 start ecosystem.config.js
pm2 save

# Setup PM2 startup script
pm2 startup systemd -u root --hp /root

# Step 12: Set Permissions
log "Step 12: Setting permissions..."
chown -R www-data:www-data $WEB_DIR
chmod -R 755 $WEB_DIR
chown -R root:root $APP_DIR
chmod 600 $APP_DIR/.env

# Step 13: Reload Nginx
log "Step 13: Reloading Nginx..."
systemctl reload nginx || systemctl start nginx

# Step 14: Final Checks
log "Step 14: Running final checks..."

# Check if API is running
if pm2 list | grep -q "solvy-api"; then
    log "✅ API server is running"
else
    error "❌ API server failed to start"
fi

# Check if nginx is running
if systemctl is-active --quiet nginx; then
    log "✅ Nginx is running"
else
    error "❌ Nginx is not running"
    systemctl start nginx
fi

log ""
log "=============================="
log "🎉 INITIAL SETUP COMPLETE!"
log "=============================="
log ""
log "Next steps:"
log "1. Get SSL certificate: certbot --nginx -d ebl.beauty"
log "2. Test health endpoint: curl http://localhost:3000/health"
log "3. Visit: https://ebl.beauty"
log ""
log "To check logs:"
log "  - API: pm2 logs solvy-api"
log "  - Nginx: tail -f /var/log/nginx/error.log"
log ""
