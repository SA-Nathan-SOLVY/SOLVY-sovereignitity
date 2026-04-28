#!/bin/bash

# SOLVY Production Deployment Script
# Matches Replit: 2 vCPU / 4 GiB RAM / PostgreSQL / Public
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_step() { echo -e "${GREEN}[STEP]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

if [ ! -f .env ]; then
    print_warning ".env file not found!"
    if [ -f .env.example ]; then
        print_step "Creating .env from .env.example..."
        cp .env.example .env
        print_warning "Please edit .env and configure all production values!"
        exit 1
    fi
fi

print_step "Checking Docker..."
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "docker-compose is not installed."
    exit 1
fi

# Stop existing containers
print_step "Stopping existing containers..."
docker-compose down 2>/dev/null || true

print_step "Building and starting SOLVY production stack..."
docker-compose build --no-cache
docker-compose up -d

print_step "Waiting for services..."
sleep 5
docker-compose ps

print_step "Testing health endpoints..."
if curl -s http://localhost/health | grep -q "healthy"; then
    echo -e "${GREEN}✓ Web server is healthy!${NC}"
else
    print_warning "Web health check failed. Check logs: docker-compose logs web"
fi

if curl -s http://localhost:3000/health 2>/dev/null | grep -q "ok"; then
    echo -e "${GREEN}✓ API server is healthy!${NC}"
else
    print_warning "API health check failed (may need more time). Check logs: docker-compose logs api"
fi

# Check Cloudflare Tunnel if configured
if grep -q "your_cloudflare_tunnel_token_here" .env 2>/dev/null || ! grep -q "TUNNEL_TOKEN" .env 2>/dev/null; then
    print_warning "Cloudflare Tunnel Token not configured"
    print_step "To enable public access:"
    echo "  1. Go to https://one.dash.cloudflare.com"
    echo "  2. Networks > Tunnels > Create Tunnel"
    echo "  3. Copy token and add to .env"
    echo "  4. Run: docker-compose --profile tunnel up -d tunnel"
else
    print_step "Starting Cloudflare Tunnel..."
    docker-compose --profile tunnel up -d tunnel
fi

echo ""
echo "====================================="
echo -e "  ${GREEN}Deployment Complete!${NC}"
echo "====================================="
echo ""
echo "Domains:"
echo "  https://ebl.beauty"
echo "  https://solvy.cards"
echo "  https://solvy-sovereignitity--smayone.replit.app"
echo ""
echo "Local access:"
echo "  Web:  http://localhost"
echo "  API:  http://localhost:3000"
echo "  DB:   localhost:5432"
echo ""
echo "Management:"
echo "  Logs:     docker-compose logs -f"
echo "  Stop:     docker-compose stop"
echo "  Restart:  docker-compose restart"
echo "  Scale:    docker-compose up -d --scale web=2"
echo ""
