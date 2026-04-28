import UnifiedNav from '../components/UnifiedNav'
import SolvyFooter from '../components/SolvyFooter'

export default function Heritage() {
  return (
    <div style={s.page}>
      <UnifiedNav />

      {/* Hero */}
      <section style={s.hero} id="freedman">
        <img src="/fulllogo.png" alt="Solutions Value You — SOLVY" style={s.fullLogo} />
        <div style={s.heroBadge}>🏛️ From History to Ownership</div>
        <h1 style={s.heroTitle}>
          From Promised Liberation<br />
          to <span style={s.heroAccent}>Owned Infrastructure</span>
        </h1>
        <p style={s.heroSub}>
          The Freedman Bank asked for trust. SOLVY removes the need for trust by giving you ownership.
        </p>
        <a href="#pillars" style={s.heroBtn}>Explore Our Heritage</a>
      </section>

      {/* Three Pillars */}
      <section style={s.section} id="pillars">
        <div style={s.container}>
          <div style={s.pillarsGrid}>
            {[
              { icon: '🏛️', title: 'The Freedman Bank', body: '1865–1874: The promise of economic freedom betrayed by those who controlled the money.' },
              { icon: '📜', title: 'H.R. 40', body: 'Study while we build. SOLVY creates economic infrastructure now, not after decades of debate.' },
              { icon: '⚖️', title: 'GENIUS Act', body: 'The new extraction mechanism: corporate wallets that turn you into an unknowing government creditor. SOLVY is the documented remedy.' },
            ].map((p) => (
              <div key={p.title} style={s.pillarCard}>
                <div style={s.pillarIcon}>{p.icon}</div>
                <h3 style={s.pillarTitle}>{p.title}</h3>
                <p style={s.pillarBody}>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section style={{ ...s.section, background: 'rgba(147,51,234,0.04)' }}>
        <div style={s.container}>
          <h2 style={s.sectionTitle}>What Went Wrong Then → What SOLVY Does Now</h2>
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Freedman Bank (1865)</th>
                  <th style={{ ...s.th, color: '#9333ea' }}>SOLVY Ecosystem (2026)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['White trustees controlled Black deposits', 'Member-owned: 70% of revenue returns to members'],
                  ['No voting rights for depositors', 'One member = One vote: Cooperative governance'],
                  ['No transparency in investments', 'MAN Portal: Every dollar visible, every decision auditable'],
                  ['Wealth extracted from community', '70/20/10 model: Wealth distributed to those who create it'],
                ].map(([left, right]) => (
                  <tr key={left} style={s.tr}>
                    <td style={s.td}>{left}</td>
                    <td style={{ ...s.td, color: '#c4b5fd', fontWeight: 500 }}>{right}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* H.R. 40 Position */}
      <section style={s.section}>
        <div style={{ ...s.container, maxWidth: '760px' }}>
          <h2 style={s.sectionTitle}>SOLVY Position on H.R. 40</h2>
          <p style={s.bodyText}>
            <strong style={{ color: '#fff' }}>We support H.R. 40.</strong> We also recognize that study is not a substitute for action.
            While Congress studies the legacy of slavery, SOLVY builds the infrastructure to close the wealth gap.
          </p>
          <ul style={s.checklist}>
            {[
              'Every swipe of a SOLVY Card™ generates interchange revenue',
              '70% of that revenue flows directly to Black and Brown members',
              'Not charity — ongoing ownership',
              'Not one-time payment — continuous wealth building',
            ].map((item) => (
              <li key={item} style={s.checkItem}>
                <span style={s.checkMark}>✓</span> {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Truth & Love */}
      <section style={{ ...s.section, background: 'rgba(147,51,234,0.04)' }}>
        <div style={{ ...s.container, maxWidth: '760px' }}>
          <h2 style={s.sectionTitle}>The Truth — and the Open Door</h2>
          <p style={s.bodyText}>
            The truth is that the destruction of Black wealth in America was <strong style={{ color: '#fff' }}>deliberate</strong>.
            Freedman banks were looted by their white trustees. Thriving communities like Greenwood were burned
            by their neighbors. Redlining was policy, not accident. These are not allegations — they are documented facts.
          </p>
          <p style={s.bodyText}>
            And yet — <strong style={{ color: '#c4b5fd' }}>SOLVY is a project built in love, not rage.</strong>
          </p>
          <p style={s.bodyText}>
            We name the harm clearly so we can repair it clearly. We are not building walls. We are building
            infrastructure that is open to every person who believes that economic dignity is a human right —
            regardless of where they come from. The cooperative belongs to those who show up and participate.
            Ownership is earned through membership, not inherited through race.
          </p>
          <div style={s.quoteBox}>
            "We do not ask you to carry our ancestors' wounds. We ask you to help build a system that never
            inflicts them again."
          </div>
        </div>
      </section>

      {/* Immigrant Story */}
      <section style={s.section}>
        <div style={s.container}>
          <h2 style={s.sectionTitle}>Every Immigrant Carries a Story</h2>
          <p style={s.bodyText}>
            America is a nation of arrivals — and nearly every arrival came with a story of what was left behind,
            what was lost, or what was taken. The Haitian who rebuilt after the earthquake. The Central American
            who fled a government the US helped destabilize. The South Asian who remits half their paycheck home.
            The West African who sends money back to a village that was once a colonial extraction point.
          </p>
          <p style={s.bodyText}>
            <strong style={{ color: '#fff' }}>SOLVY was built for all of them.</strong>
          </p>
          <p style={s.bodyText}>
            Our Global Remittance infrastructure, our cooperative revenue model, and our commitment to data
            sovereignty speak to every community that has ever had their economic power extracted by an
            institution that did not represent them. You belong here. Your story belongs here.
          </p>
          <div style={s.pillarsGrid}>
            {[
              { icon: '🌍', title: 'Diaspora Communities', body: 'Caribbean, African, Latino, Southeast Asian — communities whose wealth was extracted across generations and borders.' },
              { icon: '📦', title: 'Remittance Families', body: 'If you send money home, SOLVY gives you a cooperative infrastructure that keeps more of it in your hands.' },
              { icon: '🤝', title: 'Immigrant Entrepreneurs', body: 'The SOLVY Card and cooperative membership is built for those who built this country from the outside in.' },
            ].map((p) => (
              <div key={p.title} style={{ ...s.pillarCard, textAlign: 'left' }}>
                <div style={s.pillarIcon}>{p.icon}</div>
                <h3 style={s.pillarTitle}>{p.title}</h3>
                <p style={s.pillarBody}>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* US Interference */}
      <section style={{ ...s.section, background: 'rgba(147,51,234,0.04)' }}>
        <div style={{ ...s.container, maxWidth: '760px' }}>
          <h2 style={s.sectionTitle}>The Long Shadow of Interference</h2>
          <p style={s.bodyText}>
            The United States has a long, documented history of regime change and foreign interference —
            from Iran in 1953 to Guatemala in 1954, from Chile in 1973 to Haiti across multiple decades.
            These were not accidents of foreign policy. They were deliberate disruptions of sovereign economies
            that created the diaspora communities now living in America.
          </p>
          <p style={s.bodyText}>
            Many Americans want to be proud of their country — and they can be, honestly, while also
            acknowledging this history. <strong style={{ color: '#fff' }}>Pride and accountability are not opposites.</strong>{' '}
            A nation that can look clearly at what it has done abroad is a nation capable of healing what it
            has done at home.
          </p>
          <p style={s.bodyText}>
            SOLVY does not ask anyone to be ashamed. We ask everyone — regardless of origin — to participate
            in building an economic system that does not repeat these patterns. The cooperative is the antidote
            to extraction, whether that extraction happened on a plantation, through a foreign coup, or through
            a subprime mortgage.
          </p>
        </div>
      </section>

      {/* Parallel Economy Acknowledgment */}
      <section style={s.section}>
        <div style={{ ...s.container, maxWidth: '760px' }}>
          <div style={s.geniusBadge}>🌐 The Parallel Economy Principle</div>
          <h2 style={s.sectionTitle}>Extraction and Parallel Economy</h2>
          <p style={s.bodyText}>
            The wealth of nations — including the one we call home — has often been built through extraction.
            From colonial resource grabs to modern ISDS arbitration (Investor-State Dispute Settlement),
            corporations have sued sovereign nations for billions to protect profits from oil, gas, minerals, and land.
          </p>
          <p style={s.bodyText}>
            This system created jobs, funded pensions, and built stock markets. It also displaced communities,
            undermined democracies, and created the diaspora that now seeks a new way forward.
          </p>
          <p style={s.bodyText}>
            <strong style={{ color: '#fff' }}>We are not here to judge. We are here to build.</strong>
          </p>
          <p style={s.bodyText}>
            SOLVY is a parallel economy, not a protest. We do not ask you to leave the old system.
            We ask you to also participate in a new one.
          </p>
          <div style={s.parallelList}>
            {[
              { icon: '🔄', label: 'Revenue', old: 'Natural resource extraction', solvy: 'Interchange fees — real economic activity' },
              { icon: '🏛️', label: 'Ownership', old: 'Corporate shareholders', solvy: 'Cooperative members' },
              { icon: '🔐', label: 'Data', old: 'Surveilled by corporations', solvy: 'Sovereign to members' },
              { icon: '💰', label: 'Profits', old: 'To shareholders', solvy: '70% Patronage Dividends to members' },
              { icon: '⚖️', label: 'Disputes', old: 'Private arbitration (ISDS/ICSID)', solvy: 'Transparent member governance (MAN)' },
            ].map((r) => (
              <div key={r.label} style={s.parallelItem}>
                <span style={s.parallelIcon}>{r.icon}</span>
                <span style={s.parallelLabel}>{r.label}</span>
                <span style={s.parallelOld}>{r.old}</span>
                <span style={s.parallelArrow}>→</span>
                <span style={s.parallelNew}>{r.solvy}</span>
              </div>
            ))}
          </div>
          <div style={s.quoteBox}>
            "The old economy worked for some. The parallel economy works for everyone who chooses it."
          </div>
        </div>
      </section>

      {/* Genius Act — Modern Control Grid */}
      <section style={s.section}>
        <div style={{ ...s.container, maxWidth: '900px' }}>
          <div style={s.geniusBadge}>⚖️ Legislation Watch — Present Threat</div>
          <h2 style={s.sectionTitle}>The Genius Act: The New Control Grid</h2>
          <p style={s.bodyText}>
            The extraction did not stop with redlining or foreign coups. It updated its software.
            The <strong style={{ color: '#fff' }}>Genius Act</strong> — and the corporate digital wallet ecosystem
            built around it — is the most sophisticated version of this pattern yet. It is not a conspiracy.
            It is documented legislation with a clear mechanism:
          </p>

          <h3 style={s.subHeading}>The Trap in Five Steps</h3>
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={{ ...s.th, width: '48px' }}>Step</th>
                  <th style={s.th}>The Mechanism</th>
                  <th style={s.th}>Who Benefits</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['1', 'U.S. government needs buyers for $40T in national debt', 'Government — debt financed'],
                  ['2', 'Corporations (Tesla, Apple, Amazon) build digital wallets', 'Corporations — earn spread on your deposits'],
                  ['3', 'Users load wallets with dollars → corporations buy Treasuries', 'Users receive "rewards." Government gets debt funded.'],
                  ['4', 'Genius Act mandates stablecoin issuers hold Treasuries', 'Government — forced, permanent debt buyers created by law'],
                  ['5', 'Smartphone users become unknowing creditors to the U.S.', 'Government + Corporations. Not you.'],
                ].map(([step, mech, who]) => (
                  <tr key={step} style={s.tr}>
                    <td style={{ ...s.td, fontWeight: 700, color: '#ec4899', textAlign: 'center' }}>{step}</td>
                    <td style={s.td}>{mech}</td>
                    <td style={{ ...s.td, color: '#94a3b8', fontStyle: 'italic' }}>{who}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ ...s.bodyText, marginTop: '1.25rem' }}>
            You think you are earning rewards. In reality, you are financing government debt through a
            corporate-controlled wallet — <strong style={{ color: '#fff' }}>without being told, without consent, and without a share of the profit.</strong>
          </p>

          <h3 style={{ ...s.subHeading, marginTop: '2.5rem' }}>The SOLVY Countermeasure</h3>
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Control Grid Feature</th>
                  <th style={{ ...s.th, color: '#9333ea' }}>SOLVY Countermeasure</th>
                  <th style={{ ...s.th, color: '#c4b5fd' }}>Why It Works</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Corporate wallet controls your funds', 'Self-custody SOLVY Card', 'You control access — not a corporation'],
                  ['Your dollars buy Treasuries without your knowledge', 'Interchange revenue flows to members', 'No forced debt purchase. Ever.'],
                  ['You are a creditor to the U.S. government', 'You are an owner of the cooperative', 'Profit shares, not debt liability'],
                  ['Corporations earn the spread on your deposits', 'Members earn 70% of all revenue', 'No extraction layer between you and your money'],
                  ['Stablecoins backed by Treasuries (forced debt purchase)', 'SOLVY Card is a debit card — not a stablecoin', 'Genius Act does not apply to us'],
                ].map(([threat, counter, why]) => (
                  <tr key={threat} style={s.tr}>
                    <td style={{ ...s.td, color: '#f87171' }}>{threat}</td>
                    <td style={{ ...s.td, color: '#c4b5fd', fontWeight: 500 }}>{counter}</td>
                    <td style={{ ...s.td, color: '#86efac' }}>{why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 style={{ ...s.subHeading, marginTop: '2.5rem' }}>Side by Side: Who You Are</h3>
          <div style={s.compareGrid}>
            <div style={s.compareLeft}>
              <div style={s.compareHeader}>Genius Act / Corporate Wallet</div>
              {[
                ['Your role', 'Unknowing creditor'],
                ['Asset backing', 'U.S. Treasuries (government debt)'],
                ['Control', 'Corporate — not you'],
                ['Profit flow', 'To corporations and government'],
                ['Transparency', 'Opaque terms of service'],
                ['Data ownership', 'Corporate — sold without your consent'],
              ].map(([label, val]) => (
                <div key={label} style={s.compareRow}>
                  <span style={s.compareLabel}>{label}</span>
                  <span style={{ ...s.compareVal, color: '#f87171' }}>{val}</span>
                </div>
              ))}
            </div>
            <div style={s.compareRight}>
              <div style={{ ...s.compareHeader, color: '#c4b5fd', borderColor: 'rgba(147,51,234,0.4)' }}>SOLVY Ecosystem</div>
              {[
                ['Your role', 'Conscious cooperative owner'],
                ['Asset backing', 'Interchange revenue — real economic activity'],
                ['Control', 'Member cooperative — one member, one vote'],
                ['Profit flow', 'To members (70% Patronage Dividends)'],
                ['Transparency', 'MAN Portal — full public audit'],
                ['Data ownership', 'Yours — sold only with your explicit consent'],
              ].map(([label, val]) => (
                <div key={label} style={s.compareRow}>
                  <span style={s.compareLabel}>{label}</span>
                  <span style={{ ...s.compareVal, color: '#86efac' }}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...s.quoteBox, marginTop: '2.5rem', borderLeftColor: '#ec4899' }}>
            "The Genius Act and corporate wallets are not innovation. They are a mechanism to privatize U.S. debt
            by turning every smartphone user into an unknowing creditor.{' '}
            <strong style={{ color: '#fff' }}>SOLVY is the remedy.</strong> We do not hold Treasuries. We do not
            force members to finance government debt. We earn revenue from interchange fees — real economic activity,
            not debt monetization. That revenue flows 70% to members. Members own their data. Members control their
            funds. Members see every dollar through MAN. We do not wait for permission. We build the alternative."
          </div>

          <div style={s.audienceGrid}>
            {[
              { audience: 'To Members', angle: '"Your money stays yours. It does not become government debt."', icon: '👥' },
              { audience: 'To Underwriters', angle: '"We are not exposed to Treasury market risk. Revenue is transaction-based."', icon: '🏦' },
              { audience: 'To Regulators', angle: '"We are a debit card cooperative, not a stablecoin issuer. Genius Act does not apply."', icon: '⚖️' },
              { audience: 'To Partners', angle: '"We are building the non-debt, non-extraction financial layer."', icon: '🤝' },
            ].map((a) => (
              <div key={a.audience} style={s.audienceCard}>
                <div style={s.pillarIcon}>{a.icon}</div>
                <div style={s.audienceLabel}>{a.audience}</div>
                <p style={{ ...s.pillarBody, fontStyle: 'italic' }}>{a.angle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Remedy: Data Sovereignty */}
      <section style={s.section}>
        <div style={s.container}>
          <h2 style={s.sectionTitle}>The Remedy: You Own Your Data. You Share in Its Value.</h2>
          <p style={{ ...s.bodyText, textAlign: 'center', maxWidth: '700px', margin: '0 auto 2.5rem' }}>
            For generations, corporations have extracted behavioral data from communities of color — selling
            spending patterns, location histories, and financial habits without consent or compensation.
            <strong style={{ color: '#fff' }}> SOVEREIGNITITY™ reverses this.</strong>
          </p>
          <div style={s.pillarsGrid}>
            {[
              { icon: '🔐', title: 'Your Wallet, Your Control', body: 'Members hold their own data in an encrypted personal wallet. Nothing leaves without explicit, revocable consent. You are not the product.' },
              { icon: '🤝', title: 'Member-Owned Data Pools', body: 'Members who choose to participate pool anonymized data for licensing to AI companies, researchers, and marketers — with one member, one vote on every pool proposal.' },
              { icon: '💰', title: '70/20/10 on Data Revenue', body: 'The same cooperative split applies to data sales: 70% flows to contributing members, 20% to operations, 10% to the Sovereign Wealth Fund.' },
              { icon: '🌐', title: 'Open-Source Infrastructure', body: 'Built on proven open-source foundations — inspired by Vana (MIT), SEDIMARK, and Gen3 — so no single corporation owns the rails.' },
              { icon: '🗳️', title: 'Cooperative Governance', body: 'No data pool is created without a member vote through the MAN (Mandatory Audit Network). Every sale, every distribution is publicly auditable.' },
              { icon: '🚪', title: 'Right to Withdraw', body: 'Members can exit any data pool at any time. Their data is removed. Their ownership stake remains. This is not a trap — it is a cooperative.' },
            ].map((p) => (
              <div key={p.title} style={s.pillarCard}>
                <div style={s.pillarIcon}>{p.icon}</div>
                <h3 style={s.pillarTitle}>{p.title}</h3>
                <p style={s.pillarBody}>{p.body}</p>
              </div>
            ))}
          </div>
          <div style={{ ...s.quoteBox, marginTop: '2.5rem' }}>
            "They sold your data for generations without asking. SOLVY asks — and when you say yes, you get paid."
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={s.ctaSection}>
        <h2 style={s.ctaTitle}>Stop Waiting. <span style={s.heroAccent}>Start Owning.</span></h2>
        <p style={s.ctaSub}>The infrastructure of ownership is what we're building now.</p>
        <a href="/first-circle-deposit" style={s.ctaBtn}>Join the First Circle → $100 Equity Deposit</a>
      </section>
      <SolvyFooter />
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#0f172a', color: '#fff', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
  fullLogo: { height: '120px', width: 'auto', display: 'block', margin: '0 auto 1.75rem', filter: 'drop-shadow(0 0 20px rgba(147,51,234,0.4))' },
  hero: { background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '7rem 2rem 4rem', textAlign: 'center', borderBottom: '1px solid rgba(147,51,234,0.2)' },
  heroBadge: { display: 'inline-block', background: 'rgba(147,51,234,0.15)', border: '1px solid rgba(147,51,234,0.3)', color: '#c4b5fd', padding: '6px 18px', borderRadius: '40px', fontSize: '0.82rem', fontWeight: 600, marginBottom: '20px', letterSpacing: '0.04em' },
  heroTitle: { fontSize: '2.6rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem', maxWidth: '700px', margin: '0 auto 1rem' },
  heroAccent: { background: 'linear-gradient(135deg, #9333ea, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
  heroSub: { color: '#94a3b8', fontSize: '1.1rem', maxWidth: '560px', margin: '0 auto 2rem', lineHeight: 1.6 },
  heroBtn: { display: 'inline-block', background: 'linear-gradient(135deg, #9333ea, #7c3aed)', color: 'white', padding: '0.75rem 1.75rem', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', fontSize: '1rem' },
  section: { padding: '4rem 2rem' },
  container: { maxWidth: '960px', margin: '0 auto' },
  sectionTitle: { fontSize: '1.75rem', fontWeight: 700, marginBottom: '2rem', textAlign: 'center', background: 'linear-gradient(135deg, #9333ea, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
  pillarsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' },
  pillarCard: { background: 'rgba(147,51,234,0.07)', border: '1px solid rgba(147,51,234,0.2)', borderRadius: '16px', padding: '2rem', textAlign: 'center' },
  pillarIcon: { fontSize: '2rem', marginBottom: '1rem' },
  pillarTitle: { fontSize: '1.1rem', fontWeight: 700, color: '#c4b5fd', marginBottom: '0.75rem' },
  pillarBody: { color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6 },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' },
  th: { padding: '14px 20px', background: 'rgba(147,51,234,0.12)', color: '#cbd5e1', fontWeight: 700, textAlign: 'left', borderBottom: '2px solid rgba(147,51,234,0.3)' },
  tr: {},
  td: { padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#94a3b8', verticalAlign: 'top', lineHeight: 1.5 },
  bodyText: { color: '#94a3b8', fontSize: '1rem', lineHeight: 1.7, marginBottom: '1.5rem' },
  checklist: { listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' },
  checkItem: { color: '#cbd5e1', fontSize: '0.95rem', display: 'flex', alignItems: 'flex-start', gap: '10px' },
  checkMark: { color: '#ec4899', fontWeight: 700, flexShrink: 0 },
  ctaSection: { background: 'linear-gradient(135deg, rgba(147,51,234,0.15) 0%, rgba(236,72,153,0.08) 100%)', border: '1px solid rgba(147,51,234,0.2)', margin: '0 2rem 4rem', borderRadius: '24px', padding: '4rem 2rem', textAlign: 'center' },
  ctaTitle: { fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' },
  ctaSub: { color: '#94a3b8', marginBottom: '2rem', fontSize: '1rem' },
  ctaBtn: { display: 'inline-block', background: 'linear-gradient(135deg, #9333ea, #ec4899)', color: 'white', padding: '1rem 2rem', borderRadius: '40px', fontWeight: 700, textDecoration: 'none', fontSize: '1rem' },
  quoteBox: { background: 'rgba(147,51,234,0.08)', border: '1px solid rgba(147,51,234,0.25)', borderLeft: '4px solid #9333ea', borderRadius: '0 12px 12px 0', padding: '1.5rem', color: '#c4b5fd', fontStyle: 'italic', fontSize: '1.05rem', lineHeight: 1.6, marginTop: '2rem' },
  geniusBadge: { display: 'inline-block', background: 'rgba(236,72,153,0.12)', border: '1px solid rgba(236,72,153,0.3)', color: '#f9a8d4', padding: '5px 16px', borderRadius: '40px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1.25rem', letterSpacing: '0.04em' },
  subHeading: { fontSize: '1.15rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '1rem', marginTop: '0' },
  compareGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginTop: '1rem' },
  compareLeft: { background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '14px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '10px' },
  compareRight: { background: 'rgba(147,51,234,0.07)', border: '1px solid rgba(147,51,234,0.25)', borderRadius: '14px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '10px' },
  compareHeader: { fontWeight: 800, fontSize: '1rem', color: '#f87171', borderBottom: '1px solid rgba(239,68,68,0.2)', paddingBottom: '10px', marginBottom: '4px' },
  compareRow: { display: 'flex', flexDirection: 'column', gap: '2px' },
  compareLabel: { fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' },
  compareVal: { fontSize: '0.9rem', fontWeight: 500, lineHeight: 1.4 },
  audienceGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '2rem' },
  audienceCard: { background: 'rgba(147,51,234,0.07)', border: '1px solid rgba(147,51,234,0.2)', borderRadius: '14px', padding: '1.5rem', textAlign: 'center' },
  audienceLabel: { fontWeight: 700, color: '#c4b5fd', marginBottom: '8px', fontSize: '0.95rem' },
  parallelList: { display: 'flex', flexDirection: 'column', gap: '10px', margin: '1.75rem 0' },
  parallelItem: { display: 'grid', gridTemplateColumns: '28px 90px 1fr 20px 1fr', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(147,51,234,0.12)', borderRadius: '10px', padding: '0.8rem 1rem' },
  parallelIcon: { fontSize: '1.1rem', textAlign: 'center' },
  parallelLabel: { fontWeight: 700, color: '#c4b5fd', fontSize: '0.82rem' },
  parallelOld: { color: '#f87171', fontSize: '0.85rem', lineHeight: 1.4 },
  parallelArrow: { color: '#64748b', fontWeight: 700, textAlign: 'center' },
  parallelNew: { color: '#86efac', fontSize: '0.85rem', lineHeight: 1.4, fontWeight: 500 },
}
