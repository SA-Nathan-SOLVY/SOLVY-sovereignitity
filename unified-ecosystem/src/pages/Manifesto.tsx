import UnifiedNav from '../components/UnifiedNav'
import SolvyFooter from '../components/SolvyFooter'

export default function Manifesto() {
  return (
    <div style={s.page}>
      <UnifiedNav />

      {/* Hero */}
      <section style={s.hero}>
        <img src="/fulllogo.png" alt="Solutions Value You — SOLVY" style={s.fullLogo} />
        <h1 style={s.heroTitle}>
          The <span style={s.accent}>SOLVY</span> Manifesto
        </h1>
        <p style={s.heroSub}>
          Digital encoding of protection. Mathematical expression of "leave them better."
        </p>
      </section>

      {/* 70/20/10 Model */}
      <section style={s.section}>
        <div style={s.container}>
          <h2 style={s.sectionTitle}>The 70/20/10 Model</h2>
          <p style={s.bodyText}>
            SOLVY's distribution model is not arbitrary economics — it is digital protection encoded in protocol:
          </p>
          <div style={s.splitDiagram}>
            {[
              { pct: '70%', label: 'Patronage Dividends — Community Pool', meaning: 'Direct descendant protection — revenue that returns to those who generate it. Pooled funds seed larger community projects, including MOLI (Member-Owned Life Insurance) — conceived in the spirit of BOLI (Bank-Owned Life Insurance), with established relationships for IBC policy underwriting.' },
              { pct: '20%', label: 'Operations Funding', meaning: 'Sustains the cooperative\'s infrastructure, technology, compliance, and administrative operations — keeping the platform running and growing.' },
              { pct: '10%', label: 'Sovereign Wealth Fund — SOVEREIGNITITY™', meaning: 'The fist, maintained — protocol sustainability and growth. All activity is transparent on the MAN (Mandatory Audit Network).' },
            ].map((row) => (
              <div key={row.pct} style={s.splitRow}>
                <div style={s.splitPct}>{row.pct}</div>
                <div>
                  <div style={s.splitLabel}>{row.label}</div>
                  <div style={s.splitMeaning}>{row.meaning}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={s.quoteBox}>
            "When you spend with SOLVY, you are not consuming. You are building. The iron fist in plastic — spending as protection, not exploitation."
          </div>
        </div>
      </section>

      {/* Narrative-Technical Bridge */}
      <section style={{ ...s.section, background: 'rgba(147,51,234,0.04)' }}>
        <div style={s.container}>
          <h2 style={s.sectionTitle}>The Narrative-Technical Bridge</h2>
          <p style={s.bodyText}>
            Traditional financial systems separate story from structure. SOLVY encodes them together:
          </p>
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Technical Component</th>
                  <th style={s.th}>Lineage Encoding</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['The MAN (Mandatory Audit Network)', 'Digital continuation of grandmother "witness" — the community watching the money. Every transaction visible, every allocation auditable.'],
                  ['DECIDEY Platform', 'Transmission of IBC knowledge — scaling what was learned through struggle into collective education.'],
                  ['70/20/10 Split', 'Mathematical expression of "leave them better" — 70% Patronage Dividends (Community Pool), 20% Operations Funding, 10% Sovereign Wealth Fund (SOVEREIGNITITY™).'],
                  ['SOLVY Card', 'The iron fist in plastic — spending as protection, not consumption. Every swipe builds equity.'],
                  ['MOLI (Member-Owned Life Insurance)', 'Conceived in the spirit of BOLI (Bank-Owned Life Insurance) — transaction revenue becoming generational security through established IBC policy underwriting relationships.'],
                ].map(([tech, encoding]) => (
                  <tr key={tech}>
                    <td style={{ ...s.td, color: '#c4b5fd', fontWeight: 600 }}>{tech}</td>
                    <td style={s.td}>{encoding}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Self-Sovereign Identity */}
      <section style={s.section}>
        <div style={{ ...s.container, maxWidth: '760px' }}>
          <h2 style={s.sectionTitle}>On Self-Sovereign Identity</h2>
          <p style={s.bodyText}>
            True sovereignty is not isolation. It is autonomy with protection. SOLVY implements this through:
          </p>
          {[
            { title: 'Data Sovereignty', body: 'Your transaction history stays on your device, not in corporate databases. You control access. You control disclosure. You are not the product.' },
            { title: 'Economic Sovereignty', body: 'You own 70% of the revenue your transactions generate. Not as charity. Not as reward. As ownership.' },
            { title: 'Governance Sovereignty', body: 'One member = One vote. The protocol serves its users, not distant shareholders.' },
          ].map((item) => (
            <div key={item.title} style={s.sovereigntyItem}>
              <div style={s.sovereigntyTitle}>{item.title}</div>
              <div style={s.sovereigntyBody}>{item.body}</div>
            </div>
          ))}
          <div style={s.quoteBox}>
            "The system that profits from your labor must carry responsibility for your survival. This is not ideology — it is structural stability."
          </div>
        </div>
      </section>

      {/* Parallel Economy */}
      <section style={{ ...s.section, background: 'rgba(147,51,234,0.04)' }}>
        <div style={{ ...s.container, maxWidth: '760px' }}>
          <h2 style={s.sectionTitle}>A Parallel Economy, Not a Rejection</h2>
          <p style={s.bodyText}>
            The existing economy — built on extraction, ISDS arbitration, and resource grabs — has created
            enormous wealth. We do not deny that. We do not ask anyone to be ashamed of it.
            Many of us have benefited from it, directly or indirectly.
          </p>
          <p style={s.bodyText}>
            <strong style={{ color: '#fff' }}>But not everyone could participate.</strong>
          </p>
          <p style={s.bodyText}>
            That is not an accident. The same mechanisms that built wealth for some — from regime change
            to subprime mortgages to investor-state lawsuits — locked others out.
          </p>
          <p style={s.bodyText}>
            SOLVY does not seek to tear down. We seek to build alongside.
          </p>
          <p style={s.bodyText}>
            We are creating a parallel economy governed by SOVEREIGNITITY: data sovereignty, cooperative
            ownership, and patient revenue. Not to replace what exists, but to offer a choice.
          </p>
          <div style={s.parallelGrid}>
            {[
              { icon: '🔄', label: 'Revenue Source', old: 'Resource extraction & financial engineering', solvy: 'Interchange fees from real member transactions' },
              { icon: '🏛️', label: 'Ownership Structure', old: 'Corporate shareholders (distant, anonymous)', solvy: 'Cooperative members — one person, one vote' },
              { icon: '🔐', label: 'Data Rights', old: 'Corporate — surveilled and sold without consent', solvy: 'Member sovereign — consented and compensated' },
              { icon: '💰', label: 'Profit Flow', old: 'To shareholders (0% to workers)', solvy: '70% Patronage Dividends to members' },
              { icon: '⚖️', label: 'Dispute Resolution', old: 'ISDS/ICSID private arbitration (opaque)', solvy: 'Member vote through MAN (full public audit)' },
            ].map((row) => (
              <div key={row.label} style={s.parallelRow}>
                <div style={s.parallelIcon}>{row.icon}</div>
                <div style={s.parallelLabel}>{row.label}</div>
                <div style={s.parallelOld}>{row.old}</div>
                <div style={s.parallelArrow}>→</div>
                <div style={s.parallelNew}>{row.solvy}</div>
              </div>
            ))}
          </div>
          <div style={s.quoteBox}>
            "You can participate in the old economy. You can also own the new one.{' '}
            We do not reject. We build."
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={s.ctaSection}>
        <h2 style={s.ctaTitle}>Own Your Spend. <span style={s.accent}>Own Your Future.</span></h2>
        <p style={s.ctaSub}>$100 equity contribution · First Circle founding members only</p>
        <a href="/first-circle-deposit" style={s.ctaBtn}>Join the First Circle →</a>
      </section>
      <SolvyFooter />
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#0f172a', color: '#fff', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
  hero: { background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '7rem 2rem 4rem', textAlign: 'center', borderBottom: '1px solid rgba(147,51,234,0.2)' },
  fullLogo: { height: '120px', width: 'auto', display: 'block', margin: '0 auto 1.75rem', filter: 'drop-shadow(0 0 20px rgba(147,51,234,0.4))' },
  heroTitle: { fontSize: '2.8rem', fontWeight: 800, marginBottom: '1rem' },
  accent: { background: 'linear-gradient(135deg, #9333ea, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
  heroSub: { color: '#94a3b8', fontSize: '1.1rem', maxWidth: '560px', margin: '0 auto', lineHeight: 1.6 },
  section: { padding: '4rem 2rem' },
  container: { maxWidth: '960px', margin: '0 auto' },
  sectionTitle: { fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center', background: 'linear-gradient(135deg, #9333ea, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
  bodyText: { color: '#94a3b8', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2rem' },
  splitDiagram: { display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '2.5rem' },
  splitRow: { display: 'flex', alignItems: 'flex-start', gap: '20px', background: 'rgba(147,51,234,0.07)', border: '1px solid rgba(147,51,234,0.15)', borderRadius: '12px', padding: '1.25rem 1.5rem' },
  splitPct: { fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(135deg, #9333ea, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', flexShrink: 0, minWidth: '72px' },
  splitLabel: { fontWeight: 700, color: '#e2e8f0', marginBottom: '4px' },
  splitMeaning: { color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5 },
  quoteBox: { background: 'rgba(147,51,234,0.08)', border: '1px solid rgba(147,51,234,0.25)', borderLeft: '4px solid #9333ea', borderRadius: '0 12px 12px 0', padding: '1.5rem', color: '#c4b5fd', fontStyle: 'italic', fontSize: '1.05rem', lineHeight: 1.6 },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.92rem' },
  th: { padding: '14px 20px', background: 'rgba(147,51,234,0.12)', color: '#cbd5e1', fontWeight: 700, textAlign: 'left', borderBottom: '2px solid rgba(147,51,234,0.3)' },
  td: { padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#94a3b8', verticalAlign: 'top', lineHeight: 1.6 },
  sovereigntyItem: { background: 'rgba(147,51,234,0.06)', border: '1px solid rgba(147,51,234,0.15)', borderRadius: '12px', padding: '1.25rem 1.5rem', marginBottom: '12px' },
  sovereigntyTitle: { fontWeight: 700, color: '#c4b5fd', marginBottom: '6px' },
  sovereigntyBody: { color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6 },
  ctaSection: { background: 'linear-gradient(135deg, rgba(147,51,234,0.15) 0%, rgba(236,72,153,0.08) 100%)', border: '1px solid rgba(147,51,234,0.2)', margin: '0 2rem 4rem', borderRadius: '24px', padding: '4rem 2rem', textAlign: 'center' },
  ctaTitle: { fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' },
  ctaSub: { color: '#64748b', fontSize: '0.92rem', marginBottom: '2rem' },
  ctaBtn: { display: 'inline-block', background: 'linear-gradient(135deg, #9333ea, #ec4899)', color: 'white', padding: '1rem 2rem', borderRadius: '40px', fontWeight: 700, textDecoration: 'none', fontSize: '1rem' },
  parallelGrid: { display: 'flex', flexDirection: 'column', gap: '12px', margin: '2rem 0' },
  parallelRow: { display: 'grid', gridTemplateColumns: '32px 160px 1fr 24px 1fr', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(147,51,234,0.12)', borderRadius: '10px', padding: '0.9rem 1.1rem' },
  parallelIcon: { fontSize: '1.25rem', textAlign: 'center' },
  parallelLabel: { fontWeight: 700, color: '#c4b5fd', fontSize: '0.85rem' },
  parallelOld: { color: '#f87171', fontSize: '0.88rem', lineHeight: 1.4 },
  parallelArrow: { color: '#64748b', fontWeight: 700, textAlign: 'center', fontSize: '1.1rem' },
  parallelNew: { color: '#86efac', fontSize: '0.88rem', lineHeight: 1.4, fontWeight: 500 },
}
