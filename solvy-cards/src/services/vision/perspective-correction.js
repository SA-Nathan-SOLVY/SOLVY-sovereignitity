/**
 * Perspective correction for receipt images
 *
 * Given four corner points, applies a homography transform to produce a
 * front-facing rectangular crop. Uses HTML5 Canvas for portability.
 */

/**
 * Compute distance between two points
 */
function distance(p1, p2) {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
}

/**
 * Apply perspective correction to an image using four corner points.
 * @param {HTMLImageElement|HTMLCanvasElement} image
 * @param {Array<{x:number, y:number}>} corners — top-left, top-right, bottom-right, bottom-left
 * @param {Object} options
 * @param {number} options.targetAspectRatio — optional width/height ratio to enforce (e.g., 1.586 for driver's license)
 * @returns {HTMLCanvasElement}
 */
export function correctPerspective(image, corners, options = {}) {
  if (!corners || corners.length !== 4) {
    throw new Error('Perspective correction requires exactly 4 corner points')
  }

  // Corners are expected in top-left, top-right, bottom-right, bottom-left
  // order (the order returned by the OBB detector).
  const sorted = corners

  // Compute output width/height based on edge lengths
  const widthTop = distance(sorted[0], sorted[1])
  const widthBottom = distance(sorted[3], sorted[2])
  const heightLeft = distance(sorted[0], sorted[3])
  const heightRight = distance(sorted[1], sorted[2])

  let outputWidth = Math.max(Math.round(widthTop), Math.round(widthBottom))
  let outputHeight = Math.max(Math.round(heightLeft), Math.round(heightRight))

  // Enforce a fixed aspect ratio if requested (e.g., standard ID dimensions).
  if (options.targetAspectRatio && outputHeight > 0) {
    const currentRatio = outputWidth / outputHeight
    const target = options.targetAspectRatio
    const area = outputWidth * outputHeight
    if (currentRatio > target) {
      outputWidth = Math.round(Math.sqrt(area * target))
      outputHeight = Math.round(outputWidth / target)
    } else {
      outputHeight = Math.round(Math.sqrt(area / target))
      outputWidth = Math.round(outputHeight * target)
    }
  }

  const canvas = document.createElement('canvas')
  canvas.width = outputWidth
  canvas.height = outputHeight
  const ctx = canvas.getContext('2d')

  // Source and destination triangles for drawImage transformation
  // We draw in two triangles to approximate the homography
  drawTriangle(ctx, image,
    sorted[0], sorted[1], sorted[2],
    { x: 0, y: 0 }, { x: outputWidth, y: 0 }, { x: outputWidth, y: outputHeight }
  )
  drawTriangle(ctx, image,
    sorted[0], sorted[2], sorted[3],
    { x: 0, y: 0 }, { x: outputWidth, y: outputHeight }, { x: 0, y: outputHeight }
  )

  return canvas
}

/**
 * Sort four corners into top-left, top-right, bottom-right, bottom-left order
 */
function sortCorners(corners) {
  // Find center
  const center = corners.reduce((acc, p) => ({ x: acc.x + p.x / 4, y: acc.y + p.y / 4 }), { x: 0, y: 0 })

  return corners.slice().sort((a, b) => {
    const angleA = Math.atan2(a.y - center.y, a.x - center.x)
    const angleB = Math.atan2(b.y - center.y, b.x - center.x)
    // Sort ascending so the first corner is top-left (-135°) and the last is
    // bottom-left (135°): top-left, top-right, bottom-right, bottom-left.
    return angleA - angleB
  })
}

/**
 * Draw a triangle from source image to destination triangle
 */
function drawTriangle(ctx, image, s1, s2, s3, d1, d2, d3) {
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(d1.x, d1.y)
  ctx.lineTo(d2.x, d2.y)
  ctx.lineTo(d3.x, d3.y)
  ctx.closePath()
  ctx.clip()

  // Map source triangle to destination triangle via transformation matrix.
  // Canvas setTransform(a,b,c,d,e,f) maps (x,y) -> (a*x + c*y + e, b*x + d*y + f),
  // so we pass our solved coefficients in the order (a,d,b,e,c,f).
  const matrix = getTransformMatrix(s1, s2, s3, d1, d2, d3)
  ctx.setTransform(matrix.a, matrix.d, matrix.b, matrix.e, matrix.c, matrix.f)
  ctx.drawImage(image, 0, 0)
  ctx.restore()
}

/**
 * Compute 2D transform matrix mapping triangle S to triangle D
 * Based on affine transform between three points.
 */
function getTransformMatrix(s1, s2, s3, d1, d2, d3) {
  const sx = [s1.x, s2.x, s3.x]
  const sy = [s1.y, s2.y, s3.y]
  const dx = [d1.x, d2.x, d3.x]
  const dy = [d1.y, d2.y, d3.y]

  // Solve affine transform: x' = a*x + b*y + c, y' = d*x + e*y + f
  const denom =
    sx[0] * (sy[1] - sy[2]) -
    sx[1] * (sy[0] - sy[2]) +
    sx[2] * (sy[0] - sy[1])

  if (Math.abs(denom) < 1e-10) {
    throw new Error('Degenerate triangle for perspective correction')
  }

  const a = (dx[0] * (sy[1] - sy[2]) - dx[1] * (sy[0] - sy[2]) + dx[2] * (sy[0] - sy[1])) / denom
  const b = (sx[0] * (dx[1] - dx[2]) - sx[1] * (dx[0] - dx[2]) + sx[2] * (dx[0] - dx[1])) / denom
  const c = (dx[0] * (sx[1] * sy[2] - sx[2] * sy[1]) - dx[1] * (sx[0] * sy[2] - sx[2] * sy[0]) + dx[2] * (sx[0] * sy[1] - sx[1] * sy[0])) / denom

  const d = (dy[0] * (sy[1] - sy[2]) - dy[1] * (sy[0] - sy[2]) + dy[2] * (sy[0] - sy[1])) / denom
  const e = (sx[0] * (dy[1] - dy[2]) - sx[1] * (dy[0] - dy[2]) + sx[2] * (dy[0] - dy[1])) / denom
  const f = (dy[0] * (sx[1] * sy[2] - sx[2] * sy[1]) - dy[1] * (sx[0] * sy[2] - sx[2] * sy[0]) + dy[2] * (sx[0] * sy[1] - sx[1] * sy[0])) / denom

  return { a, b, c, d, e, f }
}

/**
 * Fallback: return the whole image as a canvas (no perspective correction)
 * @param {HTMLImageElement|HTMLCanvasElement} image
 * @returns {HTMLCanvasElement}
 */
export function noCorrection(image) {
  const canvas = document.createElement('canvas')
  canvas.width = image.width || image.videoWidth || image.naturalWidth
  canvas.height = image.height || image.videoHeight || image.naturalHeight
  const ctx = canvas.getContext('2d')
  ctx.drawImage(image, 0, 0)
  return canvas
}
