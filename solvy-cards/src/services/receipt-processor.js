/**
 * SOLVY Receipt Processor — Main orchestrator
 *
 * Privacy-first flow:
 * 1. Capture image from camera/gallery
 * 2. Detect receipt region (YOLO or mock fallback)
 * 3. Perspective-correct the receipt
 * 4. OCR the receipt locally
 * 5. Extract merchant, date, amounts
 * 6. Categorize the transaction
 * 7. Return structured data
 * 8. Delete raw image from memory
 *
 * No raw receipt image is persisted or transmitted.
 */

import { detectReceipt } from './vision/receipt-detector.js'
import { correctPerspective, noCorrection } from './vision/perspective-correction.js'
import { recognizeText, terminateOcr } from './vision/receipt-ocr.js'
import { extractReceiptData } from './vision/extract-receipt-data.js'
import { categorize } from './budget-categories.js'

/**
 * Process a receipt image into structured data.
 *
 * @param {string} imageUri — data URL, blob URL, or file path from Capacitor camera
 * @param {Object} options
 * @param {string} options.mode — 'mock' | 'yolo-onnx'
 * @param {string} options.modelPath — path to YOLO ONNX model
 * @returns {Promise<Object>}
 */
export async function processReceipt(imageUri, options = {}) {
  const mode = options.mode || 'yolo-onnx'

  let image = null
  let croppedCanvas = null

  try {
    // Load image into an HTMLImageElement
    image = await loadImage(imageUri)
    console.log('[ReceiptProcessor] Image loaded:', image.width, 'x', image.height)

    // 1. Detect receipt region
    const corners = await detectReceipt(image, { mode, modelPath: options.modelPath })
    console.log('[ReceiptProcessor] Detected corners:', JSON.stringify(corners))

    // 2. Perspective correction (or whole image if detection fails)
    if (corners) {
      try {
        croppedCanvas = correctPerspective(image, corners)
        console.log('[ReceiptProcessor] Perspective corrected crop:', croppedCanvas.width, 'x', croppedCanvas.height)
      } catch (err) {
        console.warn('[ReceiptProcessor] Perspective correction failed, using full image:', err)
        croppedCanvas = noCorrection(image)
      }
    } else {
      croppedCanvas = noCorrection(image)
    }

    // 3. OCR locally (prefer perspective crop, fall back to full image if empty)
    let { text: rawText, confidence } = await recognizeText(croppedCanvas)
    console.log('[ReceiptProcessor] Crop OCR raw text length:', rawText.length, 'confidence:', confidence)

    if (rawText.trim().length < 10 || confidence < 30) {
      console.warn('[ReceiptProcessor] Crop OCR weak, falling back to full-image OCR')
      const fallback = await recognizeText(image)
      if (fallback.text.trim().length > rawText.trim().length) {
        rawText = fallback.text
        confidence = fallback.confidence
        console.log('[ReceiptProcessor] Full-image OCR raw text length:', rawText.length, 'confidence:', confidence)
      }
    }

    // 4. Extract structured data
    const extracted = extractReceiptData(rawText)

    // 5. Categorize
    const category = categorize(extracted.merchant + ' ' + rawText)

    return {
      merchant: extracted.merchant,
      date: extracted.date,
      amount: extracted.total !== null ? `$${extracted.total.toFixed(2)}` : '$0.00',
      numericAmount: extracted.total,
      tax: extracted.tax,
      tip: extracted.tip,
      subtotal: extracted.subtotal,
      category,
      confidence,
      rawText: extracted.rawText,
      // We intentionally do NOT return the raw image.
      // The caller receives only structured, member-owned data.
    }
  } finally {
    // 6. Release image references to allow garbage collection
    image = null
    croppedCanvas = null
  }
}

/**
 * Load an image URI into an HTMLImageElement
 * @param {string} imageUri
 * @returns {Promise<HTMLImageElement>}
 */
function loadImage(imageUri) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = imageUri
  })
}

/**
 * Clean up OCR worker when leaving the receipt page/app
 */
export { terminateOcr }
