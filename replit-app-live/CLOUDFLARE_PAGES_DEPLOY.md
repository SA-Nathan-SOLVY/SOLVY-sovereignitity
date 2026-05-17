# Cloudflare Pages Deployment Guide
## solvy-sovereignitity.pages.dev

---

### What Was Updated (May 6, 2026)

The following changes were made to `index.html` to reflect the reorganized S.A. Nathan LLC entity structure and ensure trademark compliance:

| Element | Before | After |
|---------|--------|-------|
| **Title Tag** | `Evergreen Beauty Lounge - Licensed Texas Cosmetology Services` | `Evergreen Beauty Lounge - Licensed Texas Cosmetology Services \| SOLVY Ecosystem™` |
| **Meta Description** | `Veteran-owned... Accept payments via SOLVY Card.` | `DBA of S.A. Nathan LLC... Accept payments via SOLVY Card™.` |
| **Header Badge** | `Licensed Professional • Veteran-Owned` | `Licensed Professional • Veteran-Family Owned` |
| **SOLVY Section Heading** | `Powered by SOLVY Ecosystem` | `Powered by SOLVY Ecosystem™` |
| **The Sheila Mandate** | Missing attribution | Added `— The Sheila Mandate` after mission quote |
| **SOLVY Card™ Labels** | `SOLVY Card Payments` (missing ™) | `SOLVY Card™ Payments` |
| **Footer Line 1** | `A proud client of S.A. Nathan LLC • Pilot partner of SOLVY Card` | `DBA of S.A. Nathan LLC (Texas File No. 805074128) • Pilot partner of SOLVY Card™` |
| **Footer Line 2** | Missing | `Product of SA Nathan LLC • SOLVY Ecosystem™` |
| **Copyright** | `© 2025 Evergreen Beauty Lounge` | `© 2026 Evergreen Beauty Lounge` |

---

## Deployment Options

### Option 1: GitHub → Cloudflare Pages (Auto-Deploy) ⭐ RECOMMENDED

If your Cloudflare Pages project is connected to the GitHub repository, simply push the changes:

```bash
cd /Users/smayone/Sovereignitity-Stack/replit-app-live

# Stage only the index.html change
git add index.html

# Commit with descriptive message
git commit -m "docs: update EBL page for S.A. Nathan LLC reorganization

- Update footer to reflect DBA relationship with Texas File No. 805074128
- Add SOLVY Ecosystem™ and SOLVY Card™ trademark symbols
- Update copyright to 2026
- Add 'The Sheila Mandate' attribution
- Change 'Veteran-Owned' to 'Veteran-Family Owned' for accuracy
- Add 'Product of SA Nathan LLC' per trademark guidelines"

# Push to main branch
git push origin main
```

Cloudflare Pages will automatically detect the push and trigger a new deployment. Monitor the build at:
https://dash.cloudflare.com → Pages → solvy-sovereignitity

---

### Option 2: Wrangler CLI (Direct Upload)

If you prefer to deploy directly without GitHub:

**Step 1: Install Wrangler**
```bash
npm install -g wrangler
```

**Step 2: Authenticate with Cloudflare**
```bash
wrangler login
```

**Step 3: Deploy**
```bash
cd /Users/smayone/Sovereignitity-Stack/replit-app-live
wrangler pages deploy . --project-name=solvy-sovereignitity
```

> Note: This uploads the entire `replit-app-live/` directory. Make sure no sensitive files (`.env`, secrets) are present.

---

### Option 3: Cloudflare Dashboard (Manual Upload)

1. Go to https://dash.cloudflare.com
2. Navigate to **Pages** → **solvy-sovereignitity**
3. Click **Create a new deployment**
4. Drag and drop the `replit-app-live/` folder
5. Click **Deploy**

---

## Post-Deployment Verification

After deployment, verify the following at https://solvy-sovereignitity.pages.dev:

- [ ] Page title shows `| SOLVY Ecosystem™`
- [ ] Footer shows `DBA of S.A. Nathan LLC (Texas File No. 805074128)`
- [ ] Footer shows `Product of SA Nathan LLC • SOLVY Ecosystem™`
- [ ] Copyright reads `© 2026`
- [ ] `SOLVY Card™` appears with trademark symbol
- [ ] No console errors

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Cloudflare build fails | Check build logs in Cloudflare dashboard; ensure no syntax errors in HTML |
| Changes not showing | Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R) |
| Wrong files deployed | Verify `.gitignore` excludes `node_modules/`, `.env`, and build artifacts |
| Custom domain issues | Check DNS records if using a custom domain alongside `.pages.dev` |

---

## Current Git Status

```
On branch main
Changes not staged for commit:
  modified:   index.html
```

Run the git commands in **Option 1** above to commit and deploy.
