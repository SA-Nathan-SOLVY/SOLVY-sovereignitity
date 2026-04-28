import { useState, useEffect } from 'react'
import UnifiedNav from '../components/UnifiedNav'
import SolvyFooter from '../components/SolvyFooter'

const STORAGE_KEY = 'solvy_prelaunch_commitments'

interface Commitment {
  id?: number
  name: string
  email: string
  pledge: number
  date: string
  status: string
}

function escapeHtml(str: string) {
  return str.replace(/[&<>]/g, (m) =>
    m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;'
  )
}

export default function PrelaunchCommitment() {
  const [commitments, setCommitments] = useState<Commitment[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pledge, setPledge] = useState('500')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadCommitments()
  }, [])

  async function loadCommitments() {
    try {
      const res = await fetch('/api/prelaunch/commitments')
      if (res.ok) {
        const data = await res.json()
        const mapped: Commitment[] = data.commitments.map((c: any) => ({
          id: c.id,
          name: c.name,
          email: c.email,
          pledge: parseFloat(c.monthly_pledge),
          date: c.committed_at?.slice(0, 10) ?? c.created_at?.slice(0, 10),
          status: c.status,
        }))
        setCommitments(mapped)
        return
      }
    } catch {
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setCommitments(JSON.parse(stored))
    } catch {
    }
    setCommitments([
      {
        name: 'Evergreen Mayo',
        email: 'evergreen@ebl.beauty',
        pledge: 500,
        date: new Date().toISOString().slice(0, 10),
        status: 'committed',
      },
    ])
  }

  const totalMonthly = commitments.reduce((sum, c) => sum + c.pledge, 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email || !pledge) {
      alert('Please fill all fields.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/prelaunch/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), pledge: parseFloat(pledge) }),
      })
      if (!res.ok) throw new Error('Server error')
      await loadCommitments()
      setName('')
      setEmail('')
      setPledge('500')
      alert(`Thank you, ${name.trim()}. Your commitment helps build the cooperative.`)
    } catch {
      const local: Commitment[] = [
        ...commitments,
        {
          name: name.trim(),
          email: email.trim(),
          pledge: parseFloat(pledge),
          date: new Date().toISOString().slice(0, 10),
          status: 'committed',
        },
      ]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(local))
      setCommitments(local)
      setName('')
      setEmail('')
      setPledge('500')
      alert(`Thank you, ${name.trim()}. Your commitment has been recorded.`)
    } finally {
      setSubmitting(false)
    }
  }

  function exportCSV() {
    if (!commitments.length) {
      alert('No commitments to export.')
      return
    }
    const headers = ['Name', 'Email', 'Monthly Pledge (USD)', 'Date', 'Status']
    const rows = commitments.map((c) => [c.name, c.email, c.pledge, c.date, c.status])
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `solvy_commitments_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div style={styles.body}>
      <UnifiedNav currentPage="solvy" />
      <div style={styles.container}>

        {/* Urgency Banner */}
        <div style={styles.urgencyBanner}>
          <div style={styles.urgencyLeft}>
            <span style={styles.urgencyPill}>🚀 FUNDING MILESTONE APPROACHING</span>
            <span style={styles.urgencyText}>
              Unit.co card program in progress · Baanx Web3 card infrastructure — incoming development · AlchemyPay fiat/crypto bridge — not confirmed
            </span>
          </div>
          <span style={{ ...styles.urgencyLink, opacity: 0.5, cursor: 'default', pointerEvents: 'none' }}>Unit.co Review In Progress</span>
        </div>

        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '4px' }}>
            <img src="/solvy-crown-icon.png" alt="" style={{ height: '38px', width: 'auto', opacity: 0.9 }} />
            <div style={styles.logo}>SOLVY</div>
            <img src="/solvy-crown-icon.png" alt="" style={{ height: '38px', width: 'auto', opacity: 0.9 }} />
          </div>
          <div style={styles.tagline}>Own your spend. Own your future.</div>
          <div style={styles.headerSub}>
            Founding member commitments are open. Every commitment strengthens our card program underwriting.
          </div>
        </div>

        {/* Partner Strip */}
        <div style={styles.partnerStrip}>
          {[
            { name: 'Unit.co', icon: '🏦', status: 'Card Issuer' },
            { name: 'Baanx', icon: '⛓️', status: 'Web3 Infra' },
            { name: 'AlchemyPay', icon: '💱', status: 'Crypto Bridge' },
            { name: 'Stripe', icon: '💳', status: 'Merchant Processing' },
            { name: 'Mastercard', icon: '🔴', status: 'Card Network' },
            { name: 'Visa', icon: '🔵', status: 'Card Network' },
          ].map((p) => (
            <div key={p.name} style={styles.partnerChip}>
              <span>{p.icon}</span>
              <div>
                <div style={styles.partnerName}>{p.name}</div>
                <div style={styles.partnerRole}>{p.status}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.twoColumns}>
          <div style={styles.panel}>
            <h2>Join the cooperative revolution</h2>
            <p>
              SOLVY Card is not a bank. It's a cooperative. Every swipe earns interchange
              revenue shared back to members.
            </p>
            <ul style={styles.featureList}>
              <li style={styles.featureItem}>
                <span style={styles.check}>✓</span>
                <span><strong>70%</strong> of profits → Member pool (MOLI, benefits)</span>
              </li>
              <li style={styles.featureItem}>
                <span style={styles.check}>✓</span>
                <span><strong>20%</strong> → Operations · <strong>10%</strong> → Sovereign fund</span>
              </li>
              <li style={styles.featureItem}>
                <span style={styles.check}>✓</span>
                <span>🏦 <strong>Unit.co</strong> – FDIC-insured card issuance & banking</span>
              </li>
              <li style={styles.featureItem}>
                <span style={{ color: '#94a3b8', fontWeight: 'bold', flexShrink: 0 }}>◷</span>
                <span>⛓️ <strong>Baanx</strong> – Web3 card infrastructure <em style={{ color: '#94a3b8', fontSize: '0.85em' }}>(incoming development)</em></span>
              </li>
              <li style={styles.featureItem}>
                <span style={{ color: '#94a3b8', fontWeight: 'bold', flexShrink: 0 }}>◷</span>
                <span>💱 <strong>AlchemyPay</strong> – Fiat/crypto bridge <em style={{ color: '#94a3b8', fontSize: '0.85em' }}>(not yet confirmed)</em></span>
              </li>
              <li style={styles.featureItem}>
                <span style={styles.check}>✓</span>
                <span>📊 <strong>MAN</strong> – Full transparency portal</span>
              </li>
              <li style={{ ...styles.featureItem, borderBottom: 'none' }}>
                <span style={styles.check}>✓</span>
                <span>🎓 <strong>DECIDEY</strong> – Data sovereignty education</span>
              </li>
            </ul>
            <div style={styles.alert}>
              🔮 <strong>Prelaunch commitment</strong> — Founding member spots are limited. Secure your place in the cooperative.
            </div>
          </div>

          <div style={styles.panel}>
            <h2>Commit to membership</h2>
            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Full name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g., Evergreen Mayo"
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Monthly spending commitment (USD) *</label>
                <input
                  type="number"
                  value={pledge}
                  onChange={(e) => setPledge(e.target.value)}
                  step={100}
                  min={10}
                  required
                  style={styles.input}
                />
              </div>
              <button type="submit" style={styles.btnPrimary} disabled={submitting}>
                {submitting ? 'Submitting...' : '📝 Submit commitment'}
              </button>
            </form>
          </div>
        </div>

        <div style={styles.commitmentsSection}>
          <div style={styles.sectionHeader}>
            <h2>📋 Prelaunch commitments</h2>
            <button onClick={exportCSV} style={styles.btnSecondary}>⬇️ Export CSV</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Monthly pledge</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {commitments.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '12px 8px' }}>
                      No commitments yet. Be the first.
                    </td>
                  </tr>
                ) : (
                  commitments.map((c, i) => (
                    <tr key={c.id ?? i}>
                      <td style={styles.td}>{escapeHtml(c.name)}</td>
                      <td style={styles.td}>{escapeHtml(c.email)}</td>
                      <td style={styles.td}>${c.pledge.toFixed(2)}</td>
                      <td style={styles.td}>{c.date}</td>
                      <td style={styles.td}>
                        <span style={styles.statusBadge}>{c.status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {commitments.length > 0 && (
            <div style={styles.totalCommitment}>
              💰 Total monthly committed volume: ${totalMonthly.toFixed(2)}
              <br />
              📈 Annual projected: ${(totalMonthly * 12).toFixed(2)}
            </div>
          )}
        </div>

        <ContactSection />

        <SolvyFooter />
      </div>
    </div>
  )
}

function ContactSection() {
  const [cName, setCName] = useState('')
  const [cEmail, setCEmail] = useState('')
  const [cMsg, setCMsg] = useState('')
  const [cStatus, setCStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle')

  async function handleContact(e: React.FormEvent) {
    e.preventDefault()
    setCStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cName.trim(), email: cEmail.trim(), subject: 'Prelaunch Interest', message: cMsg.trim() }),
      })
      setCStatus(res.ok ? 'ok' : 'err')
      if (res.ok) { setCName(''); setCEmail(''); setCMsg('') }
    } catch { setCStatus('err') }
  }

  return (
    <div style={{ background: 'white', borderRadius: '32px', padding: '32px', marginTop: '32px', border: '1px solid #eef2f6', boxShadow: '0 8px 24px rgba(0,0,0,0.05)' }}>
      <h2 style={{ marginTop: 0, marginBottom: '8px', fontSize: '1.4rem' }}>💬 Have questions? Reach out.</h2>
      <p style={{ color: '#5a6e7c', marginBottom: '24px', fontSize: '0.95rem' }}>
        Not ready to commit yet? Send us a message and we'll be in touch. Every inquiry helps us build the cooperative you deserve.
      </p>
      <form onSubmit={handleContact} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: '6px', fontSize: '0.9rem' }}>Your name *</label>
          <input value={cName} onChange={e => setCName(e.target.value)} required placeholder="Full name" style={{ width: '100%', padding: '12px 14px', border: '1px solid #cbd5e1', borderRadius: '12px', fontSize: '0.95rem', boxSizing: 'border-box' as const }} />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: '6px', fontSize: '0.9rem' }}>Your email *</label>
          <input type="email" value={cEmail} onChange={e => setCEmail(e.target.value)} required placeholder="you@example.com" style={{ width: '100%', padding: '12px 14px', border: '1px solid #cbd5e1', borderRadius: '12px', fontSize: '0.95rem', boxSizing: 'border-box' as const }} />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: '6px', fontSize: '0.9rem' }}>Message *</label>
          <textarea value={cMsg} onChange={e => setCMsg(e.target.value)} required rows={4} placeholder="Tell us about yourself or ask a question…" style={{ width: '100%', padding: '12px 14px', border: '1px solid #cbd5e1', borderRadius: '12px', fontSize: '0.95rem', resize: 'vertical' as const, fontFamily: 'inherit', boxSizing: 'border-box' as const }} />
        </div>
        <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' as const }}>
          <button type="submit" disabled={cStatus === 'sending'} style={{ background: '#0f1e2c', color: 'white', border: 'none', padding: '12px 28px', borderRadius: '40px', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}>
            {cStatus === 'sending' ? 'Sending…' : '📩 Send Message'}
          </button>
          {cStatus === 'ok' && <span style={{ color: '#2c7a4d', fontWeight: 600 }}>✓ Received! We'll follow up at {cEmail || 'your email'}.</span>}
          {cStatus === 'err' && <span style={{ color: '#b91c1c' }}>⚠ Could not send. Email us directly: <a href="mailto:team@solvy.cards" style={{ color: '#b91c1c' }}>team@solvy.cards</a></span>}
        </div>
      </form>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  body: {
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    background: 'linear-gradient(135deg, #f5f7fc 0%, #eef2f9 100%)',
    color: '#1a2a3a',
    lineHeight: '1.5',
    minHeight: '100vh',
    padding: '24px',
  },
  container: { maxWidth: '1200px', margin: '0 auto' },
  header: { textAlign: 'center', marginBottom: '48px' },
  logo: {
    fontSize: '2.5rem',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #0f1e2c 0%, #2c4c6e 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  tagline: { fontSize: '1.1rem', color: '#5a6e7c' },
  twoColumns: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '32px',
    marginBottom: '48px',
  },
  panel: {
    background: 'white',
    borderRadius: '32px',
    padding: '32px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
    border: '1px solid #eef2f6',
  },
  featureList: { listStyle: 'none', margin: '24px 0', padding: 0 },
  featureItem: {
    padding: '12px 0',
    borderBottom: '1px solid #f0f2f5',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  check: { color: '#ffb347', fontWeight: 'bold', flexShrink: 0 },
  alert: {
    background: '#fff8e7',
    borderLeft: '4px solid #ffb347',
    padding: '16px',
    borderRadius: '16px',
    marginTop: '24px',
  },
  formGroup: { marginBottom: '20px' },
  label: { display: 'block', fontWeight: 500, marginBottom: '8px' },
  input: {
    width: '100%',
    padding: '14px 16px',
    border: '1px solid #cbd5e1',
    borderRadius: '16px',
    fontSize: '1rem',
    boxSizing: 'border-box',
  },
  btnPrimary: {
    width: '100%',
    background: '#0f1e2c',
    color: 'white',
    border: 'none',
    padding: '14px 24px',
    borderRadius: '40px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  commitmentsSection: {
    background: 'white',
    borderRadius: '32px',
    padding: '32px',
    marginTop: '32px',
    border: '1px solid #eef2f6',
    boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '20px',
  },
  btnSecondary: {
    background: 'transparent',
    border: '1px solid #cbd5e1',
    padding: '10px 20px',
    borderRadius: '40px',
    cursor: 'pointer',
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' },
  th: { textAlign: 'left', padding: '12px 8px', borderBottom: '1px solid #f0f2f5', fontWeight: 600 },
  td: { textAlign: 'left', padding: '12px 8px', borderBottom: '1px solid #f0f2f5' },
  statusBadge: {
    background: '#e6f7e6',
    color: '#2c7a4d',
    padding: '4px 10px',
    borderRadius: '40px',
    fontSize: '0.7rem',
    display: 'inline-block',
  },
  totalCommitment: {
    marginTop: '16px',
    textAlign: 'right',
    fontWeight: 700,
    borderTop: '1px solid #eef2f6',
    paddingTop: '16px',
  },
  footer: { textAlign: 'center', marginTop: '48px', color: '#8a9aa8', fontSize: '0.75rem' },

  urgencyBanner: {
    background: 'linear-gradient(135deg, #0f1e2c 0%, #1a3a5c 100%)',
    borderRadius: '16px',
    padding: '14px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap' as const,
    gap: '12px',
    marginBottom: '32px',
    border: '1px solid rgba(255,179,71,0.25)',
  },
  urgencyLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap' as const,
  },
  urgencyPill: {
    background: 'rgba(255,179,71,0.18)',
    color: '#ffb347',
    padding: '4px 12px',
    borderRadius: '40px',
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    whiteSpace: 'nowrap' as const,
  },
  urgencyText: {
    color: '#94a3b8',
    fontSize: '0.82rem',
  },
  urgencyLink: {
    color: '#ffb347',
    fontWeight: 700,
    fontSize: '0.82rem',
    textDecoration: 'none',
    whiteSpace: 'nowrap' as const,
  },
  headerSub: {
    color: '#64748b',
    fontSize: '0.9rem',
    marginTop: '8px',
    maxWidth: '560px',
    margin: '8px auto 0',
    lineHeight: 1.6,
  },
  partnerStrip: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    flexWrap: 'wrap' as const,
    marginBottom: '36px',
  },
  partnerChip: {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '10px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
    fontSize: '1.2rem',
  },
  partnerName: {
    fontWeight: 700,
    fontSize: '0.82rem',
    color: '#0f1e2c',
    lineHeight: 1.2,
  },
  partnerRole: {
    fontSize: '0.7rem',
    color: '#94a3b8',
  },
}
