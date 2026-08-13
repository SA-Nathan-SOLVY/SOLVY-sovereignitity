import { useState, useEffect, useCallback } from 'react'
import UnifiedNav from '../components/UnifiedNav'
import './SolvyCard.css'

type Card = {
  token: string
  lastFour?: string
  state?: string
  type?: string
  memo?: string
  spendLimit?: number
  spendLimitDuration?: string
  created?: string
}

type IssuedCard = Card & {
  pan?: string
  cvv?: string
  expMonth?: string
  expYear?: string
}

type Txn = {
  token: string
  amount?: number
  status?: string
  result?: string
  merchant?: string | null
  cardToken?: string
  created?: string
}

const money = (cents?: number) =>
  cents == null ? '—' : `$${(cents / 100).toFixed(2)}`

function SolvyCard() {
  const [code, setCode] = useState(() => sessionStorage.getItem('staff_token') || '')
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState('')

  const [configured, setConfigured] = useState<boolean | null>(null)
  const [cards, setCards] = useState<Card[]>([])
  const [txns, setTxns] = useState<Txn[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [memo, setMemo] = useState('SOLVY Debit Card')
  const [spendLimit, setSpendLimit] = useState('')
  const [spendLimitDuration, setSpendLimitDuration] = useState('MONTHLY')
  const [issued, setIssued] = useState<IssuedCard | null>(null)

  const [simPan, setSimPan] = useState('')
  const [simAmount, setSimAmount] = useState('10.00')
  const [simDescriptor, setSimDescriptor] = useState('EBL BEAUTY LOUNGE')

  const authHeaders = useCallback(
    () => ({ 'Content-Type': 'application/json', 'x-staff-token': code }),
    [code]
  )

  const verify = async () => {
    setAuthError('')
    try {
      const res = await fetch('/api/underwriting/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const data = await res.json()
      if (data.authorized) {
        sessionStorage.setItem('staff_token', code)
        setAuthed(true)
      } else {
        setAuthError('Invalid access code.')
      }
    } catch {
      setAuthError('Could not verify access code.')
    }
  }

  const loadAll = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const statusRes = await fetch('/api/lithic/status')
      const status = await statusRes.json()
      setConfigured(status.configured)
      if (!status.configured) {
        setLoading(false)
        return
      }
      const [cRes, tRes] = await Promise.all([
        fetch('/api/lithic/cards', { headers: authHeaders() }),
        fetch('/api/lithic/transactions', { headers: authHeaders() }),
      ])
      const cData = await cRes.json()
      const tData = await tRes.json()
      if (cData.error) setError(cData.error)
      setCards(cData.cards || [])
      setTxns(tData.transactions || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load card data.')
    } finally {
      setLoading(false)
    }
  }, [authHeaders])

  useEffect(() => {
    if (authed) loadAll()
  }, [authed, loadAll])

  const issueCard = async () => {
    setError('')
    setIssued(null)
    setLoading(true)
    try {
      const res = await fetch('/api/lithic/cards', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          memo,
          spendLimit: spendLimit ? Number(spendLimit) : undefined,
          spendLimitDuration,
        }),
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setIssued(data)
        if (data.pan) setSimPan(data.pan)
        await loadAll()
      }
    } catch (e: any) {
      setError(e.message || 'Failed to issue card.')
    } finally {
      setLoading(false)
    }
  }

  const simulate = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/lithic/simulate/authorize', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ pan: simPan, amount: Number(simAmount), descriptor: simDescriptor }),
      })
      const data = await res.json()
      if (data.error) setError(data.error)
      else await loadAll()
    } catch (e: any) {
      setError(e.message || 'Failed to simulate transaction.')
    } finally {
      setLoading(false)
    }
  }

  if (!authed) {
    return (
      <div className="solvy-card-page">
        <UnifiedNav />
        <div className="scp-container">
          <div className="scp-header">
            <h1>SOLVY Debit Card</h1>
            <p>Staff access required. Enter your access code to manage card issuing.</p>
          </div>
          <div className="scp-gate">
            {authError && <div className="scp-error">{authError}</div>}
            <label className="scp-form">
              Access code
              <input
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && verify()}
                placeholder="Staff access code"
              />
            </label>
            <button className="scp-btn" onClick={verify} disabled={!code}>
              Unlock
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="solvy-card-page">
      <UnifiedNav />
      <div className="scp-container">
        <div className="scp-header">
          <h1>
            SOLVY Debit Card
            <span className="scp-badge">Sandbox</span>
          </h1>
          <p>Issue and manage virtual debit cards. Sandbox issues test card numbers only.</p>
        </div>

        {error && <div className="scp-error">{error}</div>}

        {configured === false && (
          <div className="scp-panel">
            <h2 className="scp-section-title">Not configured yet</h2>
            <p className="scp-muted">
              Add the sandbox card-issuing API key (the <code>LITHIC_API_KEY</code> secret) to enable
              card issuing.
            </p>
          </div>
        )}

        {configured && (
          <>
            <div className="scp-panel">
              <h2 className="scp-section-title">Issue a new card</h2>
              <div className="scp-form">
                <label>
                  Card label / memo
                  <input value={memo} onChange={(e) => setMemo(e.target.value)} />
                </label>
                <div className="scp-row">
                  <label>
                    Spend limit (USD, optional)
                    <input
                      type="number"
                      value={spendLimit}
                      onChange={(e) => setSpendLimit(e.target.value)}
                      placeholder="e.g. 500"
                    />
                  </label>
                  <label>
                    Limit period
                    <select
                      value={spendLimitDuration}
                      onChange={(e) => setSpendLimitDuration(e.target.value)}
                    >
                      <option value="TRANSACTION">Per transaction</option>
                      <option value="DAILY">Daily</option>
                      <option value="MONTHLY">Monthly</option>
                      <option value="ANNUALLY">Annually</option>
                      <option value="FOREVER">Forever</option>
                    </select>
                  </label>
                </div>
                <button className="scp-btn" onClick={issueCard} disabled={loading}>
                  {loading ? 'Working…' : 'Issue virtual card'}
                </button>
              </div>

              {issued && (
                <div className="scp-credential" style={{ marginTop: '1.25rem' }}>
                  <div>
                    <small>Card number (shown once)</small>
                    <br />
                    <span className="scp-pan">{issued.pan || `•••• ${issued.lastFour}`}</span>
                  </div>
                  <div>
                    <small>Expiry</small> {issued.expMonth}/{issued.expYear} &nbsp;
                    <small>CVV</small> {issued.cvv}
                  </div>
                  <div>
                    <small>Token</small> {issued.token}
                  </div>
                </div>
              )}
            </div>

            <div className="scp-panel">
              <h2 className="scp-section-title">Issued cards</h2>
              {cards.length === 0 ? (
                <p className="scp-muted">No cards issued yet.</p>
              ) : (
                <table className="scp-table">
                  <thead>
                    <tr>
                      <th>Label</th>
                      <th>Last 4</th>
                      <th>State</th>
                      <th>Limit</th>
                      <th>Period</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cards.map((c) => (
                      <tr key={c.token}>
                        <td>{c.memo || '—'}</td>
                        <td>•••• {c.lastFour}</td>
                        <td>
                          <span className={`scp-pill ${(c.state || '').toLowerCase()}`}>
                            {c.state}
                          </span>
                        </td>
                        <td>{money(c.spendLimit)}</td>
                        <td>{c.spendLimitDuration || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="scp-panel">
              <h2 className="scp-section-title">Simulate a transaction (sandbox)</h2>
              <div className="scp-form">
                <label>
                  Card PAN
                  <input
                    value={simPan}
                    onChange={(e) => setSimPan(e.target.value)}
                    placeholder="Issue a card to auto-fill its number"
                  />
                </label>
                <div className="scp-row">
                  <label>
                    Amount (USD)
                    <input
                      type="number"
                      value={simAmount}
                      onChange={(e) => setSimAmount(e.target.value)}
                    />
                  </label>
                  <label>
                    Merchant
                    <input
                      value={simDescriptor}
                      onChange={(e) => setSimDescriptor(e.target.value)}
                    />
                  </label>
                </div>
                <button
                  className="scp-btn scp-btn-ghost"
                  onClick={simulate}
                  disabled={loading || !simPan}
                >
                  Simulate authorization
                </button>
              </div>
            </div>

            <div className="scp-panel">
              <h2 className="scp-section-title">Recent transactions</h2>
              {txns.length === 0 ? (
                <p className="scp-muted">No transactions yet.</p>
              ) : (
                <table className="scp-table">
                  <thead>
                    <tr>
                      <th>Merchant</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {txns.map((t) => (
                      <tr key={t.token}>
                        <td>{t.merchant || '—'}</td>
                        <td>{money(t.amount)}</td>
                        <td>{t.status}</td>
                        <td>{t.result}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default SolvyCard
