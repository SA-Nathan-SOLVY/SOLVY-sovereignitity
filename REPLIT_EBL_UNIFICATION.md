# Replit + ebl.beauty Unification Plan
## Single Source of Truth for SOLVY Web Presence

**Goal:** Consolidate all web content to one location, served by both Replit and ebl.beauty

---

## 📁 SOURCE OF TRUTH: `replit-deploy/`

This folder contains the complete, unified website:
- Original Replit content (index.html, about.html, ibc/, sps/)
- New pages (heritage.html, manifesto.html, sovereignty-vs-hustle.html)
- All assets (logos, images, brochures)

### Files in replit-deploy/:
```
replit-deploy/
├── index.html              ← Main landing page
├── about.html              ← About page
├── heritage.html           ← NEW: Freedman/H.R.40/GENIUS
├── manifesto.html          ← NEW: SOLVY Manifesto
├── sovereignty-vs-hustle.html  ← NEW: Anti-hustle culture
├── assets/                 ← Logos, images
│   ├── solvy-crown-icon.png
│   ├── solvy-full-logo.png
│   ├── hero_payment_image.webp
│   └── ...
├── ibc/                    ← IBC practitioner section
│   └── index.html
├── sps/                    ← SPS Joint Venture section
│   └── index.html
├── sps-presentation/       ← Presentation assets
└── brochures/              ← PDF brochures
```

---

## 🚀 OPTION 1: Replit as Primary (Recommended)

**Setup:** Replit hosts the content, ebl.beauty redirects to it

### How it works:
1. **Replit:** https://sovereignitity-solvy.replit.app serves all pages
2. **ebl.beauty:** Redirects or proxies to Replit

### DNS Configuration (Cloudflare):

| Domain | Type | Target | Setup |
|--------|------|--------|-------|
| ebl.beauty | CNAME | sovereignitity-solvy.replit.app | Redirect/Pagerule |
| www.ebl.beauty | CNAME | sovereignitity-solvy.replit.app | Redirect |

### Cloudflare Page Rule:
```
URL: ebl.beauty/*
Setting: Forwarding URL (301)
Target: https://sovereignitity-solvy.replit.app/$1
```

### Pros:
- ✅ Simple: One codebase on Replit
- ✅ Automatic updates when you deploy to Replit
- ✅ No server maintenance on Hetzner
- ✅ SSL handled by Replit

### Cons:
- ❌ Replit branding visible (minor)
- ❌ Dependent on Replit uptime

---

## 🖥️ OPTION 2: Hetzner (ebl.beauty) as Primary

**Setup:** Hetzner serves the content, Replit pulls from it (or mirrors)

### How it works:
1. **Hetzner:** https://ebl.beauty serves all pages from `/var/www/ebl.beauty`
2. **Replit:** Either mirrors content or iframe/embeds from ebl.beauty

### Deployment Script:
```bash
# Deploy replit-deploy/ to Hetzner
rsync -avz replit-deploy/ root@46.62.235.95:/var/www/ebl.beauty/
```

### Pros:
- ✅ Full control on your VPS
- ✅ Custom domain branding
- ✅ Can add backend services (API, webhooks)
- ✅ No Replit dependency

### Cons:
- ❌ Manual deployment required
- ❌ SSL certificates to manage
- ❌ Server maintenance

---

## 🔄 OPTION 3: Git-Sync (Hybrid)

**Setup:** Gitea is source of truth, both Replit and Hetzner pull from it

### How it works:
1. **Git:** Push to https://gitea.ebl.beauty/smayone/solvy-platform
2. **Replit:** Auto-deploys from git
3. **Hetzner:** Auto-deploys from git (via webhook)

### Setup:
1. Configure Replit to deploy from Gitea
2. Configure Hetzner to pull on git push
3. Push once, deploy everywhere

### Pros:
- ✅ True single source of truth (git)
- ✅ Version control for all changes
- ✅ Both sites stay in sync
- ✅ Rollback capability

### Cons:
- ❌ More complex setup
- ❌ Requires CI/CD configuration

---

## ✅ RECOMMENDED: Option 1 (Replit Primary)

### Step-by-Step Setup:

#### 1. Ensure Replit has all content
Upload `replit-deploy/` contents to your Replit project

#### 2. Configure Cloudflare DNS
```
Type: CNAME
Name: @ (root)
Target: sovereignitity-solvy.replit.app
TTL: Auto
Proxy: Enabled (orange cloud)
```

#### 3. Add Page Rule (Cloudflare)
```
URL: ebl.beauty/*
Setting: Forwarding URL
Status: 301 Permanent Redirect
Destination: https://sovereignitity-solvy.replit.app/$1
```

#### 4. SSL/TLS Settings (Cloudflare)
```
Mode: Full (strict)
Always Use HTTPS: ON
```

#### 5. Test
- https://ebl.beauty → should redirect to Replit
- https://ebl.beauty/heritage.html → should show heritage page
- https://sovereignitity-solvy.replit.app/heritage.html → direct access

---

## 📋 CHECKLIST: Before Binding

### Verify Replit Content:
- [ ] https://sovereignitity-solvy.replit.app loads
- [ ] https://sovereignitity-solvy.replit.app/heritage.html loads
- [ ] https://sovereignitity-solvy.replit.app/manifesto.html loads
- [ ] https://sovereignitity-solvy.replit.app/sovereignty-vs-hustle.html loads
- [ ] All images/assets load correctly
- [ ] Navigation works between pages

### Verify DNS:
- [ ] Cloudflare DNS record for ebl.beauty
- [ ] Page rule configured
- [ ] SSL/TLS settings correct
- [ ] Test with `dig ebl.beauty`

---

## 🔧 ALTERNATIVE: Simple Subdomain Approach

Keep both active but use subdomains:

| URL | Purpose |
|-----|---------|
| https://ebl.beauty | Main site (Hetzner) |
| https://replit.ebl.beauty | Replit mirror (CNAME to Replit) |
| https://sovereignitity-solvy.replit.app | Direct Replit access |

This gives you:
- Main site on your domain (ebl.beauty)
- Replit as backup/subdomain
- Direct Replit for development

---

## 💡 MY RECOMMENDATION

**For simplicity:** Use **Option 1** (Replit primary)

1. Replit already has all the content
2. No server maintenance
3. Automatic SSL
4. Easy updates

**If you want full control:** Use **Option 2** (Hetzner primary)

1. Deploy `replit-deploy/` to `/var/www/ebl.beauty`
2. Keep Replit as dev/staging
3. Full server control

Which option do you prefer?
