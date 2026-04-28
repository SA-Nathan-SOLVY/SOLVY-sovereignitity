/**
 * MAN Dashboard Controller
 * Connects manDB.js to the MAN Portal UI
 * SOLVY Ecosystem™ — Real-time member dashboard
 */

class MANDashboard {
  constructor() {
    this.db = null;
    this.refreshInterval = null;
    this.currentPage = 'dashboard';
  }

  async init() {
    // Wait for database to be ready
    if (window.manDB && window.manDB.isReady) {
      this.db = window.manDB;
    } else {
      window.addEventListener('MANDBReady', (e) => {
        this.db = e.detail;
        this.loadCurrentPage();
      });
      return;
    }
    
    this.loadCurrentPage();
    this.startAutoRefresh();
  }

  // ============================================================================
  // PAGE RENDERERS
  // ============================================================================

  async renderDashboard() {
    const metrics = await this.db.getMetrics();
    const proposals = await this.db.getProposals('active');
    const recentTx = await this.db.getTransactions({ limit: 5 });

    return `
      <div class="top-bar">
        <div class="page-title">
          <h1>Member Dashboard</h1>
          <p>Welcome back. Your cooperative's financial health in real-time.</p>
        </div>
        <div class="member-badge">🪪 Member since ${new Date().getFullYear()}</div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-title">MEMBER POOL (70%)</div>
          <div class="stat-amount">${this.formatUSD(metrics.total_member_pool)}</div>
          <div class="stat-change">Your share of interchange</div>
        </div>
        <div class="stat-card">
          <div class="stat-title">OPERATIONS (20%)</div>
          <div class="stat-amount">${this.formatUSD(metrics.total_operations_pool)}</div>
          <div>Running the cooperative</div>
        </div>
        <div class="stat-card">
          <div class="stat-title">SOVEREIGN FUND (10%)</div>
          <div class="stat-amount">${this.formatUSD(metrics.total_sovereign_pool)}</div>
          <div>Emergency reserve</div>
        </div>
        <div class="stat-card">
          <div class="stat-title">TOTAL VOLUME</div>
          <div class="stat-amount">${this.formatUSD(metrics.total_volume)}</div>
          <div class="stat-change">${metrics.transaction_count} transactions</div>
        </div>
      </div>

      <div class="section-header">
        <h2>🗳️ Active Proposals</h2>
        <a href="#" onclick="switchPage('proposals'); return false;">View all →</a>
      </div>
      ${proposals.length > 0 ? proposals.map(p => this.renderProposalCard(p)).join('') : 
        '<p style="color: #94a3b8; padding: 1rem;">No active proposals. Threshold not yet reached.</p>'}

      <div class="section-header">
        <h2>📈 Recent Activity</h2>
        <a href="#" onclick="switchPage('transactions'); return false;">View all →</a>
      </div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr><th>Date</th><th>Merchant</th><th>Amount</th><th>Status</th></tr>
          </thead>
          <tbody>
            ${recentTx.length > 0 ? recentTx.map(tx => `
              <tr>
                <td>${new Date(tx.timestamp).toLocaleDateString()}</td>
                <td>${tx.merchant}</td>
                <td>${this.formatUSD(tx.amount)}</td>
                <td><span class="status-badge">${tx.status}</span></td>
              </tr>
            `).join('') : 
            '<tr><td colspan="4" style="text-align:center; color:#5a6e7c;">No transactions yet. Start using your SOLVY Card!</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  }

  async renderTransactions() {
    const transactions = await this.db.getTransactions();
    
    return `
      <div class="top-bar">
        <div class="page-title">
          <h1>Transaction History</h1>
          <p>Your spending, stored securely on this device.</p>
        </div>
        <div>
          <button class="btn-outline" onclick="exportTransactions()">Export CSV</button>
        </div>
      </div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr><th>Date</th><th>Merchant</th><th>Amount</th><th>Status</th></tr>
          </thead>
          <tbody>
            ${transactions.map(tx => `
              <tr>
                <td>${new Date(tx.timestamp).toLocaleDateString()}</td>
                <td>${tx.merchant}</td>
                <td>${this.formatUSD(tx.amount)}</td>
                <td><span class="status-badge">${tx.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  async renderProposals() {
    const proposals = await this.db.getProposals();
    
    return `
      <div class="top-bar">
        <div class="page-title">
          <h1>Proposals & Voting</h1>
          <p>Every member has a voice. Every vote matters.</p>
        </div>
      </div>
      ${proposals.map(p => this.renderProposalCard(p, true)).join('')}
    `;
  }

  async renderAuditLog() {
    const entries = await this.db.getAuditLog();
    
    return `
      <div class="top-bar">
        <div class="page-title">
          <h1>Audit Log (Immutable)</h1>
          <p>Every allocation, vote, and settlement — permanently recorded on your device.</p>
        </div>
      </div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr><th>Timestamp</th><th>Action</th><th>Amount</th><th>Hash</th></tr>
          </thead>
          <tbody>
            ${entries.map(entry => `
              <tr>
                <td>${new Date(entry.timestamp).toLocaleString()}</td>
                <td>${entry.action}</td>
                <td>${entry.amount ? this.formatUSD(entry.amount) : '—'}</td>
                <td class="audit-entry">${entry.hash}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // ============================================================================
  // COMPONENT RENDERERS
  // ============================================================================

  renderProposalCard(proposal, full = false) {
    // Calculate threshold progress
    const metrics = { total_volume: 0 }; // Would need async, simplified for now
    const progress = proposal.threshold_value ? 
      Math.min(100, (metrics.total_volume / proposal.threshold_value) * 100) : 0;
    
    return `
      <div class="proposal-card">
        <div class="proposal-title">${proposal.title}</div>
        <div class="proposal-meta">
          <span>📅 Ends ${new Date(proposal.vote_end).toLocaleDateString()}</span>
          <span>🏁 Threshold: ${this.formatUSD(proposal.threshold_value)}</span>
        </div>
        ${full ? `<p style="color: #5a6e7c; margin-bottom: 1rem;">${proposal.description}</p>` : ''}
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
        <div class="button-group">
          <button class="btn-primary" onclick="castVote('${proposal.id}', 'Yes')">Vote Yes</button>
          <button class="btn-outline" onclick="castVote('${proposal.id}', 'No')">Vote No</button>
        </div>
      </div>
    `;
  }

  // ============================================================================
  // ACTIONS
  // ============================================================================

  async castVote(proposalId, vote) {
    try {
      // In real implementation, memberHash would come from auth
      const memberHash = 'demo_member_' + Math.random().toString(36).substr(2, 9);
      await this.db.castVote(proposalId, memberHash, vote);
      alert('Vote recorded! Thank you for participating in cooperative governance.');
      this.loadCurrentPage();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  }

  async addDemoTransaction(amount, merchant) {
    await this.db.addTransaction({
      amount: amount,
      merchant: merchant,
      status: 'settled'
    });
    await this.db.processTransactionMetrics(amount);
    this.loadCurrentPage();
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  formatUSD(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  }

  loadCurrentPage() {
    const renderer = {
      'dashboard': () => this.renderDashboard(),
      'transactions': () => this.renderTransactions(),
      'proposals': () => this.renderProposals(),
      'audit': () => this.renderAuditLog()
    }[this.currentPage];

    if (renderer) {
      renderer().then(html => {
        document.getElementById('pageRenderer').innerHTML = html;
      });
    }
  }

  startAutoRefresh() {
    // Refresh every 30 seconds
    this.refreshInterval = setInterval(() => {
      this.loadCurrentPage();
    }, 30000);
  }

  switchPage(pageId) {
    this.currentPage = pageId;
    this.loadCurrentPage();
    
    // Update nav
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelector(`.nav-item[data-page="${pageId}"]`)?.classList.add('active');
  }
}

// Create global instance
const manDashboard = new MANDashboard();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  manDashboard.init();
});

// Global functions for onclick handlers
window.switchPage = (pageId) => manDashboard.switchPage(pageId);
window.castVote = (proposalId, vote) => manDashboard.castVote(proposalId, vote);
window.exportTransactions = () => {
  alert('Export feature coming soon — will generate CSV of local transaction data');
};
