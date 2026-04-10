# UNDERWRITING READINESS REPORT
## SOLVY Cooperative - Unit.co Debit Card Program

**Entity**: SA Nathan LLC (Wyoming Cooperative)  
**Product**: SOLVY Card™ - Debit Card for Marginalized Communities  
**Report Date**: March 29, 2026  
**Prepared By**: Technical Integration Team  
**Target Launch**: June 19, 2026 (Juneteenth)  

---

## EXECUTIVE SUMMARY

This report assesses the readiness of the SOLVY Card™ program for Unit.co underwriting submission. The integration is **PARTIALLY READY** with several critical gaps requiring immediate attention before underwriting can proceed.

### Overall Readiness: ⚠️ 65% READY

| Category | Status | Completion |
|----------|--------|------------|
| API Integration | 🟡 Partial | 70% |
| KYC/KYB Flow | 🟡 Partial | 60% |
| Card Management | 🟡 Partial | 65% |
| Transaction Processing | 🔴 Not Ready | 30% |
| Webhook Handling | 🟡 Partial | 75% |
| Compliance | 🟡 In Progress | 50% |
| Documentation | 🟡 Partial | 60% |

**Recommendation**: Address CRITICAL and HIGH priority blockers before submitting for underwriting. Estimated time to readiness: 2-3 weeks.

---

## SECTION 1: WHAT'S READY ✅

### 1.1 Core API Infrastructure

**Status**: ✅ READY

| Component | Location | Status |
|-----------|----------|--------|
| API Client | `lib/unit.js` | ✅ Complete |
| Error Handling | `lib/unit.js` | ✅ Complete |
| Environment Config | `.env.example` | ✅ Complete |
| Server Setup | `server.js` | ⚠️ Minor issue* |
| Docker Deployment | `Dockerfile`, `docker-compose.prod.yml` | ✅ Complete |
| Nginx Configuration | `nginx.conf` | ✅ Complete |

*Minor Issue: Missing import for `getUnitToken` in `server.js` (see Section 3)

**Evidence**:
- Axios client configured with proper headers
- Response interceptors for logging
- 30-second timeout configured
- Environment-based configuration
- Health check endpoint functional

### 1.2 Customer Onboarding (Basic)

**Status**: ✅ READY

| Feature | Implementation | Status |
|---------|----------------|--------|
| Customer Creation | `api/unit/customer.js` | ✅ Complete |
| SSN Handling | Test SSNs configured | ✅ Complete |
| Address Validation | Basic validation | ✅ Complete |
| Phone Formatting | Normalization implemented | ✅ Complete |
| Customer Retrieval | `getCustomer()` function | ✅ Complete |

**Test Results**:
- ✅ Sandbox customer creation successful
- ✅ Customer data properly formatted
- ✅ Tags system for member tracking

### 1.3 Deposit Account Management

**Status**: ✅ READY

| Feature | Implementation | Status |
|---------|----------------|--------|
| Account Creation | `api/unit/account.js` | ✅ Complete |
| Balance Retrieval | `getBalance()` | ✅ Complete |
| Account Details | `getAccount()` | ✅ Complete |
| Account Closure | `closeAccount()` | ✅ Complete |

**Evidence**:
```javascript
// Account creation works with proper relationships
const account = await createDepositAccount(customerId, {
  product: 'checking',
  tags: { accountType: 'individual' }
});
```

### 1.4 Virtual Card Issuance

**Status**: ✅ READY

| Feature | Implementation | Status |
|---------|----------------|--------|
| Virtual Card Creation | `api/unit/card.js` | ✅ Complete |
| Card Details | `getCard()` | ✅ Complete |
| Card Freezing | `freezeCard()` | ✅ Complete |
| Card Unfreezing | `unfreezeCard()` | ✅ Complete |
| Lost/Stolen Report | `reportLost()` | ✅ Complete |

**Test Results**:
- ✅ Card created with correct account relationship
- ✅ Last 4 digits returned
- ✅ Expiration date set
- ✅ Shipping address captured

### 1.5 Payment Operations (Partial)

**Status**: ✅ READY (Basic)

| Feature | Implementation | Status |
|---------|----------------|--------|
| Book Transfers | `createBookTransfer()` | ✅ Complete |
| ACH Simulation | `simulateIncomingAch()` | ✅ Complete |
| Payment Retrieval | `getPayment()`, `listPayments()` | ✅ Complete |
| Payment Reversal | `reversePayment()` | ✅ Complete |
| MOLI Integration | `depositMoliLoanProceeds()` | ✅ Complete |

### 1.6 Webhook Infrastructure

**Status**: ✅ READY (Framework)

| Feature | Implementation | Status |
|---------|----------------|--------|
| Signature Verification | HMAC-SHA256 | ✅ Complete |
| Event Router | Switch statement | ✅ Complete |
| Error Handling | Try/catch with logging | ✅ Complete |
| Event Handlers | Basic handlers defined | ✅ Complete |

**Implemented Handlers**:
- ✅ `application.approved`
- ✅ `application.denied`
- ✅ `account.created`
- ✅ `card.activated`
- ✅ `transaction.created`

### 1.7 JWT Token Generation

**Status**: ✅ READY

| Feature | Implementation | Status |
|---------|----------------|--------|
| Token Generation | `api/auth/unit-token.js` | ✅ Complete |
| Payload Structure | Unit-compliant | ✅ Complete |
| Expiration | 1 hour | ✅ Complete |
| Endpoint | `/api/auth/unit-token` | ⚠️ Missing import* |

*Fix required: Add import to server.js

---

## SECTION 2: WHAT'S IN PROGRESS 🟡

### 2.1 Ready To Launch Integration

**Status**: 🟡 IN PROGRESS

| Component | Status | Notes |
|-----------|--------|-------|
| Backend JWT | ✅ Complete | Token generation working |
| Frontend Component | ⬜ Not Started | Requires React component |
| Event Handlers | ⚠️ Partial | Basic handlers defined |
| Styling/Theming | ⬜ Not Started | SOLVY branding needed |

**Gap**: The Ready To Launch component needs frontend implementation for complete KYC/KYB flow.

### 2.2 Database Integration

**Status**: 🟡 IN PROGRESS

| Component | Status | Notes |
|-----------|--------|-------|
| Member Schema | ⚠️ Mock | Stub implementation |
| Distribution Schema | ⚠️ Mock | Stub implementation |
| Actual Database | ⬜ Not Connected | PostgreSQL recommended |

**Current State**: Webhook handlers use mock database functions:
```javascript
// Current - needs real implementation
const db = {
  members: { update: async () => {}, findByUnitId: async () => {} },
  distributions: { create: async () => {} }
};
```

### 2.3 Enhanced Due Diligence

**Status**: 🟡 IN PROGRESS

| Component | Status | Notes |
|-----------|--------|-------|
| Risk Scoring Algorithm | ⚠️ Documented | In UNIT_TECHNICAL_INTEGRATION_SPEC.md |
| EDD Triggers | ⚠️ Documented | Not implemented |
| Manual Review Queue | ⬜ Not Built | UI needed |
| PEP Screening | ✅ Unit Handles | Via Unit KYC |

---

## SECTION 3: CRITICAL BLOCKERS 🔴

### 3.1 Missing Import in server.js

**Priority**: 🔴 CRITICAL  
**Impact**: Server will crash on JWT token request  
**Effort**: 5 minutes  
**File**: `server.js`

**Issue**:
```javascript
// Line 86 uses getUnitToken but it's not imported
app.post('/api/auth/unit-token', getUnitToken);

// Missing import at top of file:
const { getUnitToken } = require('./api/auth/unit-token');
```

**Fix Required**:
```javascript
// Add to imports in server.js (around line 12)
const { getUnitToken } = require('./api/auth/unit-token');
```

### 3.2 Transaction Simulation

**Priority**: 🔴 CRITICAL  
**Impact**: Cannot test interchange capture, 70/20/10 distribution  
**Effort**: 2-3 hours  
**Files to Create**: `api/unit/transaction.js`

**Missing Implementation**:
```javascript
// Required: Card transaction simulation
const simulateCardTransaction = async (cardId, amount, merchant) => {
  return await unit.post(`/cards/${cardId}/simulate/authorization`, {
    data: {
      type: 'cardTransaction',
      attributes: { amount, merchant }
    }
  });
};

// Required: Transaction settlement simulation
const simulateSettlement = async (transactionId) => {
  return await unit.post(`/transactions/${transactionId}/simulate/clearing`);
};
```

**Why Critical**: Underwriting requires demonstration of complete transaction flow including interchange capture.

### 3.3 Physical Card Ordering

**Priority**: 🔴 CRITICAL  
**Impact**: Cannot fulfill card orders for members  
**Effort**: 2-3 hours  
**File**: `api/unit/card.js`

**Missing Implementation**:
```javascript
// Required: Physical card ordering
const orderPhysicalCard = async (accountId, shippingAddress, design = 'solvyStandard') => {
  return await unit.post('/cards', {
    data: {
      type: 'individualDebitCard',
      attributes: {
        shippingAddress,
        design,
        tags: { cardType: 'physical' }
      },
      relationships: {
        account: { data: { type: 'account', id: accountId } }
      }
    }
  });
};
```

**Why Critical**: Physical cards are a core product feature for the First Circle launch.

### 3.4 Database Implementation

**Priority**: 🔴 CRITICAL  
**Impact**: Webhook data not persisted, distributions not tracked  
**Effort**: 1-2 days  
**Files**: Database models, migration scripts

**Required Tables**:

```sql
-- Members table
CREATE TABLE members (
  id SERIAL PRIMARY KEY,
  unit_customer_id VARCHAR(255),
  unit_account_id VARCHAR(255),
  unit_card_id VARCHAR(255),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(255),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Distributions table
CREATE TABLE distributions (
  id SERIAL PRIMARY KEY,
  transaction_id VARCHAR(255),
  account_id VARCHAR(255),
  interchange_amount DECIMAL(12,2),
  member_dividend DECIMAL(12,2),
  community_pool DECIMAL(12,2),
  operations DECIMAL(12,2),
  processed_at TIMESTAMP DEFAULT NOW()
);
```

**Why Critical**: Underwriting requires demonstration of data persistence and reporting capabilities.

---

## SECTION 4: HIGH PRIORITY GAPS 🟠

### 4.1 Card Management Features

**Priority**: 🟠 HIGH  
**Impact**: Limited card self-service for members  
**Effort**: 4-6 hours

**Missing Features**:
| Feature | Unit API Available | Implementation Status |
|---------|-------------------|----------------------|
| Card PIN change | Yes | ⬜ Not implemented |
| Card limits | Yes | ⬜ Not implemented |
| Card replacement | Yes | ⬜ Not implemented |
| Virtual card details | Yes | ⬜ Not implemented |
| Card shipping status | Yes | ⬜ Not implemented |

### 4.2 Transaction History

**Priority**: 🟠 HIGH  
**Impact**: Members cannot view transactions  
**Effort**: 2-3 hours  
**File**: New `api/unit/transaction.js`

**Required**:
```javascript
const getTransactionHistory = async (accountId, options = {}) => {
  const params = new URLSearchParams({
    'filter[accountId]': accountId,
    'page[limit]': options.limit || 50,
    ...options
  });
  return await unit.get(`/transactions?${params}`);
};
```

### 4.3 ACH Payment Initiation

**Priority**: 🟠 HIGH  
**Impact**: Members cannot fund accounts via ACH  
**Effort**: 3-4 hours  
**File**: Extend `api/unit/payment.js`

**Missing**:
- Counterparty creation
- ACH payment initiation
- Payment tracking

### 4.4 Test Suite Completeness

**Priority**: 🟠 HIGH  
**Impact**: Incomplete testing coverage  
**Effort**: 1-2 days

**Missing Tests**:
| Test | Status |
|------|--------|
| Webhook signature verification | ⬜ |
| Transaction processing | ⬜ (needs implementation) |
| Card freeze/unfreeze | ⬜ |
| Error handling | ⬜ |
| Rate limiting | ⬜ |
| End-to-end onboarding | ⬜ |

### 4.5 Monitoring & Alerting

**Priority**: 🟠 HIGH  
**Impact**: No visibility into system health  
**Effort**: 1 day

**Missing**:
- Application performance monitoring (APM)
- Error tracking (Sentry/DataDog)
- API health checks
- Transaction volume alerts
- Webhook failure alerts

---

## SECTION 5: MEDIUM PRIORITY GAPS 🟡

### 5.1 Member Dashboard API

**Priority**: 🟡 MEDIUM  
**Impact**: Frontend cannot display member data  
**Effort**: 1 day  
**File**: New `api/member/dashboard.js`

**Required Endpoints**:
- `GET /api/members/:id/dashboard` - Full dashboard data
- `GET /api/members/:id/transactions` - Transaction history
- `GET /api/members/:id/dividends` - Dividend history

### 5.2 Revenue Distribution Automation

**Priority**: 🟡 MEDIUM  
**Impact**: Manual calculation of quarterly dividends  
**Effort**: 1-2 days  
**File**: New `api/unit/distribution.js`

**Required**:
```javascript
const calculateQuarterlyDividends = async (quarter, year) => {
  // Aggregate interchange from quarter
  // Calculate 70/20/10 split
  // Generate distribution records
  // Return per-member dividend amounts
};
```

### 5.3 Document Management

**Priority**: 🟡 MEDIUM  
**Impact**: Cannot handle document verification  
**Effort**: 4-6 hours

**Unit Provides**: Document upload via Ready To Launch
**Gap**: SOLVY-side document storage and retrieval

### 5.4 Compliance Reporting

**Priority**: 🟡 MEDIUM  
**Impact**: Manual compliance reporting  
**Effort**: 2-3 days

**Required Reports**:
- Daily transaction summary
- Monthly member growth
- Quarterly interchange report
- SAR filing log
- Audit trail export

---

## SECTION 6: LOW PRIORITY GAPS 🟢

### 6.1 Advanced Card Features

**Priority**: 🟢 LOW  
**Impact**: Enhanced member experience  
**Effort**: 2-3 days

- Card controls (spending limits, merchant blocking)
- Instant card replacement
- Contactless activation
- Digital wallet (Apple Pay, Google Pay)

### 6.2 Batch Operations

**Priority**: 🟢 LOW  
**Impact**: Administrative efficiency  
**Effort**: 1-2 days

- Batch member import
- Batch card ordering
- Batch payment processing

### 6.3 Advanced Analytics

**Priority**: 🟢 LOW  
**Impact**: Business intelligence  
**Effort**: 3-5 days

- Transaction pattern analysis
- Member behavior insights
- Revenue forecasting
- Churn prediction

---

## SECTION 7: COMPLIANCE READINESS

### 7.1 KYC/KYB Compliance

**Status**: 🟡 PARTIAL

| Requirement | Status | Responsible |
|-------------|--------|-------------|
| Identity Verification | ✅ Unit Handles | Unit.co |
| Document Verification | ✅ Unit Handles | Unit.co |
| OFAC Screening | ✅ Unit Handles | Unit.co |
| Enhanced Due Diligence | 🟡 Partial | SOLVY |
| Ongoing Monitoring | 🟡 Partial | Both |

**Action Items**:
1. Complete EDD implementation
2. Define ongoing monitoring rules
3. Document manual review procedures

### 7.2 BSA/AML Program

**Status**: 🟡 IN PROGRESS

| Component | Status | Notes |
|-----------|--------|-------|
| CIP | ✅ Complete | Unit provides |
| Transaction Monitoring | 🟡 Partial | Basic rules defined |
| SAR Filing | ✅ Unit Handles | Automated by Unit |
| Record Retention | ⚠️ Needs DB | 5-year requirement |
| AML Training | ⬜ Not Started | Staff training needed |

### 7.3 Privacy & Data Security

**Status**: 🟡 IN PROGRESS

| Component | Status | Notes |
|-----------|--------|-------|
| Privacy Policy | ⚠️ Draft | Needs legal review |
| Data Encryption | ✅ TLS 1.3 | Configured |
| PII Handling | ✅ Unit Handles | Unit stores sensitive data |
| Breach Response Plan | ⬜ Not Started | Required for underwriting |
| Data Retention Policy | ⚠️ Documented | Needs implementation |

---

## SECTION 8: BUSINESS READINESS

### 8.1 Financial Projections

**Status**: ✅ READY

File: `UNIT_FINANCIAL_PROJECTIONS.md`

| Metric | Month 1 | Month 6 | Month 12 |
|--------|---------|---------|----------|
| Accounts | 100 | 350 | 1,000 |
| Transactions/Day | 500 | 1,500 | 5,000 |
| Monthly Volume | $1.275M | $3.825M | $12.75M |
| Interchange Revenue | $15,300 | $45,900 | $153,000 |

### 8.2 Operational Readiness

| Component | Status | Notes |
|-----------|--------|-------|
| Customer Support | 🟡 In Setup | Need support procedures |
| Dispute Handling | ⚠️ Partial | Unit provides base |
| Fraud Monitoring | ✅ Unit Handles | Real-time monitoring |
| Card Reissuance | ⬜ Not Ready | Needs physical card API |

### 8.3 Marketing Readiness

| Component | Status | Notes |
|-----------|--------|-------|
| Website | ✅ Ready | ebl.beauty deployed |
| Branding | ✅ Ready | SOLVY brand complete |
| Terms of Service | ⚠️ Draft | Legal review needed |
| Cardholder Agreement | ⚠️ Draft | Unit template available |

---

## SECTION 9: RECOMMENDATIONS

### 9.1 Immediate Actions (This Week)

1. **Fix server.js import** (5 min) - Critical blocker
2. **Implement transaction simulation** (2-3 hours) - Critical for testing
3. **Implement physical card ordering** (2-3 hours) - Core feature
4. **Connect database** (1-2 days) - Data persistence required

### 9.2 Short-term Actions (Next 2 Weeks)

1. Complete test suite (1-2 days)
2. Implement transaction history (2-3 hours)
3. Add monitoring/alerting (1 day)
4. Complete compliance documentation (2-3 days)
5. Ready To Launch frontend integration (3-4 days)

### 9.3 Pre-Launch Actions (Before June 19)

1. Security audit
2. Load testing
3. Compliance review
4. Staff training
5. Soft launch with 10 beta members

---

## SECTION 10: UNDERWRITING SUBMISSION CHECKLIST

### Required for Submission

| Requirement | Status | Blocker |
|-------------|--------|---------|
| Complete API integration | 🟡 Partial | Items 3.1-3.4 |
| KYC/KYB flow working | 🟡 Partial | Ready To Launch UI |
| Card issuance tested | ✅ Ready | - |
| Transaction processing | 🔴 Not Ready | Item 3.2 |
| Webhooks configured | ✅ Ready | - |
| Compliance program | 🟡 In Progress | Documentation |
| Financial projections | ✅ Ready | - |
| Business plan | ✅ Ready | - |
| Privacy policy | 🟡 Draft | Legal review |
| Support procedures | 🟡 In Progress | Documentation |

### Estimated Timeline to Submission

**Optimistic**: 2 weeks (with full team focus)  
**Realistic**: 3-4 weeks (with parallel work)  
**Conservative**: 6 weeks (with sequential work)

---

## CONCLUSION

The SOLVY Card™ integration with Unit.co is **65% ready** for underwriting submission. The core infrastructure is solid, with customer onboarding, account creation, and virtual card issuance working in sandbox. However, **critical blockers** must be addressed:

1. **Transaction simulation** - Required to demonstrate interchange capture
2. **Physical card ordering** - Core product feature
3. **Database implementation** - Required for data persistence
4. **Minor code fixes** - Server.js import issue

With focused effort on these blockers, SOLVY can be ready for underwriting submission within **2-3 weeks**.

---

## APPROVALS

### Technical Lead

**Name**: ___________________  
**Date**: ___________________  
**Signature**: ___________________  

**Confirmation**: I have reviewed this report and agree with the readiness assessment.

### Business Lead

**Name**: ___________________  
**Date**: ___________________  
**Signature**: ___________________  

**Confirmation**: I understand the blockers and commit resources to address them.

### Compliance Officer

**Name**: ___________________  
**Date**: ___________________  
**Signature**: ___________________  

**Confirmation**: I have reviewed compliance requirements and will complete documentation.

---

**Document ID**: SOLVY-UNDERWRITING-READINESS-2026-001  
**Next Review**: Upon completion of critical blockers  
**Distribution**: Unit.co Underwriting Team, SOLVY Leadership, Technical Team  
**Classification**: Confidential - Business Sensitive
