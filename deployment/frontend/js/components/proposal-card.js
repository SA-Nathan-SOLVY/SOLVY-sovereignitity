/**
 * Proposal Card Component
 * Reusable proposal display component with full details
 */

class ProposalCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.proposal = null;
    this.expanded = false;
    this.results = null;
  }
  
  static get observedAttributes() {
    return ['proposal-id', 'show-results', 'compact'];
  }
  
  connectedCallback() {
    const proposalId = this.getAttribute('proposal-id');
    if (proposalId) {
      this.loadProposal(proposalId);
    }
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'proposal-id' && newValue && newValue !== oldValue) {
      this.loadProposal(newValue);
    }
    if (name === 'show-results' && this.proposal) {
      this.loadResults();
    }
  }
  
  async loadProposal(proposalId) {
    try {
      this.proposal = await VotingService.getProposal(proposalId);
      this.render();
      
      if (this.hasAttribute('show-results')) {
        this.loadResults();
      }
    } catch (error) {
      console.error('Error loading proposal:', error);
      this.renderError();
    }
  }
  
  async loadResults() {
    if (!this.proposal) return;
    
    try {
      this.results = await VotingService.getResults(this.proposal.id);
      this.renderResults();
    } catch (error) {
      console.error('Error loading results:', error);
    }
  }
  
  toggleExpanded() {
    this.expanded = !this.expanded;
    this.render();
  }
  
  getStatusColor(status) {
    const colors = {
      pending: '#f59e0b',   // Amber
      active: '#22c55e',    // Green
      passed: '#3b82f6',    // Blue
      failed: '#ef4444',    // Red
      closed: '#6b7280'     // Gray
    };
    return colors[status] || colors.pending;
  }
  
  getStatusIcon(status) {
    const icons = {
      pending: '⏳',
      active: '🗳️',
      passed: '✅',
      failed: '❌',
      closed: '🔒'
    };
    return icons[status] || icons.pending;
  }
  
  getStatusLabel(status) {
    const labels = {
      pending: 'Pending',
      active: 'Voting Open',
      passed: 'Passed',
      failed: 'Failed',
      closed: 'Closed'
    };
    return labels[status] || status;
  }
  
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  handleVote(choice) {
    if (!this.proposal) return;
    
    this.dispatchEvent(new CustomEvent('proposalVote', {
      detail: { proposalId: this.proposal.id, choice },
      bubbles: true,
      composed: true
    }));
  }
  
  render() {
    if (!this.proposal) {
      this.renderLoading();
      return;
    }
    
    const isCompact = this.hasAttribute('compact');
    const statusColor = this.getStatusColor(this.proposal.status);
    const statusIcon = this.getStatusIcon(this.proposal.status);
    const statusLabel = this.getStatusLabel(this.proposal.status);
    
    const styles = `
      :host {
        display: block;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .proposal-card {
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        overflow: hidden;
        color: #fff;
        transition: all 0.3s ease;
      }
      
      .proposal-card:hover {
        border-color: rgba(34, 197, 94, 0.3);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      }
      
      .proposal-card.compact {
        border-radius: 12px;
      }
      
      .card-header {
        padding: ${isCompact ? '1rem' : '1.5rem'};
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.375rem 0.875rem;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 600;
        margin-bottom: ${isCompact ? '0.75rem' : '1rem'};
        background: ${statusColor}20;
        color: ${statusColor};
        border: 1px solid ${statusColor}40;
      }
      
      .proposal-title {
        font-size: ${isCompact ? '1.1rem' : '1.4rem'};
        font-weight: 700;
        margin: 0 0 0.75rem 0;
        line-height: 1.3;
        color: #fff;
      }
      
      .proposal-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        font-size: 0.85rem;
        color: #94a3b8;
      }
      
      .meta-item {
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }
      
      .card-body {
        padding: ${isCompact ? '1rem' : '1.5rem'};
      }
      
      .proposal-description {
        color: #cbd5e1;
        line-height: 1.7;
        margin: 0 0 1rem 0;
        font-size: ${isCompact ? '0.9rem' : '1rem'};
      }
      
      .description-collapsed {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      
      .expand-button {
        background: none;
        border: none;
        color: #22c55e;
        font-size: 0.85rem;
        cursor: pointer;
        padding: 0;
        margin-top: 0.5rem;
        text-decoration: underline;
      }
      
      .expand-button:hover {
        color: #16a34a;
      }
      
      .threshold-section {
        background: rgba(147, 51, 234, 0.1);
        border: 1px solid rgba(147, 51, 234, 0.2);
        border-radius: 10px;
        padding: 1rem;
        margin-bottom: 1rem;
      }
      
      .threshold-title {
        font-size: 0.85rem;
        font-weight: 600;
        color: #a78bfa;
        margin: 0 0 0.5rem 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      
      .threshold-value {
        font-size: 1.25rem;
        font-weight: 700;
        color: #fff;
      }
      
      .voting-timeline {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .timeline-item {
        flex: 1;
        text-align: center;
      }
      
      .timeline-label {
        font-size: 0.75rem;
        color: #64748b;
        margin-bottom: 0.25rem;
      }
      
      .timeline-date {
        font-size: 0.85rem;
        color: #cbd5e1;
        font-weight: 500;
      }
      
      .timeline-arrow {
        color: #64748b;
        font-size: 1.2rem;
      }
      
      .card-footer {
        padding: ${isCompact ? '1rem' : '1.5rem'};
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 1rem;
      }
      
      .vote-options {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
      }
      
      .vote-button {
        padding: 0.625rem 1.25rem;
        border: 2px solid;
        border-radius: 8px;
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s;
        background: transparent;
      }
      
      .vote-button.yes {
        border-color: #22c55e;
        color: #22c55e;
      }
      
      .vote-button.yes:hover {
        background: #22c55e;
        color: white;
      }
      
      .vote-button.no {
        border-color: #ef4444;
        color: #ef4444;
      }
      
      .vote-button.no:hover {
        background: #ef4444;
        color: white;
      }
      
      .vote-button.abstain {
        border-color: #6b7280;
        color: #6b7280;
      }
      
      .vote-button.abstain:hover {
        background: #6b7280;
        color: white;
      }
      
      .view-details {
        color: #22c55e;
        text-decoration: none;
        font-size: 0.9rem;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }
      
      .view-details:hover {
        text-decoration: underline;
      }
      
      .closed-message {
        color: #94a3b8;
        font-style: italic;
        font-size: 0.9rem;
      }
      
      .results-preview {
        background: rgba(34, 197, 94, 0.1);
        border-radius: 10px;
        padding: 1rem;
        margin-top: 1rem;
      }
      
      .results-preview h4 {
        margin: 0 0 0.75rem 0;
        font-size: 0.9rem;
        color: #22c55e;
      }
      
      .result-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .result-item:last-child {
        border-bottom: none;
      }
      
      .loading-state {
        padding: 2rem;
        text-align: center;
        color: #94a3b8;
      }
      
      .error-state {
        padding: 2rem;
        text-align: center;
        color: #ef4444;
      }
      
      .spinner {
        display: inline-block;
        width: 24px;
        height: 24px;
        border: 2px solid rgba(34, 197, 94, 0.3);
        border-top-color: #22c55e;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 0.75rem;
      }
      
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      
      @media (max-width: 480px) {
        .proposal-meta {
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .card-footer {
          flex-direction: column;
          align-items: stretch;
        }
        
        .vote-options {
          justify-content: center;
        }
        
        .vote-button {
          flex: 1;
        }
      }
    `;
    
    const options = this.proposal.options || ['Yes', 'No'];
    const canVote = this.proposal.status === 'active';
    
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div class="proposal-card ${isCompact ? 'compact' : ''}">
        <div class="card-header">
          <div class="status-badge">
            <span>${statusIcon}</span>
            <span>${statusLabel}</span>
          </div>
          
          <h3 class="proposal-title">${this.proposal.title}</h3>
          
          <div class="proposal-meta">
            <span class="meta-item">
              📅 Created: ${this.formatDate(this.proposal.createdAt)}
            </span>
            ${this.proposal.thresholdValue ? `
              <span class="meta-item">
                📊 Threshold: ${this.proposal.thresholdValue} ${this.proposal.thresholdType}
              </span>
            ` : ''}
          </div>
        </div>
        
        <div class="card-body">
          <p class="proposal-description ${this.expanded ? '' : 'description-collapsed'}">
            ${this.proposal.description}
          </p>
          
          ${this.proposal.description.length > 150 ? `
            <button class="expand-button" onclick="this.closest('proposal-card').toggleExpanded()">
              ${this.expanded ? 'Show less ↑' : 'Read more ↓'}
            </button>
          ` : ''}
          
          ${this.proposal.thresholdValue ? `
            <div class="threshold-section">
              <div class="threshold-title">
                🎯 Activation Threshold
              </div>
              <div class="threshold-value">
                ${this.proposal.thresholdValue.toLocaleString()} 
                ${this.proposal.thresholdType === 'volume' ? 'transactions' : 'members'}
              </div>
            </div>
          ` : ''}
          
          ${!isCompact ? `
            <div class="voting-timeline">
              <div class="timeline-item">
                <div class="timeline-label">Voting Opens</div>
                <div class="timeline-date">${this.formatDate(this.proposal.voteStart)}</div>
              </div>
              <div class="timeline-arrow">→</div>
              <div class="timeline-item">
                <div class="timeline-label">Voting Closes</div>
                <div class="timeline-date">${this.formatDate(this.proposal.voteEnd)}</div>
              </div>
            </div>
          ` : ''}
          
          ${this.results ? this.renderResultsContent() : ''}
        </div>
        
        <div class="card-footer">
          ${canVote ? `
            <div class="vote-options">
              ${options.map(option => `
                <button class="vote-button ${option.toLowerCase()}" data-choice="${option}">
                  ${option}
                </button>
              `).join('')}
            </div>
          ` : `
            <span class="closed-message">
              ${this.proposal.status === 'pending' ? '⏳ Voting has not started yet' : 
                this.proposal.status === 'closed' ? '🔒 Voting has ended' : 
                '📊 View results for outcome'}
            </span>
          `}
          
          <a href="/proposals/${this.proposal.id}" class="view-details">
            View Details →
          </a>
        </div>
      </div>
    `;
    
    // Bind vote buttons
    const buttons = this.shadowRoot.querySelectorAll('.vote-button');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.handleVote(btn.dataset.choice);
      });
    });
  }
  
  renderResultsContent() {
    const totalVotes = this.results.reduce((sum, r) => sum + r.voteCount, 0);
    const winningChoice = this.results.reduce((max, r) => 
      r.voteCount > max.voteCount ? r : max, this.results[0]
    );
    
    return `
      <div class="results-preview">
        <h4>📊 Current Results (${totalVotes.toLocaleString()} votes)</h4>
        ${this.results.map(result => `
          <div class="result-item">
            <span>${result.choice}</span>
            <span>${result.percentage}% (${result.voteCount})</span>
          </div>
        `).join('')}
        ${winningChoice ? `
          <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.1);">
            <strong>Leading: ${winningChoice.choice}</strong> with ${winningChoice.percentage}%
          </div>
        ` : ''}
      </div>
    `;
  }
  
  renderResults() {
    if (!this.shadowRoot) return;
    
    const cardBody = this.shadowRoot.querySelector('.card-body');
    if (!cardBody) return;
    
    // Remove existing results
    const existingResults = cardBody.querySelector('.results-container');
    if (existingResults) {
      existingResults.remove();
    }
    
    const totalVotes = this.results.reduce((sum, r) => sum + r.voteCount, 0);
    
    const resultsHtml = `
      <div class="results-container" style="margin-top: 1.5rem;">
        <h4 style="color: #22c55e; margin-bottom: 1rem;">📊 Voting Results</h4>
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          ${this.results.map(result => `
            <div class="result-bar">
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span>${result.choice}</span>
                <span style="font-weight: 600;">${result.percentage}% (${result.voteCount.toLocaleString()} votes)</span>
              </div>
              <div style="height: 28px; background: rgba(255,255,255,0.1); border-radius: 14px; overflow: hidden;">
                <div style="height: 100%; width: ${result.percentage}%; 
                            background: ${result.choice.toLowerCase() === 'yes' ? '#22c55e' : 
                                         result.choice.toLowerCase() === 'no' ? '#ef4444' : '#6b7280'};
                            border-radius: 14px; transition: width 0.5s ease;
                            display: flex; align-items: center; justify-content: flex-end; padding-right: 0.75rem;">
                  ${result.percentage > 20 ? `<span style="color: white; font-weight: 600; font-size: 0.85rem;">${result.percentage}%</span>` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        <p style="color: #94a3b8; font-size: 0.85rem; margin-top: 1rem;">
          Total votes: ${totalVotes.toLocaleString()}
        </p>
      </div>
    `;
    
    cardBody.insertAdjacentHTML('beforeend', resultsHtml);
  }
  
  renderLoading() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .loading-state {
          background: #1e293b;
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
          color: #94a3b8;
        }
        .spinner {
          display: inline-block;
          width: 32px;
          height: 32px;
          border: 3px solid rgba(34, 197, 94, 0.3);
          border-top-color: #22c55e;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 0.75rem;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      </style>
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Loading proposal...</p>
      </div>
    `;
  }
  
  renderError() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .error-state {
          background: #1e293b;
          border: 1px solid #ef4444;
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
          color: #ef4444;
        }
      </style>
      <div class="error-state">
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">⚠️</div>
        <p>Failed to load proposal</p>
      </div>
    `;
  }
}

// Define the custom element
customElements.define('proposal-card', ProposalCard);
