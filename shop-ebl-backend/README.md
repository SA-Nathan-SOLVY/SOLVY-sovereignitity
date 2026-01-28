# EBL Shop Backend API

Lightweight Node.js backend API for Evergreen Beauty Lounge payment application.

## Features

- **Stripe Payment Integration**: Create payment intents for secure transactions
- **Email Notifications**: Send contact requests and appointment bookings via MailCow
- **Contact Management**: Capture customer phone numbers for Eva communication
- **CORS Security**: Configured for shop.ebl.beauty frontend
- **Health Monitoring**: Health check endpoint for uptime monitoring

## Architecture

```
Frontend (shop.ebl.beauty)
    ↓
Nginx Reverse Proxy (api.ebl.beauty)
    ↓
Node.js Express API (localhost:3001)
    ↓
    ├── Stripe API (payment processing)
    └── MailCow SMTP (email notifications)
```

## API Endpoints

### Health Check
```
GET /api/health
Response: { status: 'ok', message: 'EBL Backend API is running' }
```

### Create Payment Intent
```
POST /api/create-payment-intent
Body: {
  amount: 50.00,
  service: "Hair Services",
  phone: "(929) 429-5994"
}
Response: { clientSecret: "pi_xxx_secret_xxx" }
```

### Contact Eva
```
POST /api/contact-eva
Body: {
  phone: "(929) 429-5994",
  service: "Nail Services",
  message: "Optional message"
}
Response: { success: true, message: 'Contact request sent to Eva' }
```

### Book Appointment
```
POST /api/book-appointment
Body: {
  phone: "(929) 429-5994",
  service: "Beauty Services",
  preferredDate: "2025-11-25",
  preferredTime: "2:00 PM"
}
Response: { success: true, message: 'Appointment request sent' }
```

### Payment Success Notification
```
POST /api/payment-success
Body: {
  phone: "(929) 429-5994",
  service: "Hair Services",
  amount: 50.00,
  paymentIntentId: "pi_xxx"
}
Response: { success: true, message: 'Payment notification sent' }
```

## Deployment

### Prerequisites

1. **Hetzner VPS** with SSH access
2. **Domain DNS**: `api.ebl.beauty` → VPS IP (46.62.235.95)
3. **MailCow** configured at `mail.ebl.beauty`
4. **Stripe Account** with secret key
5. **Node.js 20+** on VPS

### Quick Deploy

```bash
# Run automated deployment script
./deploy.sh
```

### Manual Deployment

1. **Upload files to VPS**:
```bash
scp -i ~/.ssh/hetzner_key -r . root@46.62.235.95:/var/www/ebl-api/
```

2. **SSH into VPS**:
```bash
ssh -i ~/.ssh/hetzner_key root@46.62.235.95
```

3. **Install dependencies**:
```bash
cd /var/www/ebl-api
npm install --production
```

4. **Configure environment**:
```bash
cp .env.example .env
nano .env
# Fill in real values for STRIPE_SECRET_KEY, MAILCOW credentials, etc.
```

5. **Setup systemd service**:
```bash
cp ebl-api.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable ebl-api
systemctl start ebl-api
```

6. **Configure Nginx**:
```bash
cp nginx-api.conf /etc/nginx/sites-available/api.ebl.beauty
ln -s /etc/nginx/sites-available/api.ebl.beauty /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

7. **Setup SSL**:
```bash
certbot certonly --nginx -d api.ebl.beauty
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
PORT=3001
NODE_ENV=production
STRIPE_SECRET_KEY=sk_live_your_key_here
MAILCOW_HOST=mail.ebl.beauty
MAILCOW_USER=noreply@ebl.beauty
MAILCOW_PASS=your_password_here
EVA_EMAIL=eva@ebl.beauty
ALLOWED_ORIGINS=https://shop.ebl.beauty
```

## Monitoring

### Check Service Status
```bash
systemctl status ebl-api
```

### View Logs
```bash
journalctl -u ebl-api -f
```

### Test Health Endpoint
```bash
curl https://api.ebl.beauty/api/health
```

## Security

- **HTTPS Only**: All traffic encrypted via Let's Encrypt SSL
- **CORS Protection**: Only shop.ebl.beauty can access API
- **No Data Storage**: Customer data handled by Stripe, not stored locally
- **Environment Variables**: Sensitive keys in .env file (not in git)

## Future: Web3 Migration

This lightweight backend is designed for easy migration to Web3:

- **Vector DB**: Replace MailCow with decentralized storage
- **Blockchain**: Transaction verification on-chain
- **Smart Contracts**: Replace Express routes with Solidity contracts
- **Member Sovereignty**: Customers control their own data

## Support

For issues or questions, contact: eva@ebl.beauty

## License

MIT License - Evergreen Beauty Lounge
