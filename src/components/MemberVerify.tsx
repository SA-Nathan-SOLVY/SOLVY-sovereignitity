import { useState, useEffect, useCallback } from 'react'

// Reusable member email verification widget. Drives the one-time-code flow against
// the /api/member-auth endpoints and reports the verified email up to the parent
// via `onChange`. Used to gate governance voting and data-pool opt-ins so those
// actions are tied to a confirmed identity instead of a free-text email.

interface Props {
  onChange: (email: string | null) => void
  prompt?: string
}

type Step = 'email' | 'code'

export default function MemberVerify({ onChange, prompt }: Props) {
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null)
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)

  const applyVerified = useCallback((value: string | null) => {
    setVerifiedEmail(value)
    onChange(value)
  }, [onChange])

  // On mount, restore any existing verified session.
  useEffect(() => {
    let active = true
    fetch('/api/member-auth/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => { if (active) applyVerified(d.email ?? null) })
      .catch(() => {})
      .finally(() => { if (active) setChecking(false) })
    return () => { active = false }
  }, [applyVerified])

  const requestCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setBusy(true); setError(null); setInfo(null)
    try {
      const r = await fetch('/api/member-auth/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim() }),
      })
      const d = await r.json()
      if (d.success) {
        setStep('code')
        setInfo(d.devCode
          ? `Email delivery isn't configured here — your code is ${d.devCode}`
          : `We sent a 6-digit code to ${email.trim()}. Enter it below.`)
      } else {
        setError(d.error ?? 'Could not send a code. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    }
    setBusy(false)
  }

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return
    setBusy(true); setError(null)
    try {
      const r = await fetch('/api/member-auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code: code.trim() }),
      })
      const d = await r.json()
      if (d.success) {
        applyVerified(d.email)
        setStep('email'); setEmail(''); setCode(''); setInfo(null)
      } else {
        setError(d.error ?? 'Could not verify that code.')
      }
    } catch {
      setError('Network error. Please try again.')
    }
    setBusy(false)
  }

  const signOut = async () => {
    setBusy(true)
    try {
      await fetch('/api/member-auth/logout', { method: 'POST', credentials: 'include' })
    } catch { /* ignore */ }
    applyVerified(null)
    setStep('email'); setEmail(''); setCode(''); setInfo(null); setError(null)
    setBusy(false)
  }

  const maskEmail = (value: string) => {
    const [user, domain] = value.split('@')
    if (!domain) return value
    const masked = user.length <= 2 ? user[0] + '*' : user[0] + '***' + user[user.length - 1]
    return `${masked}@${domain}`
  }

  if (checking) {
    return <div style={st.wrap}><div style={st.muted}>Checking your verification…</div></div>
  }

  if (verifiedEmail) {
    return (
      <div style={st.wrap}>
        <div style={st.verifiedRow}>
          <span style={st.badge}>✓ Verified</span>
          <span style={st.verifiedText}>Signed in as <strong>{maskEmail(verifiedEmail)}</strong></span>
          <button type="button" onClick={signOut} disabled={busy} style={st.linkBtn}>Sign out</button>
        </div>
      </div>
    )
  }

  return (
    <div style={st.wrap}>
      {prompt && <p style={st.prompt}>{prompt}</p>}
      {step === 'email' ? (
        <form onSubmit={requestCode} style={st.form}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            style={st.input}
          />
          <button type="submit" disabled={busy} style={st.btn}>
            {busy ? 'Sending…' : 'Send code →'}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyCode} style={st.form}>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="6-digit code"
            required
            style={{ ...st.input, letterSpacing: '0.3em', textAlign: 'center' }}
          />
          <button type="submit" disabled={busy} style={st.btn}>
            {busy ? 'Verifying…' : 'Verify →'}
          </button>
          <button type="button" onClick={() => { setStep('email'); setCode(''); setError(null); setInfo(null) }} style={st.linkBtn}>
            Use a different email
          </button>
        </form>
      )}
      {info && <div style={st.info}>{info}</div>}
      {error && <div style={st.error}>{error}</div>}
      <p style={st.note}>
        We send a one-time code to confirm it's really you. Your vote and pool opt-ins are tied to this verified identity — one vote per member.
      </p>
    </div>
  )
}

const st: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: '480px' },
  prompt: { color: '#94a3b8', fontSize: '0.92rem', margin: '0 0 0.75rem' },
  form: { display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' },
  input: { flex: 1, minWidth: '200px', padding: '0.7rem 1rem', borderRadius: '8px', border: '1px solid rgba(147,51,234,0.4)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '1rem', outline: 'none' },
  btn: { background: 'linear-gradient(135deg, #9333ea, #7c3aed)', color: '#fff', border: 'none', padding: '0.7rem 1.25rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem', whiteSpace: 'nowrap' },
  linkBtn: { background: 'none', border: 'none', color: '#c4b5fd', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, padding: 0, textDecoration: 'underline' },
  note: { color: '#64748b', fontSize: '0.8rem', lineHeight: 1.5, margin: '0.75rem 0 0' },
  muted: { color: '#64748b', fontSize: '0.9rem' },
  info: { marginTop: '0.75rem', color: '#22c55e', fontSize: '0.88rem', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '8px', padding: '0.6rem 0.9rem' },
  error: { marginTop: '0.75rem', color: '#f87171', fontSize: '0.88rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', padding: '0.6rem 0.9rem' },
  verifiedRow: { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '10px', padding: '0.7rem 1rem' },
  badge: { background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)', padding: '3px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700 },
  verifiedText: { color: '#cbd5e1', fontSize: '0.9rem' },
}
