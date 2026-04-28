import { useState, useEffect, useRef } from 'react'
import UnifiedNav from '../components/UnifiedNav'
import './Banking.css'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'unit-elements-white-label-app': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        'jwt-token'?: string;
        'settings-json'?: string;
      }, HTMLElement>;
    }
  }
}

const UNIT_SETTINGS = JSON.stringify({
  global: {
    colors: {
      primary: '#7c3aed',
      secondary: '#14b8a6',
    },
    buttons: {
      primary: {
        default: { borderRadius: '8px' },
      },
    },
  },
  elementsCard: {
    designs: [
      {
        name: 'default',
        url: '/SOV.png',
        fontColor: '#fafafa',
      },
    ],
  },
})

function Banking() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [token, setToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/unit/token')
      .then((res) => res.json())
      .then((data) => {
        if (data.token) {
          setToken(data.token)
        } else {
          setError(data.error || 'Banking unavailable')
        }
      })
      .catch(() => setError('Could not connect to banking service'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!token || !containerRef.current) return

    containerRef.current.innerHTML = ''
    const unitElement = document.createElement('unit-elements-white-label-app')
    unitElement.setAttribute('jwt-token', token)
    unitElement.setAttribute('settings-json', UNIT_SETTINGS)
    containerRef.current.appendChild(unitElement)
  }, [token])

  const setupSteps = [
    {
      number: '01',
      time: '10 min',
      title: 'Review the docs',
      description: 'Unit.co getting started guide reviewed and implementation mapped.',
      done: true,
      link: 'https://docs.unit.co',
      linkLabel: 'Unit.co Docs →',
    },
    {
      number: '02',
      time: '15 min',
      title: 'Set up end-user authentication',
      description: 'JWT token endpoint is live at /api/unit/token — fetches a scoped customer token from Unit.co per session.',
      done: true,
      link: null,
      linkLabel: null,
    },
    {
      number: '03',
      time: '30 min',
      title: 'Embed the Ready to Launch component',
      description: 'unit-elements-white-label-app is embedded on this page, loading from ui.s.unit.sh/release/latest/components-extended.js with SOLVY branding applied.',
      done: true,
      link: null,
      linkLabel: null,
    },
    {
      number: '04',
      time: '1–2 days',
      title: 'Set up callback endpoints & credentials',
      description: 'Prefill endpoint live at /api/unit/prefill. Final step: add UNIT_API_TOKEN to environment secrets in Replit.',
      done: !error,
      link: 'https://app.unit.co',
      linkLabel: 'Unit.co Dashboard →',
    },
  ]

  return (
    <div className="banking-page">
      <UnifiedNav />

      <section className="banking-hero">
        <div className="container">
          <h1>SOLVY Banking Portal</h1>
          <p className="banking-subtitle">
            Powered by Unit.co — Your cooperative financial services hub
          </p>
          <div className="banking-badges">
            <span className="badge">FDIC Insured</span>
            <span className="badge">Virtual Debit Cards</span>
            <span className="badge">Instant Transfers</span>
            <span className="badge badge-sandbox">Sandbox Mode</span>
          </div>
        </div>
      </section>

      {/* Unit.co white-label app — renders when token is available */}
      {(loading || token) && (
        <section className="banking-container">
          <div className="unit-wrapper" ref={containerRef}>
            {loading && (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading banking portal...</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Setup Guide — shown when credentials are not yet configured */}
      {!loading && error && (
        <section className="banking-setup" style={{ padding: '40px 24px', maxWidth: '860px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div style={{ display: 'inline-block', background: 'rgba(255,179,71,0.15)', border: '1px solid #ffb347', color: '#ffb347', padding: '5px 16px', borderRadius: '40px', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.07em', marginBottom: '14px' }}>
              UNIT.CO — READY TO LAUNCH
            </div>
            <h2 style={{ color: 'white', fontSize: '1.6rem', fontWeight: 800, marginBottom: '10px' }}>Integration Setup Progress</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '500px', margin: '0 auto' }}>
              Three of four steps are already complete. Add your Unit.co API token to go live.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {setupSteps.map((step) => (
              <div key={step.number} style={{
                background: step.done ? 'rgba(20, 184, 130, 0.08)' : 'rgba(255, 179, 71, 0.08)',
                border: step.done ? '1px solid rgba(20, 184, 130, 0.3)' : '1px solid rgba(255, 179, 71, 0.4)',
                borderRadius: '16px',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '20px',
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: step.done ? 'rgba(20, 184, 130, 0.2)' : 'rgba(255, 179, 71, 0.15)',
                  border: step.done ? '2px solid #14b8a6' : '2px solid #ffb347',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem',
                  flexShrink: 0,
                }}>
                  {step.done ? '✓' : '○'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 700 }}>STEP {step.number}</span>
                    <span style={{ color: '#475569', fontSize: '0.72rem' }}>·</span>
                    <span style={{ color: '#475569', fontSize: '0.72rem' }}>{step.time}</span>
                    <span style={{
                      background: step.done ? 'rgba(20,184,130,0.15)' : 'rgba(255,179,71,0.15)',
                      color: step.done ? '#14b8a6' : '#ffb347',
                      padding: '2px 8px',
                      borderRadius: '20px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                    }}>
                      {step.done ? 'COMPLETE' : 'ACTION NEEDED'}
                    </span>
                  </div>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', marginBottom: '6px' }}>{step.title}</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: 1.5 }}>{step.description}</div>
                  {step.link && (
                    <a href={step.link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '10px', color: '#ffb347', fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none' }}>
                      {step.linkLabel}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(124, 58, 237, 0.12)', border: '1px solid rgba(124, 58, 237, 0.3)', borderRadius: '16px', padding: '20px 24px', marginTop: '24px' }}>
            <div style={{ color: 'white', fontWeight: 700, marginBottom: '8px' }}>🔑 To activate banking:</div>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.7 }}>
              1. Go to your <a href="https://app.unit.co" target="_blank" rel="noopener noreferrer" style={{ color: '#7c3aed' }}>Unit.co dashboard</a> → API Tokens<br />
              2. Copy your API token<br />
              3. In Replit → Secrets, add <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>UNIT_API_TOKEN</code> = your token<br />
              4. Also add <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>UNIT_CUSTOMER_ID</code> = your test customer ID
            </div>
          </div>
        </section>
      )}

      <section className="banking-info">
        <div className="container">
          <div className="info-grid">
            <div className="info-card">
              <div className="info-icon">🏦</div>
              <h3>Open Your Account</h3>
              <p>Quick verification process to get started with your SOLVY cooperative account</p>
            </div>
            <div className="info-card">
              <div className="info-icon">💳</div>
              <h3>Virtual Debit Card</h3>
              <p>Get instant access to your virtual card for online purchases</p>
            </div>
            <div className="info-card">
              <div className="info-icon">📱</div>
              <h3>Send & Receive</h3>
              <p>Transfer funds instantly to other SOLVY members</p>
            </div>
            <div className="info-card">
              <div className="info-icon">📊</div>
              <h3>Track Everything</h3>
              <p>Full transaction history and spending insights</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Banking
