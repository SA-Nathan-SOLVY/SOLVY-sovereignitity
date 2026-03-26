# UNIT.CO TECHNICAL INTEGRATION SPECIFICATION
## SOLVY Cooperative - First Circle Implementation

**Document Version**: 1.0  
**Date**: March 23, 2026  
**Prepared For**: Unit.co Underwriting & Implementation Teams  
**Entity**: SA Nathan LLC (SOLVY Cooperative)

---

## EXECUTIVE SUMMARY

SOLVY Cooperative is launching a member-owned financial services platform for Independent Beauty Contractors (IBCs). We require Unit.co's Deposit Account and Card APIs to serve our First Circle cohort of 100 founding members, with a target launch date of June 19, 2026 (Juneteenth).

**Key Metrics**:
- Initial Users: 100 (First Circle)
- 12-Month Target: 1,000 members
- Projected Transaction Volume (Month 12): $2.5M/month
- Average Transaction Size: $85
- Card Present vs. Card Not Present: 70% / 30%

---

## 1. USE CASE OVERVIEW

### 1.1 Primary Use Cases

#### UC-001: Individual Deposit Accounts
**Description**: Each First Circle member receives an individual FDIC-insured deposit account
**Unit API**: `POST /accounts` (Deposit Account)
**Volume**: 100 accounts at launch, scaling to 1,000 by Month 12
**Average Balance**: $2,500 per account

#### UC-002: SOLVY Card Issuance
**Description**: Individual debit cards for members with cooperative branding
**Unit API**: `POST /cards` (Individual Debit Card)
**Features**: 
- Virtual cards (immediate)
- Physical cards (7-10 day delivery)
- Card freezing/unfreezing via app
**Volume**: 100 cards at launch

#### UC-003: Transaction Processing
**Description**: Card transactions with interchange capture for cooperative revenue
**Unit API**: Webhook events (`transaction.created`, `card.transaction`)
**Expected Volume**: 
- Month 1: 500 transactions/day
- Month 12: 5,000 transactions/day

#### UC-004: Revenue Distribution
**Description**: Automated distribution of interchange revenue per 70/20/10 model
**Unit API**: `POST /payments` (ACH transfers to member accounts)
**Frequency**: Quarterly distributions

### 1.2 Transaction Types

| Type | % of Volume | Average Amount | Unit API |
|------|-------------|----------------|----------|
| Card Present (swipe/tap) | 70% | $75 | Card transaction |
| Card Not Present (online) | 25% | $120 | Card transaction |
| ACH (funding/distribution) | 5% | $500 | ACH API |
| P2P (member-to-member) | <1% | $50 | Future: Unit P2P |

---

## 2. TECHNICAL ARCHITECTURE

### 2.1 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  SOLVY Web   │  │  SOLVY iOS   │  │ SOLVY Android│          │
│  │   (React)    │  │   (Swift)    │  │   (Kotlin)   │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
└─────────┼─────────────────┼─────────────────┼──────────────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  SOLVY API Server                        │  │
│  │  - Authentication (JWT)                                  │  │
│  │  - Rate Limiting (100 req/min)                           │  │
│  │  - Request Validation                                    │  │
│  │  - Logging & Monitoring                                  │  │
│  └─────────────────────────┬────────────────────────────────┘  │
└────────────────────────────┼────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BUSINESS LOGIC LAYER                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Member     │  │  Transaction │  │   Revenue    │          │
│  │  Management  │  │  Processing  │  │ Distribution │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
└─────────┼─────────────────┼─────────────────┼──────────────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                        UNIT.CO LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Unit API Client                       │  │
│  │  - Account Management                                    │  │
│  │  - Card Operations                                       │  │
│  │  - Transaction Webhooks                                  │  │
│  │  - Statements & Reporting                                │  │
│  └─────────────────────────┬────────────────────────────────┘  │
└────────────────────────────┼────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BANKING INFRASTRUCTURE                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Thread Bank / Piermont Bank (via Unit)                  │  │
│  │  - FDIC-Insured Deposit Accounts                         │  │
│  │  - Card Network (Visa/Mastercard)                        │  │
│  │  - Interchange Processing                                │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack

| Component | Technology | Justification |
|-----------|------------|---------------|
| Frontend | React + TypeScript | Rapid development, type safety |
| Mobile | React Native (Phase 1) | Cross-platform, faster to market |
| Backend | Node.js + Express | Async handling for financial ops |
| Database | PostgreSQL | ACID compliance for transactions |
| Cache | Redis | Session management, rate limiting |
| Message Queue | Redis Pub/Sub | Webhook processing, async jobs |
| Hosting | AWS (ECS/RDS) | Compliance certifications, scalability |
| Monitoring | Datadog | Financial services monitoring |

### 2.3 Security Architecture

#### Authentication Flow
1. Member logs in via SOLVY app
2. SOLVY API validates credentials (bcrypt + JWT)
3. SOLVY API makes authenticated requests to Unit API
4. Unit API validates SOLVY API key + IP whitelist

#### Data Flow Security
- **In Transit**: TLS 1.3 for all API communications
- **At Rest**: AES-256 encryption for database
- **API Keys**: Rotated every 90 days
- **Webhook Validation**: HMAC-SHA256 signature verification

#### Compliance Controls
- **PII Handling**: Tokenized card numbers (Unit handles PAN)
- **Audit Logging**: Immutable logs of all financial transactions
- **Access Control**: Role-based access (admin, member, read-only)

---

## 3. UNIT API IMPLEMENTATION

### 3.1 Core API Endpoints

#### Account Management

```javascript
// Create Individual Deposit Account
const createAccount = async (memberData) => {
  const response = await unit.accounts.create({
    type: 'depositAccount',
    attributes: {
      depositProduct: 'checking',
      tags: {
        memberId: memberData.id,
        cohort: 'first_circle',
        joinedAt: new Date().toISOString()
      }
    },
    relationships: {
      customer: {
        data: {
          type: 'individualCustomer',
          id: memberData.unitCustomerId
        }
      }
    }
  });
  return response.data;
};

// Close Account (member exit)
const closeAccount = async (accountId) => {
  const response = await unit.accounts.closeAccount(accountId, {
    reason: 'By customer'
  });
  return response.data;
};
```

#### Card Management

```javascript
// Issue SOLVY Card
const issueCard = async (accountId, memberName) => {
  const response = await unit.cards.create({
    type: 'individualDebitCard',
    attributes: {
      shippingAddress: memberAddress, // Member's address
      design: 'solvy_coop_branded',   // Custom card design
      tags: {
        memberId: memberData.id,
        issuedAt: new Date().toISOString()
      }
    },
    relationships: {
      account: {
        data: {
          type: 'account',
          id: accountId
        }
      }
    }
  });
  return response.data;
};

// Freeze Card (lost/stolen)
const freezeCard = async (cardId) => {
  const response = await unit.cards.update(cardId, {
    status: 'frozen'
  });
  return response.data;
};
```

#### Transaction Monitoring

```javascript
// Webhook Handler for Interchange Capture
app.post('/webhooks/unit', async (req, res) => {
  const { data, type } = req.body;
  
  // Verify webhook signature
  if (!verifyWebhookSignature(req)) {
    return res.status(401).send('Unauthorized');
  }
  
  switch (type) {
    case 'transaction.created':
      await processTransaction(data);
      break;
    case 'card.transaction':
      await processCardTransaction(data);
      break;
    case 'account.closed':
      await handleAccountClosure(data);
      break;
  }
  
  res.status(200).send('OK');
});

// Process Interchange Revenue
const processCardTransaction = async (transaction) => {
  // Extract interchange amount from transaction
  const interchangeRevenue = transaction.attributes.interchange;
  
  // Apply 70/20/10 distribution
  const distribution = {
    memberDividend: interchangeRevenue * 0.70,
    communityPool: interchangeRevenue * 0.20,
    operations: interchangeRevenue * 0.10,
    transactionId: transaction.id,
    processedAt: new Date().toISOString()
  };
  
  // Store in database for quarterly distribution
  await db.distributions.create(distribution);
};
```

### 3.2 Customer Onboarding Flow

```
Member Application
       │
       ▼
┌──────────────┐
│  KYC/KYB     │◄──── Unit API (identity verification)
│  Verification│
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Unit Customer│◄──── POST /customers
│   Created    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│Unit Deposit  │◄──── POST /accounts
│  Account     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ SOLVY Card   │◄──── POST /cards
│   Issued     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Member      │
│ Activated    │
└──────────────┘
```

### 3.3 Webhook Configuration

**Endpoint**: `https://api.solvy.coop/webhooks/unit`  
**Events Subscribed**:
- `account.created`
- `account.closed`
- `card.created`
- `card.activated`
- `transaction.created`
- `transaction.updated`
- `payment.created`
- `payment.clearing`

**Retry Policy**: Exponential backoff (3 retries)  
**Timeout**: 30 seconds  
**Idempotency**: Transaction ID deduplication

---

## 4. COMPLIANCE INTEGRATION

### 4.1 Unit-Provided Compliance

| Requirement | Unit Handling | SOLVY Handling |
|-------------|---------------|----------------|
| Identity Verification (KYC) | ✅ Automated KYB/KYC | ❌ None |
| OFAC/Sanctions Screening | ✅ Real-time screening | ❌ None |
| Document Verification | ✅ ID document check | ❌ None |
| Address Verification | ✅ Proof of address | ❌ None |
| Transaction Monitoring | ✅ Base AML monitoring | ✅ Enhanced rules |
| SAR Filing | ✅ Automated SARs | ✅ Review & approve |
| Regulatory Reporting | ✅ Filed by Unit | ✅ Internal reporting |

### 4.2 Enhanced Due Diligence (SOLVY Layer)

```javascript
// Member Risk Scoring
const calculateRiskScore = (memberData) => {
  let score = 0; // 0 = low, 100 = high
  
  // Business type risk
  if (memberData.businessType === 'cash-intensive') score += 20;
  
  // Geographic risk
  if (highRiskStates.includes(memberData.state)) score += 15;
  
  // Transaction pattern risk
  if (memberData.projectedVolume > 10000) score += 10;
  
  // Referral source
  if (!memberData.referralCode) score += 5;
  
  return score;
};

// EDD Triggers
const requiresEnhancedDueDiligence = (member) => {
  return (
    member.riskScore > 50 ||
    member.pepStatus === true ||
    member.businessType === 'money_services' ||
    member.state === 'high-risk-jurisdiction'
  );
};
```

### 4.3 Ongoing Monitoring

**Daily Automated Checks**:
- Transaction volume vs. projected (±50% variance alert)
- Velocity checks (>10 transactions/hour)
- Geographic impossibility (transactions in different states within 1 hour)
- Merchant category code (MCC) monitoring

**Monthly Manual Reviews**:
- Top 10% of members by transaction volume
- Any member with >3 flagged transactions
- New members (first 30 days)

---

## 5. IMPLEMENTATION TIMELINE

### Phase 1: Foundation (Weeks 1-2)
- [ ] Unit sandbox access provisioned
- [ ] API key generation and secure storage
- [ ] Development environment setup
- [ ] Webhook endpoint deployment

### Phase 2: Core Integration (Weeks 3-4)
- [ ] Customer creation API integration
- [ ] Account creation API integration
- [ ] Card issuance API integration
- [ ] Basic transaction webhook handling

### Phase 3: Business Logic (Weeks 5-6)
- [ ] 70/20/10 revenue distribution logic
- [ ] Member dashboard integration
- [ ] Card management features (freeze/unfreeze)
- [ ] Transaction history and statements

### Phase 4: Compliance & Testing (Weeks 7-8)
- [ ] KYC/KYB flow end-to-end testing
- [ ] AML monitoring rules implementation
- [ ] Security audit and penetration testing
- [ ] Compliance documentation

### Phase 5: Pilot Launch (Weeks 9-12)
- [ ] First Circle onboarding (10 beta members)
- [ ] Transaction volume testing
- [ ] Interchange revenue validation
- [ ] Bug fixes and optimization

### Phase 6: Full Launch (Week 13 - June 19, 2026)
- [ ] All 100 First Circle members onboarded
- [ ] Marketing launch (Juneteenth)
- [ ] Community pool activation
- [ ] First dividend calculation

---

## 6. VOLUME PROJECTIONS

### 6.1 Account Growth

| Month | New Accounts | Total Accounts | Cumulative Growth |
|-------|--------------|----------------|-------------------|
| 1 (Jun) | 100 | 100 | 100% (First Circle) |
| 2 (Jul) | 25 | 125 | 25% |
| 3 (Aug) | 25 | 150 | 20% |
| 6 (Nov) | 200 | 350 | 133% |
| 12 (May 2027) | 650 | 1,000 | 186% |

### 6.2 Transaction Volume

| Month | Daily Transactions | Monthly Volume | Interchange Revenue* |
|-------|-------------------|----------------|---------------------|
| 1 | 500 | $1,275,000 | $15,300 |
| 3 | 750 | $1,912,500 | $22,950 |
| 6 | 1,500 | $3,825,000 | $45,900 |
| 12 | 5,000 | $12,750,000 | $153,000 |

*Assuming 1.2% average interchange rate

### 6.3 API Call Projections

| Month | Daily API Calls | Monthly API Calls | Peak RPS |
|-------|-----------------|-------------------|----------|
| 1 | 2,000 | 60,000 | 10 |
| 6 | 6,000 | 180,000 | 25 |
| 12 | 20,000 | 600,000 | 50 |

---

## 7. RISK MITIGATION

### 7.1 Operational Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| API Downtime | Medium | High | Circuit breaker pattern, caching, retry logic |
| Data Breach | Low | Critical | Encryption, access controls, audit logging |
| Fraud Surge | Medium | High | Real-time monitoring, velocity checks, manual review |
| Member Churn | Medium | Medium | Community building, dividend transparency, support quality |

### 7.2 Regulatory Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| MSB Enforcement | Low | Critical | Proactive registration, legal counsel, compliance audits |
| Banking Partner Change | Low | High | Switch Kit preparation, data portability, member communication |
| AML Violation | Low | Critical | Robust monitoring, SAR filing, staff training |
| State Licensing | Medium | Medium | State-by-state analysis, phased expansion |

---

## 8. SUPPORT REQUIREMENTS

### 8.1 Unit.co Support Needs

| Requirement | Priority | Timeline |
|-------------|----------|----------|
| Sandbox environment | Critical | Week 1 |
| Production API keys | Critical | Week 8 |
| Custom card design approval | High | Week 4 |
| Webhook configuration assistance | Medium | Week 2 |
| Compliance review | Critical | Week 6 |
| Go-live support | Critical | Week 13 |

### 8.2 Escalation Contacts

**Technical Issues**: Unit Developer Support  
**Compliance Questions**: Unit Compliance Team  
**Business Issues**: Unit Account Manager (post-contract)

---

## 9. APPENDICES

### Appendix A: API Schemas

#### Member Object
```json
{
  "id": "mem_1234567890",
  "unitCustomerId": "1234567",
  "unitAccountId": "1111111",
  "unitCardId": "2222222",
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "phone": "+1-555-123-4567",
  "businessName": "Jane's Beauty Lounge",
  "businessType": "sole_proprietorship",
  "licenseNumber": "TX-COS-12345678",
  "address": {
    "street": "123 Main St",
    "city": "Houston",
    "state": "TX",
    "zip": "77001"
  },
  "membershipTier": "first_circle",
  "equityContribution": 100.00,
  "joinedAt": "2026-06-19T00:00:00Z",
  "status": "active"
}
```

#### Revenue Distribution Object
```json
{
  "id": "dist_1234567890",
  "period": "2026-Q2",
  "totalInterchange": 15300.00,
  "distributions": {
    "memberDividend": 10710.00,
    "communityPool": 3060.00,
    "operations": 1530.00
  },
  "memberCount": 100,
  "perMemberAverage": 107.10,
  "distributedAt": "2026-07-15T00:00:00Z"
}
```

### Appendix B: Error Handling

| Error Code | Unit Status | SOLVY Response | Retry Logic |
|------------|-------------|----------------|-------------|
| 400 | Bad Request | Log, alert admin | No retry |
| 401 | Unauthorized | Refresh token, retry | 1 retry |
| 429 | Rate Limited | Exponential backoff | 3 retries |
| 500 | Server Error | Circuit breaker | 3 retries |
| 503 | Service Unavailable | Queue for retry | 5 retries |

### Appendix C: Testing Plan

#### Unit Testing
- Individual API endpoint testing
- Mock Unit API responses
- Error condition testing

#### Integration Testing
- End-to-end onboarding flow
- Transaction processing pipeline
- Webhook handling

#### Load Testing
- 100 concurrent users
- 10,000 transactions/day simulation
- API rate limit validation

#### Security Testing
- Penetration testing
- OWASP Top 10 validation
- Encryption verification

---

## DOCUMENT CERTIFICATION

I certify that this technical specification accurately represents SOLVY Cooperative's intended use of Unit.co services and that all projected volumes and use cases are made in good faith based on reasonable business assumptions.

**Signature**: ___________________  
**Name**: Sean Marlon II  
**Title**: CTO, SOLVY Cooperative  
**Date**: March 23, 2026

---

**Document ID**: SOLVY-UNIT-TECH-2026-001  
**Distribution**: Unit.co Implementation Team, SA Nathan LLC Technical Team  
**Classification**: Confidential - Business Sensitive
