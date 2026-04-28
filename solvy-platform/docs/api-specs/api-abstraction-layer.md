# SOLVY Platform API Abstraction Layer

**Version:** 1.0  
**Last Updated:** December 12, 2024  
**Purpose:** Enable seamless transition from third-party APIs (Stripe, Mercury) to sovereign infrastructure without frontend code changes

---

## Overview

The SOLVY platform uses an **abstracted API layer** to decouple frontend components from backend infrastructure. This design pattern allows us to:

1. **Start with third-party services** (Stripe, Mercury) for rapid MVP launch
2. **Transition to sovereign infrastructure** without rewriting frontend code
3. **Maintain consistent interfaces** across infrastructure changes
4. **Test multiple backends** simultaneously (A/B testing, gradual rollout)

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Components                     │
│              (React components, pages, hooks)               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Import from /src/api
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Abstracted API Layer                       │
│                     (/src/api/)                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Payment    │  │   Banking    │  │     Auth     │     │
│  │     API      │  │     API      │  │     API      │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │             │
│         │ Config switch    │ Config switch    │             │
│         │                  │                  │             │
│    ┌────▼────┐        ┌───▼────┐        ┌───▼────┐        │
│    │ Stripe  │        │Mercury │        │ Clerk  │        │
│    │  Impl   │        │  Impl  │        │  Impl  │        │
│    └────┬────┘        └───┬────┘        └───┬────┘        │
│         │                  │                  │             │
│    ┌────▼────┐        ┌───▼────┐        ┌───▼────┐        │
│    │Sovereign│        │Sovereign│        │Sovereign│        │
│    │  Impl   │        │  Impl  │        │  Impl  │        │
│    └─────────┘        └────────┘        └────────┘        │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Backend Infrastructure                     │
│   (Stripe API, Mercury API, Sovereign Payment System)      │
└─────────────────────────────────────────────────────────────┘
```

---

## API Modules

### 1. Payment API (`/src/api/payment/`)

**Purpose:** Handle all payment processing operations

**Interface:**

```typescript
// /src/api/payment/index.ts

export interface PaymentAPI {
  // Create a payment intent
  createPayment(params: CreatePaymentParams): Promise<Payment>
  
  // Confirm a payment
  confirmPayment(paymentId: string): Promise<Payment>
  
  // Refund a payment
  refundPayment(paymentId: string, amount?: number): Promise<Refund>
  
  // Get payment details
  getPayment(paymentId: string): Promise<Payment>
  
  // List payments for a member
  listPayments(memberId: string, options?: ListOptions): Promise<Payment[]>
}

export interface CreatePaymentParams {
  amount: number          // Amount in cents
  currency: string        // USD, EUR, etc.
  memberId: string        // SOLVY member ID
  description?: string    // Optional description
  metadata?: Record<string, any>
}

export interface Payment {
  id: string
  amount: number
  currency: string
  status: 'pending' | 'succeeded' | 'failed'
  memberId: string
  createdAt: Date
  metadata?: Record<string, any>
}

export interface Refund {
  id: string
  paymentId: string
  amount: number
  status: 'pending' | 'succeeded' | 'failed'
  createdAt: Date
}
```

**Implementations:**

#### Stripe Implementation (`/src/api/payment/stripe.ts`)

```typescript
import Stripe from 'stripe'

export class StripePaymentAPI implements PaymentAPI {
  private stripe: Stripe
  
  constructor(apiKey: string) {
    this.stripe = new Stripe(apiKey, { apiVersion: '2023-10-16' })
  }
  
  async createPayment(params: CreatePaymentParams): Promise<Payment> {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: params.amount,
      currency: params.currency,
      metadata: {
        memberId: params.memberId,
        ...params.metadata
      }
    })
    
    return this.mapStripePaymentToPayment(paymentIntent)
  }
  
  async confirmPayment(paymentId: string): Promise<Payment> {
    const paymentIntent = await this.stripe.paymentIntents.confirm(paymentId)
    return this.mapStripePaymentToPayment(paymentIntent)
  }
  
  // ... other methods
  
  private mapStripePaymentToPayment(pi: Stripe.PaymentIntent): Payment {
    return {
      id: pi.id,
      amount: pi.amount,
      currency: pi.currency,
      status: pi.status as Payment['status'],
      memberId: pi.metadata.memberId,
      createdAt: new Date(pi.created * 1000),
      metadata: pi.metadata
    }
  }
}
```

#### Sovereign Implementation (`/src/api/payment/sovereign.ts`)

```typescript
export class SovereignPaymentAPI implements PaymentAPI {
  private apiUrl: string
  private apiKey: string
  
  constructor(apiUrl: string, apiKey: string) {
    this.apiUrl = apiUrl
    this.apiKey = apiKey
  }
  
  async createPayment(params: CreatePaymentParams): Promise<Payment> {
    const response = await fetch(`${this.apiUrl}/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    })
    
    if (!response.ok) {
      throw new Error(`Payment creation failed: ${response.statusText}`)
    }
    
    return await response.json()
  }
  
  // ... other methods
}
```

#### Configuration-Based Switching (`/src/api/payment/index.ts`)

```typescript
import { StripePaymentAPI } from './stripe'
import { SovereignPaymentAPI } from './sovereign'

// Configuration (from environment variables)
const PAYMENT_PROVIDER = import.meta.env.VITE_PAYMENT_PROVIDER || 'stripe'

// Factory function to create the appropriate implementation
export function createPaymentAPI(): PaymentAPI {
  switch (PAYMENT_PROVIDER) {
    case 'stripe':
      return new StripePaymentAPI(import.meta.env.VITE_STRIPE_API_KEY)
    
    case 'sovereign':
      return new SovereignPaymentAPI(
        import.meta.env.VITE_SOVEREIGN_API_URL,
        import.meta.env.VITE_SOVEREIGN_API_KEY
      )
    
    default:
      throw new Error(`Unknown payment provider: ${PAYMENT_PROVIDER}`)
  }
}

// Export singleton instance
export const paymentAPI = createPaymentAPI()
```

---

### 2. Banking API (`/src/api/banking/`)

**Purpose:** Handle account balances, transfers, and banking operations

**Interface:**

```typescript
// /src/api/banking/index.ts

export interface BankingAPI {
  // Get account balance
  getBalance(memberId: string): Promise<Balance>
  
  // Transfer funds between members
  transfer(params: TransferParams): Promise<Transfer>
  
  // Get transfer details
  getTransfer(transferId: string): Promise<Transfer>
  
  // List transfers for a member
  listTransfers(memberId: string, options?: ListOptions): Promise<Transfer[]>
}

export interface Balance {
  memberId: string
  available: number    // Available balance in cents
  pending: number      // Pending balance in cents
  currency: string
  updatedAt: Date
}

export interface TransferParams {
  fromMemberId: string
  toMemberId: string
  amount: number
  currency: string
  description?: string
  metadata?: Record<string, any>
}

export interface Transfer {
  id: string
  fromMemberId: string
  toMemberId: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed'
  createdAt: Date
  completedAt?: Date
  metadata?: Record<string, any>
}
```

**Implementations:**

- **Mercury Implementation** (`/src/api/banking/mercury.ts`)
- **Sovereign Banking Implementation** (`/src/api/banking/sovereign.ts`)

---

### 3. Authentication API (`/src/api/auth/`)

**Purpose:** Handle user authentication, session management, and authorization

**Interface:**

```typescript
// /src/api/auth/index.ts

export interface AuthAPI {
  // Sign up a new member
  signUp(params: SignUpParams): Promise<AuthResult>
  
  // Sign in an existing member
  signIn(params: SignInParams): Promise<AuthResult>
  
  // Sign out current member
  signOut(): Promise<void>
  
  // Get current member
  getCurrentMember(): Promise<Member | null>
  
  // Update member profile
  updateMember(memberId: string, updates: Partial<Member>): Promise<Member>
}

export interface SignUpParams {
  email: string
  password: string
  firstName: string
  lastName: string
  phoneNumber?: string
}

export interface SignInParams {
  email: string
  password: string
}

export interface AuthResult {
  member: Member
  token: string
  expiresAt: Date
}

export interface Member {
  id: string
  email: string
  firstName: string
  lastName: string
  phoneNumber?: string
  kycStatus: 'pending' | 'approved' | 'rejected'
  createdAt: Date
}
```

**Implementations:**

- **Clerk Implementation** (`/src/api/auth/clerk.ts`)
- **Sovereign Auth Implementation** (`/src/api/auth/sovereign.ts`)

---

### 4. KYC API (`/src/api/kyc/`)

**Purpose:** Handle identity verification and KYC compliance

**Interface:**

```typescript
// /src/api/kyc/index.ts

export interface KYCAPI {
  // Create a KYC inquiry
  createInquiry(memberId: string): Promise<KYCInquiry>
  
  // Get inquiry status
  getInquiry(inquiryId: string): Promise<KYCInquiry>
  
  // Submit KYC documents
  submitDocuments(inquiryId: string, documents: Document[]): Promise<KYCInquiry>
}

export interface KYCInquiry {
  id: string
  memberId: string
  status: 'pending' | 'approved' | 'rejected' | 'needs_review'
  createdAt: Date
  completedAt?: Date
  documents?: Document[]
}

export interface Document {
  type: 'drivers_license' | 'passport' | 'ssn' | 'proof_of_address'
  url: string
  uploadedAt: Date
}
```

**Implementations:**

- **Persona Implementation** (`/src/api/kyc/persona.ts`)
- **Sovereign KYC Implementation** (`/src/api/kyc/sovereign.ts`)

---

## Usage in Frontend Components

### Example: Payment Component

```typescript
// /src/components/PaymentButton.tsx

import { useState } from 'react'
import { paymentAPI } from '@/api/payment'  // Abstracted API

export function PaymentButton({ amount, memberId }: PaymentButtonProps) {
  const [loading, setLoading] = useState(false)
  
  const handlePayment = async () => {
    setLoading(true)
    
    try {
      // This code works with BOTH Stripe and Sovereign implementations
      const payment = await paymentAPI.createPayment({
        amount: amount * 100,  // Convert to cents
        currency: 'USD',
        memberId: memberId,
        description: 'SOLVY Card payment'
      })
      
      if (payment.status === 'succeeded') {
        alert('Payment successful!')
      }
    } catch (error) {
      console.error('Payment failed:', error)
      alert('Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <button onClick={handlePayment} disabled={loading}>
      {loading ? 'Processing...' : `Pay $${amount}`}
    </button>
  )
}
```

**Key Point:** This component never imports `stripe` or any provider-specific code. It only uses the abstracted `paymentAPI`. When we switch from Stripe to Sovereign, **this component requires zero changes**.

---

## Configuration Management

### Environment Variables

```bash
# .env.production (Stripe/Mercury)
VITE_PAYMENT_PROVIDER=stripe
VITE_STRIPE_API_KEY=sk_live_...
VITE_BANKING_PROVIDER=mercury
VITE_MERCURY_API_KEY=...
VITE_AUTH_PROVIDER=clerk
VITE_CLERK_API_KEY=...
VITE_KYC_PROVIDER=persona
VITE_PERSONA_API_KEY=...
```

```bash
# .env.sovereign (Sovereign Infrastructure)
VITE_PAYMENT_PROVIDER=sovereign
VITE_SOVEREIGN_PAYMENT_URL=https://api.solvy.coop/payments
VITE_SOVEREIGN_PAYMENT_KEY=...
VITE_BANKING_PROVIDER=sovereign
VITE_SOVEREIGN_BANKING_URL=https://api.solvy.coop/banking
VITE_SOVEREIGN_BANKING_KEY=...
VITE_AUTH_PROVIDER=sovereign
VITE_SOVEREIGN_AUTH_URL=https://api.solvy.coop/auth
VITE_KYC_PROVIDER=sovereign
VITE_SOVEREIGN_KYC_URL=https://api.solvy.coop/kyc
```

### Switching Providers

To switch from Stripe to Sovereign:

1. Update `.env.production` with sovereign configuration
2. Rebuild frontend: `pnpm build`
3. Deploy: `./scripts/deploy-mvp.sh production`

**No code changes required.** The abstraction layer handles everything.

---

## Testing Strategy

### Unit Tests

Each implementation should have comprehensive unit tests:

```typescript
// /src/api/payment/stripe.test.ts

import { describe, it, expect, vi } from 'vitest'
import { StripePaymentAPI } from './stripe'

describe('StripePaymentAPI', () => {
  it('should create a payment', async () => {
    const api = new StripePaymentAPI('test_key')
    
    const payment = await api.createPayment({
      amount: 1000,
      currency: 'USD',
      memberId: 'member_123'
    })
    
    expect(payment.amount).toBe(1000)
    expect(payment.currency).toBe('USD')
    expect(payment.memberId).toBe('member_123')
  })
})
```

### Integration Tests

Test that frontend components work with both implementations:

```typescript
// /src/components/PaymentButton.test.tsx

import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { PaymentButton } from './PaymentButton'

describe('PaymentButton', () => {
  it('should work with Stripe provider', async () => {
    process.env.VITE_PAYMENT_PROVIDER = 'stripe'
    
    const { getByText } = render(<PaymentButton amount={10} memberId="member_123" />)
    const button = getByText('Pay $10')
    
    fireEvent.click(button)
    
    // Assert payment succeeds
  })
  
  it('should work with Sovereign provider', async () => {
    process.env.VITE_PAYMENT_PROVIDER = 'sovereign'
    
    const { getByText } = render(<PaymentButton amount={10} memberId="member_123" />)
    const button = getByText('Pay $10')
    
    fireEvent.click(button)
    
    // Assert payment succeeds
  })
})
```

---

## Migration Checklist

When transitioning from Stripe to Sovereign:

### Phase 1: Preparation
- [ ] Implement `SovereignPaymentAPI` class
- [ ] Implement `SovereignBankingAPI` class
- [ ] Implement `SovereignAuthAPI` class
- [ ] Implement `SovereignKYCAPI` class
- [ ] Write comprehensive unit tests for all implementations
- [ ] Test in staging environment

### Phase 2: Parallel Running
- [ ] Deploy both Stripe and Sovereign implementations
- [ ] Use feature flags to route 10% of traffic to Sovereign
- [ ] Monitor error rates, response times, success rates
- [ ] Gradually increase Sovereign traffic (10% → 50% → 100%)

### Phase 3: Full Cutover
- [ ] Route 100% of traffic to Sovereign
- [ ] Monitor for 48 hours
- [ ] If stable, remove Stripe implementation code
- [ ] Update documentation

### Phase 4: Cleanup
- [ ] Remove Stripe API keys from environment
- [ ] Remove Stripe npm packages
- [ ] Archive Stripe implementation code
- [ ] Update deployment scripts

---

## Best Practices

1. **Never import provider-specific code in components**
   - ❌ `import Stripe from 'stripe'`
   - ✅ `import { paymentAPI } from '@/api/payment'`

2. **Always use the abstracted interfaces**
   - Define clear TypeScript interfaces
   - Ensure all implementations conform to interfaces

3. **Handle errors consistently**
   - All implementations should throw similar error types
   - Frontend should handle errors generically

4. **Test both implementations**
   - Unit tests for each implementation
   - Integration tests for frontend components with both providers

5. **Document breaking changes**
   - If interface changes, update all implementations
   - Version the API layer (v1, v2, etc.)

---

## Future Enhancements

1. **Multi-provider support**: Run Stripe and Sovereign simultaneously, route based on member preference
2. **A/B testing**: Compare performance between providers
3. **Fallback mechanisms**: If Sovereign fails, automatically fallback to Stripe
4. **Provider-specific features**: Expose advanced features through optional methods
5. **Monitoring**: Track which provider is being used, success rates, response times

---

## References

- **Payment API Implementation:** `/src/api/payment/`
- **Banking API Implementation:** `/src/api/banking/`
- **Auth API Implementation:** `/src/api/auth/`
- **KYC API Implementation:** `/src/api/kyc/`
- **Stripe Documentation:** https://stripe.com/docs/api
- **Mercury Documentation:** https://mercury.com/api-docs

---

**Document Version:** 1.0  
**Next Review:** Quarterly (or before major infrastructure changes)
