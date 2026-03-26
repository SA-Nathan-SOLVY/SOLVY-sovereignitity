/**
 * SOLVY PWA - Threshold Service
 * Phase 4: Threshold-Based Triggers
 * 
 * Monitors cooperative progress toward collective action thresholds
 * Provides notifications when thresholds are crossed
 */

const ThresholdService = {
  // Thresholds configuration
  THRESHOLDS: [
    { 
      id: 'volume_50', 
      type: 'volume', 
      value: 500000, 
      message: '50% to collective action!',
      description: 'We are halfway to our first collective bargaining milestone.',
      action: 'View Progress'
    },
    { 
      id: 'volume_75', 
      type: 'volume', 
      value: 750000, 
      message: '75% to collective action!',
      description: 'Close to achieving collective bargaining power!',
      action: 'Get Ready to Vote'
    },
    { 
      id: 'volume_100', 
      type: 'volume', 
      value: 1000000, 
      message: 'Vote now: Pool data for better rates?',
      description: 'We have reached $1M in collective volume! Cast your vote to pool anonymized data for negotiating better interchange rates.',
      action: 'Vote Now'
    },
    { 
      id: 'members_1000', 
      type: 'member_count', 
      value: 1000, 
      message: 'New voting category available!',
      description: 'With 1,000+ members, we can now vote on governance proposals.',
      action: 'View Proposals'
    },
    { 
      id: 'members_5000', 
      type: 'member_count', 
      value: 5000, 
      message: 'Major milestone: 5,000 members!',
      description: 'Our cooperative has reached 5,000 members. New benefits unlocked!',
      action: 'Explore Benefits'
    },
    { 
      id: 'members_10000', 
      type: 'member_count', 
      value: 10000, 
      message: '10,000 members strong! 🎉',
      description: 'We are now 10,000 members strong. Incredible collective power!',
      action: 'Celebrate'
    }
  ],
  
  // Store for previously seen thresholds
  seenThresholdsKey: 'solvy_seen_thresholds',
  
  /**
   * Get list of already-seen threshold notifications
   * @returns {Array} - Array of threshold IDs
   */
  getSeenThresholds() {
    const stored = localStorage.getItem(this.seenThresholdsKey);
    return stored ? JSON.parse(stored) : [];
  },
  
  /**
   * Mark a threshold as seen
   * @param {string} thresholdId - The threshold ID
   */
  markThresholdSeen(thresholdId) {
    const seen = this.getSeenThresholds();
    if (!seen.includes(thresholdId)) {
      seen.push(thresholdId);
      localStorage.setItem(this.seenThresholdsKey, JSON.stringify(seen));
    }
  },
  
  /**
   * Check current progress from central API
   * @returns {Promise<Array>} - Array of notification objects
   */
  async checkThresholds() {
    try {
      const response = await fetch('/api/cooperative/metrics');
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const { totalVolume, memberCount, currentThresholds } = await response.json();
      
      const notifications = [];
      const seenThresholds = this.getSeenThresholds();
      
      for (const threshold of this.THRESHOLDS) {
        const current = threshold.type === 'volume' ? totalVolume : memberCount;
        const previous = currentThresholds?.[threshold.id] || 0;
        
        // Only notify if:
        // 1. We just crossed the threshold (current >= value && previous < value)
        // 2. OR we haven't seen this threshold yet and we're past it
        const justCrossed = current >= threshold.value && previous < threshold.value;
        const notYetSeen = !seenThresholds.includes(threshold.id) && current >= threshold.value;
        
        if (justCrossed || notYetSeen) {
          notifications.push({
            thresholdId: threshold.id,
            type: threshold.type,
            message: threshold.message,
            description: threshold.description,
            action: threshold.action,
            current: current,
            target: threshold.value,
            percentage: Math.round((current / threshold.value) * 100),
            isNew: justCrossed
          });
          
          // Mark as seen to avoid duplicate notifications
          this.markThresholdSeen(threshold.id);
        }
      }
      
      // Sort by percentage (highest first)
      notifications.sort((a, b) => b.percentage - a.percentage);
      
      return notifications;
    } catch (error) {
      console.error('Failed to check thresholds:', error);
      return [];
    }
  },
  
  /**
   * Get progress for dashboard widget
   * @returns {Promise<Object|null>} - Progress object or null if all thresholds met
   */
  async getProgress() {
    try {
      const response = await fetch('/api/cooperative/metrics');
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const { totalVolume, memberCount, uniqueMemberHashes } = await response.json();
      
      // Find next volume threshold
      const nextVolumeThreshold = this.THRESHOLDS
        .filter(t => t.type === 'volume')
        .find(t => totalVolume < t.value);
      
      // Find next member threshold  
      const nextMemberThreshold = this.THRESHOLDS
        .filter(t => t.type === 'member_count')
        .find(t => memberCount < t.value);
      
      // Get the closest threshold (smallest percentage)
      let nextThreshold = null;
      let progressType = null;
      
      if (nextVolumeThreshold && nextMemberThreshold) {
        const volumePercent = totalVolume / nextVolumeThreshold.value;
        const memberPercent = memberCount / nextMemberThreshold.value;
        
        if (volumePercent >= memberPercent) {
          nextThreshold = nextVolumeThreshold;
          progressType = 'volume';
        } else {
          nextThreshold = nextMemberThreshold;
          progressType = 'members';
        }
      } else if (nextVolumeThreshold) {
        nextThreshold = nextVolumeThreshold;
        progressType = 'volume';
      } else if (nextMemberThreshold) {
        nextThreshold = nextMemberThreshold;
        progressType = 'members';
      }
      
      if (!nextThreshold) {
        // All thresholds met
        return {
          allThresholdsMet: true,
          currentVolume: totalVolume,
          currentMembers: memberCount,
          message: 'All milestones achieved! 🎉',
          proposalPreview: 'Help set the next collective goal'
        };
      }
      
      const current = progressType === 'volume' ? totalVolume : memberCount;
      const percentage = Math.min(100, Math.round((current / nextThreshold.value) * 100));
      
      return {
        type: progressType,
        current: current,
        target: nextThreshold.value,
        percentage: percentage,
        remaining: nextThreshold.value - current,
        message: nextThreshold.message,
        description: nextThreshold.description,
        proposalPreview: progressType === 'volume' 
          ? 'Pool anonymized data to negotiate better interchange rates'
          : 'Unlock new governance voting rights',
        nextMilestone: this.formatValue(nextThreshold.value, progressType),
        isCloseToThreshold: percentage >= 80
      };
    } catch (error) {
      console.error('Failed to get progress:', error);
      return null;
    }
  },
  
  /**
   * Format a value for display
   * @param {number} value - The value to format
   * @param {string} type - The value type
   * @returns {string} - Formatted value
   */
  formatValue(value, type) {
    if (type === 'volume') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
      }).format(value);
    }
    return new Intl.NumberFormat('en-US').format(value);
  },
  
  /**
   * Get all thresholds with their current status
   * @returns {Promise<Array>} - Array of threshold status objects
   */
  async getAllThresholdsStatus() {
    try {
      const response = await fetch('/api/cooperative/metrics');
      const { totalVolume, memberCount } = await response.json();
      
      return this.THRESHOLDS.map(threshold => {
        const current = threshold.type === 'volume' ? totalVolume : memberCount;
        const percentage = Math.min(100, Math.round((current / threshold.value) * 100));
        
        return {
          ...threshold,
          current,
          percentage,
          achieved: current >= threshold.value,
          formattedTarget: this.formatValue(threshold.value, threshold.type),
          formattedCurrent: this.formatValue(current, threshold.type)
        };
      });
    } catch (error) {
      console.error('Failed to get threshold status:', error);
      return [];
    }
  },
  
  /**
   * Subscribe to real-time updates via Server-Sent Events
   * @param {Function} callback - Callback function for updates
   * @returns {Function} - Unsubscribe function
   */
  subscribeToUpdates(callback) {
    // Check if EventSource is supported
    if (typeof EventSource === 'undefined') {
      console.warn('Server-Sent Events not supported, falling back to polling');
      return this.subscribeViaPolling(callback);
    }
    
    try {
      const evtSource = new EventSource('/api/cooperative/metrics/stream');
      
      evtSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          callback(data);
        } catch (e) {
          console.error('Failed to parse SSE data:', e);
        }
      };
      
      evtSource.onerror = (error) => {
        console.error('SSE error:', error);
        evtSource.close();
        // Fall back to polling
        return this.subscribeViaPolling(callback);
      };
      
      // Return unsubscribe function
      return () => {
        evtSource.close();
      };
    } catch (error) {
      console.error('Failed to setup SSE:', error);
      return this.subscribeViaPolling(callback);
    }
  },
  
  /**
   * Subscribe to updates via polling fallback
   * @param {Function} callback - Callback function for updates
   * @param {number} intervalSeconds - Polling interval
   * @returns {Function} - Unsubscribe function
   */
  subscribeViaPolling(callback, intervalSeconds = 30) {
    const intervalId = setInterval(async () => {
      const progress = await this.getProgress();
      if (progress) {
        callback(progress);
      }
    }, intervalSeconds * 1000);
    
    // Return unsubscribe function
    return () => {
      clearInterval(intervalId);
    };
  },
  
  /**
   * Show browser notification for threshold achievement
   * @param {Object} notification - The notification object
   */
  showBrowserNotification(notification) {
    if (!('Notification' in window)) {
      return;
    }
    
    if (Notification.permission === 'granted') {
      new Notification('SOLVY Cooperative Milestone!', {
        body: notification.message,
        icon: '/assets/solvy-crown-icon.png',
        badge: '/assets/solvy-crown-icon.png',
        tag: notification.thresholdId,
        requireInteraction: notification.isNew
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          this.showBrowserNotification(notification);
        }
      });
    }
  },
  
  /**
   * Request notification permission
   */
  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      return false;
    }
    
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThresholdService;
}
