#!/bin/bash
# Deploy SOLVY to Hetzner VPS
# Usage: ./DEPLOY_SERVER.sh

SERVER_IP="46.62.235.95"
SSH_USER="root"

echo "🚀 Deploying SOLVY to Hetzner VPS ($SERVER_IP)"
echo "================================================"

# Copy setup script to server
echo "📤 Copying setup script to server..."
scp ops/INITIAL_SETUP.sh $SSH_USER@$SERVER_IP:/root/

# Execute setup script on server
echo "🔧 Running setup script on server (this will take a few minutes)..."
ssh $SSH_USER@$SERVER_IP "bash /root/INITIAL_SETUP.sh"

echo ""
echo "================================================"
echo "✅ Deployment Complete!"
echo "================================================"
echo ""
echo "Visit: https://ebl.beauty"
echo ""
echo "If SSL isn't working yet, run:"
echo "  ssh $SSH_USER@$SERVER_IP 'certbot --nginx -d ebl.beauty --agree-tos -m admin@ebl.beauty'"
