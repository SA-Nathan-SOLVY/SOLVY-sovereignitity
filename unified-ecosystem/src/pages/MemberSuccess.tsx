import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import UnifiedNav from '../components/UnifiedNav'
import './FoundingMemberApply.css'

interface MemberInfo {
  member_number: string
  first_name: string
  last_name: string
}

function MemberSuccess() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'pending' | 'error'>('loading')
  const [member, setMember] = useState<MemberInfo | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    
    if (!sessionId) {
      setStatus('error')
      setError('No session ID provided')
      return
    }

    const verifyPayment = async () => {
      try {
        const response = await fetch(`/api/founding-member/verify/${sessionId}`)
        const data = await response.json()

        if (data.success) {
          setStatus('success')
          setMember(data.member)
        } else if (data.status === 'unpaid') {
          setStatus('pending')
        } else {
          setStatus('error')
          setError(data.error || 'Payment verification failed')
        }
      } catch (err: any) {
        setStatus('error')
        setError(err.message)
      }
    }

    verifyPayment()
  }, [searchParams])

  return (
    <div className="founding-member-apply">
      <UnifiedNav currentPage="apply" />

      <div className="apply-container">
        <div className="apply-header">
          <img src="/solvy-crown-icon.png" alt="SOLVY" className="apply-crown" />
        </div>

        {status === 'loading' && (
          <div className="processing-step">
            <div className="spinner"></div>
            <h2>Verifying Your Payment...</h2>
            <p>Please wait while we confirm your membership.</p>
          </div>
        )}

        {status === 'success' && member && (
          <div className="success-step">
            <div className="success-icon">✓</div>
            <h1>Welcome to SOLVY, {member.first_name}!</h1>
            <p className="success-subtitle">Your founding membership is now active.</p>
            
            <div className="member-card-preview">
              <div className="card-badge">FOUNDING MEMBER</div>
              <div className="card-number">{member.member_number}</div>
              <div className="card-name">{member.first_name} {member.last_name}</div>
            </div>

            <div className="next-steps">
              <h3>What's Next?</h3>
              <ul>
                <li>Your SOLVY Card credentials will be emailed shortly</li>
                <li>Download the SOLVY app when available</li>
                <li>Start enjoying cooperative ownership benefits</li>
                <li>Your data sovereignty is now guaranteed</li>
              </ul>
            </div>

            <a href="/" className="btn-submit">Return to Home</a>
          </div>
        )}

        {status === 'pending' && (
          <div className="pending-step">
            <div className="pending-icon">⏳</div>
            <h2>Payment Processing</h2>
            <p>Your payment is being processed. Please check back shortly.</p>
            <a href="/" className="btn-submit">Return to Home</a>
          </div>
        )}

        {status === 'error' && (
          <div className="error-step">
            <div className="error-icon">✕</div>
            <h2>Verification Error</h2>
            <p>{error}</p>
            <a href="/apply" className="btn-submit">Try Again</a>
          </div>
        )}
      </div>

      <style>{`
        .success-step, .pending-step, .error-step {
          text-align: center;
          padding: 40px 20px;
        }
        
        .success-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          font-size: 40px;
          color: white;
        }
        
        .pending-icon {
          font-size: 60px;
          margin-bottom: 20px;
        }
        
        .error-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #fc8181 0%, #e53e3e 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          font-size: 40px;
          color: white;
        }
        
        .success-step h1 {
          color: white;
          font-size: 2rem;
          margin-bottom: 10px;
        }
        
        .success-subtitle {
          color: #48bb78;
          font-size: 1.2rem;
          margin-bottom: 30px;
        }
        
        .member-card-preview {
          background: linear-gradient(135deg, #805ad5 0%, #6b46c1 100%);
          border-radius: 16px;
          padding: 30px;
          max-width: 350px;
          margin: 0 auto 30px;
          text-align: center;
        }
        
        .card-badge {
          background: rgba(255, 255, 255, 0.2);
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          color: white;
          display: inline-block;
          margin-bottom: 15px;
        }
        
        .card-number {
          color: white;
          font-size: 1.8rem;
          font-weight: bold;
          margin-bottom: 10px;
          letter-spacing: 2px;
        }
        
        .card-name {
          color: rgba(255, 255, 255, 0.9);
          font-size: 1.1rem;
        }
        
        .next-steps {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 25px;
          margin: 30px auto;
          max-width: 400px;
          text-align: left;
        }
        
        .next-steps h3 {
          color: white;
          margin-bottom: 15px;
        }
        
        .next-steps ul {
          list-style: none;
          padding: 0;
        }
        
        .next-steps li {
          color: #e2e8f0;
          padding: 8px 0;
          padding-left: 25px;
          position: relative;
        }
        
        .next-steps li::before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #48bb78;
        }
        
        .pending-step h2, .error-step h2 {
          color: white;
          margin-bottom: 15px;
        }
        
        .pending-step p, .error-step p {
          color: #a0aec0;
          margin-bottom: 30px;
        }
      `}</style>
    </div>
  )
}

export default MemberSuccess
