# Gitea + Cloudflare Setup Guide

## Part 1 — Gitea: SSH Deploy Key

### Step 1 — Add the deploy key to your Gitea repo

1. Go to: **https://git.ebl.beauty/smayone/sovereignitity-solvy/settings/keys**
2. Click **Add Deploy Key**
3. Fill in:
   - **Title:** `Replit Deploy Key`
   - **Content:** paste the entire public key below
   - Check **Allow Write Access**
4. Click **Add Key**

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOBAjbunYjS1J47hLx0B+d1yskBro8O54aOd3HDh5aJe replit-deploy@solvy
```

### Step 2 — Test the connection (run in Replit Shell)

```bash
ssh -i ~/.ssh/gitea_deploy -T git@git.ebl.beauty
```

You should see: `Hi smayone! You've successfully authenticated...`

### Step 3 — Push to Gitea

```bash
cd unified-ecosystem
./git-push.sh "initial push"
```

Or manually:
```bash
git push origin main
```

---

## Part 2 — Gitea Webhook → VPS Auto-Deploy

This makes the VPS automatically pull and redeploy whenever you push to Gitea.

### Step A — Set up the webhook receiver on your VPS

SSH into your VPS and run:

```bash
ssh -i ~/.ssh/hetzner_key root@46.62.235.95

# Create the webhook receiver script
cat > /var/www/solvy-ecosystem/webhook.mjs << 'EOF'
import { createServer } from 'http';
import { exec } from 'child_process';

const SECRET = process.env.WEBHOOK_SECRET || 'change-me';
const PORT   = 9001;

createServer((req, res) => {
  if (req.method !== 'POST' || req.url !== '/webhook/deploy') {
    res.writeHead(404); res.end(); return;
  }

  let body = '';
  req.on('data', d => body += d);
  req.on('end', () => {
    const sig = req.headers['x-gitea-signature'];
    if (!sig) { res.writeHead(401); res.end('No signature'); return; }

    // Run the deploy script
    exec('cd /var/www/solvy-ecosystem && bash /var/www/solvy-ecosystem/auto-deploy.sh', (err, stdout, stderr) => {
      if (err) {
        console.error('Deploy error:', stderr);
        res.writeHead(500); res.end('Deploy failed');
      } else {
        console.log('Deployed:', stdout);
        res.writeHead(200); res.end('OK');
      }
    });
  });
}).listen(PORT, () => console.log(`Webhook receiver on port ${PORT}`));
EOF

# Create the auto-deploy script
cat > /var/www/solvy-ecosystem/auto-deploy.sh << 'EOF'
#!/bin/bash
set -e
echo "=== Auto-deploy started at $(date) ==="
cd /var/www/solvy-ecosystem

# Pull latest code from Gitea
git pull origin main

# Install any new dependencies
npm install --omit=dev --prefer-offline

# Rebuild the frontend
npm run build

# Copy fresh static files
rsync -az --delete dist/ /var/www/nitty.ebl.beauty/

# Restart backend
pm2 reload solvy-api

echo "=== Auto-deploy finished at $(date) ==="
EOF
chmod +x /var/www/solvy-ecosystem/auto-deploy.sh

# Start the webhook receiver with PM2
pm2 start /var/www/solvy-ecosystem/webhook.mjs --name solvy-webhook
pm2 save
```

### Step B — Add Gitea webhook

1. Go to: **https://git.ebl.beauty/smayone/sovereignitity-solvy/settings/hooks**
2. Click **Add Webhook → Gitea**
3. Fill in:
   - **Target URL:** `http://46.62.235.95:9001/webhook/deploy`
   - **Secret:** `change-me` (or pick your own secret)
   - **Trigger:** Push Events
4. Click **Add Webhook**

---

## Part 3 — Cloudflare DNS Records

Log in to **https://dash.cloudflare.com** → select **ebl.beauty** zone → go to **DNS → Records**

Delete any conflicting A/CNAME records first, then add these:

### A Records (all pointing to Hetzner VPS: 46.62.235.95)

| Type | Name            | IPv4 Address  | Proxy  | TTL  |
|------|-----------------|---------------|--------|------|
| A    | ebl.beauty      | 46.62.235.95  | ✅ ON  | Auto |
| A    | nitty           | 46.62.235.95  | ✅ ON  | Auto |
| A    | api             | 46.62.235.95  | ✅ ON  | Auto |
| A    | decidey         | 46.62.235.95  | ✅ ON  | Auto |
| A    | git             | 46.62.235.95  | ❌ OFF | Auto |

> **git.ebl.beauty must have proxy turned OFF** (gray cloud).  
> Gitea's SSH needs a direct connection — Cloudflare proxy breaks SSH.

### CNAME Records (optional subdomains)

| Type  | Name  | Target       | Proxy  | TTL  |
|-------|-------|--------------|--------|------|
| CNAME | www   | ebl.beauty   | ✅ ON  | Auto |
| CNAME | shop  | ebl.beauty   | ✅ ON  | Auto |

### MX Records (if using email)

| Type | Name      | Mail Server                | Priority | TTL  |
|------|-----------|----------------------------|----------|------|
| MX   | ebl.beauty | route1.mx.cloudflare.net  | 51       | Auto |
| MX   | ebl.beauty | route2.mx.cloudflare.net  | 26       | Auto |
| MX   | ebl.beauty | route3.mx.cloudflare.net  | 14       | Auto |

### SSL/TLS Settings

In Cloudflare dashboard → **SSL/TLS → Overview**:
- Set mode to: **Full (strict)**

In **SSL/TLS → Edge Certificates**:
- Enable **Always Use HTTPS**: ON
- Enable **HSTS**: ON (6 months, include subdomains)
- Minimum TLS Version: **TLS 1.2**

### Page Rules (optional but recommended)

| URL Pattern           | Setting                     |
|-----------------------|-----------------------------|
| `ebl.beauty/*`        | Cache Level: Standard       |
| `api.ebl.beauty/api/*`| Cache Level: Bypass         |
| `http://*.ebl.beauty/*` | Always Use HTTPS          |

### Firewall Rule — Block bad bots (optional)

In **Security → WAF → Custom Rules**:
```
(not cf.client.bot) and (http.request.uri.path contains "/wp-admin")
Action: Block
```

---

## Summary: Who Does What

| Domain              | Points to         | Cloudflare Proxy | Purpose                  |
|---------------------|-------------------|------------------|--------------------------|
| ebl.beauty          | 46.62.235.95      | ON               | Main EBL beauty site     |
| nitty.ebl.beauty    | 46.62.235.95      | ON               | SOLVY Ecosystem app      |
| api.ebl.beauty      | 46.62.235.95      | ON               | API endpoint             |
| decidey.ebl.beauty  | 46.62.235.95      | ON               | DECIDEY NGO              |
| git.ebl.beauty      | 46.62.235.95      | OFF ← important  | Gitea (needs direct SSH) |
| www.ebl.beauty      | → ebl.beauty      | ON               | WWW redirect             |
