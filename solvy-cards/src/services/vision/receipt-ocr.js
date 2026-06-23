/**
 * SOLVY Receipt / ID OCR — Tesseract.js wrapper
 *
 * Runs OCR locally in the browser/Capacitor app.
 * No image data is sent to external APIs.
 *
 * The English traineddata file is served from /tessdata/eng.traineddata
 * so it never leaves SOLVY's domain.
 */

import Tesseract from 'tesseract.js'

const workers = new Map()

/**
 * Initialize a Tesseract worker lazily.
 * @param {'default'|'id'} type
 * @returns {Promise<object>}
 */
async function getWorker(type = 'default') {
  if (!workers.has(type)) {
    console.log(`[OCR] Creating Tesseract worker (${type})...`)
    const worker = await Tesseract.createWorker('eng', 1, {
      logger: m => {
        console.log('[OCR]', m.status, Math.round(m.progress * 100) + '%')
      },
      errorHandler: err => console.error('[OCR] Worker error:', err),
      workerPath: '/tessdata/worker.min.js',
      langPath: '/tessdata',
      gzip: false
    })

    if (type === 'id') {
      // Constrain to characters commonly found on ID documents.
      await worker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-/. ,'
      })
    }

    workers.set(type, worker)
    console.log(`[OCR] Worker ready (${type})`)
  }
  return workers.get(type)
}

/**
 * Normalize image source for Tesseract.
 */
function normalizeSource(source) {
  return source instanceof HTMLCanvasElement ? source.toDataURL('image/png') : source
}

/**
 * Run OCR on an image element, canvas, or image URL.
 * @param {HTMLImageElement|HTMLCanvasElement|string} source
 * @returns {Promise<{text: string, confidence: number}>}
 */
export async function recognizeText(source) {
  const worker = await getWorker('default')
  const normalized = normalizeSource(source)
  console.log('[OCR] Recognizing...')
  const result = await worker.recognize(normalized)
  console.log('[OCR] Done. Text length:', result.data.text.length, 'confidence:', result.data.confidence)
  return {
    text: result.data.text,
    confidence: result.data.confidence
  }
}

/**
 * Run OCR optimized for ID documents.
 * @param {HTMLImageElement|HTMLCanvasElement|string} source
 * @returns {Promise<{text: string, confidence: number}>}
 */
export async function recognizeIdText(source) {
  const worker = await getWorker('id')
  const normalized = normalizeSource(source)
  console.log('[OCR] Recognizing ID...')
  const result = await worker.recognize(normalized)
  console.log('[OCR] ID done. Text length:', result.data.text.length, 'confidence:', result.data.confidence)
  return {
    text: result.data.text,
    confidence: result.data.confidence
  }
}

/**
 * Terminate OCR workers and free memory.
 */
export async function terminateOcr() {
  for (const [type, worker] of workers) {
    await worker.terminate()
    console.log(`[OCR] Worker terminated (${type})`)
  }
  workers.clear()
}
