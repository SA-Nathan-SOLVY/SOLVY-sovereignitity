import { useState, useEffect } from 'react'

interface EblMerchantTransaction {
  id: string
  session_id: string
  customer_name: string
  service_type: string
  amount_total: number
  currency: string
  payment_status: string
  payment_type: string
  interchange_ebl: number
  created_at: string
}

const fmt = (n: number, currency = 'USD') =>
  n.toLocaleString('en-US', { style: 'currency', currency })

const SERVICE_DISPLAY_NAMES: Record<string, string> = {
  hair: 'Hair Services',
  nail: 'Nail Services',
  beauty: 'Beauty Services',
  reign: 'Reign Products',
}

export default function EBLMerchant() {
  const [token, setToken] = useState(() => sessionStorage.getItem('ebl_merchant_token') || '')
  const [verified, setVerified] = useState(() => !!sessionStorage.getItem('ebl_merchant_token'))
  const [codeInput, setCodeInput] = useState('')
  const [codeError, setCodeError] = useState('')
  const [verifying, setVerifying] = useState(false)

  const [transactions, setTransactions] = useState<EblMerchantTransaction[]>([])
  const [accumulatedPatronage, setAccumulatedPatronage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(false)

  async function handleDownloadCsv() {
    if (!token) return
    setDownloading(true)
    try {
      const r = await fetch('/api/ebl/transactions?format=csv', {
        headers: { 'x-ebl-token': token },
      })
      if (r.status === 403) {
        signOut()
        throw new Error('Session expired. Please sign in again.')
      }
      if (!r.ok) throw new Error('Download failed.')
      const blob = await r.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ebl-payment-history-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err: any) {
      setError(err.message || 'Could not download your CSV. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  const [prices, setPrices] = useState<Record<string, { default: string; label: string }>>({})
  const [savingPrices, setSavingPrices] = useState(false)
  const [priceNotice, setPriceNotice] = useState('')
  const [priceError, setPriceError] = useState('')

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setVerifying(true)
    setCodeError('')
    try {
      const r = await fetch('/api/ebl/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeInput }),
      })
      const data = await r.json()
      if (data.authorized) {
        sessionStorage.setItem('ebl_merchant_token', codeInput)
        setToken(codeInput)
        setVerified(true)
      } else {
        setCodeError('Incorrect access code. This dashboard is for Evergreen Beauty Lounge only.')
      }
    } catch {
      setCodeError('Could not verify. Please try again.')
    } finally {
      setVerifying(false)
    }
  }

  function signOut() {
    sessionStorage.removeItem('ebl_merchant_token')
    setToken('')
    setVerified(false)
    setTransactions([])
    setAccumulatedPatronage(0)
    setCodeInput('')
  }

  useEffect(() => {
    if (!verified || !token) return
    setLoading(true)
    setError('')
    fetch('/api/ebl/transactions', { headers: { 'x-ebl-token': token } })
      .then((r) => {
        if (r.status === 403) {
          signOut()
          throw new Error('Session expired. Please sign in again.')
        }
        return r.json()
      })
      .then((data) => {
        setTransactions(data.transactions ?? [])
        setAccumulatedPatronage(Number(data.accumulated_patronage) || 0)
      })
      .catch((err) => setError(err.message || 'Failed to load your transactions.'))
      .finally(() => setLoading(false))
  }, [verified, token])

  useEffect(() => {
    if (!verified) return
    fetch('/api/ebl/prices')
      .then((r) => r.json())
      .then((data) => setPrices(data.prices ?? {}))
      .catch(() => setPrices({}))
  }, [verified])

  function updatePriceField(serviceType: string, field: 'default' | 'label', value: string) {
    setPrices((prev) => ({
      ...prev,
      [serviceType]: { ...prev[serviceType], [field]: value },
    }))
  }

  async function handleSavePrices(e: React.FormEvent) {
    e.preventDefault()
    setSavingPrices(true)
    setPriceNotice('')
    setPriceError('')
    try {
      const r = await fetch('/api/ebl/prices', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-ebl-token': token },
        body: JSON.stringify({ prices }),
      })
      const data = await r.json()
      if (r.status === 403) {
        signOut()
        throw new Error('Session expired. Please sign in again.')
      }
      if (!r.ok || !data.success) {
        throw new Error(data.error || 'Could not save prices. Please try again.')
      }
      setPrices(data.prices ?? prices)
      setPriceNotice('Prices updated. They are live on your payment page now.')
    } catch (err: any) {
      setPriceError(err.message || 'Could not save prices. Please try again.')
    } finally {
      setSavingPrices(false)
    }
  }

  if (!verified) {
    return (
      <div style={s.page}>
        <div style={s.gateCard}>
          <img src="/ebl-logo.png" alt="EBL Logo" style={{ height: 56, marginBottom: 18 }} />
          <h1 style={s.gateTitle}>Merchant Dashboard</h1>
          <p style={s.gateSubtitle}>
            Evergreen Beauty Lounge — view your SOLVY payment history and earnings.
          </p>
          <form onSubmit={handleVerify} style={{ marginTop: 20 }}>
            <input
              type="password"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="Enter your access code"
              style={s.gateInput}
              autoComplete="current-password"
              autoFocus
            />
            {codeError && <div style={s.gateError}>{codeError}</div>}
            <button type="submit" style={s.gateBtn} disabled={verifying || !codeInput}>
              {verifying ? 'Verifying…' : 'View My Dashboard →'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  const totalRevenue = transactions.reduce((sum, t) => sum + Number(t.amount_total), 0)
  const totalEarnings = transactions.reduce((sum, t) => sum + Number(t.interchange_ebl), 0)
  const uniqueCustomers = new Set(
    transactions.map((t) => (t.customer_name || '').trim().toLowerCase()).filter(Boolean)
  ).size

  const byService = transactions.reduce<Record<string, { count: number; revenue: number }>>((acc, t) => {
    const key = t.service_type || 'Other'
    if (!acc[key]) acc[key] = { count: 0, revenue: 0 }
    acc[key].count += 1
    acc[key].revenue += Number(t.amount_total)
    return acc
  }, {})
  const serviceRows = Object.entries(byService).sort((a, b) => b[1].revenue - a[1].revenue)

  return (
    <div style={s.page}>
      <div style={s.container}>
        <div style={s.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src="/ebl-logo.png" alt="EBL Logo" style={{ height: 44 }} />
            <div>
              <h1 style={s.title}>Merchant Dashboard</h1>
              <p style={s.subtitle}>Evergreen Beauty Lounge — your SOLVY payment history</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={handleDownloadCsv}
              style={{ ...s.downloadBtn, opacity: downloading || transactions.length === 0 ? 0.55 : 1 }}
              disabled={downloading || loading || transactions.length === 0}
            >
              {downloading ? 'Preparing…' : '↓ Download CSV'}
            </button>
            <button onClick={signOut} style={s.signOut}>Sign out</button>
          </div>
        </div>

        {loading ? (
          <div style={s.notice}>Loading your transactions…</div>
        ) : error ? (
          <div style={{ ...s.notice, color: '#fca5a5' }}>{error}</div>
        ) : (
          <>
            <div style={s.cardsGrid}>
              {[
                { label: 'Total Revenue', value: fmt(totalRevenue / 100), accent: '#a78bfa' },
                { label: 'Transactions', value: String(transactions.length), accent: '#60a5fa' },
                { label: 'Your Interchange Share (20%)', value: fmt(totalEarnings / 100), accent: '#34d399' },
                { label: 'Customers', value: String(uniqueCustomers), accent: '#f0abfc' },
              ].map((c) => (
                <div key={c.label} style={s.statCard}>
                  <div style={s.statLabel}>{c.label}</div>
                  <div style={{ ...s.statValue, color: c.accent }}>{c.value}</div>
                </div>
              ))}
            </div>

            <div style={s.patronagePanel}>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={s.patronageLabel}>
                  Accumulated cooperative membership (pending distribution)
                </div>
                <div style={s.patronageValue}>{fmt(accumulatedPatronage / 100)}</div>
              </div>
              <p style={s.patronageNote}>
                Beyond your immediate 20% interchange share, you also share in the cooperative's
                pooled membership funds. This is your running total accruing in the pool — it builds
                over time and is paid out later when the cooperative distributes membership.
              </p>
            </div>

            <div style={s.panel}>
              <h2 style={s.panelTitle}>Manage Service Prices</h2>
              <p style={s.priceIntro}>
                Update your prices any time — changes go live on your payment page instantly,
                no developer needed. The price is what fills in by default; the hint shows
                customers a typical range.
              </p>
              <form onSubmit={handleSavePrices}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={s.table}>
                    <thead>
                      <tr>
                        <th style={s.th}>Service</th>
                        <th style={{ ...s.th, width: 140 }}>Default Price ($)</th>
                        <th style={s.th}>Price Hint (optional)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(prices).length === 0 ? (
                        <tr>
                          <td style={s.td} colSpan={3}>Loading prices…</td>
                        </tr>
                      ) : (
                        Object.entries(prices)
                          .sort((a, b) => a[0].localeCompare(b[0]))
                          .map(([serviceType, p]) => (
                            <tr key={serviceType}>
                              <td style={{ ...s.td, fontWeight: 700, textTransform: 'capitalize' }}>
                                {SERVICE_DISPLAY_NAMES[serviceType] || serviceType}
                              </td>
                              <td style={s.td}>
                                <input
                                  type="number"
                                  min="0.5"
                                  step="0.01"
                                  value={p.default}
                                  onChange={(e) => updatePriceField(serviceType, 'default', e.target.value)}
                                  style={s.priceInput}
                                />
                              </td>
                              <td style={s.td}>
                                <input
                                  type="text"
                                  value={p.label}
                                  maxLength={120}
                                  placeholder="e.g. Typical range: $45 – $150+"
                                  onChange={(e) => updatePriceField(serviceType, 'label', e.target.value)}
                                  style={{ ...s.priceInput, width: '100%' }}
                                />
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
                {priceError && <div style={{ ...s.gateError, marginTop: 14 }}>{priceError}</div>}
                {priceNotice && <div style={s.priceNotice}>{priceNotice}</div>}
                <button
                  type="submit"
                  style={{ ...s.savePricesBtn, opacity: savingPrices || Object.keys(prices).length === 0 ? 0.6 : 1 }}
                  disabled={savingPrices || Object.keys(prices).length === 0}
                >
                  {savingPrices ? 'Saving…' : 'Save Prices'}
                </button>
              </form>
            </div>

            {transactions.length === 0 ? (
              <div style={s.notice}>
                No transactions yet. Payments made at EBL through SOLVY will appear here automatically.
              </div>
            ) : (
              <>
                <div style={s.panel}>
                  <h2 style={s.panelTitle}>Revenue by Service</h2>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={s.table}>
                      <thead>
                        <tr>
                          <th style={s.th}>Service</th>
                          <th style={{ ...s.th, textAlign: 'right' }}>Transactions</th>
                          <th style={{ ...s.th, textAlign: 'right' }}>Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {serviceRows.map(([service, data]) => (
                          <tr key={service}>
                            <td style={s.td}>{service}</td>
                            <td style={{ ...s.td, textAlign: 'right' }}>{data.count}</td>
                            <td style={{ ...s.td, textAlign: 'right', fontWeight: 700 }}>{fmt(data.revenue / 100)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div style={s.panel}>
                  <h2 style={s.panelTitle}>Transaction History</h2>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={s.table}>
                      <thead>
                        <tr>
                          <th style={s.th}>Date</th>
                          <th style={s.th}>Customer</th>
                          <th style={s.th}>Service</th>
                          <th style={{ ...s.th, textAlign: 'right' }}>Amount</th>
                          <th style={{ ...s.th, textAlign: 'right' }}>Your Share (20%)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((t) => (
                          <tr key={t.id}>
                            <td style={s.td}>
                              {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                            <td style={s.td}>{t.customer_name || '—'}</td>
                            <td style={s.td}>{t.service_type || '—'}</td>
                            <td style={{ ...s.td, textAlign: 'right', fontWeight: 700 }}>
                              {fmt(Number(t.amount_total) / 100, t.currency?.toUpperCase() || 'USD')}
                            </td>
                            <td style={{ ...s.td, textAlign: 'right', color: '#34d399', fontWeight: 700 }}>
                              {fmt(Number(t.interchange_ebl) / 100)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={s.footNote}>
                    Your SOLVY earnings are your 20% share of cooperative interchange on every payment.
                    Showing your {transactions.length} most recent transaction{transactions.length !== 1 ? 's' : ''}.
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)',
    color: '#e2e8f0',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    padding: '32px 20px',
    display: 'flex',
    justifyContent: 'center',
  },
  container: { width: '100%', maxWidth: 1040 },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 28,
    flexWrap: 'wrap',
  },
  title: { fontSize: '1.6rem', fontWeight: 800, margin: 0, color: '#ffffff' },
  subtitle: { fontSize: '0.9rem', color: '#94a3b8', margin: '4px 0 0' },
  downloadBtn: {
    background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: 10,
    padding: '8px 16px',
    fontSize: '0.85rem',
    fontWeight: 700,
    cursor: 'pointer',
  },
  signOut: {
    background: 'rgba(255,255,255,0.08)',
    color: '#e2e8f0',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 10,
    padding: '8px 16px',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 14,
    marginBottom: 24,
  },
  statCard: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(147,51,234,0.25)',
    borderRadius: 14,
    padding: '18px 20px',
  },
  statLabel: {
    fontSize: '0.72rem',
    fontWeight: 700,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: 8,
  },
  statValue: { fontSize: '1.5rem', fontWeight: 800 },
  panel: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: '20px 22px',
    marginBottom: 22,
  },
  patronagePanel: {
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    flexWrap: 'wrap',
    background: 'linear-gradient(135deg, rgba(147,51,234,0.18) 0%, rgba(124,58,237,0.10) 100%)',
    border: '1px solid rgba(167,139,250,0.35)',
    borderRadius: 16,
    padding: '22px 24px',
    marginBottom: 24,
  },
  patronageLabel: {
    fontSize: '0.72rem',
    fontWeight: 700,
    color: '#c4b5fd',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: 8,
  },
  patronageValue: { fontSize: '2rem', fontWeight: 800, color: '#d8b4fe' },
  patronageNote: {
    flex: 2,
    minWidth: 260,
    margin: 0,
    fontSize: '0.82rem',
    lineHeight: 1.55,
    color: '#cbd5e1',
  },
  panelTitle: { fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', margin: '0 0 16px' },
  priceIntro: { fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 16px', lineHeight: 1.6 },
  priceInput: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 8,
    padding: '8px 10px',
    color: '#ffffff',
    fontSize: '0.88rem',
    outline: 'none',
    width: 110,
    boxSizing: 'border-box',
  },
  priceNotice: { color: '#34d399', fontSize: '0.82rem', marginTop: 14 },
  savePricesBtn: {
    marginTop: 18,
    background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: 10,
    padding: '11px 24px',
    fontSize: '0.9rem',
    fontWeight: 700,
    cursor: 'pointer',
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' },
  th: {
    textAlign: 'left',
    padding: '10px 12px',
    color: '#94a3b8',
    fontSize: '0.72rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    color: '#e2e8f0',
  },
  footNote: { marginTop: 14, fontSize: '0.78rem', color: '#94a3b8' },
  notice: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: '28px',
    textAlign: 'center',
    color: '#cbd5e1',
  },
  gateCard: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(147,51,234,0.3)',
    borderRadius: 20,
    padding: '40px 36px',
    maxWidth: 420,
    width: '100%',
    textAlign: 'center',
    alignSelf: 'center',
  },
  gateTitle: { fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', margin: '0 0 8px' },
  gateSubtitle: { fontSize: '0.9rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 },
  gateInput: {
    width: '100%',
    boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: '13px 16px',
    color: '#ffffff',
    fontSize: '1rem',
    outline: 'none',
  },
  gateError: { color: '#fca5a5', fontSize: '0.82rem', marginTop: 10, textAlign: 'left' },
  gateBtn: {
    width: '100%',
    marginTop: 16,
    background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: 12,
    padding: '13px',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
  },
}
