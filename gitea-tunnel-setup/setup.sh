#!/bin/bash

# Gitea + Tunnelfy (Cloudflare Tunnel) Setup Script for macOS
# This script sets up Gitea with Cloudflare Tunnel for secure external access

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "========================================"
echo "  Gitea + Cloudflare Tunnel Setup"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    print_info "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker Desktop for Mac first."
        echo "   Visit: https://www.docker.com/products/docker-desktop"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not available. Please ensure Docker Desktop is properly installed."
        exit 1
    fi
    
    print_info "Docker is installed ✓"
}

# Install cloudflared (for Tunnelfy)
install_cloudflared() {
    print_info "Checking cloudflared installation..."
    
    if command -v cloudflared &> /dev/null; then
        print_info "cloudflared is already installed ✓"
        cloudflared --version
        return
    fi
    
    print_info "Installing cloudflared via Homebrew..."
    
    if ! command -v brew &> /dev/null; then
        print_warning "Homebrew is not installed. Installing Homebrew first..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi
    
    brew install cloudflare/cloudflare/cloudflared
    print_info "cloudflared installed successfully ✓"
}

# Setup environment file
setup_env() {
    print_info "Setting up environment configuration..."
    
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
            print_info "Created .env file from example ✓"
            print_warning "Please edit .env file with your actual configuration values"
        else
            print_error ".env.example file not found!"
            exit 1
        fi
    else
        print_info ".env file already exists ✓"
    fi
}

# Create necessary directories
create_directories() {
    print_info "Creating necessary directories..."
    mkdir -p gitea-data postgres-data
    print_info "Directories created ✓"
}

# Start Gitea services
start_gitea() {
    print_info "Starting Gitea services..."
    
    if command -v docker-compose &> /dev/null; then
        docker-compose up -d db server
    else
        docker compose up -d db server
    fi
    
    print_info "Gitea services started ✓"
    print_info "Waiting for Gitea to be ready..."
    
    # Wait for Gitea to be healthy
    sleep 10
    
    local retries=0
    local max_retries=30
    
    while [ $retries -lt $max_retries ]; do
        if curl -sf http://localhost:3000/api/healthz > /dev/null 2>&1; then
            print_info "Gitea is ready! ✓"
            return
        fi
        retries=$((retries + 1))
        echo "   Waiting... ($retries/$max_retries)"
        sleep 5
    done
    
    print_warning "Gitea may still be starting. Check logs with: docker logs gitea-server"
}

# Show Cloudflare Tunnel setup instructions
show_tunnel_instructions() {
    echo ""
    echo "========================================"
    echo "  Cloudflare Tunnel Setup Instructions"
    echo "========================================"
    echo ""
    print_info "To expose Gitea via Cloudflare Tunnel (Tunnelfy):"
    echo ""
    echo "1. Log in to Cloudflare Zero Trust dashboard:"
    echo "   https://one.dash.cloudflare.com"
    echo ""
    echo "2. Navigate to: Networks > Tunnels"
    echo ""
    echo "3. Click 'Create a tunnel' and select 'Cloudflared'"
    echo ""
    echo "4. Give your tunnel a name (e.g., 'gitea-tunnel')"
    echo ""
    echo "5. In the 'Install and run a connector' step:"
    echo "   - Select 'Docker' as environment"
    echo "   - Copy the token (looks like: eyJh... )"
    echo ""
    echo "6. Add the token to your .env file:"
    echo "   TUNNEL_TOKEN=your_copied_token"
    echo ""
    echo "7. Configure the tunnel public host:"
    echo "   - Subdomain: git (or your preference)"
    echo "   - Domain: your-domain.com"
    echo "   - Type: HTTP"
    echo "   - URL: gitea-server:3000"
    echo ""
    echo "8. Save the tunnel"
    echo ""
    echo "9. Start the tunnel container:"
    echo "   docker-compose --profile tunnel up -d tunnel"
    echo ""
    echo "10. Or use Tunnelfy VS Code extension:"
    echo "    - Install 'Tunnelfy' from VS Code marketplace"
    echo "    - Use it to manage tunnels directly from VS Code"
    echo ""
}

# Show status
show_status() {
    echo ""
    echo "========================================"
    echo "  Gitea Setup Status"
    echo "========================================"
    echo ""
    
    if curl -sf http://localhost:3000/api/healthz > /dev/null 2>&1; then
        print_info "Gitea is running at: http://localhost:3000"
        print_info "SSH access available on port: 2222"
    else
        print_warning "Gitea is still starting up..."
    fi
    
    echo ""
    print_info "Useful commands:"
    echo "   View logs:     docker logs -f gitea-server"
    echo "   Stop Gitea:    docker-compose down"
    echo "   Start Gitea:   docker-compose up -d"
    echo "   Start Tunnel:  docker-compose --profile tunnel up -d tunnel"
    echo ""
    print_info "Data is persisted in:"
    echo "   - ./gitea-data (Gitea data)"
    echo "   - ./postgres-data (Database)"
    echo ""
}

# Main execution
main() {
    check_docker
    install_cloudflared
    setup_env
    create_directories
    start_gitea
    show_tunnel_instructions
    show_status
    
    echo ""
    print_info "Setup complete! 🎉"
    echo ""
    print_warning "Don't forget to:"
    echo "   1. Edit .env file with your configuration"
    echo "   2. Complete Gitea initial setup at http://localhost:3000"
    echo "   3. Set up Cloudflare Tunnel for external access"
    echo ""
}

# Run main function
main "$@"
