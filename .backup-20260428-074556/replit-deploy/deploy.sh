#!/bin/bash

# SOLVY Deployment Script with Cloudflare Tunnel
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
        print_warning "Please edit .env and add your Cloudflare Tunnel Token!"
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

# Check for port conflicts and find available port
PORT=8081
while netstat -tlnp 2>/dev/null | grep -q ":$PORT " || ss -tlnp 2>/dev/null | grep -q ":$PORT " || docker ps 2>/dev/null | grep -q "0.0.0.0:$PORT"; do
    print_warning "Port $PORT is in use, trying next port..."
    PORT=$((PORT + 1))
    if [ $PORT -gt 8100 ]; then
        print_error "Could not find an available port between 8081-8100"
        exit 1
    fi
done

print_step "Using port $PORT..."

# Update docker-compose.yml with available port
sed -i "s/\"808[0-9]:80/\"$PORT:80/" docker-compose.yml 2>/dev/null || \
sed -i.bak "s/\"808[0-9]:80/\"$PORT:80/" docker-compose.yml

# Stop existing containers
print_step "Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Stop any container using the port
EXISTING_CONTAINER=$(docker ps -q --filter publish=$PORT 2>/dev/null)
if [ -n "$EXISTING_CONTAINER" ]; then
    print_warning "Stopping container using port $PORT..."
    docker stop $EXISTING_CONTAINER 2>/dev/null || true
fi

print_step "Building and starting SOLVY web server..."
docker-compose build --no-cache
docker-compose up -d web

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

print_step "Waiting for services..."
sleep 3
docker-compose ps

print_step "Testing local endpoint..."
if curl -s http://localhost:$PORT | grep -q "SOLVY"; then
    echo -e "${GREEN}✓ Website is running successfully on port $PORT!${NC}"
else
    print_warning "Could not verify. Check logs: docker-compose logs web"
fi

echo ""
echo "====================================="
echo -e "  ${GREEN}Deployment Complete!${NC}"
echo "====================================="
echo ""
echo "Local access: http://localhost:$PORT"
echo ""
echo "Management:"
echo "  Logs:     docker-compose logs -f web"
echo "  Stop:     docker-compose stop"
echo "  Restart:  docker-compose restart"
echo ""
