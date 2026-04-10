/**
 * SOLVY Card Payment & Deposit API
 * 
 * Handles funding SOLVY cards via:
 * - ACH transfers from external accounts
 * - Wire transfers
 * - Book transfers between Unit accounts
 * - MOLI policy loan proceeds (direct deposit)
 * 
 * Part of the MOLI (Membership Owned Life Insurance) integration
 * enabling tax-free policy loan proceeds to fund member cards instantly.
 */

const unit = require('../../lib/unit');

/**
 * Create a book transfer between two Unit accounts
 * Used for internal movements (e.g., MOLI loan pool to member card account)
 * 
 * @param {string} fromAccountId - Source account ID
 * @param {string} toAccountId - Destination account ID
 * @param {number} amount - Amount in cents
 * @param {string} description - Transfer description
 * @param {Object} metadata - Additional metadata
 */
const createBookTransfer = async (fromAccountId, toAccountId, amount, description, metadata = {}) => {
  const payload = {
    data: {
      type: 'bookTransfer',
      attributes: {
        amount: amount, // In cents
        description: description,
        tags: {
          ...metadata,
          createdAt: new Date().toISOString(),
          source: 'moli_loan_deposit'
        }
      },
      relationships: {
        fromAccount: {
          data: {
            type: 'account',
            id: fromAccountId
          }
        },
        toAccount: {
          data: {
            type: 'account',
            id: toAccountId
          }
        }
      }
    }
  };

  return await unit.post('/book-transfers', payload);
};

/**
 * Create a received ACH payment (simulating external funding)
 * Used when MOLI loan proceeds come from OneAmerica or other carriers
 * 
 * @param {string} accountId - Destination account ID
 * @param {number} amount - Amount in cents
 * @param {string} description - Payment description
 * @param {Object} metadata - Additional metadata including MOLI loan ID
 */
const simulateIncomingAch = async (accountId, amount, description, metadata = {}) => {
  // In sandbox, Unit provides a simulate endpoint
  // In production, this would be an actual ACH from the insurance carrier
  const payload = {
    data: {
      type: 'achPayment',
      attributes: {
        amount: amount,
        direction: 'Credit',
        description: description,
        tags: {
          ...metadata,
          paymentType: 'moli_loan_proceeds',
          processedAt: new Date().toISOString()
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
    }
  };

  // Sandbox simulation endpoint
  if (process.env.NODE_ENV === 'sandbox') {
    return await unit.post(`/accounts/${accountId}/simulate/received-ach`, payload);
  }

  // Production: This would be handled by actual ACH from carrier
  return await unit.post('/payments', payload);
};

/**
 * Deposit MOLI policy loan proceeds directly to member's SOLVY Card account
 * This is the core integration between MOLI and Unit
 * 
 * @param {Object} params - Deposit parameters
 * @param {string} params.memberId - SOLVY member ID
 * @param {string} params.accountId - Unit account ID (card's funding account)
 * @param {string} params.cardId - SOLVY Card ID
 * @param {number} params.amount - Amount in dollars (will convert to cents)
 * @param {string} params.loanId - MOLI loan request ID
 * @param {string} params.carrier - Insurance carrier (oneamerica, etc.)
 * @param {string} params.policyId - Policy number
 */
const depositMoliLoanProceeds = async ({
  memberId,
  accountId,
  cardId,
  amount,
  loanId,
  carrier,
  policyId
}) => {
  const amountInCents = Math.round(amount * 100);
  const description = `MOLI Loan Proceeds - ${carrier.toUpperCase()} Policy ${policyId.slice(-4)}`;

  // Step 1: Create the payment (book transfer or ACH)
  let payment;
  
  // Check if we have a master MOLI pool account for book transfers
  const moliPoolAccountId = process.env.MOLI_POOL_ACCOUNT_ID;
  
  if (moliPoolAccountId) {
    // Use book transfer from MOLI pool (faster, internal)
    payment = await createBookTransfer(
      moliPoolAccountId,
      accountId,
      amountInCents,
      description,
      {
        memberId,
        loanId,
        carrier,
        policyId: maskPolicyId(policyId),
        cardId,
        depositType: 'moli_book_transfer'
      }
    );
  } else {
    // Use ACH simulation for sandbox testing
    // In production, this would be a real ACH from the carrier
    payment = await simulateIncomingAch(
      accountId,
      amountInCents,
      description,
      {
        memberId,
        loanId,
        carrier,
        policyId: maskPolicyId(policyId),
        cardId,
        depositType: 'moli_ach_credit'
      }
    );
  }

  // Step 2: Log the Sheila Mandate compliance
  console.log(`[MOLI Deposit] ${loanId}:`, {
    memberId,
    amount: `$${amount.toFixed(2)}`,
    carrier,
    cardId: maskCardId(cardId),
    mandate: 'Iron fist protection - tax-free capital access'
  });

  return {
    success: true,
    payment,
    details: {
      memberId,
      accountId,
      cardId: maskCardId(cardId),
      amount: `$${amount.toFixed(2)}`,
      loanId,
      carrier,
      status: 'completed',
      available: 'immediate',
      taxStatus: 'Tax-free policy loan distribution'
    }
  };
};

/**
 * Get payment status and history
 * @param {string} paymentId - Unit payment ID
 */
const getPayment = async (paymentId) => {
  return await unit.get(`/payments/${paymentId}`);
};

/**
 * List payments for an account
 * @param {string} accountId - Unit account ID
 * @param {Object} filters - Optional filters
 */
const listPayments = async (accountId, filters = {}) => {
  const params = new URLSearchParams({
    filter[accountId]: accountId,
    ...filters
  });
  return await unit.get(`/payments?${params}`);
};

/**
 * Reverse a payment (for failed MOLI loans or clawbacks)
 * @param {string} paymentId - Payment to reverse
 * @param {string} reason - Reason for reversal
 */
const reversePayment = async (paymentId, reason) => {
  const payload = {
    data: {
      type: 'paymentReversal',
      attributes: {
        reason,
        reversedAt: new Date().toISOString()
      },
      relationships: {
        originalPayment: {
          data: {
            type: 'payment',
            id: paymentId
          }
        }
      }
    }
  };

  return await unit.post('/payments/reversal', payload);
};

// Helper functions
function maskPolicyId(policyId) {
  if (!policyId) return '••••';
  const parts = policyId.split('-');
  if (parts.length >= 2) {
    return `••••${parts[parts.length - 1]}`;
  }
  return `••••${policyId.slice(-4)}`;
}

function maskCardId(cardId) {
  if (!cardId) return '••••';
  return `••••${cardId.slice(-4)}`;
}

module.exports = {
  createBookTransfer,
  simulateIncomingAch,
  depositMoliLoanProceeds,
  getPayment,
  listPayments,
  reversePayment
};
