/**
 * Data Preview Component
 * Educational component showing user exactly what data will be contributed
 * Visual comparison between actual transactions and shared data
 */

class DataPreview extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.sampleTransactions = [
      { id: 'TX-001', merchant: 'ABC Supply Co.', amount: 245.50, category: 'Supplies', date: '2024-01-15 14:30:22' },
      { id: 'TX-002', merchant: 'City Hardware', amount: 89.99, category: 'Tools', date: '2024-01-16 09:15:47' },
      { id: 'TX-003', merchant: 'ABC Supply Co.', amount: 156.75, category: 'Supplies', date: '2024-01-18 16:45:12' },
      { id: 'TX-004', merchant: 'Express Shipping', amount: 45.00, category: 'Shipping', date: '2024-01-19 11:20:33' }
    ];
    
    this.aggregatedData = {
      categorySums: { Supplies: 402.25, Tools: 89.99, Shipping: 45.00 },
      totalVolume: 537.24,
      transactionCount: 4,
      averageTransaction: 134.31,
      geographicRegion: 'Texas',
      timeBucket: 'January 2024'
    };
    
    this.activeTab = 'comparison'; // comparison, technical, privacy
  }
  
  static get observedAttributes() {
    return ['show-sample-data', 'compact'];
  }
  
  connectedCallback() {
    this.render();
  }
  
  setTab(tab) {
    this.activeTab = tab;
    this.render();
  }
  
  render() {
    const isCompact = this.hasAttribute('compact');
    
    const styles = `
      :host {
        display: block;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .preview-container {
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        border: 1px solid rgba(34, 197, 94, 0.2);
        border-radius: 16px;
        overflow: hidden;
        color: #fff;
      }
      
      .preview-header {
        background: rgba(34, 197, 94, 0.1);
        padding: 1rem 1.25rem;
        border-bottom: 1px solid rgba(34, 197, 94, 0.2);
      }
      
      .preview-title {
        font-size: ${isCompact ? '1rem' : '1.1rem'};
        font-weight: 700;
        color: #22c55e;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      
      .preview-subtitle {
        font-size: 0.85rem;
        color: #94a3b8;
        margin: 0.25rem 0 0 0;
      }
      
      .tab-nav {
        display: flex;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(30, 41, 59, 0.5);
      }
      
      .tab-button {
        flex: 1;
        padding: 0.875rem;
        background: none;
        border: none;
        color: #94a3b8;
        font-size: 0.85rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        border-bottom: 2px solid transparent;
      }
      
      .tab-button:hover {
        color: #fff;
        background: rgba(255, 255, 255, 0.05);
      }
      
      .tab-button.active {
        color: #22c55e;
        border-bottom-color: #22c55e;
      }
      
      .tab-content {
        padding: ${isCompact ? '1rem' : '1.5rem'};
      }
      
      /* Comparison Tab Styles */
      .comparison-section {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: ${isCompact ? '0.75rem' : '1rem'};
      }
      
      .data-panel {
        background: rgba(30, 41, 59, 0.5);
        border-radius: 12px;
        overflow: hidden;
      }
      
      .panel-header {
        padding: 0.75rem 1rem;
        font-weight: 600;
        font-size: 0.85rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      
      .data-panel.private .panel-header {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
      }
      
      .data-panel.private {
        border: 1px solid rgba(239, 68, 68, 0.2);
      }
      
      .data-panel.shared .panel-header {
        background: rgba(34, 197, 94, 0.1);
        color: #22c55e;
      }
      
      .data-panel.shared {
        border: 1px solid rgba(34, 197, 94, 0.2);
      }
      
      .panel-content {
        padding: 1rem;
      }
      
      .transaction-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      
      .transaction-item {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 8px;
        padding: 0.625rem;
        font-size: 0.8rem;
      }
      
      .transaction-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.25rem;
      }
      
      .transaction-merchant {
        font-weight: 600;
        color: #fff;
      }
      
      .transaction-amount {
        color: #22c55e;
        font-weight: 600;
      }
      
      .transaction-meta {
        color: #64748b;
        font-size: 0.75rem;
      }
      
      .redacted {
        background: #ef4444;
        color: #ef4444;
        border-radius: 3px;
        padding: 0 4px;
        user-select: none;
      }
      
      .aggregated-data {
        display: grid;
        gap: 0.75rem;
      }
      
      .metric-card {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 8px;
        padding: 0.75rem;
      }
      
      .metric-label {
        font-size: 0.75rem;
        color: #64748b;
        margin-bottom: 0.25rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .metric-value {
        font-size: 1.1rem;
        font-weight: 700;
        color: #fff;
      }
      
      .category-bars {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-top: 0.75rem;
      }
      
      .category-bar {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      
      .category-name {
        font-size: 0.75rem;
        color: #94a3b8;
        width: 70px;
      }
      
      .category-track {
        flex: 1;
        height: 20px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        overflow: hidden;
      }
      
      .category-fill {
        height: 100%;
        background: linear-gradient(90deg, #22c55e, #16a34a);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding-right: 0.5rem;
        font-size: 0.7rem;
        font-weight: 600;
        color: white;
      }
      
      .arrow-indicator {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        color: #22c55e;
        padding: 0.5rem;
      }
      
      /* Technical Tab Styles */
      .technical-section {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      
      .process-step {
        display: flex;
        gap: 1rem;
        align-items: flex-start;
      }
      
      .step-number {
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, #22c55e, #16a34a);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 0.9rem;
        flex-shrink: 0;
      }
      
      .step-content h4 {
        margin: 0 0 0.25rem 0;
        font-size: 0.95rem;
        color: #fff;
      }
      
      .step-content p {
        margin: 0;
        font-size: 0.85rem;
        color: #94a3b8;
        line-height: 1.5;
      }
      
      .code-block {
        background: #0f172a;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 1rem;
        font-family: 'Monaco', 'Menlo', monospace;
        font-size: 0.8rem;
        color: #a5b4fc;
        overflow-x: auto;
        margin-top: 0.5rem;
      }
      
      /* Privacy Tab Styles */
      .privacy-section {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      
      .privacy-guarantee {
        display: flex;
        gap: 1rem;
        align-items: flex-start;
        padding: 1rem;
        background: rgba(34, 197, 94, 0.05);
        border: 1px solid rgba(34, 197, 94, 0.2);
        border-radius: 10px;
      }
      
      .guarantee-icon {
        font-size: 1.5rem;
        flex-shrink: 0;
      }
      
      .guarantee-content h4 {
        margin: 0 0 0.25rem 0;
        font-size: 0.95rem;
        color: #22c55e;
      }
      
      .guarantee-content p {
        margin: 0;
        font-size: 0.85rem;
        color: #94a3b8;
        line-height: 1.5;
      }
      
      .privacy-matrix {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.85rem;
        margin-top: 0.5rem;
      }
      
      .privacy-matrix th,
      .privacy-matrix td {
        padding: 0.75rem;
        text-align: left;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .privacy-matrix th {
        color: #94a3b8;
        font-weight: 500;
        text-transform: uppercase;
        font-size: 0.75rem;
        letter-spacing: 0.5px;
      }
      
      .privacy-matrix td {
        color: #cbd5e1;
      }
      
      .status-icon {
        font-size: 1.2rem;
      }
      
      .educational-note {
        background: rgba(147, 51, 234, 0.1);
        border: 1px solid rgba(147, 51, 234, 0.3);
        border-radius: 10px;
        padding: 1rem;
        margin-top: 1rem;
      }
      
      .educational-note h4 {
        margin: 0 0 0.5rem 0;
        color: #a78bfa;
        font-size: 0.9rem;
      }
      
      .educational-note p {
        margin: 0;
        font-size: 0.85rem;
        color: #94a3b8;
        line-height: 1.5;
      }
      
      @media (max-width: 640px) {
        .comparison-section {
          grid-template-columns: 1fr;
        }
        
        .arrow-indicator {
          transform: rotate(90deg);
          padding: 0.25rem;
        }
      }
    `;
    
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div class="preview-container">
        <div class="preview-header">
          <h3 class="preview-title">🔒 Data Privacy Preview</h3>
          <p class="preview-subtitle">See exactly what data is shared and how it's protected</p>
        </div>
        
        <div class="tab-nav">
          <button class="tab-button ${this.activeTab === 'comparison' ? 'active' : ''}" 
                  onclick="this.closest('data-preview').setTab('comparison')">
            Visual Comparison
          </button>
          <button class="tab-button ${this.activeTab === 'technical' ? 'active' : ''}" 
                  onclick="this.closest('data-preview').setTab('technical')">
            How It Works
          </button>
          <button class="tab-button ${this.activeTab === 'privacy' ? 'active' : ''}" 
                  onclick="this.closest('data-preview').setTab('privacy')">
            Privacy Guarantees
          </button>
        </div>
        
        <div class="tab-content">
          ${this.renderTabContent()}
        </div>
      </div>
    `;
  }
  
  renderTabContent() {
    switch (this.activeTab) {
      case 'comparison':
        return this.renderComparisonTab();
      case 'technical':
        return this.renderTechnicalTab();
      case 'privacy':
        return this.renderPrivacyTab();
      default:
        return '';
    }
  }
  
  renderComparisonTab() {
    const maxCategory = Math.max(...Object.values(this.aggregatedData.categorySums));
    
    return `
      <div class="comparison-section">
        <div class="data-panel private">
          <div class="panel-header">
            ❌ Your Actual Transactions (Private)
          </div>
          <div class="panel-content">
            <div class="transaction-list">
              ${this.sampleTransactions.map(tx => `
                <div class="transaction-item">
                  <div class="transaction-header">
                    <span class="transaction-merchant">${tx.merchant}</span>
                    <span class="transaction-amount">$${tx.amount.toFixed(2)}</span>
                  </div>
                  <div class="transaction-meta">
                    ${tx.category} • ${tx.date} • ID: ${tx.id}
                  </div>
                </div>
              `).join('')}
            </div>
            <div class="educational-note" style="margin-top: 1rem;">
              <h4>🛡️ Stays on Your Device</h4>
              <p>Individual transaction details never leave your device. They are used only to calculate aggregates.</p>
            </div>
          </div>
        </div>
        
        <div class="arrow-indicator">→</div>
        
        <div class="data-panel shared">
          <div class="panel-header">
            ✅ What We Share (Aggregated)
          </div>
          <div class="panel-content">
            <div class="aggregated-data">
              <div class="metric-card">
                <div class="metric-label">Total Volume</div>
                <div class="metric-value">$${this.aggregatedData.totalVolume.toFixed(2)}</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Transaction Count</div>
                <div class="metric-value">${this.aggregatedData.transactionCount}</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Average Amount</div>
                <div class="metric-value">$${this.aggregatedData.averageTransaction.toFixed(2)}</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Region</div>
                <div class="metric-value">${this.aggregatedData.geographicRegion}</div>
              </div>
              
              <div style="margin-top: 0.5rem;">
                <div class="metric-label">By Category</div>
                <div class="category-bars">
                  ${Object.entries(this.aggregatedData.categorySums).map(([category, amount]) => {
                    const percentage = (amount / maxCategory * 100).toFixed(0);
                    return `
                      <div class="category-bar">
                        <span class="category-name">${category}</span>
                        <div class="category-track">
                          <div class="category-fill" style="width: ${percentage}%">
                            $${amount.toFixed(0)}
                          </div>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  renderTechnicalTab() {
    return `
      <div class="technical-section">
        <div class="process-step">
          <div class="step-number">1</div>
          <div class="step-content">
            <h4>Aggregate on Your Device</h4>
            <p>Your transactions are summarized into metrics (totals, averages, counts) locally. Individual records are immediately discarded.</p>
            <div class="code-block">
// Pseudocode - runs on your device
const myTransactions = getLocalTransactions();
const aggregated = {
  totalVolume: sum(myTransactions.map(t => t.amount)),
  categoryTotals: groupBy(myTransactions, 'category'),
  count: myTransactions.length
};
// Original transactions are NOT included
            </div>
          </div>
        </div>
        
        <div class="process-step">
          <div class="step-number">2</div>
          <div class="step-content">
            <h4>Sanitize & Validate</h4>
            <p>The aggregated data is checked for any potentially identifying information. If any PII patterns are detected, the contribution is rejected.</p>
          </div>
        </div>
        
        <div class="process-step">
          <div class="step-number">3</div>
          <div class="step-content">
            <h4>Encrypt with AES-256-GCM</h4>
            <p>The sanitized data is encrypted using industry-standard AES-256-GCM encryption with a key known only to you and the cooperative manager.</p>
            <div class="code-block">
// Encryption happens in your browser
const encrypted = await crypto.subtle.encrypt(
  { name: 'AES-GCM', iv: randomBytes(12) },
  poolKey,
  JSON.stringify(aggregatedData)
);
            </div>
          </div>
        </div>
        
        <div class="process-step">
          <div class="step-number">4</div>
          <div class="step-content">
            <h4>Transmit Encrypted Blob</h4>
            <p>Only the encrypted data (unreadable without the key) is sent to the server. Even if intercepted, your data remains private.</p>
          </div>
        </div>
        
        <div class="process-step">
          <div class="step-number">5</div>
          <div class="step-content">
            <h4>Auto-Delete After 30 Days</h4>
            <p>The encrypted data is automatically and permanently deleted after 30 days. No backups are kept.</p>
          </div>
        </div>
      </div>
    `;
  }
  
  renderPrivacyTab() {
    return `
      <div class="privacy-section">
        <div class="privacy-guarantee">
          <span class="guarantee-icon">🔐</span>
          <div class="guarantee-content">
            <h4>End-to-End Encryption</h4>
            <p>Data is encrypted on your device before transmission. The server only stores encrypted blobs that cannot be read without your key.</p>
          </div>
        </div>
        
        <div class="privacy-guarantee">
          <span class="guarantee-icon">🎭</span>
          <div class="guarantee-content">
            <h4>No Link to Identity</h4>
            <p>Your member ID is hashed (SHA-256) before any server communication. There's no way to link your data contribution to your vote or identity.</p>
          </div>
        </div>
        
        <div class="privacy-guarantee">
          <span class="guarantee-icon">⏱️</span>
          <div class="guarantee-content">
            <h4>Temporary by Design</h4>
            <p>All contributed data has a built-in 30-day expiration. After that, it's permanently deleted with no option for recovery.</p>
          </div>
        </div>
        
        <div class="privacy-guarantee">
          <span class="guarantee-icon">📋</span>
          <div class="guarantee-content">
            <h4>Transparent & Auditable</h4>
            <p>You can see exactly what data will be shared before contributing. All operations are logged in an immutable audit trail.</p>
          </div>
        </div>
        
        <table class="privacy-matrix">
          <thead>
            <tr>
              <th>Data Element</th>
              <th>Shared?</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Transaction amounts</td>
              <td><span class="status-icon">❌</span></td>
              <td>Only aggregated totals</td>
            </tr>
            <tr>
              <td>Merchant names</td>
              <td><span class="status-icon">❌</span></td>
              <td>Never collected</td>
            </tr>
            <tr>
              <td>Exact timestamps</td>
              <td><span class="status-icon">❌</span></td>
              <td>Converted to month/year only</td>
            </tr>
            <tr>
              <td>Category totals</td>
              <td><span class="status-icon">✅</span></td>
              <td>Sum per category</td>
            </tr>
            <tr>
              <td>Transaction counts</td>
              <td><span class="status-icon">✅</span></td>
              <td>Total number only</td>
            </tr>
            <tr>
              <td>Average amounts</td>
              <td><span class="status-icon">✅</span></td>
              <td>Calculated statistic</td>
            </tr>
            <tr>
              <td>Geographic region</td>
              <td><span class="status-icon">✅</span></td>
              <td>State/country level only</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }
}

// Define the custom element
customElements.define('data-preview', DataPreview);
