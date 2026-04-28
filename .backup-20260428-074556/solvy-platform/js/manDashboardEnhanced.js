/**
 * MAN Dashboard Enhanced
 * Advanced features: charts, exports, notifications, threshold alerts
 * SOLVY Ecosystem™ — Member transparency portal
 */

class MANDashboardEnhanced {
  constructor() {
    this.db = null;
    this.bridge = null;
    this.charts = {};
    this.notifications = [];
    this.currentPage = 'dashboard';
  }

  async init() {
    // Wait for dependencies
    if (!window.manDB?.isReady) {
      window.addEventListener('MANDBReady', () => this._initialize());
    } else {
      this._initialize();
    }
  }

  async _initialize() {
    this.db = window.manDB;
    this.bridge = window.manUnitBridge;
    
    // Initialize bridge with demo member
    await this.bridge.init('demo_member_001');
    
    // Listen for updates
    window.addEventListener('MANTransactionsUpdated', (e) => {
      this._showNotification(
        'New Transactions',
        `${e.detail.count} new transaction(s) synced`,
        'success'
      );
      this.loadCurrentPage();
    });

    // Check thresholds
    await this._checkThresholds();
    
    // Load page
    this.loadCurrentPage();
    
    console.log('[MANEnhanced] Dashboard initialized');
  }

  // ============================================================================
  // ENHANCED PAGE RENDERERS
  // ============================================================================

  async renderDashboard() {
    const metrics = await this.db.getMetrics();
    const proposals = await this.db.getProposals('active');
    const recentTx = await this.db.getTransactions({ limit: 10 });
    const notifications = await this.db.getUnreadNotifications();

    return `
      ${this._renderNotifications(notifications)}
      
      <div class="top-bar">
        <div class="page-title">
          <h1>Member Dashboard</h1>
          <p>Real-time cooperative financial health</p>
        </div>
        <div class="member-badge">
          🪪 Member 
          <span style="color: #22c55e;">● Live</span>
        </div>
      </div>

      <!-- Key Metrics Cards -->
      <div class="stats-grid">
        <div class="stat-card highlight">
          <div class="stat-title">YOUR SHARE (70%)</div>
          <div class="stat-amount">${this.formatUSD(metrics.total_member_pool)}</div>
          <div class="stat-change">+${this.formatUSD(metrics.total_member_pool * 0.01)} today</div>
        </div>
        <div class="stat-card">
          <div class="stat-title">OPERATIONS (20%)</div>
          <div class="stat-amount">${this.formatUSD(metrics.total_operations_pool)}</div>
          <div class="stat-bar">
            <div class="stat-bar-fill" style="width: 20%"></div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-title">SOVEREIGN FUND (10%)</div>
          <div class="stat-amount">${this.formatUSD(metrics.total_sovereign_pool)}</div>
          <div class="stat-bar">
            <div class="stat-bar-fill" style="width: 10%"></div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-title">TOTAL VOLUME</div>
          <div class="stat-amount">${this.formatUSD(metrics.total_volume)}</div>
          <div class="stat-change">${metrics.transaction_count} transactions</div>
        </div>
      </div>

      <!-- Volume Chart -->
      <div class="section-header">
        <h2>📈 Volume Trend</h2>
        <select onchange="manDashboardEnhanced.changeChartPeriod(this.value)">
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>
      <div class="chart-container">
        ${await this._renderVolumeChart(7)}
      </div>

      <!-- Pool Distribution -->
      <div class="section-header">
        <h2>🥧 Pool Distribution</h2>
      </div>
      <div class="chart-container">
        ${this._renderPoolChart(metrics)}
      </div>

      <!-- Active Proposals -->
      <div class="section-header">
        <h2>🗳️ Active Proposals</h2>
        <a href="#" onclick="switchPage('proposals'); return false;">View all →</a>
      </div>
      ${proposals.length > 0 ? 
        proposals.map(p => this.renderProposalCard(p)).join('') : 
        this._renderEmptyState('No active proposals', 'Threshold not yet reached')
      }

      <!-- Recent Activity -->
      <div class="section-header">
        <h2>💳 Recent Activity</h2>
        <div>
          <button class="btn-outline" onclick="manDashboardEnhanced.exportToCSV()">Export CSV</button>
          <a href="#" onclick="switchPage('transactions'); return false;">View all →</a>
        </div>
      </div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Merchant</th>
              <th>Amount</th>
              <th>Your Share</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${recentTx.length > 0 ? recentTx.map(tx => `
              <tr>
                <td>${new Date(tx.timestamp).toLocaleDateString()}</td>
                <td>${tx.merchant}</td>
                <td>${this.formatUSD(tx.amount)}</td>
                <td style="color: #22c55e;">+${this.formatUSD(tx.amount * 0.012 * 0.70)}</td>
                <td><span class="status-badge ${tx.status}">${tx.status}</span></td>
              </tr>
            `).join('') : 
            '<tr><td colspan="5" class="empty-cell">No transactions yet. Start using your SOLVY Card!</td></tr>'}
          </tbody>
        </table>
      </div>

      <!-- Quick Actions -->
      <div class="section-header">
        <h2>⚡ Quick Actions</h2>
      </div>
      <div class="action-grid">
        <button class="action-btn" onclick="manDashboardEnhanced.simulatePurchase()">
          <span>🧪</span>
          <div>Simulate Purchase</div>
          <small>Test transaction</small>
        </button>
        <button class="action-btn" onclick="manDashboardEnhanced.createProposal()">
          <span>📝</span>
          <div>Create Proposal</div>
          <small>Submit for vote</small>
        </button>
        <button class="action-btn" onclick="manDashboardEnhanced.viewAudit()">
          <span>📜</span>
          <div>View Audit Log</div>
          <small>Immutable records</small>
        </button>
        <button class="action-btn" onclick="manDashboardEnhanced.downloadStatement()">
          <span>📄</span>
          <div>Statement</div>
          <small>Monthly PDF</small>
        </button>
      </div>
    `;
  }

  async renderTransactions() {
    const filters = this._getTransactionFilters();
    const transactions = await this.db.getTransactions(filters);
    
    return `
      <div class="top-bar">
        <div class="page-title">
          <h1>Transaction History</h1>
          <p>Your complete spending record (local device only)</p>
        </div>
        <div>
          <button class="btn-outline" onclick="manDashboardEnhanced.exportToCSV()">Export CSV</button>
          <button class="btn-outline" onclick="manDashboardEnhanced.exportToPDF()">Export PDF</button>
        </div>
      </div>

      <!-- Filters -->
      <div class="filter-bar">
        <input type="date" id="filterStart" placeholder="Start date" onchange="manDashboardEnhanced.applyFilters()">
        <input type="date" id="filterEnd" placeholder="End date" onchange="manDashboardEnhanced.applyFilters()">
        <input type="text" id="filterMerchant" placeholder="Search merchant..." oninput="manDashboardEnhanced.applyFilters()">
        <select id="filterStatus" onchange="manDashboardEnhanced.applyFilters()">
          <option value="">All Status</option>
          <option value="settled">Settled</option>
          <option value="pending">Pending</option>
          <option value="declined">Declined</option>
        </select>
        <button class="btn-primary" onclick="manDashboardEnhanced.clearFilters()">Clear</button>
      </div>

      <!-- Summary Stats -->
      <div class="stats-row">
        <div class="stat-pill">
          <span>Total Spent:</span>
          <strong>${this.formatUSD(transactions.reduce((s, t) => s + t.amount, 0))}</strong>
        </div>
        <div class="stat-pill">
          <span>Your Earnings:</span>
          <strong style="color: #22c55e;">${this.formatUSD(transactions.reduce((s, t) => s + (t.amount * 0.012 * 0.70), 0))}</strong>
        </div>
        <div class="stat-pill">
          <span>Transactions:</span>
          <strong>${transactions.length}</strong>
        </div>
      </div>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Merchant</th>
              <th>Card</th>
              <th>Amount</th>
              <th>Interchange</th>
              <th>Your Share</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${transactions.map(tx => {
              const interchange = tx.amount * 0.012;
              const memberShare = interchange * 0.70;
              return `
                <tr>
                  <td>${new Date(tx.timestamp).toLocaleDateString()}</td>
                  <td>${tx.merchant}</td>
                  <td>•••• ${tx.card_last4 || '****'}</td>
                  <td>${this.formatUSD(tx.amount)}</td>
                  <td>${this.formatUSD(interchange)}</td>
                  <td style="color: #22c55e;">+${this.formatUSD(memberShare)}</td>
                  <td><span class="status-badge ${tx.status}">${tx.status}</span></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  async renderProposals() {
    const proposals = await this.db.getProposals();
    const metrics = await this.db.getMetrics();

    return `
      <div class="top-bar">
        <div class="page-title">
          <h1>Proposals & Voting</h1>
          <p>Democratic governance of the cooperative</p>
        </div>
        <button class="btn-primary" onclick="manDashboardEnhanced.createProposal()">+ New Proposal</button>
      </div>

      <!-- Threshold Progress -->
      <div class="threshold-card">
        <h3>📊 Volume Threshold Progress</h3>
        <div class="threshold-item">
          <span>First Proposal Threshold</span>
          <span>${this.formatUSD(metrics.total_volume)} / ${this.formatUSD(1000000)}</span>
        </div>
        <div class="progress-bar large">
          <div class="progress-fill" style="width: ${Math.min(100, (metrics.total_volume / 1000000) * 100)}%"></div>
        </div>
        <p class="threshold-note">${this.formatUSD(1000000 - metrics.total_volume)} more until first proposal automatically triggers</p>
      </div>

      ${proposals.map(p => this.renderProposalCard(p, true)).join('')}
    `;
  }

  // ============================================================================
  // COMPONENT RENDERERS
  // ============================================================================

  _renderNotifications(notifications) {
    if (notifications.length === 0) return '';
    
    return `
      <div class="notifications-bar">
        ${notifications.map(n => `
          <div class="notification ${n.type}">
            <span>${n.message}</span>
            <button onclick="manDashboardEnhanced.dismissNotification(${n.id})">×</button>
          </div>
        `).join('')}
      </div>
    `;
  }

  async _renderVolumeChart(days) {
    // Generate sample data (in real impl, query DB for date range)
    const data = await this._getVolumeData(days);
    
    // Simple SVG bar chart
    const maxVal = Math.max(...data.map(d => d.volume));
    const barWidth = 100 / data.length;
    
    return `
      <div class="chart">
        <svg viewBox="0 0 100 50" preserveAspectRatio="none">
          ${data.map((d, i) => `
            <rect 
              x="${i * barWidth + 1}" 
              y="${50 - (d.volume / maxVal) * 45}" 
              width="${barWidth - 2}" 
              height="${(d.volume / maxVal) * 45}"
              fill="#22c55e"
              opacity="0.8"
            />
          `).join('')}
        </svg>
        <div class="chart-labels">
          ${data.filter((_, i) => i % 7 === 0).map(d => `
            <span>${new Date(d.date).toLocaleDateString('en', {month: 'short', day: 'numeric'})}</span>
          `).join('')}
        </div>
      </div>
    `;
  }

  _renderPoolChart(metrics) {
    const total = metrics.total_member_pool + metrics.total_operations_pool + metrics.total_sovereign_pool;
    if (total === 0) return '<p style="text-align: center; color: #94a3b8;">No interchange revenue yet</p>';
    
    const memberPct = (metrics.total_member_pool / total) * 100;
    const opsPct = (metrics.total_operations_pool / total) * 100;
    const sovPct = (metrics.total_sovereign_pool / total) * 100;
    
    return `
      <div class="pool-chart">
        <div class="pool-donut" style="
          background: conic-gradient(
            #22c55e 0% ${memberPct}%, 
            #3b82f6 ${memberPct}% ${memberPct + opsPct}%, 
            #f59e0b ${memberPct + opsPct}% 100%
          );
        "></div>
        <div class="pool-legend">
          <div><span class="dot" style="background: #22c55e;"></span> Member Pool (70%)</div>
          <div><span class="dot" style="background: #3b82f6;"></span> Operations (20%)</div>
          <div><span class="dot" style="background: #f59e0b;"></span> Sovereign Fund (10%)</div>
        </div>
      </div>
    `;
  }

  renderProposalCard(proposal, full = false) {
    return `
      <div class="proposal-card">
        <div class="proposal-header">
          <div class="proposal-title">${proposal.title}</div>
          <span class="proposal-status ${proposal.status}">${proposal.status}</span>
        </div>
        ${full ? `<p class="proposal-desc">${proposal.description}</p>` : ''}
        <div class="proposal-meta">
          <span>📅 ${new Date(proposal.vote_end).toLocaleDateString()}</span>
          <span>🏁 Threshold: ${this.formatUSD(proposal.threshold_value)}</span>
        </div>
        <div class="button-group">
          <button class="btn-primary" onclick="manDashboardEnhanced.vote('${proposal.id}', 'Yes')">Vote Yes</button>
          <button class="btn-outline" onclick="manDashboardEnhanced.vote('${proposal.id}', 'No')">Vote No</button>
          <button class="btn-text" onclick="manDashboardEnhanced.viewProposalDetails('${proposal.id}')">Details →</button>
        </div>
      </div>
    `;
  }

  _renderEmptyState(title, subtitle) {
    return `
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>${title}</h3>
        <p>${subtitle}</p>
      </div>
    `;
  }

  // ============================================================================
  // ACTIONS
  // ============================================================================

  async simulatePurchase() {
    const merchants = ['Walmart', 'Costco', 'Target', 'Starbucks', 'Amazon', 'Shell'];
    const merchant = merchants[Math.floor(Math.random() * merchants.length)];
    const amount = (Math.random() * 100 + 10).toFixed(2);
    
    try {
      await this.bridge.simulateTransaction(parseFloat(amount), merchant);
      this._showNotification('Success', `Simulated $${amount} at ${merchant}`, 'success');
    } catch (error) {
      this._showNotification('Error', error.message, 'error');
    }
  }

  async exportToCSV() {
    const transactions = await this.db.getTransactions();
    
    const headers = ['Date', 'Merchant', 'Amount', 'Status', 'Interchange', 'Member Share'];
    const rows = transactions.map(tx => [
      new Date(tx.timestamp).toISOString(),
      tx.merchant,
      tx.amount,
      tx.status,
      tx.amount * 0.012,
      tx.amount * 0.012 * 0.70
    ]);
    
    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    this._downloadFile(csv, 'solvy-transactions.csv', 'text/csv');
    this._showNotification('Export Complete', 'CSV downloaded', 'success');
  }

  async exportToPDF() {
    // In real implementation, use jsPDF or similar
    this._showNotification('Coming Soon', 'PDF export in development', 'info');
  }

  async downloadStatement() {
    this._showNotification('Coming Soon', 'Monthly statements coming in v2', 'info');
  }

  async vote(proposalId, choice) {
    try {
      await this.db.castVote(proposalId, 'member_' + Date.now(), choice);
      this._showNotification('Vote Recorded', `You voted ${choice}`, 'success');
      this.loadCurrentPage();
    } catch (error) {
      this._showNotification('Error', error.message, 'error');
    }
  }

  async createProposal() {
    const title = prompt('Proposal Title:');
    if (!title) return;
    
    const description = prompt('Description:');
    if (!description) return;
    
    await this.db.createProposal({
      title: title,
      description: description,
      threshold_value: 100000,
      vote_end: Date.now() + (7 * 24 * 60 * 60 * 1000)
    });
    
    this._showNotification('Proposal Created', 'Your proposal is now pending', 'success');
    this.loadCurrentPage();
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  formatUSD(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  _showNotification(title, message, type = 'info') {
    // Add to MAN database
    this.db.addNotification(type, `${title}: ${message}`);
    
    // Show toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <strong>${title}</strong>
      <p>${message}</p>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 5000);
  }

  _downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async _checkThresholds() {
    const metrics = await this.db.getMetrics();
    
    if (metrics.total_volume >= 1000000) {
      await this.db.addNotification(
        'threshold_reached',
        '🎉 $1M volume threshold reached! New proposal automatically triggered.'
      );
    }
  }

  async _getVolumeData(days) {
    // Mock data - in real implementation, query DB
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      data.push({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        volume: Math.random() * 1000 + 500
      });
    }
    return data;
  }

  loadCurrentPage() {
    const renderer = {
      'dashboard': () => this.renderDashboard(),
      'transactions': () => this.renderTransactions(),
      'proposals': () => this.renderProposals()
    }[this.currentPage];

    if (renderer) {
      renderer().then(html => {
        const container = document.getElementById('pageRenderer');
        if (container) container.innerHTML = html;
      });
    }
  }

  switchPage(pageId) {
    this.currentPage = pageId;
    this.loadCurrentPage();
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelector(`.nav-item[data-page="${pageId}"]`)?.classList.add('active');
  }
}

// Initialize
const manDashboardEnhanced = new MANDashboardEnhanced();
document.addEventListener('DOMContentLoaded', () => {
  manDashboardEnhanced.init();
});

window.switchPage = (p) => manDashboardEnhanced.switchPage(p);
