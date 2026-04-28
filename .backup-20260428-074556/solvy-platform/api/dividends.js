/**
 * SOLVY Cooperative - Dividend Distribution API
 * 
 * Implements the 70/20/10 Economic Model:
 * - 70% Member dividends (distributed to members)
 * - 20% Community pool (reinvested in cooperative growth)
 * - 10% Operations (platform maintenance)
 * 
 * @route GET /api/dividends
 * @route POST /api/dividends/calculate
 */

// Financial projections from UNIT_FINANCIAL_PROJECTIONS.md
const FINANCIAL_PROJECTIONS = {
  // Year 1 quarterly interchange revenue (conservative)
  quarterlyRevenue: [7500, 12000, 20000, 35000], // Q1-Q4
  
  // Distribution ratios
  DISTRIBUTION: {
    MEMBER_SHARE: 0.70,      // 70% to members
    COMMUNITY_SHARE: 0.20,   // 20% to community pool
    OPERATIONS_SHARE: 0.10   // 10% to operations
  },
  
  // First Circle founding members
  FIRST_CIRCLE_SIZE: 100,
  
  // Break-even at Month 4
  BREAK_EVEN_MONTH: 4
};

/**
 * Calculate dividend distribution for a member
 * Based on their interchange contribution and cooperative ownership
 */
function calculateMemberDividend(memberId, quarter = 1) {
  const totalRevenue = FINANCIAL_PROJECTIONS.quarterlyRevenue[quarter - 1] || 0;
  
  // Calculate pool allocations
  const memberPool = totalRevenue * FINANCIAL_PROJECTIONS.DISTRIBUTION.MEMBER_SHARE;
  const communityPool = totalRevenue * FINANCIAL_PROJECTIONS.DISTRIBUTION.COMMUNITY_SHARE;
  const operationsPool = totalRevenue * FINANCIAL_PROJECTIONS.DISTRIBUTION.OPERATIONS_SHARE;
  
  // Per-member dividend (equal distribution for First Circle)
  // In production, this would be weighted by transaction volume
  const perMemberDividend = memberPool / FINANCIAL_PROJECTIONS.FIRST_CIRCLE_SIZE;
  
  return {
    quarter,
    totalRevenue,
    breakdown: {
      memberShare: Math.round(perMemberDividend * 100) / 100,
      communityShare: Math.round((communityPool / FINANCIAL_PROJECTIONS.FIRST_CIRCLE_SIZE) * 100) / 100,
      opsShare: Math.round((operationsPool / FINANCIAL_PROJECTIONS.FIRST_CIRCLE_SIZE) * 100) / 100
    },
    pools: {
      totalMemberPool: memberPool,
      totalCommunityPool: communityPool,
      totalOperationsPool: operationsPool
    },
    // Projected annual dividend (Q1-Q4 sum)
    projectedAnnual: calculateProjectedAnnual(memberId)
  };
}

/**
 * Calculate projected annual dividend
 */
function calculateProjectedAnnual(memberId) {
  const annualRevenue = FINANCIAL_PROJECTIONS.quarterlyRevenue.reduce((a, b) => a + b, 0);
  const memberPool = annualRevenue * FINANCIAL_PROJECTIONS.DISTRIBUTION.MEMBER_SHARE;
  return Math.round((memberPool / FINANCIAL_PROJECTIONS.FIRST_CIRCLE_SIZE) * 100) / 100;
}

/**
 * Calculate ROI for a founding member
 * Based on $100 initial equity contribution
 */
function calculateROI(memberId) {
  const equityContribution = 100;
  const projectedAnnualDividend = calculateProjectedAnnual(memberId);
  const roi = ((projectedAnnualDividend - equityContribution) / equityContribution) * 100;
  
  return {
    equityContribution,
    projectedAnnualDividend,
    roiPercentage: Math.round(roi * 10) / 10,
    paybackMonths: Math.ceil(equityContribution / (projectedAnnualDividend / 12))
  };
}

/**
 * GET /api/dividends - Get current member's dividend info
 */
async function getDividends(req, res) {
  try {
    // Get member ID from auth context
    const memberId = req.headers['x-member-id'] || req.query.memberId || 'anonymous';
    const quarter = parseInt(req.query.quarter) || 1;
    
    // Calculate dividends
    const dividend = calculateMemberDividend(memberId, quarter);
    const roi = calculateROI(memberId);
    
    return res.status(200).json({
      memberId,
      ...dividend.breakdown,
      pools: dividend.pools,
      projectedAnnual: dividend.projectedAnnual,
      roi: roi,
      distribution: {
        member: '70%',
        community: '20%',
        operations: '10%'
      }
    });
    
  } catch (error) {
    console.error('[Dividends] Error:', error);
    return res.status(500).json({ 
      error: 'Failed to calculate dividends',
      message: error.message 
    });
  }
}

/**
 * POST /api/dividends/calculate - Calculate for all members (admin)
 */
async function calculateAllDividends(req, res) {
  try {
    const { quarter, totalRevenue } = req.body;
    
    // Validate admin access
    // In production, check admin role
    
    const memberPool = totalRevenue * FINANCIAL_PROJECTIONS.DISTRIBUTION.MEMBER_SHARE;
    const communityPool = totalRevenue * FINANCIAL_PROJECTIONS.DISTRIBUTION.COMMUNITY_SHARE;
    const opsPool = totalRevenue * FINANCIAL_PROJECTIONS.DISTRIBUTION.OPERATIONS_SHARE;
    
    return res.status(200).json({
      quarter,
      totalRevenue,
      distribution: {
        memberPool,
        communityPool,
        opsPool
      },
      perMemberDividend: memberPool / FINANCIAL_PROJECTIONS.FIRST_CIRCLE_SIZE,
      memberCount: FINANCIAL_PROJECTIONS.FIRST_CIRCLE_SIZE
    });
    
  } catch (error) {
    console.error('[Dividends] Calculation error:', error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Main handler
 */
module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method === 'GET') {
    return getDividends(req, res);
  }
  
  if (req.method === 'POST') {
    return calculateAllDividends(req, res);
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
};

// Export for testing
module.exports.calculateMemberDividend = calculateMemberDividend;
module.exports.calculateROI = calculateROI;
module.exports.FINANCIAL_PROJECTIONS = FINANCIAL_PROJECTIONS;
