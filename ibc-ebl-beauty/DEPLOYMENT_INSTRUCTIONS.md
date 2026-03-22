# IBC.EBL.BEAUTY Deployment Instructions

## Files Created
- `index.html` - Main IBC presentation page with embedded slides
- `nginx-config-ibc.ebl.beauty` - Nginx server configuration

## Step 1: Upload Files to VPS

```bash
# SSH into your VPS
ssh root@46.62.235.95

# Create directory for ibc.ebl.beauty
sudo mkdir -p /var/www/ibc.ebl.beauty

# Set proper ownership
sudo chown -R www-data:www-data /var/www/ibc.ebl.beauty
```

Then upload the `index.html` file to `/var/www/ibc.ebl.beauty/`

You can use SCP from your local machine:
```bash
scp index.html root@46.62.235.95:/var/www/ibc.ebl.beauty/
```

## Step 2: Install Nginx Configuration

```bash
# SSH into your VPS
ssh root@46.62.235.95

# Copy the nginx config to sites-available
sudo cp nginx-config-ibc.ebl.beauty /etc/nginx/sites-available/ibc.ebl.beauty

# Create symbolic link to enable the site
sudo ln -s /etc/nginx/sites-available/ibc.ebl.beauty /etc/nginx/sites-enabled/

# Test nginx configuration
sudo nginx -t

# If test passes, reload nginx
sudo systemctl reload nginx
```

## Step 3: Add DNS Record in Cloudflare

1. Go to **Cloudflare Dashboard** → Select **ebl.beauty** domain
2. Click **DNS** tab
3. Click **Add record**
4. Configure:
   - **Type**: A
   - **Name**: ibc
   - **IPv4 address**: 46.62.235.95
   - **Proxy status**: Proxied (orange cloud) ✅
   - **TTL**: Auto
5. Click **Save**

## Step 4: Verify Deployment

After DNS propagates (usually 1-5 minutes):

```bash
# Test DNS resolution
dig ibc.ebl.beauty A +short

# Test HTTP response
curl -I https://ibc.ebl.beauty
```

Visit in browser: **https://ibc.ebl.beauty**

## Step 5: (Optional) Add SSL Certificate

If you want a dedicated SSL certificate (Cloudflare provides one automatically when proxied):

```bash
# Install certbot if not already installed
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d ibc.ebl.beauty
```

## Troubleshooting

**If site doesn't load:**
1. Check nginx error logs: `sudo tail -f /var/log/nginx/ibc.ebl.beauty.error.log`
2. Verify DNS: `dig ibc.ebl.beauty A +short`
3. Check file permissions: `ls -la /var/www/ibc.ebl.beauty/`
4. Restart nginx: `sudo systemctl restart nginx`

**If you see 502 Bad Gateway:**
- Check nginx is running: `sudo systemctl status nginx`
- Check nginx configuration: `sudo nginx -t`

## Files Location Summary

- **Website files**: `/var/www/ibc.ebl.beauty/`
- **Nginx config**: `/etc/nginx/sites-available/ibc.ebl.beauty`
- **Nginx symlink**: `/etc/nginx/sites-enabled/ibc.ebl.beauty`
- **Access logs**: `/var/log/nginx/ibc.ebl.beauty.access.log`
- **Error logs**: `/var/log/nginx/ibc.ebl.beauty.error.log`

## Contact

For issues: team@ebl.beauty
