<<<<<<< HEAD
# SOLVY Unified Ecosystem

**America's First P2P Payment Platform**

A unified React application serving the complete SOLVY ecosystem across multiple subdomains, enabling data sovereignty and economic autonomy through cooperative ownership.

---

## 🌐 Live Sites

- **[nitty.ebl.beauty](https://nitty.ebl.beauty)** - Main SOLVY Platform & Card MVP
- **[remittance.ebl.beauty](https://remittance.ebl.beauty)** - Global Remittance Network
- **[decidey.ebl.beauty](https://decidey.ebl.beauty)** - DECIDEY NGO Education
- **[admin.ebl.beauty](https://admin.ebl.beauty)** - Member Dashboard

---

## 🎯 Project Overview

The SOLVY Unified Ecosystem is a single-codebase React application that powers all SOLVY platform subdomains. Built with modern web technologies, it provides a cohesive user experience across the entire ecosystem while maintaining easy maintainability and scalability.

### Key Features

- **Unified Navigation** - Consistent navigation across all subdomains
- **Subdomain Routing** - Intelligent routing based on hostname detection
- **Responsive Design** - Mobile-first approach with full desktop support
- **Interactive Components** - Card carousel, savings calculator, and more
- **Professional Branding** - Consistent SOLVY branding throughout

---

## 🏗️ Architecture

### Technology Stack

- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite 7
- **Routing:** React Router DOM 7
- **Styling:** CSS with responsive design
- **Deployment:** Nginx on Ubuntu VPS

### Project Structure

```
solvy-ecosystem/
├── src/
│   ├── App.tsx                 # Main router with subdomain detection
│   ├── App.css                 # Shared styles
│   ├── components/
│   │   ├── UnifiedNav.tsx      # Navigation component
│   │   └── UnifiedNav.css
│   └── pages/
│       ├── NittyHome.tsx       # Main platform (nitty.ebl.beauty)
│       ├── Remittance.tsx      # Global network (remittance.ebl.beauty)
│       ├── Remittance.css
│       ├── Decidey.tsx         # Educational NGO (decidey.ebl.beauty)
│       ├── Decidey.css
│       ├── Admin.tsx           # Member dashboard (admin.ebl.beauty)
│       └── Admin.css
├── public/
│   ├── fulllogo.png            # SOLVY full logo
│   ├── SolvyLogo-1024.png      # Crown logo
│   ├── hero_payment_image.webp # Hero image
│   └── SOV*.png                # Card designs
└── dist/                       # Built files for deployment
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 22+
- pnpm 10+

### Installation

```bash
# Clone the repository
git clone https://github.com/SA-Nathan-SOLVY/SOLVY-sovereignitity.git
cd SOLVY-sovereignitity

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

---

## 📄 Pages

### 1. NittyHome (nitty.ebl.beauty)

Main SOLVY platform showcasing the SOLVY Card MVP with hero section, interactive card carousel, 4 key value propositions, SOVEREIGNITITY™ explanation, EBL pilot partner showcase, DECIDEY NGO overview, and global remittance teaser.

### 2. Remittance (remittance.ebl.beauty)

Comprehensive global remittance network vision featuring development roadmap, interactive savings calculator, BRICS member countries, African diaspora priority markets, and benefits overview.

### 3. Decidey (decidey.ebl.beauty)

DECIDEY NGO educational platform with mission statement, 6 program areas, philosophy pillars, and join the movement CTA.

### 4. Admin (admin.ebl.beauty)

Member dashboard and login page with coming soon placeholder for full dashboard features.

---

## 🎨 Design System

### Colors

- **Primary:** #3b82f6 (Blue)
- **Secondary:** #8b5cf6 (Purple)
- **Success:** #10b981 (Green)
- **Background:** Linear gradients (#0a1628 → #1a2742)

---

## 🔧 Deployment

### VPS Deployment

```bash
# Build the project
pnpm build

# Copy dist files to VPS
scp -r dist/* root@YOUR_VPS:/var/www/SUBDOMAIN/

# Set permissions
chown -R www-data:www-data /var/www/SUBDOMAIN/
```

---

## 👤 Author

**SA Nathan**  
Creator of SOLVY Platform  
*Solutions Valued You*

---

## 🔗 Links

- **Main Platform:** https://nitty.ebl.beauty
- **Remittance:** https://remittance.ebl.beauty
- **Education:** https://decidey.ebl.beauty
- **Dashboard:** https://admin.ebl.beauty

---

**Built with ❤️ for financial sovereignty and economic autonomy**

*SOVEREIGNITITY™ - The Exercise of Achieving Control of Banking Through Cooperative Ownership*
=======
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
>>>>>>> 298985252196b1a4adafaec989824d5827f34063
