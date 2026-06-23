import { useState, useEffect } from 'react'
import { Camera, CameraResultType } from '@capacitor/camera'
import { processReceipt, terminateOcr } from '../services/receipt-processor.js'
import { loadReceipts, addReceipt, updateReceipt } from '../services/receipt-storage.js'

function Receipts() {
  const [receipts, setReceipts] = useState([])
  const [scanning, setScanning] = useState(false)
  const [processingId, setProcessingId] = useState(null)
  const [error, setError] = useState(null)

  // Load receipts from local-first storage on mount
  useEffect(() => {
    setReceipts(loadReceipts())
    return () => {
      // Clean up OCR worker when unmounting
      terminateOcr().catch(console.error)
    }
  }, [])

  const handleImage = async (imageUri, source) => {
    setError(null)
    setScanning(true)

    const newReceipt = {
      id: Date.now(),
      imageUri, // shown only as thumbnail; raw image is not persisted
      date: new Date().toLocaleDateString(),
      merchant: 'Scanning...',
      amount: '$0.00',
      status: 'processing',
      source
    }

    setProcessingId(newReceipt.id)
    const updated = addReceipt(newReceipt)
    setReceipts(updated)

    try {
      const result = await processReceipt(imageUri, { mode: 'yolo-onnx' })

      const processedReceipt = {
        ...newReceipt,
        merchant: result.merchant,
        amount: result.amount,
        numericAmount: result.numericAmount,
        category: result.category,
        confidence: result.confidence,
        rawText: result.rawText,
        date: result.date,
        status: 'processed'
      }

      const finalReceipts = updateReceipt(newReceipt.id, processedReceipt)
      setReceipts(finalReceipts)
    } catch (err) {
      console.error('[Receipts] Processing error:', err)
      setError('Could not read receipt. Try again with better lighting.')
      const failedReceipts = updateReceipt(newReceipt.id, {
        ...newReceipt,
        merchant: 'Unreadable',
        status: 'failed'
      })
      setReceipts(failedReceipts)
    } finally {
      setScanning(false)
      setProcessingId(null)
    }
  }

  const scanReceipt = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false, // keep full image for perspective correction
        resultType: CameraResultType.Uri,
        source: 'camera'
      })

      await handleImage(image.webPath, 'camera')
    } catch (err) {
      console.error('Camera error:', err)
      setScanning(false)
    }
  }

  const uploadGallery = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: 'photos'
      })

      await handleImage(image.webPath, 'gallery')
    } catch (err) {
      console.error('Gallery error:', err)
    }
  }

  return (
    <div style={{ padding: '1rem', paddingBottom: '80px' }}>
      <h1 style={{
        fontSize: '1.5rem',
        fontWeight: 800,
        color: '#fff',
        marginBottom: '0.5rem'
      }}>
        SPS Receipts
      </h1>
      <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        Scan or upload receipts to track expenses and earn SPS rewards.
        <br />
        <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>
          Raw images and the YOLO detection model are processed on your device. Nothing is uploaded.
        </span>
      </p>

      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.15)',
          color: '#fca5a5',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          fontSize: '0.85rem'
        }}>
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <button onClick={scanReceipt} disabled={scanning} style={{
          background: 'linear-gradient(135deg, #22c55e, #16a34a)',
          color: '#fff',
          border: 'none',
          borderRadius: '12px',
          padding: '1rem',
          fontSize: '0.9rem',
          fontWeight: 600,
          cursor: scanning ? 'not-allowed' : 'pointer',
          opacity: scanning ? 0.7 : 1
        }}>
          <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.25rem' }}>📷</span>
          {scanning ? 'Scanning...' : 'Scan Receipt'}
        </button>
        <button onClick={uploadGallery} disabled={scanning} style={{
          background: 'rgba(255,255,255,0.05)',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '12px',
          padding: '1rem',
          fontSize: '0.9rem',
          fontWeight: 600,
          cursor: scanning ? 'not-allowed' : 'pointer',
          opacity: scanning ? 0.7 : 1
        }}>
          <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.25rem' }}>🖼️</span>
          Upload Photo
        </button>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '0.75rem',
        marginBottom: '1.5rem'
      }}>
        <StatBox label="Receipts" value={receipts.length} />
        <StatBox label="Tracked" value={receipts.filter(r => r.status === 'processed').length} />
        <StatBox label="SPS Points" value="0" />
      </div>

      {/* Receipt List */}
      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
          Recent Receipts
        </h3>
        {receipts.length === 0 ? (
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'center',
            color: '#94a3b8'
          }}>
            <span style={{ fontSize: '2rem' }}>🧾</span>
            <p style={{ marginTop: '0.5rem' }}>No receipts yet</p>
            <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Scan your first receipt to start tracking</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {receipts.map(receipt => (
              <ReceiptItem key={receipt.id} {...receipt} isProcessing={receipt.id === processingId} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatBox({ label, value }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '12px',
      padding: '1rem',
      textAlign: 'center'
    }}>
      <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#22c55e' }}>{value}</p>
      <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.25rem' }}>{label}</p>
    </div>
  )
}

function ReceiptItem({ imageUri, date, merchant, amount, category, confidence, status, isProcessing }) {
  const statusColors = {
    processed: { bg: 'rgba(34,197,94,0.2)', text: '#22c55e' },
    processing: { bg: 'rgba(245,158,11,0.2)', text: '#f59e0b' },
    failed: { bg: 'rgba(239,68,68,0.2)', text: '#ef4444' }
  }
  const statusStyle = statusColors[status] || statusColors.processing

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '12px',
      padding: '1rem'
    }}>
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '8px',
        background: '#1e293b',
        overflow: 'hidden',
        flexShrink: 0
      }}>
        {imageUri && (
          <img src={imageUri} alt="Receipt" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>{merchant}</p>
        <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{date}</p>
        {category && status === 'processed' && (
          <p style={{ fontSize: '0.7rem', color: '#22c55e', marginTop: '0.15rem' }}>
            {category}
            {confidence !== undefined && ` · OCR confidence ${Math.round(confidence)}%`}
          </p>
        )}
      </div>
      <div style={{ textAlign: 'right' }}>
        <p style={{ fontWeight: 700, color: '#fff' }}>{amount}</p>
        <span style={{
          fontSize: '0.65rem',
          padding: '0.15rem 0.5rem',
          borderRadius: '4px',
          background: statusStyle.bg,
          color: statusStyle.text
        }}>
          {isProcessing ? 'processing' : status}
        </span>
      </div>
    </div>
  )
}

export default Receipts
