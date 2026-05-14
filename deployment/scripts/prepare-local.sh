#!/bin/bash
# ============================================================================
# SOLVY Ecosystem™ — Local Preparation Script
# Run this on your LOCAL machine to organize files before deployment
# ============================================================================

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
DEPLOY_DIR="$PROJECT_ROOT/deployment"

echo "========================================"
echo "SOLVY Deployment Preparation"
echo "========================================"
echo ""

# Create directories
mkdir -p "$DEPLOY_DIR/backend"
mkdir -p "$DEPLOY_DIR/frontend"
mkdir -p "$DEPLOY_DIR/scripts"

# Copy backend (Node.js server)
echo "📦 Copying backend files..."
if [ -d "$PROJECT_ROOT/solvy-platform/server" ]; then
    cp -r "$PROJECT_ROOT/solvy-platform/server/"* "$DEPLOY_DIR/backend/"
else
    echo "❌ Backend not found at solvy-platform/server/"
    exit 1
fi

# Copy frontend files
echo "📦 Copying frontend files..."

# Main pages
cp "$PROJECT_ROOT/solvy-platform/welcome.html" "$DEPLOY_DIR/frontend/index.html" 2>/dev/null || true
cp "$PROJECT_ROOT/solvy-platform/privacy-sovereignty.html" "$DEPLOY_DIR/frontend/" 2>/dev/null || true
cp "$PROJECT_ROOT/solvy-platform/ai-chat-demo.html" "$DEPLOY_DIR/frontend/" 2>/dev/null || true

# Banking portal (copy entire directory structure)
if [ -d "$PROJECT_ROOT/solvy-platform/banking" ]; then
    mkdir -p "$DEPLOY_DIR/frontend/banking"
    cp "$PROJECT_ROOT/solvy-platform/banking/"*.html "$DEPLOY_DIR/frontend/banking/" 2>/dev/null || true
fi

# Internal / MAN portal
if [ -d "$PROJECT_ROOT/solvy-platform/internal" ]; then
    mkdir -p "$DEPLOY_DIR/frontend/internal"
    cp -r "$PROJECT_ROOT/solvy-platform/internal/"* "$DEPLOY_DIR/frontend/internal/" 2>/dev/null || true
fi

# Static assets
if [ -d "$PROJECT_ROOT/solvy-platform/js" ]; then
    cp -r "$PROJECT_ROOT/solvy-platform/js" "$DEPLOY_DIR/frontend/"
fi
if [ -d "$PROJECT_ROOT/solvy-platform/css" ]; then
    cp -r "$PROJECT_ROOT/solvy-platform/css" "$DEPLOY_DIR/frontend/" 2>/dev/null || true
fi
if [ -d "$PROJECT_ROOT/solvy-platform/assets" ]; then
    cp -r "$PROJECT_ROOT/solvy-platform/assets" "$DEPLOY_DIR/frontend/" 2>/dev/null || true
fi

# Copy deployment scripts
echo "📦 Copying deployment scripts..."
cp "$DEPLOY_DIR/scripts/setup.sh" "$DEPLOY_DIR/" 2>/dev/null || true
cp "$DEPLOY_DIR/scripts/deploy.sh" "$DEPLOY_DIR/" 2>/dev/null || true
cp "$DEPLOY_DIR/scripts/nginx-config.conf" "$DEPLOY_DIR/" 2>/dev/null || true
cp "$DEPLOY_DIR/solvy.service" "$DEPLOY_DIR/" 2>/dev/null || true

# Make scripts executable
chmod +x "$DEPLOY_DIR/setup.sh" 2>/dev/null || true
chmod +x "$DEPLOY_DIR/deploy.sh" 2>/dev/null || true

# Check for .env
echo ""
if [ ! -f "$DEPLOY_DIR/backend/.env" ]; then
    echo "⚠️  No .env file found!"
    echo "   Copy .env.example and configure before deploying:"
    echo "   cp $DEPLOY_DIR/backend/.env.example $DEPLOY_DIR/backend/.env"
    echo "   nano $DEPLOY_DIR/backend/.env"
else
    echo "✅ .env file found"
fi

echo ""
echo "========================================"
echo "Deployment package ready!"
echo "========================================"
echo ""
echo "Next steps:"
echo "  1. Edit $DEPLOY_DIR/backend/.env with production secrets"
echo "  2. Upload to VPS:"
echo "     rsync -avz --delete $DEPLOY_DIR/ root@46.62.235.95:/root/solvy-deployment/"
echo "  3. SSH into VPS and run setup + deploy"
echo ""

# Show package summary
echo "Package contents:"
find "$DEPLOY_DIR" -maxdepth 2 -type f | sort | while read f; do
    size=$(du -h "$f" 2>/dev/null | cut -f1)
    rel="${f#$DEPLOY_DIR/}"
    printf "  %-50s %8s\n" "$rel" "$size"
done
