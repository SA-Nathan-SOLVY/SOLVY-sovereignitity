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
db.version(1).stores({
  // Transaction store - all transaction history stored locally
  transactions: `
    ++id,
    date,
    amount,
    merchant,
    category,
    status,
    cardId,
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
 * Clear all local data (for logout/data reset)
 */
async function clearAllLocalData() {
  await db.transactions.clear();
  await db.spending_patterns.clear();
  await db.card_activity.clear();
  await db.dataPoolContributions.clear();
  await db.votes.clear();
  await db.syncQueue.clear();
}

/**
 * Export all data for user download
 * @returns {Promise<Object>} - Complete data export
 */
async function exportAllData() {
  return {
    exportDate: new Date().toISOString(),
    version: '1.0',
    transactions: await db.transactions.toArray(),
    spending_patterns: await db.spending_patterns.toArray(),
    card_activity: await db.card_activity.toArray(),
    dataPoolContributions: await db.dataPoolContributions.toArray(),
    votes: await db.votes.toArray()
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
    activityCount
  ] = await Promise.all([
    db.transactions.count(),
    db.transactions.where('pendingSync').equals(1).count(),
    db.spending_patterns.count(),
    db.card_activity.count()
  ]);
  
  return {
    transactionCount,
    pendingSyncCount,
    categoryCount,
    activityCount,
    storageUsed: 'calculated-on-demand'
  };
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
  logCardActivity,
  queueForSync,
  markTransactionSynced,
  getPendingTransactions,
  clearAllLocalData,
  exportAllData,
  importData,
  getDatabaseStats,
  syncAggregatedMetrics
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    db,
    addTransaction,
    getTransactionsByDateRange,
    getTransactionsByCategory,
    getSpendingByCategory,
    logCardActivity,
    queueForSync,
    markTransactionSynced,
    getPendingTransactions,
    clearAllLocalData,
    exportAllData,
    importData,
    getDatabaseStats,
    syncAggregatedMetrics,
    OfflineSyncManager
  };
}
