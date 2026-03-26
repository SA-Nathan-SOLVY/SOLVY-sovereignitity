/**
 * SOLVY PWA - Threshold Widget Component
 * Phase 4: Threshold-Based Triggers
 * 
 * Progress bar showing % toward next threshold
 * Real-time updates via polling or Server-Sent Events
 */

class ThresholdWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.progress = null;
    this.unsubscribe = null;
    this.isExpanded = false;
  }
  
  static get observedAttributes() {
    return ['auto-refresh', 'refresh-interval'];
  }
  
  connectedCallback() {
    this.render();
    this.loadProgress();
    
    // Setup real-time updates if requested
    if (this.hasAttribute('auto-refresh')) {
      this.setupRealtimeUpdates();
    }
  }
  
  disconnectedCallback() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
  
  async loadProgress() {
    try {
      this.progress = await ThresholdService.getProgress();
      this.render();
    } catch (error) {
      console.error('Failed to load progress:', error);
      this.renderError();
    }
  }
  
  setupRealtimeUpdates() {
    const interval = parseInt(this.getAttribute('refresh-interval'), 10) || 30;
    this.unsubscribe = ThresholdService.subscribeViaPolling(
      (progress) => {
        this.progress = progress;
        this.render();
      },
      interval
    );
  }
  
  render() {
    const styles = `
      :host {
        display: block;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      }
      
      .threshold-widget {
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        border: 1px solid rgba(34, 197, 94, 0.3);
        border-radius: 16px;
        padding: 1.5rem;
        color: #fff;
        max-width: 400px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        transition: all 0.3s ease;
      }
      
      .threshold-widget:hover {
        border-color: rgba(34, 197, 94, 0.5);
        box-shadow: 0 15px 50px rgba(34, 197, 94, 0.1);
      }
      
      .widget-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }
      
      .widget-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
        font-weight: 600;
        color: #22c55e;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      
      .cooperative-icon {
        font-size: 1.25rem;
      }
      
      .live-indicator {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.75rem;
        color: #22c55e;
        background: rgba(34, 197, 94, 0.1);
        padding: 0.25rem 0.5rem;
        border-radius: 50px;
      }
      
      .live-dot {
        width: 6px;
        height: 6px;
        background: #22c55e;
        border-radius: 50%;
        animation: pulse 2s infinite;
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(1.2); }
      }
      
      .progress-section {
        margin-bottom: 1rem;
      }
      
      .progress-header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: 0.75rem;
      }
      
      .current-value {
        font-size: 2rem;
        font-weight: 800;
        color: #fff;
        line-height: 1;
      }
      
      .current-value.small {
        font-size: 1.5rem;
      }
      
      .target-value {
        font-size: 0.85rem;
        color: #94a3b8;
      }
      
      .progress-bar-container {
        height: 12px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        overflow: hidden;
        position: relative;
      }
      
      .progress-bar {
        height: 100%;
        background: linear-gradient(90deg, #22c55e 0%, #4ade80 50%, #22c55e 100%);
        background-size: 200% 100%;
        border-radius: 6px;
        transition: width 0.5s ease;
        position: relative;
        animation: shimmer 2s infinite;
      }
      
      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      
      .progress-bar.near-threshold {
        animation: pulse-green 1s infinite, shimmer 2s infinite;
      }
      
      @keyframes pulse-green {
        0%, 100% { 
          box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
        }
        50% { 
          box-shadow: 0 0 20px 5px rgba(34, 197, 94, 0.5);
        }
      }
      
      .percentage-label {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 0.7rem;
        font-weight: 700;
        color: #fff;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
      }
      
      .message-section {
        background: rgba(34, 197, 94, 0.1);
        border-left: 3px solid #22c55e;
        padding: 0.75rem 1rem;
        border-radius: 0 8px 8px 0;
        margin-bottom: 1rem;
      }
      
      .message-text {
        font-size: 0.95rem;
        color: #fff;
        margin: 0 0 0.25rem 0;
        font-weight: 500;
      }
      
      .message-description {
        font-size: 0.8rem;
        color: #94a3b8;
        margin: 0;
      }
      
      .proposal-preview {
        background: rgba(59, 130, 246, 0.1);
        border: 1px solid rgba(59, 130, 246, 0.2);
        border-radius: 8px;
        padding: 0.75rem;
        margin-bottom: 1rem;
      }
      
      .proposal-label {
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #60a5fa;
        margin-bottom: 0.25rem;
      }
      
      .proposal-text {
        font-size: 0.85rem;
        color: #cbd5e1;
        margin: 0;
      }
      
      .widget-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .learn-more-link {
        color: #22c55e;
        text-decoration: none;
        font-size: 0.85rem;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 0.25rem;
        transition: all 0.2s;
      }
      
      .learn-more-link:hover {
        color: #4ade80;
        gap: 0.5rem;
      }
      
      .expand-button {
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: #94a3b8;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }
      
      .expand-button:hover {
        background: rgba(255, 255, 255, 0.2);
        color: #fff;
      }
      
      .thresholds-list {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid rgba(148, 163, 184, 0.2);
      }
      
      .threshold-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem 0;
        font-size: 0.85rem;
      }
      
      .threshold-status {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.7rem;
        flex-shrink: 0;
      }
      
      .threshold-status.achieved {
        background: #22c55e;
        color: #fff;
      }
      
      .threshold-status.pending {
        background: rgba(148, 163, 184, 0.3);
        color: #94a3b8;
      }
      
      .threshold-info {
        flex: 1;
      }
      
      .threshold-name {
        color: #cbd5e1;
      }
      
      .threshold-target {
        color: #64748b;
        font-size: 0.75rem;
      }
      
      .loading {
        text-align: center;
        padding: 2rem;
        color: #94a3b8;
      }
      
      .spinner {
        display: inline-block;
        width: 24px;
        height: 24px;
        border: 2px solid rgba(34, 197, 94, 0.3);
        border-top-color: #22c55e;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 0.5rem;
      }
      
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      
      .error {
        text-align: center;
        padding: 1.5rem;
        color: #ef4444;
      }
      
      .success-state {
        text-align: center;
        padding: 1.5rem;
      }
      
      .success-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
      }
      
      .success-title {
        font-size: 1.25rem;
        font-weight: 700;
        color: #22c55e;
        margin-bottom: 0.5rem;
      }
      
      .success-message {
        color: #94a3b8;
        font-size: 0.9rem;
        margin-bottom: 1rem;
      }
      
      .success-stats {
        display: flex;
        justify-content: center;
        gap: 2rem;
        margin-top: 1rem;
      }
      
      .success-stat {
        text-align: center;
      }
      
      .success-stat-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: #22c55e;
      }
      
      .success-stat-label {
        font-size: 0.75rem;
        color: #64748b;
        text-transform: uppercase;
      }
    `;
    
    if (!this.progress) {
      this.shadowRoot.innerHTML = `
        <style>${styles}</style>
        <div class="threshold-widget">
          <div class="loading">
            <div class="spinner"></div>
            <div>Loading progress...</div>
          </div>
        </div>
      `;
      return;
    }
    
    // Check if all thresholds are met
    if (this.progress.allThresholdsMet) {
      this.shadowRoot.innerHTML = `
        <style>${styles}</style>
        <div class="threshold-widget">
          <div class="success-state">
            <div class="success-icon">🎉</div>
            <div class="success-title">All Milestones Achieved!</div>
            <div class="success-message">${this.progress.message}</div>
            <div class="success-stats">
              <div class="success-stat">
                <div class="success-stat-value">$${(this.progress.currentVolume / 1000000).toFixed(1)}M</div>
                <div class="success-stat-label">Total Volume</div>
              </div>
              <div class="success-stat">
                <div class="success-stat-value">${this.progress.currentMembers.toLocaleString()}</div>
                <div class="success-stat-label">Members</div>
              </div>
            </div>
          </div>
          <div class="proposal-preview">
            <div class="proposal-label">Next Steps</div>
            <p class="proposal-text">${this.progress.proposalPreview}</p>
          </div>
        </div>
      `;
      return;
    }
    
    const isNearThreshold = this.progress.percentage >= 80;
    const formattedCurrent = ThresholdService.formatValue(
      this.progress.current, 
      this.progress.type
    );
    
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div class="threshold-widget">
        <div class="widget-header">
          <div class="widget-title">
            <span class="cooperative-icon">🤝</span>
            <span>Cooperative Progress</span>
          </div>
          <div class="live-indicator">
            <span class="live-dot"></span>
            <span>LIVE</span>
          </div>
        </div>
        
        <div class="progress-section">
          <div class="progress-header">
            <span class="current-value ${formattedCurrent.length > 8 ? 'small' : ''}">${formattedCurrent}</span>
            <span class="target-value">Goal: ${this.progress.nextMilestone}</span>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar ${isNearThreshold ? 'near-threshold' : ''}" 
                 style="width: ${this.progress.percentage}%"></div>
            <span class="percentage-label">${this.progress.percentage}%</span>
          </div>
        </div>
        
        <div class="message-section">
          <p class="message-text">${this.progress.message}</p>
          ${this.progress.description ? `<p class="message-description">${this.progress.description}</p>` : ''}
        </div>
        
        <div class="proposal-preview">
          <div class="proposal-label">Collective Action</div>
          <p class="proposal-text">${this.progress.proposalPreview}</p>
        </div>
        
        <div class="widget-footer">
          <a href="#learn-more" class="learn-more-link">
            Learn More →
          </a>
          <button class="expand-button" id="expandBtn" title="View all milestones">
            ${this.isExpanded ? '▲' : '▼'}
          </button>
        </div>
        
        ${this.isExpanded ? this.renderThresholdsList() : ''}
      </div>
    `;
    
    this.attachEventListeners();
  }
  
  renderThresholdsList() {
    return `
      <div class="thresholds-list">
        <div class="threshold-item">
          <div class="threshold-status achieved">✓</div>
          <div class="threshold-info">
            <div class="threshold-name">Cooperative Launched</div>
            <div class="threshold-target">January 2025</div>
          </div>
        </div>
        <div class="threshold-item">
          <div class="threshold-status ${this.progress.percentage >= 50 ? 'achieved' : 'pending'}">
            ${this.progress.percentage >= 50 ? '✓' : '○'}
          </div>
          <div class="threshold-info">
            <div class="threshold-name">50% to Goal</div>
            <div class="threshold-target">$500,000 volume</div>
          </div>
        </div>
        <div class="threshold-item">
          <div class="threshold-status ${this.progress.percentage >= 100 ? 'achieved' : 'pending'}">
            ${this.progress.percentage >= 100 ? '✓' : '○'}
          </div>
          <div class="threshold-info">
            <div class="threshold-name">Collective Bargaining Power</div>
            <div class="threshold-target">$1,000,000 volume</div>
          </div>
        </div>
      </div>
    `;
  }
  
  attachEventListeners() {
    const expandBtn = this.shadowRoot.getElementById('expandBtn');
    if (expandBtn) {
      expandBtn.addEventListener('click', () => {
        this.isExpanded = !this.isExpanded;
        this.render();
      });
    }
  }
  
  renderError() {
    const styles = `
      :host {
        display: block;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      }
      .threshold-widget {
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        border: 1px solid rgba(239, 68, 68, 0.3);
        border-radius: 16px;
        padding: 1.5rem;
        color: #fff;
        max-width: 400px;
        text-align: center;
      }
      .retry-btn {
        background: rgba(34, 197, 94, 0.2);
        border: 1px solid rgba(34, 197, 94, 0.4);
        color: #22c55e;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        cursor: pointer;
        margin-top: 1rem;
        font-weight: 500;
      }
      .retry-btn:hover {
        background: rgba(34, 197, 94, 0.3);
      }
    `;
    
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div class="threshold-widget">
        <div class="error">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">⚠️</div>
          <div>Failed to load progress</div>
          <button class="retry-btn" id="retryBtn">Retry</button>
        </div>
      </div>
    `;
    
    const retryBtn = this.shadowRoot.getElementById('retryBtn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => this.loadProgress());
    }
  }
}

// Define the custom element
customElements.define('threshold-widget', ThresholdWidget);
