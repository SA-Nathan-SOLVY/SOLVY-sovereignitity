/**
 * Data Pool Opt-In Modal Component
 * Shown after successful vote to request data contribution consent
 */

class DataPoolOptIn extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.proposalId = null;
    this.isOpen = false;
    this.step = 'intro'; // intro, preview, processing, success
    this.contributionData = null;
  }
  
  static get observedAttributes() {
    return ['proposal-id'];
  }
  
  connectedCallback() {
    this.render();
    
    // Listen for events to show modal
    window.addEventListener('showDataPoolOptIn', this.handleShowRequest.bind(this));
    window.addEventListener('voteCast', this.handleVoteCast.bind(this));
  }
  
  disconnectedCallback() {
    window.removeEventListener('showDataPoolOptIn', this.handleShowRequest);
    window.removeEventListener('voteCast', this.handleVoteCast);
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'proposal-id' && newValue) {
      this.proposalId = newValue;
    }
  }
  
  handleShowRequest(event) {
    const { proposalId } = event.detail;
    this.proposalId = proposalId;
    this.open();
  }
  
  handleVoteCast(event) {
    // Auto-show after vote if auto-show attribute is set
    if (this.hasAttribute('auto-show')) {
      const { proposalId } = event.detail;
      this.proposalId = proposalId;
      
      // Small delay to let vote confirmation show first
      setTimeout(() => {
        this.open();
      }, 2000);
    }
  }
  
  async open() {
    this.isOpen = true;
    this.step = 'intro';
    this.render();
    
    // Load contribution preview
    try {
      this.contributionData = await EncryptionService.getContributionPreview();
      this.render();
    } catch (error) {
      console.error('Error loading contribution preview:', error);
    }
  }
  
  close() {
    this.isOpen = false;
    this.render();
  }
  
  setStep(step) {
    this.step = step;
    this.render();
  }
  
  async handleConfirmContribution() {
    this.setStep('processing');
    
    try {
      const result = await EncryptionService.contributeToPool(this.proposalId);
      this.setStep('success');
      
      // Dispatch event for other components
      this.dispatchEvent(new CustomEvent('dataContributed', {
        detail: { proposalId: this.proposalId, result },
        bubbles: true,
        composed: true
      }));
    } catch (error) {
      console.error('Contribution failed:', error);
      this.showError(error.message);
    }
  }
  
  showError(message) {
    const errorContainer = this.shadowRoot.querySelector('.error-message');
    if (errorContainer) {
      errorContainer.textContent = message;
      errorContainer.style.display = 'block';
    }
  }
  
  skip() {
    // Record that user skipped
    localStorage.setItem(`data_pool_skipped_${this.proposalId}`, 'true');
    this.close();
  }
  
  render() {
    if (!this.isOpen) {
      this.shadowRoot.innerHTML = '';
      return;
    }
    
    const styles = `
      :host {
        display: block;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 1rem;
        animation: fadeIn 0.2s ease;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      .modal {
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        border: 1px solid rgba(34, 197, 94, 0.3);
        border-radius: 20px;
        max-width: 600px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        animation: slideUp 0.3s ease;
      }
      
      @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      
      .modal-header {
        padding: 1.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .modal-title {
        font-size: 1.25rem;
        font-weight: 700;
        color: #fff;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      
      .modal-title .icon {
        font-size: 1.5rem;
      }
      
      .close-button {
        background: none;
        border: none;
        color: #94a3b8;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0.25rem;
        line-height: 1;
        transition: color 0.2s;
      }
      
      .close-button:hover {
        color: #fff;
      }
      
      .modal-body {
        padding: 1.5rem;
        color: #cbd5e1;
      }
      
      .modal-footer {
        padding: 1.5rem;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
      }
      
      .intro-section h3 {
        color: #22c55e;
        margin: 0 0 1rem 0;
        font-size: 1.1rem;
      }
      
      .intro-section p {
        line-height: 1.7;
        margin: 0 0 1rem 0;
      }
      
      .benefits-list {
        list-style: none;
        padding: 0;
        margin: 1rem 0;
      }
      
      .benefits-list li {
        padding: 0.5rem 0;
        padding-left: 1.75rem;
        position: relative;
      }
      
      .benefits-list li::before {
        content: '✓';
        position: absolute;
        left: 0;
        color: #22c55e;
        font-weight: bold;
      }
      
      .privacy-badges {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin: 1rem 0;
      }
      
      .privacy-badge {
        background: rgba(34, 197, 94, 0.1);
        border: 1px solid rgba(34, 197, 94, 0.3);
        color: #22c55e;
        padding: 0.375rem 0.75rem;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 500;
      }
      
      .data-preview {
        background: rgba(30, 41, 59, 0.5);
        border-radius: 12px;
        padding: 1.25rem;
        margin: 1rem 0;
      }
      
      .preview-title {
        font-weight: 600;
        color: #fff;
        margin-bottom: 0.75rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      
      .preview-content {
        font-family: 'Monaco', 'Menlo', monospace;
        font-size: 0.85rem;
        background: rgba(0, 0, 0, 0.3);
        padding: 1rem;
        border-radius: 8px;
        overflow-x: auto;
        color: #a5b4fc;
      }
      
      .data-compare {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin: 1rem 0;
      }
      
      .compare-column {
        background: rgba(30, 41, 59, 0.5);
        border-radius: 12px;
        padding: 1rem;
      }
      
      .compare-column.yours {
        border: 1px solid rgba(239, 68, 68, 0.3);
      }
      
      .compare-column.shared {
        border: 1px solid rgba(34, 197, 94, 0.3);
      }
      
      .compare-header {
        font-weight: 600;
        margin-bottom: 0.75rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      
      .compare-column.yours .compare-header {
        color: #ef4444;
      }
      
      .compare-column.shared .compare-header {
        color: #22c55e;
      }
      
      .checkbox-container {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 1rem;
        background: rgba(147, 51, 234, 0.1);
        border: 1px solid rgba(147, 51, 234, 0.3);
        border-radius: 10px;
        margin: 1rem 0;
      }
      
      .checkbox-container input[type="checkbox"] {
        width: 20px;
        height: 20px;
        margin-top: 2px;
        accent-color: #22c55e;
        cursor: pointer;
      }
      
      .checkbox-label {
        flex: 1;
        cursor: pointer;
        line-height: 1.5;
      }
      
      .button {
        padding: 0.875rem 1.5rem;
        border-radius: 10px;
        font-weight: 600;
        font-size: 0.95rem;
        cursor: pointer;
        transition: all 0.2s;
        border: 2px solid transparent;
      }
      
      .button-primary {
        background: linear-gradient(135deg, #22c55e, #16a34a);
        color: white;
        border-color: #22c55e;
      }
      
      .button-primary:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(34, 197, 94, 0.3);
      }
      
      .button-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      
      .button-secondary {
        background: transparent;
        color: #94a3b8;
        border-color: rgba(255, 255, 255, 0.2);
      }
      
      .button-secondary:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
      }
      
      .button-skip {
        background: none;
        border: none;
        color: #64748b;
        text-decoration: underline;
        cursor: pointer;
        padding: 0.5rem;
      }
      
      .button-skip:hover {
        color: #94a3b8;
      }
      
      .processing-state {
        text-align: center;
        padding: 2rem;
      }
      
      .spinner {
        width: 50px;
        height: 50px;
        border: 3px solid rgba(34, 197, 94, 0.3);
        border-top-color: #22c55e;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 1.5rem;
      }
      
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      
      .success-state {
        text-align: center;
        padding: 2rem;
      }
      
      .success-icon {
        width: 70px;
        height: 70px;
        background: linear-gradient(135deg, #22c55e, #16a34a);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2.5rem;
        color: white;
        margin: 0 auto 1.5rem;
        animation: scaleIn 0.3s ease;
      }
      
      @keyframes scaleIn {
        from { transform: scale(0); }
        to { transform: scale(1); }
      }
      
      .expiry-notice {
        background: rgba(245, 158, 11, 0.1);
        border: 1px solid rgba(245, 158, 11, 0.3);
        border-radius: 10px;
        padding: 1rem;
        margin-top: 1rem;
        font-size: 0.9rem;
        color: #fbbf24;
      }
      
      .error-message {
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.3);
        color: #f87171;
        padding: 1rem;
        border-radius: 8px;
        margin: 1rem 0;
        display: none;
      }
      
      @media (max-width: 480px) {
        .modal {
          margin: 0.5rem;
        }
        
        .data-compare {
          grid-template-columns: 1fr;
        }
        
        .modal-footer {
          flex-direction: column;
        }
        
        .button {
          width: 100%;
        }
      }
    `;
    
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div class="modal-overlay" onclick="event.target === this && this.closest('data-pool-optin').close()">
        <div class="modal" onclick="event.stopPropagation()">
          ${this.renderHeader()}
          <div class="modal-body">
            ${this.renderContent()}
          </div>
          ${this.renderFooter()}
        </div>
      </div>
    `;
    
    this.bindEvents();
  }
  
  renderHeader() {
    const titles = {
      intro: { icon: '🔒', text: 'Contribute Anonymized Data' },
      preview: { icon: '👁️', text: 'Data Preview' },
      processing: { icon: '⏳', text: 'Processing' },
      success: { icon: '✅', text: 'Contribution Complete' }
    };
    
    const { icon, text } = titles[this.step];
    
    return `
      <div class="modal-header">
        <h2 class="modal-title">
          <span class="icon">${icon}</span>
          ${text}
        </h2>
        ${this.step === 'intro' || this.step === 'preview' ? `
          <button class="close-button" onclick="this.closest('data-pool-optin').close()">×</button>
        ` : ''}
      </div>
    `;
  }
  
  renderContent() {
    switch (this.step) {
      case 'intro':
        return this.renderIntroStep();
      case 'preview':
        return this.renderPreviewStep();
      case 'processing':
        return this.renderProcessingStep();
      case 'success':
        return this.renderSuccessStep();
      default:
        return '';
    }
  }
  
  renderIntroStep() {
    return `
      <div class="intro-section">
        <h3>Help Your Cooperative Grow</h3>
        <p>
          After voting, you can contribute <strong>anonymized transaction data</strong> to help 
          the cooperative make better decisions. Your data helps identify trends, optimize 
          services, and negotiate better rates with suppliers.
        </p>
        
        <div class="privacy-badges">
          <span class="privacy-badge">🔐 Encrypted</span>
          <span class="privacy-badge">🎭 Anonymous</span>
          <span class="privacy-badge">⏱️ 30-Day Auto-Delete</span>
          <span class="privacy-badge">🚫 No PII</span>
        </div>
        
        <h3 style="color: #fff; margin-top: 1.5rem;">What You're Sharing</h3>
        <ul class="benefits-list">
          <li>Total transaction volume by category</li>
          <li>Average transaction sizes</li>
          <li>Aggregated spending patterns</li>
          <li>Geographic region (state level only)</li>
        </ul>
        
        <h3 style="color: #fff; margin-top: 1rem;">What You're NOT Sharing</h3>
        <ul class="benefits-list">
          <li>Individual transaction details</li>
          <li>Merchant names or locations</li>
          <li>Exact dates or times</li>
          <li>Any personal identification</li>
        </ul>
      </div>
      
      <div class="error-message"></div>
    `;
  }
  
  renderPreviewStep() {
    if (!this.contributionData) {
      return '<div class="processing-state"><div class="spinner"></div><p>Loading preview...</p></div>';
    }
    
    const sharedData = this.contributionData.willBeShared;
    
    return `
      <div class="intro-section">
        <h3>Preview: What Will Be Shared</h3>
        <p>Here's exactly what data will be contributed to the cooperative pool:</p>
      </div>
      
      <div class="data-compare">
        <div class="compare-column yours">
          <div class="compare-header">
            ❌ Never Shared
          </div>
          <ul style="margin: 0; padding-left: 1.25rem; color: #94a3b8; font-size: 0.9rem;">
            <li>Individual transactions</li>
            <li>Exact timestamps</li>
            <li>Merchant names</li>
            <li>Transaction IDs</li>
            <li>Personal information</li>
          </ul>
        </div>
        
        <div class="compare-column shared">
          <div class="compare-header">
            ✅ Will Be Shared
          </div>
          <ul style="margin: 0; padding-left: 1.25rem; color: #94a3b8; font-size: 0.9rem;">
            <li>Category totals</li>
            <li>Aggregated averages</li>
            <li>Transaction counts</li>
            <li>Regional buckets</li>
            <li>Anonymized patterns</li>
          </ul>
        </div>
      </div>
      
      <div class="data-preview">
        <div class="preview-title">
          📊 Data That Will Be Encrypted
        </div>
        <div class="preview-content">
          <pre>${JSON.stringify(sharedData, null, 2)}</pre>
        </div>
      </div>
      
      <div class="checkbox-container">
        <input type="checkbox" id="confirm-checkbox">
        <label for="confirm-checkbox" class="checkbox-label">
          I confirm that I understand what data will be shared. I consent to contributing 
          this anonymized, encrypted data to the cooperative pool for 30 days.
        </label>
      </div>
      
      <div class="error-message"></div>
    `;
  }
  
  renderProcessingStep() {
    return `
      <div class="processing-state">
        <div class="spinner"></div>
        <h3>Encrypting & Contributing...</h3>
        <p style="color: #94a3b8;">
          Your data is being encrypted on your device before transmission.
          <br>This ensures maximum privacy and security.
        </p>
      </div>
    `;
  }
  
  renderSuccessStep() {
    const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    return `
      <div class="success-state">
        <div class="success-icon">✓</div>
        <h3>Thank You!</h3>
        <p style="color: #94a3b8;">
          Your anonymized data has been securely contributed to the cooperative pool.
        </p>
        
        <div class="expiry-notice">
          <strong>⏰ Auto-Deletion Scheduled</strong><br>
          Your contributed data will be automatically deleted on 
          <strong>${expiryDate.toLocaleDateString()}</strong>
        </div>
      </div>
    `;
  }
  
  renderFooter() {
    switch (this.step) {
      case 'intro':
        return `
          <div class="modal-footer">
            <button class="button button-skip" onclick="this.closest('data-pool-optin').skip()">
              Skip for now
            </button>
            <div style="flex: 1;"></div>
            <button class="button button-secondary" onclick="this.closest('data-pool-optin').close()">
              Cancel
            </button>
            <button class="button button-primary" onclick="this.closest('data-pool-optin').setStep('preview')">
              Preview Data →
            </button>
          </div>
        `;
      
      case 'preview':
        return `
          <div class="modal-footer">
            <button class="button button-secondary" onclick="this.closest('data-pool-optin').setStep('intro')">
              ← Back
            </button>
            <button class="button button-primary" id="confirm-btn" disabled
                    onclick="this.closest('data-pool-optin').handleConfirmContribution()">
              Confirm & Contribute
            </button>
          </div>
        `;
      
      case 'processing':
        return '';
      
      case 'success':
        return `
          <div class="modal-footer" style="justify-content: center;">
            <button class="button button-primary" onclick="this.closest('data-pool-optin').close()">
              Done
            </button>
          </div>
        `;
      
      default:
        return '';
    }
  }
  
  bindEvents() {
    // Bind checkbox in preview step
    const checkbox = this.shadowRoot.querySelector('#confirm-checkbox');
    const confirmBtn = this.shadowRoot.querySelector('#confirm-btn');
    
    if (checkbox && confirmBtn) {
      checkbox.addEventListener('change', () => {
        confirmBtn.disabled = !checkbox.checked;
      });
    }
  }
}

// Define the custom element
customElements.define('data-pool-optin', DataPoolOptIn);
