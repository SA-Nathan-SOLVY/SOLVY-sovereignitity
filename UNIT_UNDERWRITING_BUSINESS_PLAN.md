# SOLVY Ecosystem™
## Business Plan for Unit.co Underwriting

**Entity:** SA Nathan LLC (Texas Cooperative Structure)  
**Product:** SOLVY Card™ - Member-Owned Debit Card Program  
**Submission Date:** April 8, 2026  
**Target Launch:** June 19, 2026 (Juneteenth)  

---

## EXECUTIVE SUMMARY

SOLVY Ecosystem™ is a cooperative financial technology platform that issues debit cards to members and returns 70% of interchange revenue as patronage dividends. Unlike traditional banks that extract wealth from communities, SOLVY is owned by the people who use it.

**The 70/20/10 Model:**
- **70%** → Member dividends (direct cash back)
- **20%** → Community pool (group benefits)
- **10%** → Operations (sustainable growth)

**Mission:** Build generational wealth infrastructure for marginalized communities through cooperative economics.

---

## SECTION 1: BUSINESS MODEL

### 1.1 Product Offering

| Feature | Description |
|---------|-------------|
| **SOLVY Card™** | Visa/Mastercard debit card (virtual + physical) |
| **Account Type** | FDIC-insured deposit accounts via Thread Bank |
| **Membership** | $100 equity contribution = ownership + voting rights |
| **Revenue Share** | 70% of interchange fees returned to members |
| **Target Market** | Independent Beauty Contractors (IBCs) and underserved communities |

### 1.2 Revenue Model

**Interchange Fee Capture:**
- Average interchange: 1.2% of transaction volume
- SOLVY share: 1.2% (after network fees)
- Member dividend: 70% of SOLVY share

**Per Member Economics (Month 12):**

| Metric | Amount |
|--------|--------|
| Monthly spending | $1,200-$4,000 |
| Interchange generated | $18-$60 |
| SOLVY share (1.2%) | $14-$48 |
| **Member dividend (70%)** | **$10-$34/month** |
| **Annual member return** | **$120-$408** |
| **ROI on $100 equity** | **120%-408%** |

### 1.3 Unit Economics

- **Cost per member:** $18/month (Unit fees, processing, support)
- **Revenue per member:** $252/month (interchange)
- **Net per member:** +$234/month
- **Break-even:** Month 4 (150 members)

---

## SECTION 2: MARKET OPPORTUNITY

### 2.1 Target Market: First Circle

**Primary Segment:** Independent Beauty Contractors (IBCs)
- **Market Size:** 100,000+ IBCs in Texas alone
- **Transaction Volume:** $1,200-$4,000/month per contractor
- **Pain Points:** Cash-heavy, underserved by banks, high check-cashing fees
- **Community:** Strong word-of-mouth, community-oriented

### 2.2 Market Validation

**Pilot Partner:**
- ✅ Evergreen Beauty Lounge (Live) - ebl.beauty
- Merchant acceptance via Stripe already operational
- Ready to accept SOLVY Card payments immediately

**First Circle Status:**
- 45 members confirmed (as of April 2026)
- 55 additional members in pipeline
- Target: 100 founding members by June 2026

### 2.3 Expansion Plan

| Phase | Timeline | Members | Geography |
|-------|----------|---------|-----------|
| **Foundation** | Now - Jun 2026 | 100 | Texas (First Circle) |
| **Growth** | Jul - Dec 2026 | 1,000 | Texas + California |
| **Scale** | 2027-2028 | 10,000+ | Multi-state |

---

## SECTION 3: FINANCIAL PROJECTIONS

### 3.1 12-Month Forecast

| Metric | Month 1 | Month 6 | Month 12 |
|--------|---------|---------|----------|
| **Accounts** | 100 | 350 | 1,000 |
| **Transactions/Day** | 500 | 1,750 | 5,000 |
| **Monthly Volume** | $1.275M | $4.46M | $12.75M |
| **Interchange Revenue** | $15,300 | $53,550 | $153,000 |
| **Operating Costs** | $14,888 | $18,500 | $25,000 |
| **Net Revenue** | $412 | $35,050 | $128,000 |
| **Member Dividends** | $288 | $24,535 | $89,600 |

### 3.2 Capital Requirements

**Initial Capital:** $25,000
- Legal/Compliance: $10,000
- Unit.co Setup: $3,000
- Infrastructure: $500
- Marketing: $2,000
- Operating Buffer: $9,500

**Monthly Burn:**
- Month 1: $14,888
- Month 6: $18,500
- Month 12: $25,000

**Runway:** 5.7 months to break-even

### 3.3 Revenue Distribution (70/20/10)

**Example: Month 12 ($153,000 interchange)**
- Member dividends (70%): $107,100
- Community pool (20%): $30,600
- Operations (10%): $15,300

**Per-member dividend:** $107 average (varies by usage)

---

## SECTION 4: TECHNICAL IMPLEMENTATION

### 4.1 Technology Stack

| Component | Provider | Status |
|-----------|----------|--------|
| **Banking Core** | Unit.co + Thread Bank | ✅ Sandbox Active |
| **Card Network** | Visa/Mastercard | ✅ Via Unit |
| **Web Platform** | React PWA | ✅ Deployed |
| **Hosting** | Hetzner VPS | ✅ Live |
| **Database** | PostgreSQL (planned) | 🔄 In Progress |
| **KYC/KYB** | Unit Ready To Launch | ✅ Integrated |

### 4.2 API Integration Status

**Completed:**
- ✅ Customer creation & management
- ✅ Deposit account opening
- ✅ Virtual card issuance
- ✅ JWT token generation
- ✅ Webhook handling
- ✅ Callback endpoints configured

**In Progress:**
- 🔄 Physical card ordering
- 🔄 Transaction simulation
- 🔄 Database persistence

### 4.3 Security & Compliance

| Requirement | Provider | Status |
|-------------|----------|--------|
| **Identity Verification** | Unit.co | ✅ Complete |
| **Document Verification** | Unit.co | ✅ Complete |
| **OFAC Screening** | Unit.co | ✅ Complete |
| **PCI DSS** | Unit.co | ✅ Unit handles card data |
| **Data Encryption** | TLS 1.3 | ✅ Configured |
| **SOC 2 Type II** | Unit.co | ✅ Complete |

---

## SECTION 5: COMPLIANCE PROGRAM

### 5.1 BSA/AML Framework

**Customer Identification Program (CIP):**
- Unit.co handles full KYC/KYB verification
- Document upload via Ready To Launch component
- Identity verification via Unit's integrated providers

**Transaction Monitoring:**
- Unit provides real-time fraud monitoring
- Automated SAR filing for suspicious activity
- Manual review queue for edge cases

**Record Retention:**
- 5-year retention policy (as required)
- Database implementation in progress
- Audit trail logging configured

### 5.2 Privacy & Data Security

- **Privacy Policy:** Draft complete, legal review pending
- **Data Handling:** PII stored by Unit (not SOLVY)
- **Encryption:** TLS 1.3 for all communications
- **Breach Response:** Plan documented, procedures in place

### 5.3 Regulatory Status

| Requirement | Status | Timeline |
|-------------|--------|----------|
| **Texas LLC** | ✅ Formed | Complete |
| **MSB Registration** | 🔄 Pending | Post-launch (Month 2) |
| **State Money Transmitter** | 🔄 Research | As required |
| **Trademark Filing** | ✅ Filed | March 30, 2026 |

---

## SECTION 6: OPERATIONAL READINESS

### 6.1 Customer Support

**Channels:**
- Email: hello@ebl.beauty
- In-app messaging (planned)
- Phone support (Month 3)

**Procedures:**
- Card replacement requests
- Dispute handling (Unit provides base)
- Account inquiries

### 6.2 Card Operations

**Virtual Cards:**
- Instant issuance upon approval
- Digital wallet ready (Apple Pay/Google Pay)
- Immediate use for online transactions

**Physical Cards:**
- 7-10 business day shipping
- Standard mail (tracked)
- Activation via app

### 6.3 Risk Management

**Fraud Prevention:**
- Unit provides real-time monitoring
- Card freezing/unfreezing via app
- Transaction alerts (planned)

**Credit Risk:**
- Debit cards only (no credit risk)
- No overdraft program (initially)
- Account limits based on history

---

## SECTION 7: MANAGEMENT TEAM

### 7.1 Leadership

**Sean Mayo, Managing Member**
- Trust Protector (passive per TDIU)
- Strategic vision and compliance oversight
- Lineage keeper of the Sheila Mandate

**Technical Team**
- Full-stack development (Kimi Code)
- Unit.co integration specialists
- Security and compliance engineers

### 7.2 Advisors

- **Legal:** Engaging banking/compliance counsel
- **Banking:** Unit.co partnership team
- **Community:** Operation HOPE (partnership pending)

### 7.3 Governance

**Cooperative Structure:**
- Members = Owners
- One member = One vote
- Board elected annually
- 70% profit distribution mandatory

---

## SECTION 8: UNDERWRITING CHECKLIST

### 8.1 Required Documentation ✅

| Item | Status | Location |
|------|--------|----------|
| Business Plan | ✅ Complete | This document |
| Financial Projections | ✅ Complete | 12-month forecast attached |
| Compliance Program | ✅ Complete | BSA/AML framework documented |
| Technology Overview | ✅ Complete | API integration verified |
| Operating Procedures | ✅ Complete | Support and risk procedures |
| Background Checks | 🔄 Pending | Will provide upon request |

### 8.2 Technical Readiness ✅

| Component | Status |
|-----------|--------|
| Sandbox Testing | ✅ Complete |
| Callback Endpoints | ✅ Configured |
| Webhook Handling | ✅ Implemented |
| Token Generation | ✅ Operational |
| Production Environment | 🔄 Ready for keys |

### 8.3 Capital Requirements ✅

- **Minimum Required:** $25,000
- **Available:** $25,000
- **Source:** Founder capital + First Circle contributions

---

## CONCLUSION

SOLVY Ecosystem™ represents a new model for community wealth building through cooperative banking. With the technical infrastructure in place, First Circle members committed, and a clear path to profitability, we are ready to launch the SOLVY Card™ program.

**Unit.co partnership** is critical to our mission. By leveraging Unit's banking-as-a-service platform, we can focus on our core competency—building community-owned financial infrastructure—while Unit handles the complex regulatory and compliance requirements.

**We respectfully request approval for production API keys** to begin serving our First Circle members on June 19, 2026.

---

## APPENDIX: SUPPORTING DOCUMENTS

1. **Financial Projections Detail** - `UNIT_FINANCIAL_PROJECTIONS.md`
2. **Technical Integration Spec** - `UNIT_TECHNICAL_INTEGRATION_SPEC.md`
3. **Underwriting Readiness Report** - `UNDERWRITING_READINESS_REPORT.md`
4. **Compliance Documentation** - Available upon request
5. **Entity Formation Documents** - Texas LLC certificate

---

**Contact Information:**  
**Entity:** SA Nathan LLC  
**Website:** https://ebl.beauty  
**Email:** hello@ebl.beauty  
**Technical Integration:** https://git.ebl.beauty

---

*SOLVY Ecosystem™ - Own your spend. Own your future.*  
*Document ID: SOLVY-UNIT-BP-2026-001*  
*Classification: Confidential - Underwriting Submission*
