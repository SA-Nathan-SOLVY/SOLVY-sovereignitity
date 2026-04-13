# OPTION 1 Implementation: Replit as Primary
## Step-by-Step Guide

---

## STEP 1: Upload Content to Replit

### Option A: Direct Upload via Replit UI
1. Go to https://replit.com/@smayone/solvy-sovereignitity
2. Click "Upload" button (or drag & drop)
3. Upload all files from `replit-deploy/` folder

### Option B: Git Import (Recommended)
1. In Replit: Click "Import from GitHub"
2. Or use Gitea URL: https://gitea.ebl.beauty/smayone/solvy-platform
3. Select `replit-deploy/` folder as root

### Option C: Manual Copy/Paste
Copy content from these files into Replit:
- `index.html` → Paste into Replit index.html
- `heritage.html` → Create new file
- `manifesto.html` → Create new file  
- `sovereignty-vs-hustle.html` → Create new file
- `about.html` → Paste/update
- `assets/` folder → Upload all images

---

## STEP 2: Test on Replit

After uploading, verify these URLs work:

```
✅ https://sovereignitity-solvy.replit.app/
✅ https://sovereignitity-solvy.replit.app/index.html
✅ https://sovereignitity-solvy.replit.app/about.html
✅ https://sovereignitity-solvy.replit.app/heritage.html
✅ https://sovereignitity-solvy.replit.app/manifesto.html
✅ https://sovereignitity-solvy.replit.app/sovereignty-vs-hustle.html
✅ https://sovereignitity-solvy.replit.app/ibc/index.html
✅ https://sovereignitity-solvy.replit.app/sps/index.html
```

Click each link and verify:
- Page loads without errors
- Images display (crown logo, hero image)
- Navigation works
- Mobile menu works (resize browser)

---

## STEP 3: Configure Cloudflare DNS

### 3.1 DNS Records

Login to https://dash.cloudflare.com → Select ebl.beauty

**Add these DNS Records:**

| Type | Name | Target | Proxy Status |
|------|------|--------|--------------|
| CNAME | @ | `sovereignitity-solvy.replit.app` | 🟡 DNS only (gray cloud) |
| CNAME | www | `sovereignitity-solvy.replit.app` | 🟡 DNS only (gray cloud) |

**IMPORTANT:** Keep cloud GRAY (DNS only) for now

### 3.2 Page Rules (Required for Redirect)

Go to: Rules → Page Rules

**Create Page Rule:**

```
URL: ebl.beauty/*
Setting: Forwarding URL
Status Code: 301 - Permanent Redirect
Destination URL: https://sovereignitity-solvy.replit.app/$1
```

**Create Second Page Rule (for www):**

```
URL: www.ebl.beauty/*
Setting: Forwarding URL
Status Code: 301 - Permanent Redirect
Destination URL: https://sovereignitity-solvy.replit.app/$1
```

### 3.3 SSL/TLS Settings

Go to: SSL/TLS → Overview

Set to: **"Full (strict)"**

Go to: SSL/TLS → Edge Certificates

Enable: **"Always Use HTTPS"** - ON

---

## STEP 4: Verify the Binding

### Test DNS
```bash
# In terminal (Mac/Linux)
dig ebl.beauty

# Should show CNAME to sovereignitity-solvy.replit.app
```

### Test Redirect
```bash
# Check redirect
curl -I https://ebl.beauty

# Should show:
# HTTP/2 301
# Location: https://sovereignitity-solvy.replit.app/
```

### Test Pages
```bash
# Test heritage page redirect
curl -I https://ebl.beauty/heritage.html

# Should redirect to:
# https://sovereignitity-solvy.replit.app/heritage.html
```

### Browser Test
1. Open https://ebl.beauty
2. Should redirect to https://sovereignitity-solvy.replit.app
3. URL bar should show: sovereignitity-solvy.replit.app
4. Click navigation links
5. Verify all pages work

---

## STEP 5: Optional - Enable Cloudflare Proxy (Orange Cloud)

**After everything works**, you can enable Cloudflare features:

### Enable Proxy
Go to DNS records, click cloud to turn ORANGE 🟠

**Benefits:**
- DDoS protection
- CDN caching
- Analytics
- Firewall rules

**Risks:**
- May cause redirect loops if not configured right
- Test thoroughly after enabling

---

## TROUBLESHOOTING

### Issue: ebl.beauty shows "Error 1001"
**Solution:** Cloudflare can't resolve Replit. Ensure CNAME is correct.

### Issue: Redirect loop
**Solution:** Disable orange cloud (proxy) or check page rules.

### Issue: Images not loading
**Solution:** Upload assets folder to Replit. Check paths in HTML.

### Issue: Page not found (404)
**Solution:** Check file is uploaded to Replit. Verify filename matches.

---

## COMPLETION CHECKLIST

- [ ] All files uploaded to Replit
- [ ] https://sovereignitity-solvy.replit.app works
- [ ] Cloudflare CNAME record added
- [ ] Page rules configured
- [ ] SSL/TLS set to Full (strict)
- [ ] https://ebl.beauty redirects to Replit
- [ ] All sub-pages redirect correctly
- [ ] Mobile navigation works
- [ ] Images display properly

---

## RESULT

After completion:
- ✅ Single website: Replit hosts everything
- ✅ ebl.beauty redirects to Replit
- ✅ Simple management: Update Replit = update both
- ✅ Automatic SSL on both domains
- ✅ No Hetzner server maintenance needed

**Your website:** https://ebl.beauty → https://sovereignitity-solvy.replit.app
