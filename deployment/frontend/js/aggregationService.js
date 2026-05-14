/**
 * SOLVY Ecosystem™ — Aggregation Service
 * Data Sovereignty Loop: Member data stays local. Only anonymized aggregates leave the device.
 *
 * This service runs entirely in the member's browser. It:
 * 1. Reads transactions from local IndexedDB (manDB.js)
 * 2. Computes anonymized, aggregated totals
 * 3. Sends ONLY aggregates to the central server
 * 4. Marks local transactions as synced on success
 * 5. Retries automatically on failure — never loses data
 *
 * @version 1.0
 * @author SOLVY Technical Team
 */

const AggregationService = {
  // Configuration
  config: {
    API_ENDPOINT: (typeof SOLVY_API_URL !== 'undefined' && SOLVY_API_URL) || '/api/metrics',
    INTERCHANGE_RATE: 0.015, // 1.5% industry average
    MEMBER_POOL_SHARE: 0.70, // 70% of interchange to members
    SYNC_TIMEOUT_MS: 5000,
    DEBUG: false
  },

  // Internal state
  syncIntervalId: null,
  onlineHandler: null,
  isRunning: false,

  /**
   * Configure the service (call before starting)
   * @param {Object} options
   * @param {string} options.apiEndpoint - Central server endpoint
   * @param {number} options.interchangeRate - Interchange rate (default 0.015)
   * @param {boolean} options.debug - Enable debug logging
   */
  configure(options = {}) {
    if (options.apiEndpoint) this.config.API_ENDPOINT = options.apiEndpoint;
    if (options.interchangeRate !== undefined) this.config.INTERCHANGE_RATE = options.interchangeRate;
    if (options.debug !== undefined) this.config.DEBUG = options.debug;
    this._log('Configured:', this.config);
  },

  /**
   * Compute aggregated metrics from local transactions
   * Only totals and category sums — no individual transaction data
   * @param {string} startDate - ISO date string (optional, defaults to all time)
   * @param {string} endDate - ISO date string (optional)
   * @returns {Promise<Object>} Anonymized aggregated metrics
   */
  async computeAggregatedMetrics(startDate = null, endDate = null) {
    this._log('Computing aggregated metrics...');

    // Build filters
    const filters = {};
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    // Read from local manDB
    const transactions = await manDB.getTransactions(filters);

    // Total volume (absolute amounts)
    const totalVolume = transactions.reduce((sum, tx) => {
      return sum + Math.abs(parseFloat(tx.amount) || 0);
    }, 0);

    // Transaction count
    const transactionCount = transactions.length;

    // Category sums
    const categorySums = transactions.reduce((acc, tx) => {
      const category = tx.category || 'Uncategorized';
      const amount = Math.abs(parseFloat(tx.amount) || 0);
      acc[category] = (acc[category] || 0) + amount;
      return acc;
    }, {});

    // Round category sums for cleanliness
    const roundedCategorySums = Object.fromEntries(
      Object.entries(categorySums).map(([k, v]) => [k, Math.round(v * 100) / 100])
    );

    // Interchange and pool calculations (70/20/10 model)
    const totalInterchange = totalVolume * this.config.INTERCHANGE_RATE;
    const memberPoolShare = totalInterchange * this.config.MEMBER_POOL_SHARE;

    return {
      totalVolume: Math.round(totalVolume * 100) / 100,
      transactionCount,
      categorySums: roundedCategorySums,
      totalInterchange: Math.round(totalInterchange * 100) / 100,
      memberPoolShare: Math.round(memberPoolShare * 100) / 100,
      interchangeRate: this.config.INTERCHANGE_RATE,
      computedAt: new Date().toISOString()
    };
  },

  /**
   * Get all transactions that have not yet been synced to the server
   * @returns {Promise<Array>} Transactions with syncStatus === "pending_sync"
   */
  async getPendingSyncTransactions() {
    this._log('Fetching pending sync transactions...');
    return await manDB.getPendingSyncTransactions();
  },

  /**
   * Send ONLY aggregated data to the central server
   * No individual transactions, merchant names, or exact timestamps are sent
   * @param {Object} aggregatedData - Output from computeAggregatedMetrics()
   * @param {string} memberIdHash - SHA-256 hash of member ID (never raw email/name)
   * @returns {Promise<boolean>} true if server accepted, false otherwise
   */
  async sendAggregatedDataToServer(aggregatedData, memberIdHash) {
    this._log('Sending aggregated data to server...');

    const payload = {
      ...aggregatedData,
      memberHash: memberIdHash,
      clientVersion: 'SOLVY-PWA-v1.0',
      timestamp: new Date().toISOString()
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.SYNC_TIMEOUT_MS);

      const response = await fetch(this.config.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-SOLVY-Client': 'PWA-v1.0',
          'X-SOLVY-Member-Hash': memberIdHash
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        this._log('Server rejected aggregates:', response.status, await response.text());
        return false;
      }

      this._log('Server accepted aggregates successfully');
      return true;

    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('[AggregationService] Sync timed out after', this.config.SYNC_TIMEOUT_MS, 'ms');
      } else {
        console.error('[AggregationService] Network error during sync:', error.message);
      }
      return false;
    }
  },

  /**
   * Mark a list of transactions as synced in local IndexedDB
   * Called only after the server successfully acknowledges receipt
   * @param {Array<string>} transactionIds - Array of transaction IDs
   * @returns {Promise<number>} Number of transactions marked as synced
   */
  async markPendingTransactionsAsSynced(transactionIds) {
    this._log('Marking', transactionIds.length, 'transactions as synced...');
    let markedCount = 0;

    for (const id of transactionIds) {
      const success = await manDB.markAsSynced(id);
      if (success) markedCount++;
    }

    this._log('Marked', markedCount, 'transactions as synced');
    return markedCount;
  },

  /**
   * Main orchestration function — runs the full sync pipeline
   * 1. Finds pending transactions
   * 2. Computes aggregates
   * 3. Sends to server
   * 4. Marks as synced on success
   * 5. Retries later on failure — never loses data
   * @returns {Promise<Object>} Sync result summary
   */
  async runAggregationSync() {
    if (this.isRunning) {
      this._log('Sync already in progress, skipping');
      return { ran: false, reason: 'already_running' };
    }

    this.isRunning = true;
    this._log('=== Starting aggregation sync ===');

    try {
      // Step 1: Find pending transactions
      const pendingTransactions = await this.getPendingSyncTransactions();

      if (pendingTransactions.length === 0) {
        this._log('No pending transactions. Nothing to sync.');
        return { ran: true, synced: 0, reason: 'no_pending_transactions' };
      }

      this._log('Found', pendingTransactions.length, 'pending transactions');

      // Step 2: Determine date range from pending transactions
      const timestamps = pendingTransactions
        .map(tx => tx.timestamp)
        .filter(ts => typeof ts === 'string');

      const startDate = timestamps.length > 0
        ? timestamps.reduce((min, ts) => ts < min ? ts : min)
        : null;
      const endDate = timestamps.length > 0
        ? timestamps.reduce((max, ts) => ts > max ? ts : max)
        : null;

      // Step 3: Compute aggregates
      const aggregatedData = await this.computeAggregatedMetrics(startDate, endDate);
      this._log('Aggregated metrics:', aggregatedData);

      // Step 4: Generate member hash (never send raw ID)
      const rawMemberId = localStorage.getItem('solvy_member_id') || 'anonymous';
      const memberIdHash = await this._hashMemberId(rawMemberId);

      // Step 5: Send to server
      const serverAccepted = await this.sendAggregatedDataToServer(aggregatedData, memberIdHash);

      if (!serverAccepted) {
        console.warn('[AggregationService] Server did not accept aggregates. Will retry later.');
        return {
          ran: true,
          synced: 0,
          pendingCount: pendingTransactions.length,
          success: false,
          reason: 'server_rejected_or_timeout'
        };
      }

      // Step 6: Mark transactions as synced
      const transactionIds = pendingTransactions.map(tx => tx.id);
      const markedCount = await this.markPendingTransactionsAsSynced(transactionIds);

      // Record last successful sync
      localStorage.setItem('solvy_last_aggregation_sync', new Date().toISOString());

      this._log('=== Aggregation sync complete ===');
      return {
        ran: true,
        synced: markedCount,
        pendingCount: pendingTransactions.length,
        success: true,
        metrics: aggregatedData
      };

    } catch (error) {
      console.error('[AggregationService] Unexpected error during sync:', error);
      return {
        ran: true,
        synced: 0,
        success: false,
        reason: 'unexpected_error',
        error: error.message
      };
    } finally {
      this.isRunning = false;
    }
  },

  /**
   * Schedule regular aggregation sync
   * Also triggers sync when the browser comes back online
   * @param {number} intervalMinutes - Minutes between syncs (default: 60)
   * @returns {Function} Cleanup function — call this to stop syncing (e.g., on logout)
   */
  scheduleRegularSync(intervalMinutes = 60) {
    this._log('Scheduling regular sync every', intervalMinutes, 'minutes');

    // Clear any existing interval
    this.stopRegularSync();

    // Run immediately on schedule
    const intervalMs = intervalMinutes * 60 * 1000;
    this.syncIntervalId = setInterval(() => {
      this.runAggregationSync().catch(err => {
        console.error('[AggregationService] Scheduled sync failed:', err);
      });
    }, intervalMs);

    // Also sync when coming back online
    this.onlineHandler = () => {
      this._log('Browser came online — triggering sync');
      this.runAggregationSync().catch(err => {
        console.error('[AggregationService] Online-triggered sync failed:', err);
      });
    };
    window.addEventListener('online', this.onlineHandler);

    // Return cleanup function
    const cleanup = () => this.stopRegularSync();
    this._log('Regular sync started. Call cleanup() to stop.');
    return cleanup;
  },

  /**
   * Stop the regular sync interval and remove event listeners
   * Call this when the user logs out or the app is destroyed
   */
  stopRegularSync() {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
      this._log('Cleared sync interval');
    }

    if (this.onlineHandler) {
      window.removeEventListener('online', this.onlineHandler);
      this.onlineHandler = null;
      this._log('Removed online event listener');
    }
  },

  /**
   * Get the timestamp of the last successful sync
   * @returns {string|null} ISO timestamp or null
   */
  getLastSyncTime() {
    return localStorage.getItem('solvy_last_aggregation_sync');
  },

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  /**
   * Hash member ID using SHA-256 + salt
   * @param {string} memberId
   * @returns {Promise<string>} Hex hash string
   * @private
   */
  async _hashMemberId(memberId) {
    const salt = 'solvy_aggregation_salt_2025';
    const encoder = new TextEncoder();
    const data = encoder.encode(memberId + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  /**
   * Debug logger
   * @private
   */
  _log(...args) {
    if (this.config.DEBUG) {
      console.log('[AggregationService]', ...args);
    }
  }
};

// ============================================================================
// EXPORTS
// ============================================================================

// Make available globally for inline scripts
window.AggregationService = AggregationService;

// Export for ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AggregationService;
}
