/**
 * SOLVY ID Document Processor — Main orchestrator for KYC document capture
 *
 * Privacy-first flow:
 * 1. Capture image from camera/gallery
 * 2. Detect document region (YOLO or mock fallback)
 * 3. Perspective-correct the document
 * 4. Run quality checks (blur, glare, cutoff, rotation)
 * 5. OCR the document locally
 * 6. Extract name, DOB, ID number, expiry, state
 * 7. Return structured data + corrected image data URL
 * 8. Release raw image references
 *
 * No raw ID image is persisted or transmitted except the final corrected image
 * sent to Lithic during submission, which is then deleted from memory.
 */

import { detectDocument } from './vision/document-detector.js'
import { correctPerspective, noCorrection } from './vision/perspective-correction.js'
import { recognizeIdText, terminateOcr } from './vision/receipt-ocr.js'
import { extractIdData } from './vision/extract-id-data.js'
import { checkDocumentQuality } from './vision/id-quality-checks.js'

const ID_ASPECT_RATIO = 85.6 / 54.0  // Standard driver's license aspect ratio

/**
 * Process an ID document image into structured data.
 *
 * @param {string} imageUri — data URL, blob URL, or file path from Capacitor camera
 * @param {Object} options
 * @param {string} options.mode — 'mock' | 'yolo-onnx'
 * @returns {Promise<Object>}
 */
export async function processIdDocument(imageUri, options = {}) {
  const mode = options.mode || 'yolo-onnx'

  let image = null
  let croppedCanvas = null

  try {
    image = await loadImage(imageUri)
    console.log('[IdDocumentProcessor] Image loaded:', image.width, 'x', image.height)

    const corners = await detectDocument(image, { mode })
    console.log('[IdDocumentProcessor] Detected corners:', JSON.stringify(corners))

    if (corners) {
      try {
        croppedCanvas = correctPerspective(image, corners, { targetAspectRatio: ID_ASPECT_RATIO })
        console.log('[IdDocumentProcessor] Perspective corrected crop:', croppedCanvas.width, 'x', croppedCanvas.height)
      } catch (err) {
        console.warn('[IdDocumentProcessor] Perspective correction failed, using full image:', err)
        croppedCanvas = noCorrection(image)
      }
    } else {
      croppedCanvas = noCorrection(image)
    }

    const quality = checkDocumentQuality(image, corners)
    console.log('[IdDocumentProcessor] Quality:', quality)

    let { text: rawText, confidence } = await recognizeIdText(croppedCanvas)
    console.log('[IdDocumentProcessor] Crop OCR raw text length:', rawText.length, 'confidence:', confidence)

    if (rawText.trim().length < 10 || confidence < 30) {
      console.warn('[IdDocumentProcessor] Crop OCR weak, falling back to full-image OCR')
      const fallback = await recognizeIdText(image)
      if (fallback.text.trim().length > rawText.trim().length) {
        rawText = fallback.text
        confidence = fallback.confidence
        console.log('[IdDocumentProcessor] Full-image OCR raw text length:', rawText.length, 'confidence:', confidence)
      }
    }

    const extracted = extractIdData(rawText)

    return {
      ...extracted,
      correctedImage: croppedCanvas.toDataURL('image/jpeg', 0.92),
      quality,
      confidence,
      rawText: extracted.rawText
    }
  } finally {
    image = null
    croppedCanvas = null
  }
}

/**
 * Load an image URI into an HTMLImageElement
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

export { terminateOcr }
