/**
 * Extract structured receipt data from OCR text
 *
 * Uses regex heuristics. This is intentionally simple for the POC.
 * Future: replace with a small on-device NER model or lightweight LLM running locally.
 */

const DATE_PATTERNS = [
  /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/,
  /(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/,
  /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4}/i
]

const TOTAL_KEYWORDS = ['total', 'balance due', 'amount due', 'grand total', 'sum', 'due']
const TAX_KEYWORDS = ['tax', 'sales tax', 'vat']
const TIP_KEYWORDS = ['tip', 'gratuity']
const SUBTOTAL_KEYWORDS = ['subtotal', 'sub-total']

/**
 * Parse currency amount from a line
 * @param {string} line
 * @returns {number|null}
 */
function parseAmount(line) {
  // Match formats: $12.34, 12.34, -12.34, (12.34)
  const match = line.match(/-?\(?\$?\s*(\d{1,3}(?:,\d{3})*\.\d{2})\)?/)
  return match ? parseFloat(match[1].replace(',', '')) : null
}

/**
 * Find amount associated with a keyword
 * @param {string[]} lines
 * @param {string[]} keywords
 * @returns {number|null}
 */
function findAmountByKeywords(lines, keywords) {
  for (const line of lines) {
    const lower = line.toLowerCase()
    if (keywords.some(kw => new RegExp(`\\b${kw}\\b`).test(lower))) {
      const amount = parseAmount(line)
      if (amount !== null && amount >= 0) return amount
    }
  }
  return null
}

/**
 * Heuristic merchant extraction: first non-empty line that is not a date or address
 * @param {string[]} lines
 * @returns {string}
 */
function extractMerchant(lines) {
  const skipPatterns = [
    /\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/,
    /^\d+\s+/,
    /^(tel|phone|fax|www|http|email|receipt|invoice|order|ticket|cashier|terminal|store|date)$/i
  ]

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.length < 2) continue
    if (skipPatterns.some(p => p.test(trimmed))) continue
    // Strip decorative border characters (|, =, -, etc.) that Tesseract often
    // reads from receipt edges.
    const cleaned = trimmed.replace(/^[|=\-\s]+|[|=\-\s]+$/g, '')
    if (cleaned.length >= 2) return cleaned
  }

  return 'Unknown Merchant'
}

/**
 * Extract structured data from raw OCR text
 * @param {string} rawText
 * @returns {Object}
 */
export function extractReceiptData(rawText) {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean)

  // Date
  let date = null
  for (const pattern of DATE_PATTERNS) {
    const match = rawText.match(pattern)
    if (match) {
      date = match[1] || match[0]
      break
    }
  }

  // Amounts
  const total = findAmountByKeywords(lines, TOTAL_KEYWORDS)
  const tax = findAmountByKeywords(lines, TAX_KEYWORDS)
  const tip = findAmountByKeywords(lines, TIP_KEYWORDS)
  const subtotal = findAmountByKeywords(lines, SUBTOTAL_KEYWORDS)

  // Fallback total: largest amount in receipt if no total keyword found
  const fallbackTotal = total === null
    ? lines.map(parseAmount).filter(a => a !== null).sort((a, b) => b - a)[0] || null
    : null

  const merchant = extractMerchant(lines)
  const finalTotal = total ?? fallbackTotal

  return {
    merchant,
    date: date || new Date().toLocaleDateString(),
    total: finalTotal,
    tax,
    tip,
    subtotal,
    lineItems: [], // TODO: line-item extraction in Phase 2
    rawText: lines.join('\n')
  }
}
