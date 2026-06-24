/**
 * On-device liveness detection using MediaPipe Face Mesh.
 *
 * Runs a short challenge: detect a blink and a head movement to confirm the
 * subject is a real person rather than a static photo or replay video. No
 * biometric data leaves the device; only a compact proof summary and a
 * confidence score are returned.
 */

import { FaceMesh } from '@mediapipe/face_mesh'

let faceMesh = null

const CHALLENGE_DURATION_MS = 4000
const BLINK_THRESHOLD = 0.2
const HEAD_MOVE_THRESHOLD = 0.03

/**
 * Compute eye aspect ratio from MediaPipe landmarks.
 * @param {Array} landmarks - Face mesh landmarks
 * @param {number[]} eyeIndices - 6 landmark indices for one eye
 */
function eyeAspectRatio(landmarks, eyeIndices) {
  const p1 = landmarks[eyeIndices[0]]
  const p2 = landmarks[eyeIndices[1]]
  const p3 = landmarks[eyeIndices[2]]
  const p4 = landmarks[eyeIndices[3]]
  const p5 = landmarks[eyeIndices[4]]
  const p6 = landmarks[eyeIndices[5]]

  const vertical1 = Math.hypot(p2.x - p6.x, p2.y - p6.y)
  const vertical2 = Math.hypot(p3.x - p5.x, p3.y - p5.y)
  const horizontal = Math.hypot(p1.x - p4.x, p1.y - p4.y)

  return (vertical1 + vertical2) / (2 * horizontal + 1e-6)
}

const LEFT_EYE_INDICES = [33, 160, 158, 133, 153, 144]
const RIGHT_EYE_INDICES = [362, 385, 387, 263, 373, 380]

function getFaceMesh() {
  if (!faceMesh) {
    faceMesh = new FaceMesh({
      locateFile: (file) => {
        // Use CDN-hosted assets. Vendoring these into public/mediapipe is
        // recommended for offline/Capacitor builds.
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
      }
    })
    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    })
  }
  return faceMesh
}

/**
 * Run a liveness challenge on a video element.
 * @param {HTMLVideoElement} videoElement
 * @returns {Promise<{pass: boolean, score: number, proof: Object}>}
 */
export async function runLivenessChallenge(videoElement) {
  const fm = getFaceMesh()
  let blinkDetected = false
  let headMoved = false
  let frameCount = 0
  let baselineNose = null
  let minEyeEar = 1
  let closedFrameCount = 0
  let rafId = null
  let timeoutId = null

  return new Promise((resolve, reject) => {
    const onResults = (results) => {
      frameCount++
      if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
        return
      }

      const landmarks = results.multiFaceLandmarks[0]
      const leftEar = eyeAspectRatio(landmarks, LEFT_EYE_INDICES)
      const rightEar = eyeAspectRatio(landmarks, RIGHT_EYE_INDICES)
      const ear = (leftEar + rightEar) / 2
      minEyeEar = Math.min(minEyeEar, ear)

      if (ear < BLINK_THRESHOLD) {
        closedFrameCount++
      } else if (closedFrameCount > 0) {
        // eye re-opened after being closed
        blinkDetected = true
        closedFrameCount = 0
      }

      const nose = landmarks[1]
      if (!baselineNose) {
        baselineNose = { x: nose.x, y: nose.y }
      } else {
        const dx = Math.abs(nose.x - baselineNose.x)
        const dy = Math.abs(nose.y - baselineNose.y)
        if (dx > HEAD_MOVE_THRESHOLD || dy > HEAD_MOVE_THRESHOLD) {
          headMoved = true
        }
      }
    }

    fm.onResults(onResults)

    const processFrame = async () => {
      if (videoElement.readyState >= 2) {
        try {
          await fm.send({ image: videoElement })
        } catch (e) {
          console.warn('[Liveness] Frame processing error:', e)
        }
      }
      rafId = requestAnimationFrame(processFrame)
    }

    rafId = requestAnimationFrame(processFrame)

    timeoutId = setTimeout(() => {
      if (rafId) cancelAnimationFrame(rafId)
      fm.onResults(() => {})

      const score = (blinkDetected ? 0.5 : 0) + (headMoved ? 0.5 : 0)
      const pass = blinkDetected && headMoved

      resolve({
        pass,
        score,
        proof: {
          blinkDetected,
          headMoved,
          framesProcessed: frameCount,
          minEyeAspectRatio: Math.round(minEyeEar * 1000) / 1000,
          timestamp: new Date().toISOString()
        }
      })
    }, CHALLENGE_DURATION_MS)
  })
}

/**
 * Capture a selfie after a successful liveness challenge.
 * @param {HTMLVideoElement} videoElement
 * @returns {string} data URL of captured frame
 */
export function captureSelfieFrame(videoElement) {
  const canvas = document.createElement('canvas')
  canvas.width = videoElement.videoWidth || 640
  canvas.height = videoElement.videoHeight || 480
  const ctx = canvas.getContext('2d')
  ctx.drawImage(videoElement, 0, 0)
  return canvas.toDataURL('image/jpeg', 0.92)
}

/**
 * Release liveness resources.
 */
export async function terminateLiveness() {
  faceMesh = null
}
