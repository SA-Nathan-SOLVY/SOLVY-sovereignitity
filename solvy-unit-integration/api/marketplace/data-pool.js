/**
 * SOLVY Data Marketplace API
 * Member-owned data pooling and monetization
 * 
 * Revenue follows 70/20/10:
 * - 70% Member Pool (distributed to contributors)
 * - 20% Operations
 * - 10% Sovereign Fund
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ============================================================================
// IN-MEMORY STORAGE (with JSON persistence)
// ============================================================================

const DATA_FILE = path.join(__dirname, '../../.data/marketplace.json');

function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function loadData() {
  ensureDataDir();
  if (!fs.existsSync(DATA_FILE)) {
    return { pools: {}, contributions: {}, sales: [], revenueSummary: { totalRevenue: 0, memberPool: 0, operations: 0, sovereignFund: 0 } };
  }
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (e) {
    return { pools: {}, contributions: {}, sales: [], revenueSummary: { totalRevenue: 0, memberPool: 0, operations: 0, sovereignFund: 0 } };
  }
}

function saveData(data) {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

let marketplaceData = loadData();

// ============================================================================
// HELPERS
// ============================================================================

function generateId() {
  return crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
}

function splitRevenue(amount) {
  return {
    memberPool: Math.round(amount * 0.70 * 100) / 100,
    operations: Math.round(amount * 0.20 * 100) / 100,
    sovereignFund: Math.round(amount * 0.10 * 100) / 100
  };
}

function buildDataset(poolId) {
  const poolContributions = marketplaceData.contributions[poolId] || [];
  if (poolContributions.length === 0) return null;

  // Aggregate all contributions into anonymized bundles
  const categoryTotals = {};
  let totalVolume = 0;
  let totalTransactions = 0;
  const contributorHashes = new Set();

  poolContributions.forEach(contrib => {
    const data = contrib.data || {};
    contributorHashes.add(contrib.memberHash);
    totalVolume += data.totalVolume || 0;
    totalTransactions += data.transactionCount || 0;

    if (data.categorySums) {
      Object.entries(data.categorySums).forEach(([cat, amount]) => {
        categoryTotals[cat] = (categoryTotals[cat] || 0) + amount;
      });
    }
  });

  // Round values
  Object.keys(categoryTotals).forEach(k => {
    categoryTotals[k] = Math.round(categoryTotals[k] * 100) / 100;
  });

  return {
    poolId,
    datasetId: generateId(),
    generatedAt: new Date().toISOString(),
    contributorCount: contributorHashes.size,
    totalRecordsAggregated: poolContributions.length,
    aggregates: {
      totalVolume: Math.round(totalVolume * 100) / 100,
      totalTransactions,
      categoryTotals,
      averageTransaction: totalTransactions > 0 ? Math.round((totalVolume / totalTransactions) * 100) / 100 : 0
    },
    privacyGuarantees: [
      'No individual transactions included',
      'No merchant names or exact timestamps',
      'No PII or identifiable data',
      'Member hashes are SHA-256 salted'
    ]
  };
}

function datasetToCsv(dataset) {
  const rows = [
    ['SOLVY Data Marketplace - Anonymized Dataset'],
    ['Dataset ID', dataset.datasetId],
    ['Generated At', dataset.generatedAt],
    ['Contributor Count', dataset.contributorCount],
    [''],
    ['Metric', 'Value'],
    ['Total Volume', dataset.aggregates.totalVolume],
    ['Total Transactions', dataset.aggregates.totalTransactions],
    ['Average Transaction', dataset.aggregates.averageTransaction],
    [''],
    ['Category', 'Total Spend']
  ];
  Object.entries(dataset.aggregates.categoryTotals).forEach(([cat, val]) => {
    rows.push([cat, val]);
  });
  return rows.map(r => r.join(',')).join('\n');
}

// ============================================================================
// ROUTE HANDLERS
// ============================================================================

/**
 * GET /api/marketplace/pools
 * List all available data pools
 */
function listPools(req, res) {
  const pools = Object.values(marketplaceData.pools).map(pool => {
    const contributions = marketplaceData.contributions[pool.id] || [];
    const uniqueContributors = new Set(contributions.map(c => c.memberHash)).size;
    return {
      ...pool,
      contributorCount: uniqueContributors,
      totalContributions: contributions.length,
      isActive: pool.status === 'active'
    };
  });
  res.json({ success: true, pools });
}

/**
 * POST /api/marketplace/pools
 * Create a new data pool (manager/admin)
 */
function createPool(req, res) {
  const { name, description, category, pricePerDownload, managerId } = req.body;

  if (!name || !description) {
    return res.status(400).json({ success: false, error: 'name and description required' });
  }

  const pool = {
    id: generateId(),
    name,
    description,
    category: category || 'general',
    pricePerDownload: pricePerDownload || 0,
    status: 'active',
    createdAt: new Date().toISOString(),
    createdBy: managerId || 'system'
  };

  marketplaceData.pools[pool.id] = pool;
  marketplaceData.contributions[pool.id] = [];
  saveData(marketplaceData);

  console.log('[Marketplace] Pool created:', pool.id, pool.name);
  res.status(201).json({ success: true, pool });
}

/**
 * POST /api/marketplace/contribute
 * Member submits anonymized aggregate data to a pool
 */
function contribute(req, res) {
  const { poolId, memberHash, data } = req.body;

  if (!poolId || !memberHash || !data) {
    return res.status(400).json({ success: false, error: 'poolId, memberHash, and data required' });
  }

  const pool = marketplaceData.pools[poolId];
  if (!pool) {
    return res.status(404).json({ success: false, error: 'Pool not found' });
  }

  if (pool.status !== 'active') {
    return res.status(400).json({ success: false, error: 'Pool is not active' });
  }

  // Deduplicate: one contribution per memberHash per pool per 30 days
  const contributions = marketplaceData.contributions[poolId] || [];
  const existing = contributions.find(c => c.memberHash === memberHash);
  if (existing) {
    // Update instead of reject
    existing.data = data;
    existing.updatedAt = new Date().toISOString();
  } else {
    contributions.push({
      id: generateId(),
      poolId,
      memberHash,
      data,
      contributedAt: new Date().toISOString()
    });
  }

  marketplaceData.contributions[poolId] = contributions;
  saveData(marketplaceData);

  console.log('[Marketplace] Contribution recorded for pool:', poolId, 'memberHash:', memberHash.slice(0, 8) + '...');
  res.json({ success: true, message: 'Contribution recorded', contributorCount: contributions.length });
}

/**
 * GET /api/marketplace/pools/:poolId/dataset
 * Get bundled dataset as JSON
 */
function getDatasetJson(req, res) {
  const { poolId } = req.params;
  const dataset = buildDataset(poolId);

  if (!dataset) {
    return res.status(404).json({ success: false, error: 'No contributions found for this pool' });
  }

  res.json({ success: true, dataset });
}

/**
 * GET /api/marketplace/pools/:poolId/dataset.csv
 * Download bundled dataset as CSV
 */
function downloadDatasetCsv(req, res) {
  const { poolId } = req.params;
  const dataset = buildDataset(poolId);

  if (!dataset) {
    return res.status(404).json({ success: false, error: 'No contributions found for this pool' });
  }

  const csv = datasetToCsv(dataset);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="solvy-dataset-${poolId}.csv"`);
  res.send(csv);
}

/**
 * POST /api/marketplace/pools/:poolId/sale
 * Record a dataset sale
 */
function recordSale(req, res) {
  const { poolId } = req.params;
  const { amount, buyerId, buyerType, notes } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, error: 'Valid sale amount required' });
  }

  const pool = marketplaceData.pools[poolId];
  if (!pool) {
    return res.status(404).json({ success: false, error: 'Pool not found' });
  }

  const split = splitRevenue(parseFloat(amount));
  const sale = {
    id: generateId(),
    poolId,
    amount: parseFloat(amount),
    buyerId: buyerId || 'anonymous',
    buyerType: buyerType || 'researcher',
    notes: notes || '',
    split,
    soldAt: new Date().toISOString()
  };

  marketplaceData.sales.push(sale);

  // Update summary
  marketplaceData.revenueSummary.totalRevenue += sale.amount;
  marketplaceData.revenueSummary.memberPool += split.memberPool;
  marketplaceData.revenueSummary.operations += split.operations;
  marketplaceData.revenueSummary.sovereignFund += split.sovereignFund;

  saveData(marketplaceData);

  console.log('[Marketplace] Sale recorded:', sale.id, 'Amount:', sale.amount, 'Pool:', poolId);
  res.json({ success: true, sale });
}

/**
 * GET /api/marketplace/revenue
 * Get overall marketplace revenue summary
 */
function getRevenue(req, res) {
  const { revenueSummary, sales } = marketplaceData;

  // Per-pool breakdown
  const poolRevenue = {};
  sales.forEach(sale => {
    if (!poolRevenue[sale.poolId]) {
      poolRevenue[sale.poolId] = { sales: 0, revenue: 0, memberPool: 0 };
    }
    poolRevenue[sale.poolId].sales += 1;
    poolRevenue[sale.poolId].revenue += sale.amount;
    poolRevenue[sale.poolId].memberPool += sale.split.memberPool;
  });

  res.json({
    success: true,
    summary: revenueSummary,
    totalSales: sales.length,
    poolBreakdown: poolRevenue,
    recentSales: sales.slice(-10).reverse()
  });
}

/**
 * GET /api/marketplace/member/:memberHash/earnings
 * Get a member's estimated earnings from data pool contributions
 */
function getMemberEarnings(req, res) {
  const { memberHash } = req.params;

  // Find all pools this member contributed to
  const memberPools = [];
  Object.entries(marketplaceData.contributions).forEach(([poolId, contributions]) => {
    const memberContribution = contributions.find(c => c.memberHash === memberHash);
    if (memberContribution) {
      const pool = marketplaceData.pools[poolId];
      const poolSales = marketplaceData.sales.filter(s => s.poolId === poolId);
      const totalPoolRevenue = poolSales.reduce((sum, s) => sum + s.split.memberPool, 0);
      const contributorCount = new Set(contributions.map(c => c.memberHash)).size;
      const estimatedShare = contributorCount > 0 ? totalPoolRevenue / contributorCount : 0;

      memberPools.push({
        poolId,
        poolName: pool ? pool.name : 'Unknown Pool',
        contributedAt: memberContribution.contributedAt,
        contributorCount,
        totalPoolSales: poolSales.length,
        totalPoolMemberPool: Math.round(totalPoolRevenue * 100) / 100,
        estimatedShare: Math.round(estimatedShare * 100) / 100
      });
    }
  });

  const totalEstimatedEarnings = memberPools.reduce((sum, p) => sum + p.estimatedShare, 0);

  res.json({
    success: true,
    memberHash: memberHash.slice(0, 16) + '...',
    poolsContributed: memberPools.length,
    totalEstimatedEarnings: Math.round(totalEstimatedEarnings * 100) / 100,
    pools: memberPools
  });
}

/**
 * GET /api/marketplace/pools/:poolId/status/:memberHash
 * Check if a member has contributed to a pool
 */
function getContributionStatus(req, res) {
  const { poolId, memberHash } = req.params;
  const contributions = marketplaceData.contributions[poolId] || [];
  const contribution = contributions.find(c => c.memberHash === memberHash);

  res.json({
    success: true,
    hasContributed: !!contribution,
    contributedAt: contribution ? contribution.contributedAt : null
  });
}

// Seed default pools if none exist
function seedDefaultPools() {
  if (Object.keys(marketplaceData.pools).length === 0) {
    const defaultPools = [
      {
        id: generateId(),
        name: 'Diaspora Spending Patterns',
        description: 'Anonymized aggregate spending data from SOLVY members to identify trends in diaspora communities. Used for academic research and financial product development.',
        category: 'research',
        pricePerDownload: 500,
        status: 'active',
        createdAt: new Date().toISOString(),
        createdBy: 'system'
      },
      {
        id: generateId(),
        name: 'Cooperative Merchant Insights',
        description: 'Category-level spending aggregates to help pilot partners (like Evergreen Beauty Lounge) understand member preferences and optimize offerings.',
        category: 'partners',
        pricePerDownload: 250,
        status: 'active',
        createdAt: new Date().toISOString(),
        createdBy: 'system'
      },
      {
        id: generateId(),
        name: 'AI Training Dataset: Financial Behavior',
        description: 'High-level behavioral aggregates for training AI models that serve underbanked communities. No personal identifiers. No individual transactions.',
        category: 'ai',
        pricePerDownload: 1000,
        status: 'active',
        createdAt: new Date().toISOString(),
        createdBy: 'system'
      }
    ];

    defaultPools.forEach(pool => {
      marketplaceData.pools[pool.id] = pool;
      marketplaceData.contributions[pool.id] = [];
    });

    saveData(marketplaceData);
    console.log('[Marketplace] Seeded', defaultPools.length, 'default pools');
  }
}

seedDefaultPools();

module.exports = {
  listPools,
  createPool,
  contribute,
  getDatasetJson,
  downloadDatasetCsv,
  recordSale,
  getRevenue,
  getMemberEarnings,
  getContributionStatus
};
