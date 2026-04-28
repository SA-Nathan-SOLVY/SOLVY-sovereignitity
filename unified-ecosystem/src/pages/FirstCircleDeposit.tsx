import { useState, useEffect } from 'react'
import UnifiedNav from '../components/UnifiedNav'

type PageState = 'form' | 'loading' | 'success' | 'canceled' | 'pending'

function generateMemberId() {
  return 'fc_' + Math.random().toString(36).substr(2, 9)
}

export default function FirstCircleDeposit() {
  const [pageState, setPageState] = useState<PageState>('form')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [confirmedEmail, setConfirmedEmail] = useState('')
  const [paymentLink, setPaymentLink] = useState<string | null>(null)
  const [linkLoading, setLinkLoading] = useState(false)
  const [linkError, setLinkError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Fetch the shareable Stripe Payment Link
    setLinkLoading(true)
    fetch('/api/stripe/first-circle-link')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.url) {
          setPaymentLink(data.url)
        } else {
          setLinkError(data.error ?? 'Payment link unavailable')
        }
      })
      .catch(() => setLinkError('Could not load payment link'))
      .finally(() => setLinkLoading(false))
  }, [])

  function handleCopy() {
    if (!paymentLink) return
    navigator.clipboard.writeText(paymentLink).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sessionId = params.get('session_id')
    const success = params.get('success')
    const canceled = params.get('canceled')

    if (canceled === 'true') {
      setMessage({ text: 'Payment was canceled. You can try again when ready.', type: 'info' })
      setPageState('form')
      return
    }

    if (success === 'true' && sessionId) {
      setPageState('loading')
      fetch(`/api/stripe/session-status?sessionId=${sessionId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.status === 'paid') {
            setConfirmedEmail(data.customerEmail ?? '')
            setPageState('success')
          } else {
            setMessage({ text: 'Payment status pending. We will update you shortly.', type: 'info' })
            setPageState('pending')
          }
        })
        .catch(() => {
          setMessage({ text: 'Could not verify payment status. Please contact support@solvy.cards', type: 'error' })
          setPageState('form')
        })
    }
  }, [])

  async function handleDeposit(e: React.FormEvent) {
    e.preventDefault()
    const trimEmail = email.trim()
    const trimName = name.trim()

    if (!trimEmail || !trimName) {
      setMessage({ text: 'Please enter both your email and full name.', type: 'error' })
      return
    }

    setMessage(null)
    setPageState('loading')

    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimEmail, name: trimName, memberId: generateMemberId() }),
      })

      const data = await res.json()

      if (data.success && data.url) {
        window.location.href = data.url
      } else {
        setMessage({ text: data.error ?? 'Unable to start checkout. Please try again.', type: 'error' })
        setPageState('form')
      }
    } catch {
      setMessage({ text: 'Network error. Please check your connection and try again.', type: 'error' })
      setPageState('form')
    }
  }

  const showForm = pageState === 'form' || pageState === 'pending'

  return (
    <div style={s.page}>
      <UnifiedNav />

      {/* Hero */}
      <section style={s.hero}>
        <h1 style={s.heroTitle}>Join First Circle</h1>
        <p style={s.heroSub}>
          Secure your founding membership with a $100 equity deposit. This deposit makes you a
          member-owner of SOLVY Ecosystem™ with voting rights and dividend eligibility.
        </p>
      </section>

      {/* Card */}
      <div style={s.container}>
        <div style={s.depositCard}>
          <div style={s.price}>$100<span style={s.priceSuffix}>USD</span></div>
          <p style={s.description}>One-time equity deposit — refundable per cooperative bylaws</p>

          <ul style={s.benefits}>
            {[
              'Member-owner status with voting rights',
              'Priority access to SOLVY Card™ issuance',
              '70% patronage dividend eligibility',
              'Founding member recognition in First Circle',
            ].map((b) => (
              <li key={b} style={s.benefitItem}>
                <span style={s.checkmark}>✓</span>
                {b}
              </li>
            ))}
          </ul>

          {/* Shareable Payment Link */}
          <div style={s.linkSection}>
            <p style={s.linkHeading}>📎 Share the First Circle Link</p>
            <p style={s.linkSub}>
              Send this Stripe-hosted link to a new member — no form needed on your end.
              Payments route directly to our cooperative account at Metro City Bank &amp; USAA via Stripe.
            </p>
            {linkLoading && (
              <div style={s.linkPill}>
                <span style={{ color: '#64748b' }}>Generating secure link…</span>
              </div>
            )}
            {!linkLoading && paymentLink && (
              <div style={s.linkRow}>
                <span style={s.linkText}>{paymentLink}</span>
                <button onClick={handleCopy} style={{ ...s.copyBtn, ...(copied ? s.copiedBtn : {}) }}>
                  {copied ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
            )}
            {!linkLoading && paymentLink && (
              <a href={paymentLink} target="_blank" rel="noopener noreferrer" style={s.openLink}>
                Open payment page ↗
              </a>
            )}
            {!linkLoading && linkError && (
              <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                {linkError}
              </p>
            )}
          </div>

          <div style={s.divider}>
            <span style={s.dividerLabel}>or pay directly below</span>
          </div>

          {/* Message bar */}
          {message && (
            <div style={{ ...s.msgBase, ...msgVariants[message.type] }}>
              {message.text}
            </div>
          )}

          {/* Form */}
          {showForm && (
            <form onSubmit={handleDeposit}>
              <div style={s.formGroup}>
                <label style={s.label}>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  style={s.input}
                  onFocus={(e) => { e.target.style.borderColor = '#9333ea'; e.target.style.boxShadow = '0 0 0 3px rgba(147,51,234,0.15)' }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(147,51,234,0.3)'; e.target.style.boxShadow = 'none' }}
                />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  required
                  style={s.input}
                  onFocus={(e) => { e.target.style.borderColor = '#9333ea'; e.target.style.boxShadow = '0 0 0 3px rgba(147,51,234,0.15)' }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(147,51,234,0.3)'; e.target.style.boxShadow = 'none' }}
                />
              </div>
              <button type="submit" style={s.submitBtn}>
                Proceed to Secure Payment
              </button>
            </form>
          )}

          {/* Loading */}
          {pageState === 'loading' && (
            <div style={s.loadingRow}>
              <div style={s.spinner} />
              <span style={{ color: '#94a3b8' }}>Redirecting to Stripe...</span>
            </div>
          )}

          {/* Success */}
          {pageState === 'success' && (
            <div style={{ ...s.msgBase, ...msgVariants.success }}>
              ✅ Payment confirmed! Welcome to First Circle
              {confirmedEmail ? `, ${confirmedEmail}` : ''}. Check your email for next steps.
            </div>
          )}

          <p style={s.secureNote}>
            <span style={{ color: '#22c55e' }}>🔒</span>{' '}
            Payments processed securely by Stripe. SOLVY does not store your card details.
          </p>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <a href="/apply" style={s.backLink}>← Back to Onboarding</a>
        </div>
      </div>
    </div>
  )
}

const msgVariants: Record<'success' | 'error' | 'info', React.CSSProperties> = {
  success: {
    background: 'rgba(34,197,94,0.1)',
    border: '1px solid rgba(34,197,94,0.3)',
    color: '#22c55e',
  },
  error: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    color: '#ef4444',
  },
  info: {
    background: 'rgba(147,51,234,0.1)',
    border: '1px solid rgba(147,51,234,0.3)',
    color: '#9333ea',
  },
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#0f172a',
    color: '#fff',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  hero: {
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    padding: '5rem 2rem 3rem',
    textAlign: 'center',
    borderBottom: '1px solid rgba(147,51,234,0.2)',
  },
  heroTitle: {
    fontSize: '2.5rem',
    marginBottom: '1rem',
    background: 'linear-gradient(135deg, #9333ea, #ec4899)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontWeight: 700,
  },
  heroSub: {
    color: '#94a3b8',
    maxWidth: '600px',
    margin: '0 auto',
    fontSize: '1.1rem',
    lineHeight: 1.6,
  },
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '3rem 2rem 4rem',
  },
  depositCard: {
    background: 'rgba(147,51,234,0.05)',
    border: '1px solid rgba(147,51,234,0.2)',
    borderRadius: '16px',
    padding: '2.5rem',
    textAlign: 'center',
  },
  price: {
    fontSize: '3.5rem',
    fontWeight: 700,
    color: '#fff',
    margin: '1rem 0',
  },
  priceSuffix: {
    fontSize: '1.2rem',
    color: '#94a3b8',
    fontWeight: 500,
    marginLeft: '6px',
  },
  description: {
    color: '#94a3b8',
    marginBottom: '2rem',
    fontSize: '0.95rem',
  },
  benefits: {
    textAlign: 'left',
    margin: '0 0 2rem',
    padding: 0,
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  benefitItem: {
    color: '#cbd5e1',
    paddingLeft: '1.5rem',
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    fontSize: '0.95rem',
  },
  checkmark: {
    color: '#ec4899',
    fontWeight: 700,
    flexShrink: 0,
    marginLeft: '-1.5rem',
    width: '1.5rem',
  },
  msgBase: {
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    fontSize: '0.92rem',
    lineHeight: 1.5,
    textAlign: 'left' as const,
  },
  formGroup: {
    marginBottom: '1.25rem',
    textAlign: 'left' as const,
  },
  label: {
    display: 'block',
    color: '#cbd5e1',
    fontSize: '0.9rem',
    marginBottom: '0.5rem',
    fontWeight: 500,
  },
  input: {
    width: '100%',
    padding: '0.875rem 1rem',
    background: 'rgba(15,23,42,0.6)',
    border: '1px solid rgba(147,51,234,0.3)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '1rem',
    boxSizing: 'border-box' as const,
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  submitBtn: {
    width: '100%',
    background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '1rem',
    fontSize: '1.1rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: '1rem',
    transition: 'all 0.2s',
  },
  loadingRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    margin: '1.5rem 0',
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: '2px solid rgba(147,51,234,0.3)',
    borderTopColor: '#9333ea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  secureNote: {
    marginTop: '1.5rem',
    fontSize: '0.85rem',
    color: '#64748b',
  },
  backLink: {
    color: '#94a3b8',
    fontSize: '0.9rem',
    textDecoration: 'none',
  },
  linkSection: {
    background: 'rgba(34,197,94,0.05)',
    border: '1px solid rgba(34,197,94,0.2)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    textAlign: 'left' as const,
  },
  linkHeading: {
    color: '#22c55e',
    fontWeight: 700,
    fontSize: '1rem',
    margin: '0 0 0.5rem',
  },
  linkSub: {
    color: '#94a3b8',
    fontSize: '0.88rem',
    margin: '0 0 1rem',
    lineHeight: 1.5,
  },
  linkPill: {
    padding: '0.75rem 1rem',
    background: 'rgba(15,23,42,0.4)',
    border: '1px solid rgba(100,116,139,0.3)',
    borderRadius: '8px',
    fontSize: '0.88rem',
  },
  linkRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: 'rgba(15,23,42,0.5)',
    border: '1px solid rgba(34,197,94,0.25)',
    borderRadius: '8px',
    padding: '0.65rem 0.85rem',
    marginBottom: '0.75rem',
  },
  linkText: {
    flex: 1,
    color: '#86efac',
    fontSize: '0.85rem',
    wordBreak: 'break-all' as const,
    fontFamily: 'monospace',
  },
  copyBtn: {
    flexShrink: 0,
    background: 'rgba(34,197,94,0.15)',
    border: '1px solid rgba(34,197,94,0.4)',
    borderRadius: '6px',
    color: '#22c55e',
    fontWeight: 600,
    fontSize: '0.82rem',
    padding: '0.35rem 0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  copiedBtn: {
    background: 'rgba(34,197,94,0.25)',
    color: '#86efac',
  },
  openLink: {
    color: '#86efac',
    fontSize: '0.85rem',
    textDecoration: 'underline',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  },
  dividerLabel: {
    color: '#475569',
    fontSize: '0.82rem',
    whiteSpace: 'nowrap' as const,
  },
}
