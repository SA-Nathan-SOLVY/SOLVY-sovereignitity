/**
 * On-device ID document quality checks.
 *
 * Runs entirely in the browser/Capacitor app. No image data leaves the device.
 */

/**
 * Compute quality metrics and pass/fail flags for a captured ID document.
 *
 * @param {HTMLImageElement|HTMLCanvasElement} source — original captured image
 * @param {Array<{x:number, y:number}>} corners — detected document corners
 * @param {Object} options
 * @returns {Object}
 */
export function checkDocumentQuality(source, corners, options = {}) {
  const width = source.width || source.naturalWidth || source.videoWidth
  const height = source.height || source.naturalHeight || source.videoHeight

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(source, 0, 0)

  const imageData = ctx.getImageData(0, 0, width, height)
  const gray = toGrayscale(imageData.data, width, height)

  const blurVariance = laplacianVariance(gray, width, height)
  const glareRatio = detectGlare(imageData.data)
  const coverage = computeCoverage(corners, width, height)
  const rotation = computeRotation(corners)

  const thresholds = {
    blurMin: options.blurMin ?? 80,
    glareMax: options.glareMax ?? 0.05,
    coverageMin: options.coverageMin ?? 0.15,
    rotationMax: options.rotationMax ?? 40
  }

  const issues = []
  if (blurVariance < thresholds.blurMin) issues.push('blur')
  if (glareRatio > thresholds.glareMax) issues.push('glare')
  if (coverage < thresholds.coverageMin) issues.push('cutoff')
  if (rotation > thresholds.rotationMax) issues.push('rotation')

  return {
    pass: issues.length === 0,
    issues,
    scores: {
      blurVariance,
      glareRatio,
      coverage,
      rotation
    },
    thresholds
  }
}

/**
 * Convert RGBA data to grayscale Float32Array.
 */
function toGrayscale(data, width, height) {
  const gray = new Float32Array(width * height)
  for (let i = 0; i < width * height; i++) {
    const r = data[i * 4]
    const g = data[i * 4 + 1]
    const b = data[i * 4 + 2]
    gray[i] = 0.299 * r + 0.587 * g + 0.114 * b
  }
  return gray
}

/**
 * Approximate Laplacian variance (higher = sharper).
 */
function laplacianVariance(gray, width, height) {
  // 3x3 Laplacian kernel
  const kernel = [0, 1, 0, 1, -4, 1, 0, 1, 0]
  let sum = 0
  let sumSq = 0
  let count = 0

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let v = 0
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = (y + ky) * width + (x + kx)
          const kidx = (ky + 1) * 3 + (kx + 1)
          v += gray[idx] * kernel[kidx]
        }
      }
      sum += v
      sumSq += v * v
      count++
    }
  }

  const mean = sum / count
  return sumSq / count - mean * mean
}

/**
 * Detect glare as the ratio of bright, low-saturation pixels.
 */
function detectGlare(data) {
  let glare = 0
  const total = data.length / 4

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] / 255
    const g = data[i + 1] / 255
    const b = data[i + 2] / 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const saturation = max === 0 ? 0 : (max - min) / max
    const value = max

    // Bright and nearly white
    if (value > 0.92 && saturation < 0.15) {
      glare++
    }
  }

  return glare / total
}

/**
 * Compute document coverage as a ratio of image area.
 * Clips the quadrilateral to the image bounds so partial detections
 * are measured by the visible portion only.
 */
function computeCoverage(corners, width, height) {
  if (!corners || corners.length !== 4) return 0

  const clipped = clipPolygonToRect(corners, { x: 0, y: 0, w: width, h: height })
  if (clipped.length < 3) return 0

  let area = 0
  for (let i = 0; i < clipped.length; i++) {
    const j = (i + 1) % clipped.length
    area += clipped[i].x * clipped[j].y
    area -= clipped[j].x * clipped[i].y
  }
  area = Math.abs(area) / 2

  return area / (width * height)
}

/**
 * Sutherland–Hodgman polygon clipping to an axis-aligned rectangle.
 */
function clipPolygonToRect(polygon, rect) {
  let output = polygon.slice()
  const edges = [
    { inside: p => p.x >= rect.x, intersect: (a, b) => ({ x: rect.x, y: a.y + (b.y - a.y) * (rect.x - a.x) / (b.x - a.x) }) },
    { inside: p => p.x <= rect.x + rect.w, intersect: (a, b) => ({ x: rect.x + rect.w, y: a.y + (b.y - a.y) * (rect.x + rect.w - a.x) / (b.x - a.x) }) },
    { inside: p => p.y >= rect.y, intersect: (a, b) => ({ x: a.x + (b.x - a.x) * (rect.y - a.y) / (b.y - a.y), y: rect.y }) },
    { inside: p => p.y <= rect.y + rect.h, intersect: (a, b) => ({ x: a.x + (b.x - a.x) * (rect.y + rect.h - a.y) / (b.y - a.y), y: rect.y + rect.h }) }
  ]

  for (const edge of edges) {
    const input = output
    output = []
    for (let i = 0; i < input.length; i++) {
      const current = input[i]
      const prev = input[(i - 1 + input.length) % input.length]
      const curIn = edge.inside(current)
      const prevIn = edge.inside(prev)
      if (curIn) {
        if (!prevIn) output.push(edge.intersect(prev, current))
        output.push(current)
      } else if (prevIn) {
        output.push(edge.intersect(prev, current))
      }
    }
  }

  return output
}

/**
 * Compute absolute rotation in degrees from the top edge of the detected document.
 */
function computeRotation(corners) {
  if (!corners || corners.length !== 4) return 0

  const topEdge = {
    x: corners[1].x - corners[0].x,
    y: corners[1].y - corners[0].y
  }
  const angle = Math.atan2(topEdge.y, topEdge.x) * (180 / Math.PI)
  return Math.abs(angle)
}
