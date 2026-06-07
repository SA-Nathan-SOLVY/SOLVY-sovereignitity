# SOLVY × Guapcoin — Technical Integration Architecture

**Version:** 1.0  
**Date:** June 3, 2026  
**Status:** Preliminary — for discussion only

---

## Overview

This document describes how SOLVY's fiat debit card infrastructure could integrate with Guapcoin's blockchain network to create a seamless crypto-to-fiat experience for the African diaspora.

**Principle:** Guapcoin holders should be able to spend their GUAP anywhere SOLVY Card is accepted. SOLVY members should be able to acquire GUAP using their card.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER INTERFACE                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────────────┐  │
│  │ SOLVY Banking│  │ Guapcoin     │  │ Unified Dashboard (Future)       │  │
│  │ Portal       │  │ Wallet       │  │ • Balance: USD + GUAP            │  │
│  │ • Card ctrl  │  │ • Send GUAP  │  │ • Card status                    │  │
│  │ • Tx history │  │ • Stake      │  │ • Recent transactions            │  │
│  │ • Dividends  │  │ • Swap       │  │ • Dividend claims                │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            INTEGRATION LAYER                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐  │
│  │ SOLVY API        │  │ Bridge Service   │  │ Guapcoin API / RPC       │  │
│  │ (Node/Express)   │◄─┤ (Future micro-   │◄─┤ (Blockchain node)        │  │
│  │                  │  │  service)        │  │                          │  │
│  │ /api/banking/*   │  │                  │  │ • Balance queries        │  │
│  │ /api/dividends/* │  │ • Rate oracle    │  │ • Transaction broadcast  │  │
│  │ /api/onboard/*   │  │ • Swap execution │  │ • Staking data           │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           EXTERNAL SERVICES                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │   Lithic     │  │ AlchemyPay   │  │    Baanx     │  │  DeepSeek AI   │  │
│  │ Card Issuer  │  │ Fiat Bridge  │  │ Crypto Card  │  │  Budget/Tax    │  │
│  │ (Primary)    │  │ (Buy/Sell)   │  │ (Phase 2)    │  │  Analysis      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Integration Scenarios

### Scenario A: GUAP → USD (Spend Crypto)

**User Story:** A Guapcoin holder wants to buy groceries with their GUAP balance.

**Flow:**
1. User initiates "Load Card" in Guapcoin wallet
2. Guapcoin wallet calls Bridge Service with: `amount_GUAP`, `solvy_card_token`
3. Bridge Service:
   - Queries AlchemyPay for GUAP/USD rate
   - Executes swap: GUAP → USDC (or direct fiat)
   - Sends USD to SOLVY's Lithic account
   - Updates card balance via Lithic API
4. User receives push notification: "$X.XX loaded to SOLVY Card"
5. User swipes card at merchant
6. Interchange revenue generated → 70/20/10 split

**Revenue Share:**
- AlchemyPay fee: ~1.5% (industry standard)
- SOLVY retains: 0.5% for infrastructure
- Guapcoin treasury: 0.5% for ecosystem development
- Member pool: remainder (if any)

---

### Scenario B: USD → GUAP (Buy Crypto)

**User Story:** A SOLVY member wants to buy Guapcoin with their card.

**Flow:**
1. User selects "Buy GUAP" in SOLVY banking portal
2. SOLVY API calls AlchemyPay onramp with: `amount_USD`, `guap_address`
3. AlchemyPay:
   - Charges user's SOLVY Card (debit transaction)
   - Executes swap: USD → GUAP
   - Sends GUAP to user's Guapcoin wallet address
4. Transaction appears in both SOLVY tx history and Guapcoin wallet

**Revenue Share:**
- Same split as Scenario A
- Additional: SOLVY earns interchange on the initial card swipe (~0.5%)

---

### Scenario C: Dividends in GUAP

**User Story:** A SOLVY member opts to receive quarterly patronage dividends in Guapcoin instead of USD.

**Flow:**
1. SOLVY calculates 70% member pool distribution (quarterly)
2. Member has toggled "Receive in GUAP" in profile settings
3. SOLVY API:
   - Converts USD dividend to GUAP at market rate
   - Transfers GUAP to member's Guapcoin wallet
   - Records transaction on SOLVY ledger (local IndexedDB)
4. Member sees GUAP balance increase in Guapcoin wallet

**Benefits:**
- Member builds crypto wealth without active trading
- Guapcoin gets organic buying pressure
- SOLVY differentiates from traditional banks

---

## Data Flow — Transaction Lifecycle

```
Member swipes SOLVY Card at merchant
         │
         ▼
┌─────────────────┐
│  Lithic API     │ ──► Authorization request
│  (Card Network) │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  Interchange    │ ──► Revenue generated (~1.2% of tx)
│  Fee Captured   │
└─────────────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌─────────────┐
│  70%   │ │   20%       │
│ Member │ │ Operations  │
│ Pool   │ │ Reserve     │
└────────┘ └─────────────┘
    │
    ▼
┌─────────────────────────┐
│ Member opts for GUAP    │ ──► Bridge Service converts USD → GUAP
│ dividend distribution   │ ──► GUAP sent to member wallet
└─────────────────────────┘
```

---

## API Contract (Draft)

### Bridge Service Endpoints

```
POST /bridge/guap-to-usd
{
  "guap_amount": "1000.00",
  "member_id": "solvy_member_123",
  "card_token": "lithic_card_abc",
  "guap_address": "GUAP...xyz"
}

Response:
{
  "success": true,
  "usd_amount": "45.50",
  "rate": "0.0455",
  "fee": "0.68",
  "card_balance_updated": "45.50",
  "tx_hash": "GUAP_tx_123..."
}
```

```
POST /bridge/usd-to-guap
{
  "usd_amount": "50.00",
  "member_id": "solvy_member_123",
  "guap_address": "GUAP...xyz"
}

Response:
{
  "success": true,
  "guap_amount": "1098.90",
  "rate": "0.0455",
  "fee": "0.75",
  "guap_tx_hash": "GUAP_tx_456..."
}
```

---

## Security Considerations

| Concern | Mitigation |
|---------|------------|
| Private key exposure | Guapcoin keys stay in Guapcoin wallet. SOLVY never sees them. |
| Bridge custody | Use non-custodial swaps (AlchemyPay) or smart contract escrow |
| Rate manipulation | Oracle uses multiple DEX feeds + time-weighted average |
| Regulatory | Both entities maintain separate KYC/AML. Bridge only moves between verified accounts. |
| Data privacy | SOLVY's local-first architecture means tx history stays on device. Guapcoin blockchain is public. Bridge only shares necessary data. |

---

## Implementation Phases

| Phase | Timeline | Deliverable |
|-------|----------|-------------|
| 1. Discovery | June 2026 | Joint technical call, share API docs |
| 2. Bridge MVP | July–Aug 2026 | AlchemyPay integration, manual swaps |
| 3. Auto-Swap | Sept–Oct 2026 | Member can toggle "auto-convert dividends to GUAP" |
| 4. Unified UI | Nov–Dec 2026 | Single dashboard showing USD + GUAP balances |
| 5. Cooperative Governance | 2027 | Members vote on bridge fee splits via MAN portal |

---

## Open Questions for Discussion

1. **Guapcoin tokenomics:** Is there a treasury or dev fund that could receive a portion of bridge fees?
2. **Staking:** Could SOLVY members stake GUAP directly from the banking portal?
3. **Mobile:** Does Guapcoin have a mobile wallet SDK we could embed?
4. **Compliance:** What are Guapcoin's regulatory requirements for fiat integration?
5. **Community:** Would Guapcoin holders be interested in a co-branded physical card?

---

*Document maintained by SOLVY Technical Team*  
*For discussion purposes only — not a binding agreement*
