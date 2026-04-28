/**
 * MAN-Unit.co Bridge
 * Connects MAN IndexedDB to Unit.co webhook data
 * Polls for pending transactions and syncs to local storage
 * 
 * SOLVY Ecosystem™ — Real-time transaction sync
 */

class MANUnitBridge {
  constructor() {
    this.apiUrl = this._detectEnvironment();
    this.pollingInterval = null;
    this.isSyncing = false;
    this.memberId = null;
  }

  /**
   * Auto-detect API endpoint based on hostname
   */
  _detectEnvironment() {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3000/api'; // Local development
    } else if (hostname.includes('dev') || hostname.includes('staging')) {
      return 'https://dev-api.ebl.beauty/api';
    } else {
      return 'https://api.ebl.beauty/api'; // Production
    }
  }

  /**
   * Initialize bridge with member authentication
   * @param {string} memberId 
   */
  async init(memberId) {
    this.memberId = memberId;
    
    // Wait for MAN database
    if (!window.manDB || !window.manDB.isReady) {
      window.addEventListener('MANDBReady', () => {
        this.startPolling();
      });
    } else {
      this.startPolling();
    }
    
    console.log('[MANUnitBridge] Initialized for member:', memberId);
  }

  /**
   * Start polling for new transactions
   */
  startPolling() {
    // Poll every 10 seconds
    this.pollingInterval = setInterval(() => {
      this.syncTransactions();
    }, 10000);
    
    // Initial sync
    this.syncTransactions();
    
    console.log('[MANUnitBridge] Polling started');
  }

  /**
   * Stop polling
   */
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  /**
   * Fetch pending transactions from server and store locally
   */
  async syncTransactions() {
    if (this.isSyncing || !this.memberId) return;
    
    this.isSyncing = true;
    
    try {
      const response = await fetch(`${this.apiUrl}/webhooks/unit/pending`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Member-ID': this.memberId
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.transactions && data.transactions.length > 0) {
        console.log(`[MANUnitBridge] Syncing ${data.transactions.length} transactions`);
        
        for (const tx of data.transactions) {
          await this._processTransaction(tx);
        }
        
        // Notify dashboard to refresh
        window.dispatchEvent(new CustomEvent('MANTransactionsUpdated', {
          detail: { count: data.transactions.length }
        }));
      }
      
    } catch (error) {
      console.error('[MANUnitBridge] Sync error:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Process a single transaction into MAN database
   * @param {Object} unitTx 
   */
  async _processTransaction(unitTx) {
    try {
      // Add to transactions store
      await window.manDB.addTransaction({
        id: unitTx.id,
        timestamp: unitTx.timestamp,
        amount: unitTx.amount,
        merchant: unitTx.merchant,
        card_last4: unitTx.card_last4,
        status: unitTx.status,
        metadata: unitTx.metadata
      });

      // Process metrics (70/20/10 split)
      await window.manDB.processTransactionMetrics(unitTx.amount);

      console.log('[MANUnitBridge] Processed transaction:', unitTx.merchant, unitTx.amount);
      
    } catch (error) {
      console.error('[MANUnitBridge] Process error:', error);
    }
  }

  /**
   * Simulate a transaction (for sandbox testing)
   * @param {number} amount 
   * @param {string} merchant 
   */
  async simulateTransaction(amount, merchant) {
    try {
      const response = await fetch(`${this.apiUrl}/webhooks/unit/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: amount,
          merchant: merchant,
          cardLast4: '1234'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // Process the simulated transaction locally
      await this._processTransaction(data.transaction);
      
      // Refresh dashboard
      window.dispatchEvent(new CustomEvent('MANTransactionsUpdated', {
        detail: { count: 1, simulated: true }
      }));

      return data;
      
    } catch (error) {
      console.error('[MANUnitBridge] Simulation error:', error);
      throw error;
    }
  }

  /**
   * Manual webhook test (for development)
   * @param {Object} mockEvent 
   */
  async testWebhook(mockEvent) {
    try {
      const response = await fetch(`${this.apiUrl}/webhooks/unit/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Unit-Signature': 'test-signature' // In real test, calculate proper signature
        },
        body: JSON.stringify(mockEvent)
      });

      return await response.json();
      
    } catch (error) {
      console.error('[MANUnitBridge] Test error:', error);
      throw error;
    }
  }
}

// Create global instance
const manUnitBridge = new MANUnitBridge();

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MANUnitBridge, manUnitBridge };
}
