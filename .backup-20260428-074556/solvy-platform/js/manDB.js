/**
 * MAN Database — Mandatory Audit Network Local Storage
 * SOLVY Ecosystem™ — Local-first transaction & voting storage
 * 
 * Data Sovereignty Principle: Member transaction data never leaves device.
 * Only anonymized aggregates sync to central server (if opted in).
 * 
 * @version 1.0
 * @author SOLVY Technical Team
 */

class MANDatabase {
  constructor() {
    this.dbName = 'solvy_man';
    this.dbVersion = 1;
    this.db = null;
    this.isReady = false;
  }

  /**
   * Initialize the database
   * @returns {Promise<void>}
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('[MANDB] Failed to open database:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isReady = true;
        console.log('[MANDB] Database initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        console.log('[MANDB] Upgrading database to version', this.dbVersion);
        this._createStores(db);
      };
    });
  }

  /**
   * Create object stores (tables)
   * @param {IDBDatabase} db 
   */
  _createStores(db) {
    // Store 1: Transactions (member's personal transaction history)
    if (!db.objectStoreNames.contains('transactions')) {
      const txStore = db.createObjectStore('transactions', { keyPath: 'id' });
      txStore.createIndex('timestamp', 'timestamp', { unique: false });
      txStore.createIndex('merchant', 'merchant', { unique: false });
      txStore.createIndex('status', 'status', { unique: false });
      txStore.createIndex('syncStatus', 'syncStatus', { unique: false });
      console.log('[MANDB] Created transactions store');
    }

    // Store 2: Aggregated Metrics (local cache of pool balances)
    if (!db.objectStoreNames.contains('aggregated_metrics')) {
      const metricsStore = db.createObjectStore('aggregated_metrics', { keyPath: 'id' });
      console.log('[MANDB] Created aggregated_metrics store');
    }

    // Store 3: Proposals (active votes)
    if (!db.objectStoreNames.contains('proposals')) {
      const proposalStore = db.createObjectStore('proposals', { keyPath: 'id' });
      proposalStore.createIndex('status', 'status', { unique: false });
      proposalStore.createIndex('vote_end', 'vote_end', { unique: false });
      console.log('[MANDB] Created proposals store');
    }

    // Store 4: Member Votes (anonymous voting record)
    if (!db.objectStoreNames.contains('member_votes')) {
      const votesStore = db.createObjectStore('member_votes', { 
        keyPath: 'id', 
        autoIncrement: true 
      });
      votesStore.createIndex('proposal_id', 'proposal_id', { unique: false });
      votesStore.createIndex('member_hash', 'member_hash', { unique: false });
      console.log('[MANDB] Created member_votes store');
    }

    // Store 5: Notifications
    if (!db.objectStoreNames.contains('notifications')) {
      const notifStore = db.createObjectStore('notifications', { 
        keyPath: 'id', 
        autoIncrement: true 
      });
      notifStore.createIndex('type', 'type', { unique: false });
      notifStore.createIndex('read', 'read', { unique: false });
      notifStore.createIndex('timestamp', 'timestamp', { unique: false });
      console.log('[MANDB] Created notifications store');
    }

    // Store 6: Audit Log (immutable local record)
    if (!db.objectStoreNames.contains('audit_log')) {
      const auditStore = db.createObjectStore('audit_log', { 
        keyPath: 'id', 
        autoIncrement: true 
      });
      auditStore.createIndex('timestamp', 'timestamp', { unique: false });
      auditStore.createIndex('action', 'action', { unique: false });
      console.log('[MANDB] Created audit_log store');
    }
  }

  // ============================================================================
  // TRANSACTION METHODS
  // ============================================================================

  /**
   * Add a new transaction
   * @param {Object} transaction 
   * @returns {Promise<string>} transaction ID
   */
  async addTransaction(transaction) {
    const tx = {
      id: transaction.id || this._generateUUID(),
      timestamp: transaction.timestamp || Date.now(),
      amount: transaction.amount,
      merchant: transaction.merchant,
      card_last4: transaction.card_last4 || null,
      status: transaction.status || 'pending',
      syncStatus: 'pending_sync',
      metadata: transaction.metadata || {}
    };

    await this._add('transactions', tx);
    
    // Log to audit trail
    await this._addAuditEntry('transaction_added', tx.amount, tx.id);
    
    return tx.id;
  }

  /**
   * Get transactions with optional filtering
   * @param {Object} filters 
   * @returns {Promise<Array>}
   */
  async getTransactions(filters = {}) {
    const allTransactions = await this._getAll('transactions');
    
    return allTransactions.filter(tx => {
      if (filters.startDate && tx.timestamp < filters.startDate) return false;
      if (filters.endDate && tx.timestamp > filters.endDate) return false;
      if (filters.merchant && !tx.merchant.includes(filters.merchant)) return false;
      if (filters.status && tx.status !== filters.status) return false;
      if (filters.minAmount && tx.amount < filters.minAmount) return false;
      if (filters.maxAmount && tx.amount > filters.maxAmount) return false;
      return true;
    }).sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Update transaction status
   * @param {string} id 
   * @param {string} status 
   * @returns {Promise<void>}
   */
  async updateTransactionStatus(id, status) {
    const tx = await this._get('transactions', id);
    if (tx) {
      tx.status = status;
      tx.updatedAt = Date.now();
      await this._put('transactions', tx);
      await this._addAuditEntry('transaction_status_update', 0, id);
    }
  }

  /**
   * Get total transaction volume
   * @returns {Promise<number>}
   */
  async getTotalVolume() {
    const transactions = await this._getAll('transactions');
    return transactions
      .filter(tx => tx.status === 'settled')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }

  // ============================================================================
  // METRICS & POOL CALCULATIONS (70/20/10)
  // ============================================================================

  /**
   * Update aggregated metrics with new transaction
   * Calculates 70/20/10 split automatically
   * @param {number} transactionAmount 
   * @returns {Promise<Object>}
   */
  async processTransactionMetrics(transactionAmount) {
    // Assume 1.2% interchange rate (industry standard)
    const interchangeRate = 0.012;
    const interchangeRevenue = transactionAmount * interchangeRate;
    
    // 70/20/10 split
    const memberPool = interchangeRevenue * 0.70;
    const operationsPool = interchangeRevenue * 0.20;
    const sovereignFund = interchangeRevenue * 0.10;

    const currentMetrics = await this.getMetrics();
    
    const updatedMetrics = {
      id: 'current_metrics',
      total_volume: (currentMetrics.total_volume || 0) + transactionAmount,
      total_interchange: (currentMetrics.total_interchange || 0) + interchangeRevenue,
      total_member_pool: (currentMetrics.total_member_pool || 0) + memberPool,
      total_operations_pool: (currentMetrics.total_operations_pool || 0) + operationsPool,
      total_sovereign_pool: (currentMetrics.total_sovereign_pool || 0) + sovereignFund,
      transaction_count: (currentMetrics.transaction_count || 0) + 1,
      last_updated: Date.now()
    };

    await this._put('aggregated_metrics', updatedMetrics);
    
    // Log pool allocation to audit
    await this._addAuditEntry('pool_allocation', memberPool, 'member_70_percent');
    await this._addAuditEntry('pool_allocation', operationsPool, 'operations_20_percent');
    await this._addAuditEntry('pool_allocation', sovereignFund, 'sovereign_10_percent');

    return updatedMetrics;
  }

  /**
   * Get current metrics
   * @returns {Promise<Object>}
   */
  async getMetrics() {
    try {
      return await this._get('aggregated_metrics', 'current_metrics') || {
        id: 'current_metrics',
        total_volume: 0,
        total_interchange: 0,
        total_member_pool: 0,
        total_operations_pool: 0,
        total_sovereign_pool: 0,
        transaction_count: 0,
        last_updated: Date.now()
      };
    } catch (e) {
      return {
        id: 'current_metrics',
        total_volume: 0,
        total_interchange: 0,
        total_member_pool: 0,
        total_operations_pool: 0,
        total_sovereign_pool: 0,
        transaction_count: 0,
        last_updated: Date.now()
      };
    }
  }

  /**
   * Check if volume threshold reached for proposal
   * @param {number} thresholdAmount 
   * @returns {Promise<boolean>}
   */
  async checkThreshold(thresholdAmount) {
    const metrics = await this.getMetrics();
    return metrics.total_volume >= thresholdAmount;
  }

  // ============================================================================
  // PROPOSAL & VOTING METHODS
  // ============================================================================

  /**
   * Create a new proposal
   * @param {Object} proposal 
   * @returns {Promise<string>}
   */
  async createProposal(proposal) {
    const prop = {
      id: proposal.id || this._generateUUID(),
      title: proposal.title,
      description: proposal.description,
      threshold_type: proposal.threshold_type || 'volume', // 'volume' or 'member_count'
      threshold_value: proposal.threshold_value,
      vote_start: proposal.vote_start || Date.now(),
      vote_end: proposal.vote_end,
      status: 'pending', // pending, active, passed, failed
      options: proposal.options || ['Yes', 'No'],
      created_at: Date.now()
    };

    await this._add('proposals', prop);
    await this._addAuditEntry('proposal_created', 0, prop.id);
    
    return prop.id;
  }

  /**
   * Get all proposals
   * @param {string} statusFilter 
   * @returns {Promise<Array>}
   */
  async getProposals(statusFilter = null) {
    let proposals = await this._getAll('proposals');
    if (statusFilter) {
      proposals = proposals.filter(p => p.status === statusFilter);
    }
    return proposals.sort((a, b) => b.created_at - a.created_at);
  }

  /**
   * Cast a vote
   * @param {string} proposalId 
   * @param {string} memberHash (hashed member ID for privacy)
   * @param {string} voteOption 
   * @returns {Promise<boolean>}
   */
  async castVote(proposalId, memberHash, voteOption) {
    // Check if already voted
    const existingVotes = await this._getAll('member_votes');
    const alreadyVoted = existingVotes.some(
      v => v.proposal_id === proposalId && v.member_hash === memberHash
    );
    
    if (alreadyVoted) {
      throw new Error('Member has already voted on this proposal');
    }

    const vote = {
      proposal_id: proposalId,
      member_hash: memberHash,
      vote: voteOption,
      timestamp: Date.now()
    };

    await this._add('member_votes', vote);
    await this._addAuditEntry('vote_cast', 0, `${proposalId}:${memberHash}`);
    
    return true;
  }

  /**
   * Get vote counts for a proposal
   * @param {string} proposalId 
   * @returns {Promise<Object>}
   */
  async getVoteCounts(proposalId) {
    const votes = await this._getAll('member_votes');
    const proposalVotes = votes.filter(v => v.proposal_id === proposalId);
    
    const counts = {};
    proposalVotes.forEach(v => {
      counts[v.vote] = (counts[v.vote] || 0) + 1;
    });
    
    return {
      total: proposalVotes.length,
      counts: counts,
      votes: proposalVotes
    };
  }

  // ============================================================================
  // AUDIT LOG METHODS
  // ============================================================================

  /**
   * Add entry to audit log
   * @param {string} action 
   * @param {number} amount 
   * @param {string} referenceId 
   */
  async _addAuditEntry(action, amount = 0, referenceId = '') {
    const entry = {
      timestamp: Date.now(),
      action: action,
      amount: amount,
      reference_id: referenceId,
      hash: this._generateEntryHash(action, amount, referenceId)
    };
    
    await this._add('audit_log', entry);
  }

  /**
   * Get audit log entries
   * @param {Object} filters 
   * @returns {Promise<Array>}
   */
  async getAuditLog(filters = {}) {
    let entries = await this._getAll('audit_log');
    
    if (filters.action) {
      entries = entries.filter(e => e.action === filters.action);
    }
    if (filters.startDate) {
      entries = entries.filter(e => e.timestamp >= filters.startDate);
    }
    if (filters.endDate) {
      entries = entries.filter(e => e.timestamp <= filters.endDate);
    }
    
    return entries.sort((a, b) => b.timestamp - a.timestamp);
  }

  // ============================================================================
  // NOTIFICATION METHODS
  // ============================================================================

  /**
   * Add notification
   * @param {string} type 
   * @param {string} message 
   */
  async addNotification(type, message) {
    const notification = {
      type: type,
      message: message,
      read: false,
      timestamp: Date.now()
    };
    
    await this._add('notifications', notification);
  }

  /**
   * Get unread notifications
   * @returns {Promise<Array>}
   */
  async getUnreadNotifications() {
    const all = await this._getAll('notifications');
    return all.filter(n => !n.read).sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Mark notification as read
   * @param {number} id 
   */
  async markNotificationRead(id) {
    const notif = await this._get('notifications', id);
    if (notif) {
      notif.read = true;
      await this._put('notifications', notif);
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  _generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  _generateEntryHash(action, amount, referenceId) {
    // Simple hash for audit integrity
    const data = `${action}:${amount}:${referenceId}:${Date.now()}`;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).substring(0, 8);
  }

  // Generic IndexedDB operations
  _add(storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  _put(storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  _get(storeName, id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  _getAll(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  _delete(storeName, id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

// ============================================================================
// EXPORT & INITIALIZATION
// ============================================================================

// Create global instance
const manDB = new MANDatabase();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await manDB.init();
    console.log('[MANDB] Ready for SOLVY operations');
    
    // Dispatch event for other scripts to listen
    window.dispatchEvent(new CustomEvent('MANDBReady', { detail: manDB }));
  } catch (error) {
    console.error('[MANDB] Initialization failed:', error);
  }
});

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MANDatabase, manDB };
}
