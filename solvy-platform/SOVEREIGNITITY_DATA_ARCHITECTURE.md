# SOLVY PWA - Sovereignitity Data Architecture Refactor
## Implementation Summary

**Status:** ✅ Implementation Complete  
**Version:** 2.0  
**Date:** March 2025  

---

## Overview

This document summarizes the implementation of SOLVY's local-first, privacy-centric data architecture. The refactor transforms the SOLVY Card PWA from a centralized data model to one where transaction data lives on member devices, with only anonymized aggregates contributing to collective bargaining power.

### Key Principles

1. **Local-First**: All transaction data stored in IndexedDB on member devices
2. **Privacy-Centric**: Only aggregated, anonymized metrics leave the device
3. **Member Control**: Members vote before any data pooling occurs
4. **Temporary by Design**: Pooled data auto-deletes after 30 days
5. **Transparent**: Members see exactly what data is shared

---

## Implementation Status by Phase

### ✅ Phase 1: Audit Existing Data and Migration Planning

**Files:**
- `scripts/migrate-to-local-first.js` - Complete migration pipeline

**Features:**
- Data export to JSON for each member
- Batch processing with configurable size
- Archive creation before deletion
- Migration status tracking
- Dry-run support for testing

**Usage:**
```bash
# Export all member data
node scripts/migrate-to-local-first.js export

# Check migration status
node scripts/migrate-to-local-first.js status

# Retire central storage (Phase 7)
CONFIRM_RETIREMENT=yes node scripts/migrate-to-local-first.js retire
```

---

### ✅ Phase 2: Local-First Storage (IndexedDB)

**Files:**
- `js/services/db.js` - Complete IndexedDB wrapper with Dexie.js

**Object Stores:**
| Store | Purpose | Indexes |
|-------|---------|---------|
| `transactions` | Transaction history | date, amount, merchant, category, pendingSync |
| `spending_patterns` | Category aggregates | category, total_amount, count |
| `card_activity` | Activity log | timestamp, type, status |
| `dataPoolContributions` | Track contributions | proposalId, contributedAt |
| `proposals` | Cached proposals | status, voteStart, voteEnd |
| `votes` | Local vote records | proposalId |
| `syncQueue` | Offline sync queue | type, createdAt, retryCount |

**Key Methods:**
- `addTransaction()` - Store new transaction
- `getTransactionsByDateRange()` - Query by date
- `getSpendingByCategory()` - Get category totals
- `syncAggregatedMetrics()` - Send only aggregates to server
- `exportAllData()` - GDPR-style data export
- `importData()` - Import from migration JSON

**Offline Support:**
- Automatic offline detection
- Sync queue for pending operations
- Retry logic with exponential backoff
- 5-minute periodic sync when online

---

### ✅ Phase 3: Anonymized Aggregated Metrics

**Files:**
- `js/services/aggregation-service.js` - Client-side aggregation
- `js/components/privacy-dashboard.js` - Privacy transparency UI
- `js/components/data-preview.js` - Educational data preview

**Client-Side Aggregation:**
```javascript
// What gets calculated locally
const metrics = {
  totalVolume: transactions.reduce((sum, t) => sum + t.amount, 0),
  transactionCount: transactions.length,
  categorySums: groupBy(transactions, 'category'),
  averageTransaction: totalVolume / transactionCount,
  memberHash: SHA256(memberId) // For counting, not identification
};
```

**What's Sent to Server:**
- ✅ Total volume (sum)
- ✅ Transaction count
- ✅ Category sums
- ✅ Anonymized member hash
- ❌ Individual transactions
- ❌ Merchant names
- ❌ Exact timestamps
- ❌ Any PII

**Privacy Dashboard Features:**
- Visual comparison: Local vs Shared data
- Real-time metrics preview
- One-click data download
- Manual sync trigger
- Last sync timestamp

---

### ✅ Phase 4: Threshold-Based Triggers

**Files:**
- `js/services/threshold-service.js` - Threshold monitoring
- `js/components/threshold-widget.js` - Progress UI widget
- `api/metrics.js` - Server-side threshold tracking

**Configured Thresholds:**
| ID | Type | Value | Message |
|----|------|-------|---------|
| volume_50 | volume | $500,000 | 50% to collective action! |
| volume_75 | volume | $750,000 | 75% to collective action! |
| volume_100 | volume | $1,000,000 | Vote now: Pool data? |
| members_1000 | member_count | 1,000 | New voting category! |
| members_5000 | member_count | 5,000 | Major milestone! |
| members_10000 | member_count | 10,000 | 10,000 members! 🎉 |

**Features:**
- Real-time progress tracking
- Server-Sent Events for live updates
- Browser notifications at milestones
- Threshold history tracking
- Deduplication of notifications

---

### ✅ Phase 5: Voting System (MAN Integration)

**Files:**
- `js/services/voting-service.js` - Privacy-preserving voting
- `js/components/voting-widget.js` - Voting interface
- `js/components/proposal-card.js` - Proposal display
- `sql/voting-schema.sql` - PostgreSQL schema

**Privacy-Preserving Design:**
- Member IDs hashed with SHA-256 before storage
- No link between vote and transaction data
- One vote per member per proposal
- Anonymous vote counting

**Voting Workflow:**
1. Threshold reached → Proposal auto-created
2. Proposal posted to MAN (Member Advocacy Network)
3. Members vote via dashboard
4. Results tallied after voting closes
5. If passed → Data pool creation triggered

**Database Schema:**
```sql
-- proposals table
CREATE TABLE proposals (
    id UUID PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    threshold_type VARCHAR(50),
    threshold_value INTEGER,
    vote_start TIMESTAMP,
    vote_end TIMESTAMP,
    status VARCHAR(50), -- pending, active, passed, failed
    options JSONB
);

-- votes table (privacy-preserving)
CREATE TABLE votes (
    id UUID PRIMARY KEY,
    proposal_id UUID REFERENCES proposals(id),
    member_hash VARCHAR(64) NOT NULL, -- SHA-256, not raw ID
    choice VARCHAR(100),
    voted_at TIMESTAMP,
    UNIQUE(proposal_id, member_hash)
);
```

---

### ✅ Phase 6: Temporary Encrypted Data Pool

**Files:**
- `js/services/encryption-service.js` - AES-256-GCM encryption
- `js/components/data-pool-optin.js` - Opt-in modal
- `api/data-pool.js` - Server-side pool API
- `scripts/cleanup-data-pool.js` - Automated cleanup

**Encryption Flow:**
1. Aggregate data locally
2. Sanitize (remove any PII patterns)
3. Validate privacy compliance
4. Encrypt with AES-256-GCM
5. Send encrypted blob to server
6. Store with 30-day expiration

**Opt-In Process:**
1. Vote passes → Opt-in invitation shown
2. Member previews what data will be shared
3. Checkbox confirmation required
4. Data encrypted client-side
5. Encrypted payload transmitted
6. Confirmation with deletion date shown

**Auto-Cleanup:**
- Daily cron job at 2:00 AM
- Deletes expired contributions
- Logs to immutable audit trail
- Sends deletion confirmation emails
- Keeps audit logs for compliance

**Usage:**
```bash
# Run cleanup manually
node scripts/cleanup-data-pool.js run

# Dry run
node scripts/cleanup-data-pool.js dry-run

# Show statistics
node scripts/cleanup-data-pool.js stats

# Start scheduled job
node scripts/cleanup-data-pool.js start
```

---

### ⏳ Phase 7: Retire Central SQL Storage

**Status:** Pending member migration completion

**Script:** `scripts/migrate-to-local-first.js`

**Process:**
1. ✅ Verify all members migrated
2. ✅ Archive data to encrypted storage
3. ✅ Move to `transactions_legacy` table
4. ⏳ Truncate main transactions table
5. ⏳ Drop related triggers/indexes
6. ⏳ Final cleanup after 30-day grace period

---

## API Endpoints

### Metrics API (`api/metrics.js`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/metrics` | Submit aggregated metrics |
| GET | `/api/cooperative/metrics` | Get public cumulative totals |
| GET | `/api/cooperative/metrics/stream` | SSE for real-time updates |
| GET | `/api/cooperative/thresholds` | Get all thresholds with status |
| POST | `/api/cooperative/reset` | Admin: Reset metrics (testing) |

### Data Pool API (`api/data-pool.js`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/data-pool/contribute` | Submit encrypted contribution |
| GET | `/api/data-pool/contributions/:proposalId` | Manager: Get decrypted data |
| GET | `/api/data-pool/status/:proposalId` | Check contribution status |
| GET | `/api/data-pool/stats/:proposalId` | Manager: Get stats |
| GET | `/api/data-pool/key` | Get pool encryption key |

---

## Web Components

All components are custom elements (Web Components) with shadow DOM:

| Component | File | Purpose |
|-----------|------|---------|
| `<privacy-dashboard>` | `js/components/privacy-dashboard.js` | Data transparency UI |
| `<threshold-widget>` | `js/components/threshold-widget.js` | Progress toward milestones |
| `<voting-widget>` | `js/components/voting-widget.js` | Active proposals & voting |
| `<data-pool-optin>` | `js/components/data-pool-optin.js` | Opt-in modal |
| `<data-preview>` | `js/components/data-preview.js` | Educational data comparison |
| `<proposal-card>` | `js/components/proposal-card.js` | Individual proposal display |

**Usage Example:**
```html
<!-- Include required scripts -->
<script src="https://unpkg.com/dexie@3.2.4/dist/dexie.min.js"></script>
<script src="js/services/db.js"></script>
<script src="js/services/aggregation-service.js"></script>
<script src="js/components/privacy-dashboard.js"></script>

<!-- Use component -->
<privacy-dashboard member-id="member-123"></privacy-dashboard>
```

---

## Security Considerations

### Data in Transit
- All API calls over HTTPS
- Encrypted payloads for data pool
- Rate limiting on all endpoints

### Data at Rest (Local)
- IndexedDB on member device only
- Optional: Encrypt with device key
- No cloud backup of transaction data

### Data at Rest (Central)
- Only aggregated totals stored
- Encrypted data pool (AES-256-GCM)
- 30-day auto-deletion

### Member Identity
- SHA-256 hashing for votes
- Separate hash for metrics counting
- No link between vote and data contribution

### Audit Trail
- Immutable audit log table
- All data pool events logged
- Deletion confirmations tracked
- Manager access logged

---

## Getting Started

### 1. Install Dependencies

```bash
# For migration and cleanup scripts
npm install pg node-cron nodemailer

# For API server
npm install express
```

### 2. Set Up Database

```bash
# Run voting schema
psql -d solvy -f sql/voting-schema.sql

# Run data pool schema (included in data-pool.js)
```

### 3. Initialize the PWA

```html
<!DOCTYPE html>
<html>
<head>
    <!-- Dexie.js for IndexedDB -->
    <script src="https://unpkg.com/dexie@3.2.4/dist/dexie.min.js"></script>
    
    <!-- SOLVY Services -->
    <script src="js/services/db.js"></script>
    <script src="js/services/aggregation-service.js"></script>
    <script src="js/services/encryption-service.js"></script>
    <script src="js/services/threshold-service.js"></script>
    <script src="js/services/voting-service.js"></script>
    
    <!-- SOLVY Components -->
    <script src="js/components/privacy-dashboard.js"></script>
    <script src="js/components/threshold-widget.js"></script>
    <script src="js/components/voting-widget.js"></script>
</head>
<body>
    <privacy-dashboard member-id="your-member-id"></privacy-dashboard>
    <threshold-widget auto-refresh></threshold-widget>
    <voting-widget></voting-widget>
</body>
</html>
```

### 4. Run Migration (if migrating from centralized system)

```bash
# Export all member data
node scripts/migrate-to-local-first.js export

# Check status
node scripts/migrate-to-local-first.js status

# Retire central storage (when ready)
CONFIRM_RETIREMENT=yes node scripts/migrate-to-local-first.js retire
```

### 5. Set Up Cleanup Job

```bash
# Run manually
node scripts/cleanup-data-pool.js run

# Or start scheduled job (runs daily at 2 AM)
node scripts/cleanup-data-pool.js start
```

---

## Success Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Central storage cost reduction | 90% | 🎯 Target |
| Member privacy confidence | 95% opt-in to voting | 🎯 Target |
| Offline capability | 100% dashboard access | ✅ Achieved |
| Vote participation | >50% of active members | 🎯 Target |
| Data pool opt-in | >70% after vote | 🎯 Target |

---

## Demo

A complete demo is available at `privacy-dashboard.html` showing:
- Privacy dashboard with local vs shared data
- Threshold widget with cooperative progress
- Voting interface for active proposals
- Data preview with privacy guarantees
- Technical architecture explanation

---

## Contributing

This implementation follows the SOLVY Sovereignitity principles:
1. Data sovereignty for all members
2. Transparent aggregation
3. Collective action through democratic voting
4. Privacy by design, not as an afterthought

---

## License

SOLVY Platform - Created by SA Nathan  
Part of the Sovereignitity Technology Stack
