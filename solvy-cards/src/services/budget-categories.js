/**
 * SOLVY Receipt Categorization — POC keyword-based matcher
 *
 * Mirrors the logic in solvy-platform/js/services/budget-service.js::autoCategorize()
 * until a shared service can be used across apps.
 *
 * Categories aligned with SOLVY Accounting™ budget categories.
 */

const CATEGORY_KEYWORDS = {
  'Housing': ['rent', 'mortgage', 'apartment', 'landlord', 'hoa', 'property'],
  'Transportation': ['gas', 'uber', 'lyft', 'taxi', 'parking', 'metro', 'transit', 'bus', 'auto'],
  'Food': ['grocery', 'restaurant', 'cafe', 'coffee', 'fast food', 'pizza', 'doordash', 'grubhub'],
  'Utilities': ['electric', 'water', 'gas bill', 'internet', 'phone', 'wireless', 'utility'],
  'Healthcare': ['pharmacy', 'doctor', 'hospital', 'clinic', 'dental', 'medical', 'health'],
  'Insurance': ['insurance', 'premium', 'geico', 'state farm', 'allstate'],
  'Entertainment': ['movie', 'streaming', 'netflix', 'spotify', 'game', 'theater'],
  'Shopping': ['amazon', 'walmart', 'target', 'costco', 'retail', 'store', 'mall'],
  'Debt Payments': ['loan', 'credit card', 'payment', 'finance'],
  'Education': ['tuition', 'book', 'course', 'school', 'university'],
  'Personal Care': ['salon', 'barber', 'beauty', 'spa', 'hair'],
  'SPS / Business': ['sps', 'supplier', 'inventory', 'wholesale', 'ebl', 'beauty supply']
}

/**
 * Categorize a merchant/description string
 * @param {string} text
 * @returns {string}
 */
export function categorize(text) {
  if (!text) return 'Uncategorized'
  const lower = text.toLowerCase()

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      return category
    }
  }

  return 'Uncategorized'
}
