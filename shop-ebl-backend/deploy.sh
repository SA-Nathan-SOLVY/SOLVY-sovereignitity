#!/bin/bash

# EBL Backend API Deployment Script
# Run this script to deploy the backend to Hetzner VPS

set -e

echo "🚀 Deploying EBL Backend API to Hetzner VPS..."

# Configuration
VPS_HOST="root@46.62.235.95"
VPS_PATH="/var/www/ebl-api"
SSH_KEY="$HOME/.ssh/hetzner_key"

# Create directory on VPS
echo "📁 Creating directory on VPS..."
ssh -i "$SSH_KEY" "$VPS_HOST" "mkdir -p $VPS_PATH"

# Upload backend files
echo "📤 Uploading backend files..."
scp -i "$SSH_KEY" server.js "$VPS_HOST:$VPS_PATH/"
scp -i "$SSH_KEY" package.json "$VPS_HOST:$VPS_PATH/"
scp -i "$SSH_KEY" .env.example "$VPS_HOST:$VPS_PATH/"

# Install Node.js if not installed
echo "📦 Checking Node.js installation..."
ssh -i "$SSH_KEY" "$VPS_HOST" << 'ENDSSH'
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi
ENDSSH

# Install dependencies
echo "📦 Installing npm dependencies..."
ssh -i "$SSH_KEY" "$VPS_HOST" "cd $VPS_PATH && npm install --production"

# Setup systemd service
echo "⚙️  Setting up systemd service..."
scp -i "$SSH_KEY" ebl-api.service "$VPS_HOST:/tmp/"
ssh -i "$SSH_KEY" "$VPS_HOST" << 'ENDSSH'
mv /tmp/ebl-api.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable ebl-api
ENDSSH

# Setup Nginx configuration
echo "🌐 Setting up Nginx configuration..."
scp -i "$SSH_KEY" nginx-api.conf "$VPS_HOST:/tmp/"
ssh -i "$SSH_KEY" "$VPS_HOST" << 'ENDSSH'
mv /tmp/nginx-api.conf /etc/nginx/sites-available/api.ebl.beauty
ln -sf /etc/nginx/sites-available/api.ebl.beauty /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
ENDSSH

# Setup SSL certificate
echo "🔒 Setting up SSL certificate..."
ssh -i "$SSH_KEY" "$VPS_HOST" << 'ENDSSH'
if [ ! -f /etc/letsencrypt/live/api.ebl.beauty/fullchain.pem ]; then
    certbot certonly --nginx -d api.ebl.beauty --non-interactive --agree-tos --email admin@ebl.beauty
fi
ENDSSH

echo "⚠️  IMPORTANT: Configure environment variables!"
echo "   1. SSH into VPS: ssh -i ~/.ssh/hetzner_key root@46.62.235.95"
echo "   2. Create .env file: cd $VPS_PATH && nano .env"
echo "   3. Copy from .env.example and fill in real values"
echo "   4. Start service: systemctl start ebl-api"
echo "   5. Check status: systemctl status ebl-api"

echo "✅ Backend deployment complete!"
echo "🌐 API will be available at: https://api.ebl.beauty"
