# Treasury Prime — Server Wiring Guide
**For:** solvy-unit-integration/server.js  
**Purpose:** Connect the vendor-agnostic banking router to your existing Express server

---

## What Was Built

| File | Location | Purpose |
|------|----------|---------|
| `vendor-config.js` | `api/vendor-config.js` | Switch between Unit.co and Treasury Prime |
| `adapters/treasuryprime.js` | `api/adapters/treasuryprime.js` | Treasury Prime API client |
| `adapters/unit.js` | `api/adapters/unit.js` | Refactored Unit.co client |
| `banking-router.js` | `api/banking-router.js` | Generic `/api/banking/*` endpoints |
| `banking/index.html` | `banking/index.html` | New vendor-agnostic portal |

---

## Step 1: Add Environment Variables

Add to your `.env` file:

```bash
# Banking Vendor Switch
BANKING_VENDOR=treasuryprime

# Treasury Prime Credentials
TP_API_KEY_ID=your_tp_api_key_id
TP_API_SECRET=your_tp_api_secret
TP_WEBHOOK_SECRET=your_tp_webhook_secret

# Unit.co Credentials (keep for fallback)
UNIT_PARTNER_ID=your_unit_partner_id
UNIT_PARTNER_SECRET=your_unit_partner_secret
UNIT_ORG_ID=your_unit_org_id
```

---

## Step 2: Wire Into server.js

Add these lines to `solvy-unit-integration/server.js`:

```javascript
// Add at the top with other imports
const { setupBankingRoutes } = require('../solvy-platform/api/banking-router');

// Add after middleware setup
setupBankingRoutes(app);
```

**Full example:**

```javascript
require('dotenv').config();
const express = require('express');
const app = express();

// NEW: Vendor-agnostic banking router
const { setupBankingRoutes } = require('../solvy-platform/api/banking-router');

// Middleware
app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf; } }));

// NEW: Register banking routes
setupBankingRoutes(app);

// Existing routes...
app.get('/health', (req, res) => { ... });
app.post('/api/members/onboard', async (req, res) => { ... });
// ... etc
```

---

## Step 3: Switch Vendors

Change **one** environment variable. Restart server. Done.

```bash
# Use Treasury Prime
BANKING_VENDOR=treasuryprime

# Use Unit.co (fallback)
BANKING_VENDOR=unit
```

---

## New API Endpoints Available

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/banking/status` | GET | Check active vendor |
| `/api/banking/balance` | GET | Get account balance |
| `/api/banking/transactions` | GET | Get transactions |
| `/api/banking/cards` | GET | List cards |
| `/api/banking/card/freeze` | POST | Freeze card |
| `/api/banking/card/unfreeze` | POST | Unfreeze card |
| `/api/banking/onboard` | POST | Create account + card |
| `/api/banking/webhook` | POST | Receive vendor webhooks |

---

## Frontend Integration

The new `/banking` portal calls these generic endpoints:

```javascript
// Get balance (works with ANY vendor)
const res = await fetch('/api/banking/balance?accountId=acct_xxx');
const data = await res.json();
// { available: "2547.83", current: "2547.83", vendor: "Treasury Prime" }

// Freeze card (works with ANY vendor)
await fetch('/api/banking/card/freeze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ cardId: 'card_xxx' })
});
```

---

## Testing

```bash
# 1. Check vendor status
curl http://localhost:3000/api/banking/status

# 2. Test balance (uses demo data if API not configured)
curl "http://localhost:3000/api/banking/balance?accountId=demo"

# 3. Test card freeze
curl -X POST http://localhost:3000/api/banking/card/freeze \
  -H "Content-Type: application/json" \
  -d '{"cardId": "demo_card_001"}'
```

---

## File Structure

```
solvy-unit-integration/
├── server.js              ← Add 2 lines here
├── .env                   ← Add TP credentials
└── ...existing files...

solvy-platform/
├── api/
│   ├── vendor-config.js      ← Vendor switcher
│   ├── banking-router.js     ← Generic endpoints
│   └── adapters/
│       ├── treasuryprime.js  ← TP API client
│       └── unit.js           ← Unit.co client
├── banking/
│   └── index.html            ← Vendor-agnostic portal
└── ...
```

---

## Next Steps

1. **Add TP credentials to `.env`**
2. **Add 2 lines to `server.js`**
3. **Restart server**
4. **Test at** `/api/banking/status`
5. **Open** `/banking` in browser

If Treasury Prime delivers production access tomorrow, change `BANKING_VENDOR=treasuryprime` and you're live.
