# SOLVY SOVEREIGNITITY Platform

**Economic Liberation Through Cooperative Ownership**

This repository contains the complete SOVEREIGNITITY economic liberation platform, including multiple interconnected websites that promote SOLVY Card cooperative ownership, EBL beauty services, and educational content about economic sovereignty.

## 🌟 Vision

Breaking "monkey in a barrel syndrome" through financial empowerment, data ownership, and cooperative economics. The platform emphasizes:

- **Cooperative Ownership**: SOLVY Card members are owners, not just customers
- **Profit Sharing**: Rewards are actually profit sharing from ownership stake
- **Data Sovereignty**: Members control their own data via Web3/blockchain
- **Economic Liberation**: Breaking cycles of financial dependency

## 🏗️ Platform Architecture

### Live Websites

1. **shop.ebl.beauty** - EBL Payment App
   - Premium beauty services booking and payment
   - SOLVY Card NFC tap-to-pay integration
   - Reign menstrual health products
   - Pilot partner for SOLVY Card cooperative

2. **decidey.ebl.beauty** - DECIDEY NGO Education Site
   - SA Nathan's story and "Breaking the Barrel" narrative
   - Financial literacy content
   - Educational resources on economic sovereignty
   - Facebook integration for community engagement

3. **nitty.ebl.beauty** - SOVEREIGNITITY Main Platform
   - Comprehensive information about economic liberation
   - SOLVY Card cooperative details
   - Self-banking and financial empowerment resources

4. **ebl.beauty** - Evergreen Beauty Lounge Main Site
   - Business information and services
   - Contact and location details

### Backend Services

- **api.ebl.beauty** - Node.js API for payment processing and notifications
- **mail.ebl.beauty** - MailCow email server for member communication
- **Huginn** (planned) - Automation for member engagement

## 📁 Repository Structure

```
SOLVY-sovereignitity/
├── shop-ebl-frontend/          # EBL payment app frontend
│   └── index.html              # Main payment page
├── shop-ebl-backend/           # Node.js backend API
│   ├── server.js               # Express API server
│   ├── package.json            # Dependencies
│   ├── deploy.sh               # Deployment script
│   ├── README.md               # Backend documentation
│   ├── MAILCOW_SETUP.md        # Email configuration guide
│   └── TESTING.md              # Testing procedures
├── decidey-ngo/                # DECIDEY education site
├── sovereignitity-platform/    # Main platform site
└── README.md                   # This file
```

## 🚀 Quick Start

### Prerequisites

- **Hosting**: Hetzner VPS (46.62.235.95) or Vercel
- **Domain**: DNS managed via Vercel DNS
- **Email**: MailCow configured at mail.ebl.beauty
- **Payment**: Stripe account with API keys
- **Node.js**: Version 20+ for backend

### Deployment

#### Frontend (shop.ebl.beauty)

```bash
# Upload to Hetzner VPS
scp -i ~/.ssh/hetzner_key shop-ebl-frontend/index.html root@46.62.235.95:/var/www/shop.ebl.beauty/

# Or deploy to Vercel
cd shop-ebl-frontend
vercel --prod
```

#### Backend (api.ebl.beauty)

```bash
cd shop-ebl-backend
./deploy.sh
```

See [shop-ebl-backend/README.md](shop-ebl-backend/README.md) for detailed backend setup.

## 🔑 Key Features

### SOLVY Card Integration

- **Cooperative Ownership**: Members own the payment network
- **Profit Sharing**: Transaction rewards = ownership dividends
- **NFC Payments**: Tap-to-pay functionality
- **No Middlemen**: Direct peer-to-peer transactions (future Web3)

### EBL Services

**Hair Services**
- Blow dry Queen
- Relaxing hair wash
- Professional styling and treatments

**Nail Services**
- Manicures, pedicures
- Nail art by licensed specialists

**Beauty Services**
- Waxing, facials
- Eyebrow shaping
- Individual eyelashes

**Reign Products**
- Premium sanitary napkins
- Nobel Prize-winning Graphene technology
- Health innovation for feminine care

### Payment Processing

- **Stripe Integration**: Secure payment processing
- **MailCow Notifications**: Email alerts to Eva for customer contact
- **Phone Capture**: Connect customers with service provider
- **No Data Storage**: Customer data managed by Stripe (security first)

## 🌐 Future: Web3 Migration

The platform is designed for easy migration to Web3 architecture:

### Current (Centralized)
```
Customer → Frontend → API → Stripe/MailCow
```

### Future (Decentralized)
```
Customer → DApp → Smart Contract → Vector DB
         ↓
    Member's Device (sovereign data)
```

**Planned Technologies:**
- **Vector DB**: Decentralized member data storage
- **Blockchain**: Transaction verification on-chain
- **Smart Contracts**: Replace Express API routes
- **Member Sovereignty**: Customers control their own keys and data

This aligns with SOLVY's core mission: **you're not a point of failure, members own their data**.

## 📧 Contact

- **Eva**: eva@ebl.beauty
- **Phone/Text**: (929) 429-5994
- **Location**: Arlington, TX

## 🛡️ Security

- **HTTPS Only**: All traffic encrypted via Let's Encrypt SSL
- **CORS Protection**: API only accepts requests from authorized domains
- **No Local Storage**: Sensitive data handled by Stripe, not stored locally
- **Environment Variables**: API keys secured in .env files (not in repo)

## 📜 License

MIT License - Evergreen Beauty Lounge

## 🤝 Contributing

This is a private repository for the SOLVY SOVEREIGNITITY platform. For collaboration inquiries, contact eva@ebl.beauty.

## 🎯 Mission

**Breaking the Barrel**: Empowering communities through:
- Financial literacy education
- Cooperative ownership models
- Data sovereignty and privacy
- Economic independence from traditional banking systems

**Solutions Valued You** - Every member matters, every voice counts, every owner profits.

---

Built with ❤️ for economic liberation and cooperative prosperity.
