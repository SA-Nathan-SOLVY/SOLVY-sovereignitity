/**
 * SOLVY Receipt Region Detector
 *
 * Thin wrapper around the model-agnostic quad detector.
 */

import { detectQuad, isModelAvailable as isQuadModelAvailable } from './quad-detector.js'

const RECEIPT_MODEL_PATH = '/models/receipt-detector.onnx'
const DEFAULT_MODE = 'mock'

/**
 * Detect receipt corners in an image.
 * @param {HTMLImageElement|HTMLCanvasElement} image
 * @param {Object} options
 * @param {string} options.mode — 'mock' | 'yolo-onnx'
 * @returns {Promise<Array<{x:number, y:number}>|null>}
 */
export async function detectReceipt(image, options = {}) {
  return detectQuad(image, {
    mode: options.mode || DEFAULT_MODE,
    modelPath: RECEIPT_MODEL_PATH,
    confThreshold: 0.25,
    iouThreshold: 0.45,
    minAreaRatio: 0.05
  })
}

/**
 * Check whether the receipt ONNX model file is available.
 * @returns {Promise<boolean>}
 */
export async function isModelAvailable() {
  return isQuadModelAvailable(RECEIPT_MODEL_PATH)
}
