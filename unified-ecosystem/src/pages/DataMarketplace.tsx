import { useState, useEffect } from 'react'
import UnifiedNav from '../components/UnifiedNav'

interface DataPool {
  id: string
  name: string
  category: string
  description: string
  optinCount: number
}

const PRIVACY_GUARANTEES = [
  { icon: '🔐', title: 'No individual data ever leaves your device', body: 'Only anonymized, aggregated summaries are included in any dataset sold to buyers.' },
  { icon: '✋', title: 'Explicit opt-in per pool', body: 'You choose exactly which pools to join. Opting into one does not enroll you in others.' },
  { icon: '🗳️', title: 'Member vote for every sale', body: 'No dataset is sold without a proposal and approval vote through the MAN (Mandatory Audit Network).' },
  { icon: '🚪', title: 'Right to withdraw at any time', body: 'Leave a pool whenever you choose. Your data is removed from future exports immediately.' },
  { icon: '💰', title: '70% of revenue returns to contributors', body: 'The same 70/20/10 cooperative split applies to data pool revenue as to interchange fees.' },
]

export default function DataMarketplace() {
  const [email, setEmail] = useState('')
  const [emailSubmitted, setEmailSubmitted] = useState(false)
  const [pools, setPools] = useState<DataPool[]>([])
  const [myOptins, setMyOptins] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null)

  useEffect(() => {
    fetch('/api/data-pools')
      .then((r) => r.json())
      .then((d) => setPools(d.pools ?? []))
      .catch(() => {})
  }, [])

  const loadMyOptins = async (memberEmail: string) => {
    setLoading(true)
    try {
      const r = await fetch(`/api/data-pools/my-optins?email=${encodeURIComponent(memberEmail)}`)
      const d = await r.json()
      setMyOptins(d.optins ?? [])
      setEmailSubmitted(true)
    } catch {
      setMessage({ text: 'Could not load your opt-ins. Please try again.', type: 'error' })
    }
    setLoading(false)
  }

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    loadMyOptins(email.trim())
  }

  const toggleOptin = async (poolId: string) => {
    if (!emailSubmitted || toggling) return
    const isIn = myOptins.includes(poolId)
    setToggling(poolId)
    try {
      const r = await fetch('/api/data-pools/optin', {
        method: isIn ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), poolId }),
      })
      const d = await r.json()
      if (d.success !== false) {
        setMyOptins((prev) =>
          isIn ? prev.filter((id) => id !== poolId) : [...prev, poolId]
        )
        setPools((prev) =>
          prev.map((p) =>
            p.id === poolId
              ? { ...p, optinCount: p.optinCount + (isIn ? -1 : 1) }
              : p
          )
        )
        setMessage({ text: isIn ? `Left "${pools.find(p=>p.id===poolId)?.name}" pool.` : `Joined "${pools.find(p=>p.id===poolId)?.name}" pool.`, type: 'success' })
      } else {
        setMessage({ text: d.error ?? 'Something went wrong.', type: 'error' })
      }
    } catch {
      setMessage({ text: 'Network error. Please try again.', type: 'error' })
    }
    setToggling(null)
    setTimeout(() => setMessage(null), 3500)
  }

  return (
    <div style={s.page}>
      <UnifiedNav />

      {/* Hero */}
      <section style={s.hero}>
        <div style={s.heroBadge}>🔐 SOVEREIGNITITY™ Data Marketplace</div>
        <h1 style={s.heroTitle}>
          Your Data.<br />
          <span style={s.accent}>Your Revenue.</span>
        </h1>
        <p style={s.heroSub}>
          For generations, corporations sold your behavioral data without asking.
          SOLVY flips the model — you opt in, you govern, and 70% of every sale comes back to you.
        </p>
      </section>

      {/* Privacy guarantees */}
      <section style={{ ...s.section, background: 'rgba(147,51,234,0.04)' }}>
        <div style={s.container}>
          <h2 style={s.sectionTitle}>Non-Negotiable Protections</h2>
          <div style={s.guaranteeGrid}>
            {PRIVACY_GUARANTEES.map((g) => (
              <div key={g.title} style={s.guaranteeCard}>
                <div style={s.guaranteeIcon}>{g.icon}</div>
                <div style={s.guaranteeTitle}>{g.title}</div>
                <div style={s.guaranteeBody}>{g.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Revenue split explainer */}
      <section style={s.section}>
        <div style={{ ...s.container, maxWidth: '700px' }}>
          <h2 style={s.sectionTitle}>How Revenue Is Split</h2>
          <p style={s.bodyText}>
            Every time a data pool is licensed to a buyer, the proceeds follow the same cooperative model as interchange fees:
          </p>
          <div style={s.splitRow}>
            <div style={{ ...s.splitCell, background: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.3)' }}>
              <div style={{ ...s.splitPct, color: '#22c55e' }}>70%</div>
              <div style={s.splitLabel}>Contributing Members</div>
              <div style={s.splitSub}>Shared equally among members who opted into that pool</div>
            </div>
            <div style={{ ...s.splitCell, background: 'rgba(147,51,234,0.1)', borderColor: 'rgba(147,51,234,0.3)' }}>
              <div style={{ ...s.splitPct, color: '#9333ea' }}>20%</div>
              <div style={s.splitLabel}>Operations Funding</div>
              <div style={s.splitSub}>Platform infrastructure, compliance, and growth</div>
            </div>
            <div style={{ ...s.splitCell, background: 'rgba(236,72,153,0.1)', borderColor: 'rgba(236,72,153,0.3)' }}>
              <div style={{ ...s.splitPct, color: '#ec4899' }}>10%</div>
              <div style={s.splitLabel}>Sovereign Wealth Fund</div>
              <div style={s.splitSub}>SOVEREIGNITITY™ — long-term cooperative capital</div>
            </div>
          </div>
          <p style={{ ...s.bodyText, marginTop: '1rem' }}>
            All sales and distributions are visible in the <a href="/man" style={s.link}>MAN Portal</a>.
          </p>
        </div>
      </section>

      {/* Email gate + pools */}
      <section style={{ ...s.section, background: 'rgba(147,51,234,0.04)' }}>
        <div style={s.container}>
          <h2 style={s.sectionTitle}>Available Data Pools</h2>

          {!emailSubmitted ? (
            <div style={s.emailGate}>
              <p style={s.bodyText}>
                Enter your member email to view and manage your pool opt-ins.
              </p>
              <form onSubmit={handleEmailSubmit} style={s.emailForm}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  style={s.emailInput}
                />
                <button type="submit" disabled={loading} style={s.emailBtn}>
                  {loading ? 'Loading…' : 'View My Pools →'}
                </button>
              </form>
              <p style={s.privacyNote}>
                Your email is only used to look up your pool memberships. It is never stored in a new location or shared.
              </p>
            </div>
          ) : null}

          {message && (
            <div style={{ ...s.msgBase, ...(message.type === 'success' ? s.msgSuccess : message.type === 'error' ? s.msgError : s.msgInfo) }}>
              {message.text}
            </div>
          )}

          <div style={s.poolsGrid}>
            {pools.map((pool) => {
              const isIn = myOptins.includes(pool.id)
              const isToggling = toggling === pool.id
              return (
                <div key={pool.id} style={{ ...s.poolCard, ...(isIn ? s.poolCardActive : {}) }}>
                  <div style={s.poolHeader}>
                    <div>
                      <div style={s.poolCategory}>{pool.category}</div>
                      <h3 style={s.poolName}>{pool.name}</h3>
                    </div>
                    {isIn && <div style={s.poolBadge}>✓ Joined</div>}
                  </div>
                  <p style={s.poolDesc}>{pool.description}</p>
                  <div style={s.poolFooter}>
                    <div style={s.poolCount}>
                      <span style={s.poolCountNum}>{pool.optinCount.toLocaleString()}</span>
                      <span style={s.poolCountLabel}> contributing members</span>
                    </div>
                    {emailSubmitted && (
                      <button
                        onClick={() => toggleOptin(pool.id)}
                        disabled={isToggling}
                        style={{ ...s.poolBtn, ...(isIn ? s.poolBtnLeave : s.poolBtnJoin) }}
                      >
                        {isToggling ? '…' : isIn ? 'Leave Pool' : 'Join Pool'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {!emailSubmitted && (
            <p style={{ ...s.bodyText, textAlign: 'center' as const, marginTop: '1rem', fontSize: '0.85rem' }}>
              You can browse pools without signing in. Enter your email above to opt in or out.
            </p>
          )}
        </div>
      </section>

      {/* CTA */}
      <section style={s.ctaSection}>
        <h2 style={s.ctaTitle}>Own Your Data. <span style={s.accent}>Share in Its Value.</span></h2>
        <p style={s.ctaSub}>All activity is transparent on the MAN (Mandatory Audit Network)</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' as const }}>
          <a href="/man" style={s.ctaBtnSecondary}>View MAN Portal →</a>
          <a href="/first-circle-deposit" style={s.ctaBtn}>Join First Circle →</a>
        </div>
      </section>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#0f172a', color: '#fff', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
  hero: { background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '7rem 2rem 4rem', textAlign: 'center', borderBottom: '1px solid rgba(147,51,234,0.2)' },
  heroBadge: { display: 'inline-block', background: 'rgba(147,51,234,0.15)', border: '1px solid rgba(147,51,234,0.3)', color: '#c4b5fd', padding: '6px 18px', borderRadius: '40px', fontSize: '0.82rem', fontWeight: 600, marginBottom: '20px', letterSpacing: '0.04em' },
  heroTitle: { fontSize: '2.8rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem', maxWidth: '600px', margin: '0 auto 1rem' },
  accent: { background: 'linear-gradient(135deg, #9333ea, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
  heroSub: { color: '#94a3b8', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 },
  section: { padding: '4rem 2rem' },
  container: { maxWidth: '960px', margin: '0 auto' },
  sectionTitle: { fontSize: '1.75rem', fontWeight: 700, marginBottom: '2rem', textAlign: 'center', background: 'linear-gradient(135deg, #9333ea, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
  bodyText: { color: '#94a3b8', fontSize: '1rem', lineHeight: 1.7, marginBottom: '1.5rem' },
  link: { color: '#c4b5fd', textDecoration: 'underline' },
  guaranteeGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' },
  guaranteeCard: { background: 'rgba(147,51,234,0.07)', border: '1px solid rgba(147,51,234,0.2)', borderRadius: '14px', padding: '1.5rem' },
  guaranteeIcon: { fontSize: '1.75rem', marginBottom: '0.75rem' },
  guaranteeTitle: { fontWeight: 700, color: '#e2e8f0', marginBottom: '6px', fontSize: '0.95rem' },
  guaranteeBody: { color: '#94a3b8', fontSize: '0.87rem', lineHeight: 1.55 },
  splitRow: { display: 'flex', gap: '16px', flexWrap: 'wrap' as const },
  splitCell: { flex: 1, minWidth: '180px', border: '1px solid', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' as const },
  splitPct: { fontSize: '2.2rem', fontWeight: 800, marginBottom: '6px' },
  splitLabel: { fontWeight: 700, color: '#e2e8f0', marginBottom: '4px', fontSize: '0.9rem' },
  splitSub: { color: '#94a3b8', fontSize: '0.82rem', lineHeight: 1.4 },
  emailGate: { maxWidth: '500px', margin: '0 auto 2.5rem', textAlign: 'center' as const },
  emailForm: { display: 'flex', gap: '10px', marginBottom: '0.75rem', flexWrap: 'wrap' as const },
  emailInput: { flex: 1, minWidth: '220px', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(147,51,234,0.4)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '1rem', outline: 'none' },
  emailBtn: { background: 'linear-gradient(135deg, #9333ea, #7c3aed)', color: '#fff', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem', whiteSpace: 'nowrap' as const },
  privacyNote: { color: '#64748b', fontSize: '0.82rem', lineHeight: 1.5 },
  msgBase: { padding: '0.85rem 1.25rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.92rem' },
  msgSuccess: { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' },
  msgError: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' },
  msgInfo: { background: 'rgba(147,51,234,0.1)', border: '1px solid rgba(147,51,234,0.3)', color: '#c4b5fd' },
  poolsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '1.5rem' },
  poolCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(147,51,234,0.15)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'border-color 0.2s' },
  poolCardActive: { border: '1px solid rgba(34,197,94,0.4)', background: 'rgba(34,197,94,0.04)' },
  poolHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' },
  poolCategory: { fontSize: '0.75rem', fontWeight: 600, color: '#9333ea', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '4px' },
  poolName: { fontSize: '1.05rem', fontWeight: 700, color: '#e2e8f0', margin: 0 },
  poolBadge: { background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, flexShrink: 0 },
  poolDesc: { color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.55, margin: 0, flex: 1 },
  poolFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginTop: 'auto', flexWrap: 'wrap' as const },
  poolCount: { fontSize: '0.85rem', color: '#64748b' },
  poolCountNum: { fontWeight: 700, color: '#94a3b8' },
  poolCountLabel: { color: '#64748b' },
  poolBtn: { padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', transition: 'opacity 0.2s' },
  poolBtnJoin: { background: 'linear-gradient(135deg, #9333ea, #7c3aed)', color: '#fff' },
  poolBtnLeave: { background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' },
  ctaSection: { background: 'linear-gradient(135deg, rgba(147,51,234,0.15) 0%, rgba(236,72,153,0.08) 100%)', border: '1px solid rgba(147,51,234,0.2)', margin: '0 2rem 4rem', borderRadius: '24px', padding: '4rem 2rem', textAlign: 'center' as const },
  ctaTitle: { fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' },
  ctaSub: { color: '#64748b', fontSize: '0.92rem', marginBottom: '2rem' },
  ctaBtn: { display: 'inline-block', background: 'linear-gradient(135deg, #9333ea, #ec4899)', color: 'white', padding: '0.9rem 1.75rem', borderRadius: '40px', fontWeight: 700, textDecoration: 'none', fontSize: '1rem' },
  ctaBtnSecondary: { display: 'inline-block', border: '2px solid rgba(147,51,234,0.5)', color: '#c4b5fd', padding: '0.85rem 1.75rem', borderRadius: '40px', fontWeight: 700, textDecoration: 'none', fontSize: '1rem' },
}
