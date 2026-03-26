/**
 * SOLVY PWA - Aggregated Metrics Service
 * Phase 3: Anonymized Aggregated Metrics
 * 
 * Client-side aggregation - NO individual data leaves device
 * All calculations are performed locally before sending only aggregates
 */

const AggregatedMetricsService = {
  // Store member ID for hashing (set during authentication)
  memberId: null,
  
  /**
   * Set the member ID for hashing
   * @param {string} id - The member ID
   */
  setMemberId(id) {
    this.memberId = id;
  },
  
  /**
   * Hash member ID using SHA-256 for anonymous counting
   * @param {string} memberId - The member ID to hash
   * @returns {Promise<string>} - The hashed member ID
   */
  async hashMemberId(memberId) {
    if (!memberId && !this.memberId) {
      throw new Error('Member ID not set');
    }
    
    const idToHash = memberId || this.memberId;
    const encoder = new TextEncoder();
    const data = encoder.encode(idToHash + 'solvy_salt_2025'); // Add salt for security
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },
  
  /**
   * Get transactions from local database
   * @returns {Promise<Array>} - Array of transactions
   */
  async getLocalTransactions() {
    // Check if Dexie is available
    if (typeof db !== 'undefined' && db.transactions) {
      return await db.transactions.toArray();
    }
    
    // Fallback to localStorage
    const stored = localStorage.getItem('solvy_transactions');
    return stored ? JSON.parse(stored) : [];
  },
  
  /**
   * Calculate aggregated metrics locally
   * @returns {Promise<Object>} - Aggregated metrics object
   */
  async calculateMetrics() {
    const transactions = await this.getLocalTransactions();
    
    // Calculate total volume
    const totalVolume = transactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    
    // Calculate category sums
    const categorySums = transactions.reduce((acc, t) => {
      const category = t.category || 'uncategorized';
      acc[category] = (acc[category] || 0) + (parseFloat(t.amount) || 0);
      return acc;
    }, {});
    
    // Calculate average transaction
    const averageTransaction = transactions.length > 0 
      ? totalVolume / transactions.length 
      : 0;
    
    // Get unique merchant categories count
    const uniqueCategories = Object.keys(categorySums).length;
    
    // Calculate time-based metrics
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const recentTransactions = transactions.filter(t => {
      const tDate = new Date(t.date || t.timestamp);
      return tDate >= thirtyDaysAgo;
    });
    
    const recentVolume = recentTransactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    
    // Include a hashed member ID for counting (not identification)
    const memberHash = await this.hashMemberId(this.memberId || 'anonymous');
    
    return {
      totalVolume: Math.round(totalVolume * 100) / 100,
      transactionCount: transactions.length,
      categorySums: Object.fromEntries(
        Object.entries(categorySums).map(([k, v]) => [k, Math.round(v * 100) / 100])
      ),
      averageTransaction: Math.round(averageTransaction * 100) / 100,
      uniqueCategories,
      recentVolume: Math.round(recentVolume * 100) / 100,
      recentTransactionCount: recentTransactions.length,
      memberHash,
      lastCalculated: new Date().toISOString()
    };
  },
  
  /**
   * Sanitize metrics before sending - remove any potentially identifying info
   * @param {Object} metrics - Raw metrics
   * @returns {Object} - Sanitized metrics
   */
  sanitizeMetrics(metrics) {
    // Only send aggregate data - never individual transactions
    const sanitized = {
      totalVolume: metrics.totalVolume,
      transactionCount: metrics.transactionCount,
      categorySums: metrics.categorySums,
      uniqueCategories: metrics.uniqueCategories,
      recentVolume: metrics.recentVolume,
      recentTransactionCount: metrics.recentTransactionCount,
      memberHash: metrics.memberHash,
      timestamp: new Date().toISOString()
    };
    
    return sanitized;
  },
  
  /**
   * Send ONLY aggregates to central API
   * @returns {Promise<Object>} - API response
   */
  async syncToCentralAPI() {
    try {
      const metrics = await this.calculateMetrics();
      
      // Remove any potentially identifying info before sending
      const sanitizedMetrics = this.sanitizeMetrics(metrics);
      
      const response = await fetch('/api/metrics', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-SOLVY-Client': 'PWA-v1.0'
        },
        body: JSON.stringify(sanitizedMetrics)
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
        metricsSent: sanitizedMetrics
      };
    } catch (error) {
      console.error('Failed to sync metrics:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * Get the last sync timestamp
   * @returns {string|null} - ISO timestamp or null
   */
  getLastSyncTime() {
    return localStorage.getItem('solvy_last_metrics_sync');
  },
  
  /**
   * Get local data summary for privacy dashboard
   * @returns {Promise<Object>} - Summary of local data
   */
  async getLocalDataSummary() {
    const transactions = await this.getLocalTransactions();
    
    return {
      localTransactionCount: transactions.length,
      localStorageUsed: this.calculateStorageSize(transactions),
      firstTransactionDate: transactions.length > 0 
        ? transactions.reduce((min, t) => {
            const date = new Date(t.date || t.timestamp);
            return date < min ? date : min;
          }, new Date())
        : null,
      lastTransactionDate: transactions.length > 0
        ? transactions.reduce((max, t) => {
            const date = new Date(t.date || t.timestamp);
            return date > max ? date : max;
          }, new Date(0))
        : null,
      dataTypes: {
        transactions: true,
        categories: true,
        merchantNames: true,
        amounts: true,
        dates: true
      }
    };
  },
  
  /**
   * Calculate approximate storage size
   * @param {Array} transactions - Transactions array
   * @returns {string} - Human-readable size
   */
  calculateStorageSize(transactions) {
    const bytes = JSON.stringify(transactions).length * 2; // UTF-16
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  },
  
  /**
   * Export all personal data for user download
   * @returns {Promise<Object>} - Complete user data export
   */
  async exportPersonalData() {
    const transactions = await this.getLocalTransactions();
    const metrics = await this.calculateMetrics();
    
    const exportData = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      transactions: transactions,
      aggregatedMetrics: metrics,
      userSettings: {
        theme: localStorage.getItem('solvy_theme'),
        language: localStorage.getItem('solvy_language'),
        notifications: localStorage.getItem('solvy_notifications')
      }
    };
    
    return exportData;
  },
  
  /**
   * Download personal data as JSON file
   */
  async downloadPersonalData() {
    const data = await this.exportPersonalData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `solvy-data-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
  },
  
  /**
   * Setup automatic periodic sync
   * @param {number} intervalMinutes - Sync interval in minutes
   */
  setupAutoSync(intervalMinutes = 60) {
    // Clear existing interval
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    // Set up new interval
    this.syncInterval = setInterval(() => {
      this.syncToCentralAPI();
    }, intervalMinutes * 60 * 1000);
    
    console.log(`Auto-sync enabled: every ${intervalMinutes} minutes`);
  },
  
  /**
   * Stop automatic sync
   */
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('Auto-sync disabled');
    }
  }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AggregatedMetricsService;
}
