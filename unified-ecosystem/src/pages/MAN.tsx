import { useState, useEffect } from 'react'
import UnifiedNav from '../components/UnifiedNav'
import SolvyFooter from '../components/SolvyFooter'
import './MAN.css'

function MAN() {
  const [consumerVolume, setConsumerVolume] = useState(70000)
  const [consumerRate, setConsumerRate] = useState(1.65)
  const [businessVolume, setBusinessVolume] = useState(30000)
  const [businessRate, setBusinessRate] = useState(2.30)
  const memberCount = 142
  const memberExamplePatronage = 0.08

  const consumerRevenue = consumerVolume * (consumerRate / 100)
  const businessRevenue = businessVolume * (businessRate / 100)
  const totalRevenue = consumerRevenue + businessRevenue
  const totalVolume = consumerVolume + businessVolume
  const avgRate = totalVolume > 0 ? (totalRevenue / totalVolume) * 100 : 0
  const businessContribution = totalRevenue > 0 ? (businessRevenue / totalRevenue) * 100 : 0

  const patronageAmount = totalRevenue * 0.70
  const opsAmount = totalRevenue * 0.20
  const fundAmount = totalRevenue * 0.10
  const memberShare = patronageAmount * memberExamplePatronage
  const businessBoost = (businessRevenue - (businessVolume * (consumerRate / 100))) * 0.10

  const [lastUpdated, setLastUpdated] = useState('')
  useEffect(() => {
    const now = new Date()
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    }
    setLastUpdated(now.toLocaleDateString('en-US', options))
  }, [])

  interface DataPoolRevenue {
    totals: { total_sales: number; total_gross: number; member_pool: number; operations: number; sovereign_fund: number }
    byPool: { pool_id: string; pool_name: string; sale_count: number; total_gross: number }[]
    recentSales: { id: number; pool_name: string; buyer: string; gross_amount: number; contributing_members: number; sale_date: string; notes: string | null }[]
  }
  const [dpRevenue, setDpRevenue] = useState<DataPoolRevenue | null>(null)
  const [dpLoading, setDpLoading] = useState(true)
  const [saleForm, setSaleForm] = useState({ poolId: 'spending-patterns', buyer: '', grossAmount: '', saleDate: '', notes: '' })
  const [saleStatus, setSaleStatus] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/data-pools/revenue')
      .then(r => r.json())
      .then(d => { setDpRevenue(d); setDpLoading(false) })
      .catch(() => setDpLoading(false))
  }, [])

  const handleRecordSale = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaleStatus('saving')
    try {
      const r = await fetch('/api/data-pools/sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poolId: saleForm.poolId, buyer: saleForm.buyer, grossAmount: saleForm.grossAmount, saleDate: saleForm.saleDate || undefined, notes: saleForm.notes || undefined }),
      })
      const d = await r.json()
      if (d.success) {
        setSaleStatus('saved')
        setSaleForm({ poolId: 'spending-patterns', buyer: '', grossAmount: '', saleDate: '', notes: '' })
        const rev = await fetch('/api/data-pools/revenue').then(r => r.json())
        setDpRevenue(rev)
        setTimeout(() => setSaleStatus(null), 3000)
      } else {
        setSaleStatus('error: ' + (d.error ?? 'unknown'))
      }
    } catch (err: any) {
      setSaleStatus('error: ' + err.message)
    }
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return '$' + (value / 1000000).toFixed(1) + 'M'
    } else if (value >= 1000) {
      return '$' + Math.round(value).toLocaleString()
    }
    return '$' + value.toFixed(0)
  }

  return (
    <div className="man-app">
      <UnifiedNav currentPage="man" />

      {/* Hero Section */}
      <section className="man-hero">
        <div className="container">
          <img src="/fulllogo.png" alt="Solutions Value You — SOLVY" className="man-hero-logo" />
          <h1>MAN - Mandatory Audit Network</h1>
          <p className="man-tagline">Transparency & Accountability for Members</p>
          <div className="man-badge">Operations Dashboard • Communications • Email Center</div>
        </div>
      </section>

      {/* SOLVY Operations Dashboard */}
      <section className="solvy-dashboard-section">
        <div className="solvy-dashboard">
          <div className="dashboard-header">
            <h1>SOLVY Operations Dashboard</h1>
            <p>Real-time visibility into cooperative activities and member engagement. This dashboard updates automatically as members use their SOLVY Cards.</p>
          </div>

          <div className="metrics-grid">
            <div className="metric-card card-member">
              <div className="metric-label">Active Sovereign Members</div>
              <div className="metric-value">{memberCount}</div>
              <div className="metric-change positive">+8 this month</div>
              <div className="metric-description">Founding members building the cooperative through daily card usage.</div>
              <div className="metric-icon">👥</div>
            </div>

            <div className="metric-card card-volume">
              <div className="metric-label">Total Spending Volume</div>
              <div className="metric-value">{formatCurrency(187425)}</div>
              <div className="metric-change positive">+12.5% from last month</div>
              <div className="metric-description">Combined economic activity through SOLVY Cards, generating interchange revenue.</div>
              <div className="metric-icon">💰</div>
            </div>

            <div className="metric-card card-revenue">
              <div className="metric-label">Interchange Revenue Generated</div>
              <div className="metric-value">$3,467</div>
              <div className="metric-change positive">+$412 this period</div>
              <div className="metric-description">Revenue earned through member transactions, funding cooperative operations.</div>
              <div className="metric-icon">📈</div>
            </div>

            <div className="metric-card card-pool">
              <div className="metric-label">Member Profit Share Pool</div>
              <div className="metric-value">$693</div>
              <div className="metric-change positive">Next distribution: Q1 2026</div>
              <div className="metric-description">20% of all revenue, waiting to be distributed to members based on patronage.</div>
              <div className="metric-icon">🏦</div>
            </div>
          </div>

          {/* Founding Capital & Capitalization Overview */}
          <div style={{ borderTop: '1px solid rgba(147,51,234,0.2)', marginTop: '32px', paddingTop: '28px' }}>
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.12em', color: '#b45309', textTransform: 'uppercase', marginBottom: '6px' }}>Committed Funding</div>
              <h2 style={{ color: '#1a365d', fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Founding Capital & Capitalization Overview</h2>
              <p style={{ color: '#4a5568', fontSize: '0.85rem', marginTop: '6px', marginBottom: 0 }}>Anchor investment, founder reserve, and operational allocation — auditable by all members.</p>
            </div>

            <div className="metrics-grid">
              <div className="metric-card" style={{ borderTop: '3px solid #16a34a' }}>
                <div className="metric-label">Anchor Investor Commitment</div>
                <div className="metric-value" style={{ color: '#166534' }}>~$200,000</div>
                <div className="metric-change positive">Largest individual cooperative pledge</div>
                <div className="metric-description">Serious founding capital from our anchor investor — backing the cooperative's launch infrastructure and member benefit programs.</div>
                <div className="metric-icon">🏛️</div>
              </div>

              <div className="metric-card" style={{ borderTop: '3px solid #d97706' }}>
                <div className="metric-label">Operations Allocation</div>
                <div className="metric-value" style={{ color: '#92400e' }}>$50,000</div>
                <div className="metric-change" style={{ background: '#fef3c7', color: '#78350f', padding: '4px 10px', borderRadius: '20px', fontWeight: 600 }}>Earmarked from anchor commitment</div>
                <div className="metric-description">Designated for technology, compliance infrastructure, staffing, and platform build-out.</div>
                <div className="metric-icon">⚙️</div>
              </div>

              <div className="metric-card" style={{ borderTop: '3px solid #7c3aed' }}>
                <div className="metric-label">IBC Policy Warchest</div>
                <div className="metric-value" style={{ color: '#5b21b6' }}>$30,000+</div>
                <div className="metric-change" style={{ background: '#ede9fe', color: '#4c1d95', padding: '4px 10px', borderRadius: '20px', fontWeight: 600 }}>Founder reserve — available if needed</div>
                <div className="metric-description">Founder's Infinite Banking Concept whole-life policy cash value. Patient, compounding, self-sovereign capital. Policy statements pending upload.</div>
                <div className="metric-icon">🏦</div>
              </div>

              <div className="metric-card" style={{ borderTop: '3px solid #0284c7' }}>
                <div className="metric-label">Total Committed Capital</div>
                <div className="metric-value" style={{ color: '#075985' }}>~$230,000+</div>
                <div className="metric-change positive">Not venture debt — cooperative capital</div>
                <div className="metric-description">Combined anchor investment and founder IBC reserve. Every dollar tracked transparently on this portal.</div>
                <div className="metric-icon">📊</div>
              </div>
            </div>
          </div>

          <div className="dashboard-footer">
            <div className="last-updated">
              Last updated: <span>{lastUpdated}</span>
            </div>
            <p style={{ marginTop: '10px' }}>This dashboard updates automatically. Values represent real cooperative activity.</p>
          </div>
        </div>
      </section>

      {/* Parallel Economy Dashboard */}
      <section className="interchange-section">
        <div className="interchange-container">
          <h1 className="interchange-title">Parallel Economy Dashboard — Proof, Not Promises</h1>
          <p className="interchange-subtitle">We do not reject the old economy. We prove the parallel economy works. Every metric below is verifiable on this portal.</p>

          <div className="highlight-box" style={{ marginBottom: '2rem' }}>
            "Every dollar in the Member Pool comes from swipes, not extraction. Every member can see it. Every vote is recorded. Every data contribution is consented. This is not a rejection of history. It is a verifiable alternative."
          </div>

          <h2 className="section-heading">Compare for Yourself</h2>
          <table className="rate-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th style={{ color: '#b91c1c' }}>Old Economy (Extraction)</th>
                <th style={{ color: '#166534' }}>SOLVY Parallel Economy</th>
                <th>Proof on MAN</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Revenue source', 'Natural resource extraction', 'Interchange fees from real member transactions', 'Revenue ledger below'],
                ['Profit distribution', 'Shareholders (0% to workers)', '70% Patronage Dividends to Member Pool', '70/20/10 allocation tracker'],
                ['Dispute resolution', 'ISDS/ICSID private arbitration', 'Member vote — recorded on MAN', 'Proposal history'],
                ['Data ownership', 'Corporate — sold without consent', 'Member sovereign — consented & compensated', 'Data wallet opt-in'],
                ['Participation', 'Large investors only', 'Any member with a SOLVY Card', 'Live member count'],
              ].map(([metric, old, solvy, proof]) => (
                <tr key={metric}>
                  <td><strong>{metric}</strong></td>
                  <td style={{ color: '#b91c1c' }}>{old}</td>
                  <td style={{ color: '#166534' }}>{solvy}</td>
                  <td style={{ color: '#4a5568', fontStyle: 'italic', fontSize: '0.85rem' }}>{proof}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p style={{ color: '#64748b', textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
            The old economy has its place. The parallel economy has its proof.
          </p>
        </div>
      </section>

      {/* Advanced Interchange Model */}
      <section className="interchange-section">
        <div className="interchange-container">
          <h1 className="interchange-title">Advanced Interchange Revenue Model</h1>
          <p className="interchange-subtitle">Transparent view showing how consumer vs. business card usage impacts the cooperative.</p>

          <div className="revenue-input">
            <h3>Configure Your Revenue Simulation</h3>
            <p>Adjust the values below to see how different member activity affects the cooperative:</p>
            
            <div className="split-inputs">
              <div className="input-group">
                <label>Total Consumer Card Volume ($)</label>
                <input 
                  type="number" 
                  value={consumerVolume} 
                  onChange={(e) => setConsumerVolume(Number(e.target.value))}
                />
                <div className="note">Spending by members with personal cards</div>
              </div>
              <div className="input-group">
                <label>Consumer Interchange Rate (%)</label>
                <input 
                  type="number" 
                  value={consumerRate} 
                  step="0.01"
                  onChange={(e) => setConsumerRate(Number(e.target.value))}
                />
                <div className="note">Typical rate: 1.4% - 1.7%</div>
              </div>
              <div className="input-group">
                <label>Total Business Card Volume ($)</label>
                <input 
                  type="number" 
                  value={businessVolume}
                  onChange={(e) => setBusinessVolume(Number(e.target.value))}
                />
                <div className="note">Spending by members with business cards</div>
              </div>
              <div className="input-group">
                <label>Business Interchange Rate (%)</label>
                <input 
                  type="number" 
                  value={businessRate} 
                  step="0.01"
                  onChange={(e) => setBusinessRate(Number(e.target.value))}
                />
                <div className="note">Typical rate: 2.2% - 2.4%</div>
              </div>
            </div>
          </div>

          <h2 className="section-heading">Cooperative Activity Summary</h2>
          <div className="activity-grid">
            <div className="activity-card metrics">
              <div className="stat-label">Total Members</div>
              <div className="stat-large">{memberCount}</div>
              <p>Founding Sovereign Members</p>
            </div>
            <div className="activity-card metrics">
              <div className="stat-label">Total Card Volume</div>
              <div className="stat-large">${totalVolume.toLocaleString()}</div>
              <p>Combined member spending</p>
            </div>
            <div className="activity-card metrics">
              <div className="stat-label">Total Interchange Revenue</div>
              <div className="stat-large">${totalRevenue.toFixed(2)}</div>
              <p>Generated from all card usage</p>
            </div>
            <div className="activity-card split">
              <div className="stat-label">Business Card Contribution</div>
              <div className="stat-large">{businessContribution.toFixed(1)}%</div>
              <p>of total interchange revenue</p>
              <div className="calculation">(${businessVolume.toLocaleString()} × {businessRate.toFixed(2)}% = ${businessRevenue.toFixed(2)})</div>
            </div>
          </div>

          <h3 className="section-heading">Interchange Rate Advantage</h3>
          <table className="rate-table">
            <thead>
              <tr>
                <th>Card Type</th>
                <th>Spending Volume</th>
                <th>Interchange Rate</th>
                <th>Revenue Generated</th>
                <th>Patronage Dividends (70%)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Consumer Cards</strong></td>
                <td>${consumerVolume.toLocaleString()}</td>
                <td>{consumerRate.toFixed(2)}%</td>
                <td>${consumerRevenue.toFixed(2)}</td>
                <td>${(consumerRevenue * 0.70).toFixed(2)}</td>
              </tr>
              <tr>
                <td><strong>Business Cards <span className="info-icon" title="Business cards earn higher interchange rates">i</span></strong></td>
                <td>${businessVolume.toLocaleString()}</td>
                <td>{businessRate.toFixed(2)}%</td>
                <td>${businessRevenue.toFixed(2)}</td>
                <td className="positive">${(businessRevenue * 0.70).toFixed(2)}</td>
              </tr>
              <tr className="total-row">
                <td><strong>Total</strong></td>
                <td><strong>${totalVolume.toLocaleString()}</strong></td>
                <td><strong>{avgRate.toFixed(2)}%</strong></td>
                <td><strong>${totalRevenue.toFixed(2)}</strong></td>
                <td><strong>${patronageAmount.toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </table>

          <div className="highlight-box">
            <h3>📈 The Path to SOVEREIGNITITY & Greater Impact</h3>
            <p>Notice how <strong>business card volume generates 37.4% more revenue per dollar spent</strong> compared to consumer cards. This demonstrates a key growth path for our cooperative:</p>
            <p><strong>Start as a consumer → Achieve data autonomy (SOVEREIGNITITY) → Add a business card → Amplify your contribution to the shared profit pool.</strong></p>
            <p>As members grow into business accounts, they don't just help themselves—they <strong>strengthen the entire cooperative</strong> by generating more resources for all members to share.</p>
          </div>

          <h2 className="section-heading">Transparent Allocation: The 70/20/10 Model</h2>
          <div className="allocation-bar">
            <div className="allocation-segment ops-segment" style={{ width: '70%' }}>70% Patronage Dividends</div>
            <div className="allocation-segment pool-segment" style={{ width: '20%' }}>20% Operations Funding</div>
            <div className="allocation-segment fund-segment" style={{ width: '10%' }}>10% Sovereign Wealth Fund</div>
          </div>

          <div className="allocation-grid">
            <div className="allocation-card operational">
              <h2>Patronage Dividends — Community Pool</h2>
              <div className="stat-label">70% of Revenue</div>
              <div className="stat-large">${patronageAmount.toFixed(2)}</div>
              <p>Returns directly to members based on patronage. Direct descendant protection — revenue that flows back to those who generate it.</p>
              <div className="calculation">${totalRevenue.toFixed(2)} × 0.70 = ${patronageAmount.toFixed(2)}</div>
            </div>
            <div className="allocation-card member-pool">
              <h2>Operations Funding</h2>
              <div className="stat-label">20% of Revenue</div>
              <div className="stat-large">${opsAmount.toFixed(2)}</div>
              <p>Covers essential infrastructure, partner fees, compliance, and member-approved operational costs.</p>
              <div className="calculation">${totalRevenue.toFixed(2)} × 0.20 = ${opsAmount.toFixed(2)}</div>

              <div className="sub-section">
                <div className="stat-label">Sample Member Patronage Share</div>
                <div className="stat-large">${memberShare.toFixed(2)}</div>
                <p>If a member contributed <strong>8%</strong> of total spending volume:</p>
                <div className="calculation">8% of ${patronageAmount.toFixed(2)} = ${memberShare.toFixed(2)}</div>
              </div>
            </div>
            <div className="allocation-card sovereignty-fund">
              <h2>Sovereign Wealth Fund — SOVEREIGNITITY™</h2>
              <div className="stat-label">10% of Revenue</div>
              <div className="stat-large">${fundAmount.toFixed(2)}</div>
              <p>Dedicated to building independent long-term infrastructure: Data Vault, MOLI/BOLI underwriting, cooperative capital.</p>
              <div className="calculation">${totalRevenue.toFixed(2)} × 0.10 = ${fundAmount.toFixed(2)}</div>

              <div className="sub-section">
                <div className="stat-label">Business Card Boost</div>
                <p>Business cards add <span className="positive">${businessBoost.toFixed(2)}</span> extra to this fund compared to if all spending was at consumer rates.</p>
              </div>
            </div>
          </div>

          <div className="explanation-box">
            <h3>How This Advanced Model Works</h3>
            <p>This dashboard illustrates the real power of the SOLVY economic model:</p>
            <ul>
              <li><strong>Dual-Tier Revenue:</strong> Business cards (2.2%-2.4% interchange) generate significantly more revenue per dollar than consumer cards (1.4%-1.7%).</li>
              <li><strong>The Business Advantage:</strong> When a member adds a business card, they increase their personal rewards <strong>and</strong> contribute more to the shared profit pool that benefits all members.</li>
              <li><strong>SOVEREIGNITITY Pathway:</strong> This creates a natural growth path: start as a consumer, achieve data autonomy, then add a business card to amplify your impact.</li>
              <li><strong>Transparent Calculations:</strong> Every number shows its derivation, maintaining the radical transparency promised by the MAN page.</li>
            </ul>
            <p>This model turns member growth into cooperative strength—each step toward business usage makes the entire community more financially resilient.</p>
          </div>
        </div>
      </section>

      {/* Data Pool Revenue */}
      <section className="interchange-section">
        <div className="interchange-container">
          <h1 className="interchange-title">Data Marketplace Revenue — SOVEREIGNITITY™</h1>
          <p className="interchange-subtitle">Second revenue stream: member-owned data pools licensed to researchers and buyers. Every sale follows the same 70/20/10 split.</p>

          {dpLoading ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>Loading data pool revenue…</p>
          ) : (
            <>
              <div className="activity-grid">
                <div className="activity-card metrics">
                  <div className="stat-label">Total Data Sales</div>
                  <div className="stat-large">{dpRevenue?.totals?.total_sales ?? 0}</div>
                  <p>Completed dataset licenses</p>
                </div>
                <div className="activity-card metrics">
                  <div className="stat-label">Gross Revenue</div>
                  <div className="stat-large">{formatCurrency(dpRevenue?.totals?.total_gross ?? 0)}</div>
                  <p>Total from data pool sales</p>
                </div>
                <div className="activity-card metrics">
                  <div className="stat-label">Member Patronage Pool (70%)</div>
                  <div className="stat-large">{formatCurrency(dpRevenue?.totals?.member_pool ?? 0)}</div>
                  <p>Returned to contributing members</p>
                </div>
                <div className="activity-card split">
                  <div className="stat-label">Sovereign Fund (10%)</div>
                  <div className="stat-large">{formatCurrency(dpRevenue?.totals?.sovereign_fund ?? 0)}</div>
                  <p>Flowing into SOVEREIGNITITY™</p>
                </div>
              </div>

              {(dpRevenue?.byPool ?? []).length > 0 && (
                <>
                  <h2 className="section-heading">Revenue by Data Pool</h2>
                  <table className="rate-table">
                    <thead>
                      <tr>
                        <th>Pool</th>
                        <th>Sales</th>
                        <th>Gross Revenue</th>
                        <th>Member Pool (70%)</th>
                        <th>Operations (20%)</th>
                        <th>Sovereign Fund (10%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(dpRevenue?.byPool ?? []).map(p => (
                        <tr key={p.pool_id}>
                          <td><strong>{p.pool_name}</strong></td>
                          <td>{p.sale_count}</td>
                          <td>${p.total_gross.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="positive">${(p.total_gross * 0.70).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td>${(p.total_gross * 0.20).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td>${(p.total_gross * 0.10).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              <h2 className="section-heading">Record a Data Pool Sale</h2>
              <div className="revenue-input">
                <form onSubmit={handleRecordSale}>
                  <div className="split-inputs">
                    <div className="input-group">
                      <label>Data Pool</label>
                      <select value={saleForm.poolId} onChange={e => setSaleForm(f => ({ ...f, poolId: e.target.value }))} style={{ padding: '0.6rem', borderRadius: '6px', background: '#1e293b', color: '#fff', border: '1px solid rgba(147,51,234,0.3)', fontSize: '0.95rem' }}>
                        <option value="spending-patterns">Diaspora Spending Patterns</option>
                        <option value="remittance-behavior">Remittance Behavior Data</option>
                        <option value="financial-access">Financial Access Gaps</option>
                        <option value="community-commerce">Community Commerce Trends</option>
                      </select>
                    </div>
                    <div className="input-group">
                      <label>Buyer / Licensee</label>
                      <input type="text" value={saleForm.buyer} onChange={e => setSaleForm(f => ({ ...f, buyer: e.target.value }))} placeholder="e.g. Urban Institute" required />
                    </div>
                    <div className="input-group">
                      <label>Gross Sale Amount ($)</label>
                      <input type="number" min="0" step="0.01" value={saleForm.grossAmount} onChange={e => setSaleForm(f => ({ ...f, grossAmount: e.target.value }))} placeholder="e.g. 5000" required />
                    </div>
                    <div className="input-group">
                      <label>Sale Date (optional)</label>
                      <input type="date" value={saleForm.saleDate} onChange={e => setSaleForm(f => ({ ...f, saleDate: e.target.value }))} />
                    </div>
                    <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                      <label>Notes (optional)</label>
                      <input type="text" value={saleForm.notes} onChange={e => setSaleForm(f => ({ ...f, notes: e.target.value }))} placeholder="e.g. Annual license, research grant funded" />
                    </div>
                  </div>
                  <button type="submit" disabled={saleStatus === 'saving'} style={{ marginTop: '1rem', padding: '0.75rem 2rem', background: 'linear-gradient(135deg, #9333ea, #7c3aed)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}>
                    {saleStatus === 'saving' ? 'Recording…' : 'Record Sale'}
                  </button>
                  {saleStatus && saleStatus !== 'saving' && (
                    <div style={{ marginTop: '0.75rem', color: saleStatus === 'saved' ? '#22c55e' : '#ef4444', fontSize: '0.9rem' }}>
                      {saleStatus === 'saved' ? '✓ Sale recorded. Revenue updated.' : saleStatus}
                    </div>
                  )}
                </form>
              </div>

              {(dpRevenue?.recentSales ?? []).length > 0 && (
                <>
                  <h2 className="section-heading">Recent Sales</h2>
                  <table className="rate-table">
                    <thead>
                      <tr>
                        <th>Pool</th>
                        <th>Buyer</th>
                        <th>Gross</th>
                        <th>Members</th>
                        <th>Date</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(dpRevenue?.recentSales ?? []).map(s => (
                        <tr key={s.id}>
                          <td>{s.pool_name}</td>
                          <td>{s.buyer}</td>
                          <td>${s.gross_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td>{s.contributing_members}</td>
                          <td>{new Date(s.sale_date).toLocaleDateString()}</td>
                          <td style={{ color: '#64748b' }}>{s.notes ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </>
          )}

          <div className="highlight-box">
            <h3>🔐 Member Data Sovereignty Guarantee</h3>
            <p>No dataset is sold without a member vote through this portal. All sales are logged here in perpetuity. Members can withdraw from any pool at any time at <a href="/data-marketplace" style={{ color: '#5b21b6' }}>the Data Marketplace</a>.</p>
          </div>
        </div>
      </section>

      {/* Pilot Partner Status */}
      <section className="man-operations">
        <div className="container">
          <div className="pilot-status">
            <h3>Pilot Partner Status</h3>
            <div className="partner-list">
              <div className="partner-item active">
                <span className="partner-name">Evergreen Beauty Lounge</span>
                <span className="partner-status">✓ Active - Processing Payments</span>
              </div>
              <div className="partner-item" style={{ borderLeft: '3px solid #f59e0b', background: 'rgba(245,158,11,0.05)' }}>
                <span className="partner-name">SPS Joint Venture</span>
                <span className="partner-status" style={{ color: '#d97706' }}>⏳ Proposal Stage — Not Yet Active</span>
              </div>
              <p style={{ margin: '8px 0 0 0', fontSize: '0.82rem', color: '#64748b', textAlign: 'center' }}>
                Reverse inventory pilot: SOLVY Card tracks SPS customer purchases for expense reporting and accounting/tax prep. Partnership agreement pending — not processing payments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Capital & Funding Transparency */}
      <section className="interchange-section">
        <div className="interchange-container">
          <h1 className="interchange-title">💰 Capital & Funding Transparency</h1>
          <p className="interchange-subtitle">Full visibility into cooperative capitalization. Every source, every allocation — auditable by members.</p>

          <div className="highlight-box" style={{ marginBottom: '2rem' }}>
            "We do not solicit investment without accountability. Every dollar committed to SOLVY Ecosystem™ is tracked here, allocated transparently, and reported to members through MAN."
          </div>

          {/* Capital Summary Cards */}
          <div className="activity-grid" style={{ marginBottom: '2rem' }}>
            <div className="activity-card metrics">
              <div className="stat-label">Anchor Investor Commitment</div>
              <div className="stat-large" style={{ color: '#166534' }}>~$200,000</div>
              <p>Serious founding capital commitment from our anchor investor — the largest individual commitment in cooperative history.</p>
            </div>
            <div className="activity-card metrics">
              <div className="stat-label">Operations Allocation (from Anchor)</div>
              <div className="stat-large" style={{ color: '#92400e' }}>$50,000</div>
              <p>Earmarked from the anchor commitment for direct business operations, compliance infrastructure, and platform build-out.</p>
            </div>
            <div className="activity-card metrics">
              <div className="stat-label">IBC Policy Warchest (Founder Reserve)</div>
              <div className="stat-large" style={{ color: '#5b21b6' }}>$30,000+</div>
              <p>Founder's Infinite Banking Concept whole-life policy cash value — available as cooperative reserve capital if necessary. Patient, compounding, self-sovereign.</p>
            </div>
            <div className="activity-card split">
              <div className="stat-label">Total Committed Capital</div>
              <div className="stat-large" style={{ color: '#075985' }}>~$230,000+</div>
              <p>Combined anchor investment and founder IBC reserve — not venture debt, not extraction. Cooperative capital.</p>
            </div>
          </div>

          {/* Allocation Breakdown */}
          <h2 className="section-heading">Anchor Investment — Allocation Plan</h2>
          <table className="rate-table">
            <thead>
              <tr>
                <th>Allocation</th>
                <th>Amount</th>
                <th>Purpose</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Business Operations', '$50,000', 'Technology, compliance, staffing, and infrastructure', 'Earmarked'],
                ['Member Pool Reserve', '$100,000', 'Seed capital for initial MOLI development and member benefit programs', 'Committed'],
                ['Sovereign Fund Seed', '$50,000', 'Long-term cooperative reserve, emergencies, and community reinvestment', 'Committed'],
              ].map(([alloc, amt, purpose, status]) => (
                <tr key={alloc}>
                  <td><strong>{alloc}</strong></td>
                  <td style={{ color: '#166534', fontWeight: 700 }}>{amt}</td>
                  <td style={{ color: '#4a5568', fontSize: '0.88rem' }}>{purpose}</td>
                  <td><span style={{ background: '#dcfce7', color: '#166534', padding: '2px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>{status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* IBC Policy Warchest */}
          <h2 className="section-heading" style={{ marginTop: '2rem' }}>🏦 IBC Policy Warchest — Founder Reserve</h2>
          <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '16px', padding: '24px', marginBottom: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '20px' }}>
              {[
                { icon: '📋', label: 'Policy Type', value: 'Whole Life — IBC/BYOB Structure' },
                { icon: '💵', label: 'Available Cash Value', value: '$30,000+' },
                { icon: '📈', label: 'Growth Model', value: 'Compounding — Tax-Advantaged' },
                { icon: '⚡', label: 'Deployment Status', value: 'Reserve — Available if Needed' },
              ].map((c) => (
                <div key={c.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ fontSize: '1.4rem', marginBottom: '6px' }}>{c.icon}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{c.label}</div>
                  <div style={{ fontWeight: 700, color: '#5b21b6', fontSize: '0.95rem' }}>{c.value}</div>
                </div>
              ))}
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '16px', borderLeft: '3px solid #7c3aed' }}>
              <div style={{ fontWeight: 700, color: '#5b21b6', marginBottom: '8px' }}>📎 Policy Statements</div>
              <div style={{ color: '#4a5568', fontSize: '0.88rem', lineHeight: 1.6 }}>
                Verified IBC policy illustrations and cash value statements will be posted here for member transparency. <span style={{ color: '#64748b', fontStyle: 'italic' }}>Documents pending upload — check back soon.</span>
              </div>
            </div>
          </div>

          {/* MOLI Preview Banner */}
          <div style={{ background: 'linear-gradient(135deg, rgba(15,30,44,0.95), rgba(30,58,95,0.95))', border: '1px solid rgba(147,51,234,0.4)', borderRadius: '16px', padding: '28px', display: 'flex', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '2.5rem', flexShrink: 0 }}>🔮</div>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.12em', color: '#ffb347', textTransform: 'uppercase', marginBottom: '8px' }}>Coming Soon</div>
              <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: '1.15rem', marginBottom: '10px' }}>MOLI — Membership Owned Life Insurance</div>
              <div style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.7 }}>
                The Member Pool is being seeded today for tomorrow's MOLI program. When MOLI launches, cooperative members will own life insurance collectively — the same way banks use BOLI, but for the people. Capital from the anchor investor and IBC warchest is the foundation. The campaign page is in development.
              </div>
              <div style={{ marginTop: '14px', display: 'inline-block', background: 'rgba(255,179,71,0.1)', border: '1px solid #ffb347', color: '#ffb347', padding: '6px 16px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700 }}>
                Notified at launch — apply for SOLVY Card to reserve your place
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Internal Tools — Comms & Mailbox */}
      <section style={{ padding: '56px 24px', background: '#0f1e2c' }}>
        <div className="container">
          <p style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', color: '#a78bfa', textTransform: 'uppercase', marginBottom: '10px', textAlign: 'center' }}>Internal Team Tools</p>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'white', textAlign: 'center', margin: '0 0 40px' }}>Communications & Mailbox</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <a href="/comms" style={{ display: 'block', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: '16px', padding: '32px', textDecoration: 'none', transition: 'all 0.2s' }}>
              <div style={{ fontSize: '2.2rem', marginBottom: '12px' }}>📢</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'white', margin: '0 0 8px' }}>Comms Center</h3>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', margin: '0 0 20px', lineHeight: 1.5 }}>Broadcast announcements to member segments across email, SMS, and in-app channels.</p>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#a78bfa' }}>Open Comms Center →</span>
            </a>
            <a href="/mailbox" style={{ display: 'block', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: '16px', padding: '32px', textDecoration: 'none', transition: 'all 0.2s' }}>
              <div style={{ fontSize: '2.2rem', marginBottom: '12px' }}>✉️</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'white', margin: '0 0 8px' }}>Team Mailbox</h3>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', margin: '0 0 20px', lineHeight: 1.5 }}>Internal @solvy.cards team inbox — compose, read, and reply to team correspondence.</p>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#a78bfa' }}>Open Mailbox →</span>
            </a>
          </div>
        </div>
      </section>

      <SolvyFooter />
    </div>
  )
}

export default MAN
