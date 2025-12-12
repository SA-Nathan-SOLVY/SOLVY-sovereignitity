# SOLVY Platform Backend API

Express.js + TypeScript backend for the SOLVY platform.

## Features

✅ **Member Management**
- Member signup with Stripe customer creation
- Member profiles and KYC status tracking
- In-memory storage (replace with database later)

✅ **Payment Processing**
- Stripe integration for payment intents
- Payment history tracking
- Refund processing

✅ **Authentication**
- Clerk integration ready (to be implemented)
- CORS configured for all SOLVY domains

## Setup

### 1. Install Dependencies

```bash
cd backend
pnpm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your API keys:

```bash
cp .env.example .env
```

Required environment variables:
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `CLERK_SECRET_KEY` - Your Clerk secret key (for auth)
- `PORT` - API server port (default: 3000)

### 3. Run Development Server

```bash
pnpm dev
```

Server will start on `http://localhost:3000`

### 4. Test Health Endpoint

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-12-12T21:48:18.363Z",
  "service": "SOLVY API",
  "version": "1.0.0"
}
```

## API Endpoints

### Health Check

```
GET /health
```

Returns server health status.

### Member Endpoints

#### Create Member (Signup)

```
POST /api/members/signup
Content-Type: application/json

{
  "clerkId": "user_...",
  "email": "member@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "businessName": "Acme Corp",
  "businessType": "business"
}
```

Creates a new member and Stripe customer.

#### Get Member by ID

```
GET /api/members/:id
```

#### Get Member by Clerk ID

```
GET /api/members/clerk/:clerkId
```

#### Update Member

```
PATCH /api/members/:id
Content-Type: application/json

{
  "kycStatus": "approved",
  "cardStatus": "active"
}
```

#### List All Members

```
GET /api/members
```

### Payment Endpoints

#### Create Payment Intent

```
POST /api/payments/create-payment-intent
Content-Type: application/json

{
  "amount": 100.00,
  "currency": "usd",
  "memberId": "member_...",
  "description": "Payment for services"
}
```

#### Get Payment Intent

```
GET /api/payments/payment-intent/:id
```

#### List Member Payments

```
GET /api/payments/member/:memberId
```

#### Refund Payment

```
POST /api/payments/refund
Content-Type: application/json

{
  "paymentIntentId": "pi_...",
  "amount": 50.00
}
```

## Project Structure

```
backend/
├── src/
│   ├── index.ts           # Main Express server
│   ├── models/
│   │   └── Member.ts      # Member data model
│   ├── routes/
│   │   ├── members.ts     # Member endpoints
│   │   └── payments.ts    # Payment endpoints
│   ├── controllers/       # Business logic (future)
│   └── middleware/        # Auth, validation (future)
├── .env                   # Environment variables
├── .env.example           # Environment template
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
└── README.md              # This file
```

## Development

### Build for Production

```bash
pnpm build
```

Compiles TypeScript to JavaScript in `dist/` directory.

### Start Production Server

```bash
pnpm start
```

Runs the compiled JavaScript from `dist/`.

## Next Steps

- [ ] Replace in-memory storage with real database (PostgreSQL/MongoDB)
- [ ] Implement Clerk authentication middleware
- [ ] Add Persona KYC integration
- [ ] Add Mercury banking integration
- [ ] Add email notifications (Resend)
- [ ] Add rate limiting and security middleware
- [ ] Add comprehensive error handling
- [ ] Add logging (Winston/Pino)
- [ ] Add API documentation (Swagger/OpenAPI)
- [ ] Add unit and integration tests

## Deployment

See `/scripts/deploy-mvp.sh` for automated deployment to Hetzner VPS.

## References

- **Stripe API:** https://stripe.com/docs/api
- **Clerk Auth:** https://clerk.com/docs
- **Express.js:** https://expressjs.com/
- **TypeScript:** https://www.typescriptlang.org/

---

**Version:** 1.0.0  
**Last Updated:** December 12, 2024
