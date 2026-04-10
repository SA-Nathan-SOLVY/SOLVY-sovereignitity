# SOLVY Ecosystem™ - AI Agent Guide

> **For AI Coding Agents:** This document provides essential context for working with the SOLVY codebase. Read this first before making any changes.

---

## Project Overview

**SOLVY Ecosystem™** is a cooperative financial platform building generational wealth infrastructure for families who survived slavery, displacement, and colonialism through cooperative economic ownership.

- **Entity:** SA Nathan LLC (Wyoming cooperative)
- **Mission:** "Leave them better than I received." — The Sheila Mandate
- **Launch Target:** June 19, 2026 (Juneteenth)
- **Current Phase:** Foundation First (Core infrastructure before advanced features)
- **Domain:** https://ebl.beauty
- **Git Server:** https://gitea.ebl.beauty

### The 70/20/10 Economic Model

All interchange revenue follows this distribution:
- **70%** — Member patronage dividends
- **20%** — Community development pool
- **10%** — Operations reserve

---

## Technology Stack

### Frontend
- **Type:** Static HTML/CSS/JavaScript (vanilla, no frameworks)
- **Storage:** IndexedDB with Dexie.js wrapper (local-first architecture)
- **Styling:** CSS variables, responsive design, dark theme
- **Key Color:** `#22c55e` (SOLVY green)

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Process Manager:** PM2
- **Authentication:** JWT tokens (for Unit.co integration)

### Infrastructure
- **Hosting:** Hetzner VPS (46.62.235.95)
- **Web Server:** Nginx (reverse proxy + static files)
- **Containerization:** Docker + Docker Compose
- **SSL:** Let's Encrypt
- **Source Control:** Gitea (self-hosted)

### Banking Partner
- **Unit.co** — Banking-as-a-Service via Thread Bank
- **Integration:** White Label App (Ready To Launch component)
- **Environment:** Sandbox (pre-launch), Production (post-launch)

---

## Repository Structure

```
SOVEREIGNITITY-Stack/
│
├── solvy-platform/              # Main web platform (STATIC SITE)
│   ├── index.html               # Homepage
│   ├── about.html               # About page
│   ├── onboarding.html          # Unit.co member onboarding
│   ├── banking/                 # Member banking portal
│   │   ├── index.html           # Banking dashboard (4 tabs)
│   │   └── UNIT-INTEGRATION.md  # Architecture docs
│   ├── card/                    # SOLVY Card™ product pages
│   ├── api/                     # Backend API handlers
│   │   ├── unit-token.js        # JWT generation for Unit Elements
│   │   ├── dividends.js         # 70/20/10 calculations
│   │   ├── data-pool.js         # Privacy-focused data aggregation
│   │   ├── moli-loans.js        # MOLI policy loan requests
│   │   ├── metrics.js           # Transaction metrics
│   │   ├── auth-server.js       # Authentication
│   │   └── webhooks/            # Webhook handlers
│   │       ├── unit.js          # Unit.co transaction webhooks
│   │       └── stripe.js        # Stripe payment webhooks
│   ├── js/                      # Frontend JavaScript
│   │   ├── components/          # UI components
│   │   │   ├── data-pool-optin.js
│   │   │   ├── privacy-dashboard.js
│   │   │   ├── voting-widget.js
│   │   │   └── threshold-widget.js
│   │   └── services/            # Business logic
│   │       ├── db.js            # IndexedDB wrapper (Dexie.js)
│   │       ├── data-pool.js     # Data pooling service
│   │       ├── voting-service.js
│   │       ├── encryption-service.js
│   │       └── aggregation-service.js
│   ├── css/                     # Stylesheets
│   ├── scripts/                 # Utility scripts
│   │   ├── migrate-to-local-first.js
│   │   └── cleanup-data-pool.js
│   ├── phase2-moli/             # ⏸️ PAUSED: MOLI features
│   └── docker-compose.yml       # Local Docker setup
│
├── solvy-unit-integration/      # Node.js API server
│   ├── server.js                # Main Express server
│   ├── package.json             # Node dependencies
│   ├── api/
│   │   ├── unit/                # Unit.co integration
│   │   │   ├── customer.js      # Member onboarding
│   │   │   ├── account.js       # Deposit accounts
│   │   │   ├── card.js          # Card issuance
│   │   │   └── payment.js       # Payment processing
│   │   ├── auth/                # Authentication endpoints
│   │   └── webhooks/            # Webhook receivers
│   ├── lib/
│   │   └── unit.js              # Unit API client
│   ├── tests/
│   │   └── integration/         # Integration tests
│   ├── docker-compose.prod.yml  # Production Docker setup
│   └── nginx.conf               # Nginx configuration
│
├── ops/                         # Infrastructure as Code
│   ├── mailcow/                 # Email server configuration
│   ├── huginn/                  # Automation agents
│   ├── monitoring/              # Monitoring setup
│   └── scripts/                 # Infrastructure scripts
│
├── tasks/                       # SCRUM task management
│   ├── TEMPLATE.md              # Task template
│   ├── backlog/                 # Backlog tasks
│   ├── in-progress/             # Active tasks
│   ├── review/                  # Code review
│   └── done/                    # Completed tasks
│
├── sprints/                     # Sprint planning
│   ├── SPRINT-3.md              # Current sprint
│   └── VELOCITY.md              # Velocity tracking
│
├── tests/                       # Integration tests
│   └── test-unit-integration.js
│
├── manus-deploy/                # Deployed website versions
├── replit-deploy/               # Replit deployment packages
│
├── SCRUM-BOARD.md               # Daily SCRUM board
├── SCRUM-README.md              # SCRUM Master guide
└── [Documentation files...]
```

---

## Build and Development Commands

### Local Development (solvy-platform - Frontend)

```bash
cd solvy-platform

# Start local server (Python)
python3 -m http.server 8000

# Or with Node.js
npx serve .

# Access at http://localhost:8000
```

### API Server Development (solvy-unit-integration - Backend)

```bash
cd solvy-unit-integration

# Install dependencies
npm install

# Development mode (with auto-reload)
npm run dev

# Production mode
npm start

# Run integration tests
npm test

# Test webhooks
npm run test:webhook
```

### Docker Deployment

```bash
# Build and run locally
docker-compose up -d

# Production deployment
docker-compose -f docker-compose.prod.yml up -d --build
```

### Hetzner VPS Deployment

```bash
# Full deployment script
./DEPLOY_TO_HETZNER.sh

# Or manual deployment
ssh root@46.62.235.95
cd /opt/solvy
git pull
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## Environment Variables

### solvy-unit-integration/.env

```bash
# Unit.co Configuration
UNIT_API_TOKEN=your_token_here
UNIT_API_URL=https://api.s.unit.sh
UNIT_ORG_ID=your_org_id

# Environment
SOLVY_ENV=sandbox          # or 'production'
SOLVY_PORT=3000

# Security
SOLVY_WEBHOOK_SECRET=random_secret_for_webhook_verification
```

### solvy-platform/api/.env (if separate)

```bash
UNIT_API_URL=https://api.s.unit.sh
UNIT_TOKEN_URL=https://api.s.unit.sh/users-token
UNIT_PARTNER_ID=your_partner_id
UNIT_PARTNER_SECRET=your_partner_secret
UNIT_ORG_ID=your_org_id
NODE_ENV=sandbox
ALLOWED_ORIGINS=https://ebl.beauty,https://www.ebl.beauty
PORT=3000
```

**IMPORTANT:** Never commit `.env` files to git. They are listed in `.gitignore`.

---

## Code Style Guidelines

### JavaScript

1. **Comments:** Use JSDoc style for functions
   ```javascript
   /**
    * Generate JWT token for Unit Elements
    * @param {string} memberId - SOLVY member ID
    * @param {Object} memberData - Member information
    * @returns {Object} { token, customerId, expiresAt }
    */
   async function generateUnitToken(memberId, memberData) { ... }
   ```

2. **TODOs and Task Markers:**
   - `// TODO:` - New feature to implement
   - `// FIXME:` - Bug that needs fixing
   - `// BUG:` - Critical issue
   - `// BLOCKED:` - Can't proceed
   - `// REVIEW:` - Needs code review
   - `// ASSIGNED: @username` - Task assignment

3. **Logging:** Use consistent format
   ```javascript
   console.log('[ComponentName] Action: details');
   console.error('[ComponentName] Error:', error);
   ```

### HTML/CSS

1. **CSS Variables:** Use SOLVY color scheme
   ```css
   :root {
     --solvy-green: #22c55e;
     --solvy-dark: #0f172a;
     --solvy-gray: #94a3b8;
   }
   ```

2. **Mobile-First:** All pages must be responsive

3. **Trademark Usage:** 
   - Always use ™ symbol: `SOLVY Ecosystem™`, `SOLVY Card™`
   - Include footer attribution: "Product of SA Nathan LLC"

---

## Testing Instructions

### Unit.co Sandbox Testing

Test SSNs that always produce specific results:
- `000000001` - Always approves
- `000000002` - Requires document verification
- `000000003` - Denied

Test card numbers:
- `4111111111111111` - Visa success
- `4000000000000002` - Declined
- `4000000000000127` - Insufficient funds

### Integration Tests

```bash
# Run full integration test
cd solvy-unit-integration
npm test

# Test specific endpoint
curl -X POST http://localhost:3000/api/members/onboard \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "firstName": "Test", "lastName": "User"}'

# Health check
curl http://localhost:3000/health
```

### Webhook Testing (Local)

```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3000

# Use the HTTPS URL + /webhooks/unit in Unit dashboard
```

---

## Security Considerations

### Critical Security Rules

1. **Never commit secrets:** API keys, tokens, passwords go in `.env` only
2. **Webhook verification:** Always verify HMAC-SHA256 signatures
   ```javascript
   const expected = crypto
     .createHmac('sha256', WEBHOOK_SECRET)
     .update(payload)
     .digest('hex');
   return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
   ```
3. **CORS:** Restrict to known origins only
   ```javascript
   const allowedOrigins = ['https://ebl.beauty', 'https://www.ebl.beauty'];
   ```
4. **Member ID hashing:** Use SHA-256 for any server-side storage
5. **Encryption:** Use AES-256-GCM for pooled data

### Data Privacy (Local-First Architecture)

- Raw transaction data stays in member's IndexedDB
- Only anonymized aggregates are sent to server (if opted in)
- Pooled data auto-deletes after 30 days
- Members vote before any data use changes

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  HTML/CSS/JS │  │  IndexedDB   │  │  Unit White Label │  │
│  │  (ebl.beauty)│  │  (Local data)│  │  App (iFrame)     │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                     HETZNER VPS (46.62.235.95)              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    Nginx (443/80)                      │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │  │
│  │  │ Static Files │  │  /api/*      │  │  Webhooks    │ │  │
│  │  │ (/var/www)   │──│  proxy to    │  │  endpoints   │ │  │
│  │  │              │  │  Node.js     │  │              │ │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │  │
│  └───────────────────────────────────────────────────────┘  │
│                         │                                   │
│  ┌──────────────────────┴──────────────────────────────┐   │
│  │              Docker Container (Node.js)             │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │   │
│  │  │ Express API  │  │ Unit.co API  │  │  PM2      │  │   │
│  │  │  (Port 3000) │──│  Integration │  │ Process   │  │   │
│  │  └──────────────┘  └──────────────┘  └───────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      UNIT.CO PLATFORM                        │
│              (Thread Bank - Banking Partner)                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Key API Endpoints

### solvy-unit-integration (Port 3000)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/members/onboard` | POST | Complete member onboarding flow |
| `/api/accounts/:id/balance` | GET | Get account balance |
| `/webhooks/unit` | POST | Unit.co webhook receiver |

### solvy-platform/api (Node.js)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/unit-token` | POST | Generate JWT for Unit Elements |
| `/api/dividends` | GET | Get 70/20/10 distribution |
| `/api/data-pool` | POST | Submit anonymized aggregates |
| `/api/metrics` | GET | Member transaction metrics |
| `/api/webhooks/unit` | POST | Unit transaction events |
| `/api/moli/loan-request` | POST | MOLI policy loan request |

---

## SCRUM Workflow

### Daily Workflow for AI Agents

1. **Check SCRUM-BOARD.md** for current sprint status
2. **Review tasks/** folder for assigned work
3. **Update task files** when completing work:
   - Move from `tasks/in-progress/` to `tasks/review/` or `tasks/done/`
   - Update status in task metadata

### Task Template

```markdown
# TASK-XXX: Brief Description

## Metadata
- **Type:** Feature|Bug|Refactor|Docs
- **Priority:** High|Medium|Low
- **Status:** To Do|In Progress|In Review|Done
- **Assignee:** @username
- **Sprint:** Sprint X
- **Story Points:** N

## Description
Clear description of the work.

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Blockers
- None / Specific blocker
```

---

## Important Files for Context

### Architecture & Design
- `MOLI_ARCHITECTURE.md` - MOLI system design (Phase 2)
- `UNIT_TECHNICAL_INTEGRATION_SPEC.md` - Unit.co integration spec
- `solvy-platform/SOVEREIGNITITY_DATA_ARCHITECTURE.md` - Data sovereignty

### Business & Legal
- `FIRST_CIRCLE_CONSTITUTIONAL_FRAMEWORK.md` - Cooperative governance
- `SOLVY MANIFESTO.md` - The Sheila Mandate
- `CORPORATE_STRUCTURE.md` - Entity structure
- `TRADEMARK_WEBSITE_LABELING_GUIDE.md` - ™ usage rules

### Financial
- `UNIT_FINANCIAL_PROJECTIONS.md` - Revenue models
- `SOLVY_STACK_BUDGET.md` - Cost breakdown

### Development
- `FOCUS_FOUNDATION_FIRST.md` - Why MOLI is paused
- `FOUNDATION_STATUS.md` - Weekly progress
- `DEPLOYMENT_GUIDE.md` - Deployment procedures

---

## Common Tasks for AI Agents

### Adding a New Page

1. Create HTML file in appropriate folder (e.g., `solvy-platform/new-feature/`)
2. Include standard header, navigation, footer
3. Add CSS variables for SOLVY theming
4. Link from navigation in `index.html`
5. Test responsive design
6. Update `DEPLOYMENT.md` if deployment steps change

### Adding a New API Endpoint

1. Create handler file in `solvy-platform/api/` or `solvy-unit-integration/api/`
2. Export Express-compatible handler function
3. Add route registration in `server.js`
4. Include JSDoc comments
5. Add error handling and logging
6. Document in this AGENTS.md file
7. Write integration test

### Modifying Database Schema (IndexedDB)

1. Update version number in `js/services/db.js`
2. Add migration logic in upgrade callback
3. Update `SOVEREIGNITITY_DATA_ARCHITECTURE.md`
4. Test migration with `scripts/migrate-to-local-first.js`

### Working with Unit.co API

1. Always check sandbox vs production environment
2. Use `UNIT_CONFIG.ENVIRONMENT` to determine mode
3. Generate sandbox tokens for testing
4. Verify webhook signatures in production
5. Log all API calls for audit trail

---

## Troubleshooting

### Common Issues

**API returns 502 Bad Gateway:**
```bash
# Check if API is running
pm2 status
pm2 logs solvy-api

# Restart if needed
pm2 restart solvy-api
```

**CORS errors in browser:**
- Check `ALLOWED_ORIGINS` in `.env`
- Must include `https://ebl.beauty`

**Unit app doesn't load:**
- Verify JWT token is being generated
- Check browser console for errors
- Test Unit script loads: `https://ui.s.unit.sh`

**IndexedDB errors:**
- Check browser storage permissions
- Verify Dexie.js is loaded
- Check for quota exceeded errors

---

## Contact & Support

- **Project Lead:** SA Nathan LLC
- **Technical Lead:** See team/TEAM.md
- **SCRUM Master:** Sean (TDIU compliant, passive role)
- **Domain:** https://ebl.beauty
- **Git:** https://gitea.ebl.beauty/smayone/solvy-platform

---

## License & Trademarks

- **Code:** Proprietary (cooperative ownership)
- **SOLVY Ecosystem™** — Trademark pending
- **SOLVY Card™** — Product of SA Nathan LLC

---

*Last Updated: April 9, 2026*  
*Document Version: 1.0*

**Foundation first. The iron fist, digital.** 🛡️
