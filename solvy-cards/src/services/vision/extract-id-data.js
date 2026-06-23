/**
 * Extract structured ID document data from OCR text.
 *
 * Privacy-first heuristic parser. No raw text is sent to servers.
 */

const DATE_PATTERNS = [
  /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
  /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/
]

/**
 * Parse ID document OCR text into structured fields.
 * @param {string} rawText
 * @returns {Object}
 */
export function extractIdData(rawText) {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean)
  const text = rawText.toUpperCase()

  const idNumber = extractIdNumber(lines, text)
  const firstName = extractFirstName(lines, text)
  const lastName = extractLastName(lines, text)
  const dob = extractDateOfBirth(lines, text)
  const expiry = extractExpiry(lines, text)
  const state = extractState(lines, text)
  const address = extractAddress(lines)

  return {
    idNumber,
    firstName,
    lastName,
    fullName: [firstName, lastName].filter(Boolean).join(' '),
    dateOfBirth: dob,
    expiryDate: expiry,
    issuingState: state,
    address,
    documentType: inferDocumentType(text),
    rawText: lines.join('\n')
  }
}

function extractIdNumber(lines, text) {
  // Look for explicit ID/DL/LN/NO labels followed by digits
  for (const line of lines) {
    const upper = line.toUpperCase()
    const match = upper.match(/(?:ID|DL|LICENSE|LIC|NO|NUMBER|#)\s*[:#]?\s*([A-Z0-9]{4,20})/)
    if (match) return match[1]
  }

  // Fallback: standalone 6-12 digit/alphanumeric token
  const tokens = text.split(/\s+/)
  for (const token of tokens) {
    if (/^[A-Z0-9]{6,12}$/.test(token) && /\d/.test(token)) {
      return token
    }
  }
  return null
}

function extractLastName(lines, text) {
  for (const line of lines) {
    const upper = line.toUpperCase()
    const match = upper.match(/(?:LN|LAST)\s*[:]?\s*([A-Z]{2,30})/)
    if (match) return titleCase(match[1])
  }
  return null
}

function extractFirstName(lines, text) {
  for (const line of lines) {
    const upper = line.toUpperCase()
    const match = upper.match(/(?:FN|FIRST)\s*[:]?\s*([A-Z]{2,30})/)
    if (match) return titleCase(match[1])
  }
  return null
}

function extractDateOfBirth(lines, text) {
  for (const line of lines) {
    const upper = line.toUpperCase()
    if (upper.includes('DOB') || upper.includes('BIRTH') || upper.includes('BORN')) {
      const match = line.match(DATE_PATTERNS[0]) || line.match(DATE_PATTERNS[1])
      if (match) return match[1]
    }
  }
  return null
}

function extractExpiry(lines, text) {
  for (const line of lines) {
    const upper = line.toUpperCase()
    if (upper.includes('EXP') || upper.includes('EXPIRES') || upper.includes('EXPIRATION')) {
      const match = line.match(DATE_PATTERNS[0]) || line.match(DATE_PATTERNS[1])
      if (match) return match[1]
    }
  }
  return null
}

function extractState(lines, text) {
  const stateNames = [
    'TEXAS', 'CALIFORNIA', 'FLORIDA', 'NEW YORK', 'GEORGIA',
    'NORTH CAROLINA', 'OHIO', 'MICHIGAN', 'PENNSYLVANIA', 'ILLINOIS',
    'ARIZONA', 'COLORADO', 'WASHINGTON', 'VIRGINIA', 'NEW JERSEY'
  ]

  for (const state of stateNames) {
    if (text.includes(state)) return state
  }

  // Two-letter state codes on addresses
  const stateCodeMatch = text.match(/,\s*([A-Z]{2})\s+\d{5}/)
  if (stateCodeMatch) return stateCodeMatch[1]

  return null
}

function extractAddress(lines) {
  for (const line of lines) {
    const match = line.match(/(\d+\s+[A-Z]+\s+(?:ST|AVE|BLVD|RD|DR|LN|WAY))/i)
    if (match) return match[1]
  }
  return null
}

function inferDocumentType(text) {
  if (text.includes('PASSPORT')) return 'passport'
  if (text.includes('DRIVER') || text.includes('LICENSE') || text.includes('DL ')) return 'drivers_license'
  return 'state_id'
}

function titleCase(str) {
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}
