/**
 * MOLI Policy Loan API
 * 
 * Handles IBC policy loan requests from members and deposits
 * proceeds directly to SOLVY Cards via Unit integration.
 * 
 * Routes:
 * - GET /api/moli/policy/:memberId - Get member's policy details
 * - POST /api/moli/loan-request - Submit new loan request
 * - GET /api/moli/loans/:memberId - Get loan history
 * 
 * SOLVY Manifesto Compliance:
 * - All loans are tax-free (policy loans against CV)
 * - 0.5% processing fee funds operations (the 10% fist)
 * - Instant deposit to SOLVY Card (member liquidity)
 */

const express = require('express');
const router = express.Router();

// Import Unit payment module for card deposits
// In production, this path would be relative to the actual deployment structure
let paymentModule;
try {
  paymentModule = require('../../solvy-unit-integration/api/unit/payment');
} catch (e) {
  // Fallback for different directory structures
  paymentModule = require('../unit-integration/payment');
}

// Approved IBC carriers
const APPROVED_CARRIERS = {
    'oneamerica': {
        name: 'OneAmerica Financial Partners',
        apiEndpoint: process.env.ONEAMERICA_API_URL,
        loanRequestPath: '/policy/loan-request',
        authType: 'oauth2'
    },
    'massmutual': {
        name: 'MassMutual',
        apiEndpoint: process.env.MASSMUTUAL_API_URL,
        loanRequestPath: '/v1/loans',
        authType: 'apikey'
    },
    'guardian': {
        name: 'Guardian Life',
        apiEndpoint: process.env.GUARDIAN_API_URL,
        loanRequestPath: '/policy/loans',
        authType: 'oauth2'
    },
    'nylife': {
        name: 'New York Life',
        apiEndpoint: process.env.NYLIFE_API_URL,
        loanRequestPath: '/api/v2/loans',
        authType: 'apikey'
    }
};

// Mock policy database (replace with actual DB integration)
const policyDatabase = new Map([
    ['member_001', {
        policyId: 'OA-2021-4821',
        carrier: 'oneamerica',
        carrierName: 'OneAmerica Financial Partners',
        faceAmount: 500000,
        cashValue: 127450.00,
        loanBalance: 0,
        policyStatus: 'active',
        puaRider: true,
        issueDate: '2021-03-15',
        owner: 'SA Nathan LLC (Cooperative)',
        insured: 'Founding Member',
        beneficiary: 'SNT for Founding Member'
    }]
]);

// Mock loan history
const loanHistory = new Map([
    ['member_001', []]
]);

/**
 * GET /api/moli/policy/:memberId
 * Retrieve member's MOLI policy details
 */
router.get('/policy/:memberId', async (req, res) => {
    try {
        const { memberId } = req.params;
        const policy = policyDatabase.get(memberId);

        if (!policy) {
            return res.status(404).json({
                success: false,
                error: 'POLICY_NOT_FOUND',
                message: 'No MOLI policy found for this member'
            });
        }

        // Calculate available loan amount (typically 90-95% of CV)
        const maxLoanAmount = Math.floor(policy.cashValue * 0.95);
        const availableCredit = maxLoanAmount - policy.loanBalance;

        res.json({
            success: true,
            data: {
                policy: {
                    policyId: maskPolicyId(policy.policyId),
                    carrier: policy.carrierName,
                    faceAmount: formatCurrency(policy.faceAmount),
                    cashValue: formatCurrency(policy.cashValue),
                    loanBalance: formatCurrency(policy.loanBalance),
                    availableCredit: formatCurrency(availableCredit),
                    maxLoanAmount: formatCurrency(maxLoanAmount),
                    status: policy.policyStatus,
                    puaRider: policy.puaRider,
                    ownership: policy.owner
                },
                mandate: {
                    type: 'SOLVY Manifesto - 70/20/10',
                    note: 'Policy loans are tax-free distributions against cash value'
                }
            }
        });
    } catch (error) {
        console.error('Error fetching policy:', error);
        res.status(500).json({
            success: false,
            error: 'INTERNAL_ERROR',
            message: 'Failed to retrieve policy information'
        });
    }
});

/**
 * POST /api/moli/loan-request
 * Submit a new policy loan request
 * 
 * Request body:
 * {
 *   memberId: string,
 *   amount: number,
 *   purpose: string (optional),
 *   depositToCard: boolean,
 *   cardId: string (if depositToCard)
 * }
 */
router.post('/loan-request', async (req, res) => {
    try {
        const { memberId, amount, purpose = 'general', depositToCard = true, cardId } = req.body;

        // Validate required fields
        if (!memberId || !amount) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_FIELDS',
                message: 'memberId and amount are required'
            });
        }

        // Get member policy
        const policy = policyDatabase.get(memberId);
        if (!policy) {
            return res.status(404).json({
                success: false,
                error: 'POLICY_NOT_FOUND',
                message: 'No MOLI policy found for this member'
            });
        }

        // Validate loan amount
        const maxLoan = Math.floor(policy.cashValue * 0.95) - policy.loanBalance;
        if (amount > maxLoan) {
            return res.status(400).json({
                success: false,
                error: 'AMOUNT_EXCEEDS_LIMIT',
                message: `Requested amount exceeds available credit of ${formatCurrency(maxLoan)}`,
                maxAvailable: maxLoan
            });
        }

        if (amount < 1000) {
            return res.status(400).json({
                success: false,
                error: 'MINIMUM_AMOUNT',
                message: 'Minimum loan amount is $1,000'
            });
        }

        // Calculate fees (0.5% processing fee - funds the 10% operations)
        const processingFee = amount * 0.005;
        const netAmount = amount - processingFee;

        // Create loan request record
        const loanRequest = {
            loanId: generateLoanId(),
            memberId,
            policyId: policy.policyId,
            carrier: policy.carrier,
            requestedAmount: amount,
            processingFee,
            netAmount,
            purpose,
            status: 'pending',
            depositToCard,
            cardId: cardId || 'default',
            createdAt: new Date().toISOString(),
            estimatedFunding: 'instant'
        };

        // Store loan request
        const memberLoans = loanHistory.get(memberId) || [];
        memberLoans.push(loanRequest);
        loanHistory.set(memberId, memberLoans);

        // TODO: Integrate with carrier API
        // const carrierConfig = APPROVED_CARRIERS[policy.carrier];
        // const carrierResponse = await requestCarrierLoan(carrierConfig, loanRequest);

        // Integrate with Unit for card deposit
        let depositResult = null;
        if (depositToCard && paymentModule) {
            try {
                // Get member's Unit account/card mapping
                // In production, this would come from a database lookup
                const memberAccountMapping = getMemberAccountMapping(memberId);
                
                depositResult = await paymentModule.depositMoliLoanProceeds({
                    memberId,
                    accountId: memberAccountMapping.accountId,
                    cardId: cardId || memberAccountMapping.defaultCardId,
                    amount: netAmount,
                    loanId: loanRequest.loanId,
                    carrier: policy.carrier,
                    policyId: policy.policyId
                });
                
                loanRequest.deposit = {
                    paymentId: depositResult.payment?.data?.id,
                    status: 'completed',
                    depositedAt: new Date().toISOString()
                };
            } catch (depositError) {
                console.error('[MOLI] Card deposit failed:', depositError);
                loanRequest.deposit = {
                    status: 'failed',
                    error: depositError.message,
                    retryEligible: true
                };
            }
        }

        // Simulate async processing (in production, this would be a webhook/async job)
        setTimeout(async () => {
            loanRequest.status = 'approved';
            loanRequest.fundedAt = new Date().toISOString();
            
            // Update policy loan balance
            policy.loanBalance += amount;
            policyDatabase.set(memberId, policy);
        }, 2000);

        res.json({
            success: true,
            data: {
                loanRequest: {
                    loanId: loanRequest.loanId,
                    status: 'pending',
                    requestedAmount: formatCurrency(amount),
                    processingFee: formatCurrency(processingFee),
                    netToCard: formatCurrency(netAmount),
                    estimatedFunding: 'Instant (upon approval)',
                    purpose,
                    deposit: loanRequest.deposit ? {
                        status: loanRequest.deposit.status,
                        paymentId: loanRequest.deposit.paymentId,
                        depositedAt: loanRequest.deposit.depositedAt
                    } : null
                },
                policy: {
                    policyId: maskPolicyId(policy.policyId),
                    newLoanBalance: formatCurrency(policy.loanBalance + amount),
                    remainingCredit: formatCurrency(maxLoan - amount)
                },
                card: depositResult ? {
                    cardId: depositResult.details.cardId,
                    accountId: maskAccountId(depositResult.details.accountId),
                    newBalance: 'Available immediately',
                    spendingPower: `+${formatCurrency(netAmount)}`
                } : {
                    status: 'pending_deposit',
                    note: 'Deposit will process upon approval'
                },
                compliance: {
                    taxStatus: 'Tax-free distribution (policy loan against CV)',
                    regulation: 'IRC Section 7702 compliant',
                    manifesto: 'Iron fist protection - no equity dilution'
                }
            }
        });
    } catch (error) {
        console.error('Error processing loan request:', error);
        res.status(500).json({
            success: false,
            error: 'INTERNAL_ERROR',
            message: 'Failed to process loan request'
        });
    }
});

/**
 * GET /api/moli/loans/:memberId
 * Get loan history for a member
 */
router.get('/loans/:memberId', async (req, res) => {
    try {
        const { memberId } = req.params;
        const loans = loanHistory.get(memberId) || [];

        res.json({
            success: true,
            data: {
                loans: loans.map(loan => ({
                    loanId: loan.loanId,
                    date: loan.createdAt,
                    amount: formatCurrency(loan.requestedAmount),
                    status: loan.status,
                    purpose: loan.purpose,
                    netReceived: formatCurrency(loan.netAmount)
                })),
                summary: {
                    totalLoans: loans.length,
                    activeLoans: loans.filter(l => l.status === 'approved').length,
                    totalBorrowed: formatCurrency(loans.reduce((sum, l) => sum + l.requestedAmount, 0))
                }
            }
        });
    } catch (error) {
        console.error('Error fetching loan history:', error);
        res.status(500).json({
            success: false,
            error: 'INTERNAL_ERROR',
            message: 'Failed to retrieve loan history'
        });
    }
});

/**
 * GET /api/moli/carriers
 * List approved IBC carriers
 */
router.get('/carriers', (req, res) => {
    const carriers = Object.entries(APPROVED_CARRIERS).map(([key, config]) => ({
        id: key,
        name: config.name,
        status: 'active'
    }));

    res.json({
        success: true,
        data: {
            carriers,
            note: 'All carriers are mutual life insurance companies - policyholders own the carrier'
        }
    });
});

// Mock member account mapping (replace with actual DB)
const memberAccountMapping = new Map([
    ['member_001', {
        accountId: 'acct_1234567890',
        defaultCardId: 'card_4242424242',
        unitCustomerId: 'customer_founding_member'
    }]
]);

function getMemberAccountMapping(memberId) {
    const mapping = memberAccountMapping.get(memberId);
    if (!mapping) {
        throw new Error(`No Unit account mapping found for member ${memberId}`);
    }
    return mapping;
}

// Helper functions
function maskPolicyId(policyId) {
    const parts = policyId.split('-');
    if (parts.length >= 2) {
        return `•••• •••• ${parts[parts.length - 1]}`;
    }
    return `•••• •••• ${policyId.slice(-4)}`;
}

function maskAccountId(accountId) {
    if (!accountId) return '••••';
    return `••••${accountId.slice(-4)}`;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function generateLoanId() {
    return 'MOLI-' + Date.now().toString(36).toUpperCase();
}

// Future: Carrier API integration
async function requestCarrierLoan(carrierConfig, loanRequest) {
    // Implementation for carrier-specific API calls
    // This would integrate with OneAmerica, MassMutual, etc.
    throw new Error('Carrier integration not yet implemented');
}

module.exports = router;
