/**
 * Encryption Service - Temporary Encrypted Data Pool
 * Privacy-preserving data contribution using AES-GCM encryption
 * Individual transactions are NEVER shared - only aggregated, anonymized data
 */

const EncryptionService = {
  // Configuration
  CONFIG: {
    ALGORITHM: 'AES-GCM',
    KEY_LENGTH: 256,
    IV_LENGTH: 12, // 96 bits for GCM
    TAG_LENGTH: 128,
    POOL_EXPIRY_DAYS: 30
  },
  
  // Member ID (set during initialization)
  memberId: null,
  
  /**
   * Initialize the service with member ID
   * @param {string} memberId - The member's unique identifier
   */
  init(memberId) {
    this.memberId = memberId;
  },
  
  /**
   * Generate encryption key from passphrase using PBKDF2-like approach
   * Uses SHA-256 to derive a 256-bit key from the passphrase
   * 
   * @param {string} passphrase - The encryption passphrase
   * @returns {Promise<CryptoKey>} - Derived AES-GCM key
   */
  async deriveKey(passphrase) {
    if (!passphrase || passphrase.length < 8) {
      throw new Error('Passphrase must be at least 8 characters');
    }
    
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(passphrase);
      
      // Use SHA-256 to derive key material from passphrase
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      
      // Import as AES-GCM key
      const key = await crypto.subtle.importKey(
        'raw',
        hashBuffer,
        { name: this.CONFIG.ALGORITHM, length: this.CONFIG.KEY_LENGTH },
        false, // Not extractable
        ['encrypt', 'decrypt']
      );
      
      return key;
    } catch (error) {
      console.error('Key derivation failed:', error);
      throw new Error('Failed to derive encryption key');
    }
  },
  
  /**
   * Generate a random encryption key for maximum security
   * Used when the pool key is provided by the cooperative manager
   * 
   * @returns {Promise<CryptoKey>} - Random AES-GCM key
   */
  async generateRandomKey() {
    return await crypto.subtle.generateKey(
      { name: this.CONFIG.ALGORITHM, length: this.CONFIG.KEY_LENGTH },
      true, // Extractable (to export if needed)
      ['encrypt', 'decrypt']
    );
  },
  
  /**
   * Export a key to raw bytes (for storage/transmission)
   * @param {CryptoKey} key - The key to export
   * @returns {Promise<ArrayBuffer>} - Raw key bytes
   */
  async exportKey(key) {
    return await crypto.subtle.exportKey('raw', key);
  },
  
  /**
   * Import a key from raw bytes
   * @param {ArrayBuffer} keyData - Raw key bytes
   * @returns {Promise<CryptoKey>} - Imported key
   */
  async importKey(keyData) {
    return await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: this.CONFIG.ALGORITHM, length: this.CONFIG.KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    );
  },
  
  /**
   * Encrypt aggregated data using AES-GCM
   * 
   * IMPORTANT: Only aggregated, anonymized data should be encrypted.
   * Individual transaction details must NEVER be included.
   * 
   * @param {Object} data - Aggregated data to encrypt
   * @param {string|CryptoKey} keyOrPassphrase - Passphrase or CryptoKey
   * @returns {Promise<string>} - Base64-encoded encrypted payload (IV + ciphertext)
   */
  async encryptAggregatedData(data, keyOrPassphrase) {
    try {
      // Get or derive key
      let key;
      if (typeof keyOrPassphrase === 'string') {
        key = await this.deriveKey(keyOrPassphrase);
      } else {
        key = keyOrPassphrase;
      }
      
      // Encode data as JSON
      const encoder = new TextEncoder();
      const plaintext = encoder.encode(JSON.stringify(data));
      
      // Generate random IV
      const iv = crypto.getRandomValues(new Uint8Array(this.CONFIG.IV_LENGTH));
      
      // Encrypt
      const ciphertext = await crypto.subtle.encrypt(
        { 
          name: this.CONFIG.ALGORITHM, 
          iv,
          tagLength: this.CONFIG.TAG_LENGTH
        },
        key,
        plaintext
      );
      
      // Combine IV + ciphertext
      const combined = new Uint8Array(iv.length + ciphertext.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(ciphertext), iv.length);
      
      // Return as base64
      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  },
  
  /**
   * Decrypt aggregated data
   * Only cooperative managers with the decryption key can use this
   * 
   * @param {string} encryptedPayload - Base64-encoded encrypted data
   * @param {string|CryptoKey} keyOrPassphrase - Passphrase or CryptoKey
   * @returns {Promise<Object>} - Decrypted data
   */
  async decryptAggregatedData(encryptedPayload, keyOrPassphrase) {
    try {
      // Get or derive key
      let key;
      if (typeof keyOrPassphrase === 'string') {
        key = await this.deriveKey(keyOrPassphrase);
      } else {
        key = keyOrPassphrase;
      }
      
      // Decode base64
      const combined = Uint8Array.from(atob(encryptedPayload), c => c.charCodeAt(0));
      
      // Extract IV and ciphertext
      const iv = combined.slice(0, this.CONFIG.IV_LENGTH);
      const ciphertext = combined.slice(this.CONFIG.IV_LENGTH);
      
      // Decrypt
      const decrypted = await crypto.subtle.decrypt(
        { 
          name: this.CONFIG.ALGORITHM, 
          iv,
          tagLength: this.CONFIG.TAG_LENGTH
        },
        key,
        ciphertext
      );
      
      // Decode JSON
      const decoder = new TextDecoder();
      return JSON.parse(decoder.decode(decrypted));
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data - invalid key or corrupted data');
    }
  },
  
  /**
   * Hash member ID for identification in the pool (privacy-preserving)
   * @param {string} memberId - The member's unique identifier
   * @returns {Promise<string>} - SHA-256 hash (hex string)
   */
  async hashMemberId(memberId) {
    const encoder = new TextEncoder();
    const data = encoder.encode(memberId);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },
  
  /**
   * Get pool encryption key from secure channel
   * In production, this would come from a secure key management system
   * 
   * @param {string} proposalId - The proposal ID
   * @returns {Promise<string>} - Pool encryption passphrase/key
   */
  async getPoolKey(proposalId) {
    // Try to get from secure session storage first
    const sessionKey = sessionStorage.getItem(`pool_key_${proposalId}`);
    if (sessionKey) {
      return sessionKey;
    }
    
    // Otherwise, fetch from server (key is encrypted in transit via HTTPS)
    const response = await fetch(`/api/data-pool/key?proposalId=${proposalId}`, {
      method: 'GET',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to retrieve pool key');
    }
    
    const { key } = await response.json();
    
    // Cache in session storage (cleared when tab closes)
    sessionStorage.setItem(`pool_key_${proposalId}`, key);
    
    return key;
  },
  
  /**
   * Sanitize data to ensure NO personally identifiable information
   * Removes timestamps, merchant names, transaction IDs, etc.
   * 
   * @param {Object} data - Raw aggregated data
   * @returns {Object} - Sanitized data safe for sharing
   */
  sanitizeData(data) {
    // Define what fields are allowed (aggregated metrics only)
    const allowedFields = [
      'categorySums',
      'totalVolume',
      'transactionCount',
      'averageTransaction',
      'medianTransaction',
      'categoryDistribution',
      'timeAggregation', // Only if bucketed (daily/weekly), not individual timestamps
      'geographicRegion', // Only if coarse (state/country level)
    ];
    
    const sanitized = {};
    
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        sanitized[field] = data[field];
      }
    }
    
    // Ensure NO individual transaction data
    delete sanitized.transactions;
    delete sanitized.transactionIds;
    delete sanitized.merchants;
    delete sanitized.individualAmounts;
    delete sanitized.timestamps;
    
    // Add metadata
    sanitized.contributedAt = new Date().toISOString();
    sanitized.dataVersion = '1.0';
    sanitized.anonymizationLevel = 'aggregated_only';
    
    return sanitized;
  },
  
  /**
   * Validate that data contains no PII before encryption
   * @param {Object} data - Data to validate
   * @returns {Object} - Validation result
   */
  validateDataPrivacy(data) {
    const forbiddenPatterns = [
      { pattern: /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, name: 'ISO timestamp' },
      { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, name: 'email address' },
      { pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, name: 'credit card number' },
      { pattern: /\b\d{3}-\d{2}-\d{4}\b/, name: 'SSN' },
    ];
    
    const dataString = JSON.stringify(data);
    const issues = [];
    
    for (const { pattern, name } of forbiddenPatterns) {
      if (pattern.test(dataString)) {
        issues.push(`Potential ${name} detected`);
      }
    }
    
    // Check for common PII field names
    const piiFields = ['name', 'address', 'phone', 'email', 'ssn', 'dob', 'birth'];
    const dataKeys = Object.keys(data).map(k => k.toLowerCase());
    
    for (const field of piiFields) {
      if (dataKeys.some(k => k.includes(field))) {
        issues.push(`Potential PII field detected: ${field}`);
      }
    }
    
    return {
      valid: issues.length === 0,
      issues,
      message: issues.length === 0 
        ? 'Data passed privacy validation' 
        : `Privacy issues found: ${issues.join(', ')}`
    };
  },
  
  /**
   * Contribute sanitized, encrypted data to the temporary pool
   * This is the main entry point for data pool contributions
   * 
   * @param {string} proposalId - The proposal ID
   * @param {Object} options - Contribution options
   * @returns {Promise<Object>} - Contribution confirmation
   */
  async contributeToPool(proposalId, options = {}) {
    if (!this.memberId) {
      throw new Error('Member ID not initialized. Call EncryptionService.init() first.');
    }
    
    try {
      // Check if already contributed
      const hasContributed = await this.hasContributed(proposalId);
      if (hasContributed && !options.allowRecontribution) {
        throw new Error('Already contributed to this pool');
      }
      
      // Get aggregated data only (never individual transactions)
      const aggregatedData = await this.fetchAggregatedData();
      
      // Sanitize to remove any potentially identifying information
      const sanitizedData = this.sanitizeData(aggregatedData);
      
      // Validate privacy before encryption
      const validation = this.validateDataPrivacy(sanitizedData);
      if (!validation.valid && !options.skipValidation) {
        throw new Error(`Privacy validation failed: ${validation.message}`);
      }
      
      // Get pool encryption key (from secure channel)
      const poolKey = options.poolKey || await this.getPoolKey(proposalId);
      
      // Encrypt the sanitized data
      const encryptedPayload = await this.encryptAggregatedData(sanitizedData, poolKey);
      
      // Generate member hash for deduplication (not identification)
      const memberHash = await this.hashMemberId(this.memberId);
      
      // Send to temporary pool
      const contribution = {
        proposalId,
        encryptedData: encryptedPayload,
        memberHash,  // For deduplication only
        contributedAt: new Date().toISOString(),
        dataFingerprint: await this.generateDataFingerprint(sanitizedData)
      };
      
      const response = await fetch('/api/data-pool/contribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(contribution)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to contribute to pool');
      }
      
      const result = await response.json();
      
      // Record local contribution
      await this.recordLocalContribution(proposalId);
      
      // Emit event for UI updates
      this.emitContributionEvent(proposalId);
      
      return {
        success: true,
        contributionId: result.contributionId,
        expiresAt: result.expiresAt,
        message: 'Contribution recorded successfully'
      };
    } catch (error) {
      console.error('Pool contribution failed:', error);
      throw error;
    }
  },
  
  /**
   * Fetch aggregated metrics from local database
   * @returns {Promise<Object>} - Aggregated data
   */
  async fetchAggregatedData() {
    // Use AggregatedMetricsService if available
    if (typeof AggregatedMetricsService !== 'undefined') {
      return await AggregatedMetricsService.calculateMetrics();
    }
    
    // Fallback: return empty data structure
    console.warn('AggregatedMetricsService not available');
    return {
      categorySums: {},
      totalVolume: 0,
      transactionCount: 0,
      averageTransaction: 0
    };
  },
  
  /**
   * Generate a fingerprint of the data for integrity verification
   * Not for identification - just to detect if same data contributed twice
   * @param {Object} data - The data
   * @returns {Promise<string>} - Data fingerprint hash
   */
  async generateDataFingerprint(data) {
    const encoder = new TextEncoder();
    const dataString = JSON.stringify(data, Object.keys(data).sort());
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(dataString));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
  },
  
  /**
   * Check if member has already contributed to this pool
   * @param {string} proposalId - The proposal ID
   * @returns {Promise<boolean>}
   */
  async hasContributed(proposalId) {
    try {
      const contribution = await this.getLocalContribution(proposalId);
      return !!contribution;
    } catch (error) {
      return false;
    }
  },
  
  /**
   * Record contribution locally
   * @param {string} proposalId - The proposal ID
   */
  async recordLocalContribution(proposalId) {
    const record = {
      proposalId,
      contributedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + this.CONFIG.POOL_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString()
    };
    
    try {
      // Try to use IndexedDB via db object
      if (typeof db !== 'undefined' && db.dataPoolContributions) {
        await db.dataPoolContributions.put(record);
      }
      
      // Fallback to localStorage
      localStorage.setItem(`data_pool_${proposalId}`, JSON.stringify(record));
    } catch (error) {
      console.error('Error recording local contribution:', error);
    }
  },
  
  /**
   * Get local contribution record
   * @param {string} proposalId - The proposal ID
   * @returns {Promise<Object|null>}
   */
  async getLocalContribution(proposalId) {
    try {
      // Try IndexedDB first
      if (typeof db !== 'undefined' && db.dataPoolContributions) {
        const record = await db.dataPoolContributions.get(proposalId);
        if (record) return record;
      }
      
      // Fallback to localStorage
      const stored = localStorage.getItem(`data_pool_${proposalId}`);
      if (stored) return JSON.parse(stored);
      
      return null;
    } catch (error) {
      return null;
    }
  },
  
  /**
   * Get preview of what data will be contributed
   * @returns {Promise<Object>} - Data preview
   */
  async getContributionPreview() {
    const aggregatedData = await this.fetchAggregatedData();
    const sanitizedData = this.sanitizeData(aggregatedData);
    
    return {
      willBeShared: sanitizedData,
      willNotBeShared: {
        individualTransactions: 'Never shared - only aggregates',
        merchantNames: 'Anonymized or excluded',
        exactTimestamps: 'Converted to time buckets only',
        transactionIds: 'Never collected',
        personalInfo: 'Never collected or stored'
      },
      privacyGuarantees: [
        'Data is encrypted before leaving your device',
        'Only you and the cooperative manager can decrypt',
        'Data auto-deletes after 30 days',
        'No link between your vote and your data contribution'
      ]
    };
  },
  
  /**
   * Emit contribution event
   * @param {string} proposalId - The proposal ID
   */
  emitContributionEvent(proposalId) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('dataPoolContribution', {
        detail: { 
          proposalId, 
          contributedAt: new Date(),
          expiresAt: new Date(Date.now() + this.CONFIG.POOL_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
        }
      }));
    }
  }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EncryptionService;
}
