# SOLVY SOVEREIGNITITY Platform

## Overview
This is a multi-project monorepo containing the SOLVY SOVEREIGNITITY economic liberation platform. The main application is a React/Vite frontend in the `unified-ecosystem` directory. America's first P2P payment platform with cooperative ownership.

## Project Structure
- `unified-ecosystem/` - Main React/Vite frontend (primary app)
- `decidey-ngo-react/` - DECIDEY NGO education site (React)
- `solvy-platform/` - Backend and frontend for SOLVY platform
- `shop-ebl-frontend/` - EBL payment app frontend (static HTML)
- `shop-ebl-backend/` - Node.js API backend

## Key Pages (Updated)
- **SOLVY Card** (`/`) - Main landing with 4-card carousel, NFC tap demo, virtual card view with customization (color themes + logo upload), P2P privacy mode
- **Banking Portal** (`/banking`) - Unit.co Ready-to-Launch embedded banking (accounts, cards, payees, transfers)
- **Evergreen Beauty Lounge** (`/ebl`) - Eva's business with logo bookends, SOLVY Pilot Partner #1, proof of concept, QR codes for business cards
- **SPS Joint Venture** (`/sps`) - Pilot Partner #2, reverse inventory tracking with Excel/CSV upload
- **MAN** (`/man`) - Mandatory Audit Network, transparency hub for members, email inbox center, response templates for marketing, data pool revenue tracker (record sales + 70/20/10 breakdown)
- **Data Marketplace** (`/data-marketplace`) - SOVEREIGNITITY™ member-facing opt-in page: 4 data pools (Diaspora Spending Patterns, Remittance Behavior, Financial Access Gaps, Community Commerce Trends); email-based optin toggle; privacy guarantees; 70/20/10 revenue split explainer
- **DECIDEY NGO** (`/decidey`) - Education site with prelaunch activities, FB connection, YouTube educator network
- **Prelaunch Commitment** (`/prelaunch`) - No-obligation spending commitment page; saves to DB via `/api/prelaunch/commit`
- **Underwriting Package** (`/underwriting`) - Unit.co underwriting summary: exec metrics, member pipeline, cooperative structure, compliance readiness, commitment detail table with CSV/print export

## Features
- **Virtual Card View**: After member approval, shows card with NFC tap-to-pay demo, transaction history, P2P toggle
- **Military-Grade Privacy**: Balance auto-hides when P2P network is detached
- **Card Customization**: 6 color themes + custom logo upload (crown logo preserved in background)
- **Email Center**: Modern inbox UI with folders (All/System/Business/Financial), compose, email view with actions
- **Member Authentication**: Replit OIDC login (Google/GitHub/email) with session management
- **Dynamic Navigation**: 
  - Guests see: "Apply for Card" + "Member Login"
  - Authenticated members see: User greeting + "Open Banking" + "Logout"

## Running the Project
The main frontend runs on port 5000 using Vite dev server:
```bash
cd unified-ecosystem && npm run dev
```

## Tech Stack
- **Frontend**: React 19, TypeScript, Vite 7, React Router 7
- **Styling**: Tailwind CSS + custom CSS
- **File Processing**: SheetJS (xlsx) for Excel/CSV uploads
- **Build**: Vite with TypeScript

## Development
- Frontend binds to `0.0.0.0:5000` for Replit compatibility
- Vite configured with `allowedHosts: true` for proxy access

## User Preferences
- "Evergreen Beauty Lounge" spelled out fully in navigation (not abbreviated)
- Eva's business positioned as "the proof" - real business demonstrating cooperative ownership

## Deployment
Static deployment configured to build and serve from `unified-ecosystem/dist`

---

## Internal Business Model (Not Public)

### Banking & Payment Partners
- **Stripe**: Primary payment processor - EBL currently accepting card payments via Stripe's app
- **Unit.co**: Ready-to-Launch banking embedded at `/banking` - currently using sandbox demo token. For production, obtain JWT token from Unit.co after approval. Script loaded: `https://ui.s.unit.sh/release/latest/components-extended.js`

### Membership & Fees
- SOLVY Card monthly fee: $9.99-$10
- Vendor companies charge utilization fees
- Member cooperative ownership benefits from profit accumulation over time, building capital collectively

### Pilot Partners
- **EBL (Pilot #1)**: 51% ownership requires 40-60k annual revenue source. Profits over threshold reinvested into business operations for growth. Currently accepting payments via Stripe.
- **SPS (Pilot #2)**: Scaling demonstration for SOLVY Card across multiple businesses

### Core Vision: SOVEREIGNITITY
- Data Sovereignty = Data Autonomy + earning income from controlling and sharing personal data
- MAN (Mandatory Audit Network) visualizes member activity and transparency
- Membership growth goal: members transition to self-employment/small business ownership

### Data Marketplace (Option A — Second Revenue Stream)
- DB tables: `data_pool_optins` (email + pool_id), `data_pool_sales` (buyer, gross, pool, date)
- API routes: `GET /api/data-pools`, `POST/DELETE /api/data-pools/optin`, `GET /api/data-pools/my-optins`, `GET /api/data-pools/revenue`, `POST /api/data-pools/sale`, `GET /api/data-pools/export/:poolId`
- 4 hardcoded pools on server: spending-patterns, remittance-behavior, financial-access, community-commerce
- Revenue split follows same 70/20/10 model: 70% member patronage pool, 20% ops, 10% sovereign fund
- Export endpoint returns anonymized aggregate JSON (no individual member data ever)

### 70/20/10 Revenue Model (Canonical Labels)
- **70%** — Patronage Dividends — Community Pool (returns to members based on patronage)
- **20%** — Operations Funding (infrastructure, compliance, partner fees)
- **10%** — Sovereign Wealth Fund — SOVEREIGNITITY™ (MOLI/BOLI/IBC long-term capital)

### Revenue Phase Transition
When revenue phases through profitability:
1. SOLVY Card onboarding experience transitions
2. Collective membership evolves to SOVEREIGNITITY web3 presence
3. Join blockchain network: **Guapcoin** (Tavonia Evans' project)

### Guapcoin Integration Vision
- American-based membership with parallel value to HR40 reparations bill (legislative pathway unlikely, but high visibility)
- Strategic viewership: UN organizations, BRICS/NDB, SCO, African Union, DPAPPS
- Sovereign-minded entities partnership network
- Goal: Tie Guapcoin value to natural resources in Africa for diaspora populations
- Ultimate objective: Join global societal hierarchy class of **OGCFC** (Organizers Group & Controllers of Financialized Capital)

### Technical Notes
- Crown logo always preserved in card background during color customization
- Card customization UI simplified for users (no instructional text visible)
