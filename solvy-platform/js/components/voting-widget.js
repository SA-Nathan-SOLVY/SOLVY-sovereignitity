/**
 * Voting Widget Component
 * Displays active proposals with voting interface
 * Integrates with threshold widget to auto-show when threshold reached
 */

class VotingWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.proposals = [];
    this.currentProposalIndex = 0;
    this.countdownIntervals = [];
  }
  
  static get observedAttributes() {
    return ['proposal-id', 'auto-show-threshold'];
  }
  
  connectedCallback() {
    this.render();
    this.loadProposals();
    
    // Listen for threshold reached events
    window.addEventListener('thresholdReached', this.handleThresholdReached.bind(this));
    window.addEventListener('voteCast', this.handleVoteCast.bind(this));
  }
  
  disconnectedCallback() {
    this.clearCountdowns();
    window.removeEventListener('thresholdReached', this.handleThresholdReached);
    window.removeEventListener('voteCast', this.handleVoteCast);
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'proposal-id' && newValue) {
      this.loadProposal(newValue);
    }
  }
  
  async loadProposals() {
    try {
      this.proposals = await VotingService.getActiveProposals();
      this.render();
      this.startCountdowns();
    } catch (error) {
      console.error('Error loading proposals:', error);
      this.showError('Failed to load proposals. Please try again later.');
    }
  }
  
  async loadProposal(proposalId) {
    try {
      const proposal = await VotingService.getProposal(proposalId);
      this.proposals = [proposal];
      this.render();
      this.startCountdowns();
    } catch (error) {
      console.error('Error loading proposal:', error);
    }
  }
  
  handleThresholdReached(event) {
    const { proposalId } = event.detail;
    if (proposalId) {
      this.loadProposal(proposalId);
      this.show();
    }
  }
  
  handleVoteCast(event) {
    const { proposalId } = event.detail;
    this.render();
  }
  
  show() {
    this.style.display = 'block';
    this.scrollIntoView({ behavior: 'smooth' });
  }
  
  hide() {
    this.style.display = 'none';
  }
  
  async handleVote(choice) {
    const proposal = this.proposals[this.currentProposalIndex];
    
    try {
      this.showVotingLoading();
      await VotingService.castVote(proposal.id, choice);
      this.showVoteConfirmation(choice);
      
      // Trigger data pool opt-in after successful vote
      setTimeout(() => {
        this.showDataPoolOptIn(proposal.id);
      }, 1500);
    } catch (error) {
      console.error('Voting error:', error);
      this.showError(error.message);
    }
  }
  
  showVotingLoading() {
    const buttons = this.shadowRoot.querySelectorAll('.vote-button');
    buttons.forEach(btn => btn.disabled = true);
  }
  
  showVoteConfirmation(choice) {
    const container = this.shadowRoot.querySelector('.vote-container');
    container.innerHTML = `
      <div class="vote-confirmation">
        <div class="confirmation-icon">✓</div>
        <h4>Vote Recorded!</h4>
        <p>You voted: <strong>${choice}</strong></p>
        <p class="privacy-note">Your vote is private and anonymous.</p>
      </div>
    `;
  }
  
  showDataPoolOptIn(proposalId) {
    // Trigger the data pool opt-in modal
    window.dispatchEvent(new CustomEvent('showDataPoolOptIn', {
      detail: { proposalId }
    }));
  }
  
  showError(message) {
    const container = this.shadowRoot.querySelector('.widget-container');
    container.innerHTML = `
      <div class="error-message">
        <div class="error-icon">⚠</div>
        <p>${message}</p>
        <button class="retry-button" onclick="this.closest('voting-widget').loadProposals()">
          Try Again
        </button>
      </div>
    `;
  }
  
  startCountdowns() {
    this.clearCountdowns();
    
    this.proposals.forEach((proposal, index) => {
      if (proposal.status === 'active') {
        const interval = setInterval(() => {
          this.updateCountdown(index, proposal.voteEnd);
        }, 1000);
        this.countdownIntervals.push(interval);
      }
    });
  }
  
  clearCountdowns() {
    this.countdownIntervals.forEach(interval => clearInterval(interval));
    this.countdownIntervals = [];
  }
  
  updateCountdown(index, voteEnd) {
    const timeRemaining = VotingService.calculateTimeRemaining(voteEnd);
    const countdownEl = this.shadowRoot.querySelector(`#countdown-${index}`);
    
    if (countdownEl) {
      if (timeRemaining.expired) {
        countdownEl.textContent = 'Voting Closed';
        countdownEl.classList.add('expired');
      } else {
        countdownEl.textContent = VotingService.formatTimeRemaining(timeRemaining);
      }
    }
  }
  
  navigate(direction) {
    this.currentProposalIndex += direction;
    
    if (this.currentProposalIndex < 0) {
      this.currentProposalIndex = this.proposals.length - 1;
    } else if (this.currentProposalIndex >= this.proposals.length) {
      this.currentProposalIndex = 0;
    }
    
    this.render();
    this.startCountdowns();
  }
  
  render() {
    const styles = `
      :host {
        display: block;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .widget-container {
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        border: 1px solid rgba(34, 197, 94, 0.3);
        border-radius: 16px;
        padding: 1.5rem;
        color: #fff;
        max-width: 500px;
        margin: 0 auto;
      }
      
      .widget-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .widget-title {
        font-size: 1.2rem;
        font-weight: 700;
        color: #22c55e;
        margin: 0;
      }
      
      .proposal-counter {
        font-size: 0.85rem;
        color: #94a3b8;
      }
      
      .proposal-card {
        background: rgba(30, 41, 59, 0.5);
        border-radius: 12px;
        padding: 1.25rem;
        margin-bottom: 1rem;
      }
      
      .proposal-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1rem;
      }
      
      .proposal-title {
        font-size: 1.1rem;
        font-weight: 600;
        margin: 0 0 0.5rem 0;
        line-height: 1.4;
      }
      
      .countdown {
        background: rgba(34, 197, 94, 0.2);
        color: #22c55e;
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 600;
        white-space: nowrap;
      }
      
      .countdown.expired {
        background: rgba(239, 68, 68, 0.2);
        color: #ef4444;
      }
      
      .proposal-description {
        color: #cbd5e1;
        font-size: 0.95rem;
        line-height: 1.6;
        margin-bottom: 1rem;
      }
      
      .threshold-info {
        background: rgba(147, 51, 234, 0.1);
        border: 1px solid rgba(147, 51, 234, 0.3);
        border-radius: 8px;
        padding: 0.75rem;
        margin-bottom: 1rem;
        font-size: 0.85rem;
        color: #a78bfa;
      }
      
      .threshold-info .icon {
        margin-right: 0.5rem;
      }
      
      .vote-container {
        margin-top: 1rem;
      }
      
      .vote-buttons {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
      }
      
      .vote-button {
        flex: 1;
        min-width: 100px;
        padding: 0.875rem 1.25rem;
        border: 2px solid;
        border-radius: 10px;
        font-weight: 600;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .vote-button.yes {
        background: transparent;
        border-color: #22c55e;
        color: #22c55e;
      }
      
      .vote-button.yes:hover {
        background: #22c55e;
        color: white;
      }
      
      .vote-button.no {
        background: transparent;
        border-color: #ef4444;
        color: #ef4444;
      }
      
      .vote-button.no:hover {
        background: #ef4444;
        color: white;
      }
      
      .vote-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      .vote-confirmation {
        text-align: center;
        padding: 1.5rem;
      }
      
      .confirmation-icon {
        width: 60px;
        height: 60px;
        background: #22c55e;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        color: white;
        margin: 0 auto 1rem;
      }
      
      .privacy-note {
        font-size: 0.85rem;
        color: #94a3b8;
        margin-top: 0.75rem;
      }
      
      .results-container {
        margin-top: 1rem;
      }
      
      .result-bar {
        margin-bottom: 1rem;
      }
      
      .result-label {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
      }
      
      .result-bar-track {
        height: 24px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        overflow: hidden;
      }
      
      .result-bar-fill {
        height: 100%;
        border-radius: 12px;
        transition: width 0.5s ease;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding-right: 0.75rem;
        font-size: 0.8rem;
        font-weight: 600;
      }
      
      .result-bar-fill.yes {
        background: linear-gradient(90deg, #22c55e, #16a34a);
      }
      
      .result-bar-fill.no {
        background: linear-gradient(90deg, #ef4444, #dc2626);
      }
      
      .navigation {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .nav-button {
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: #fff;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s;
      }
      
      .nav-button:hover {
        background: rgba(255, 255, 255, 0.2);
      }
      
      .nav-button:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
      
      .error-message {
        text-align: center;
        padding: 2rem;
      }
      
      .error-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
      }
      
      .retry-button {
        background: #22c55e;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        margin-top: 1rem;
        cursor: pointer;
        font-weight: 600;
      }
      
      .empty-state {
        text-align: center;
        padding: 2rem;
        color: #94a3b8;
      }
      
      .empty-state-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
      }
      
      @media (max-width: 480px) {
        .widget-container {
          padding: 1rem;
        }
        
        .vote-buttons {
          flex-direction: column;
        }
        
        .vote-button {
          width: 100%;
        }
      }
    `;
    
    if (this.proposals.length === 0) {
      this.shadowRoot.innerHTML = `
        <style>${styles}</style>
        <div class="widget-container">
          <div class="empty-state">
            <div class="empty-state-icon">🗳️</div>
            <h3>No Active Proposals</h3>
            <p>Check back later for new voting opportunities.</p>
          </div>
        </div>
      `;
      return;
    }
    
    const proposal = this.proposals[this.currentProposalIndex];
    const hasVoted = VotingService.hasVoted(proposal.id);
    
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div class="widget-container">
        <div class="widget-header">
          <h3 class="widget-title">🗳️ Active Proposals</h3>
          ${this.proposals.length > 1 ? `
            <span class="proposal-counter">${this.currentProposalIndex + 1} / ${this.proposals.length}</span>
          ` : ''}
        </div>
        
        <div class="proposal-card">
          <div class="proposal-header">
            <div>
              <h4 class="proposal-title">${proposal.title}</h4>
            </div>
            <span class="countdown" id="countdown-${this.currentProposalIndex}">
              ${VotingService.formatTimeRemaining(VotingService.calculateTimeRemaining(proposal.voteEnd))}
            </span>
          </div>
          
          <p class="proposal-description">${proposal.description}</p>
          
          ${proposal.thresholdValue ? `
            <div class="threshold-info">
              <span class="icon">📊</span>
              Threshold: ${proposal.thresholdValue} ${proposal.thresholdType === 'volume' ? 'transactions' : 'members'}
            </div>
          ` : ''}
          
          <div class="vote-container">
            ${hasVoted ? this.renderUserVote(proposal) : this.renderVoteButtons(proposal)}
          </div>
        </div>
        
        ${this.proposals.length > 1 ? `
          <div class="navigation">
            <button class="nav-button" onclick="this.closest('voting-widget').navigate(-1)">← Previous</button>
            <button class="nav-button" onclick="this.closest('voting-widget').navigate(1)">Next →</button>
          </div>
        ` : ''}
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
  
  renderVoteButtons(proposal) {
    const options = proposal.options || ['Yes', 'No'];
    
    return `
      <div class="vote-buttons">
        ${options.map(option => `
          <button class="vote-button ${option.toLowerCase()}" data-choice="${option}">
            ${option}
          </button>
        `).join('')}
      </div>
    `;
  }
  
  renderUserVote(proposal) {
    const userVote = VotingService.getUserVote(proposal.id);
    
    return `
      <div class="vote-confirmation">
        <div class="confirmation-icon">✓</div>
        <h4>You've Voted</h4>
        <p>Your choice: <strong>${userVote?.choice || 'Recorded'}</strong></p>
        <p class="privacy-note">Thank you for participating in cooperative governance.</p>
      </div>
    `;
  }
  
  renderResults(results) {
    const totalVotes = results.reduce((sum, r) => sum + r.voteCount, 0);
    
    return `
      <div class="results-container">
        <h4>Results</h4>
        ${results.map(result => `
          <div class="result-bar">
            <div class="result-label">
              <span>${result.choice}</span>
              <span>${result.voteCount} votes (${result.percentage}%)</span>
            </div>
            <div class="result-bar-track">
              <div class="result-bar-fill ${result.choice.toLowerCase()}" 
                   style="width: ${result.percentage}%">
                ${result.percentage > 15 ? result.percentage + '%' : ''}
              </div>
            </div>
          </div>
        `).join('')}
        <p class="privacy-note">Total votes: ${totalVotes}</p>
      </div>
    `;
  }
}

// Define the custom element
customElements.define('voting-widget', VotingWidget);
