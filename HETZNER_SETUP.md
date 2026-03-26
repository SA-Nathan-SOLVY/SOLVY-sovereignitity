# SOLVY Deployment on Hetzner VPS

## Server Details
- **IP**: 46.62.235.95
- **Domain**: ebl.beauty
- **OS**: Ubuntu (assumed)

## Quick Deploy

### Option 1: Run the deploy script

```bash
# From your local machine
chmod +x DEPLOY_TO_HETZNER.sh
./DEPLOY_TO_HETZNER.sh
```

### Option 2: Manual deployment

```bash
# SSH to server
ssh root@46.62.235.95

# Install Docker
apt-get update
apt-get install -y docker.io docker-compose git

# Create directory
mkdir -p /opt/solvy
cd /opt/solvy

# Clone your repository (or upload files)
git clone https://gitea.ebl.beauty/smayone/solvy-platform.git .

# Or use SCP from local machine:
# scp -r solvy-unit-integration/* root@46.62.235.95:/opt/solvy/
# scp -r solvy-platform/* root@46.62.235.95:/opt/solvy/solvy-platform/
```

## Configuration

### 1. Create .env file

```bash
cd /opt/solvy
nano .env
```

Add:
```bash
UNIT_API_TOKEN=your_actual_unit_sandbox_token_here
UNIT_API_URL=https://api.s.unit.sh
UNIT_ORG_ID=your_unit_org_id_here
SOLVY_ENV=production
SOLVY_WEBHOOK_SECRET=your_random_secret_here
SOLVY_PORT=3000
```

### 2. Update frontend API URL

```bash
nano /opt/solvy/solvy-platform/onboarding.html
```

Change:
```javascript
const API_BASE = 'https://api.ebl.beauty';
```

To (for same-domain deployment):
```javascript
const API_BASE = 'https://ebl.beauty';
```

### 3. Start services

```bash
cd /opt/solvy
docker-compose -f docker-compose.prod.yml up -d
```

## DNS Configuration

Point your domain to the server:

```
Type    Name           Value                TTL
A       ebl.beauty     46.62.235.95         3600
A       api.ebl.beauty 46.62.235.95         3600
CNAME   www            ebl.beauty           3600
```

## SSL/HTTPS (Let's Encrypt)

```bash
# Install certbot
apt-get install -y certbot python3-certbot-nginx

# Get certificates
certbot --nginx -d ebl.beauty -d api.ebl.beauty

# Auto-renewal is set up automatically
```

## Verify Deployment

```bash
# Check containers
docker ps

# Check API health
curl http://localhost:3000/health

# Check nginx
curl http://localhost/

# View logs
docker logs solvy-api
docker logs solvy-nginx
```

## Access URLs

Once deployed:
- **Website**: https://ebl.beauty
- **Onboarding**: https://ebl.beauty/onboarding.html
- **API**: https://ebl.beauty/api/health
- **Webhook**: https://ebl.beauty/webhooks/unit

## Update Unit Webhook URL

In Unit dashboard:
1. Go to Developer → Webhooks
2. Update endpoint to: `https://ebl.beauty/webhooks/unit`

## Troubleshooting

### Container won't start
```bash
docker logs solvy-api
docker logs solvy-nginx
```

### Port conflicts
```bash
# Check what's using port 80
netstat -tlnp | grep :80

# Stop conflicting service
systemctl stop apache2  # or nginx if running native
```

### Permission issues
```bash
chown -R root:root /opt/solvy
chmod -R 755 /opt/solvy
```

## Maintenance

### Update code
```bash
cd /opt/solvy
git pull  # if using git
docker-compose restart
```

### Backup
```bash
# Backup data
tar czf /backup/solvy-$(date +%Y%m%d).tar.gz /opt/solvy
```

### Monitor
```bash
# View real-time logs
docker-compose logs -f

# Check resource usage
docker stats
```

---

## Testing Checklist

- [ ] Website loads at https://ebl.beauty
- [ ] "Get Your SOLVY Card" button clickable
- [ ] Onboarding page loads Unit form
- [ ] API health check passes
- [ ] Webhook receiving events
- [ ] SSL certificate valid

---

**Support**: Check logs with `docker logs solvy-api` if issues occur.
