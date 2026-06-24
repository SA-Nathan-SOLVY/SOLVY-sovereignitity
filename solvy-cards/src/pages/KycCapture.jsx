import { useState, useEffect, useRef } from 'react'
import { Camera, CameraResultType } from '@capacitor/camera'
import { processIdDocument, terminateOcr } from '../services/id-document-processor.js'
import { runLivenessChallenge, captureSelfieFrame, terminateLiveness } from '../services/vision/liveness-check.js'
import { compareFaces, terminateFaceMatch } from '../services/vision/face-match.js'

const STEPS = {
  INTRO: 'intro',
  FRONT: 'front',
  BACK: 'back',
  LIVENESS: 'liveness',
  REVIEW: 'review',
  SUBMITTING: 'submitting',
  DONE: 'done'
}

function KycCapture() {
  const [step, setStep] = useState(STEPS.INTRO)
  const [front, setFront] = useState(null)
  const [back, setBack] = useState(null)
  const [selfie, setSelfie] = useState(null)
  const [livenessResult, setLivenessResult] = useState(null)
  const [faceMatchResult, setFaceMatchResult] = useState(null)
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
  const [livenessMessage, setLivenessMessage] = useState('')
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => {
    return () => {
      terminateOcr().catch(console.error)
      terminateLiveness().catch(console.error)
      terminateFaceMatch().catch(console.error)
      stopCameraStream()
    }
  }, [])

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }

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
        setMemberInfo(prev => ({
          ...prev,
          firstName: result.firstName || prev.firstName,
          lastName: result.lastName || prev.lastName,
          dob: result.dateOfBirth || prev.dob
        }))
        setStep(STEPS.BACK)
      } else {
        setBack(payload)
        setStep(STEPS.LIVENESS)
      }
    } catch (err) {
      console.error(`[KycCapture] ${side} capture error:`, err)
      setError(`Could not process ID ${side}. Please retake with better lighting and fit the card in the frame.`)
    }
  }

  const startLivenessCamera = async () => {
    setError(null)
    setLivenessMessage('Starting camera...')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: false
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setLivenessMessage('Please blink and slowly move your head...')
      runLiveness()
    } catch (err) {
      console.error('[KycCapture] Camera access error:', err)
      setError('Could not access camera for liveness check. Please allow camera access and try again.')
      setLivenessMessage('')
    }
  }

  const runLiveness = async () => {
    try {
      const result = await runLivenessChallenge(videoRef.current)
      setLivenessResult(result)

      if (!result.pass) {
        setLivenessMessage('Liveness check unclear. Please try again with better lighting and movement.')
        stopCameraStream()
        return
      }

      setLivenessMessage('Liveness confirmed. Capturing selfie...')
      const selfieDataUrl = captureSelfieFrame(videoRef.current)
      setSelfie(selfieDataUrl)
      stopCameraStream()

      // Run face-match against ID front
      if (front?.correctedImage) {
        setLivenessMessage('Comparing selfie to ID...')
        try {
          const match = await compareFaces(front.correctedImage, selfieDataUrl)
          setFaceMatchResult(match)
        } catch (matchErr) {
          console.warn('[KycCapture] Face match error:', matchErr)
          setFaceMatchResult({ match: false, score: 0, threshold: 0.6, error: matchErr.message })
        }
      }

      setStep(STEPS.REVIEW)
      setLivenessMessage('')
    } catch (err) {
      console.error('[KycCapture] Liveness error:', err)
      setError('Liveness check failed. Please try again.')
      setLivenessMessage('')
      stopCameraStream()
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
          extractedId: front?.extracted,
          livenessProof: livenessResult?.proof,
          faceMatch: faceMatchResult
            ? {
                score: faceMatchResult.score,
                match: faceMatchResult.match,
                threshold: faceMatchResult.threshold
              }
            : null
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

  const canSubmit = front && back && selfie && livenessResult?.pass &&
    memberInfo.firstName && memberInfo.lastName &&
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
            <li>A quick liveness selfie (blink + small head movement)</li>
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
          onSkip={() => setStep(STEPS.LIVENESS)}
        />
      )}

      {step === STEPS.LIVENESS && (
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Liveness Selfie</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Look at the camera, blink naturally, and move your head slightly.
          </p>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: '100%', maxWidth: 400, borderRadius: 12, background: '#000' }}
          />
          {livenessMessage && (
            <p style={{ color: '#22c55e', fontSize: '0.9rem', marginTop: '1rem' }}>{livenessMessage}</p>
          )}
          {!streamRef.current && (
            <button onClick={startLivenessCamera} style={{ ...primaryButtonStyle, marginTop: '1rem' }}>
              Start Liveness Check
            </button>
          )}
        </div>
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
            <h3 style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>Verification Checks</h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Liveness: <span style={{ color: livenessResult?.pass ? '#22c55e' : '#ef4444' }}>
                {livenessResult?.pass ? 'Passed' : 'Failed'}
              </span>
            </p>
            {faceMatchResult && (
              <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                Face match: <span style={{ color: faceMatchResult.match ? '#22c55e' : '#f59e0b' }}>
                  {faceMatchResult.match ? 'Match' : 'No match'} ({faceMatchResult.score})
                </span>
              </p>
            )}
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
