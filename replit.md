# SOLVY SOVEREIGNITITY Platform

## Overview
This is a multi-project monorepo containing the SOLVY SOVEREIGNITITY economic liberation platform. The main application is a React/Vite frontend in the `unified-ecosystem` directory. America's first P2P payment platform with cooperative ownership.

## Project Structure
- `unified-ecosystem/` - Main React/Vite frontend (primary app)
- `decidey-ngo-react/` - DECIDEY NGO education site (React)
- `solvy-platform/` - Backend and frontend for SOLVY platform
- `shop-ebl-frontend/` - EBL payment app frontend (static HTML)
- `shop-ebl-backend/` - Node.js API backend

## Key Pages
- **SOLVY Card** (`/`) - Main landing with 4-card carousel, NFC tap demo, virtual card view with customization (color themes + logo upload), P2P privacy mode
- **Evergreen Beauty Lounge** (`/ebl`) - Eva's business with logo bookends, SOLVY Pilot Partner #1, proof of concept
- **SPS Joint Venture** (`/sps`) - Pilot Partner #2, reverse inventory tracking with Excel/CSV upload
- **MAN** (`/man`) - Member Action Network, operations dashboard, modernized email inbox center
- **DECIDEY NGO** - Education site link

## Features
- **Virtual Card View**: After member approval, shows card with NFC tap-to-pay demo, transaction history, P2P toggle
- **Military-Grade Privacy**: Balance auto-hides when P2P network is detached
- **Card Customization**: 6 color themes + custom logo upload (Crown background preserved for SOLVY branding)
- **Email Center**: Modern inbox UI with folders (All/System/Business/Financial), compose, email view with actions

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
