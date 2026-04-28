# AgentMail DNS Setup for solvy.cards
## Cloudflare Configuration

**Domain:** `solvy.cards`  
**Purpose:** Verified sending domain for SOLVY Ecosystem™ support email  
**Status:** ⏳ Add these records, then verify in AgentMail Console

---

## The Three Records

Add these in your Cloudflare dashboard → `solvy.cards` → **DNS** → **Records**

| Type | Name (Host) | Value | TTL | Purpose |
|------|-------------|-------|-----|---------|
| **TXT** | `@` (root) | `v=spf1 include:agentmail.to ~all` | Auto | SPF — authorizes AgentMail to send email for your domain |
| **CNAME** | `agentmail._domainkey` | `dkim.agentmail.to` | Auto | DKIM — cryptographic signature on every outbound email |
| **TXT** | `_dmarc` | `v=DMARC1; p=reject; rua=mailto:reports@agentmail.to` | Auto | DMARC — tells receivers to reject forged emails |

---

## Step-by-Step (Cloudflare)

1. Go to https://dash.cloudflare.com → Select `solvy.cards`
2. Click **DNS** in the left sidebar
3. Click **Add record**
4. Add each record above (Type → Name → Value → Save)
5. Wait 1–5 minutes for propagation
6. Run the verification script below

---

## Screenshot of What It Looks Like

```
Type    Name                    Value                                      TTL    Proxy status
───────────────────────────────────────────────────────────────────────────────────────────────
TXT     solvy.cards             v=spf1 include:agentmail.to ~all           Auto   DNS only
CNAME   agentmail._domainkey    dkim.agentmail.to                          Auto   DNS only
TXT     _dmarc.solvy.cards      v=DMARC1; p=reject; rua=mailto:...         Auto   DNS only
```

> ⚠️ **Important:** Set Proxy status to **DNS only** (gray cloud, not orange). Email DNS records must bypass Cloudflare's proxy.

---

## Verification Script

Run this Node.js script to verify the records are live:

```bash
cd solvy-unit-integration
node scripts/verify-agentmail-domain.js
```

If all three return ✅, go to https://console.agentmail.to → Domains → Add `solvy.cards` → Verify.

---

## What Each Record Does

### SPF (`v=spf1 include:agentmail.to ~all`)
- Tells Gmail, Outlook, etc: "AgentMail is allowed to send email for solvy.cards"
- The `~all` means soft-fail (mark suspicious, don't hard-reject)
- Change to `-all` after 30 days of stable sending for hard-fail

### DKIM (`agentmail._domainkey` → `dkim.agentmail.to`)
- Every email from support@solvy.cards is cryptographically signed
- Receivers verify the signature against this public key
- Prevents tampering in transit

### DMARC (`v=DMARC1; p=reject; ...`)
- Tells receivers: if SPF or DKIM fails, **reject** the email
- `rua=` sends aggregate reports to AgentMail for monitoring
- This is the strongest deliverability protection

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| "DNS record not found" | Wait 5 min, check Proxy status is **DNS only** |
| SPF fails | Ensure no conflicting SPF records. If you have others, merge: `v=spf1 include:agentmail.to include:other.com ~all` |
| DKIM fails | CNAME must be exact: `agentmail._domainkey` (not `_domainkey` alone) |
| DMARC fails | The `_dmarc` host is correct — don't add `.solvy.cards` in Cloudflare, it appends automatically |

---

## After Verification

1. In AgentMail Console, verify `solvy.cards`
2. Create inbox: `support@solvy.cards`
3. Copy the inbox ID to your VPS `.env`:
   ```bash
   AGENTMAIL_SUPPORT_INBOX_ID=<inbox-id-from-console>
   ```
4. Restart API: `pm2 restart solvy-api`
5. Test: send an email to `support@solvy.cards`, run the listener script

---

*Document: SOLVY-OPS-AGENTMAIL-DNS-2026-001*  
*For: S.A. Nathan LLC operations*  
*Domain: solvy.cards*
