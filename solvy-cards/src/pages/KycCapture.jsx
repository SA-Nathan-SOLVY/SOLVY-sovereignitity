import { useState, useEffect } from 'react'
import { Camera, CameraResultType } from '@capacitor/camera'
import { processIdDocument, terminateOcr } from '../services/id-document-processor.js'

const STEPS = {
  INTRO: 'intro',
  FRONT: 'front',
  BACK: 'back',
  SELFIE: 'selfie',
  REVIEW: 'review',
  SUBMITTING: 'submitting',
  DONE: 'done'
}

function KycCapture() {
  const [step, setStep] = useState(STEPS.INTRO)
  const [front, setFront] = useState(null)
  const [back, setBack] = useState(null)
  const [selfie, setSelfie] = useState(null)
  const [memberInfo, setMemberInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    ssnLast4: ''
  })
  const [error, setError] = useState(null)
  const [submitResult, setSubmitResult] = useState(null)

  useEffect(() => {
    return () => {
      terminateOcr().catch(console.error)
    }
  }, [])

  const captureDocument = async (side) => {
    setError(null)
    try {
      const image = await Camera.getPhoto({
        quality: 95,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: 'camera'
      })

      const result = await processIdDocument(image.webPath, { mode: 'yolo-onnx' })

      const payload = {
        imageUri: image.webPath,
        correctedImage: result.correctedImage,
        extracted: result,
        quality: result.quality
      }

      if (side === 'front') {
        setFront(payload)
        // Pre-fill member info from extracted ID data
        setMemberInfo(prev => ({
          ...prev,
          firstName: result.firstName || prev.firstName,
          lastName: result.lastName || prev.lastName,
          dob: result.dateOfBirth || prev.dob
        }))
        setStep(STEPS.BACK)
      } else {
        setBack(payload)
        setStep(STEPS.SELFIE)
      }
    } catch (err) {
      console.error(`[KycCapture] ${side} capture error:`, err)
      setError(`Could not process ID ${side}. Please retake with better lighting and fit the card in the frame.`)
    }
  }

  const captureSelfie = async () => {
    setError(null)
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: 'camera'
      })
      setSelfie(image.webPath)
      setStep(STEPS.REVIEW)
    } catch (err) {
      console.error('[KycCapture] Selfie error:', err)
      setError('Could not capture selfie. Please try again.')
    }
  }

  const submitKyc = async () => {
    setStep(STEPS.SUBMITTING)
    setError(null)
    try {
      const response = await fetch('/api/kyc/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: memberInfo.firstName,
          lastName: memberInfo.lastName,
          email: memberInfo.email,
          phone: memberInfo.phone,
          dateOfBirth: memberInfo.dob,
          ssnLast4: memberInfo.ssnLast4,
          idFrontImage: front?.correctedImage,
          idBackImage: back?.correctedImage,
          selfieImage: selfie,
          extractedId: front?.extracted
        })
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || `Submission failed: ${response.status}`)
      }

      const data = await response.json()
      setSubmitResult(data)
      setStep(STEPS.DONE)
    } catch (err) {
      console.error('[KycCapture] Submit error:', err)
      setError(err.message || 'KYC submission failed. Please try again.')
      setStep(STEPS.REVIEW)
    }
  }

  const updateField = (field, value) => {
    setMemberInfo(prev => ({ ...prev, [field]: value }))
  }

  const canSubmit = front && back && selfie && memberInfo.firstName && memberInfo.lastName &&
    memberInfo.email && memberInfo.phone && memberInfo.dob && memberInfo.ssnLast4

  return (
    <div style={{ padding: '1rem', paddingBottom: '80px', color: '#fff' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
        Verify Your Identity
      </h1>
      <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        SOLVY uses on-device vision to capture and correct your ID. Raw images are not stored.
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

      {step === STEPS.INTRO && (
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>What you'll need</h2>
          <ul style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem', paddingLeft: '1.2rem' }}>
            <li>Government-issued ID (driver's license or state ID)</li>
            <li>A well-lit area</li>
            <li>A selfie for identity confirmation</li>
          </ul>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
            Your ID images are processed on your phone, corrected, and sent directly to Lithic for KYC review.
            SOLVY does not keep raw ID photos or selfies on our servers.
          </p>
          <button onClick={() => setStep(STEPS.FRONT)} style={primaryButtonStyle}>
            Start ID Capture
          </button>
        </div>
      )}

      {step === STEPS.FRONT && (
        <CaptureStep
          title="Front of ID"
          subtitle="Position the front of your ID in the frame and tap capture."
          onCapture={() => captureDocument('front')}
          onSkip={() => setStep(STEPS.BACK)}
        />
      )}

      {step === STEPS.BACK && (
        <CaptureStep
          title="Back of ID"
          subtitle="Position the back of your ID in the frame and tap capture."
          onCapture={() => captureDocument('back')}
          onSkip={() => setStep(STEPS.SELFIE)}
        />
      )}

      {step === STEPS.SELFIE && (
        <CaptureStep
          title="Selfie"
          subtitle="Take a clear photo of your face."
          onCapture={captureSelfie}
        />
      )}

      {step === STEPS.REVIEW && (
        <div>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Review & Confirm</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            {front?.correctedImage && <PreviewBox label="ID Front" src={front.correctedImage} />}
            {back?.correctedImage && <PreviewBox label="ID Back" src={back.correctedImage} />}
            {selfie && <PreviewBox label="Selfie" src={selfie} />}
          </div>

          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>Extracted Info</h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Name: <span style={{ color: '#fff' }}>{front?.extracted?.fullName || 'Not detected'}</span>
            </p>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              DOB: <span style={{ color: '#fff' }}>{front?.extracted?.dateOfBirth || 'Not detected'}</span>
            </p>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              ID#: <span style={{ color: '#fff' }}>{front?.extracted?.idNumber || 'Not detected'}</span>
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>Member Info</h3>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <input placeholder="First name" value={memberInfo.firstName} onChange={e => updateField('firstName', e.target.value)} style={inputStyle} />
              <input placeholder="Last name" value={memberInfo.lastName} onChange={e => updateField('lastName', e.target.value)} style={inputStyle} />
              <input placeholder="Email" value={memberInfo.email} onChange={e => updateField('email', e.target.value)} style={inputStyle} />
              <input placeholder="Phone" value={memberInfo.phone} onChange={e => updateField('phone', e.target.value)} style={inputStyle} />
              <input placeholder="Date of birth (MM/DD/YYYY)" value={memberInfo.dob} onChange={e => updateField('dob', e.target.value)} style={inputStyle} />
              <input placeholder="SSN last 4" value={memberInfo.ssnLast4} onChange={e => updateField('ssnLast4', e.target.value)} style={inputStyle} maxLength={4} />
            </div>
          </div>

          <button onClick={submitKyc} disabled={!canSubmit} style={{ ...primaryButtonStyle, opacity: canSubmit ? 1 : 0.5 }}>
            Submit KYC
          </button>
        </div>
      )}

      {step === STEPS.SUBMITTING && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <div className="spinner" style={{ width: 48, height: 48, border: '4px solid rgba(34,197,94,0.2)', borderTopColor: '#22c55e', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ color: '#94a3b8' }}>Submitting securely to Lithic...</p>
        </div>
      )}

      {step === STEPS.DONE && (
        <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>KYC Submitted</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Your identity verification has been submitted. Lithic will review it shortly.
          </p>
          {submitResult?.accountHolderToken && (
            <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
              Reference: {submitResult.accountHolderToken}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function CaptureStep({ title, subtitle, onCapture, onSkip }) {
  return (
    <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📷</div>
      <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{title}</h2>
      <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '2rem' }}>{subtitle}</p>
      <button onClick={onCapture} style={primaryButtonStyle}>
        Capture
      </button>
      {onSkip && (
        <button onClick={onSkip} style={{ ...secondaryButtonStyle, marginTop: '0.75rem' }}>
          Skip for now
        </button>
      )}
    </div>
  )
}

function PreviewBox({ label, src }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.5rem' }}>
      <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem' }}>{label}</p>
      <img src={src} alt={label} style={{ width: '100%', borderRadius: '4px', display: 'block' }} />
    </div>
  )
}

const primaryButtonStyle = {
  width: '100%',
  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
  color: '#fff',
  border: 'none',
  borderRadius: '12px',
  padding: '1rem',
  fontSize: '1rem',
  fontWeight: 600,
  cursor: 'pointer'
}

const secondaryButtonStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  color: '#94a3b8',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: '12px',
  padding: '0.75rem',
  fontSize: '0.9rem',
  cursor: 'pointer'
}

const inputStyle = {
  width: '100%',
  background: 'rgba(0,0,0,0.2)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  padding: '0.75rem',
  color: '#fff',
  fontSize: '0.9rem'
}

export default KycCapture
