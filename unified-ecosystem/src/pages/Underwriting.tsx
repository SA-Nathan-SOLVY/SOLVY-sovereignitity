import { useState, useEffect } from 'react'
import UnifiedNav from '../components/UnifiedNav'

interface Summary {
  prelaunch: {
    totalCommitments: number
    totalPledgedVolume: number
    avgPledgeAmount: number
  }
  members: {
    total: number
    active: number
    kycVerified: number
  }
  interchange: {
    annualLow: number
    annualHigh: number
    rate: string
  }
  cooperative: {
    memberShare: string
    operationsShare: string
    sovereignFund: string
  }
  pilotPartners: { name: string; status: string; processor: string; number: number }[]
}

interface Commitment {
  id: number
  name: string
  email: string
  monthly_pledge: string
  committed_at: string
  status: string
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

interface ChecklistItem {
  id: number
  category: string
  label: string
  done: boolean
  sort_order: number
}

const DOC_CATEGORIES = [
  '🏛️ Business Entity',
  '👤 Control Person / Beneficial Owners',
  '📊 Card Program Description',
  '🛡️ Compliance Docs',
  '💰 Financial Projections',
  '🤝 Integration Readiness',
  'General',
]

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

export default function Underwriting() {
  const [verified, setVerified] = useState(() => sessionStorage.getItem('uw_staff') === 'true')
  const [staffToken, setStaffToken] = useState(() => sessionStorage.getItem('uw_token') || '')
  const [codeInput, setCodeInput] = useState('')
  const [codeError, setCodeError] = useState('')
  const [verifying, setVerifying] = useState(false)

  const [summary, setSummary] = useState<Summary | null>(null)
  const [commitments, setCommitments] = useState<Commitment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [docs, setDocs] = useState<UwDocument[]>([])
  const [showDocForm, setShowDocForm] = useState(false)
  const [docForm, setDocForm] = useState({ title: '', description: '', url: '', category: 'General', visible_to_partners: true })
  const [docSaving, setDocSaving] = useState(false)
  const [docError, setDocError] = useState('')
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('url')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [previewObjectUrl, setPreviewObjectUrl] = useState<string | null>(null)

  function setFileWithPreview(file: File | null) {
    setUploadFile(file)
    if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl)
    setPreviewObjectUrl(file ? URL.createObjectURL(file) : null)
  }

  function clearForm() {
    setShowDocForm(false)
    setDocError('')
    if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl)
    setPreviewObjectUrl(null)
    setUploadFile(null)
    setDocForm({ title: '', description: '', url: '', category: 'General', visible_to_partners: true })
  }

  const [checklist, setChecklist] = useState<ChecklistItem[]>([])
  const [checklistTogglingId, setChecklistTogglingId] = useState<number | null>(null)

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setVerifying(true)
    setCodeError('')
    try {
      const r = await fetch('/api/underwriting/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeInput }),
      })
      const data = await r.json()
      if (data.authorized) {
        sessionStorage.setItem('uw_staff', 'true')
        sessionStorage.setItem('uw_token', codeInput)
        setStaffToken(codeInput)
        setVerified(true)
      } else {
        setCodeError('Incorrect access code. This page is for SOLVY staff only.')
      }
    } catch {
      setCodeError('Server error. Please try again.')
    } finally {
      setVerifying(false)
    }
  }

  useEffect(() => {
    if (!verified || !staffToken) return
    setLoading(true)
    Promise.all([
      fetch('/api/underwriting/summary', { headers: { 'x-staff-token': staffToken } }).then((r) => r.json()),
      fetch('/api/prelaunch/commitments', { headers: { 'x-staff-token': staffToken } }).then((r) => r.json()),
      fetch('/api/uw/documents', { headers: { 'x-staff-token': staffToken } }).then((r) => r.json()),
      fetch('/api/uw/checklist', { headers: { 'x-staff-token': staffToken } }).then((r) => r.json()),
    ])
      .then(([s, c, d, cl]) => {
        setSummary(s)
        setCommitments(c.commitments ?? [])
        setDocs(d.documents ?? [])
        setChecklist(cl.items ?? [])
      })
      .catch(() => setError('Failed to load data. Ensure the server is running.'))
      .finally(() => setLoading(false))
  }, [verified, staffToken])

  async function addDoc(e: React.FormEvent) {
    e.preventDefault()
    setDocSaving(true)
    setDocError('')
    try {
      const r = await fetch('/api/uw/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-staff-token': staffToken },
        body: JSON.stringify(docForm),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || 'Failed to save')
      setDocs((prev) => [data.document, ...prev])
      setDocForm({ title: '', description: '', url: '', category: 'General', visible_to_partners: true })
      setShowDocForm(false)
      if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl)
      setPreviewObjectUrl(null)
    } catch (err: any) {
      setDocError(err.message)
    } finally {
      setDocSaving(false)
    }
  }

  async function deleteDoc(id: number) {
    if (!confirm('Delete this document?')) return
    await fetch(`/api/uw/documents/${id}`, { method: 'DELETE', headers: { 'x-staff-token': staffToken } })
    setDocs((prev) => prev.filter((d) => d.id !== id))
  }

  async function uploadAndAddDoc(e: React.FormEvent) {
    e.preventDefault()
    if (!uploadFile || !docForm.title) return
    setUploading(true)
    setDocError('')
    try {
      const fd = new FormData()
      fd.append('file', uploadFile)
      const upRes = await fetch('/api/uw/upload', { method: 'POST', headers: { 'x-staff-token': staffToken }, body: fd })
      const upData = await upRes.json()
      if (!upRes.ok) throw new Error(upData.error || 'Upload failed')
      const r = await fetch('/api/uw/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-staff-token': staffToken },
        body: JSON.stringify({ ...docForm, url: upData.url }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || 'Failed to save')
      setDocs((prev) => [data.document, ...prev])
      setDocForm({ title: '', description: '', url: '', category: 'General', visible_to_partners: true })
      setUploadFile(null)
      if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl)
      setPreviewObjectUrl(null)
      setShowDocForm(false)
    } catch (err: any) {
      setDocError(err.message)
    } finally {
      setUploading(false)
    }
  }

  async function toggleChecklistItem(item: ChecklistItem) {
    setChecklistTogglingId(item.id)
    try {
      const r = await fetch(`/api/uw/checklist/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-staff-token': staffToken },
        body: JSON.stringify({ done: !item.done }),
      })
      const data = await r.json()
      if (r.ok) setChecklist((prev) => prev.map((i) => (i.id === item.id ? data.item : i)))
    } finally {
      setChecklistTogglingId(null)
    }
  }

  async function toggleVisible(doc: UwDocument) {
    const r = await fetch(`/api/uw/documents/${doc.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-staff-token': staffToken },
      body: JSON.stringify({ visible_to_partners: !doc.visible_to_partners }),
    })
    const data = await r.json()
    setDocs((prev) => prev.map((d) => (d.id === doc.id ? data.document : d)))
  }

  if (!verified) {
    return (
      <div style={s.page}>
        <UnifiedNav currentPage="solvy" />
        <div style={s.gateWrap}>
          <div style={s.gateBox}>
            <div style={s.gateLock}>🔒</div>
            <h2 style={s.gateTitle}>Staff Access Only</h2>
            <p style={s.gateSub}>
              This underwriting package is an internal SOLVY document for authorized staff.
              It is not accessible to card applicants or the general public.
            </p>
            <form onSubmit={handleVerify} style={s.gateForm}>
              <input
                type="password"
                placeholder="Enter staff access code"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                style={s.gateInput}
                autoFocus
              />
              {codeError && <div style={s.gateError}>{codeError}</div>}
              <button type="submit" style={s.gateBtn} disabled={verifying || !codeInput}>
                {verifying ? 'Verifying…' : 'Access Package →'}
              </button>
            </form>
            <p style={s.gateFooter}>SOLVY Ecosystem™ · Confidential · Internal Use Only</p>
          </div>
        </div>
      </div>
    )
  }

  function exportCSV() {
    if (!commitments.length) return
    const headers = ['Name', 'Email', 'Monthly Pledge (USD)', 'Date', 'Status']
    const rows = commitments.map((c) => [
      c.name, c.email, parseFloat(c.monthly_pledge).toFixed(2),
      c.committed_at?.slice(0, 10), c.status,
    ])
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `solvy_underwriting_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  if (loading) {
    return (
      <div style={s.page}>
        <UnifiedNav currentPage="solvy" />
        <div style={s.loading}>Loading underwriting data…</div>
      </div>
    )
  }

  if (error || !summary) {
    return (
      <div style={s.page}>
        <UnifiedNav currentPage="solvy" />
        <div style={s.errorBox}>{error || 'No data available.'}</div>
      </div>
    )
  }

  const pipeline = [
    { label: 'Prelaunch Commitments', value: summary.prelaunch.totalCommitments, color: '#ffb347', icon: '🔮' },
    { label: 'Applications Filed', value: summary.members.total, color: '#6366f1', icon: '📝' },
    { label: 'KYC Verified', value: summary.members.kycVerified, color: '#14b8a6', icon: '✅' },
    { label: 'Active Members', value: summary.members.active, color: '#22c55e', icon: '💳' },
  ]

  return (
    <div style={s.page}>
      <UnifiedNav currentPage="solvy" />

      <div style={s.container}>
        <div style={s.logoWrap}>
          <img src="/fulllogo.png" alt="SOLVY" style={s.fullLogo} />
        </div>
        <div style={s.pageHeader}>
          <div>
            <h1 style={s.pageTitle}>SOLVY Card™ — Underwriting Package</h1>
            <p style={s.pageSubtitle}>
              Internal Staff Package · {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div style={s.exportGroup}>
            <button onClick={exportCSV} style={s.exportBtn}>⬇️ Export CSV</button>
            <button onClick={() => window.print()} style={s.printBtn}>🖨️ Print</button>
          </div>
        </div>

        {/* Application Readiness — top progress bar */}
        {checklist.length > 0 && (() => {
          const totalDone = checklist.filter((i) => i.done).length
          const pct = Math.round((totalDone / checklist.length) * 100)
          const barColor = pct === 100 ? '#22c55e' : pct >= 70 ? '#7c3aed' : '#ffb347'
          return (
            <div style={{ background: 'white', borderRadius: '16px', padding: '20px 28px', marginBottom: '28px', border: '1px solid #e2e8f0', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontWeight: 800, color: '#0f1e2c', fontSize: '1rem' }}>📋 Application Readiness</span>
                <span style={{ color: barColor, fontWeight: 800, fontSize: '1rem' }}>{pct}% complete — {totalDone} of {checklist.length} items</span>
              </div>
              <div style={{ height: '14px', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, #7c3aed, ${barColor})`, borderRadius: '99px', transition: 'width 0.5s ease' }} />
              </div>
            </div>
          )
        })()}

        {/* Applicant Identity — top of document */}
        <div style={s.applicantBanner}>
          <div style={s.applicantLeft}>
            <div style={s.applicantTag}>CARD PROGRAM APPLICANT</div>
            <div style={s.applicantName}>SOLVY Card™</div>
            <div style={s.applicantSub}>Issued by: SOLVY Ecosystem™ — America's First Cooperative P2P Payment Platform</div>
          </div>
          <div style={s.applicantRight}>
            <div style={s.applicantMeta}><span style={s.metaLabel}>Program Type</span><span style={s.metaValue}>Cooperative BaaS Card Issuance</span></div>
            <div style={s.applicantMeta}><span style={s.metaLabel}>Card Network</span><span style={s.metaValue}>Visa + Mastercard Debit</span></div>
            <div style={s.applicantMeta}><span style={s.metaLabel}>Revenue Model</span><span style={s.metaValue}>70/20/10 Cooperative Split</span></div>
            <div style={s.applicantMeta}><span style={s.metaLabel}>Target Launch</span><span style={s.metaValue}>Juneteenth 2025 — June 19</span></div>
          </div>
        </div>

        {/* Executive Summary */}
        <section style={s.section}>
          <h2 style={s.sectionTitle}>Executive Summary</h2>
          <div style={s.execGrid}>
            <div style={{ ...s.execCard, borderTop: '4px solid #ffb347' }}>
              <div style={s.execLabel}>Total Pledged Volume</div>
              <div style={s.execValue}>{fmt(summary.prelaunch.totalPledgedVolume)}</div>
              <div style={s.execSub}>from {summary.prelaunch.totalCommitments} committed members</div>
            </div>
            <div style={{ ...s.execCard, borderTop: '4px solid #22c55e' }}>
              <div style={s.execLabel}>Projected Interchange</div>
              <div style={s.execValue}>
                {fmt(summary.interchange.annualLow)} – {fmt(summary.interchange.annualHigh)}
              </div>
              <div style={s.execSub}>at {summary.interchange.rate} on total pledged volume</div>
            </div>
            <div style={{ ...s.execCard, borderTop: '4px solid #14b8a6' }}>
              <div style={s.execLabel}>Avg Member Pledge</div>
              <div style={s.execValue}>{fmt(summary.prelaunch.avgPledgeAmount)}</div>
              <div style={s.execSub}>across all committed members</div>
            </div>
          </div>
        </section>

        {/* Member Pipeline */}
        <section style={s.section}>
          <h2 style={s.sectionTitle}>Member Pipeline</h2>
          <div style={s.pipelineRow}>
            {pipeline.map((p, i) => (
              <div key={i} style={s.pipelineStep}>
                <div style={{ ...s.pipelineBubble, background: p.color }}>
                  <span style={s.pipelineIcon}>{p.icon}</span>
                  <span style={s.pipelineNum}>{p.value}</span>
                </div>
                <div style={s.pipelineLabel}>{p.label}</div>
                {i < pipeline.length - 1 && <div style={s.pipelineArrow}>→</div>}
              </div>
            ))}
          </div>
        </section>

        {/* Cooperative Structure */}
        <section style={s.section}>
          <h2 style={s.sectionTitle}>Cooperative Revenue Distribution</h2>
          <div style={s.coopGrid}>
            <div style={{ ...s.coopCard, background: 'linear-gradient(135deg, #1e3a5f, #0f1e2c)' }}>
              <div style={s.coopPct}>{summary.cooperative.memberShare}</div>
              <div style={s.coopLabel}>Member Pool</div>
              <div style={s.coopDesc}>MOLI benefits, member dividends, cooperative ownership returns</div>
            </div>
            <div style={{ ...s.coopCard, background: 'linear-gradient(135deg, #4c1d95, #2d1b6e)' }}>
              <div style={s.coopPct}>{summary.cooperative.operationsShare}</div>
              <div style={s.coopLabel}>Operations</div>
              <div style={s.coopDesc}>Platform infrastructure, compliance, staff, and growth</div>
            </div>
            <div style={{ ...s.coopCard, background: 'linear-gradient(135deg, #064e3b, #022c22)' }}>
              <div style={s.coopPct}>{summary.cooperative.sovereignFund}</div>
              <div style={s.coopLabel}>Sovereign Fund</div>
              <div style={s.coopDesc}>Long-term reserve, community reinvestment, and economic sovereignty</div>
            </div>
          </div>
        </section>

        {/* Pilot Partners */}
        <section style={s.section}>
          <h2 style={s.sectionTitle}>Active Pilot Partners</h2>
          <div style={s.partnerGrid}>
            {summary.pilotPartners.map((p) => (
              <div key={p.number} style={s.partnerCard}>
                <div style={s.partnerNum}>Pilot #{p.number}</div>
                <div style={s.partnerName}>{p.name}</div>
                <div style={s.partnerRow}>
                  <span style={{ ...s.badge, background: '#dcfce7', color: '#166534' }}>{p.status}</span>
                  <span style={{ ...s.badge, background: '#ede9fe', color: '#4c1d95' }}>{p.processor}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={s.proofNote}>
            <strong>🔮 Proof of concept:</strong> Evergreen Beauty Lounge is live and accepting payments today through
            our integrated merchant processing stack, demonstrating merchant-side readiness. Card issuance completes the closed loop —
            members spend at EBL, EBL gets paid, SOLVY earns interchange, profits flow back to members.
          </div>
        </section>

        {/* Technology Ecosystem */}
        <section style={s.section}>
          <h2 style={s.sectionTitle}>Technology & Funding Ecosystem</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            {[
              { icon: '🏦', role: 'Card Issuance & Banking', detail: 'FDIC-insured deposit accounts, debit card issuance, KYC/AML compliance infrastructure', status: 'Funding in progress', color: '#fff8e7', border: '#ffb347', text: '#92400e' },
              { icon: '⛓️', role: 'Web3 Card Infrastructure', detail: 'Crypto-linked card program enabling SOLVY members to spend digital assets at any Visa/Mastercard terminal', status: 'Partnership incoming', color: '#f0fdf4', border: '#86efac', text: '#166534' },
              { icon: '💱', role: 'Fiat ↔ Digital Asset Bridge', detail: 'On/off-ramp payment gateway across 173 countries; members earn fiat interchange on digital-asset-funded card spend', status: 'Integration confirmed', color: '#eff6ff', border: '#93c5fd', text: '#1e40af' },
              { icon: '💳', role: 'Merchant Processing', detail: 'Live at Evergreen Beauty Lounge (Pilot #1) — proving the merchant-side of the closed-loop ecosystem', status: 'Live & processing', color: '#f0fdf4', border: '#86efac', text: '#166534' },
            ].map((p, i) => (
              <div key={i} style={{ background: p.color, border: `1px solid ${p.border}`, borderRadius: '16px', padding: '20px' }}>
                <div style={{ fontSize: '1.6rem', marginBottom: '8px' }}>{p.icon}</div>
                <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600, marginBottom: '8px' }}>{p.role}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5, marginBottom: '10px' }}>{p.detail}</div>
                <span style={{ background: p.color, border: `1px solid ${p.border}`, color: p.text, padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700 }}>{p.status}</span>
              </div>
            ))}
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
                The organization is registered under <strong>SA Nathan LLC</strong> and currently hosts one enabled pilot account.
                This demonstrates active, operational infrastructure — not a prospective relationship.
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
                    <span style={{ background: '#fff8e7', color: '#92400e', padding: '2px 8px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700 }}>Account</span>
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
              "Unit.co provides the engine. We provide the intelligence."
            </div>
            <div style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.75 }}>
              Our partnership with our card issuance infrastructure gives us a complete embedded banking platform —
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
              { icon: '🔄', title: 'Continuous Reconciliation', body: 'DeepSeek processes every transaction from our banking partner, automatically categorizing expenses, matching invoices, and flagging anomalies — transforming raw payment data into decision-ready financial intelligence.' },
              { icon: '📋', title: 'Handoff-Ready Books', body: 'The system prepares complete, audit-ready accounting packages that can be handed directly to our external accountants (Block Advisors). Monthly close time: days → minutes.' },
              { icon: '🏛️', title: 'Multi-Entity Consolidation', body: 'DeepSeek consolidates financial data across all entities — SA Nathan LLC, Evergreen Beauty Lounge, SOLVY, and future DECIDEY NGO — providing a unified financial dashboard for the entire cooperative.' },
              { icon: '📊', title: 'Tax & Compliance Prep', body: 'By understanding transaction context, DeepSeek automatically applies appropriate tax categories and flags potential compliance issues before they reach the accountant.' },
            ].map((c) => (
              <div key={c.title} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>{c.icon}</div>
                <div style={{ fontWeight: 700, color: '#0f1e2c', fontSize: '0.88rem', marginBottom: '8px' }}>{c.title}</div>
                <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.6 }}>{c.body}</div>
              </div>
            ))}
          </div>
          <div style={{ background: '#f1f5f9', borderRadius: '14px', padding: '20px 24px', fontFamily: 'monospace', fontSize: '0.75rem', color: '#334155', whiteSpace: 'pre', overflowX: 'auto', lineHeight: 1.6 }}>
{`┌──────────────────────────────────────────────────────────────┐
│                   SOLVY ECOSYSTEM (You)                       │
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

            {/* Metro City Bank History */}
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

            {/* Infrastructure Expenses */}
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
                    <td style={{ padding: '7px 8px', textAlign: 'right', fontWeight: 800, color: '#7c3aed' }}>~$121–141</td>
                  </tr>
                </tbody>
              </table>
              <div style={{ marginTop: '12px', fontSize: '0.75rem', color: '#22c55e', fontWeight: 600 }}>
                ✅ All business expenses &nbsp;·&nbsp; ✅ Paid from Metro City account
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
              <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#22c55e', fontWeight: 600 }}>
                ✅ Consistent restocking &nbsp;·&nbsp; ✅ No interest charges
              </div>
              <div style={{ marginTop: '6px', fontSize: '0.72rem', color: '#94a3b8' }}>*February 2026 statement not provided (acceptable gap)</div>
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
                      <td style={{ padding: '6px 10px', borderBottom: '1px solid #f0f4f8', fontWeight: 600, color: '#0f1e2c' }}><code style={{ background: '#ede9fe', color: '#5b21b6', padding: '2px 6px', borderRadius: '4px', fontSize: '0.72rem' }}>{asset}</code></td>
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

        {/* Compliance Readiness */}
        <section style={s.section}>
          <h2 style={s.sectionTitle}>Compliance Readiness</h2>
          <div style={s.complianceGrid}>
            {[
              { icon: '🪪', title: 'KYC Policy', items: ['Government-issued ID required', 'SSN verification', 'Proof of US residency', 'Date of birth validation'] },
              { icon: '🛡️', title: 'AML Policy', items: ['Source of funds declaration', 'OFAC screening', 'Transaction monitoring consent', 'Beneficial ownership disclosure'] },
              { icon: '🔒', title: 'Data Sovereignty', items: ['No third-party data sales', 'End-to-end encryption', 'Member-controlled data access', 'DECIDEY education program'] },
              { icon: '📊', title: 'Transparency', items: ['MAN audit network live', 'Member-visible financials', 'Cooperative ownership records', 'Profit distribution tracking'] },
            ].map((c) => (
              <div key={c.title} style={s.complianceCard}>
                <div style={s.complianceIcon}>{c.icon}</div>
                <h3 style={s.complianceTitle}>{c.title}</h3>
                <ul style={s.complianceList}>
                  {c.items.map((item) => (
                    <li key={item} style={s.complianceItem}>✓ {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Commitment Detail Table */}
        <section style={s.section}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ ...s.sectionTitle, marginBottom: 0 }}>Prelaunch Commitment Detail</h2>
            <button onClick={exportCSV} style={s.exportBtn}>⬇️ Export CSV</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={s.th}>#</th>
                  <th style={s.th}>Name</th>
                  <th style={s.th}>Email</th>
                  <th style={s.th}>Pledged Amount</th>
                  <th style={s.th}>Date</th>
                  <th style={s.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {commitments.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                      No commitments recorded yet.
                    </td>
                  </tr>
                ) : (
                  commitments.map((c, i) => (
                    <tr key={c.id} style={{ background: i % 2 === 0 ? 'white' : '#fafbfc' }}>
                      <td style={s.td}>{i + 1}</td>
                      <td style={s.td}>{c.name}</td>
                      <td style={s.td}>{c.email}</td>
                      <td style={{ ...s.td, fontWeight: 600 }}>{fmt(parseFloat(c.monthly_pledge))}</td>
                      <td style={s.td}>{c.committed_at?.slice(0, 10)}</td>
                      <td style={s.td}>
                        <span style={{ background: '#dcfce7', color: '#166534', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem' }}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {commitments.length > 0 && (
                <tfoot>
                  <tr style={{ background: '#f1f5f9', fontWeight: 700 }}>
                    <td colSpan={3} style={{ ...s.td, textAlign: 'right' }}>Totals</td>
                    <td style={s.td}>{fmt(summary.prelaunch.totalPledgedVolume)}</td>
                    <td colSpan={2} style={s.td}></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </section>

        {/* Application Checklist — live, staff-controlled */}
        <section style={s.section}>
          <h2 style={s.sectionTitle}>BaaS Card Program — Application Checklist</h2>

          {checklist.length > 0 && (() => {
            const totalDone = checklist.filter((i) => i.done).length
            const pct = Math.round((totalDone / checklist.length) * 100)
            return (
              <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '20px 24px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontWeight: 700, color: '#0f1e2c', fontSize: '0.95rem' }}>Application Readiness</span>
                  <span style={{ color: '#7c3aed', fontWeight: 700, fontSize: '0.88rem' }}>{pct}% complete — {totalDone} of {checklist.length} items</span>
                </div>
                <div style={{ height: '10px', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #7c3aed, #22c55e)', borderRadius: '99px', transition: 'width 0.4s ease' }} />
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '8px' }}>
                  Click any item below to mark it complete or incomplete. Changes are saved instantly and visible to partners.
                </div>
              </div>
            )
          })()}

          <div style={{ background: '#fff8e7', border: '1px solid #ffb347', borderRadius: '16px', padding: '20px 24px', marginBottom: '24px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <span style={{ fontSize: '1.8rem', flexShrink: 0 }}>🏦</span>
            <div>
              <div style={{ fontWeight: 700, color: '#92400e', marginBottom: '6px' }}>SOLVY Card™ — BaaS Card Issuance Application</div>
              <div style={{ fontSize: '0.88rem', color: '#78350f', lineHeight: 1.6 }}>
                <strong>SOLVY Ecosystem™ (the cooperative)</strong> is the applicant entity applying to issue SOLVY Card™.
                The underwriting review typically takes 4–8 weeks. Toggle items below as documentation is completed.
              </div>
            </div>
          </div>

          {checklist.length > 0 ? (() => {
            const grouped: Record<string, ChecklistItem[]> = {}
            checklist.forEach((item) => {
              if (!grouped[item.category]) grouped[item.category] = []
              grouped[item.category].push(item)
            })
            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                {Object.entries(grouped).map(([cat, items]) => {
                  const done = items.filter((i) => i.done).length
                  return (
                    <div key={cat} style={{ background: '#f8fafc', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <span style={{ fontWeight: 700, color: '#0f1e2c', fontSize: '0.88rem' }}>{cat}</span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#7c3aed', background: 'rgba(124,58,237,0.08)', padding: '2px 8px', borderRadius: '20px' }}>{done}/{items.length}</span>
                      </div>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {items.map((item) => (
                          <li key={item.id}
                            onClick={() => checklistTogglingId === null && toggleChecklistItem(item)}
                            style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '7px 8px', borderRadius: '8px', cursor: checklistTogglingId === item.id ? 'wait' : 'pointer', background: item.done ? 'rgba(34,197,94,0.06)' : 'transparent', transition: 'background 0.15s' }}>
                            <span style={{ fontWeight: 800, fontSize: '1rem', flexShrink: 0, marginTop: '1px', color: item.done ? '#22c55e' : '#cbd5e1' }}>
                              {checklistTogglingId === item.id ? '⏳' : item.done ? '✓' : '☐'}
                            </span>
                            <span style={{ fontSize: '0.79rem', lineHeight: 1.5, color: item.done ? '#166534' : '#475569', textDecoration: item.done ? 'none' : 'none' }}>
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
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading checklist…</div>
          )}

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '16px', padding: '24px' }}>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <div style={{ fontWeight: 700, color: '#166534', marginBottom: '6px' }}>Ready to submit the application package?</div>
              <div style={{ fontSize: '0.85rem', color: '#15803d', lineHeight: 1.5 }}>
                Export the CSV as your prelaunch commitment list. Use Print to generate a PDF of this full package for submission.
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button onClick={exportCSV} style={{ background: '#166534', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '40px', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}>
                ⬇️ Export Commitment CSV
              </button>
              <button onClick={() => window.print()} style={{ background: 'transparent', border: '1px solid #166534', color: '#166534', padding: '12px 20px', borderRadius: '40px', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}>
                🖨️ Print Full Package
              </button>
            </div>
          </div>
        </section>

        {/* Document Vault */}
        <section style={s.section}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ ...s.sectionTitle, marginBottom: 0 }}>Document Vault</h2>
            <button onClick={() => showDocForm ? clearForm() : setShowDocForm(true)} style={{ background: showDocForm ? '#64748b' : '#7c3aed', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>
              {showDocForm ? '✕ Cancel' : '+ Add Document'}
            </button>
          </div>

          {showDocForm && (
            <form onSubmit={uploadMode === 'file' ? uploadAndAddDoc : addDoc} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                <button type="button" onClick={() => setUploadMode('url')} style={{ padding: '7px 18px', borderRadius: '8px', border: '1.5px solid', borderColor: uploadMode === 'url' ? '#7c3aed' : '#cbd5e1', background: uploadMode === 'url' ? '#ede9fe' : 'white', color: uploadMode === 'url' ? '#5b21b6' : '#64748b', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
                  🔗 Paste URL
                </button>
                <button type="button" onClick={() => setUploadMode('file')} style={{ padding: '7px 18px', borderRadius: '8px', border: '1.5px solid', borderColor: uploadMode === 'file' ? '#7c3aed' : '#cbd5e1', background: uploadMode === 'file' ? '#ede9fe' : 'white', color: uploadMode === 'file' ? '#5b21b6' : '#64748b', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
                  ⬆️ Upload File
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={s.fLabel}>Document Title *</label>
                  <input required value={docForm.title} onChange={(e) => setDocForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Articles of Organization" style={s.fInput} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={s.fLabel}>Category</label>
                  <select value={docForm.category} onChange={(e) => setDocForm((f) => ({ ...f, category: e.target.value }))} style={s.fInput}>
                    {DOC_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              {uploadMode === 'url' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={s.fLabel}>URL / Link *</label>
                  <input required value={docForm.url} onChange={(e) => setDocForm((f) => ({ ...f, url: e.target.value }))} placeholder="https://drive.google.com/... or any public link" style={s.fInput} />
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={s.fLabel}>Select File * (PDF, Word, Excel, images — max 20 MB)</label>
                  <input required type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt,.csv" onChange={(e) => setFileWithPreview(e.target.files?.[0] || null)} style={{ ...s.fInput, padding: '8px' }} />
                  {uploadFile && <div style={{ fontSize: '0.78rem', color: '#22c55e', fontWeight: 600 }}>✓ {uploadFile.name} ({(uploadFile.size / 1024).toFixed(0)} KB)</div>}
                </div>
              )}

              {/* Live Preview Panel */}
              {uploadMode === 'file' && uploadFile && previewObjectUrl && (() => {
                const ext = uploadFile.name.split('.').pop()?.toLowerCase() ?? ''
                const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)
                const isPdf = ext === 'pdf'
                return (
                  <div style={{ border: '1.5px solid #7c3aed', borderRadius: '12px', overflow: 'hidden', background: '#f8fafc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: '#ede9fe', borderBottom: '1px solid #c4b5fd' }}>
                      <span style={{ fontWeight: 700, color: '#5b21b6', fontSize: '0.82rem' }}>👁 Preview — {uploadFile.name}</span>
                      <span style={{ fontSize: '0.72rem', color: '#7c3aed' }}>{(uploadFile.size / 1024).toFixed(0)} KB</span>
                    </div>
                    {isImage && (
                      <img src={previewObjectUrl} alt="preview" style={{ width: '100%', maxHeight: '480px', objectFit: 'contain', display: 'block', background: '#fff' }} />
                    )}
                    {isPdf && (
                      <iframe src={previewObjectUrl} title="PDF Preview" style={{ width: '100%', height: '520px', border: 'none', display: 'block' }} />
                    )}
                    {!isImage && !isPdf && (
                      <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📄</div>
                        <div style={{ fontWeight: 600, marginBottom: '4px' }}>{uploadFile.name}</div>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Preview not available for this file type — it will upload correctly.</div>
                      </div>
                    )}
                  </div>
                )
              })()}

              {uploadMode === 'url' && docForm.url && docForm.url.startsWith('http') && (
                <div style={{ border: '1.5px solid #7c3aed', borderRadius: '12px', overflow: 'hidden', background: '#f8fafc' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: '#ede9fe', borderBottom: '1px solid #c4b5fd' }}>
                    <span style={{ fontWeight: 700, color: '#5b21b6', fontSize: '0.82rem' }}>👁 URL Preview</span>
                    <a href={docForm.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.72rem', color: '#7c3aed' }}>Open in new tab →</a>
                  </div>
                  <iframe src={docForm.url} title="URL Preview" sandbox="allow-scripts allow-same-origin" style={{ width: '100%', height: '480px', border: 'none', display: 'block' }} />
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={s.fLabel}>Description (optional)</label>
                <input value={docForm.description} onChange={(e) => setDocForm((f) => ({ ...f, description: e.target.value }))} placeholder="Short description shown to partners" style={s.fInput} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" id="visible" checked={docForm.visible_to_partners} onChange={(e) => setDocForm((f) => ({ ...f, visible_to_partners: e.target.checked }))} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                <label htmlFor="visible" style={{ fontSize: '0.88rem', color: '#475569', cursor: 'pointer' }}>Visible to partners on review page</label>
              </div>
              {docError && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '8px', padding: '10px 14px', fontSize: '0.82rem' }}>{docError}</div>}
              <button type="submit" disabled={docSaving || uploading || (uploadMode === 'file' && !uploadFile)} style={{ background: '#7c3aed', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-start' }}>
                {uploading ? '⬆️ Uploading…' : docSaving ? 'Saving…' : uploadMode === 'file' ? '⬆️ Upload & Save' : 'Save Document'}
              </button>
            </form>
          )}

          {docs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '0.9rem' }}>
              No documents added yet. Click "Add Document" to get started.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {docs.map((doc) => (
                <div key={doc.id} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', padding: '16px 20px', background: '#f8fafc', borderRadius: '12px', border: `1px solid ${doc.visible_to_partners ? '#e2e8f0' : '#fde68a'}` }}>
                  <div style={{ fontSize: '1.4rem', flexShrink: 0 }}>📄</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: '#0f1e2c', fontSize: '0.9rem', marginBottom: '2px' }}>{doc.title}</div>
                    {doc.description && <div style={{ color: '#64748b', fontSize: '0.78rem', marginBottom: '4px' }}>{doc.description}</div>}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', background: '#ede9fe', color: '#5b21b6', padding: '2px 8px', borderRadius: '20px' }}>{doc.category}</span>
                      <span style={{ fontSize: '0.72rem', background: doc.visible_to_partners ? '#dcfce7' : '#fef3c7', color: doc.visible_to_partners ? '#166534' : '#92400e', padding: '2px 8px', borderRadius: '20px' }}>
                        {doc.visible_to_partners ? '👁 Partner visible' : '🔒 Staff only'}
                      </span>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.72rem', color: '#7c3aed', textDecoration: 'underline' }}>Open →</a>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button onClick={() => toggleVisible(doc)} title={doc.visible_to_partners ? 'Hide from partners' : 'Show to partners'} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', fontSize: '0.8rem', color: '#475569' }}>
                      {doc.visible_to_partners ? '🙈 Hide' : '👁 Show'}
                    </button>
                    <button onClick={() => deleteDoc(doc.id)} title="Delete" style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', fontSize: '0.8rem', color: '#dc2626' }}>
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <footer style={s.footer}>
          SOLVY Ecosystem™ — Cooperative neobank · Data sovereign · Member owned ·{' '}
          {new Date().getFullYear()} · Confidential — Internal Staff Use Only
        </footer>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { background: '#f8fafc', minHeight: '100vh' },
  container: { maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' },
  loading: { textAlign: 'center', padding: '80px', color: '#64748b', fontSize: '1.1rem' },
  errorBox: { margin: '60px auto', maxWidth: '500px', background: '#fef2f2', border: '1px solid #fecaca', padding: '24px', borderRadius: '16px', color: '#991b1b', textAlign: 'center' },
  logoWrap: { textAlign: 'center' as const, marginBottom: '24px', paddingTop: '16px' },
  fullLogo: { width: '100%', maxWidth: '860px', height: 'auto', display: 'block', margin: '0 auto', objectFit: 'contain' as const, filter: 'drop-shadow(0 0 20px rgba(147,51,234,0.4))' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '40px', paddingBottom: '24px', borderBottom: '2px solid #e2e8f0' },
  pageTitle: { fontSize: '1.75rem', fontWeight: 800, color: '#0f1e2c', margin: 0 },
  pageSubtitle: { color: '#64748b', margin: '6px 0 0', fontSize: '0.95rem' },
  exportGroup: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  exportBtn: { background: '#0f1e2c', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' },
  printBtn: { background: 'transparent', color: '#0f1e2c', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' },
  gateWrap: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)', padding: '40px 24px' },
  gateBox: { background: 'white', borderRadius: '24px', padding: '48px 40px', maxWidth: '440px', width: '100%', textAlign: 'center', boxShadow: '0 8px 40px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0' },
  gateLock: { fontSize: '3rem', marginBottom: '16px' },
  gateTitle: { fontSize: '1.5rem', fontWeight: 800, color: '#0f1e2c', margin: '0 0 12px' },
  gateSub: { fontSize: '0.88rem', color: '#64748b', lineHeight: 1.6, marginBottom: '28px' },
  gateForm: { display: 'flex', flexDirection: 'column', gap: '12px' },
  gateInput: { padding: '14px 16px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '1rem', outline: 'none', textAlign: 'center', letterSpacing: '0.1em' },
  gateError: { background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '8px', padding: '10px 14px', fontSize: '0.82rem' },
  gateBtn: { background: '#0f1e2c', color: 'white', border: 'none', padding: '14px', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer' },
  gateFooter: { fontSize: '0.75rem', color: '#94a3b8', marginTop: '24px', marginBottom: 0 },
  applicantBanner: { background: 'linear-gradient(135deg, #0f1e2c 0%, #1e3a5f 100%)', borderRadius: '20px', padding: '28px 32px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px', boxShadow: '0 4px 24px rgba(15,30,44,0.25)' },
  applicantLeft: { flex: 1, minWidth: '240px' },
  applicantTag: { fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.12em', color: '#ffb347', textTransform: 'uppercase', marginBottom: '8px' },
  applicantName: { fontSize: '2rem', fontWeight: 900, color: 'white', letterSpacing: '-0.02em', marginBottom: '6px' },
  applicantSub: { fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 },
  applicantRight: { display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '280px' },
  applicantMeta: { display: 'flex', justifyContent: 'space-between', gap: '16px', padding: '8px 14px', background: 'rgba(255,255,255,0.07)', borderRadius: '8px' },
  metaLabel: { fontSize: '0.75rem', color: '#64748b', fontWeight: 600 },
  metaValue: { fontSize: '0.78rem', color: '#e2e8f0', fontWeight: 700, textAlign: 'right' },
  section: { background: 'white', borderRadius: '20px', padding: '32px', marginBottom: '24px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' },
  sectionTitle: { fontSize: '1.2rem', fontWeight: 700, color: '#0f1e2c', marginTop: 0, marginBottom: '24px', paddingBottom: '12px', borderBottom: '1px solid #f0f4f8' },
  execGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' },
  execCard: { background: '#f8fafc', borderRadius: '16px', padding: '24px', borderTop: '4px solid #e2e8f0' },
  execLabel: { fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' },
  execValue: { fontSize: '1.6rem', fontWeight: 800, color: '#0f1e2c', margin: '0 0 6px' },
  execSub: { fontSize: '0.8rem', color: '#94a3b8' },
  pipelineRow: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' },
  pipelineStep: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', position: 'relative' },
  pipelineBubble: { width: '90px', height: '90px', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
  pipelineIcon: { fontSize: '1.4rem', lineHeight: 1 },
  pipelineNum: { fontSize: '1.4rem', fontWeight: 800, lineHeight: 1 },
  pipelineLabel: { fontSize: '0.75rem', fontWeight: 600, color: '#475569', textAlign: 'center', maxWidth: '90px' },
  pipelineArrow: { fontSize: '1.5rem', color: '#cbd5e1', alignSelf: 'center', marginTop: '-24px', marginLeft: '4px', marginRight: '4px' },
  coopGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' },
  coopCard: { borderRadius: '20px', padding: '28px 24px', color: 'white', textAlign: 'center' },
  coopPct: { fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px' },
  coopLabel: { fontSize: '1rem', fontWeight: 700, marginBottom: '10px', opacity: 0.9 },
  coopDesc: { fontSize: '0.8rem', opacity: 0.75, lineHeight: 1.5 },
  partnerGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' },
  partnerCard: { background: '#f8fafc', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' },
  partnerNum: { fontSize: '0.75rem', fontWeight: 700, color: '#ffb347', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' },
  partnerName: { fontSize: '1.05rem', fontWeight: 700, color: '#0f1e2c', marginBottom: '12px' },
  partnerRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  badge: { padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 },
  proofNote: { background: '#fff8e7', borderLeft: '4px solid #ffb347', padding: '16px 20px', borderRadius: '12px', fontSize: '0.9rem', lineHeight: 1.6 },
  complianceGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' },
  complianceCard: { background: '#f8fafc', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' },
  complianceIcon: { fontSize: '1.8rem', marginBottom: '10px' },
  complianceTitle: { fontWeight: 700, color: '#0f1e2c', marginBottom: '12px', fontSize: '0.95rem' },
  complianceList: { listStyle: 'none', padding: 0, margin: 0 },
  complianceItem: { fontSize: '0.82rem', color: '#475569', padding: '4px 0', borderBottom: '1px solid #f0f4f8' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' },
  th: { textAlign: 'left', padding: '12px 14px', color: '#475569', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '2px solid #e2e8f0' },
  td: { padding: '12px 14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' },
  footer: { textAlign: 'center', marginTop: '40px', color: '#94a3b8', fontSize: '0.75rem', lineHeight: 2 },
  fLabel: { fontSize: '0.8rem', fontWeight: 600, color: '#374151' } as React.CSSProperties,
  fInput: { padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', width: '100%', boxSizing: 'border-box' } as React.CSSProperties,
}
