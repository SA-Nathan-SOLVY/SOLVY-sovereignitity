/**
 * Voting Service - MAN (Member Advocacy Network) Integration
 * Privacy-preserving voting system for SOLVY cooperative
 */

const VotingService = {
  // Member ID (would be set during authentication)
  memberId: null,
  
  // Initialize with member ID
  init(memberId) {
    this.memberId = memberId;
  },
  
  /**
   * Hash member ID for privacy (SHA-256)
   * @param {string} memberId - The member's unique identifier
   * @returns {Promise<string>} - Hashed member ID (hex string)
   */
  async hashMemberId(memberId) {
    if (!memberId) {
      throw new Error('Member ID not initialized. Call VotingService.init() first.');
    }
    
    const encoder = new TextEncoder();
    const data = encoder.encode(memberId);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },
  
  /**
   * Fetch active proposals
   * @returns {Promise<Array>} - List of active proposals
   */
  async getActiveProposals() {
    try {
      const response = await fetch('/api/proposals?status=active');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch proposals: ${response.statusText}`);
      }
      
      const proposals = await response.json();
      
      // Store in local cache
      for (const proposal of proposals) {
        await this._cacheProposal(proposal);
      }
      
      return proposals;
    } catch (error) {
      console.error('Error fetching active proposals:', error);
      
      // Return cached proposals if available
      return this._getCachedProposals();
    }
  },
  
  /**
   * Fetch all proposals (including pending and closed)
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} - List of proposals
   */
  async getProposals(filters = {}) {
    const queryParams = new URLSearchParams();
    
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.thresholdType) queryParams.append('threshold_type', filters.thresholdType);
    if (filters.limit) queryParams.append('limit', filters.limit);
    
    const url = `/api/proposals?${queryParams.toString()}`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch proposals: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching proposals:', error);
      throw error;
    }
  },
  
  /**
   * Cast vote (hashed member ID for privacy)
   * @param {string} proposalId - The proposal ID
   * @param {string} choice - The voting choice
   * @returns {Promise<Object>} - Vote confirmation
   */
  async castVote(proposalId, choice) {
    if (!this.memberId) {
      throw new Error('Member ID not initialized. Call VotingService.init() first.');
    }
    
    // Check if already voted
    const hasVoted = await this.hasVoted(proposalId);
    if (hasVoted) {
      throw new Error('Member has already voted on this proposal');
    }
    
    const memberHash = await this.hashMemberId(this.memberId);
    
    const vote = {
      proposalId,
      memberHash,  // Hashed - no link to transactions
      choice,
      timestamp: new Date().toISOString()
    };
    
    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vote)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to cast vote');
      }
      
      const result = await response.json();
      
      // Store locally that user voted
      await this._storeVote({ proposalId, choice, votedAt: new Date() });
      
      // Emit event for UI updates
      this._emitVoteEvent(proposalId, choice);
      
      return result;
    } catch (error) {
      console.error('Error casting vote:', error);
      throw error;
    }
  },
  
  /**
   * Get results after voting closes
   * @param {string} proposalId - The proposal ID
   * @returns {Promise<Object>} - Voting results
   */
  async getResults(proposalId) {
    try {
      const response = await fetch(`/api/proposals/${proposalId}/results`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch results: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching results:', error);
      throw error;
    }
  },
  
  /**
   * Check if user already voted
   * @param {string} proposalId - The proposal ID
   * @returns {Promise<boolean>} - Whether user has voted
   */
  async hasVoted(proposalId) {
    try {
      const vote = await this._getStoredVote(proposalId);
      return !!vote;
    } catch (error) {
      console.error('Error checking vote status:', error);
      return false;
    }
  },
  
  /**
   * Get user's vote for a proposal
   * @param {string} proposalId - The proposal ID
   * @returns {Promise<Object|null>} - Vote object or null
   */
  async getUserVote(proposalId) {
    return this._getStoredVote(proposalId);
  },
  
  /**
   * Get proposal details
   * @param {string} proposalId - The proposal ID
   * @returns {Promise<Object>} - Proposal details
   */
  async getProposal(proposalId) {
    try {
      const response = await fetch(`/api/proposals/${proposalId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch proposal: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching proposal:', error);
      
      // Try cache
      return this._getCachedProposal(proposalId);
    }
  },
  
  /**
   * Subscribe to proposal updates (using Server-Sent Events)
   * @param {string} proposalId - The proposal ID to subscribe to
   * @param {Function} callback - Callback for updates
   * @returns {Function} - Unsubscribe function
   */
  subscribeToProposal(proposalId, callback) {
    const eventSource = new EventSource(`/api/proposals/${proposalId}/stream`);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      callback(data);
    };
    
    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      eventSource.close();
    };
    
    // Return unsubscribe function
    return () => eventSource.close();
  },
  
  /**
   * Calculate time remaining for proposal
   * @param {string} voteEnd - ISO timestamp of vote end
   * @returns {Object} - Time remaining breakdown
   */
  calculateTimeRemaining(voteEnd) {
    const end = new Date(voteEnd);
    const now = new Date();
    const diff = end - now;
    
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { days, hours, minutes, seconds, expired: false };
  },
  
  /**
   * Format time remaining as human-readable string
   * @param {Object} timeRemaining - Time remaining object
   * @returns {string} - Formatted string
   */
  formatTimeRemaining(timeRemaining) {
    if (timeRemaining.expired) return 'Voting closed';
    
    const parts = [];
    if (timeRemaining.days > 0) parts.push(`${timeRemaining.days}d`);
    if (timeRemaining.hours > 0) parts.push(`${timeRemaining.hours}h`);
    if (timeRemaining.minutes > 0) parts.push(`${timeRemaining.minutes}m`);
    if (parts.length === 0 && timeRemaining.seconds > 0) parts.push(`${timeRemaining.seconds}s`);
    
    return parts.join(' ') || 'Closing soon';
  },
  
  // Private methods for local storage
  
  async _cacheProposal(proposal) {
    try {
      const db = await this._getDB();
      await db.proposals.put(proposal);
    } catch (error) {
      console.error('Error caching proposal:', error);
    }
  },
  
  async _getCachedProposals() {
    try {
      const db = await this._getDB();
      return await db.proposals.where('status').equals('active').toArray();
    } catch (error) {
      return [];
    }
  },
  
  async _getCachedProposal(proposalId) {
    try {
      const db = await this._getDB();
      return await db.proposals.get(proposalId);
    } catch (error) {
      return null;
    }
  },
  
  async _storeVote(vote) {
    try {
      const db = await this._getDB();
      await db.votes.put(vote);
    } catch (error) {
      console.error('Error storing vote:', error);
      // Fallback to localStorage
      localStorage.setItem(`vote_${vote.proposalId}`, JSON.stringify(vote));
    }
  },
  
  async _getStoredVote(proposalId) {
    try {
      const db = await this._getDB();
      let vote = await db.votes.get(proposalId);
      
      // Fallback to localStorage
      if (!vote) {
        const stored = localStorage.getItem(`vote_${proposalId}`);
        if (stored) vote = JSON.parse(stored);
      }
      
      return vote;
    } catch (error) {
      // Fallback to localStorage
      const stored = localStorage.getItem(`vote_${proposalId}`);
      return stored ? JSON.parse(stored) : null;
    }
  },
  
  async _getDB() {
    // Return Dexie instance or similar IndexedDB wrapper
    if (typeof db !== 'undefined') {
      return db;
    }
    
    // Simple fallback if db is not defined
    return {
      proposals: {
        put: () => Promise.resolve(),
        get: () => Promise.resolve(null),
        where: () => ({ equals: () => ({ toArray: () => Promise.resolve([]) }) })
      },
      votes: {
        put: () => Promise.resolve(),
        get: () => Promise.resolve(null)
      }
    };
  },
  
  _emitVoteEvent(proposalId, choice) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('voteCast', {
        detail: { proposalId, choice, timestamp: new Date() }
      }));
    }
  }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VotingService;
}
