/**
 * SOLVY Quad Region Detector (model-agnostic)
 *
 * Detects a quadrilateral region in an image using an on-device Ultralytics YOLOv8n-OBB model.
 *
 * Modes:
 * - 'mock': returns image corners as the region (useful for development/OCR-only testing)
 * - 'yolo-onnx': loads the ONNX model and runs inference with onnxruntime-web
 *
 * The ONNX model, wasm binary, and all inference stay on the member's device.
 */

import * as ort from 'onnxruntime-web'

const DEFAULT_MODE = 'mock'
const INPUT_SIZE = 640
const DEFAULT_CONF_THRESHOLD = 0.25
const DEFAULT_IOU_THRESHOLD = 0.45
const DEFAULT_MIN_AREA_RATIO = 0.05

// One session per model path so receipt and document detectors can coexist.
const sessions = new Map()
const modelLoadErrors = new Map()

/**
 * Initialize ONNX Runtime session lazily for a given model path.
 */
async function getSession(modelPath) {
  if (sessions.has(modelPath)) return sessions.get(modelPath)
  if (modelLoadErrors.has(modelPath)) throw modelLoadErrors.get(modelPath)

  try {
    ort.env.wasm.wasmPaths = '/onnx-wasm/'
    ort.env.wasm.numThreads = 1

    const session = await ort.InferenceSession.create(modelPath, {
      executionProviders: ['wasm'],
      graphOptimizationLevel: 'all'
    })
    console.log(`[QuadDetector] ONNX model loaded: ${modelPath}`)
    sessions.set(modelPath, session)
    return session
  } catch (err) {
    modelLoadErrors.set(modelPath, err)
    console.error(`[QuadDetector] Failed to load ONNX model ${modelPath}:`, err)
    throw err
  }
}

/**
 * Detect a quadrilateral region in an image.
 * @param {HTMLImageElement|HTMLCanvasElement} image
 * @param {Object} options
 * @param {string} options.mode — 'mock' | 'yolo-onnx'
 * @param {string} options.modelPath — path to ONNX model (default: '/models/quad-detector.onnx')
 * @param {number} options.confThreshold — confidence threshold after sigmoid (default 0.25)
 * @param {number} options.iouThreshold — NMS IoU threshold (default 0.45)
 * @param {number} options.minAreaRatio — minimum detection area as ratio of input size (default 0.05)
 * @returns {Promise<Array<{x:number, y:number}>|null>}
 */
export async function detectQuad(image, options = {}) {
  const mode = options.mode || DEFAULT_MODE
  const modelPath = options.modelPath || '/models/quad-detector.onnx'

  if (mode === 'mock') {
    return mockDetect(image)
  }

  if (mode === 'yolo-onnx') {
    return yoloDetect(image, modelPath, options)
  }

  throw new Error(`Unknown quad detector mode: ${mode}`)
}

/**
 * Check whether an ONNX model file is available.
 * @param {string} modelPath
 * @returns {Promise<boolean>}
 */
export async function isModelAvailable(modelPath) {
  try {
    const response = await fetch(modelPath, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Mock detector: assume the whole image is the region.
 */
function mockDetect(image) {
  const width = image.width || image.naturalWidth || image.videoWidth || 100
  const height = image.height || image.naturalHeight || image.videoHeight || 100

  const pad = 0.02
  return [
    { x: width * pad, y: height * pad },
    { x: width * (1 - pad), y: height * pad },
    { x: width * (1 - pad), y: height * (1 - pad) },
    { x: width * pad, y: height * (1 - pad) }
  ]
}

/**
 * YOLO-onnx detector.
 */
async function yoloDetect(image, modelPath, options) {
  try {
    const sess = await getSession(modelPath)
    const confThreshold = options.confThreshold ?? DEFAULT_CONF_THRESHOLD
    const iouThreshold = options.iouThreshold ?? DEFAULT_IOU_THRESHOLD
    const minAreaRatio = options.minAreaRatio ?? DEFAULT_MIN_AREA_RATIO
    const minArea = INPUT_SIZE * INPUT_SIZE * minAreaRatio

    const { tensor, scale, padX, padY } = preprocess(image)
    const feeds = { [sess.inputNames[0]]: tensor }
    const results = await sess.run(feeds)
    const output = results[sess.outputNames[0]]

    const detections = decodeDetections(output.data, output.dims, scale, padX, padY, confThreshold)

    if (detections.length === 0) {
      console.warn('[QuadDetector] No region detected, falling back to whole image')
      return mockDetect(image)
    }

    const best = selectBestDetection(nms(detections, iouThreshold), minArea)
    if (!best) {
      console.warn('[QuadDetector] No suitably-sized region found, falling back to whole image')
      return mockDetect(image)
    }
    return best.corners
  } catch (err) {
    console.error('[QuadDetector] ONNX inference failed:', err)
    console.warn('[QuadDetector] Falling back to mock detection')
    return mockDetect(image)
  }
}

/**
 * Preprocess image for YOLO: letterbox resize to INPUT_SIZE x INPUT_SIZE, normalize.
 */
function preprocess(image) {
  const canvas = document.createElement('canvas')
  canvas.width = INPUT_SIZE
  canvas.height = INPUT_SIZE
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#808080'
  ctx.fillRect(0, 0, INPUT_SIZE, INPUT_SIZE)

  const srcWidth = image.width || image.naturalWidth || image.videoWidth
  const srcHeight = image.height || image.naturalHeight || image.videoHeight

  const scale = Math.min(INPUT_SIZE / srcWidth, INPUT_SIZE / srcHeight)
  const newWidth = Math.round(srcWidth * scale)
  const newHeight = Math.round(srcHeight * scale)
  const padX = (INPUT_SIZE - newWidth) / 2
  const padY = (INPUT_SIZE - newHeight) / 2

  ctx.drawImage(image, padX, padY, newWidth, newHeight)

  const imageData = ctx.getImageData(0, 0, INPUT_SIZE, INPUT_SIZE)
  const data = imageData.data
  const floatData = new Float32Array(3 * INPUT_SIZE * INPUT_SIZE)

  for (let i = 0; i < data.length / 4; i++) {
    floatData[i] = data[i * 4] / 255
    floatData[i + INPUT_SIZE * INPUT_SIZE] = data[i * 4 + 1] / 255
    floatData[i + 2 * INPUT_SIZE * INPUT_SIZE] = data[i * 4 + 2] / 255
  }

  const tensor = new ort.Tensor('float32', floatData, [1, 3, INPUT_SIZE, INPUT_SIZE])
  return { tensor, scale, padX, padY }
}

/**
 * Decode raw ONNX output to corner detections.
 */
function decodeDetections(rawData, dims, scale, padX, padY, confThreshold) {
  const numAnchors = dims[2]
  const detections = []

  for (let i = 0; i < numAnchors; i++) {
    const x = rawData[i]
    const y = rawData[numAnchors + i]
    const w = rawData[2 * numAnchors + i]
    const h = rawData[3 * numAnchors + i]
    const angle = rawData[4 * numAnchors + i]
    const conf = sigmoid(rawData[5 * numAnchors + i])
    if (conf < confThreshold) continue

    const corners = obbToCorners(x, y, w, h, angle)
    const scaledCorners = corners.map(p => ({
      x: (p.x - padX) / scale,
      y: (p.y - padY) / scale
    }))

    detections.push({
      corners: scaledCorners,
      conf,
      area: w * h
    })
  }

  return detections
}

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x))
}

function selectBestDetection(detections, minArea) {
  if (!detections.length) return null

  const valid = detections.filter(d => d.area >= minArea)
  const candidates = valid.length ? valid : detections

  return candidates.slice().sort((a, b) => {
    const scoreA = a.conf * Math.sqrt(a.area)
    const scoreB = b.conf * Math.sqrt(b.area)
    return scoreB - scoreA
  })[0]
}

function obbToCorners(cx, cy, w, h, angle) {
  const hw = w / 2
  const hh = h / 2
  const cosA = Math.cos(angle)
  const sinA = Math.sin(angle)

  const local = [
    { x: -hw, y: -hh },
    { x: hw, y: -hh },
    { x: hw, y: hh },
    { x: -hw, y: hh }
  ]

  return local.map(p => ({
    x: cx + p.x * cosA - p.y * sinA,
    y: cy + p.x * sinA + p.y * cosA
  }))
}

function nms(detections, iouThreshold) {
  const sorted = detections.slice().sort((a, b) => b.conf - a.conf)
  const kept = []

  while (sorted.length > 0) {
    const current = sorted.shift()
    kept.push(current)

    for (let i = sorted.length - 1; i >= 0; i--) {
      if (computeIoU(current.corners, sorted[i].corners) > iouThreshold) {
        sorted.splice(i, 1)
      }
    }
  }

  return kept
}

function computeIoU(cornersA, cornersB) {
  const boxA = boundingBox(cornersA)
  const boxB = boundingBox(cornersB)

  const xA = Math.max(boxA.minX, boxB.minX)
  const yA = Math.max(boxA.minY, boxB.minY)
  const xB = Math.min(boxA.maxX, boxB.maxX)
  const yB = Math.min(boxA.maxY, boxB.maxY)

  const interArea = Math.max(0, xB - xA) * Math.max(0, yB - yA)
  const boxAArea = (boxA.maxX - boxA.minX) * (boxA.maxY - boxA.minY)
  const boxBArea = (boxB.maxX - boxB.minX) * (boxB.maxY - boxB.minY)

  return interArea / (boxAArea + boxBArea - interArea + 1e-10)
}

function boundingBox(corners) {
  const xs = corners.map(p => p.x)
  const ys = corners.map(p => p.y)
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys)
  }
}
