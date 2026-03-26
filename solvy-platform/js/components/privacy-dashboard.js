/**
 * SOLVY PWA - Privacy Dashboard Component
 * Phase 3: Anonymized Aggregated Metrics
 * 
 * Displays what data is stored locally vs what is shared
 * Provides transparency and user control over data
 */

class PrivacyDashboard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.metrics = null;
    this.localSummary = null;
    this.showAggregates = false;
  }
  
  static get observedAttributes() {
    return ['member-id'];
  }
  
  connectedCallback() {
    this.render();
    this.loadData();
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'member-id' && newValue) {
      AggregatedMetricsService.setMemberId(newValue);
      this.loadData();
    }
  }
  
  async loadData() {
    try {
      // Load local data summary
      this.localSummary = await AggregatedMetricsService.getLocalDataSummary();
      
      // Calculate current metrics
      this.metrics = await AggregatedMetricsService.calculateMetrics();
      
      this.render();
    } catch (error) {
      console.error('Failed to load privacy data:', error);
      this.renderError(error.message);
    }
  }
  
  render() {
    const styles = `
      :host {
        display: block;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      }
      
      .privacy-dashboard {
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        border: 1px solid rgba(34, 197, 94, 0.3);
        border-radius: 16px;
        padding: 1.5rem;
        color: #fff;
        max-width: 600px;
      }
      
      .dashboard-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1.5rem;
      }
      
      .dashboard-header h2 {
        margin: 0;
        font-size: 1.25rem;
        color: #22c55e;
      }
      
      .privacy-icon {
        font-size: 1.5rem;
      }
      
      .privacy-notice {
        background: rgba(34, 197, 94, 0.1);
        border: 1px solid rgba(34, 197, 94, 0.3);
        border-radius: 12px;
        padding: 1rem;
        margin-bottom: 1.5rem;
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
      }
      
      .privacy-notice-icon {
        font-size: 1.25rem;
        flex-shrink: 0;
      }
      
      .privacy-notice p {
        margin: 0;
        font-size: 0.9rem;
        color: #cbd5e1;
        line-height: 1.5;
      }
      
      .privacy-notice strong {
        color: #22c55e;
      }
      
      .data-section {
        margin-bottom: 1.5rem;
      }
      
      .data-section-title {
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #94a3b8;
        margin-bottom: 0.75rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      
      .data-card {
        background: rgba(30, 41, 59, 0.5);
        border-radius: 12px;
        padding: 1rem;
        border: 1px solid rgba(148, 163, 184, 0.2);
      }
      
      .data-card.local {
        border-color: rgba(34, 197, 94, 0.3);
      }
      
      .data-card.shared {
        border-color: rgba(59, 130, 246, 0.3);
      }
      
      .data-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 0;
        border-bottom: 1px solid rgba(148, 163, 184, 0.1);
      }
      
      .data-item:last-child {
        border-bottom: none;
      }
      
      .data-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #cbd5e1;
        font-size: 0.9rem;
      }
      
      .data-value {
        color: #22c55e;
        font-weight: 600;
        font-size: 0.9rem;
      }
      
      .data-value.shared {
        color: #60a5fa;
      }
      
      .status-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #22c55e;
      }
      
      .status-indicator.local {
        background: #22c55e;
      }
      
      .status-indicator.shared {
        background: #60a5fa;
      }
      
      .toggle-section {
        margin: 1.5rem 0;
      }
      
      .toggle-button {
        background: rgba(59, 130, 246, 0.2);
        border: 1px solid rgba(59, 130, 246, 0.4);
        color: #60a5fa;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.9rem;
        font-weight: 500;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        width: 100%;
        transition: all 0.2s;
      }
      
      .toggle-button:hover {
        background: rgba(59, 130, 246, 0.3);
      }
      
      .aggregates-preview {
        background: rgba(59, 130, 246, 0.1);
        border: 1px solid rgba(59, 130, 246, 0.2);
        border-radius: 12px;
        padding: 1rem;
        margin-top: 1rem;
        font-family: 'Courier New', monospace;
        font-size: 0.8rem;
        overflow-x: auto;
      }
      
      .aggregates-preview pre {
        margin: 0;
        color: #94a3b8;
      }
      
      .aggregates-preview code {
        color: #60a5fa;
      }
      
      .action-buttons {
        display: flex;
        gap: 0.75rem;
        margin-top: 1.5rem;
      }
      
      .btn {
        flex: 1;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        text-align: center;
        border: none;
      }
      
      .btn-primary {
        background: linear-gradient(135deg, #22c55e, #16a34a);
        color: white;
      }
      
      .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
      }
      
      .btn-secondary {
        background: rgba(148, 163, 184, 0.2);
        color: #cbd5e1;
        border: 1px solid rgba(148, 163, 184, 0.3);
      }
      
      .btn-secondary:hover {
        background: rgba(148, 163, 184, 0.3);
      }
      
      .last-sync {
        text-align: center;
        font-size: 0.8rem;
        color: #64748b;
        margin-top: 1rem;
      }
      
      .loading {
        text-align: center;
        padding: 2rem;
        color: #94a3b8;
      }
      
      .spinner {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 2px solid rgba(34, 197, 94, 0.3);
        border-top-color: #22c55e;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-right: 0.5rem;
      }
      
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    
    if (!this.localSummary) {
      this.shadowRoot.innerHTML = `
        <style>${styles}</style>
        <div class="privacy-dashboard">
          <div class="loading">
            <span class="spinner"></span>
            Loading privacy data...
          </div>
        </div>
      `;
      return;
    }
    
    const lastSync = AggregatedMetricsService.getLastSyncTime();
    const lastSyncText = lastSync 
      ? `Last synced: ${new Date(lastSync).toLocaleString()}`
      : 'Not yet synced';
    
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div class="privacy-dashboard">
        <div class="dashboard-header">
          <span class="privacy-icon">🔒</span>
          <h2>Privacy Dashboard</h2>
        </div>
        
        <div class="privacy-notice">
          <span class="privacy-notice-icon">📱</span>
          <p><strong>Your transaction history stays on your device.</strong> Only anonymized aggregates (totals and counts) are shared with the cooperative for collective bargaining power.</p>
        </div>
        
        <div class="data-section">
          <div class="data-section-title">
            <span class="status-indicator local"></span>
            Stored Locally (Private)
          </div>
          <div class="data-card local">
            <div class="data-item">
              <span class="data-label">📊 Transactions</span>
              <span class="data-value">${this.localSummary.localTransactionCount}</span>
            </div>
            <div class="data-item">
              <span class="data-label">💾 Storage Used</span>
              <span class="data-value">${this.localSummary.localStorageUsed}</span>
            </div>
            <div class="data-item">
              <span class="data-label">🏪 Merchant Names</span>
              <span class="data-value">Private ✓</span>
            </div>
            <div class="data-item">
              <span class="data-label">💳 Transaction Details</span>
              <span class="data-value">Private ✓</span>
            </div>
          </div>
        </div>
        
        <div class="data-section">
          <div class="data-section-title">
            <span class="status-indicator shared"></span>
            Shared with Cooperative (Aggregates Only)
          </div>
          <div class="data-card shared">
            <div class="data-item">
              <span class="data-label">📈 Total Volume</span>
              <span class="data-value shared">${this.metrics ? `$${this.metrics.totalVolume.toLocaleString()}` : '—'}</span>
            </div>
            <div class="data-item">
              <span class="data-label">🔢 Transaction Count</span>
              <span class="data-value shared">${this.metrics ? this.metrics.transactionCount.toLocaleString() : '—'}</span>
            </div>
            <div class="data-item">
              <span class="data-label">🏷️ Category Totals</span>
              <span class="data-value shared">${this.metrics ? Object.keys(this.metrics.categorySums).length + ' categories' : '—'}</span>
            </div>
            <div class="data-item">
              <span class="data-label">🔐 Your ID</span>
              <span class="data-value shared">Anonymized Hash</span>
            </div>
          </div>
        </div>
        
        <div class="toggle-section">
          <button class="toggle-button" id="toggleAggregates">
            ${this.showAggregates ? '🔼 Hide' : '🔽 View'} Aggregated Data Preview
          </button>
          ${this.showAggregates && this.metrics ? `
            <div class="aggregates-preview">
              <pre><code>${JSON.stringify({
                totalVolume: this.metrics.totalVolume,
                transactionCount: this.metrics.transactionCount,
                categorySums: this.metrics.categorySums,
                memberHash: this.metrics.memberHash.substring(0, 16) + '...'
              }, null, 2)}</code></pre>
            </div>
          ` : ''}
        </div>
        
        <div class="action-buttons">
          <button class="btn btn-primary" id="downloadData">
            📥 Download My Data
          </button>
          <button class="btn btn-secondary" id="syncNow">
            🔄 Sync Now
          </button>
        </div>
        
        <div class="last-sync">${lastSyncText}</div>
      </div>
    `;
    
    this.attachEventListeners();
  }
  
  attachEventListeners() {
    const toggleBtn = this.shadowRoot.getElementById('toggleAggregates');
    const downloadBtn = this.shadowRoot.getElementById('downloadData');
    const syncBtn = this.shadowRoot.getElementById('syncNow');
    
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        this.showAggregates = !this.showAggregates;
        this.render();
      });
    }
    
    if (downloadBtn) {
      downloadBtn.addEventListener('click', async () => {
        downloadBtn.textContent = '⏳ Preparing...';
        await AggregatedMetricsService.downloadPersonalData();
        downloadBtn.textContent = '✅ Downloaded!';
        setTimeout(() => {
          downloadBtn.textContent = '📥 Download My Data';
        }, 2000);
      });
    }
    
    if (syncBtn) {
      syncBtn.addEventListener('click', async () => {
        syncBtn.textContent = '⏳ Syncing...';
        const result = await AggregatedMetricsService.syncToCentralAPI();
        if (result.success) {
          syncBtn.textContent = '✅ Synced!';
        } else {
          syncBtn.textContent = '❌ Failed';
        }
        setTimeout(() => {
          syncBtn.textContent = '🔄 Sync Now';
          this.render();
        }, 2000);
      });
    }
  }
  
  renderError(message) {
    const styles = `
      :host {
        display: block;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      }
      .error {
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.3);
        border-radius: 12px;
        padding: 1.5rem;
        color: #fff;
        text-align: center;
      }
      .error-icon {
        font-size: 2rem;
        margin-bottom: 0.5rem;
      }
    `;
    
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div class="error">
        <div class="error-icon">⚠️</div>
        <p>Failed to load privacy dashboard</p>
        <p style="color: #94a3b8; font-size: 0.9rem;">${message}</p>
      </div>
    `;
  }
}

// Define the custom element
customElements.define('privacy-dashboard', PrivacyDashboard);
