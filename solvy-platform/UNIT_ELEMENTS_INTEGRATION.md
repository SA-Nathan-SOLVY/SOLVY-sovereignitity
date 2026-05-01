# Unit Elements Integration Guide

> For: Replit development team  
> Status: Scaffold ready — needs production credentials  
> Last updated: 2026-04-30

---

## Overview

SOLVY uses **Unit.co's White Label App (Ready To Launch)** component for embedded banking. Unit Elements renders the banking UI inside our app via iframe/WebView.

**Flow:**
```
Member opens app → Frontend requests JWT → Backend generates Unit token → 
Member loads Unit Elements (iframe) → Token authenticates member → 
Member sees their bank account, cards, transactions
```

---

## API Endpoints

### 1. Generate Unit Token

**Endpoint:** `POST /api/unit-token`

**Headers:**
```
Content-Type: application/json
X-Member-ID: [member-id]
```

**Body:**
```json
{
  "memberData": {
    "email": "member@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "phone": "5551234567",
    "ssn": "000000001",
    "dateOfBirth": "1990-01-01",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "postalCode": "10001"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "customerId": "12345",
  "expiresIn": 3600,
  "expiresAt": "2026-04-30T12:00:00Z",
  "environment": "sandbox"
}
```

**File:** `solvy-platform/api/unit-token.js`

---

### 2. Partner Review Token

**Endpoint:** `POST /api/partner-review-token`

**Body:**
```json
{
  "reviewerEmail": "reviewer@unit.co",
  "reviewType": "underwriting",
  "staffCode": "SOLVY-2025"
}
```

**Response:**
```json
{
  "success": true,
  "token": "abc123...",
  "reviewUrl": "https://solvy.cards/underwriting?review_token=abc123&reviewer=reviewer%40unit.co",
  "directUrl": "https://solvy.cards/underwriting",
  "expiresAt": "2026-05-01T12:00:00Z",
  "sessionId": "uuid"
}
```

**File:** `solvy-platform/api/partner-review-token.js`

---

## Environment Variables Required

Create `.env` in `solvy-platform/api/`:

```bash
# Unit.co Configuration
UNIT_API_URL=https://api.s.unit.sh
UNIT_TOKEN_URL=https://api.s.unit.sh/users-token
UNIT_PARTNER_ID=[your_partner_id]
UNIT_PARTNER_SECRET=[your_partner_secret]
UNIT_ORG_ID=[your_org_id]

# Environment
NODE_ENV=sandbox          # or 'production' post-launch
SOLVY_ENV=sandbox

# Security
SOLVY_REVIEW_SECRET=[random_secret_for_review_tokens]
SOLVY_REVIEW_STAFF_CODE=[staff_code_for_generating_review_tokens]

# CORS
ALLOWED_ORIGINS=https://ebl.beauty,https://solvy.cards,https://www.ebl.beauty
```

**Never commit `.env` to git.**

---

## Mobile App Integration

### Capacitor WebView → Unit Elements

In the native app, Unit Elements loads in a WebView. The token generation flow:

```javascript
// In Capacitor app (Dashboard.jsx or Card page)
import { Browser } from '@capacitor/browser';

async function openBanking() {
  // 1. Request token from backend
  const response = await fetch('https://api.ebl.beauty/api/unit-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Member-ID': memberId
    },
    body: JSON.stringify({ memberData })
  });
  
  const { token, customerId } = await response.json();
  
  // 2. Open Unit Elements with token
  const unitUrl = `https://ui.s.unit.sh/?token=${token}&customerId=${customerId}`;
  await Browser.open({ url: unitUrl });
}
```

### iOS Specific

In `solvy-cards/ios/App/App/Info.plist`, camera permissions are already added for receipt scanning.

**For Unit Elements iframe inside the app:**
- The Capacitor WebView handles the iframe automatically
- No additional iOS configuration needed

### Android Specific

In `solvy-cards/android/app/src/main/AndroidManifest.xml`, ensure `INTERNET` permission is present (it is by default).

**For Unit Elements:**
- Capacitor's WebView loads the banking UI
- The `capacitor.config.json` already configures `androidScheme: 'https'`

---

## Test Data (Sandbox)

### Test SSNs
| SSN | Result |
|-----|--------|
| `000000001` | Always approves |
| `000000002` | Requires document verification |
| `000000003` | Denied |

### Test Card Numbers
| Number | Result |
|--------|--------|
| `4111111111111111` | Visa success |
| `4000000000000002` | Declined |
| `4000000000000127` | Insufficient funds |

---

## Production Checklist

- [ ] Replace sandbox credentials with production Unit.co keys
- [ ] Set `NODE_ENV=production`
- [ ] Verify `ALLOWED_ORIGINS` includes all domains
- [ ] Enable webhook signature verification
- [ ] Set up Redis for token cache (currently in-memory)
- [ ] Configure `SOLVY_REVIEW_SECRET` and `SOLVY_REVIEW_STAFF_CODE`
- [ ] Test end-to-end flow with a real member
- [ ] Unit.co underwriting approved

---

## Files for Replit

| File | Purpose |
|------|---------|
| `api/unit-token.js` | JWT generation for Unit Elements |
| `api/partner-review-token.js` | Partner review access tokens |
| `api/webhooks/unit.js` | Transaction webhooks |
| `api/dividends.js` | 70/20/10 calculations |
| `UNIT_ELEMENTS_INTEGRATION.md` | This guide |

---

*SOLVY Ecosystem™ — Product of SA Nathan LLC*
