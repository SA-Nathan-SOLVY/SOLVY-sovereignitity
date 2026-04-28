import { useState, useEffect } from 'react'

interface ReviewData {
  totalCommitments: number
  totalPledgedVolume: number
  avgPledge: number
  annualLow: number
  annualHigh: number
  interchangeRate: string
  kycVerified: number
  activeMembers: number
  pilotMerchantsLive: number
}

interface UwDocument {
  id: number
  title: string
  description: string
  url: string
  category: string
  visible_to_partners: boolean
  created_at: string
}

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

interface ChecklistItem {
  id: number
  category: string
  label: string
  done: boolean
  sort_order: number
}

export default function UnderwritingReview() {
  const [status, setStatus] = useState<'checking' | 'authorized' | 'denied'>('checking')
  const [data, setData] = useState<ReviewData | null>(null)
  const [loadingData, setLoadingData] = useState(false)
  const [docs, setDocs] = useState<UwDocument[]>([])
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])
  const [reviewToken, setReviewToken] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token') || ''
    if (!token) { setStatus('denied'); return }
    setReviewToken(token)

    fetch('/api/uwreview/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.authorized) {
          setStatus('authorized')
          setLoadingData(true)
          return Promise.all([
            fetch('/api/uwreview/summary', { headers: { 'x-review-token': token } }).then((r) => r.json()),
            fetch('/api/uw/documents', { headers: { 'x-review-token': token } }).then((r) => r.json()),
            fetch('/api/uwreview/checklist', { headers: { 'x-review-token': token } }).then((r) => r.json()),
          ])
            .then(([summary, docsData, clData]) => {
              setData(summary)
              setDocs(docsData.documents ?? [])
              setChecklist(clData.items ?? [])
            })
            .finally(() => setLoadingData(false))
        } else {
          setStatus('denied')
        }
      })
      .catch(() => setStatus('denied'))
  }, [])

  const totalDone = checklist.filter((i) => i.done).length
  const totalItems = checklist.length
  const pct = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0

  if (status === 'checking') {
    return (
      <div style={s.page}>
        <div style={s.center}>
          <div style={s.spinner} />
          <p style={{ color: '#64748b', marginTop: '16px' }}>Verifying access…</p>
        </div>
      </div>
    )
  }

  if (status === 'denied') {
    return (
      <div style={s.page}>
        <div style={s.center}>
          <div style={s.deniedBox}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔒</div>
            <h2 style={{ color: '#0f1e2c', margin: '0 0 12px', fontSize: '1.4rem' }}>Access Restricted</h2>
            <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
              This document requires an authorized access link.<br />
              Contact <a href="mailto:team@solvy.cards" style={{ color: '#7c3aed' }}>team@solvy.cards</a> to request access.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={s.page}>
      <div style={s.container}>

        {/* Header */}
        <div style={s.header}>
          <div style={s.logoWrap}>
            <img src="/fulllogo.png" alt="SOLVY" style={s.fullLogo} />
          </div>
          <div style={s.headerRow}>
            <div>
              <div style={s.confidentialBadge}>CONFIDENTIAL — AUTHORIZED PARTNER ACCESS</div>
              <h1 style={s.headerTitle}>SOLVY Card™ — Due Diligence Package</h1>
              <p style={s.headerSub}>
                Cooperative Card Program · {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <button onClick={() => window.print()} style={s.printBtn}>🖨️ Print</button>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={s.progressCard}>
          <div style={s.progressHeader}>
            <span style={s.progressLabel}>Application Readiness</span>
            <span style={s.progressPct}>{pct}% complete — {totalDone} of {totalItems} items</span>
          </div>
          <div style={s.progressTrack}>
            <div style={{ ...s.progressFill, width: `${pct}%` }} />
          </div>
        </div>

        {/* Metrics */}
        {loadingData ? (
          <div style={s.loadingMetrics}>Loading live data…</div>
        ) : data ? (
          <div style={s.metricsGrid}>
            {[
              { label: 'Prelaunch Commitments', value: data.totalCommitments.toString(), sub: 'founding members committed', color: '#ffb347' },
              { label: 'Total Pledged Volume', value: fmt(data.totalPledgedVolume), sub: 'monthly across all members', color: '#9333ea' },
              { label: 'Projected Interchange', value: `${fmt(data.annualLow)} – ${fmt(data.annualHigh)}`, sub: `at ${data.interchangeRate} annual`, color: '#22c55e' },
              { label: 'Avg Member Pledge', value: fmt(data.avgPledge), sub: 'per founding member/month', color: '#14b8a6' },
              { label: 'KYC Verified', value: data.kycVerified.toString(), sub: 'members identity-confirmed', color: '#6366f1' },
              { label: 'Pilot Merchants Live', value: data.pilotMerchantsLive.toString(), sub: 'active & processing payments', color: '#f43f5e' },
            ].map((m) => (
              <div key={m.label} style={{ ...s.metricCard, borderTop: `4px solid ${m.color}` }}>
                <div style={s.metricLabel}>{m.label}</div>
                <div style={s.metricValue}>{m.value}</div>
                <div style={s.metricSub}>{m.sub}</div>
              </div>
            ))}
          </div>
        ) : null}

        {/* Program Identity */}
        <div style={s.identityBanner}>
          <div style={s.identityLeft}>
            <div style={s.identityTag}>CARD PROGRAM APPLICANT</div>
            <div style={s.identityName}>SOLVY Card™</div>
            <div style={s.identitySub}>America's First Cooperative P2P Payment Platform</div>
          </div>
          <div style={s.identityRight}>
            {[
              { label: 'Program Type', value: 'Cooperative BaaS Card Issuance' },
              { label: 'Card Network', value: 'Visa + Mastercard Debit' },
              { label: 'Revenue Model', value: '70/20/10 Cooperative Split' },
              { label: 'Target Launch', value: 'Juneteenth 2025 — June 19' },
            ].map((m) => (
              <div key={m.label} style={s.identityMeta}>
                <span style={s.metaLabel}>{m.label}</span>
                <span style={s.metaValue}>{m.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 70/20/10 */}
        <section style={s.section}>
          <h2 style={s.sectionTitle}>Cooperative Revenue Distribution</h2>
          <div style={s.coopGrid}>
            {[
              { pct: '70%', label: 'Member Pool', desc: 'Patronage dividends returned to members proportional to card usage. Your spending builds your equity.', color: '#7c3aed', bg: 'linear-gradient(135deg,#1e3a5f,#0f1e2c)' },
              { pct: '20%', label: 'Operations', desc: 'Platform infrastructure, compliance, technology, and cooperative administration.', color: '#14b8a6', bg: 'linear-gradient(135deg,#064e3b,#022c22)' },
              { pct: '10%', label: 'Sovereign Fund', desc: 'Long-term reserve, community reinvestment, and SOVEREIGNITITY™ protocol sustainability.', color: '#f59e0b', bg: 'linear-gradient(135deg,#4c1d95,#2d1b6e)' },
            ].map((c) => (
              <div key={c.pct} style={{ ...s.coopCard, background: c.bg }}>
                <div style={{ ...s.coopPct, color: c.color }}>{c.pct}</div>
                <div style={s.coopLabel}>{c.label}</div>
                <div style={s.coopDesc}>{c.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Checklist */}
        <section style={s.section}>
          <h2 style={s.sectionTitle}>Application Readiness — Path to Card Issuance</h2>

          {checklist.length > 0 && (
            <div style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.06), rgba(34,197,94,0.04))', border: '1px solid rgba(124,58,237,0.15)', borderRadius: '16px', padding: '20px 24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontWeight: 700, color: '#0f1e2c', fontSize: '0.95rem' }}>Overall Readiness</span>
                <span style={{ color: pct >= 80 ? '#22c55e' : '#7c3aed', fontWeight: 800, fontSize: '1rem' }}>{pct}%</span>
              </div>
              <div style={{ height: '12px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden', marginBottom: '10px' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #7c3aed, #22c55e)', borderRadius: '99px', transition: 'width 0.6s ease' }} />
              </div>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '0.8rem' }}>
                <span style={{ color: '#22c55e', fontWeight: 700 }}>✓ {totalDone} completed</span>
                <span style={{ color: '#94a3b8' }}>☐ {totalItems - totalDone} remaining</span>
              </div>
            </div>
          )}

          {checklist.length > 0 ? (() => {
            const grouped: Record<string, ChecklistItem[]> = {}
            checklist.forEach((item) => {
              if (!grouped[item.category]) grouped[item.category] = []
              grouped[item.category].push(item)
            })
            return (
              <div style={s.checklistGrid}>
                {Object.entries(grouped).map(([cat, items]) => {
                  const groupDone = items.filter((i) => i.done).length
                  const allDone = groupDone === items.length
                  return (
                    <div key={cat} style={{ ...s.checkGroup, borderTop: `3px solid ${allDone ? '#22c55e' : groupDone > 0 ? '#f59e0b' : '#e2e8f0'}` }}>
                      <div style={s.checkGroupHeader}>
                        <span style={s.checkGroupTitle}>{cat}</span>
                        <span style={{ ...s.checkGroupCount, background: allDone ? 'rgba(34,197,94,0.1)' : 'rgba(124,58,237,0.08)', color: allDone ? '#166534' : '#7c3aed' }}>{groupDone}/{items.length}</span>
                      </div>
                      <ul style={s.checkList}>
                        {items.map((item) => (
                          <li key={item.id} style={s.checkItem}>
                            <span style={{ ...s.checkMark, color: item.done ? '#22c55e' : '#cbd5e1' }}>
                              {item.done ? '✓' : '☐'}
                            </span>
                            <span style={{ ...s.checkText, color: item.done ? '#1e293b' : '#94a3b8' }}>
                              {item.label}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            )
          })() : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '0.9rem' }}>Loading checklist…</div>
          )}
        </section>

        {/* Compliance Overview */}
        <section style={s.section}>
          <h2 style={s.sectionTitle}>Compliance Readiness</h2>
          <div style={s.complianceGrid}>
            {[
              { icon: '🪪', title: 'KYC Policy', items: ['Government-issued ID required', 'SSN verification', 'Proof of US residency', 'Date of birth validation'] },
              { icon: '🛡️', title: 'AML / BSA Policy', items: ['Source of funds declaration', 'OFAC screening', 'Transaction monitoring consent', 'Beneficial ownership disclosure'] },
              { icon: '🔒', title: 'Data Sovereignty', items: ['No third-party data sales', 'End-to-end encryption', 'Member-controlled data access', 'DECIDEY education program'] },
              { icon: '📊', title: 'Transparency (MAN)', items: ['Mandatory Audit Network live', 'Member-visible financials', 'Cooperative ownership records', 'Profit distribution tracking'] },
            ].map((c) => (
              <div key={c.title} style={s.compCard}>
                <div style={s.compIcon}>{c.icon}</div>
                <h3 style={s.compTitle}>{c.title}</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {c.items.map((item) => (
                    <li key={item} style={s.compItem}>✓ {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Pilot Proof */}
        <section style={s.section}>
          <h2 style={s.sectionTitle}>Proof of Concept — Live Pilot</h2>
          <div style={s.proofBox}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🔮</div>
            <div style={s.proofTitle}>Pilot Merchant #1 — Active & Processing</div>
            <div style={s.proofBody}>
              A licensed Texas cosmetology business is live as SOLVY Pilot Partner #1, accepting payments today
              via our integrated merchant processing stack. This demonstrates merchant-side readiness and closes
              the cooperative loop: members spend → merchant gets paid → SOLVY earns interchange → profits
              flow back to members via the 70/20/10 model.
            </div>
          </div>
        </section>

        {/* Unit.co Account Structure */}
        <section style={s.section}>
          <h2 style={s.sectionTitle}>🏦 Card Issuance Infrastructure — Account Structure</h2>
          <div style={{ background: '#fff8e7', border: '1px solid #ffb347', borderRadius: '14px', padding: '18px 22px', marginBottom: '22px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <span style={{ fontSize: '1.6rem', flexShrink: 0 }}>🔗</span>
            <div>
              <div style={{ fontWeight: 700, color: '#92400e', marginBottom: '6px' }}>Live Embedded Banking Infrastructure — SA Nathan LLC</div>
              <div style={{ fontSize: '0.85rem', color: '#78350f', lineHeight: 1.6 }}>
                SOLVY operates live embedded banking accounts through our BaaS infrastructure partner.
                The organization is registered under <strong>SA Nathan LLC</strong> with one enabled pilot account active today.
                This is an operational relationship — not a prospective one.
              </div>
            </div>
          </div>
          <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9' }}>
                  {['Level', 'Entity', 'ID', 'Status', 'Country'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 700, color: '#374151', borderBottom: '2px solid #e2e8f0', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr style={{ background: 'rgba(124,58,237,0.04)' }}>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #f0f4f8' }}>
                    <span style={{ background: '#ede9fe', color: '#5b21b6', padding: '2px 8px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700 }}>Organization</span>
                  </td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #f0f4f8', fontWeight: 700, color: '#0f1e2c' }}>SA Nathan LLC</td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #f0f4f8' }}><code style={{ background: '#f1f5f9', color: '#374151', padding: '2px 6px', borderRadius: '4px', fontSize: '0.72rem' }}>org_6RqPO7KiSQ7pMRB8fle7Pay</code></td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #f0f4f8' }}><span style={{ background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700 }}>Active</span></td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #f0f4f8', color: '#475569' }}>United States</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 14px 10px 28px', borderBottom: '1px solid #f0f4f8' }}>
                    <span style={{ background: '#fff8e7', color: '#92400e', padding: '2px 8px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700 }}>↳ Account</span>
                  </td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #f0f4f8', fontWeight: 600, color: '#0f1e2c' }}>Evergreen Beauty Lounge</td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #f0f4f8' }}><code style={{ background: '#f1f5f9', color: '#374151', padding: '2px 6px', borderRadius: '4px', fontSize: '0.72rem' }}>acct_1QgtpwC60GJFsMJK</code></td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #f0f4f8' }}><span style={{ background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700 }}>Enabled</span></td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #f0f4f8', color: '#475569' }}>United States</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            {[
              { icon: '🏢', label: 'Organization', value: 'SA Nathan LLC', sub: 'Cooperative operator entity' },
              { icon: '💳', label: 'Pilot Account', value: 'Evergreen Beauty Lounge', sub: 'Status: Enabled — live' },
              { icon: '📍', label: 'Jurisdiction', value: 'United States', sub: 'FDIC-eligible infrastructure' },
              { icon: '🔮', label: 'Next Accounts', value: 'SOLVY Members', sub: 'Individual member debit accounts' },
            ].map((c) => (
              <div key={c.label} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '1.3rem', marginBottom: '6px' }}>{c.icon}</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{c.label}</div>
                <div style={{ fontWeight: 700, color: '#0f1e2c', fontSize: '0.88rem', marginBottom: '2px' }}>{c.value}</div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{c.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* SOLVY Intelligence Layer */}
        <section style={s.section}>
          <h2 style={s.sectionTitle}>🧠 Beyond Infrastructure: The SOLVY Intelligence Layer</h2>
          <div style={{ background: 'linear-gradient(135deg, #0f1e2c 0%, #1e3a5f 100%)', borderRadius: '16px', padding: '28px 32px', color: 'white', marginBottom: '24px' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffb347', marginBottom: '12px' }}>
              "The infrastructure provides the engine. We provide the intelligence."
            </div>
            <div style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.75 }}>
              Our card issuance infrastructure partnership gives us a complete embedded banking platform —
              business accounts, individual accounts, virtual and physical debit cards, payment processing, and regulatory compliance.
              This is the foundation.
              <br /><br />
              <strong style={{ color: 'white' }}>On top of this foundation, we are building an AI-driven financial operations layer powered by DeepSeek.</strong>
              <br /><br />
              DeepSeek acts as our <strong style={{ color: '#ffb347' }}>"Sovereign Accountant"</strong> — an autonomous agent that continuously prepares,
              categorizes, and reconciles financial data across every account in the SOLVY Ecosystem.
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {[
              { icon: '🔄', title: 'Continuous Reconciliation', body: 'Processes every transaction automatically, categorizing expenses, matching invoices, and flagging anomalies — transforming raw payment data into decision-ready financial intelligence.' },
              { icon: '📋', title: 'Handoff-Ready Books', body: 'Prepares complete, audit-ready accounting packages delivered directly to our external accountants (Block Advisors). Monthly close time: days → minutes.' },
              { icon: '🏛️', title: 'Multi-Entity Consolidation', body: 'Consolidates financial data across all entities — SA Nathan LLC, Evergreen Beauty Lounge, SOLVY, and future DECIDEY NGO — providing a unified financial dashboard.' },
              { icon: '📊', title: 'Tax & Compliance Prep', body: 'Automatically applies tax categories and flags potential compliance issues before they reach the accountant. Built-in compliance, not bolt-on.' },
            ].map((c) => (
              <div key={c.title} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>{c.icon}</div>
                <div style={{ fontWeight: 700, color: '#0f1e2c', fontSize: '0.88rem', marginBottom: '8px' }}>{c.title}</div>
                <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.6 }}>{c.body}</div>
              </div>
            ))}
          </div>
          <div style={{ background: '#f1f5f9', borderRadius: '14px', padding: '20px 24px', fontFamily: 'monospace', fontSize: '0.73rem', color: '#334155', whiteSpace: 'pre', overflowX: 'auto', lineHeight: 1.6 }}>
{`┌──────────────────────────────────────────────────────────────┐
│                   SOLVY ECOSYSTEM                             │
│  ┌────────────────────────────────────────────────────────┐   │
│  │         DeepSeek "Sovereign Accountant"                 │   │
│  │  • Automates reconciliation                             │   │
│  │  • Categorizes transactions                             │   │
│  │  • Prepares handoff packages for accountants            │   │
│  └────────────────────────────────────────────────────────┘   │
│                           │ (Raw transaction data)             │
│                           ▼                                    │
│  ┌────────────────────────────────────────────────────────┐   │
│  │            Card Issuance Infrastructure                 │   │
│  │  • Business & individual accounts                       │   │
│  │  • Virtual & physical debit cards                       │   │
│  │  • Payment processing & compliance                      │   │
│  └────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘`}
          </div>
        </section>

        {/* Supporting Financial Data */}
        <section style={s.section}>
          <h2 style={s.sectionTitle}>📊 Supporting Financial Data</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px' }}>
              <div style={{ fontWeight: 700, color: '#0f1e2c', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>🏦</span> Metro City Bank — 2025 Operating History
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9' }}>
                      <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 700, color: '#374151', borderBottom: '2px solid #e2e8f0' }}>Month</th>
                      <th style={{ textAlign: 'right', padding: '6px 8px', fontWeight: 700, color: '#374151', borderBottom: '2px solid #e2e8f0' }}>Deposits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Jan 2025', '$2,893.00'], ['Feb 2025', '$2,710.00'], ['Mar 2025', '$3,904.00'],
                      ['Apr 2025', '$12,473.00'], ['May 2025', '$4,927.81'], ['Jun 2025', '$4,394.00'],
                      ['Jul 2025', '$17,571.80'], ['Aug 2025', '$3,811.00'], ['Sep 2025', '$5,465.38'],
                      ['Oct 2025', '$4,177.24'], ['Nov 2025', '$3,921.10'], ['Dec 2025', '$8,101.35'],
                    ].map(([month, amt]) => (
                      <tr key={month}>
                        <td style={{ padding: '5px 8px', borderBottom: '1px solid #f0f4f8', color: '#475569' }}>{month}</td>
                        <td style={{ padding: '5px 8px', borderBottom: '1px solid #f0f4f8', textAlign: 'right', fontWeight: 600, color: '#0f1e2c' }}>{amt}</td>
                      </tr>
                    ))}
                    <tr style={{ background: '#f1f5f9' }}>
                      <td style={{ padding: '7px 8px', fontWeight: 700, color: '#0f1e2c' }}>Total 2025</td>
                      <td style={{ padding: '7px 8px', textAlign: 'right', fontWeight: 800, color: '#22c55e' }}>$74,349.68</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: '12px', fontSize: '0.75rem', color: '#22c55e', fontWeight: 600 }}>
                ✅ Zero overdrafts &nbsp;·&nbsp; ✅ Zero fees &nbsp;·&nbsp; ✅ Positive balance every month
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px' }}>
              <div style={{ fontWeight: 700, color: '#0f1e2c', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>🖥️</span> SOLVY Infrastructure Expenses
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 700, color: '#374151', borderBottom: '2px solid #e2e8f0' }}>Vendor</th>
                    <th style={{ textAlign: 'right', padding: '6px 8px', fontWeight: 700, color: '#374151', borderBottom: '2px solid #e2e8f0' }}>Monthly</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Hetzner VPS', '$30.63'], ['Vercel Hosting', '$21.32'],
                    ['Manus AI (thru Sep)', '$39.00'], ['Kimi Code', '$31.00'], ['Cloudflare', '$0–20'],
                  ].map(([v, c]) => (
                    <tr key={v}>
                      <td style={{ padding: '5px 8px', borderBottom: '1px solid #f0f4f8', color: '#475569' }}>{v}</td>
                      <td style={{ padding: '5px 8px', borderBottom: '1px solid #f0f4f8', textAlign: 'right', fontWeight: 600, color: '#0f1e2c' }}>{c}</td>
                    </tr>
                  ))}
                  <tr style={{ background: '#f1f5f9' }}>
                    <td style={{ padding: '7px 8px', fontWeight: 700, color: '#0f1e2c' }}>Estimated Total</td>
                    <td style={{ padding: '7px 8px', textAlign: 'right', fontWeight: 800, color: '#7c3aed' }}>~$121–141/mo</td>
                  </tr>
                </tbody>
              </table>
              <div style={{ marginTop: '12px', fontSize: '0.75rem', color: '#22c55e', fontWeight: 600 }}>
                ✅ All business expenses &nbsp;·&nbsp; ✅ Paid from dedicated business account
              </div>
              <div style={{ marginTop: '20px', fontWeight: 700, color: '#0f1e2c', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>📦</span> Product Sourcing — Female Reign
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 700, color: '#374151', borderBottom: '2px solid #e2e8f0' }}>Month</th>
                    <th style={{ textAlign: 'right', padding: '6px 8px', fontWeight: 700, color: '#374151', borderBottom: '2px solid #e2e8f0' }}>Purchases</th>
                  </tr>
                </thead>
                <tbody>
                  {[['March 2026', '$100.00'], ['April 2026', '$346.44']].map(([m, a]) => (
                    <tr key={m}>
                      <td style={{ padding: '5px 8px', borderBottom: '1px solid #f0f4f8', color: '#475569' }}>{m}</td>
                      <td style={{ padding: '5px 8px', borderBottom: '1px solid #f0f4f8', textAlign: 'right', fontWeight: 600, color: '#0f1e2c' }}>{a}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#22c55e', fontWeight: 600 }}>✅ Consistent restocking &nbsp;·&nbsp; ✅ No interest charges</div>
              <div style={{ marginTop: '4px', fontSize: '0.72rem', color: '#94a3b8' }}>*February 2026 statement not provided (acceptable gap)</div>
            </div>
          </div>

          {/* Brand Assets & IP */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px' }}>
            <div style={{ fontWeight: 700, color: '#0f1e2c', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>🏷️</span> Brand Assets & Intellectual Property
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    {['Asset', 'Vendor', 'Cost (USD)', 'Type', 'Status'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '6px 10px', fontWeight: 700, color: '#374151', borderBottom: '2px solid #e2e8f0' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['ebl.beauty', 'Domain Registrar', '~$15–20', 'Web2 Domain', 'Active (annual renewal)'],
                    ['solvy.cards', 'Replit', '$32.00', 'Web2 Domain', '✅ Paid / Active'],
                    ['solvy.chain', 'Freename.io', '$5–$4,099+', 'Web3 TLD', 'Blockchain domain; no renewal fees'],
                    ['SOLVY™ Brand', 'SOLVY Ecosystem', 'N/A', 'Trademark / IP', 'Brand identity, logo, ecosystem name'],
                    ['SOVEREIGNITITY™', 'SOLVY Ecosystem', 'N/A', 'Trademark / IP', 'Protocol brand — sovereignty-as-infrastructure'],
                    ['DECIDEY™', 'SOLVY NGO', 'N/A', 'NGO / Education Brand', 'Financial literacy program entity'],
                    ['MAN™', 'SOLVY Ecosystem', 'N/A', 'Audit Protocol Brand', 'Mandatory Audit Network — transparency layer'],
                  ].map(([asset, vendor, cost, type, status]) => (
                    <tr key={asset}>
                      <td style={{ padding: '6px 10px', borderBottom: '1px solid #f0f4f8', fontWeight: 600 }}><code style={{ background: '#ede9fe', color: '#5b21b6', padding: '2px 6px', borderRadius: '4px', fontSize: '0.72rem' }}>{asset}</code></td>
                      <td style={{ padding: '6px 10px', borderBottom: '1px solid #f0f4f8', color: '#475569' }}>{vendor}</td>
                      <td style={{ padding: '6px 10px', borderBottom: '1px solid #f0f4f8', color: '#475569' }}>{cost}</td>
                      <td style={{ padding: '6px 10px', borderBottom: '1px solid #f0f4f8', color: '#475569' }}>{type}</td>
                      <td style={{ padding: '6px 10px', borderBottom: '1px solid #f0f4f8', color: '#475569' }}>{status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Documents */}
        <section style={s.section}>
          <h2 style={s.sectionTitle}>Required Documents</h2>
          {docs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '0.9rem' }}>
              Documents are being assembled. Check back soon or contact{' '}
              <a href="mailto:team@solvy.cards" style={{ color: '#7c3aed' }}>team@solvy.cards</a>.
            </div>
          ) : (
            (() => {
              const grouped: Record<string, UwDocument[]> = {}
              docs.forEach((d) => {
                if (!grouped[d.category]) grouped[d.category] = []
                grouped[d.category].push(d)
              })
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                  {Object.entries(grouped).map(([category, catDocs]) => (
                    <div key={category}>
                      <div style={{ fontWeight: 700, color: '#475569', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #f0f4f8' }}>
                        {category}
                      </div>
                      <div style={s.docsGrid}>
                        {catDocs.map((doc) => {
                          const docUrl = doc.url.startsWith('/api/uw/files/')
                            ? `${doc.url}?token=${encodeURIComponent(reviewToken)}`
                            : doc.url
                          return (
                          <a key={doc.id} href={docUrl} target="_blank" rel="noopener noreferrer" style={s.docCard}>
                            <div style={s.docIcon}>📄</div>
                            <div style={s.docTitle}>{doc.title}</div>
                            {doc.description && <div style={s.docSub}>{doc.description}</div>}
                            <div style={s.docLink}>Open Document →</div>
                          </a>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )
            })()
          )}
        </section>

        <footer style={s.footer}>
          SOLVY Ecosystem™ — Cooperative · Data Sovereign · Member Owned ·{' '}
          {new Date().getFullYear()} · Confidential — Authorized Partner Access Only
        </footer>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { background: '#f8fafc', minHeight: '100vh', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' },
  spinner: { width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTop: '4px solid #7c3aed', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  deniedBox: { background: 'white', borderRadius: '20px', padding: '48px 40px', maxWidth: '400px', textAlign: 'center', boxShadow: '0 8px 40px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' },
  container: { maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' },
  header: { marginBottom: '32px' },
  logoWrap: { textAlign: 'center' as const, marginBottom: '24px' },
  fullLogo: { height: '120px', width: 'auto', display: 'block', margin: '0 auto', filter: 'drop-shadow(0 0 20px rgba(147,51,234,0.4))' },
  headerRow: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: '16px' },
  confidentialBadge: { display: 'inline-block', background: '#7c3aed', color: 'white', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.12em', padding: '4px 12px', borderRadius: '4px', marginBottom: '10px' },
  headerTitle: { fontSize: '1.8rem', fontWeight: 900, color: '#0f1e2c', margin: '0 0 4px' },
  headerSub: { color: '#64748b', fontSize: '0.88rem', margin: 0 },
  printBtn: { background: 'transparent', border: '1px solid #cbd5e1', color: '#475569', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', flexShrink: 0 },
  progressCard: { background: 'white', borderRadius: '16px', padding: '24px 28px', marginBottom: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' },
  progressHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' },
  progressLabel: { fontWeight: 700, color: '#0f1e2c', fontSize: '0.95rem' },
  progressPct: { color: '#7c3aed', fontWeight: 700, fontSize: '0.88rem' },
  progressTrack: { height: '10px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' },
  progressFill: { height: '100%', background: 'linear-gradient(90deg, #7c3aed, #22c55e)', borderRadius: '99px', transition: 'width 0.6s ease' },
  loadingMetrics: { textAlign: 'center', padding: '24px', color: '#94a3b8' },
  metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' },
  metricCard: { background: 'white', borderRadius: '16px', padding: '22px', border: '1px solid #e2e8f0', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' },
  metricLabel: { fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' },
  metricValue: { fontSize: '1.4rem', fontWeight: 800, color: '#0f1e2c', marginBottom: '4px' },
  metricSub: { fontSize: '0.75rem', color: '#94a3b8' },
  identityBanner: { background: 'linear-gradient(135deg,#0f1e2c 0%,#1e3a5f 100%)', borderRadius: '20px', padding: '28px 32px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' },
  identityLeft: { flex: 1, minWidth: '220px' },
  identityTag: { fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.14em', color: '#ffb347', textTransform: 'uppercase', marginBottom: '8px' },
  identityName: { fontSize: '2rem', fontWeight: 900, color: 'white', marginBottom: '6px' },
  identitySub: { fontSize: '0.82rem', color: '#94a3b8' },
  identityRight: { display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '260px' },
  identityMeta: { display: 'flex', justifyContent: 'space-between', gap: '16px', padding: '8px 14px', background: 'rgba(255,255,255,0.07)', borderRadius: '8px' },
  metaLabel: { fontSize: '0.72rem', color: '#64748b', fontWeight: 600 },
  metaValue: { fontSize: '0.75rem', color: '#e2e8f0', fontWeight: 700, textAlign: 'right' },
  section: { background: 'white', borderRadius: '20px', padding: '32px', marginBottom: '24px', boxShadow: '0 1px 8px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' },
  sectionTitle: { fontSize: '1.1rem', fontWeight: 700, color: '#0f1e2c', marginTop: 0, marginBottom: '24px', paddingBottom: '12px', borderBottom: '1px solid #f0f4f8' },
  coopGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' },
  coopCard: { borderRadius: '18px', padding: '28px 24px', color: 'white', textAlign: 'center' },
  coopPct: { fontSize: '2.5rem', fontWeight: 900, marginBottom: '8px' },
  coopLabel: { fontSize: '1rem', fontWeight: 700, marginBottom: '10px', opacity: 0.9 },
  coopDesc: { fontSize: '0.78rem', opacity: 0.7, lineHeight: 1.5 },
  checklistGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' },
  checkGroup: { background: '#f8fafc', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0' },
  checkGroupHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' },
  checkGroupTitle: { fontWeight: 700, color: '#0f1e2c', fontSize: '0.88rem' },
  checkGroupCount: { fontSize: '0.75rem', fontWeight: 700, color: '#7c3aed', background: 'rgba(124,58,237,0.08)', padding: '2px 8px', borderRadius: '20px' },
  checkList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' },
  checkItem: { display: 'flex', gap: '10px', alignItems: 'flex-start' },
  checkMark: { fontWeight: 700, fontSize: '0.95rem', flexShrink: 0, marginTop: '1px' },
  checkText: { fontSize: '0.78rem', lineHeight: 1.5 },
  complianceGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' },
  compCard: { background: '#f8fafc', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' },
  compIcon: { fontSize: '1.8rem', marginBottom: '10px' },
  compTitle: { fontWeight: 700, color: '#0f1e2c', marginBottom: '12px', fontSize: '0.95rem', margin: '0 0 12px' },
  compItem: { fontSize: '0.78rem', color: '#475569', padding: '4px 0', borderBottom: '1px solid #f0f4f8' },
  proofBox: { background: 'linear-gradient(135deg, rgba(124,58,237,0.06), rgba(34,197,94,0.04))', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '16px', padding: '32px', textAlign: 'center' },
  proofTitle: { fontWeight: 800, color: '#0f1e2c', fontSize: '1.05rem', marginBottom: '12px' },
  proofBody: { color: '#475569', fontSize: '0.9rem', lineHeight: 1.75, maxWidth: '700px', margin: '0 auto' },
  docsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' },
  docCard: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '6px', transition: 'border-color 0.2s' },
  docIcon: { fontSize: '1.6rem' },
  docTitle: { fontWeight: 700, color: '#0f1e2c', fontSize: '0.9rem' },
  docSub: { color: '#64748b', fontSize: '0.78rem', lineHeight: 1.5 },
  docLink: { color: '#7c3aed', fontWeight: 700, fontSize: '0.82rem', marginTop: '8px' },
  footer: { textAlign: 'center', marginTop: '40px', color: '#94a3b8', fontSize: '0.72rem', lineHeight: 2 },
}
