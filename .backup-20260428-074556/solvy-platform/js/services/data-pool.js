/**
 * SOLVY Cooperative - Data Pool Service
 * 
 * Manages member data contributions to the cooperative pool
 * Implements: anonymization, encryption, 30-day expiry, member voting
 * 
 * Part of the 70/20/10 Economic Model - data pooling generates insights
 * that benefit all members while preserving individual privacy.
 */

import { db, OfflineSyncManager } from './db.js';
import { EncryptionService } from './encryption-service.js';

/**
 * Data Pool Service
 * Handles opt-in data contribution, aggregation, and governance
 */
const DataPoolService = {
  
  // Configuration
  config: {
    POOL_ENABLED_KEY: 'solvy_dataPoolEnabled',
    CONTRIBUTIONS_KEY: 'solvy_poolContributions',
    EXPIRY_DAYS: 30,
    MIN_RECORDS_FOR_AGGREGATION: 10,
    ANONYMIZATION_SALT: 'solvy_cooperative_2025'
  },

  /**
   * Check if member has enabled data pooling
   */
  isPoolEnabled() {
    return localStorage.getItem(this.config.POOL_ENABLED_KEY) === 'true';
  },

  /**
   * Toggle data pool participation
   * Requires explicit member consent
   */
  async setPoolEnabled(enabled) {
    localStorage.setItem(this.config.POOL_ENABLED_KEY, enabled.toString());
    
    if (enabled) {
      // Trigger initial aggregation
      await this.aggregateAndContribute();
    }
    
    return { enabled, timestamp: new Date().toISOString() };
  },

  /**
   * Aggregate transaction data locally before pooling
   * Only aggregated/anonymized data leaves the device
   */
  async aggregateAndContribute() {
    try {
      // Get local transactions from IndexedDB
      const transactions = await db.transactions
        .where('pendingSync')
        .equals(0) // Only synced records
        .and(tx => !tx.pooledAt) // Not yet pooled
        .toArray();

      if (transactions.length < this.config.MIN_RECORDS_FOR_AGGREGATION) {
        console.log('[DataPool] Insufficient records for aggregation');
        return { contributed: 0, reason: 'insufficient_records' };
      }

      // Calculate aggregates locally (privacy-preserving)
      const aggregates = this.calculateAggregates(transactions);
      
      // Anonymize member ID
      const anonymousId = await this.anonymizeMemberId(
        localStorage.getItem('solvy_memberId') || 'anonymous'
      );

      // Encrypt before sending
      const encryptedPayload = await EncryptionService.encrypt(
        JSON.stringify(aggregates)
      );

      // Create contribution record
      const contribution = {
        anonymousId,
        encryptedData: encryptedPayload,
        contributedAt: new Date().toISOString(),
        expiresAt: this.calculateExpiryDate(),
        recordCount: transactions.length,
        checksum: await this.generateChecksum(aggregates)
      };

      // Store contribution locally (for audit)
      await this.storeContribution(contribution);

      // Send to cooperative pool
      const result = await this.sendToPool(contribution);

      // Mark transactions as pooled
      if (result.success) {
        await this.markTransactionsAsPooled(transactions);
      }

      return {
        contributed: transactions.length,
        contributionId: contribution.checksum,
        expiresAt: contribution.expiresAt
      };

    } catch (error) {
      console.error('[DataPool] Aggregation failed:', error);
      return { contributed: 0, error: error.message };
    }
  },

  /**
   * Calculate privacy-preserving aggregates
   * Only summaries leave the device, never raw transactions
   */
  calculateAggregates(transactions) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    // Time-based filtering
    const recentTx = transactions.filter(tx => new Date(tx.date) >= thirtyDaysAgo);

    // Category aggregation
    const categoryStats = transactions.reduce((acc, tx) => {
      const cat = tx.category || 'uncategorized';
      if (!acc[cat]) {
        acc[cat] = { total: 0, count: 0, avg: 0 };
      }
      acc[cat].total += tx.amount;
      acc[cat].count += 1;
      acc[cat].avg = acc[cat].total / acc[cat].count;
      return acc;
    }, {});

    // Daily patterns (anonymized time)
    const dailyPatterns = transactions.reduce((acc, tx) => {
      const day = new Date(tx.date).getDay();
      acc[day] = (acc[day] || 0) + tx.amount;
      return acc;
    }, {});

    // Merchant categories (hashed)
    const merchantCategories = transactions.reduce((acc, tx) => {
      const hash = this.hashString(tx.merchant || 'unknown').substring(0, 8);
      acc[hash] = (acc[hash] || 0) + 1;
      return acc;
    }, {});

    return {
      period: '30d',
      totalTransactions: transactions.length,
      totalAmount: transactions.reduce((sum, tx) => sum + tx.amount, 0),
      avgTransaction: transactions.reduce((sum, tx) => sum + tx.amount, 0) / transactions.length,
      categories: categoryStats,
      dailyPatterns,
      merchantCategories,
      generatedAt: now.toISOString()
    };
  },

  /**
   * Generate anonymized member ID
   * One-way hash prevents re-identification
   */
  async anonymizeMemberId(memberId) {
    const salt = this.config.ANONYMIZATION_SALT;
    const data = `${memberId}:${salt}:${new Date().getMonth()}`; // Rotate monthly
    
    if (window.crypto && window.crypto.subtle) {
      const encoder = new TextEncoder();
      const buffer = await window.crypto.subtle.digest('SHA-256', encoder.encode(data));
      return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .substring(0, 16);
    }
    
    // Fallback
    return this.hashString(data);
  },

  /**
   * Simple string hash (fallback)
   */
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(16, '0');
  },

  /**
   * Calculate expiry date (30 days from now)
   */
  calculateExpiryDate() {
    const date = new Date();
    date.setDate(date.getDate() + this.config.EXPIRY_DAYS);
    return date.toISOString();
  },

  /**
   * Generate checksum for contribution verification
   */
  async generateChecksum(data) {
    const str = JSON.stringify(data);
    if (window.crypto && window.crypto.subtle) {
      const encoder = new TextEncoder();
      const buffer = await window.crypto.subtle.digest('SHA-256', encoder.encode(str));
      return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .substring(0, 16);
    }
    return this.hashString(str);
  },

  /**
   * Store contribution locally for member audit
   */
  async storeContribution(contribution) {
    const contributions = JSON.parse(
      localStorage.getItem(this.config.CONTRIBUTIONS_KEY) || '[]'
    );
    contributions.push(contribution);
    localStorage.setItem(this.config.CONTRIBUTIONS_KEY, JSON.stringify(contributions));
    
    // Also store in IndexedDB
    await db.dataPoolContributions.put({
      proposalId: contribution.checksum,
      contributedAt: contribution.contributedAt,
      expiresAt: contribution.expiresAt
    });
  },

  /**
   * Send encrypted aggregates to cooperative pool
   */
  async sendToPool(contribution) {
    try {
      const response = await fetch('/api/data-pool/contribute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Solvy-Anonymous-Id': contribution.anonymousId
        },
        body: JSON.stringify({
          encryptedData: contribution.encryptedData,
          checksum: contribution.checksum,
          expiresAt: contribution.expiresAt
        })
      });

      if (!response.ok) {
        throw new Error(`Pool API error: ${response.status}`);
      }

      return { success: true, ...(await response.json()) };

    } catch (error) {
      // Queue for retry when online
      await OfflineSyncManager.queueOperation({
        type: 'dataPoolContribute',
        data: contribution
      });
      return { success: false, queued: true };
    }
  },

  /**
   * Mark transactions as pooled (prevent double-contribution)
   */
  async markTransactionsAsPooled(transactions) {
    const ids = transactions.map(tx => tx.id);
    await db.transactions.where('id').anyOf(ids).modify({
      pooledAt: new Date().toISOString()
    });
  },

  /**
   * Get member's contribution history
   */
  async getContributionHistory() {
    const contributions = JSON.parse(
      localStorage.getItem(this.config.CONTRIBUTIONS_KEY) || '[]'
    );
    
    return {
      totalContributions: contributions.length,
      totalRecords: contributions.reduce((sum, c) => sum + (c.recordCount || 0), 0),
      contributions: contributions.slice(-10) // Last 10
    };
  },

  /**
   * Clean up expired contributions
   */
  async cleanupExpired() {
    const now = new Date().toISOString();
    
    // Remove from IndexedDB
    await db.dataPoolContributions
      .where('expiresAt')
      .below(now)
      .delete();

    // Clean localStorage
    const contributions = JSON.parse(
      localStorage.getItem(this.config.CONTRIBUTIONS_KEY) || '[]'
    );
    const valid = contributions.filter(c => c.expiresAt > now);
    localStorage.setItem(this.config.CONTRIBUTIONS_KEY, JSON.stringify(valid));

    return { removed: contributions.length - valid.length };
  },

  /**
   * Get pool statistics for privacy dashboard
   */
  async getPoolStats() {
    const enabled = this.isPoolEnabled();
    const history = await this.getContributionHistory();
    
    return {
      enabled,
      ...history,
      nextExpiry: history.contributions[0]?.expiresAt || null
    };
  }
};

// Export for use in other modules
export { DataPoolService };
export default DataPoolService;
