#!/bin/bash

# Complete SOLVY Platform Gitea Setup Script
# This script sets up Gitea, pushes SOLVY code, and starts the tunnel

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
GITEA_URL="https://gitea.ebl.beauty"
GITEA_LOCAL="http://localhost:3000"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
print_step() { echo -e "${BLUE}[STEP]${NC} $1"; }

# Check Docker
check_docker() {
    print_step "Checking Docker..."
    if ! docker info &>/dev/null; then
        print_error "Docker is not running!"
        echo ""
        echo "Please start Docker Desktop:"
        echo "  1. Open Docker Desktop application"
        echo "  2. Wait for it to fully start"
        echo "  3. Run this script again"
        echo ""
        exit 1
    fi
    print_info "Docker is running ✓"
}

# Step 1: Start Gitea
step1_start_gitea() {
    print_step "Step 1/4: Starting Gitea Server..."
    cd "$SCRIPT_DIR"
    
    if docker ps | grep -q gitea-server; then
        print_info "Gitea is already running ✓"
    else
        ./manage.sh start
        print_info "Waiting for Gitea to be ready..."
        sleep 10
        
        # Wait for health check
        local retries=0
        while [ $retries -lt 30 ]; do
            if curl -sf http://localhost:3000/api/healthz &>/dev/null; then
                print_info "Gitea is ready! ✓"
                break
            fi
            retries=$((retries + 1))
            echo "   Waiting... ($retries/30)"
            sleep 2
        done
    fi
    
    echo ""
    echo "Gitea URLs:"
    echo "  Local:  $GITEA_LOCAL"
    echo "  Public: $GITEA_URL (after tunnel starts)"
    echo ""
}

# Step 2: Create Repository in Gitea
step2_create_repo() {
    print_step "Step 2/4: Creating SOLVY Repository..."
    
    # Check if repo exists
    REPO_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "$GITEA_LOCAL/api/v1/repos/smayone/solvy-platform" 2>/dev/null || echo "000")
    
    if [ "$REPO_CHECK" = "200" ]; then
        print_info "Repository 'solvy-platform' already exists ✓"
        return
    fi
    
    print_warning "Please create the repository manually:"
    echo ""
    echo "1. Open: $GITEA_LOCAL"
    echo "2. Login or Register"
    echo "3. Click '+' → 'New Repository'"
    echo "4. Repository Name: solvy-platform"
    echo "5. Visibility: Private (recommended)"
    echo "6. Check 'Initialize Repository'"
    echo "7. Click 'Create Repository'"
    echo ""
    read -p "Press Enter when you've created the repository..."
    
    print_info "Repository ready ✓"
}

# Step 3: Push SOLVY Code
step3_push_code() {
    print_step "Step 3/4: Pushing SOLVY Code to Gitea..."
    cd "$PROJECT_ROOT/solvy-platform"
    
    # Check if already pushed
    if git remote | grep -q gitea; then
        print_info "Gitea remote already configured ✓"
    else
        print_info "Adding Gitea remote..."
        git remote add gitea "$GITEA_LOCAL/smayone/solvy-platform.git"
    fi
    
    # Check if there are changes to push
    if git log --oneline origin/main..HEAD 2>/dev/null | grep -q . || \
       git log --oneline main..HEAD 2>/dev/null | grep -q . || \
       [ "$(git rev-parse --abbrev-ref HEAD)" = "main" ] || \
       [ "$(git rev-parse --abbrev-ref HEAD)" = "master" ]; then
        print_info "Pushing code to Gitea..."
        git push -u gitea main || git push -u gitea master
        print_info "Code pushed successfully! ✓"
    else
        print_info "Checking for any uncommitted changes..."
        if [ -n "$(git status --porcelain)" ]; then
            git add .
            git commit -m "Update SOLVY platform files" || true
            git push gitea main || git push gitea master
        fi
        print_info "Code is up to date on Gitea ✓"
    fi
    
    echo ""
    echo "Repository URL: $GITEA_LOCAL/smayone/solvy-platform"
    echo ""
}

# Step 4: Start Cloudflare Tunnel
step4_start_tunnel() {
    print_step "Step 4/4: Starting Cloudflare Tunnel..."
    cd "$SCRIPT_DIR"
    
    # Check if tunnel is already running
    if docker ps | grep -q gitea-tunnel; then
        print_info "Tunnel is already running ✓"
    else
        print_info "Starting Cloudflare tunnel..."
        ./manage.sh tunnel
        sleep 5
        
        if docker ps | grep -q gitea-tunnel; then
            print_info "Tunnel started successfully! ✓"
        else
            print_error "Tunnel failed to start"
            docker logs gitea-tunnel 2>&1 | tail -20
        fi
    fi
    
    echo ""
    echo "========================================"
    echo "  🎉 SETUP COMPLETE!"
    echo "========================================"
    echo ""
    echo "Your SOLVY Platform is now available at:"
    echo ""
    echo "  🌐 Public URL: $GITEA_URL/smayone/solvy-platform"
    echo "  💻 Local URL:  $GITEA_LOCAL/smayone/solvy-platform"
    echo ""
    echo "Gitea Actions CI/CD is configured at:"
    echo "  $GITEA_URL/smayone/solvy-platform/actions"
    echo ""
    echo "Useful commands:"
    echo "  ./manage.sh status    - Check service status"
    echo "  ./manage.sh logs      - View Gitea logs"
    echo "  ./manage.sh backup    - Create backup"
    echo ""
}

# Main execution
main() {
    echo "========================================"
    echo "  SOLVY Platform Gitea Setup"
    echo "========================================"
    echo ""
    
    check_docker
    step1_start_gitea
    step2_create_repo
    step3_push_code
    step4_start_tunnel
}

main "$@"
