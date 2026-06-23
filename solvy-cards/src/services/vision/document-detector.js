/**
 * SOLVY ID Document Region Detector
 *
 * Thin wrapper around the model-agnostic quad detector for KYC documents.
 */

import { detectQuad, isModelAvailable as isQuadModelAvailable } from './quad-detector.js'

const DOCUMENT_MODEL_PATH = '/models/document-detector.onnx'
const DEFAULT_MODE = 'mock'

/**
 * Detect ID document corners in an image.
 * @param {HTMLImageElement|HTMLCanvasElement} image
 * @param {Object} options
 * @param {string} options.mode — 'mock' | 'yolo-onnx'
 * @returns {Promise<Array<{x:number, y:number}>|null>}
 */
export async function detectDocument(image, options = {}) {
  return detectQuad(image, {
    mode: options.mode || DEFAULT_MODE,
    modelPath: DOCUMENT_MODEL_PATH,
    confThreshold: 0.25,
    iouThreshold: 0.45,
    minAreaRatio: 0.08
  })
}

/**
 * Check whether the document ONNX model file is available.
 * @returns {Promise<boolean>}
 */
export async function isDocumentModelAvailable() {
  return isQuadModelAvailable(DOCUMENT_MODEL_PATH)
}
