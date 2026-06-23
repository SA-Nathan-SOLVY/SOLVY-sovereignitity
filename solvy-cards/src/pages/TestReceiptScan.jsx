import { useEffect, useState } from 'react'
import { processReceipt } from '../services/receipt-processor'
import { recognizeText, terminateOcr } from '../services/vision/receipt-ocr'
import { detectReceipt } from '../services/vision/receipt-detector'
import { correctPerspective, noCorrection } from '../services/vision/perspective-correction'

/**
 * Development test page for the receipt-scanning pipeline.
 * Automatically processes /test-receipt.jpg and displays the result.
 */
function TestReceiptScan() {
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    const run = async () => {
      setStatus('loading model & image')
      try {
        const start = performance.now()

        // First test raw OCR on the original image
        setStatus('testing raw OCR on original image')
        const rawImg = new Image()
        rawImg.crossOrigin = 'anonymous'
        rawImg.src = '/test-receipt.jpg'
        await new Promise((resolve, reject) => {
          rawImg.onload = resolve
          rawImg.onerror = reject
        })
        const rawOcr = await recognizeText(rawImg)
        console.log('[TestReceiptScan] Raw OCR:', rawOcr)

        // Then run full processor
        setStatus('running full processor')
        const res = await processReceipt('/test-receipt.jpg', { mode: 'yolo-onnx' })
        const elapsed = (performance.now() - start).toFixed(0)

        // Render debug crop for inspection
        const debugImg = new Image()
        debugImg.crossOrigin = 'anonymous'
        debugImg.src = '/test-receipt.jpg'
        await new Promise((resolve, reject) => {
          debugImg.onload = resolve
          debugImg.onerror = reject
        })
        const corners = await detectReceipt(debugImg, { mode: 'yolo-onnx' })
        const cropCanvas = corners ? correctPerspective(debugImg, corners) : noCorrection(debugImg)
        const cropDataUrl = cropCanvas.toDataURL('image/png')

        const fullResult = { ...res, elapsedMs: elapsed, rawOcr, cropDataUrl }
        setResult(fullResult)
        window.__RECEIPT_TEST_RESULT__ = fullResult
        setStatus('done')
      } catch (err) {
        const msg = err?.message || String(err)
        setError(msg)
        window.__RECEIPT_TEST_ERROR__ = msg
        setStatus('error')
      } finally {
        terminateOcr().catch(() => {})
      }
    }
    run()
  }, [])

  return (
    <div style={{ padding: '1rem', color: '#fff' }}>
      <h1>Receipt Scan Test</h1>
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

export default TestReceiptScan
