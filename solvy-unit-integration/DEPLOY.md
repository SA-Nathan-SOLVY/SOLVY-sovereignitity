# Deploy SOLVY API to ebl.beauty

## Prerequisites
- Docker & Docker Compose installed
- ebl.beauty domain pointing to your server
- Unit.co API token

## Deploy Steps

### 1. Copy files to server
```bash
scp -r solvy-unit-integration user@your-server:/opt/
ssh user@your-server
cd /opt/solvy-unit-integration
```

### 2. Create .env file
```bash
cat > .env << EOF
UNIT_API_TOKEN=your_actual_unit_token_here
UNIT_API_URL=https://api.s.unit.sh
UNIT_ORG_ID=your_unit_org_id
SOLVY_ENV=production
SOLVY_WEBHOOK_SECRET=$(openssl rand -hex 32)
EOF
```

### 3. Start services
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 4. Verify
```bash
# Check API is running
curl http://localhost:3000/health

# Check nginx is serving frontend
curl http://localhost/

# Check API through nginx
curl http://localhost/api/health
```

### 5. Update DNS (if needed)
Make sure ebl.beauty points to your server's IP.

## Architecture

```
Internet
    │
    ▼
┌─────────────┐
│   Nginx     │  Port 80/443
│  (reverse   │  Serves static files
│   proxy)    │  Routes /api to Node
└──────┬──────┘
       │
   ┌───┴───┐
   │       │
   ▼       ▼
┌─────┐  ┌─────────┐
│HTML │  │solvy-api│  Port 3000
│CSS  │  │(Node.js)│
│JS   │  └─────────┘
└─────┘
```

## Testing

1. Visit https://ebl.beauty
2. Click "Get Your SOLVY Card"
3. Should load Unit onboarding form

## Logs

```bash
# API logs
docker logs solvy-api

# Nginx logs
docker logs solvy-nginx
```
