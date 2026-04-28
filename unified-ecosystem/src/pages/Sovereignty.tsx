import UnifiedNav from '../components/UnifiedNav'
import SolvyFooter from '../components/SolvyFooter'

export default function Sovereignty() {
  return (
    <div style={s.page}>
      <UnifiedNav currentPage="about" />

      {/* Hero */}
      <section style={s.hero}>
        <img src="/fulllogo.png" alt="Solutions Value You" style={s.fullLogo} />
        <div style={s.heroBadge}>Self-Sovereign Identity</div>
        <h1 style={s.heroTitle}>
          Practice <span style={s.accentPurple}>SOVEREIGNITITY™</span>
          <img src="/solvy-crown-icon.png" alt="" style={s.inlineCrown} />
        </h1>
        <p style={s.heroSub}>
          Your identity, your data, your transactions — captured and owned by <em>you</em>.
          Not harvested. Not sold. Turned into <strong>a source of income you control.</strong>
        </p>
        <a href="/apply" style={s.heroBtn}>Claim Your Identity →</a>
      </section>

      {/* What Is It */}
      <section style={s.section}>
        <div style={s.container}>
          <h2 style={s.sectionTitle}>What Is Practicing SOVEREIGNITITY™?</h2>
          <p style={s.bodyText}>
            SOVEREIGNITITY™ is the act of taking <strong>self-sovereign identity</strong> — owning
            who you are, what you spend, and what your data is worth — and converting that ownership
            into a <strong>second source of revenue</strong>.
          </p>
          <p style={s.bodyText}>
            Every time you swipe the SOLVY Card™, you are not just making a purchase.
            You are building a verifiable, owned record of your economic identity.
            That record belongs to your cooperative. It can be licensed, aggregated with
            consent, and turned into patronage dividends — <em>money that flows back to you</em>.
          </p>

          <div style={s.threeGrid}>
            {[
              {
                icon: '🪪',
                title: 'Capture Your Identity',
                body: 'Your SOLVY Card™ creates a sovereign financial identity — a verified, member-owned record of your economic activity. No platform extracts it without your consent.',
              },
              {
                icon: '🔁',
                title: 'Earn from Your Data',
                body: 'Through the SOLVY Data Marketplace, your aggregated (anonymous) spending patterns are licensed to researchers and businesses. You earn a share of every sale.',
              },
              {
                icon: '💎',
                title: 'Build a Revenue Stream',
                body: '70% of interchange fees + data licensing revenue flows into the Member Pool as patronage dividends. Your identity earns you income while you sleep.',
              },
            ].map((item) => (
              <div key={item.title} style={s.pillarCard}>
                <div style={s.pillarIcon}>{item.icon}</div>
                <h3 style={s.pillarTitle}>{item.title}</h3>
                <p style={s.pillarBody}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IBC Connection */}
      <section style={{ ...s.section, background: 'rgba(52,211,153,0.04)', borderTop: '1px solid rgba(52,211,153,0.15)', borderBottom: '1px solid rgba(52,211,153,0.15)' }}>
        <div style={s.container}>
          <h2 style={s.sectionTitle}>SOVEREIGNITITY™ + IBC</h2>
          <p style={s.bodyText}>
            Infinite Banking Concept (IBC) practitioners already understand that{' '}
            <strong>you can be your own bank</strong>. SOLVY extends that principle to your
            entire economic identity:
          </p>
          <div style={s.ibcGrid}>
            {[
              { left: 'IBC: Recapture interest you pay to banks', right: 'SOLVY: Recapture interchange fees from card spend' },
              { left: 'IBC: Use whole life policy as collateral', right: 'SOLVY: Use MOLI (Member Owned Life Insurance) for member protection' },
              { left: 'IBC: Compound money inside your own structure', right: 'SOLVY: Compound cooperative wealth via 70/20/10 model' },
              { left: 'IBC: Control your liquidity', right: 'SOLVY: Control your data, identity, and dividend income' },
            ].map((row, i) => (
              <div key={i} style={s.ibcRow}>
                <div style={s.ibcLeft}>{row.left}</div>
                <div style={s.ibcArrow}>→</div>
                <div style={s.ibcRight}>{row.right}</div>
              </div>
            ))}
          </div>
          <p style={{ ...s.bodyText, marginTop: '2rem', fontStyle: 'italic', color: '#6ee7b7' }}>
            "IBC teaches you to stop giving money to the bank. SOVEREIGNITITY™ teaches you to stop giving your identity to the platform."
          </p>
        </div>
      </section>

      {/* MOLI */}
      <section style={s.section}>
        <div style={s.container}>
          <h2 style={s.sectionTitle}>MOLI — Member Owned Life Insurance</h2>
          <p style={s.bodyText}>
            Just as banks use BOLI (Bank Owned Life Insurance) to build institutional wealth,
            SOLVY members use <strong>MOLI</strong> — whole life insurance progression designed
            for cooperative members. MOLI:
          </p>
          <ul style={s.moliList}>
            {[
              'Builds cash value that belongs to the member, not the institution',
              'Provides cooperative-backed protection that travels with your membership',
              'Integrates with IBC strategy — use your MOLI policy as collateral inside the cooperative',
              'Passes generational wealth: the 20% Community Pool reinforces MOLI beneficiaries in need',
            ].map((item) => (
              <li key={item} style={s.moliItem}>
                <span style={s.moliCheck}>✓</span> {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 70/20/10 Revenue Split */}
      <section style={{ ...s.section, background: 'rgba(147,51,234,0.05)' }}>
        <div style={s.container}>
          <h2 style={s.sectionTitle}>The 70/20/10 Sovereignty Model</h2>
          <p style={s.bodyText}>
            Every dollar of interchange revenue generated by SOLVY Card™ transactions is distributed cooperatively:
          </p>
          <div style={s.splitGrid}>
            {[
              { pct: '70%', label: 'Patronage Dividends', color: '#9333ea', desc: 'Direct member benefit — returned to you proportional to your card usage. Your spending is your equity.' },
              { pct: '20%', label: 'Community Pool', color: '#14b8a6', desc: "The grandmother's blanket — collective care, MOLI support, and member protection. Nobody falls alone." },
              { pct: '10%', label: 'SOVEREIGNITITY™ Fund', color: '#f59e0b', desc: 'Protocol maintenance and the Sovereign Wealth Fund — the cooperative fist that keeps the infrastructure free.' },
            ].map((item) => (
              <div key={item.pct} style={{ ...s.splitCard, borderTop: `4px solid ${item.color}` }}>
                <div style={{ ...s.splitPct, color: item.color }}>{item.pct}</div>
                <div style={s.splitLabel}>{item.label}</div>
                <p style={s.splitDesc}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Six Pillars */}
      <section style={s.section}>
        <div style={s.container}>
          <h2 style={s.sectionTitle}>The Six Pillars of SOVEREIGNITITY™</h2>
          <div style={s.principlesGrid}>
            {[
              { num: '01', title: 'Data Sovereignty', body: 'Your transaction data stays in your control. Not sold to advertisers. Not harvested by platforms. You own your financial history.' },
              { num: '02', title: 'Revenue Ownership', body: '70% of interchange fees flow to the Member Pool. When the cooperative succeeds, you succeed.' },
              { num: '03', title: 'Transparent Governance', body: 'The MAN (Mandatory Audit Network) makes every dollar visible. No hidden fees. No extraction possible.' },
              { num: '04', title: 'Collective Protection', body: "The 20% Community Pool — collective care for members in need. The 10% Sovereign Fund keeps the infrastructure free." },
              { num: '05', title: 'Democratic Control', body: "One member = One vote. Major decisions require member approval. You govern what you own." },
              { num: '06', title: 'Lineage Protection', body: 'MOLI + the 70/20/10 model encodes generational wealth: your family inherits cooperative equity, not debt.' },
            ].map((p) => (
              <div key={p.num} style={s.principleCard}>
                <div style={s.principleNum}>{p.num}</div>
                <h3 style={s.principleTitle}>{p.title}</h3>
                <p style={s.principleBody}>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={s.ctaSection}>
        <h2 style={s.ctaTitle}>
          Your Identity Is an Asset. <span style={s.accentPurple}>Start Earning From It.</span>
        </h2>
        <p style={s.ctaSub}>
          Stop giving your data to platforms that profit from it without paying you.
          Practice SOVEREIGNITITY™ — own your identity, earn from your transactions.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/apply" style={s.ctaBtn}>Get Your SOLVY Card™ →</a>
          <a href="/presentations/SOVEREIGNITITY-Cooperative-Neobank-IBC.pdf" target="_blank" rel="noopener noreferrer" style={s.ctaBtnOutline}>View IBC Partnership Deck ↗</a>
        </div>
        <p style={s.ctaNote}>Juneteenth 2025 Launch · Founding Member Spots Limited</p>
      </section>
      <SolvyFooter />
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#0f172a', color: '#fff', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
  hero: { background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '7rem 2rem 4rem', textAlign: 'center', borderBottom: '1px solid rgba(147,51,234,0.2)' },
  fullLogo: { height: '120px', width: 'auto', display: 'block', margin: '0 auto 1.75rem', filter: 'drop-shadow(0 0 20px rgba(147,51,234,0.4))' },
  inlineCrown: { height: '0.85em', width: 'auto', verticalAlign: 'middle', marginLeft: '0.3em', filter: 'grayscale(1) brightness(2) opacity(0.6)' },
  heroBadge: { display: 'inline-block', background: 'rgba(147,51,234,0.12)', border: '1px solid rgba(147,51,234,0.3)', color: '#c4b5fd', padding: '6px 18px', borderRadius: '40px', fontSize: '0.82rem', fontWeight: 600, marginBottom: '20px' },
  heroTitle: { fontSize: '2.8rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1.5rem', maxWidth: '700px', margin: '0 auto 1.5rem' },
  accentPurple: { background: 'linear-gradient(135deg, #9333ea, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
  heroSub: { color: '#94a3b8', fontSize: '1.1rem', maxWidth: '640px', margin: '0 auto 2rem', lineHeight: 1.7 },
  heroBtn: { display: 'inline-block', background: 'linear-gradient(135deg, #9333ea, #7c3aed)', color: 'white', padding: '0.85rem 2rem', borderRadius: '10px', fontWeight: 700, textDecoration: 'none', fontSize: '1rem' },
  section: { padding: '4rem 2rem' },
  container: { maxWidth: '960px', margin: '0 auto' },
  sectionTitle: { fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center', background: 'linear-gradient(135deg, #9333ea, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
  bodyText: { color: '#94a3b8', fontSize: '1rem', lineHeight: 1.75, marginBottom: '1.25rem', maxWidth: '800px', margin: '0 auto 1.25rem' },
  threeGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '2.5rem' },
  pillarCard: { background: 'rgba(147,51,234,0.07)', border: '1px solid rgba(147,51,234,0.2)', borderRadius: '16px', padding: '1.75rem', textAlign: 'center' },
  pillarIcon: { fontSize: '2.2rem', marginBottom: '0.75rem' },
  pillarTitle: { fontWeight: 700, color: '#e2e8f0', marginBottom: '0.75rem', fontSize: '1.05rem' },
  pillarBody: { color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.65 },
  ibcGrid: { display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '1.5rem' },
  ibcRow: { display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', alignItems: 'center', background: 'rgba(52,211,153,0.05)', borderRadius: '10px', padding: '12px 16px' },
  ibcLeft: { color: '#94a3b8', fontSize: '0.9rem' },
  ibcArrow: { color: '#34d399', fontWeight: 700, fontSize: '1.1rem', textAlign: 'center' },
  ibcRight: { color: '#6ee7b7', fontSize: '0.9rem', fontWeight: 600 },
  moliList: { listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '1.5rem', maxWidth: '720px', margin: '1.5rem auto 0' },
  moliItem: { color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.6, display: 'flex', gap: '12px', alignItems: 'flex-start' },
  moliCheck: { color: '#34d399', fontWeight: 700, flexShrink: 0, marginTop: '2px' },
  splitGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginTop: '2rem' },
  splitCard: { background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '1.75rem', textAlign: 'center' },
  splitPct: { fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' },
  splitLabel: { fontWeight: 700, color: '#e2e8f0', marginBottom: '0.75rem', fontSize: '1rem' },
  splitDesc: { color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.65 },
  principlesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginTop: '1.5rem' },
  principleCard: { background: 'rgba(147,51,234,0.07)', border: '1px solid rgba(147,51,234,0.15)', borderRadius: '14px', padding: '1.5rem' },
  principleNum: { fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(135deg, #9333ea, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '0.5rem' },
  principleTitle: { fontWeight: 700, color: '#e2e8f0', marginBottom: '0.5rem', fontSize: '1rem' },
  principleBody: { color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6 },
  ctaSection: { background: 'linear-gradient(135deg, rgba(147,51,234,0.15) 0%, rgba(236,72,153,0.08) 100%)', border: '1px solid rgba(147,51,234,0.2)', margin: '0 2rem 4rem', borderRadius: '24px', padding: '4rem 2rem', textAlign: 'center' },
  ctaTitle: { fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' },
  ctaSub: { color: '#94a3b8', fontSize: '1rem', maxWidth: '560px', margin: '0 auto 2rem', lineHeight: 1.6 },
  ctaBtn: { display: 'inline-block', background: 'linear-gradient(135deg, #9333ea, #ec4899)', color: 'white', padding: '1rem 2.5rem', borderRadius: '40px', fontWeight: 700, textDecoration: 'none', fontSize: '1rem' },
  ctaBtnOutline: { display: 'inline-block', border: '1.5px solid rgba(147,51,234,0.5)', color: '#c4b5fd', padding: '1rem 2rem', borderRadius: '40px', fontWeight: 600, textDecoration: 'none', fontSize: '0.95rem' },
  ctaNote: { color: '#64748b', fontSize: '0.88rem', marginTop: '1.5rem' },
}
