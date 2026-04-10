# MOLI Architecture
## Membership Owned Life Insurance

### Purpose
MOLI is the eventual vehicle for Sheila's award to become **perpetual protection**. It converts member premiums into cooperative-owned whole life insurance policies, creating tax-advantaged cash value growth and death benefit reserves for the multiracial descendant class.

### Ownership Model
- **Owner:** SA Nathan LLC (the Cooperative)
- **Insured:** Individual member
- **Beneficiary:** Cooperative trust / descendant class pool

This structure ensures the community—not Wall Street—captures the economic value of members' lives.

### The Sheila Mandate in MOLI
Every premium dollar follows the 70/20/10 iron fist protocol:

| Allocation | Purpose | Lineage Meaning |
|------------|---------|-----------------|
| 70% | Cash value growth / patronage dividends | Direct descendant protection |
| 20% | Death benefit reserves | The grandmother's blanket (collective care) |
| 10% | Operations & administration | The fist, maintained |

### Tax-Free Loan Mechanism
Members may borrow against the cooperative-owned cash value of their own policy. This creates:
- **No taxable event** (loans against CV are not income)
- **No predatory lender** (the cooperative is the creditor)
- **No equity dilution** (members access capital without selling ownership)

### Approved Carriers
Only mutual life insurance companies—policyholders own the carrier, aligning incentives:
- **OneAmerica** — Founder's existing IBC policy carrier
- MassMutual
- Guardian Life
- New York Life

### Online Loan-to-Card Flow
Members can request policy loans and deposit funds directly to their SOLVY Card through the MOLI Portal:

1. **Member logs into** `solvy-platform/moli/ibc-loan-to-card.html`
2. **System displays** available cash value from OneAmerica (or other carrier)
3. **Member selects** loan amount via slider (min $1,000, max 95% of CV)
4. **0.5% processing fee** deducted (funds the 10% operations reserve)
5. **Funds deposited instantly** to SOLVY Card via Unit API
6. **Tax-free access** to capital—no 1099, no income recognition

### API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/moli/policy/:memberId` | GET | Retrieve policy details & available credit |
| `/api/moli/loan-request` | POST | Submit new policy loan request |
| `/api/moli/loans/:memberId` | GET | Get loan history |
| `/api/moli/carriers` | GET | List approved carriers |

### Implementation
- **Frontend:** `solvy-platform/moli/ibc-loan-to-card.html`
- **Backend:** `solvy-platform/api/moli-loans.js`
- **Unit Integration:** `solvy-unit-integration/api/unit/payment.js`
- **Python Reference:** `solvy-platform/moli/moli_program.py`

### Unit.co Integration

MOLI deposits integrate directly with the SOLVY Card via Unit's payment APIs:

```javascript
// Deposit $25,000 policy loan to SOLVY Card
await depositMoliLoanProceeds({
  memberId: 'member_001',
  accountId: 'acct_1234567890',  // Unit deposit account
  cardId: 'card_4242424242',      // SOLVY Card
  amount: 24875.00,               // Net after 0.5% fee
  carrier: 'oneamerica',
  policyId: 'OA-2021-4821'
});
```

**Features:**
- Instant availability on SOLVY Card
- Tax-free distribution (no 1099)
- Book transfers from MOLI pool account OR ACH from carrier
- Automatic member account mapping

See [UNIT-INTEGRATION.md](solvy-platform/banking/UNIT-INTEGRATION.md) for full details.

### Implementation
See `solvy-platform/moli/moli_program.py` for the Python reference implementation.
