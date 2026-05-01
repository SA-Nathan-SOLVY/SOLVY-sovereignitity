import { useState } from 'react'
import { Camera, CameraResultType } from '@capacitor/camera'

function Receipts() {
  const [receipts, setReceipts] = useState([])
  const [scanning, setScanning] = useState(false)

  const scanReceipt = async () => {
    setScanning(true)
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: 'camera'
      })

      const newReceipt = {
        id: Date.now(),
        imageUri: image.webPath,
        date: new Date().toLocaleDateString(),
        merchant: 'Scanning...',
        amount: '$0.00',
        status: 'processing'
      }

      setReceipts(prev => [newReceipt, ...prev])

      // Simulate OCR/processing
      setTimeout(() => {
        setReceipts(prev => prev.map(r =>
          r.id === newReceipt.id
            ? { ...r, merchant: 'Merchant Detected', amount: '$' + (Math.random() * 100 + 10).toFixed(2), status: 'processed' }
            : r
        ))
      }, 2000)
    } catch (err) {
      console.error('Camera error:', err)
    }
    setScanning(false)
  }

  const uploadGallery = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: 'photos'
      })

      const newReceipt = {
        id: Date.now(),
        imageUri: image.webPath,
        date: new Date().toLocaleDateString(),
        merchant: 'Uploaded Receipt',
        amount: '$0.00',
        status: 'processing'
      }

      setReceipts(prev => [newReceipt, ...prev])
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
      </p>

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
        <button onClick={uploadGallery} style={{
          background: 'rgba(255,255,255,0.05)',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '12px',
          padding: '1rem',
          fontSize: '0.9rem',
          fontWeight: 600,
          cursor: 'pointer'
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
              <ReceiptItem key={receipt.id} {...receipt} />
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

function ReceiptItem({ imageUri, date, merchant, amount, status }) {
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
      </div>
      <div style={{ textAlign: 'right' }}>
        <p style={{ fontWeight: 700, color: '#fff' }}>{amount}</p>
        <span style={{
          fontSize: '0.65rem',
          padding: '0.15rem 0.5rem',
          borderRadius: '4px',
          background: status === 'processed' ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)',
          color: status === 'processed' ? '#22c55e' : '#f59e0b'
        }}>
          {status}
        </span>
      </div>
    </div>
  )
}

export default Receipts
