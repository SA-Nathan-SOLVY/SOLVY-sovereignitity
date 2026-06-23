/**
 * SOLVY Receipt Storage — Local-first, POC version
 *
 * Stores processed receipt metadata in localStorage.
 * Raw receipt images are NOT persisted; only extracted structured data is kept.
 *
 * TODO: Replace with IndexedDB integration to SOLVY Accounting™ (solvy-platform/js/services/db.js)
 *       and BudgetService.autoCategorize() once cross-app data layer is defined.
 */

const STORAGE_KEY = 'solvy_receipts_poc'

/**
 * Load all stored receipts
 * @returns {Array}
 */
export function loadReceipts() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (err) {
    console.error('[ReceiptStorage] Load error:', err)
    return []
  }
}

/**
 * Save receipts array
 * @param {Array} receipts
 */
export function saveReceipts(receipts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts))
  } catch (err) {
    console.error('[ReceiptStorage] Save error:', err)
  }
}

/**
 * Add a new receipt
 * @param {Object} receipt
 * @returns {Array} updated receipts
 */
export function addReceipt(receipt) {
  const receipts = loadReceipts()
  const updated = [receipt, ...receipts]
  saveReceipts(updated)
  return updated
}

/**
 * Update a receipt by id
 * @param {string|number} id
 * @param {Object} updates
 * @returns {Array} updated receipts
 */
export function updateReceipt(id, updates) {
  const receipts = loadReceipts()
  const updated = receipts.map(r => (r.id === id ? { ...r, ...updates } : r))
  saveReceipts(updated)
  return updated
}

/**
 * Clear all stored receipts (member right to deletion)
 */
export function clearReceipts() {
  localStorage.removeItem(STORAGE_KEY)
}
