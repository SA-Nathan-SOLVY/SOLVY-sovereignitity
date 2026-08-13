import { Link } from 'react-router-dom'
import UnifiedNav from '../components/UnifiedNav'
import SolvyFooter from '../components/SolvyFooter'

type Platform = 'android' | 'ios'

const COPY: Record<Platform, {
  name: string
  icon: string
  store: string
  accent: string
  other: { label: string; to: string }
}> = {
  android: {
    name: 'Android',
    icon: '🤖',
    store: 'Google Play',
    accent: '#4ade80',
    other: { label: 'iOS App Info', to: '/card-ios-app' },
  },
  ios: {
    name: 'iOS',
    icon: '📱',
    store: 'App Store',
    accent: '#38bdf8',
    other: { label: 'Android App Info', to: '/card-android-app' },
  },
}

const FEATURES = [
  { icon: '💳', title: 'Tap-to-pay SOLVY Card', desc: 'Spend from your cooperative account with member-owned rails.' },
  { icon: '📊', title: 'Live balance & activity', desc: 'Track transactions, membership pool contributions, and savings in real time.' },
  { icon: '🔐', title: 'Data sovereignty', desc: 'Your financial data stays yours — encrypted and member-controlled.' },
  { icon: '🤝', title: 'Cooperative dividends', desc: 'Watch your membership pool share accumulate as you spend within the ecosystem.' },
]

function CardAppInfo({ platform }: { platform: Platform }) {
  const c = COPY[platform]

  return (
    <div style={s.page}>
      <UnifiedNav />

      <div style={s.devBanner}>
        <span style={s.devDot} />
        SOLVY Card App ({c.name}) — Feature in Development · Internal Preview Only
      </div>

      <section style={s.hero}>
        <p style={s.heroEyebrow}>SOLVY Card · {c.name}</p>
        <h1 style={s.heroTitle}>
          <span style={{ ...s.heroAccent, color: c.accent }}>{c.icon} {c.name} App</span>
        </h1>
        <p style={s.heroSub}>
          The SOLVY Card app puts cooperative banking in your pocket. We're putting the finishing
          touches on the {c.name} experience — download the SOLVY app when available.
        </p>
        <div style={s.statusPill}>
          <span style={{ ...s.statusDot, background: c.accent }} />
          Coming Soon to {c.store}
        </div>
      </section>

      <section style={s.section}>
        <div style={s.container}>
          <p style={s.sectionEyebrow}>What's coming</p>
          <h2 style={s.sectionHeading}>Built for members, owned by members</h2>
          <div style={s.featureGrid}>
            {FEATURES.map(f => (
              <div key={f.title} style={s.featureCard}>
                <div style={s.featureIcon}>{f.icon}</div>
                <h3 style={s.featureTitle}>{f.title}</h3>
                <p style={s.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={s.section}>
        <div style={s.container}>
          <div style={{ ...s.earlyCard, borderColor: c.accent + '40' }}>
            <h2 style={s.earlyTitle}>Want it first?</h2>
            <p style={s.earlySub}>
              Prelaunch members get early access to SOLVY Card issuance and priority onboarding the
              moment the {c.name} app goes live.
            </p>
            <div style={s.ctaRow}>
              <Link to="/prelaunch" style={{ ...s.ctaPrimary, background: c.accent }}>Prelaunch Commit</Link>
              <Link to="/apply" style={s.ctaSecondary}>Apply for Card</Link>
              <Link to={c.other.to} style={s.ctaGhost}>{c.other.label} →</Link>
            </div>
          </div>
        </div>
      </section>

      <SolvyFooter />
    </div>
  )
}

export function CardAndroidApp() {
  return <CardAppInfo platform="android" />
}

export function CardIosApp() {
  return <CardAppInfo platform="ios" />
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#0f172a', color: '#fff', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
  devBanner: { background: 'rgba(251,191,36,0.1)', borderBottom: '1px solid rgba(251,191,36,0.2)', padding: '10px 24px', textAlign: 'center', fontSize: '0.78rem', fontWeight: 600, color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', letterSpacing: '0.02em' },
  devDot: { width: '7px', height: '7px', borderRadius: '50%', background: '#fbbf24', display: 'inline-block', flexShrink: 0 },
  container: { maxWidth: '1160px', margin: '0 auto', padding: '0 24px' },
  hero: { textAlign: 'center', padding: '80px 24px 56px', background: 'linear-gradient(180deg, rgba(124,58,237,0.12) 0%, transparent 100%)' },
  heroEyebrow: { fontSize: '0.85rem', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' },
  heroTitle: { fontSize: 'clamp(2.6rem, 8vw, 4.4rem)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '20px', lineHeight: 1.1 },
  heroAccent: { color: '#ffb347' },
  heroSub: { fontSize: '1.05rem', color: 'rgba(255,255,255,0.6)', maxWidth: '680px', margin: '0 auto', lineHeight: 1.7 },
  statusPill: { display: 'inline-flex', alignItems: 'center', gap: '10px', marginTop: '28px', padding: '10px 22px', borderRadius: '40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', fontSize: '0.9rem', fontWeight: 600 },
  statusDot: { width: '9px', height: '9px', borderRadius: '50%', display: 'inline-block' },
  section: { padding: '40px 0' },
  sectionEyebrow: { fontSize: '0.8rem', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px', textAlign: 'center' },
  sectionHeading: { fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 800, textAlign: 'center', marginBottom: '36px' },
  featureGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' },
  featureCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '26px 22px' },
  featureIcon: { fontSize: '2rem', marginBottom: '14px' },
  featureTitle: { fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px' },
  featureDesc: { fontSize: '0.92rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 },
  earlyCard: { background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '20px', padding: '40px 32px', textAlign: 'center', maxWidth: '780px', margin: '0 auto' },
  earlyTitle: { fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, marginBottom: '12px' },
  earlySub: { fontSize: '1rem', color: 'rgba(255,255,255,0.65)', maxWidth: '560px', margin: '0 auto 28px', lineHeight: 1.7 },
  ctaRow: { display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'center', alignItems: 'center' },
  ctaPrimary: { padding: '13px 26px', borderRadius: '40px', background: '#7c3aed', color: '#0f172a', fontWeight: 700, textDecoration: 'none', fontSize: '0.95rem' },
  ctaSecondary: { padding: '13px 26px', borderRadius: '40px', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.25)', fontWeight: 600, textDecoration: 'none', fontSize: '0.95rem' },
  ctaGhost: { color: '#a78bfa', fontWeight: 600, textDecoration: 'none', fontSize: '0.95rem' },
}

export default CardAppInfo
