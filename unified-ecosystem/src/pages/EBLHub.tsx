import { useState } from 'react'

export default function EBLHub() {
  const [reignOpen, setReignOpen] = useState(false)

  return (
    <div style={s.page}>

      {/* Minimal nav */}
      <nav style={s.nav}>
        <div style={s.navInner}>
          <div style={s.navBrand}>
            <img src="/ebl-logo.png" alt="Evergreen Beauty Lounge" style={s.navLogo} />
            <span style={s.navName}>Evergreen Beauty Lounge</span>
          </div>
          <a href="https://solvy.cards" target="_blank" rel="noopener noreferrer" style={s.poweredBy}>
            <img src="/SolvyLogo-1024.png" alt="SOLVY" style={s.solvyMark} />
            <span>Powered by SOLVY</span>
          </a>
        </div>
      </nav>

      {/* Split hero */}
      <section style={s.hero}>

        {/* Services side */}
        <div style={s.heroLeft}>
          <div style={s.heroContent}>
            <div style={s.heroPill}>Licensed Texas Cosmetology · Veteran-Owned</div>
            <h1 style={s.heroHeadline}>Beauty is care.<br />Book yours today.</h1>
            <p style={s.heroSub}>
              Precision cuts, locs, natural hair, protective styles &amp; more —
              all from a licensed professional who leads with intention.
            </p>
            <div style={s.heroActions}>
              <a href="tel:9294295994" style={s.btnPrimary}>📞 Call to Book</a>
              <a href="sms:9294295994" style={s.btnSecondary}>💬 Text Us</a>
            </div>
            <p style={s.heroNote}>(929) 429-5994 · Pricing set during consultation</p>
          </div>
        </div>

        {/* Reign side */}
        <div style={s.heroRight}>
          <div style={s.heroContent}>
            <div style={{ ...s.heroPill, background: 'rgba(52,211,153,0.15)', color: '#34d399' }}>EBL Rep ID 301272 · Distributor</div>
            <h1 style={{ ...s.heroHeadline, color: '#f0fdf4' }}>
              Reign.<br />Premium protection.
            </h1>
            <p style={{ ...s.heroSub, color: 'rgba(240,253,244,0.8)' }}>
              Nobel Prize-winning graphene technology. Non-toxic.
              Ultra-thin with wings. Delivered to your door.
            </p>
            <div style={s.heroActions}>
              <a href="https://ebl.jewelpads.com/shop/" target="_blank" rel="noopener noreferrer" style={{ ...s.btnPrimary, background: '#059669' }}>🛍 Shop Reign</a>
              <button onClick={() => setReignOpen(true)} style={s.btnGhost}>▶ Watch Demo</button>
            </div>
            <p style={{ ...s.heroNote, color: 'rgba(240,253,244,0.6)' }}>Monthly subscriptions available</p>
          </div>
        </div>

      </section>

      {/* Services section */}
      <section style={s.section}>
        <div style={s.container}>
          <div style={s.sectionLabel}>SERVICES</div>
          <h2 style={s.sectionTitle}>What Eva offers</h2>
          <div style={s.servicesGrid}>
            {[
              { icon: '✂️', name: 'Precision Cuts', desc: 'Tailored to your texture and lifestyle' },
              { icon: '🔒', name: 'Locs & Twists', desc: 'Starter locs, retwists, and maintenance' },
              { icon: '🌿', name: 'Natural Hair', desc: 'Wash-n-go, braid outs, co-wash styling' },
              { icon: '💆', name: 'Protective Styles', desc: 'Braids, extensions, and scalp care' },
              { icon: '✨', name: 'Color & Treatment', desc: 'Professional color with healthy-hair focus' },
              { icon: '💅', name: 'Consultation', desc: 'Every new client starts here — priced together' },
            ].map((svc) => (
              <div key={svc.name} style={s.serviceCard}>
                <div style={s.serviceIcon}>{svc.icon}</div>
                <h3 style={s.serviceName}>{svc.name}</h3>
                <p style={s.serviceDesc}>{svc.desc}</p>
              </div>
            ))}
          </div>
          <div style={s.bookCta}>
            <a href="tel:9294295994" style={s.btnDark}>Call (929) 429-5994 to Schedule</a>
            <a href="sms:9294295994" style={{ ...s.btnDark, background: 'transparent', border: '1.5px solid #cbd5e1', color: '#0f1e2c' }}>Text to Schedule</a>
          </div>
        </div>
      </section>

      {/* Reign section */}
      <section style={{ ...s.section, background: '#0a1628' }}>
        <div style={s.container}>
          <div style={{ ...s.sectionLabel, color: '#34d399' }}>REIGN BY EBL</div>
          <h2 style={{ ...s.sectionTitle, color: '#f0fdf4' }}>Science-backed menstrual care</h2>
          <p style={{ color: 'rgba(240,253,244,0.7)', maxWidth: '600px', margin: '0 auto 40px', textAlign: 'center', lineHeight: 1.7 }}>
            Infused with Nobel Prize-winning graphene technology. Non-toxic, ultra-thin, with wings.
            Engineered odor control and all-day comfort — distributed exclusively through Evergreen Beauty Lounge.
          </p>
          <div style={s.reignGrid}>
            {[
              { icon: '🔬', title: 'Nobel Prize Graphene', body: 'Advanced antimicrobial protection from the same material recognized by the Nobel Prize in Physics.' },
              { icon: '🌿', title: 'Non-Toxic Formula', body: 'Free of harmful chemicals. Breathable, ultra-thin construction designed with women\'s health first.' },
              { icon: '🛡️', title: 'Wings + Odor Control', body: 'Secure wing design with engineered odor neutralization. Light to regular absorbency.' },
              { icon: '📦', title: 'Monthly Subscription', body: 'Auto-delivered to your door across the US. Never run out — subscribe and save.' },
            ].map((f) => (
              <div key={f.title} style={s.reignCard}>
                <div style={s.reignIcon}>{f.icon}</div>
                <h4 style={s.reignCardTitle}>{f.title}</h4>
                <p style={s.reignCardBody}>{f.body}</p>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '40px' }}>
            <a href="https://youtu.be/igrZlzW-zQA" target="_blank" rel="noopener noreferrer" style={s.videoLink}>▶ 30-Minute Product Demo</a>
            <a href="https://youtu.be/XwPHpMiBCR0" target="_blank" rel="noopener noreferrer" style={s.videoLink}>▶ Product Overview</a>
          </div>
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <a href="https://ebl.jewelpads.com/shop/" target="_blank" rel="noopener noreferrer" style={{ ...s.btnPrimary, background: '#059669', fontSize: '1rem', padding: '16px 40px' }}>
              Shop Reign at ebl.jewelpads.com →
            </a>
          </div>
        </div>
      </section>

      {/* Become a Distributor section */}
      <section style={{ ...s.section, background: '#faf5ff' }}>
        <div style={s.container}>
          <div style={s.sectionLabel}>OPPORTUNITY</div>
          <h2 style={s.sectionTitle}>Become a Reign Distributor</h2>
          <div style={s.distroBox}>
            <div style={s.distroLeft}>
              <p style={s.distroIntro}>
                Evergreen Beauty Lounge was built on a simple belief — when one person rises,
                they bring others with them. Eva opened EBL to serve her community.
                Now she's extending that same opportunity through Reign.
              </p>
              <p style={s.distroBody}>
                Reign is a premium, science-backed product that sells itself.
                As a distributor under EBL, you carry a product you can stand behind —
                graphene-infused, non-toxic, and genuinely better for women's health.
                No gimmicks. Real product. Real income potential.
              </p>
              <div style={s.distroPoints}>
                {[
                  { icon: '💼', text: 'Your own distributor storefront — your link, your customers' },
                  { icon: '📦', text: 'Product that ships directly to your buyers nationwide' },
                  { icon: '💰', text: 'Earn commission on every order placed through your site' },
                  { icon: '🤝', text: 'Backed by EBL — licensed professional, veteran-owned, community-first' },
                ].map((p) => (
                  <div key={p.text} style={s.distroPoint}>
                    <span style={s.distroPointIcon}>{p.icon}</span>
                    <span style={s.distroPointText}>{p.text}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '32px', display: 'flex', gap: '16px', flexWrap: 'wrap' as const }}>
                <a href="https://ebl.jewelpads.com/enroll/" target="_blank" rel="noopener noreferrer" style={{ ...s.btnPrimary, background: '#7c3aed', fontSize: '1rem', padding: '16px 36px' }}>
                  Enroll as a Distributor →
                </a>
                <a href="https://youtu.be/igrZlzW-zQA" target="_blank" rel="noopener noreferrer" style={{ ...s.btnDark, background: 'transparent', border: '1.5px solid #7c3aed', color: '#7c3aed', fontSize: '0.9rem' }}>
                  ▶ Watch the 30-Min Demo First
                </a>
              </div>
            </div>
            <div style={s.distroRight}>
              <div style={s.distroCard}>
                <div style={s.distroCardTop}>
                  <span style={s.distroCardIcon}>🌱</span>
                  <div style={s.distroCardLabel}>EBL Distributor Network</div>
                </div>
                <div style={s.distroStat}>
                  <div style={s.distroStatNum}>$0</div>
                  <div style={s.distroStatLabel}>Upfront inventory required</div>
                </div>
                <div style={s.distroStat}>
                  <div style={s.distroStatNum}>301272</div>
                  <div style={s.distroStatLabel}>Your sponsor Rep ID (EBL)</div>
                </div>
                <div style={s.distroStat}>
                  <div style={s.distroStatNum}>🔬</div>
                  <div style={s.distroStatLabel}>Nobel Prize graphene technology</div>
                </div>
                <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(124,58,237,0.06)', borderRadius: '12px', fontSize: '0.82rem', color: '#5b21b6', lineHeight: 1.6 }}>
                  "I believe in putting people in position to win. Reign gave me that chance — I'm passing it on."
                  <div style={{ marginTop: '8px', fontWeight: 700 }}>— Eva, Founder · Evergreen Beauty Lounge</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOLVY Payment section */}
      <section style={{ ...s.section, background: '#f8fafc' }}>
        <div style={s.container}>
          <div style={{ ...s.paymentBox }}>
            <div style={s.paymentLeft}>
              <img src="/SolvyLogo-1024.png" alt="SOLVY" style={{ height: '44px', width: 'auto', marginBottom: '16px' }} />
              <h3 style={s.paymentTitle}>SOLVY Card — coming to EBL</h3>
              <p style={s.paymentBody}>
                Once our cooperative card program completes underwriting, every service booked
                and every Reign order placed through EBL will be payable with your SOLVY Card.
                Earn interchange back. Own your spend.
              </p>
              <div style={s.paymentBadge}>
                <span style={s.badgeDot} />
                Underwriting in progress · Card issuance via Unit.co
              </div>
            </div>
            <div style={s.paymentRight}>
              <div style={s.paymentStat}>
                <div style={s.paymentStatNum}>$0</div>
                <div style={s.paymentStatLabel}>Monthly fee to members</div>
              </div>
              <div style={s.paymentStat}>
                <div style={s.paymentStatNum}>100%</div>
                <div style={s.paymentStatLabel}>Interchange returned to cooperative</div>
              </div>
              <div style={s.paymentStat}>
                <div style={s.paymentStatNum}>#1</div>
                <div style={s.paymentStatLabel}>EBL — Pilot Partner</div>
              </div>
              <a href="https://solvy.cards/prelaunch" style={{ ...s.btnDark, display: 'inline-block', marginTop: '8px', textDecoration: 'none', textAlign: 'center' }}>
                Join the waitlist →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <div style={s.footerBrand}>
            <img src="/ebl-logo.png" alt="EBL" style={{ height: '36px', width: 'auto' }} />
            <div>
              <div style={s.footerName}>Evergreen Beauty Lounge</div>
              <div style={s.footerTagline}>Licensed Texas Cosmetology · Veteran-Owned · SOLVY Pilot #1</div>
            </div>
          </div>
          <div style={s.footerLinks}>
            <a href="tel:9294295994" style={s.footerLink}>(929) 429-5994</a>
            <a href="https://ebl.jewelpads.com/shop/" target="_blank" rel="noopener noreferrer" style={s.footerLink}>Shop Reign</a>
            <a href="https://solvy.cards" style={s.footerLink}>SOLVY Ecosystem</a>
            <a href="https://solvy.cards/prelaunch" style={s.footerLink}>Join Waitlist</a>
          </div>
          <div style={s.footerPowered}>
            <img src="/SolvyLogo-1024.png" alt="SOLVY" style={{ height: '20px', width: 'auto', opacity: 0.5 }} />
            <span style={{ opacity: 0.5, fontSize: '0.78rem' }}>Powered by SOLVY Ecosystem™</span>
          </div>
        </div>
      </footer>

      {/* Reign video modal */}
      {reignOpen && (
        <div style={s.modal} onClick={() => setReignOpen(false)}>
          <div style={s.modalBox} onClick={(e) => e.stopPropagation()}>
            <button style={s.modalClose} onClick={() => setReignOpen(false)}>✕</button>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem' }}>Reign — Product Demonstration</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a href="https://youtu.be/igrZlzW-zQA" target="_blank" rel="noopener noreferrer" style={{ ...s.btnPrimary, background: '#1e3a5f', textAlign: 'center' }}>
                ▶ 30-Minute Demo (Full)
              </a>
              <a href="https://youtu.be/XwPHpMiBCR0" target="_blank" rel="noopener noreferrer" style={{ ...s.btnPrimary, background: '#059669', textAlign: 'center' }}>
                ▶ Product Overview (Short)
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { fontFamily: "'Inter', -apple-system, sans-serif", background: 'white', minHeight: '100vh' },

  nav: { position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #f1f5f9' },
  navInner: { maxWidth: '1200px', margin: '0 auto', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  navBrand: { display: 'flex', alignItems: 'center', gap: '10px' },
  navLogo: { height: '36px', width: 'auto' },
  navName: { fontWeight: 700, fontSize: '1rem', color: '#0f1e2c' },
  poweredBy: { display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 },
  solvyMark: { height: '18px', width: 'auto', opacity: 0.6 },

  hero: { display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '92vh' },
  heroLeft: { background: 'linear-gradient(145deg, #1a0533 0%, #4c1d95 60%, #6d28d9 100%)', display: 'flex', alignItems: 'center', padding: '80px 60px' },
  heroRight: { background: 'linear-gradient(145deg, #022c22 0%, #064e3b 60%, #065f46 100%)', display: 'flex', alignItems: 'center', padding: '80px 60px' },
  heroContent: { maxWidth: '440px' },
  heroPill: { display: 'inline-block', background: 'rgba(167,139,250,0.15)', color: '#c4b5fd', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.05em', padding: '6px 14px', borderRadius: '40px', marginBottom: '20px', textTransform: 'uppercase' as const },
  heroHeadline: { fontSize: '2.8rem', fontWeight: 900, color: 'white', lineHeight: 1.1, margin: '0 0 20px' },
  heroSub: { fontSize: '1rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, margin: '0 0 32px' },
  heroActions: { display: 'flex', gap: '12px', flexWrap: 'wrap' as const, marginBottom: '16px' },
  heroNote: { fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', margin: 0 },

  btnPrimary: { background: '#7c3aed', color: 'white', padding: '14px 28px', borderRadius: '40px', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', display: 'inline-block' },
  btnSecondary: { background: 'rgba(255,255,255,0.12)', color: 'white', padding: '14px 28px', borderRadius: '40px', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', border: '1.5px solid rgba(255,255,255,0.25)', display: 'inline-block' },
  btnGhost: { background: 'rgba(52,211,153,0.12)', color: '#34d399', padding: '14px 28px', borderRadius: '40px', fontWeight: 700, fontSize: '0.9rem', border: '1.5px solid rgba(52,211,153,0.3)', cursor: 'pointer' },
  btnDark: { background: '#0f1e2c', color: 'white', padding: '14px 32px', borderRadius: '40px', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', display: 'inline-block', border: 'none', cursor: 'pointer' },

  section: { padding: '80px 24px', background: 'white' },
  container: { maxWidth: '1100px', margin: '0 auto' },
  sectionLabel: { fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', color: '#7c3aed', textTransform: 'uppercase' as const, marginBottom: '12px', textAlign: 'center' as const },
  sectionTitle: { fontSize: '2.2rem', fontWeight: 900, color: '#0f1e2c', margin: '0 0 48px', textAlign: 'center' as const },

  servicesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '48px' },
  serviceCard: { background: '#f8fafc', borderRadius: '16px', padding: '28px', border: '1px solid #f1f5f9' },
  serviceIcon: { fontSize: '2rem', marginBottom: '12px' },
  serviceName: { fontSize: '1rem', fontWeight: 700, color: '#0f1e2c', margin: '0 0 8px' },
  serviceDesc: { fontSize: '0.875rem', color: '#64748b', margin: 0, lineHeight: 1.6 },
  bookCta: { display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' as const },

  reignGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' },
  reignCard: { background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)', borderRadius: '16px', padding: '24px' },
  reignIcon: { fontSize: '1.8rem', marginBottom: '12px' },
  reignCardTitle: { fontSize: '0.95rem', fontWeight: 700, color: '#34d399', margin: '0 0 8px' },
  reignCardBody: { fontSize: '0.82rem', color: 'rgba(240,253,244,0.65)', margin: 0, lineHeight: 1.6 },
  videoLink: { color: '#34d399', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', padding: '10px 20px', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '40px', background: 'rgba(52,211,153,0.08)' },

  paymentBox: { display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '48px', alignItems: 'center', background: 'white', borderRadius: '24px', padding: '48px', boxShadow: '0 2px 24px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' },
  paymentLeft: {},
  paymentTitle: { fontSize: '1.4rem', fontWeight: 800, color: '#0f1e2c', margin: '0 0 12px' },
  paymentBody: { fontSize: '0.9rem', color: '#475569', lineHeight: 1.7, margin: '0 0 20px' },
  paymentBadge: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#64748b', fontWeight: 600 },
  badgeDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block', flexShrink: 0 },
  paymentRight: { display: 'flex', flexDirection: 'column', gap: '24px' },
  paymentStat: { textAlign: 'center' as const },
  paymentStatNum: { fontSize: '2rem', fontWeight: 900, color: '#7c3aed' },
  paymentStatLabel: { fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 },

  footer: { background: '#0f1e2c', padding: '48px 24px' },
  footerInner: { maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'center' },
  footerBrand: { display: 'flex', alignItems: 'center', gap: '14px' },
  footerName: { color: 'white', fontWeight: 700, fontSize: '1rem' },
  footerTagline: { color: '#64748b', fontSize: '0.78rem', marginTop: '4px' },
  footerLinks: { display: 'flex', gap: '24px', flexWrap: 'wrap' as const, justifyContent: 'center' },
  footerLink: { color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500 },
  footerPowered: { display: 'flex', alignItems: 'center', gap: '8px' },

  distroBox: { display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '60px', alignItems: 'start' },
  distroLeft: {},
  distroIntro: { fontSize: '1.05rem', color: '#3b0764', fontWeight: 600, lineHeight: 1.7, margin: '0 0 16px' },
  distroBody: { fontSize: '0.9rem', color: '#4b5563', lineHeight: 1.8, margin: '0 0 28px' },
  distroPoints: { display: 'flex', flexDirection: 'column' as const, gap: '14px' },
  distroPoint: { display: 'flex', alignItems: 'flex-start', gap: '12px' },
  distroPointIcon: { fontSize: '1.2rem', flexShrink: 0, marginTop: '2px' },
  distroPointText: { fontSize: '0.9rem', color: '#374151', lineHeight: 1.6 },
  distroRight: {},
  distroCard: { background: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 4px 24px rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.12)' },
  distroCardTop: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' },
  distroCardIcon: { fontSize: '1.8rem' },
  distroCardLabel: { fontWeight: 800, color: '#5b21b6', fontSize: '0.95rem' },
  distroStat: { padding: '16px 0', borderBottom: '1px solid #f3e8ff' },
  distroStatNum: { fontSize: '1.6rem', fontWeight: 900, color: '#7c3aed' },
  distroStatLabel: { fontSize: '0.78rem', color: '#9ca3af', fontWeight: 600, marginTop: '2px' },

  modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalBox: { background: 'white', borderRadius: '20px', padding: '32px', maxWidth: '400px', width: '90%', position: 'relative' },
  modalClose: { position: 'absolute', top: '16px', right: '16px', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 700 },
}
