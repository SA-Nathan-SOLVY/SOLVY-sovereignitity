# Gitea + Tunnelfy (Cloudflare Tunnel) Setup

This directory contains a complete setup for running a self-hosted Git server with secure external access via Cloudflare Tunnel (compatible with Tunnelfy VS Code extension).

## 📁 Files

| File | Description |
|------|-------------|
| `docker-compose.yml` | Docker Compose configuration for Gitea, PostgreSQL, and Cloudflare Tunnel |
| `.env.example` | Example environment variables file |
| `setup.sh` | Initial setup script for macOS |
| `manage.sh` | Management script for daily operations |
| `README.md` | This file |

## 🚀 Quick Start

### 1. Initial Setup

```bash
# Run the setup script
./setup.sh
```

This will:
- Check Docker installation
- Install `cloudflared` via Homebrew
- Create `.env` file from example
- Start Gitea and PostgreSQL
- Show Cloudflare Tunnel setup instructions

### 2. Complete Gitea Setup

1. Open http://localhost:3000 in your browser
2. Complete the initial configuration:
   - Database: PostgreSQL (pre-configured)
   - Site Title: Your Gitea instance name
   - Repository Root Path: /data/git/repositories
   - Run User: git
   - Server Domain: Your domain (or localhost for local use)
   - Gitea Base URL: Your URL (or http://localhost:3000/ for local)
   - Log Path: /data/gitea/log
3. Create an admin account
4. Click "Install Gitea"

### 3. Set Up Cloudflare Tunnel (Tunnelfy)

#### Option A: Using Cloudflare Dashboard

1. Go to [Cloudflare Zero Trust](https://one.dash.cloudflare.com)
2. Navigate to **Networks > Tunnels**
3. Click **Create a tunnel** → Select **Cloudflared**
4. Name your tunnel (e.g., `gitea-tunnel`)
5. Copy the tunnel token
6. Add to `.env`:
   ```
   TUNNEL_TOKEN=your_token_here
   ```
7. Configure public hostname:
   - Subdomain: `git`
   - Domain: `yourdomain.com`
   - Type: `HTTP`
   - URL: `gitea-server:3000`
8. Save and start tunnel:
   ```bash
   ./manage.sh tunnel
   ```

#### Option B: Using Tunnelfy VS Code Extension

1. Install [Tunnelfy](https://marketplace.visualstudio.com/items?itemName=Willbot.tunnelfy) from VS Code marketplace
2. Open command palette (`Cmd+Shift+P`)
3. Run `Tunnelfy: Create Tunnel`
4. Configure for localhost:3000
5. Manage tunnels directly from VS Code!

## 🛠️ Management Commands

```bash
# Start Gitea
./manage.sh start

# Stop all services
./manage.sh stop

# Restart Gitea
./manage.sh restart

# Start Cloudflare tunnel
./manage.sh tunnel

# Stop Cloudflare tunnel
./manage.sh tunnel-stop

# View logs
./manage.sh logs
./manage.sh logs-db

# Check status
./manage.sh status

# Create backup
./manage.sh backup

# Update to latest version
./manage.sh update

# Open shell in Gitea container
./manage.sh shell
```

## 🔧 Configuration

### Environment Variables

Edit `.env` file to configure:

| Variable | Description | Default |
|----------|-------------|---------|
| `GITEA_DOMAIN` | Domain for Gitea | `localhost` |
| `GITEA_ROOT_URL` | Full URL to Gitea | `http://localhost:3000/` |
| `GITEA_SSH_DOMAIN` | SSH domain | `localhost` |
| `GITEA_SSH_PORT` | SSH port | `2222` |
| `POSTGRES_PASSWORD` | Database password | (required) |
| `TUNNEL_TOKEN` | Cloudflare tunnel token | (optional) |

### Ports

| Port | Service | Description |
|------|---------|-------------|
| 3000 | Gitea Web | HTTP interface |
| 2222 | Gitea SSH | Git over SSH |

## 📊 Architecture

```
┌─────────────────┐
│   Cloudflare    │
│     Tunnel      │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────┐
│   cloudflared   │
│    (tunnel)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│  Gitea Server   │────▶│   PostgreSQL    │
│   (Port 3000)   │     │   (Database)    │
└─────────────────┘     └─────────────────┘
```

## 💾 Backup & Restore

### Backup

```bash
./manage.sh backup
```

Backups are saved to `backups/YYYYMMDD_HHMMSS/`.

### Restore

1. Stop services: `./manage.sh stop`
2. Restore data directories from backup
3. Start services: `./manage.sh start`

## 🔒 Security Notes

- Change default passwords in `.env`
- Use strong PostgreSQL password
- Enable HTTPS via Cloudflare Tunnel for production
- Consider disabling registration after creating users
- Regular backups recommended

## 📚 Useful Links

- [Gitea Documentation](https://docs.gitea.com/)
- [Cloudflare Tunnel Docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/)
- [Tunnelfy VS Code Extension](https://marketplace.visualstudio.com/items?itemName=Willbot.tunnelfy)

## 🐛 Troubleshooting

### Gitea won't start

```bash
# Check logs
./manage.sh logs

# Check database health
docker logs gitea-postgres
```

### Tunnel connection issues

```bash
# Verify token in .env
cat .env | grep TUNNEL_TOKEN

# Check tunnel logs
docker logs gitea-tunnel
```

### Permission issues

```bash
# Fix ownership (macOS)
sudo chown -R $USER:$USER gitea-data postgres-data
```
