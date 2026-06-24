import { useEffect, useState } from 'react'
import { processIdDocument, terminateOcr } from '../services/id-document-processor.js'
import { compareFaces, terminateFaceMatch } from '../services/vision/face-match.js'

/**
 * Development test page for the KYC ID-document pipeline.
 * Automatically processes /test-id-front.jpg and /test-id-back.jpg,
 * then runs a face-match check using the ID front as both ID and selfie proxy.
 */
function TestKycCapture() {
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    const run = async () => {
      setStatus('loading model & images')
      try {
        const start = performance.now()

        const front = await processIdDocument('/test-id-front.jpg', { mode: 'yolo-onnx' })
        const back = await processIdDocument('/test-id-back.jpg', { mode: 'yolo-onnx' })

        setStatus('running face-match')
        let faceMatch = null
        try {
          faceMatch = await compareFaces(front.correctedImage, front.correctedImage)
        } catch (matchErr) {
          console.warn('[TestKycCapture] Face match error:', matchErr)
          faceMatch = { match: false, score: 0, threshold: 0.6, error: matchErr.message }
        }

        // Mock liveness proof: in production this comes from MediaPipe challenge.
        const livenessProof = {
          blinkDetected: true,
          headMoved: true,
          framesProcessed: 120,
          minEyeAspectRatio: 0.18,
          timestamp: new Date().toISOString()
        }

        const elapsed = (performance.now() - start).toFixed(0)
        const fullResult = {
          front: {
            ...front,
            correctedImage: front.correctedImage ? `${front.correctedImage.slice(0, 80)}...` : null
          },
          back: {
            ...back,
            correctedImage: back.correctedImage ? `${back.correctedImage.slice(0, 80)}...` : null
          },
          faceMatch,
          livenessProof,
          elapsedMs: elapsed
        }

        setResult(fullResult)
        window.__KYC_TEST_RESULT__ = fullResult
        setStatus('done')
      } catch (err) {
        const msg = err?.message || String(err)
        console.error('[TestKycCapture]', err)
        setError(msg)
        window.__KYC_TEST_ERROR__ = msg
        setStatus('error')
      } finally {
        terminateOcr().catch(() => {})
        terminateFaceMatch().catch(() => {})
      }
    }
    run()
  }, [])

  return (
    <div style={{ padding: '1rem', color: '#fff' }}>
      <h1>KYC ID Capture Test</h1>
      <p>Status: {status}</p>
      {error && (
        <pre style={{ color: '#fca5a5', whiteSpace: 'pre-wrap' }}>{error}</pre>
      )}
      {result && (
        <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  )
}

export default TestKycCapture
