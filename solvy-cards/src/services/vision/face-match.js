/**
 * On-device face matching between ID photo and selfie.
 *
 * Uses face-api.js with TinyFaceDetector and 68-point landmarks. Computes
 * face descriptors and returns a cosine-similarity score. No images or
 * embeddings are persisted; they remain in memory only during the KYC flow.
 */

import * as faceapi from 'face-api.js'

const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models'

let modelsLoaded = false

/**
 * Load required face-api.js models once.
 */
export async function loadFaceModels() {
  if (modelsLoaded) return
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
  ])
  modelsLoaded = true
}

function dataUrlToElement(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = dataUrl
  })
}

async function getDescriptor(imageDataUrl) {
  const img = await dataUrlToElement(imageDataUrl)
  const detection = await faceapi
    .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 }))
    .withFaceLandmarks()
    .withFaceDescriptor()

  if (!detection) {
    throw new Error('No face detected in image')
  }
  return detection.descriptor
}

/**
 * Compute cosine similarity between two face descriptors.
 * @param {Float32Array} desc1
 * @param {Float32Array} desc2
 */
function cosineSimilarity(desc1, desc2) {
  let dot = 0
  let norm1 = 0
  let norm2 = 0
  for (let i = 0; i < desc1.length; i++) {
    dot += desc1[i] * desc2[i]
    norm1 += desc1[i] * desc1[i]
    norm2 += desc2[i] * desc2[i]
  }
  return dot / (Math.sqrt(norm1) * Math.sqrt(norm2) + 1e-6)
}

/**
 * Compare selfie to ID front image.
 * @param {string} idImageDataUrl - Corrected ID front image
 * @param {string} selfieDataUrl - Selfie image
 * @returns {Promise<{match: boolean, score: number, threshold: number}>}
 */
export async function compareFaces(idImageDataUrl, selfieDataUrl) {
  await loadFaceModels()

  const [idDescriptor, selfieDescriptor] = await Promise.all([
    getDescriptor(idImageDataUrl),
    getDescriptor(selfieDataUrl)
  ])

  const similarity = cosineSimilarity(idDescriptor, selfieDescriptor)
  const threshold = 0.6
  const match = similarity >= threshold

  return {
    match,
    score: Math.round(similarity * 1000) / 1000,
    threshold
  }
}

/**
 * Unload face-api models from memory.
 */
export async function terminateFaceMatch() {
  // face-api.js does not expose a clean unload API for all nets.
  // Setting the flag forces reload on next use, and the browser will GC
  // the underlying tensors when references are dropped.
  modelsLoaded = false
}
