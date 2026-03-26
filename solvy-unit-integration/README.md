# SOLVY Unit.co Integration

Complete banking integration for SOLVY Cooperative using Unit.co APIs.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd solvy-unit-integration
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your Unit sandbox credentials
```

### 3. Run Integration Test

```bash
npm test
```

Expected output:
```
🧪 SOLVY Unit Sandbox Integration Test
=====================================

1️⃣ Creating customer...
✅ Customer created: 1234567

2️⃣ Creating deposit account...
✅ Account created: 1111111

3️⃣ Getting balance...
✅ Balance retrieved:
   Available: 0
   Total: 0

4️⃣ Creating SOLVY card...
✅ Card created: 2222222
   Last 4: 4242

=====================================
🎉 All tests passed!
=====================================
```

### 4. Start Server

```bash
npm run dev
```

Server runs on http://localhost:3000

## 📁 Project Structure

```
solvy-unit-integration/
├── api/
│   ├── unit/
│   │   ├── customer.js      # Member onboarding
│   │   ├── account.js       # Deposit accounts
│   │   └── card.js          # SOLVY card issuance
│   └── webhooks/
│       └── unit.js          # Webhook handlers (70/20/10)
├── lib/
│   └── unit.js              # API client
├── tests/
│   └── integration/
│       └── sandbox-test.js  # Integration tests
├── server.js                # Main server
├── package.json
└── .env.example
```

## 🔗 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/members/onboard` | POST | Complete member onboarding |
| `/api/accounts/:id/balance` | GET | Get account balance |
| `/webhooks/unit` | POST | Unit webhook receiver |

## 📋 Environment Variables

```bash
UNIT_API_TOKEN=your_token_here
UNIT_API_URL=https://api.s.unit.sh
SOLVY_WEBHOOK_SECRET=your_secret_here
```

Get your token from: https://app.s.unit.co → Developer → API Keys

## 🧪 Testing

### Sandbox Test Data

Unit provides test SSNs that always approve:
- `000000001` - Always approves
- `000000002` - Requires document verification
- `000000003` - Denied

### Webhook Testing

Use ngrok to expose local server:

```bash
npm install -g ngrok
ngrok http 3000
```

Copy the HTTPS URL and add `/webhooks/unit` to it in your Unit dashboard.

## 📖 Documentation

- [Unit API Docs](https://docs.unit.co)
- [Sandbox Guide](https://docs.unit.co/sandbox)
- [Ready To Launch](https://docs.unit.co/ready-to-launch)

## 🎯 Next Steps

1. ✅ Run integration test
2. ✅ Configure webhooks in Unit dashboard
3. ⏳ Embed Ready To Launch component
4. ⏳ Build member dashboard
5. ⏳ Production deployment

---

**Target**: Juneteenth 2026 (89 days)
