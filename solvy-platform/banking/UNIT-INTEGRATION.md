# SOLVY Banking Portal - Unit Integration

## Overview

This document describes the integration between SOLVY Cooperative and Unit.co banking infrastructure using the **Unit Elements White Label App** component.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       MEMBER BROWSER                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Accounts   │  │   Privacy    │  │  Dividends   │          │
│  │    (Unit)    │  │  Dashboard   │  │  70/20/10    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         │                 │                 │                   │
│         └─────────────────┼─────────────────┘                   │
│                           │                                     │
│              ┌────────────┴────────────┐                       │
│              │    IndexedDB (local)    │  ← Data Sovereignty   │
│              │  • Transactions         │                       │
│              │  • Aggregates           │                       │
│              │  • Privacy settings     │                       │
│              └─────────────────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SOLVY API SERVER                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ /unit-token  │  │ /dividends   │  │ /webhooks/unit│          │
│  │   JWT gen    │  │  70/20/10    │  │  Interchange │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         │                 │                 │                   │
│         └─────────────────┼─────────────────┘                   │
│                           │                                     │
│              ┌────────────┴────────────┐                       │
│              │      Unit.co API        │  ← Banking Partner    │
│              │  • White Label App      │    (Thread Bank)      │
│              │  • Card issuing         │                       │
│              │  • Transaction webhooks │                       │
│              └─────────────────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
```

## Files Created

### Frontend
- `banking/index.html` - Main banking portal with 4 tabs:
  - **Accounts & Cards** - Unit White Label App integration
  - **Data Sovereignty** - Privacy dashboard with local-first stats
  - **Dividends** - 70/20/10 distribution display
  - **Governance** - Cooperative voting interface

### Backend APIs
- `api/unit-token.js` - JWT token generation for Unit Elements
- `api/dividends.js` - 70/20/10 dividend calculations
- `api/webhooks/unit.js` - Transaction event processing

## 70/20/10 Economic Model

### Revenue Flow

```
Interchange Revenue (from Unit/Thread Bank)
         │
         ▼
    ┌─────────┐
    │  100%   │ ← Total transaction volume
    └────┬────┘
         │
    ┌────┴────┐
    │  1.5%   │ ← Average interchange rate
    │   fee   │
    └────┬────┘
         │
    ┌────┴────┐
    │  20%    │ ← SOLVY cooperative share
    │  share  │
    └────┬────┘
         │
    ┌────┴──────────────────────────────┐
    │        DISTRIBUTION                │
    ├──────────┬──────────┬─────────────┤
    │   70%    │   20%    │    10%      │
    │ Members  │ Community│ Operations  │
    │ Dividends│   Pool   │             │
    └──────────┴──────────┴─────────────┘
```

### Example Calculation

For a $100 transaction:
- Interchange: $100 × 1.5% = $1.50
- SOLVY share: $1.50 × 20% = $0.30
- Distribution:
  - Members: $0.30 × 70% = $0.21
  - Community: $0.30 × 20% = $0.06
  - Operations: $0.30 × 10% = $0.03

## Local-First Data Sovereignty

### Privacy Architecture

1. **Raw transaction data** → Stored locally in IndexedDB
2. **Aggregates only** → Sent to cooperative pool (if opted in)
3. **AI insights** → Generated locally, never shared
4. **Voting rights** → One member, one vote on data use

### Data Flow

```
Transaction
    │
    ▼
┌──────────────┐
│ IndexedDB    │ ← Local storage
│ (Dexie.js)   │
└──────┬───────┘
       │
       ├──────────────┐
       │              │
       ▼              ▼
┌──────────┐  ┌──────────────┐
│ Private  │  │  Aggregated  │
│ Analysis │  │  Pool Data   │ ← Optional opt-in
│ (Local)  │  │  (Anon only) │
└──────────┘  └──────────────┘
```

## Configuration

### Environment Variables

```bash
# Unit.co API
UNIT_API_URL=https://api.s.unit.sh
UNIT_TOKEN_URL=https://api.s.unit.sh/users-token
UNIT_PARTNER_ID=your_partner_id
UNIT_PARTNER_SECRET=your_partner_secret
UNIT_WEBHOOK_SECRET=your_webhook_secret

# Environment
NODE_ENV=sandbox  # or 'production'
```

### Webhook Endpoint

Register with Unit:
```
POST https://api.s.unit.sh/webhooks
{
  "data": {
    "type": "webhook",
    "attributes": {
      "url": "https://solvy.coop/api/webhooks/unit",
      "token": "your_webhook_secret"
    }
  }
}
```

## Integration Points

### 1. Unit White Label App

```html
<script async src="https://ui.s.unit.sh/release/latest/components-extended.js"></script>
<unit-elements-white-label-app jwt-token="{{JWTToken}}"></unit-elements-white-label-app>
```

Token generation:
```javascript
const response = await fetch('/api/unit-token', {
  method: 'POST',
  credentials: 'include'
});
const { token } = await response.json();
```

### 2. Dividend API

```javascript
const response = await fetch('/api/dividends', {
  credentials: 'include'
});
const data = await response.json();
// Returns: { memberShare, communityShare, opsShare, roi }
```

### 3. Webhook Events

Unit sends events to `/api/webhooks/unit`:
- `authorization` - Transaction processed
- `card` - Card status changes
- `account` - Account status changes

## Security

### Signature Verification

All webhooks are verified with HMAC-SHA256:

```javascript
const expected = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(payload)
  .digest('hex');
  
return crypto.timingSafeEqual(
  Buffer.from(signature),
  Buffer.from(expected)
);
```

### Data Encryption

- Member IDs: SHA-256 hashed
- Pooled data: AES-256-GCM encrypted
- 30-day auto-delete for pooled data

## Testing

### Sandbox Mode

Set `NODE_ENV=sandbox` to use mock tokens and test data.

### Test Transactions

Use Unit's test card numbers:
- `4111111111111111` - Visa success
- `4000000000000002` - Declined
- `4000000000000127` - Insufficient funds

## Timeline

| Milestone | Target | Status |
|-----------|--------|--------|
| Sandbox integration | Week 1 | ✅ Complete |
| White Label App | Week 2 | ✅ Complete |
| Webhook handlers | Week 3 | ✅ Complete |
| Dividend calculation | Week 4 | ✅ Complete |
| First Circle pilot | Week 9-12 | 🔄 Pending |
| **Juneteenth Launch** | **June 19, 2026** | 🎯 Target |

## References

- [Unit Elements Documentation](https://docs.unit.co/elements)
- [Unit Webhooks Guide](https://docs.unit.co/webhooks)
- [UNIT_FINANCIAL_PROJECTIONS.md](../UNIT_FINANCIAL_PROJECTIONS.md)
- [UNIT_SANDBOX_IMPLEMENTATION_GUIDE.md](../UNIT_SANDBOX_IMPLEMENTATION_GUIDE.md)
