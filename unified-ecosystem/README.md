# SOLVY Unified Ecosystem

**Canonical source for https://solvy.cards and the Replit deployment.**

This is the single-codebase React + TypeScript application that powers the SOLVY Ecosystem™ public platform. It is deployed to Replit, and `solvy.cards` serves the Replit deployment directly.

---

## 🌐 Live Sites

| Domain | Purpose |
|--------|---------|
| **https://solvy.cards** | Main SOLVY platform (production) |
| **https://solvy-sovereignitity--smayone.replit.app** | Replit deployment origin |
| **https://ebl.beauty** | Evergreen Beauty Lounge pilot partner site |
| **https://decidey.ebl.beauty** | DECIDEY NGO education |

> **Note:** `solvy.cards` is kept identical to the Replit deployment. Use `../scripts/sync-to-replit.sh` to push changes.

---

## 🎯 Project Overview

The SOLVY Unified Ecosystem is one React application that serves multiple hostnames and routes:

- `solvy.cards` / `*.replit.app` → `NittyHome` (main platform)
- `ebl.beauty` → `EBLHub`
- `decidey.*` → `Decidey`
- `admin.*` / `/admin` → `Admin`

It is the canonical frontend for the SOLVY Card™ program, member onboarding, and partner pages.

---

## 🏗️ Architecture

### Technology Stack

- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite 7
- **Routing:** React Router DOM 7
- **Styling:** CSS with responsive design
- **Server:** Express + TypeScript (`server/`)
- **Deployment:** Replit (origin), served by `solvy.cards`

### Project Structure

```
unified-ecosystem/
├── src/
│   ├── App.tsx                 # Root router with hostname detection
│   ├── components/
│   │   ├── UnifiedNav.tsx      # Top + mobile navigation
│   │   └── SolvyFooter.tsx
│   ├── pages/
│   │   ├── NittyHome.tsx       # Main SOLVY homepage
│   │   ├── Banking.tsx         # Member banking dashboard
│   │   ├── FoundingMemberApply.tsx
│   │   ├── PrelaunchCommitment.tsx
│   │   ├── Underwriting.tsx
│   │   ├── UnderwritingReview.tsx
│   │   ├── EBL.tsx / EBLHub.tsx
│   │   ├── SPS.tsx
│   │   ├── MAN.tsx
│   │   ├── Manifesto.tsx
│   │   ├── Heritage.tsx
│   │   ├── Sovereignty.tsx
│   │   ├── DataMarketplace.tsx
│   │   ├── Presentations.tsx
│   │   ├── Comms.tsx
│   │   ├── Mailbox.tsx
│   │   └── MOLI.tsx
│   └── hooks/
│       └── useAuth.ts
├── server/
│   ├── index.ts                # Express server entry
│   ├── bankingRouter.ts        # Transactions / balance
│   ├── stripeClient.ts
│   ├── webhookHandlers.ts
│   ├── emailService.ts
│   └── replit_integrations/    # Replit auth helpers
├── public/                     # Static assets (logos, card images, hero)
└── dist/                       # Vite production build
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 22+
- pnpm 10+ (or npm)

### Installation

```bash
cd unified-ecosystem
pnpm install
```

### Development

```bash
# Frontend only
pnpm dev:frontend

# Frontend + server
pnpm dev
```

### Build

```bash
pnpm build
```

---

## 🔄 Deploy / Sync to Replit

From the repo root:

```bash
./scripts/sync-to-replit.sh
```

This builds the app, verifies the build, and pushes the current branch to the `replit` remote. Replit auto-deploys on push, which updates `solvy.cards`.

---

## 💳 Card Issuing (Lithic)

The Lithic card-issuing integration is being added to this codebase.

- Server adapter: `server/lithicAdapter.ts` (porting from `solvy-platform/api/adapters/lithic.js`)
- API routes: `server/cardRouter.ts`
- Member onboarding/KYC: `src/pages/KycCapture.tsx` (porting from `solvy-cards/`)

See the SCRUM board and `tasks/in-progress/TASK-102-lithic-production-key-live-issuing.md` for status.

---

## 🔐 Environment Variables

Copy `.env.example` to `.env` and fill in values. Key variables:

```bash
# Lithic (card issuing)
LITHIC_API_URL=https://sandbox.lithic.com
LITHIC_API_KEY=...
LITHIC_WEBHOOK_SECRET=...

# Stripe (payments)
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...

# Auth / session
SESSION_SECRET=...

# Replit (if running on Replit)
REPLIT_DB_URL=...
```

---

## 📋 Related Codebases

- `../solvy-platform/` — Older static site + Node API adapters (Lithic adapter being ported)
- `../solvy-unit-integration/` — Unit.co / Treasury Prime integration server
- `../solvy-cards/` — Mobile PWA prototype with KYC/receipt capture (being ported)

---

**Built with ❤️ for financial sovereignty and economic autonomy.**

*SOVEREIGNITITY™ — The Exercise of Achieving Control of Banking Through Cooperative Ownership*
