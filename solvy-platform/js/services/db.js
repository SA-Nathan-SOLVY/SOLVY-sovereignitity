/**
 * SOLVY PWA - IndexedDB Database Layer
 * Phase 2: Local-First Storage
 * 
 * Uses Dexie.js for IndexedDB management
 * Stores transaction data locally - never sends individual transactions to server
 */

// Initialize Dexie database
const db = new Dexie('solvy_local_db');

// Database schema definition
db.version(2).stores({
  // Transaction store - all transaction history stored locally
  transactions: `
    ++id,
    date,
    amount,
    merchant,
    category,
    status,
    cardId,
    vendorId,
    vendorName,
    *tags,
    pendingSync
  `,
  
  // Spending patterns - aggregated by category for quick lookup
  spending_patterns: `
    category,
    total_amount,
    count,
    lastUpdated
  `,
  
  // Card activity log
  card_activity: `
    ++id,
    timestamp,
    type,
    status,
    description
  `,
  
  // Data pool contributions - track what user has contributed
  dataPoolContributions: `
    proposalId,
    contributedAt,
    expiresAt
  `,
  
  // Cached proposals for offline access
  proposals: `
    id,
    status,
    voteStart,
    voteEnd,
    [status+voteEnd]
  `,
  
  // Local vote records
  votes: `
    proposalId,
    choice,
    votedAt
  `,
  
  // Offline sync queue
  syncQueue: `
    ++id,
    type,
    payload,
    createdAt,
    retryCount
  `,
  
  // Budget definitions - spending limits per category
  budgets: `
    ++id,
    category,
    limitAmount,
    period,
    alertThreshold,
    createdAt,
    updatedAt
  `,
  
  // Income entries - track all income sources
  income_entries: `
    ++id,
    date,
    amount,
    source,
    category,
    recurring,
    frequency,
    notes,
    createdAt
  `,
  
  // Budget periods - track monthly/weekly budget performance
  budget_periods: `
    ++id,
    startDate,
    endDate,
    period,
    totalIncome,
    totalExpenses,
    totalBudgeted,
    status,
    createdAt
  `,
  
  // Savings goals - member-defined financial goals
  savings_goals: `
    ++id,
    name,
    targetAmount,
    currentAmount,
    deadline,
    category,
    autoAllocate,
    allocationPercent,
    status,
    createdAt,
    updatedAt
  `,
  
  // Budget alerts - notifications for budget thresholds
  budget_alerts: `
    ++id,
    budgetId,
    type,
    message,
    threshold,
    triggeredAt,
    acknowledged
  `
});

// ============================================================================
// DATABASE METHODS
// ============================================================================

/**
 * Add a new transaction to local storage
 * @param {Object} transaction - Transaction data
 * @returns {Promise<string>} - Transaction ID
 */
async function addTransaction(transaction) {
  const tx = {
    ...transaction,
    date: transaction.date || new Date().toISOString(),
    pendingSync: !navigator.onLine, // Queue for sync if offline
    createdAt: new Date().toISOString()
  };
  
  const id = await db.transactions.add(tx);
  
  // Update spending patterns
  await updateSpendingPattern(transaction.category, transaction.amount);
  
  // Log activity
  await logCardActivity('transaction', 'completed', `Transaction at ${transaction.merchant}`);
  
  return id;
}

/**
 * Get transactions by date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Array>} - Transactions
 */
async function getTransactionsByDateRange(startDate, endDate) {
  return await db.transactions
    .where('date')
    .between(startDate.toISOString(), endDate.toISOString())
    .toArray();
}

/**
 * Get transactions by category
 * @param {string} category - Category name
 * @returns {Promise<Array>} - Transactions
 */
async function getTransactionsByCategory(category) {
  return await db.transactions
    .where('category')
    .equals(category)
    .toArray();
}

/**
 * Get spending by category (aggregated)
 * @returns {Promise<Object>} - Category totals
 */
async function getSpendingByCategory() {
  const patterns = await db.spending_patterns.toArray();
  return patterns.reduce((acc, p) => {
    acc[p.category] = p.total_amount;
    return acc;
  }, {});
}

/**
 * Update spending pattern for a category
 * @param {string} category - Category name
 * @param {number} amount - Amount to add
 */
async function updateSpendingPattern(category, amount) {
  const existing = await db.spending_patterns.get(category);
  
  if (existing) {
    await db.spending_patterns.update(category, {
      total_amount: existing.total_amount + amount,
      count: existing.count + 1,
      lastUpdated: new Date().toISOString()
    });
  } else {
    await db.spending_patterns.put({
      category,
      total_amount: amount,
      count: 1,
      lastUpdated: new Date().toISOString()
    });
  }
}

/**
 * Log card activity
 * @param {string} type - Activity type
 * @param {string} status - Status
 * @param {string} description - Description
 */
async function logCardActivity(type, status, description) {
  await db.card_activity.add({
    timestamp: new Date().toISOString(),
    type,
    status,
    description
  });
}

/**
 * Queue item for offline sync
 * @param {string} type - Sync type
 * @param {Object} payload - Data to sync
 */
async function queueForSync(type, payload) {
  await db.syncQueue.add({
    type,
    payload,
    createdAt: new Date().toISOString(),
    retryCount: 0
  });
}

/**
 * Get pending sync items
 * @returns {Promise<Array>} - Pending items
 */
async function getPendingSyncItems() {
  return await db.syncQueue.toArray();
}

/**
 * Remove synced item from queue
 * @param {number} id - Queue item ID
 */
async function removeSyncedItem(id) {
  await db.syncQueue.delete(id);
}

/**
 * Update transaction category
 * @param {number} id - Transaction ID
 * @param {string} newCategory - New category
 * @returns {Promise<boolean>} - Success status
 */
async function updateTransactionCategory(id, newCategory) {
  const tx = await db.transactions.get(id);
  if (!tx) {
    console.error('[DB] Transaction not found:', id);
    return false;
  }

  const oldCategory = tx.category || 'uncategorized';
  const amount = parseFloat(tx.amount) || 0;

  // Update the transaction
  await db.transactions.update(id, { category: newCategory });

  // Adjust spending patterns: subtract from old category
  const oldPattern = await db.spending_patterns.get(oldCategory);
  if (oldPattern) {
    const newAmount = Math.max(0, oldPattern.total_amount - amount);
    const newCount = Math.max(0, oldPattern.count - 1);
    if (newAmount <= 0) {
      await db.spending_patterns.delete(oldCategory);
    } else {
      await db.spending_patterns.update(oldCategory, {
        total_amount: newAmount,
        count: newCount,
        lastUpdated: new Date().toISOString()
      });
    }
  }

  // Add to new category
  await updateSpendingPattern(newCategory, amount);

  console.log('[DB] Category updated:', id, oldCategory, '->', newCategory);
  return true;
}

/**
 * Mark transaction as synced
 * @param {number} id - Transaction ID
 */
async function markTransactionSynced(id) {
  await db.transactions.update(id, { pendingSync: false });
}

/**
 * Get pending transactions (for offline sync)
 * @returns {Promise<Array>} - Pending transactions
 */
async function getPendingTransactions() {
  return await db.transactions
    .where('pendingSync')
    .equals(1)
    .toArray();
}

/**
 * Check if a vendor transaction already exists
 * @param {string} vendorId - Vendor transaction ID
 * @returns {Promise<boolean>} - True if exists
 */
async function transactionExists(vendorId) {
  if (!vendorId) return false;
  const count = await db.transactions
    .where('vendorId')
    .equals(vendorId)
    .count();
  return count > 0;
}

/**
 * Get transaction by vendor ID
 * @param {string} vendorId - Vendor transaction ID
 * @returns {Promise<Object|null>} - Transaction or null
 */
async function getTransactionByVendorId(vendorId) {
  return await db.transactions
    .where('vendorId')
    .equals(vendorId)
    .first();
}

/**
 * Add or update a vendor transaction (idempotent)
 * @param {Object} transaction - Transaction data with vendorId
 * @returns {Promise<Object>} - { id, created: boolean }
 */
async function upsertVendorTransaction(transaction) {
  const existing = await getTransactionByVendorId(transaction.vendorId);
  
  if (existing) {
    // Update existing transaction
    await db.transactions.update(existing.id, {
      ...transaction,
      updatedAt: new Date().toISOString()
    });
    return { id: existing.id, created: false };
  }
  
  // Add new transaction
  const id = await addTransaction(transaction);
  return { id, created: true };
}

/**
 * Clear all local data (for logout/data reset)
 */
async function clearAllLocalData() {
  await db.transactions.clear();
  await db.spending_patterns.clear();
  await db.card_activity.clear();
  await db.dataPoolContributions.clear();
  await db.votes.clear();
  await db.syncQueue.clear();
  await db.budgets.clear();
  await db.income_entries.clear();
  await db.budget_periods.clear();
  await db.savings_goals.clear();
  await db.budget_alerts.clear();
}

/**
 * Export all data for user download
 * @returns {Promise<Object>} - Complete data export
 */
async function exportAllData() {
  return {
    exportDate: new Date().toISOString(),
    version: '2.0',
    transactions: await db.transactions.toArray(),
    spending_patterns: await db.spending_patterns.toArray(),
    card_activity: await db.card_activity.toArray(),
    dataPoolContributions: await db.dataPoolContributions.toArray(),
    votes: await db.votes.toArray(),
    budgets: await db.budgets.toArray(),
    income_entries: await db.income_entries.toArray(),
    budget_periods: await db.budget_periods.toArray(),
    savings_goals: await db.savings_goals.toArray(),
    budget_alerts: await db.budget_alerts.toArray()
  };
}

/**
 * Import data from JSON (for migration)
 * @param {Object} data - Data to import
 */
async function importData(data) {
  if (data.transactions) {
    await db.transactions.bulkAdd(data.transactions);
  }
  if (data.spending_patterns) {
    await db.spending_patterns.bulkAdd(data.spending_patterns);
  }
  if (data.card_activity) {
    await db.card_activity.bulkAdd(data.card_activity);
  }
  if (data.budgets) {
    await db.budgets.bulkAdd(data.budgets);
  }
  if (data.income_entries) {
    await db.income_entries.bulkAdd(data.income_entries);
  }
  if (data.budget_periods) {
    await db.budget_periods.bulkAdd(data.budget_periods);
  }
  if (data.savings_goals) {
    await db.savings_goals.bulkAdd(data.savings_goals);
  }
}

/**
 * Get database statistics
 * @returns {Promise<Object>} - Stats
 */
async function getDatabaseStats() {
  const [
    transactionCount,
    pendingSyncCount,
    categoryCount,
    activityCount,
    budgetCount,
    incomeCount,
    goalsCount
  ] = await Promise.all([
    db.transactions.count(),
    db.transactions.where('pendingSync').equals(1).count(),
    db.spending_patterns.count(),
    db.card_activity.count(),
    db.budgets.count(),
    db.income_entries.count(),
    db.savings_goals.count()
  ]);
  
  return {
    transactionCount,
    pendingSyncCount,
    categoryCount,
    activityCount,
    budgetCount,
    incomeCount,
    goalsCount,
    storageUsed: 'calculated-on-demand'
  };
}

// ============================================================================
// BUDGET MANAGEMENT METHODS
// ============================================================================

/**
 * Create or update a budget category limit
 * @param {Object} budget - Budget data
 * @returns {Promise<number>} - Budget ID
 */
async function setBudget(budget) {
  const data = {
    ...budget,
    period: budget.period || 'monthly',
    alertThreshold: budget.alertThreshold || 0.8,
    updatedAt: new Date().toISOString(),
    createdAt: budget.createdAt || new Date().toISOString()
  };
  
  if (budget.id) {
    await db.budgets.update(budget.id, data);
    return budget.id;
  }
  return await db.budgets.add(data);
}

/**
 * Get all budgets
 * @returns {Promise<Array>} - Budgets
 */
async function getBudgets() {
  return await db.budgets.toArray();
}

/**
 * Get budget for a specific category
 * @param {string} category - Category name
 * @returns {Promise<Object|null>} - Budget or null
 */
async function getBudgetByCategory(category) {
  return await db.budgets.where('category').equals(category).first();
}

/**
 * Delete a budget
 * @param {number} id - Budget ID
 */
async function deleteBudget(id) {
  await db.budgets.delete(id);
  await db.budget_alerts.where('budgetId').equals(id).delete();
}

/**
 * Add an income entry
 * @param {Object} income - Income data
 * @returns {Promise<number>} - Income ID
 */
async function addIncome(income) {
  const data = {
    ...income,
    date: income.date || new Date().toISOString(),
    createdAt: new Date().toISOString()
  };
  return await db.income_entries.add(data);
}

/**
 * Get income entries by date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Array>} - Income entries
 */
async function getIncomeByDateRange(startDate, endDate) {
  return await db.income_entries
    .where('date')
    .between(startDate.toISOString(), endDate.toISOString())
    .toArray();
}

/**
 * Get total income for a date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<number>} - Total income
 */
async function getTotalIncome(startDate, endDate) {
  const entries = await getIncomeByDateRange(startDate, endDate);
  return entries.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
}

/**
 * Create or update a savings goal
 * @param {Object} goal - Goal data
 * @returns {Promise<number>} - Goal ID
 */
async function setSavingsGoal(goal) {
  const data = {
    ...goal,
    currentAmount: goal.currentAmount || 0,
    status: goal.status || 'active',
    updatedAt: new Date().toISOString(),
    createdAt: goal.createdAt || new Date().toISOString()
  };
  
  if (goal.id) {
    await db.savings_goals.update(goal.id, data);
    return goal.id;
  }
  return await db.savings_goals.add(data);
}

/**
 * Get all savings goals
 * @returns {Promise<Array>} - Goals
 */
async function getSavingsGoals() {
  return await db.savings_goals.toArray();
}

/**
 * Add funds to a savings goal
 * @param {number} id - Goal ID
 * @param {number} amount - Amount to add
 */
async function contributeToSavingsGoal(id, amount) {
  const goal = await db.savings_goals.get(id);
  if (!goal) return false;
  
  const newAmount = (parseFloat(goal.currentAmount) || 0) + amount;
  const status = newAmount >= goal.targetAmount ? 'completed' : goal.status;
  
  await db.savings_goals.update(id, {
    currentAmount: newAmount,
    status,
    updatedAt: new Date().toISOString()
  });
  return true;
}

/**
 * Create a budget period record
 * @param {Object} period - Period data
 * @returns {Promise<number>} - Period ID
 */
async function createBudgetPeriod(period) {
  const data = {
    ...period,
    status: period.status || 'active',
    createdAt: new Date().toISOString()
  };
  return await db.budget_periods.add(data);
}

/**
 * Get budget periods
 * @returns {Promise<Array>} - Budget periods
 */
async function getBudgetPeriods() {
  return await db.budget_periods.toArray();
}

/**
 * Add a budget alert
 * @param {Object} alert - Alert data
 * @returns {Promise<number>} - Alert ID
 */
async function addBudgetAlert(alert) {
  return await db.budget_alerts.add({
    ...alert,
    triggeredAt: new Date().toISOString(),
    acknowledged: false
  });
}

/**
 * Get unacknowledged budget alerts
 * @returns {Promise<Array>} - Alerts
 */
async function getBudgetAlerts() {
  return await db.budget_alerts
    .where('acknowledged')
    .equals(0)
    .toArray();
}

/**
 * Acknowledge a budget alert
 * @param {number} id - Alert ID
 */
async function acknowledgeBudgetAlert(id) {
  await db.budget_alerts.update(id, { acknowledged: true });
}

/**
 * Get budget vs actual spending for a date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Array>} - Budget performance by category
 */
async function getBudgetVsActual(startDate, endDate) {
  const budgets = await getBudgets();
  const transactions = await getTransactionsByDateRange(startDate, endDate);
  
  // Group transactions by category
  const actualByCategory = transactions.reduce((acc, t) => {
    const cat = t.category || 'uncategorized';
    acc[cat] = (acc[cat] || 0) + (parseFloat(t.amount) || 0);
    return acc;
  }, {});
  
  // Build comparison
  const allCategories = new Set([
    ...budgets.map(b => b.category),
    ...Object.keys(actualByCategory)
  ]);
  
  return Array.from(allCategories).map(category => {
    const budget = budgets.find(b => b.category === category);
    const actual = actualByCategory[category] || 0;
    const limit = budget ? budget.limitAmount : 0;
    
    return {
      category,
      budgeted: limit,
      actual: Math.round(actual * 100) / 100,
      remaining: Math.round((limit - actual) * 100) / 100,
      percentUsed: limit > 0 ? Math.round((actual / limit) * 100) : 0,
      alertThreshold: budget ? budget.alertThreshold : 0.8,
      overBudget: actual > limit && limit > 0
    };
  });
}

// ============================================================================
// SYNC AGGREGATED METRICS TO CENTRAL API
// ============================================================================

/**
 * Compute and sync aggregated metrics to central API
 * Only sends aggregates - never individual transactions
 * @returns {Promise<Object>} - Sync result
 */
async function syncAggregatedMetrics() {
  // Calculate aggregates locally
  const transactions = await db.transactions.toArray();
  
  const totalVolume = transactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  const transactionCount = transactions.length;
  
  const categorySums = transactions.reduce((acc, t) => {
    const category = t.category || 'uncategorized';
    acc[category] = (acc[category] || 0) + (parseFloat(t.amount) || 0);
    return acc;
  }, {});
  
  // Generate member hash (would come from auth in production)
  const memberHash = await generateMemberHash();
  
  const metrics = {
    totalVolume: Math.round(totalVolume * 100) / 100,
    transactionCount,
    categorySums,
    memberHash,
    timestamp: new Date().toISOString()
  };
  
  try {
    const response = await fetch('/api/metrics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-SOLVY-Client': 'PWA-v1.0'
      },
      body: JSON.stringify(metrics)
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const result = await response.json();
    
    // Store last sync timestamp
    localStorage.setItem('solvy_last_metrics_sync', new Date().toISOString());
    
    return {
      success: true,
      data: result,
      metricsSent: metrics
    };
    
  } catch (error) {
    console.error('Failed to sync metrics:', error);
    
    // Queue for retry
    await queueForSync('metrics', metrics);
    
    return {
      success: false,
      error: error.message,
      queued: true
    };
  }
}

/**
 * Generate SHA-256 hash of member ID
 * @returns {Promise<string>} - Member hash
 */
async function generateMemberHash() {
  const memberId = localStorage.getItem('solvy_member_id') || 'anonymous';
  const encoder = new TextEncoder();
  const data = encoder.encode(memberId + 'solvy_salt_2025');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ============================================================================
// OFFLINE SYNC MANAGER
// ============================================================================

const OfflineSyncManager = {
  isOnline: navigator.onLine,
  syncInterval: null,
  
  init() {
    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
    
    // Start periodic sync if online
    if (this.isOnline) {
      this.startPeriodicSync();
    }
  },
  
  handleOnline() {
    this.isOnline = true;
    console.log('[Sync] Connection restored - starting sync...');
    this.syncPendingItems();
    this.startPeriodicSync();
  },
  
  handleOffline() {
    this.isOnline = false;
    console.log('[Sync] Connection lost - entering offline mode');
    this.stopPeriodicSync();
  },
  
  startPeriodicSync() {
    // Sync every 5 minutes
    this.syncInterval = setInterval(() => {
      this.syncPendingItems();
    }, 5 * 60 * 1000);
  },
  
  stopPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  },
  
  async syncPendingItems() {
    const pendingItems = await getPendingSyncItems();
    
    if (pendingItems.length === 0) return;
    
    console.log(`[Sync] Processing ${pendingItems.length} pending items...`);
    
    for (const item of pendingItems) {
      try {
        switch (item.type) {
          case 'metrics':
            await syncAggregatedMetrics();
            break;
          case 'transaction':
            // Would sync individual transaction to payment processor
            console.log('[Sync] Syncing transaction:', item.payload);
            break;
          default:
            console.warn('[Sync] Unknown sync type:', item.type);
        }
        
        // Remove from queue on success
        await removeSyncedItem(item.id);
        
      } catch (error) {
        console.error('[Sync] Failed to sync item:', item.id, error);
        
        // Increment retry count
        await db.syncQueue.update(item.id, {
          retryCount: item.retryCount + 1
        });
      }
    }
  }
};

// Initialize offline sync
OfflineSyncManager.init();

// ============================================================================
// EXPORTS
// ============================================================================

// Make available globally
window.solvyDB = {
  db,
  addTransaction,
  getTransactionsByDateRange,
  getTransactionsByCategory,
  getSpendingByCategory,
  updateTransactionCategory,
  logCardActivity,
  queueForSync,
  markTransactionSynced,
  getPendingTransactions,
  transactionExists,
  getTransactionByVendorId,
  upsertVendorTransaction,
  clearAllLocalData,
  exportAllData,
  importData,
  getDatabaseStats,
  syncAggregatedMetrics,
  // Budget management
  setBudget,
  getBudgets,
  getBudgetByCategory,
  deleteBudget,
  addIncome,
  getIncomeByDateRange,
  getTotalIncome,
  setSavingsGoal,
  getSavingsGoals,
  contributeToSavingsGoal,
  createBudgetPeriod,
  getBudgetPeriods,
  addBudgetAlert,
  getBudgetAlerts,
  acknowledgeBudgetAlert,
  getBudgetVsActual
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    db,
    addTransaction,
    getTransactionsByDateRange,
    getTransactionsByCategory,
    getSpendingByCategory,
    updateTransactionCategory,
    logCardActivity,
    queueForSync,
    markTransactionSynced,
    getPendingTransactions,
    transactionExists,
    getTransactionByVendorId,
    upsertVendorTransaction,
    clearAllLocalData,
    exportAllData,
    importData,
    getDatabaseStats,
    syncAggregatedMetrics,
    OfflineSyncManager,
    // Budget management
    setBudget,
    getBudgets,
    getBudgetByCategory,
    deleteBudget,
    addIncome,
    getIncomeByDateRange,
    getTotalIncome,
    setSavingsGoal,
    getSavingsGoals,
    contributeToSavingsGoal,
    createBudgetPeriod,
    getBudgetPeriods,
    addBudgetAlert,
    getBudgetAlerts,
    acknowledgeBudgetAlert,
    getBudgetVsActual
  };
}
