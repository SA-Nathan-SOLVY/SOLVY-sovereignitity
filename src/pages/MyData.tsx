import { useState, useEffect } from 'react'
import UnifiedNav from '../components/UnifiedNav'
import {
  addTransaction,
  listTransactions,
  deleteTransaction,
  clearAllTransactions,
  buildAggregate,
  getContributorId,
  type LocalTransaction,
} from '../lib/localData'

interface DataPool {
  id: string
  name: string
  category: string
}

interface AggregateDashboard {
  retentionDays: number
  nextPurgeAt: string | null
  totalContributions: number
  byPool: { pool_id: string; contributor_count: number; oldest_contributed_at: string; newest_contributed_at: string }[]
}

const CATEGORIES = ['Groceries', 'Dining', 'Transport', 'Utilities', 'Remittance', 'Healthcare', 'Retail', 'Entertainment', 'Other']

export default function MyData() {
  const [txs, setTxs] = useState<LocalTransaction[]>([])
  const [pools, setPools] = useState<DataPool[]>([])
  const [dashboard, setDashboard] = useState<AggregateDashboard | null>(null)
  const [contributedPools, setContributedPools] = useState<string[]>([])
  const [selectedPool, setSelectedPool] = useState('spending-patterns')
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), amount: '', category: 'Groceries', merchant: '', note: '' })

  const refreshLocal = async () => setTxs(await listTransactions())
  const refreshDashboard = async () => {
    try {
      const d = await fetch('/api/data-pools/aggregates').then((r) => r.json())
      setDashboard(d)
    } catch { /* ignore */ }
  }

  useEffect(() => {
    refreshLocal()
    refreshDashboard()
    fetch('/api/data-pools').then((r) => r.json()).then((d) => setPools(d.pools ?? [])).catch(() => {})
    try {
      setContributedPools(JSON.parse(localStorage.getItem('solvy-contributed-pools') || '[]'))
    } catch { /* ignore */ }
  }, [])

  const flash = (text: string, type: 'success' | 'error' | 'info') => {
    setMsg({ text, type })
    setTimeout(() => setMsg(null), 4000)
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(form.amount)
    if (!form.date || isNaN(amount)) return
    await addTransaction({ date: form.date, amount, category: form.category, merchant: form.merchant || undefined, note: form.note || undefined })
    setForm((f) => ({ ...f, amount: '', merchant: '', note: '' }))
    await refreshLocal()
    flash('Transaction saved on this device only.', 'success')
  }

  const handleDelete = async (id?: number) => {
    if (id == null) return
    await deleteTransaction(id)
    await refreshLocal()
  }

  const persistContributed = (next: string[]) => {
    setContributedPools(next)
    localStorage.setItem('solvy-contributed-pools', JSON.stringify(next))
  }

  const handleContribute = async () => {
    if (txs.length === 0) {
      flash('Add some local transactions first — there is nothing to aggregate yet.', 'info')
      return
    }
    const aggregate = buildAggregate(txs)
    try {
      const r = await fetch('/api/data-pools/contribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poolId: selectedPool, contributorId: getContributorId(), aggregate }),
      })
      const d = await r.json()
      if (d.success) {
        if (!contributedPools.includes(selectedPool)) persistContributed([...contributedPools, selectedPool])
        await refreshDashboard()
        flash('Anonymized aggregate contributed. No raw transactions left your device.', 'success')
      } else {
        flash(d.error ?? 'Contribution failed.', 'error')
      }
    } catch {
      flash('Network error contributing aggregate.', 'error')
    }
  }

  const handleWithdraw = async (poolId: string) => {
    try {
      await fetch('/api/data-pools/contribute', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poolId, contributorId: getContributorId() }),
      })
      persistContributed(contributedPools.filter((p) => p !== poolId))
      await refreshDashboard()
      flash('Your aggregate was withdrawn from that pool.', 'success')
    } catch {
      flash('Network error withdrawing aggregate.', 'error')
    }
  }

  const handleWipe = async () => {
    if (!confirm('Permanently delete ALL transactions stored on this device? This cannot be undone.')) return
    await clearAllTransactions()
    await refreshLocal()
    flash('All local data wiped from this device.', 'success')
  }

  const preview = buildAggregate(txs)
  const poolName = (id: string) => pools.find((p) => p.id === id)?.name ?? id

  return (
    <div style={s.page}>
      <UnifiedNav />

      <section style={s.hero}>
        <div style={s.heroBadge}>🔐 Local-First Data</div>
        <h1 style={s.heroTitle}>Your Data <span style={s.accent}>Lives Here</span></h1>
        <p style={s.heroSub}>
          Every transaction below is stored only in this browser, on this device. It is never uploaded.
          When you contribute to a pool, only an anonymized aggregate — category totals and counts, no names, amounts per row, dates, or merchants — is sent.
        </p>
      </section>

      <div style={s.container}>
        {msg && (
          <div style={{ ...s.msgBase, ...(msg.type === 'success' ? s.msgSuccess : msg.type === 'error' ? s.msgError : s.msgInfo) }}>{msg.text}</div>
        )}

        {/* Add transaction */}
        <section style={s.card}>
          <h2 style={s.cardTitle}>Add a Transaction <span style={s.localTag}>on-device only</span></h2>
          <form onSubmit={handleAdd} style={s.formGrid}>
            <label style={s.field}>
              <span style={s.label}>Date</span>
              <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} style={s.input} required />
            </label>
            <label style={s.field}>
              <span style={s.label}>Amount ($)</span>
              <input type="number" step="0.01" min="0" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="42.50" style={s.input} required />
            </label>
            <label style={s.field}>
              <span style={s.label}>Category</span>
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} style={s.input}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label style={s.field}>
              <span style={s.label}>Merchant <span style={s.localHint}>(stays local)</span></span>
              <input type="text" value={form.merchant} onChange={(e) => setForm((f) => ({ ...f, merchant: e.target.value }))} placeholder="optional" style={s.input} />
            </label>
            <label style={{ ...s.field, gridColumn: '1 / -1' }}>
              <span style={s.label}>Note <span style={s.localHint}>(stays local)</span></span>
              <input type="text" value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} placeholder="optional" style={s.input} />
            </label>
            <button type="submit" style={s.primaryBtn}>Save Locally</button>
          </form>
        </section>

        {/* Local transactions */}
        <section style={s.card}>
          <div style={s.cardHeaderRow}>
            <h2 style={s.cardTitle}>Stored on This Device <span style={s.countPill}>{txs.length}</span></h2>
            {txs.length > 0 && <button onClick={handleWipe} style={s.dangerBtn}>Wipe All Local Data</button>}
          </div>
          {txs.length === 0 ? (
            <p style={s.empty}>No local transactions yet. Add one above — it will only exist in this browser.</p>
          ) : (
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Date</th>
                    <th style={s.th}>Category</th>
                    <th style={s.th}>Merchant</th>
                    <th style={{ ...s.th, textAlign: 'right' }}>Amount</th>
                    <th style={s.th}></th>
                  </tr>
                </thead>
                <tbody>
                  {txs.map((t) => (
                    <tr key={t.id}>
                      <td style={s.td}>{t.date}</td>
                      <td style={s.td}>{t.category}</td>
                      <td style={{ ...s.td, color: '#64748b' }}>{t.merchant || '—'}</td>
                      <td style={{ ...s.td, textAlign: 'right' }}>${t.amount.toFixed(2)}</td>
                      <td style={{ ...s.td, textAlign: 'right' }}>
                        <button onClick={() => handleDelete(t.id)} style={s.linkBtn}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Contribute aggregate */}
        <section style={s.card}>
          <h2 style={s.cardTitle}>Contribute an Anonymized Aggregate</h2>
          <p style={s.cardBody}>
            Choose a pool. Only the summary below is sent — your individual rows, merchants, notes, and dates never leave this device.
          </p>
          <div style={s.contribRow}>
            <select value={selectedPool} onChange={(e) => setSelectedPool(e.target.value)} style={{ ...s.input, maxWidth: '320px' }}>
              {pools.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button onClick={handleContribute} style={s.primaryBtn}>Contribute to Pool</button>
          </div>

          <div style={s.previewBox}>
            <div style={s.previewLabel}>Exact payload that will be sent (PII-free):</div>
            <pre style={s.pre}>{JSON.stringify({ poolId: selectedPool, aggregate: preview }, null, 2)}</pre>
          </div>

          {contributedPools.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <div style={s.previewLabel}>You are contributing to:</div>
              <div style={s.chipRow}>
                {contributedPools.map((p) => (
                  <span key={p} style={s.chip}>
                    {poolName(p)}
                    <button onClick={() => handleWithdraw(p)} style={s.chipX} title="Withdraw">✕</button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Pool dashboard / retention */}
        <section style={s.card}>
          <h2 style={s.cardTitle}>Pooled Aggregates — Retention</h2>
          {dashboard ? (
            <>
              <div style={s.retentionRow}>
                <div style={s.retentionStat}>
                  <div style={s.retentionNum}>{dashboard.retentionDays} days</div>
                  <div style={s.retentionLabel}>Retention window — aggregates auto-purge after this</div>
                </div>
                <div style={s.retentionStat}>
                  <div style={s.retentionNum}>{dashboard.totalContributions}</div>
                  <div style={s.retentionLabel}>Total contributions currently stored</div>
                </div>
                <div style={s.retentionStat}>
                  <div style={s.retentionNum}>{dashboard.nextPurgeAt ? new Date(dashboard.nextPurgeAt).toLocaleString() : '—'}</div>
                  <div style={s.retentionLabel}>Next scheduled purge</div>
                </div>
              </div>
              {dashboard.byPool.length > 0 && (
                <div style={s.tableWrap}>
                  <table style={s.table}>
                    <thead>
                      <tr>
                        <th style={s.th}>Pool</th>
                        <th style={{ ...s.th, textAlign: 'right' }}>Contributors</th>
                        <th style={s.th}>Oldest contribution</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.byPool.map((b) => (
                        <tr key={b.pool_id}>
                          <td style={s.td}>{poolName(b.pool_id)}</td>
                          <td style={{ ...s.td, textAlign: 'right' }}>{b.contributor_count}</td>
                          <td style={{ ...s.td, color: '#64748b' }}>{new Date(b.oldest_contributed_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <p style={s.empty}>Loading retention status…</p>
          )}
          <p style={{ ...s.cardBody, marginTop: '1rem' }}>
            Data-use changes are decided by member vote on the <a href="/man#governance" style={s.link}>MAN Portal</a>.
          </p>
        </section>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#0f172a', color: '#fff', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
  hero: { background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '7rem 2rem 3rem', textAlign: 'center', borderBottom: '1px solid rgba(147,51,234,0.2)' },
  heroBadge: { display: 'inline-block', background: 'rgba(147,51,234,0.15)', border: '1px solid rgba(147,51,234,0.3)', color: '#c4b5fd', padding: '6px 18px', borderRadius: '40px', fontSize: '0.82rem', fontWeight: 600, marginBottom: '20px' },
  heroTitle: { fontSize: '2.6rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem' },
  accent: { background: 'linear-gradient(135deg, #9333ea, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
  heroSub: { color: '#94a3b8', fontSize: '1.05rem', maxWidth: '680px', margin: '0 auto', lineHeight: 1.65 },
  container: { maxWidth: '900px', margin: '0 auto', padding: '2.5rem 1.5rem 5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(147,51,234,0.18)', borderRadius: '16px', padding: '1.75rem' },
  cardHeaderRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' as const },
  cardTitle: { fontSize: '1.2rem', fontWeight: 700, color: '#e2e8f0', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '10px' },
  cardBody: { color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6, margin: '0 0 1rem' },
  localTag: { fontSize: '0.68rem', fontWeight: 700, color: '#22c55e', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', padding: '2px 10px', borderRadius: '20px', textTransform: 'uppercase' as const, letterSpacing: '0.05em' },
  localHint: { color: '#64748b', fontWeight: 400, fontSize: '0.78rem' },
  countPill: { fontSize: '0.8rem', fontWeight: 700, color: '#c4b5fd', background: 'rgba(147,51,234,0.15)', padding: '2px 10px', borderRadius: '20px' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', alignItems: 'end' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600 },
  input: { padding: '0.65rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(147,51,234,0.35)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.95rem', outline: 'none' },
  primaryBtn: { background: 'linear-gradient(135deg, #9333ea, #7c3aed)', color: '#fff', border: 'none', padding: '0.7rem 1.4rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem', whiteSpace: 'nowrap' as const },
  dangerBtn: { background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '0.55rem 1rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' },
  linkBtn: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 },
  empty: { color: '#64748b', fontSize: '0.92rem', textAlign: 'center' as const, padding: '1.5rem 0' },
  tableWrap: { overflowX: 'auto' as const },
  table: { width: '100%', borderCollapse: 'collapse' as const, fontSize: '0.9rem' },
  th: { textAlign: 'left' as const, color: '#94a3b8', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase' as const, letterSpacing: '0.04em', padding: '8px 10px', borderBottom: '1px solid rgba(147,51,234,0.2)' },
  td: { padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#e2e8f0' },
  contribRow: { display: 'flex', gap: '12px', flexWrap: 'wrap' as const, alignItems: 'center', marginBottom: '1.25rem' },
  previewBox: { background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(147,51,234,0.2)', borderRadius: '10px', padding: '1rem' },
  previewLabel: { fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, marginBottom: '8px' },
  pre: { margin: 0, color: '#6ee7b7', fontSize: '0.8rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' as const, wordBreak: 'break-word' as const, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" },
  chipRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' as const },
  chip: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 },
  chipX: { background: 'none', border: 'none', color: '#22c55e', cursor: 'pointer', fontSize: '0.85rem', padding: 0, lineHeight: 1 },
  retentionRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '1.5rem' },
  retentionStat: { background: 'rgba(147,51,234,0.07)', border: '1px solid rgba(147,51,234,0.2)', borderRadius: '12px', padding: '1.1rem' },
  retentionNum: { fontSize: '1.15rem', fontWeight: 800, color: '#c4b5fd', marginBottom: '6px' },
  retentionLabel: { fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.4 },
  link: { color: '#c4b5fd', textDecoration: 'underline' },
  msgBase: { padding: '0.85rem 1.25rem', borderRadius: '8px', fontSize: '0.92rem' },
  msgSuccess: { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' },
  msgError: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' },
  msgInfo: { background: 'rgba(147,51,234,0.1)', border: '1px solid rgba(147,51,234,0.3)', color: '#c4b5fd' },
}
