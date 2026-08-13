import { useState } from 'react'
import UnifiedNav from '../components/UnifiedNav'
import SolvyFooter from '../components/SolvyFooter'

type Tab = 'overview' | 'boli' | 'howItWorks' | 'benefits'

export default function MOLI() {
  const [tab, setTab] = useState<Tab>('overview')

  return (
    <div style={s.page}>
      <UnifiedNav />

      {/* Development Banner */}
      <div style={s.devBanner}>
        <span style={s.devDot} />
        MOLI — Feature in Development · Internal Preview Only
      </div>

      {/* Hero */}
      <section style={s.hero}>
        <p style={s.heroEyebrow}>Membership Owned Life Insurance</p>
        <h1 style={s.heroTitle}>
          <span style={s.heroAccent}>MOLI</span>
        </h1>
        <p style={s.heroSub}>
          Democratizing the wealth-building strategies that banks and corporations have used for
          decades. Now available to SOLVY members through cooperative ownership and shared benefits.
        </p>
      </section>

      {/* Executive Summary */}
      <section style={s.section}>
        <div style={s.container}>
          <p style={s.sectionEyebrow}>⭐ Real-World IBC/BYOB Success</p>
          <h2 style={s.sectionHeading}>IBC/BYOB Progress Report — Proof of Concept for MOLI</h2>
          <p style={s.sectionSub}>Prepared for: SOLVY Ecosystem / DECIDEY Education · April 2026</p>

          {/* Summary tiles */}
          <div style={s.summaryTiles}>
            {[
              { label: 'Combined Premiums Paid', value: '~$40,000', sub: '12 months · Sean + Evergreen', color: '#a78bfa' },
              { label: 'Combined Available Loan Value', value: '$28,885', sub: 'Live as of Apr 24, 2026', color: '#4ade80' },
              { label: 'Combined Loan Balance', value: '$43.63', sub: 'Nearly fully paid off', color: '#fbbf24' },
              { label: 'Loan Rate', value: '5.37%', sub: 'Variable · OneAmerica', color: '#38bdf8' },
            ].map(t => (
              <div key={t.label} style={{ ...s.summaryTile, borderColor: t.color + '40' }}>
                <div style={{ ...s.tileValue, color: t.color }}>{t.value}</div>
                <div style={s.tileLabel}>{t.label}</div>
                <div style={s.tileSub}>{t.sub}</div>
              </div>
            ))}
          </div>

          {/* Two policy cards side by side */}
          <div style={s.policyGrid}>

            {/* Sean's policy */}
            <div style={s.policyCard}>
              <div style={s.policyCardHeader}>
                <div>
                  <p style={s.policyCardEyebrow}>Policy Holder</p>
                  <h3 style={s.policyCardName}>Sean Mayo</h3>
                </div>
                <div style={s.policyBadge}>Active</div>
              </div>
              <div style={s.policyMeta}>
                OneAmerica · Jason Sipple (Chris Naugle's group)
              </div>

              {/* Live availability callout */}
              <div style={s.availableBanner}>
                <div style={s.availableLabel}>Available to Borrow Now</div>
                <div style={s.availableValue}>$17,188.26</div>
                <div style={s.availableDate}>As of Apr 24, 2026 · Balance owed: $33.55</div>
              </div>

              <div style={s.resultRows}>
                {[
                  { label: 'Initial PUA Investment', value: '$8,000', sub: 'July 2025 · Day 1' },
                  { label: 'Day 1 Loan Value', value: '$7,700', sub: '96.25% immediately available' },
                  { label: 'After First Payment', value: '$8,400', sub: '+$700 growth in month 1' },
                  { label: 'Total Premiums (12 mo)', value: '~$27,000' },
                  { label: 'Total Loans Drawn', value: '~$14,500', sub: 'Deployed & reinvested' },
                  { label: 'Outstanding Balance', value: '$33.55', sub: 'Nearly fully cleared', highlight: true },
                ].map(r => (
                  <div key={r.label} style={s.resultRow}>
                    <div>
                      <div style={s.resultLabel}>{r.label}</div>
                      {r.sub && <div style={s.resultSub}>{r.sub}</div>}
                    </div>
                    <span style={r.highlight ? s.resultValueGreen : s.resultValue}>{r.value}</span>
                  </div>
                ))}
              </div>

              <div style={s.loanTimeline}>
                <p style={s.loanTimelineTitle}>Loan History</p>
                {[
                  { date: 'Aug 25, 2025', amount: '$8,000', note: 'First major draw' },
                  { date: 'Nov 14, 2025', amount: '$2,357', note: 'Reinvestment cycle #2' },
                  { date: 'Feb 19, 2026', amount: '$4,000', note: 'Reinvestment cycle #3' },
                ].map(l => (
                  <div key={l.date} style={s.loanRow}>
                    <div style={s.loanDot} />
                    <div style={s.loanInfo}>
                      <span style={s.loanDate}>{l.date}</span>
                      <span style={s.loanNote}> · {l.note}</span>
                    </div>
                    <span style={s.loanAmt}>{l.amount}</span>
                  </div>
                ))}
              </div>

              <div style={s.policyNote}>
                <strong>Pattern:</strong> $315/mo regular + $685/mo PUA rider = $1,000/mo.
                April 2026: additional $3,415 PUA lump sum added. Interest: 5.37% Variable (Advance).
              </div>
            </div>

            {/* Evergreen's policy */}
            <div style={s.policyCard}>
              <div style={s.policyCardHeader}>
                <div>
                  <p style={s.policyCardEyebrow}>Policy Holder</p>
                  <h3 style={s.policyCardName}>Evergreen Beauty Lounge</h3>
                </div>
                <div style={s.policyBadge}>Active</div>
              </div>
              <div style={s.policyMeta}>
                OneAmerica · EBL Pilot #1 · SOLVY Cooperative
              </div>

              {/* Live availability callout */}
              <div style={s.availableBanner}>
                <div style={s.availableLabel}>Available to Borrow Now</div>
                <div style={s.availableValue}>$11,697.64</div>
                <div style={s.availableDate}>As of Apr 24, 2026 · Balance owed: $10.08</div>
              </div>

              <div style={s.resultRows}>
                {[
                  { label: 'Regular Monthly Premium', value: '$350/mo', sub: 'Consistent since Sep 2025' },
                  { label: 'PUA Additions', value: '$525–$7,275', sub: 'Accelerating growth' },
                  { label: 'Total Premiums (12 mo)', value: '~$13,000' },
                  { label: 'Total Loans Drawn', value: '~$6,250', sub: 'Deployed & reinvested' },
                  { label: 'Apr 2026 PUA Deposit', value: '$7,275', sub: 'Largest deposit to date' },
                  { label: 'Outstanding Balance', value: '$10.08', sub: 'Nearly fully cleared', highlight: true },
                ].map(r => (
                  <div key={r.label} style={s.resultRow}>
                    <div>
                      <div style={s.resultLabel}>{r.label}</div>
                      {r.sub && <div style={s.resultSub}>{r.sub}</div>}
                    </div>
                    <span style={r.highlight ? s.resultValueGreen : s.resultValue}>{r.value}</span>
                  </div>
                ))}
              </div>

              <div style={s.loanTimeline}>
                <p style={s.loanTimelineTitle}>Loan History</p>
                {[
                  { date: 'Nov 14, 2025', amount: '$2,395', note: 'First draw' },
                  { date: 'Nov 14, 2025', amount: '$2,357', note: 'Same-day reinvest' },
                  { date: 'Feb 19, 2026', amount: '$1,500', note: 'Reinvestment cycle #3' },
                ].map(l => (
                  <div key={l.date + l.amount} style={s.loanRow}>
                    <div style={s.loanDot} />
                    <div style={s.loanInfo}>
                      <span style={s.loanDate}>{l.date}</span>
                      <span style={s.loanNote}> · {l.note}</span>
                    </div>
                    <span style={s.loanAmt}>{l.amount}</span>
                  </div>
                ))}
              </div>

              <div style={s.policyNote}>
                <strong>Pattern:</strong> $350/mo regular + $525/mo unscheduled PUA.
                April 2026: $7,275 major PUA lump sum — largest deposit to date. Interest: 5.37% Variable (Advance).
              </div>
            </div>
          </div>

          {/* PUA Section */}
          <div style={s.puaBlock}>
            <div style={s.puaBlockLeft}>
              <h3 style={s.puaTitle}>The Power of PUA (Paid Up Additions)</h3>
              {[
                { icon: '✅', title: 'Immediate Access', body: '96.25% of investment available as loan — no bank, no credit check' },
                { icon: '✅', title: 'Compound Growth', body: 'Cash value increases with every premium paid' },
                { icon: '✅', title: 'Premium Recycling', body: 'Borrow against your own cash value to fund future premiums' },
                { icon: '✅', title: 'Tax Advantages', body: 'Tax-free loans, tax-deferred growth, tax-free death benefits' },
              ].map(f => (
                <div key={f.title} style={s.puaRow}>
                  <span style={s.puaIcon}>{f.icon}</span>
                  <div>
                    <strong style={s.puaItemTitle}>{f.title}:</strong>
                    <span style={s.puaItemBody}> {f.body}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={s.puaBlockRight}>
              <h3 style={s.puaTitle}>The Cycle — Proven Over 12 Months</h3>
              <div style={s.cycleSteps}>
                {[
                  { step: '1', label: 'Pay Premium', detail: 'Regular + PUA monthly contributions' },
                  { step: '2', label: 'Build Cash Value', detail: 'Tax-deferred, guaranteed growth' },
                  { step: '3', label: 'Take Policy Loan', detail: 'No approval, 96%+ available immediately' },
                  { step: '4', label: 'Reinvest', detail: 'Use proceeds for additional premiums or opportunities' },
                  { step: '↺', label: 'Repeat', detail: 'Policy continues growing even while borrowed against', accent: true },
                ].map(c => (
                  <div key={c.step} style={c.accent ? { ...s.cycleStep, ...s.cycleStepAccent } : s.cycleStep}>
                    <div style={c.accent ? { ...s.cycleNum, background: '#fbbf24', color: '#0f172a' } : s.cycleNum}>{c.step}</div>
                    <div>
                      <div style={s.cycleLabel}>{c.label}</div>
                      <div style={s.cycleDetail}>{c.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* The Vision Quote */}
          <div style={s.quoteBlock}>
            <div style={s.quoteIcon}>"</div>
            <p style={s.quoteText}>
              MOLI is not theoretical. We have run the model. Sean and Evergreen have used IBC/BYOB
              to pay premiums, borrow against cash value, and reinvest — all while their policies
              continued to grow. The same mechanism, scaled across thousands of SOLVY members, becomes MOLI.
            </p>
            <p style={s.quoteAttrib}>— SOLVY Ecosystem / DECIDEY Education · April 2026</p>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section style={s.section}>
        <div style={s.container}>
          <div style={s.tabBar}>
            {(
              [
                { id: 'overview', label: 'Overview' },
                { id: 'boli', label: 'BOLI vs MOLI' },
                { id: 'howItWorks', label: 'How It Works' },
                { id: 'benefits', label: 'Benefits' },
              ] as { id: Tab; label: string }[]
            ).map(t => (
              <button
                key={t.id}
                style={tab === t.id ? s.tabActive : s.tab}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Overview */}
          {tab === 'overview' && (
            <div style={s.tabContent}>
              <h2 style={s.tabTitle}>What is MOLI?</h2>
              <div style={s.twoCol}>
                <div style={s.infoCard}>
                  <h3 style={s.infoCardTitle}>🛡️ What is MOLI?</h3>
                  <p style={s.infoCardBody}>
                    MOLI (Membership Owned Life Insurance) democratizes the
                    wealth-building strategies that banks and corporations have used through BOLI
                    (Bank Owned Life Insurance) for decades.
                  </p>
                  <ul style={s.checkList}>
                    <li>Cooperative ownership of life insurance policies</li>
                    <li>Shared benefits from premium recycling</li>
                    <li>Tax-advantaged wealth building</li>
                  </ul>
                </div>
                <div style={s.infoCard}>
                  <h3 style={s.infoCardTitle}>👥 SOLVY Integration</h3>
                  <p style={s.infoCardBody}>
                    MOLI integrates seamlessly with the SOLVY ecosystem,
                    creating multiple wealth-building opportunities for members.
                  </p>
                  <ul style={s.checkList}>
                    <li>SOLVY Card automatic contributions</li>
                    <li>Rewards for policy participation</li>
                    <li>Cooperative decision-making</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* BOLI Comparison */}
          {tab === 'boli' && (
            <div style={s.tabContent}>
              <h2 style={s.tabTitle}>BOLI vs MOLI: The Difference</h2>
              <div style={s.twoCol}>
                <div style={{ ...s.infoCard, borderColor: 'rgba(239,68,68,0.3)' }}>
                  <h3 style={{ ...s.infoCardTitle, color: '#f87171' }}>🏦 BOLI (Bank Owned Life Insurance)</h3>
                  {[
                    'Banks own policies on their employees',
                    'Employees get no benefit from cash value',
                    'Banks profit from premium recycling',
                    'Tax benefits go to the bank',
                    'Employees have no control or ownership',
                  ].map(item => (
                    <div key={item} style={s.boliRow}>
                      <span style={s.crossIcon}>✗</span>
                      <span style={s.boliText}>{item}</span>
                    </div>
                  ))}
                </div>
                <div style={{ ...s.infoCard, borderColor: 'rgba(34,197,94,0.3)' }}>
                  <h3 style={{ ...s.infoCardTitle, color: '#4ade80' }}>👥 MOLI (Membership Owned)</h3>
                  {[
                    'Members collectively own policies',
                    'Shared profits from cash value growth',
                    'Cooperative premium recycling benefits',
                    'Tax advantages shared among members',
                    'Democratic control and transparency',
                  ].map(item => (
                    <div key={item} style={s.boliRow}>
                      <span style={s.checkIcon}>✓</span>
                      <span style={s.sovrText}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* How It Works */}
          {tab === 'howItWorks' && (
            <div style={s.tabContent}>
              <h2 style={s.tabTitle}>How MOLI Works: Premium Recycling Simplified</h2>
              <div style={s.howBanner}>
                <strong>Based on Nelson Nash Institute Teachings</strong>
                <p style={{ marginTop: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '0.88rem' }}>
                  The Infinite Banking Concept (IBC) and Be Your Own Bank (BYOB) strategies that we're
                  implementing through MOLI have been proven effective for
                  decades.
                </p>
              </div>
              <div style={s.threeCol}>
                {[
                  {
                    num: '1',
                    title: 'Premium Contributions',
                    body: 'Members contribute premiums through SOLVY Card transactions and direct payments.',
                    example: '$315/month base + $685 PUA rider = $1,000 total premium',
                  },
                  {
                    num: '2',
                    title: 'Cash Value Growth',
                    body: 'Premiums build cash value that grows tax-free and becomes available for loans.',
                    example: '$8,000 investment → $8,400 available in one month',
                  },
                  {
                    num: '3',
                    title: 'Premium Recycling',
                    body: 'Members borrow against cash value to pay future premiums, creating a self-sustaining cycle.',
                    example: 'Loan rate 5.37% vs. cash value growth 6%+ = Net positive return',
                  },
                ].map(step => (
                  <div key={step.num} style={s.stepCard}>
                    <div style={s.stepNum}>{step.num}</div>
                    <h3 style={s.stepTitle}>{step.title}</h3>
                    <p style={s.stepBody}>{step.body}</p>
                    <p style={s.stepExample}>{step.example}</p>
                  </div>
                ))}
              </div>

              <div style={s.realWorldCard}>
                <h3 style={s.rwTitle}>Real-World Example: The Power of PUA</h3>
                <div style={s.twoCol}>
                  <div>
                    <p style={s.rwMonth}>Month 1 Results:</p>
                    <ul style={s.rwList}>
                      <li>Initial investment: $8,000</li>
                      <li>Immediate loan value: $7,700 (96.25%)</li>
                      <li>Available for use: $7,700</li>
                    </ul>
                  </div>
                  <div>
                    <p style={s.rwMonth}>Month 2 Results:</p>
                    <ul style={s.rwList}>
                      <li>After one payment: $8,400 available</li>
                      <li>Growth: $700 in one month</li>
                      <li>Effective return: 9.1% monthly</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Benefits */}
          {tab === 'benefits' && (
            <div style={s.tabContent}>
              <h2 style={s.tabTitle}>MOLI Benefits for SOLVY Members</h2>
              <div style={s.benefitsGrid}>
                {[
                  {
                    icon: '💲',
                    title: 'Financial Benefits',
                    items: ['Tax-free cash value growth', 'Tax-free policy loans', 'Guaranteed minimum returns', 'Dividend participation', 'No market risk'],
                  },
                  {
                    icon: '💧',
                    title: 'Liquidity Benefits',
                    items: ['Immediate access to cash value', 'No credit checks for loans', 'Flexible repayment terms', 'Continue earning while borrowed', 'Emergency fund alternative'],
                  },
                  {
                    icon: '🤝',
                    title: 'Cooperative Benefits',
                    items: ['Shared ownership and control', 'Collective bargaining power', 'Transparent operations', 'Democratic decision-making', 'Community wealth building'],
                  },
                  {
                    icon: '💳',
                    title: 'SOLVY Integration',
                    items: ['Automatic premium contributions', 'SOLVY Card rewards integration', 'MOLI score benefits', 'EBL transaction rewards', 'Cooperative governance participation'],
                  },
                  {
                    icon: '🏛️',
                    title: 'Legacy Benefits',
                    items: ['Tax-free death benefits', 'Wealth transfer to heirs', 'Estate planning advantages', 'Creditor protection', 'Generational wealth building'],
                  },
                  {
                    icon: '📚',
                    title: 'Education Benefits',
                    items: ['Nelson Nash Institute principles', 'IBC/BYOB strategy training', 'Premium recycling education', 'Wealth-building workshops', 'Cooperative economics learning'],
                  },
                ].map(b => (
                  <div key={b.title} style={s.benefitCard}>
                    <h3 style={s.benefitTitle}>{b.icon} {b.title}</h3>
                    <ul style={s.benefitList}>
                      {b.items.map(item => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section style={s.cta}>
        <div style={s.ctaInner}>
          <h2 style={s.ctaTitle}>Ready to Start Building Wealth with MOLI?</h2>
          <p style={s.ctaSub}>
            Join the SOLVY cooperative and start benefiting from the same wealth-building
            strategies that banks and corporations have used for decades.
          </p>
          <div style={s.ctaBtns}>
            <a href="/moli" style={s.ctaBtnPrimary}>Learn More About MOLI →</a>
            <a href="/#contact" style={s.ctaBtnOutline}>Contact Our Advisors</a>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <div style={s.disclaimer}>
        <div style={s.container}>
          MOLI integrates with the SOLVY ecosystem: automatic premium contributions, SOLVY Card rewards, and cooperative governance. ·
          Policy details: One America with Jason Sipple (Chris Naugle's group). IBC/BYOB principles taught by Nelson Nash Institute. ·
          This is a real-world proof of concept. Past results do not guarantee future performance.
        </div>
      </div>

      <SolvyFooter />
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#0f172a', color: '#fff', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },

  devBanner: { background: 'rgba(251,191,36,0.1)', borderBottom: '1px solid rgba(251,191,36,0.2)', padding: '10px 24px', textAlign: 'center', fontSize: '0.78rem', fontWeight: 600, color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', letterSpacing: '0.02em' },
  devDot: { width: '7px', height: '7px', borderRadius: '50%', background: '#fbbf24', display: 'inline-block', flexShrink: 0 },

  container: { maxWidth: '1160px', margin: '0 auto', padding: '0 24px' },

  hero: { textAlign: 'center', padding: '80px 24px 56px', background: 'linear-gradient(180deg, rgba(124,58,237,0.12) 0%, transparent 100%)' },
  heroEyebrow: { fontSize: '0.85rem', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' },
  heroTitle: { fontSize: 'clamp(3rem, 8vw, 5rem)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '20px', lineHeight: 1.1 },
  heroAccent: { color: '#ffb347' },
  heroSub: { fontSize: '1.05rem', color: 'rgba(255,255,255,0.6)', maxWidth: '680px', margin: '0 auto', lineHeight: 1.7 },

  section: { padding: '48px 0' },

  sectionEyebrow: { fontSize: '0.8rem', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '10px' },
  sectionHeading: { fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.01em' },
  sectionSub: { fontSize: '0.85rem', color: 'rgba(255,255,255,0.35)', marginBottom: '36px' },

  summaryTiles: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '40px' },
  summaryTile: { background: 'rgba(255,255,255,0.03)', border: '1px solid', borderRadius: '16px', padding: '20px 18px' },
  tileValue: { fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '6px' },
  tileLabel: { fontSize: '0.83rem', fontWeight: 700, color: '#fff', marginBottom: '4px' },
  tileSub: { fontSize: '0.74rem', color: 'rgba(255,255,255,0.35)' },

  policyGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '40px' },
  policyCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '24px' },
  policyCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' },
  policyCardEyebrow: { fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '4px' },
  policyCardName: { fontSize: '1.1rem', fontWeight: 800, color: '#fff' },
  policyBadge: { background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80', fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px' },
  policyMeta: { fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginBottom: '18px' },

  resultRows: { display: 'flex', flexDirection: 'column' as const, gap: '8px', marginBottom: '18px' },
  resultRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.25)', borderRadius: '8px', padding: '10px 14px', gap: '12px' },
  resultLabel: { fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', fontWeight: 500 },
  resultSub: { fontSize: '0.7rem', color: 'rgba(255,255,255,0.28)', marginTop: '2px' },
  resultValue: { fontSize: '0.9rem', fontWeight: 700, color: '#fff', flexShrink: 0 },
  resultValueGreen: { fontSize: '0.9rem', fontWeight: 700, color: '#4ade80', flexShrink: 0 },

  loanTimeline: { marginBottom: '16px' },
  loanTimelineTitle: { fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '10px' },
  loanRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' },
  loanDot: { width: '7px', height: '7px', borderRadius: '50%', background: '#a78bfa', flexShrink: 0 },
  loanInfo: { flex: 1, fontSize: '0.8rem' },
  loanDate: { color: 'rgba(255,255,255,0.55)', fontWeight: 600 },
  loanNote: { color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' },
  loanAmt: { fontSize: '0.85rem', fontWeight: 700, color: '#4ade80', flexShrink: 0 },

  availableBanner: { background: 'linear-gradient(135deg, rgba(74,222,128,0.1) 0%, rgba(56,189,248,0.06) 100%)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '12px', padding: '14px 18px', marginBottom: '16px', textAlign: 'center' as const },
  availableLabel: { fontSize: '0.72rem', fontWeight: 700, color: 'rgba(74,222,128,0.7)', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '4px' },
  availableValue: { fontSize: '1.8rem', fontWeight: 900, color: '#4ade80', letterSpacing: '-0.02em', marginBottom: '4px' },
  availableDate: { fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' },

  policyNote: { background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '12px 14px', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 },

  puaBlock: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '40px' },
  puaBlockLeft: { background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: '20px', padding: '28px' },
  puaBlockRight: { background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.12)', borderRadius: '20px', padding: '28px' },
  puaTitle: { fontSize: '1rem', fontWeight: 700, color: '#a78bfa', marginBottom: '18px' },
  puaRow: { display: 'flex', gap: '10px', marginBottom: '14px', alignItems: 'flex-start' },
  puaIcon: { flexShrink: 0, marginTop: '1px' },
  puaItemTitle: { fontSize: '0.87rem', color: '#fff' },
  puaItemBody: { fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' },

  cycleSteps: { display: 'flex', flexDirection: 'column' as const, gap: '10px' },
  cycleStep: { display: 'flex', gap: '12px', alignItems: 'flex-start', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', padding: '12px 14px' },
  cycleStepAccent: { background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)' },
  cycleNum: { width: '26px', height: '26px', borderRadius: '50%', background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0, color: '#fff' },
  cycleLabel: { fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: '2px' },
  cycleDetail: { fontSize: '0.76rem', color: 'rgba(255,255,255,0.45)' },

  quoteBlock: { background: 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(251,191,36,0.05) 100%)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '20px', padding: '40px', textAlign: 'center' as const },
  quoteIcon: { fontSize: '4rem', color: 'rgba(167,139,250,0.3)', lineHeight: 1, marginBottom: '8px' },
  quoteText: { fontSize: '1.05rem', lineHeight: 1.75, color: 'rgba(255,255,255,0.8)', fontStyle: 'italic', maxWidth: '760px', margin: '0 auto 16px' },
  quoteAttrib: { fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600 },

  tabBar: { display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '6px', flexWrap: 'wrap', marginBottom: '32px' },
  tab: { padding: '9px 18px', borderRadius: '8px', border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' },
  tabActive: { padding: '9px 18px', borderRadius: '8px', border: 'none', background: '#7c3aed', color: '#fff', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' },

  tabContent: { animation: 'fadeIn 0.2s ease' },
  tabTitle: { fontSize: '1.4rem', fontWeight: 800, marginBottom: '24px', letterSpacing: '-0.01em' },

  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
  threeCol: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '28px' },
  benefitsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },

  infoCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px' },
  infoCardTitle: { fontSize: '1rem', fontWeight: 700, marginBottom: '12px', color: '#fff' },
  infoCardBody: { fontSize: '0.87rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, marginBottom: '14px' },
  checkList: { paddingLeft: '18px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 2 },

  boliRow: { display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' },
  crossIcon: { color: '#f87171', fontWeight: 700, flexShrink: 0, marginTop: '1px' },
  checkIcon: { color: '#4ade80', fontWeight: 700, flexShrink: 0, marginTop: '1px' },
  boliText: { fontSize: '0.87rem', color: 'rgba(255,255,255,0.55)' },
  sovrText: { fontSize: '0.87rem', color: 'rgba(255,255,255,0.7)' },

  howBanner: { background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '14px', padding: '20px 24px', marginBottom: '28px', fontSize: '0.9rem', fontWeight: 700, color: '#c4b5fd' },

  stepCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px' },
  stepNum: { width: '32px', height: '32px', borderRadius: '50%', background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem', marginBottom: '14px' },
  stepTitle: { fontSize: '0.95rem', fontWeight: 700, marginBottom: '8px', color: '#fff' },
  stepBody: { fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', marginBottom: '10px', lineHeight: 1.6 },
  stepExample: { fontSize: '0.78rem', color: '#a78bfa', fontStyle: 'italic' },

  realWorldCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(251,191,36,0.15)', borderRadius: '16px', padding: '24px' },
  rwTitle: { fontSize: '1rem', fontWeight: 700, color: '#fbbf24', marginBottom: '16px' },
  rwMonth: { fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: '8px' },
  rwList: { paddingLeft: '18px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', lineHeight: 2 },

  benefitCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '20px' },
  benefitTitle: { fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', color: '#fff' },
  benefitList: { paddingLeft: '16px', fontSize: '0.83rem', color: 'rgba(255,255,255,0.55)', lineHeight: 2 },

  cta: { background: 'linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(79,70,229,0.15) 100%)', borderTop: '1px solid rgba(124,58,237,0.2)', borderBottom: '1px solid rgba(124,58,237,0.2)', padding: '80px 24px', textAlign: 'center' },
  ctaInner: { maxWidth: '700px', margin: '0 auto' },
  ctaTitle: { fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.01em' },
  ctaSub: { fontSize: '1rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: '32px' },
  ctaBtns: { display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' },
  ctaBtnPrimary: { display: 'inline-block', background: '#7c3aed', color: '#fff', padding: '14px 28px', borderRadius: '40px', fontWeight: 700, textDecoration: 'none', fontSize: '0.95rem' },
  ctaBtnOutline: { display: 'inline-block', border: '1.5px solid rgba(124,58,237,0.5)', color: '#c4b5fd', padding: '14px 24px', borderRadius: '40px', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem' },

  disclaimer: { padding: '24px', fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)', lineHeight: 1.8, textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' },
}
