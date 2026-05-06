# Cloudflare Pro WAF Configuration Guide
# For: ebl.beauty + solvy.cards
# Created: May 4, 2026
# Plan: Cloudflare Pro ($240/yr)

---

## 1. WAF Managed Rules (Enable All)

Path: **Security** → **WAF** → **Managed Rules**

| Rule Group | Setting | Why |
|------------|---------|-----|
| **Cloudflare Managed Ruleset** | ON | Proprietary threat intelligence |
| **OWASP Core Rule Set** | ON | Industry standard for web app security |
| **Cloudflare Exposed Credentials Check** | ON | Detects leaked credentials |
| **Cloudflare Sensitive Data Detection** | ON | Prevents data exfiltration |

### OWASP Core Rule Set Sensitivity
- **Sensitivity:** High
- **Action:** Block
- **Paranoia Level:** 2 (default for Pro)

---

## 2. Custom WAF Rules (Create These)

Path: **Security** → **WAF** → **Custom Rules**

### Rule 1: Block Known Bad IPs
```
Expression: (ip.src in $cloudflare_open_proxy)
Action: Block
```

### Rule 2: Challenge Suspicious Countries (Optional)
If you want to challenge traffic from high-risk countries:
```
Expression: (ip.geoip.country in {"CN" "RU" "KP" "IR"})
Action: Managed Challenge
```
*Only enable if you don't expect legitimate users from these regions*

### Rule 3: Rate Limit API Endpoints
```
Expression: (http.request.uri.path contains "/api/")
Action: Block
Rate: 30 requests per 10 seconds
```

### Rule 4: Block Direct IP Access
```
Expression: (not ssl and ip.src ne 46.62.235.95)
Action: Block
```
*Prevents attackers from hitting your origin IP directly*

### Rule 5: Block Common Exploit Paths
```
Expression: (
  http.request.uri.path contains "/wp-admin" or
  http.request.uri.path contains "/.env" or
  http.request.uri.path contains "/config.php" or
  http.request.uri.path contains "/phpmyadmin" or
  http.request.uri.path contains "/administrator"
)
Action: Block
```

---

## 3. Bot Management

Path: **Security** → **Bots**

| Setting | Value |
|---------|-------|
| **Bot Fight Mode** | ON |
| **Auto-bot detection** | ON |
| **Verified bots** | Allow (Google, Bing, etc.) |

---

## 4. Rate Limiting Rules

Path: **Security** → **WAF** → **Rate Limiting Rules**

### Rule 1: General Site Protection
- **If:** Any request
- **Threshold:** 100 requests per 1 minute
- **Action:** Challenge
- **Duration:** 1 hour

### Rule 2: Login/Onboarding Protection
- **If:** URI Path contains `/login` OR `/onboarding` OR `/api/auth`
- **Threshold:** 5 requests per 1 minute
- **Action:** Block
- **Duration:** 1 hour

### Rule 3: Card Application Protection
- **If:** URI Path contains `/apply` OR `/card` OR `/api/members`
- **Threshold:** 10 requests per 1 minute
- **Action:** Challenge
- **Duration:** 30 minutes

---

## 5. Page Rules (Caching + Performance)

Path: **Rules** → **Page Rules**

### Rule 1: Cache Static Assets
- **URL:** `*ebl.beauty/assets/*` and `*solvy.cards/assets/*`
- **Settings:**
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month
  - Browser Cache TTL: 1 month

### Rule 2: No Cache for API
- **URL:** `*ebl.beauty/api/*` and `*solvy.cards/api/*`
- **Settings:**
  - Cache Level: Bypass

### Rule 3: Always HTTPS
- **URL:** `http://*ebl.beauty/*` and `http://*solvy.cards/*`
- **Settings:**
  - Always Use HTTPS: ON

### Rule 4: Forward WWW to Root (solvy.cards)
- **URL:** `www.solvy.cards/*`
- **Settings:**
  - Forwarding URL: 301 Redirect to `https://solvy.cards/$1`

---

## 6. SSL/TLS Settings

Path: **SSL/TLS** → **Overview**

| Setting | Value |
|---------|-------|
| **Encryption mode** | Full (strict) |
| **Always Use HTTPS** | ON |
| **Automatic HTTPS Rewrites** | ON |
| **TLS 1.3** | ON |
| **Minimum TLS Version** | 1.2 |

### Edge Certificates
- **Universal SSL:** ON (Cloudflare handles this)
- **Always Use HTTPS:** ON

### Origin Certificates (On VPS)
Path: **SSL/TLS** → **Origin Server**
- Create Origin CA certificate for: `ebl.beauty, *.ebl.beauty, solvy.cards, *.solvy.cards`
- Install on VPS nginx
- Valid for: 15 years

---

## 7. Security Headers

Path: **Rules** → **Transform Rules** → **Managed Transforms**

Enable:
- [x] Add security headers
- [x] Remove visitor IP headers

Or add via Response Header Modification:
| Header | Value |
|--------|-------|
| `X-Frame-Options` | `SAMEORIGIN` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |

---

## 8. DDoS Protection

Path: **Security** → **DDoS**

| Setting | Value |
|---------|-------|
| **HTTP DDoS Attack Protection** | High |
| **Sensitivity** | High |
| **Action** | Block |

---

## 9. DNS Security

Path: **DNS** → **Settings**

| Setting | Value |
|---------|-------|
| **DNSSEC** | ON (after transfer completes) |
| **CNAME Flattening** | Flatten all CNAMEs |

---

## 10. Monitoring

Path: **Security** → **Events**

Check this regularly to see:
- Blocked threats
- Bot challenges
- Rate limit hits
- Top blocked countries

---

## Quick Reference: Security Level

Path: **Security** → **Settings**

| Setting | Value | Note |
|---------|-------|------|
| **Security Level** | High | Challenges suspicious visitors |
| **Challenge Passage** | 30 minutes | How long a passed challenge lasts |
| **Browser Integrity Check** | ON | Blocks bad browsers/bots |

---

*Last updated: May 4, 2026*
*For questions, check Cloudflare Security Events dashboard first*
