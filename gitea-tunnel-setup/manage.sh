#!/bin/bash

# Management script for Gitea + Cloudflare Tunnel

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_help() {
    echo "Gitea + Cloudflare Tunnel Management"
    echo ""
    echo "Usage: ./manage.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start       - Start Gitea services"
    echo "  stop        - Stop all services"
    echo "  restart     - Restart Gitea services"
    echo "  tunnel      - Start Cloudflare tunnel"
    echo "  tunnel-stop - Stop Cloudflare tunnel"
    echo "  logs        - View Gitea logs"
    echo "  logs-db     - View database logs"
    echo "  status      - Check service status"
    echo "  backup      - Backup Gitea data"
    echo "  update      - Update Gitea to latest version"
    echo "  shell       - Open shell in Gitea container"
    echo "  setup       - Run initial setup"
    echo "  help        - Show this help message"
    echo ""
}

detect_compose() {
    if command -v docker-compose &> /dev/null; then
        echo "docker-compose"
    else
        echo "docker compose"
    fi
}

COMPOSE_CMD=$(detect_compose)

cmd_start() {
    echo -e "${GREEN}Starting Gitea services...${NC}"
    $COMPOSE_CMD up -d db server
    echo -e "${GREEN}Gitea started at http://localhost:3000${NC}"
}

cmd_stop() {
    echo -e "${YELLOW}Stopping all services...${NC}"
    $COMPOSE_CMD down
    echo -e "${GREEN}Services stopped${NC}"
}

cmd_restart() {
    echo -e "${YELLOW}Restarting Gitea services...${NC}"
    $COMPOSE_CMD restart server
    echo -e "${GREEN}Gitea restarted${NC}"
}

cmd_tunnel() {
    if [ ! -f .env ]; then
        echo -e "${RED}Error: .env file not found. Please run setup first.${NC}"
        exit 1
    fi
    
    # Check if TUNNEL_TOKEN is set
    if ! grep -q "TUNNEL_TOKEN=" .env || grep -q "TUNNEL_TOKEN=your_tunnel_token" .env; then
        echo -e "${RED}Error: TUNNEL_TOKEN not configured in .env file${NC}"
        echo "Please add your Cloudflare tunnel token to .env file"
        exit 1
    fi
    
    echo -e "${GREEN}Starting Cloudflare tunnel...${NC}"
    $COMPOSE_CMD --profile tunnel up -d tunnel
    echo -e "${GREEN}Tunnel started${NC}"
}

cmd_tunnel_stop() {
    echo -e "${YELLOW}Stopping Cloudflare tunnel...${NC}"
    $COMPOSE_CMD --profile tunnel stop tunnel
    echo -e "${GREEN}Tunnel stopped${NC}"
}

cmd_logs() {
    echo -e "${BLUE}Showing Gitea logs (Ctrl+C to exit)...${NC}"
    $COMPOSE_CMD logs -f server
}

cmd_logs_db() {
    echo -e "${BLUE}Showing database logs (Ctrl+C to exit)...${NC}"
    $COMPOSE_CMD logs -f db
}

cmd_status() {
    echo -e "${BLUE}Service Status:${NC}"
    $COMPOSE_CMD ps
    
    echo ""
    echo -e "${BLUE}Health Check:${NC}"
    if curl -sf http://localhost:3000/api/healthz > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Gitea is healthy${NC}"
    else
        echo -e "${RED}✗ Gitea is not responding${NC}"
    fi
}

cmd_backup() {
    BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    echo -e "${GREEN}Creating backup in $BACKUP_DIR...${NC}"
    
    # Backup Gitea data
    tar czf "$BACKUP_DIR/gitea-data.tar.gz" gitea-data/ 2>/dev/null || echo "No gitea-data directory yet"
    
    # Backup database
    $COMPOSE_CMD exec -T db pg_dump -U gitea gitea > "$BACKUP_DIR/gitea-db.sql" 2>/dev/null || echo "Database backup failed"
    
    # Backup configuration
    cp .env "$BACKUP_DIR/" 2>/dev/null || echo "No .env file"
    cp docker-compose.yml "$BACKUP_DIR/" 2>/dev/null || echo "No docker-compose.yml"
    
    echo -e "${GREEN}Backup complete: $BACKUP_DIR${NC}"
}

cmd_update() {
    echo -e "${YELLOW}Updating Gitea to latest version...${NC}"
    
    # Backup first
    cmd_backup
    
    # Pull latest images
    $COMPOSE_CMD pull
    
    # Restart with new images
    $COMPOSE_CMD up -d
    
    echo -e "${GREEN}Gitea updated${NC}"
}

cmd_shell() {
    echo -e "${BLUE}Opening shell in Gitea container...${NC}"
    $COMPOSE_CMD exec server /bin/sh
}

cmd_setup() {
    if [ -f setup.sh ]; then
        bash setup.sh
    else
        echo -e "${RED}Error: setup.sh not found${NC}"
        exit 1
    fi
}

# Main command handler
case "${1:-help}" in
    start)
        cmd_start
        ;;
    stop)
        cmd_stop
        ;;
    restart)
        cmd_restart
        ;;
    tunnel)
        cmd_tunnel
        ;;
    tunnel-stop)
        cmd_tunnel_stop
        ;;
    logs)
        cmd_logs
        ;;
    logs-db)
        cmd_logs_db
        ;;
    status)
        cmd_status
        ;;
    backup)
        cmd_backup
        ;;
    update)
        cmd_update
        ;;
    shell)
        cmd_shell
        ;;
    setup)
        cmd_setup
        ;;
    help|--help|-h)
        print_help
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        print_help
        exit 1
        ;;
esac
