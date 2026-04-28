import { useState } from 'react'
import UnifiedNav from '../components/UnifiedNav'

const DECKS = [
  {
    id: 'flywheel',
    title: 'The SOLVY Data Flywheel',
    subtitle: 'SPS Partnership Proposal',
    description: 'Strategic partnership deck covering the SOLVY data ecosystem, SPS Joint Venture revenue model, and flywheel growth mechanics.',
    file: '/presentations/SOLVY-Data-Flywheel-SPS-Partnership.pdf',
    color: '#1e3a5f',
    accent: '#ffb347',
    icon: '⚙️',
    tags: ['SPS', 'Data', 'Revenue', 'Partnership'],
  },
  {
    id: 'neobank',
    title: 'SOVEREIGNITITY™ — SOLVY',
    subtitle: 'Cooperative Neobank for IBC Practitioners',
    description: 'Full investor and partner presentation covering the cooperative ownership model, IBC integration, MOLI/BOLI underwriting strategy, and Juneteenth launch plan.',
    file: '/presentations/SOVEREIGNITITY-Cooperative-Neobank-IBC.pdf',
    color: '#064e3b',
    accent: '#34d399',
    icon: '🏦',
    tags: ['IBC', 'Cooperative', 'Neobank', 'Investor'],
  },
]

export default function Presentations() {
  const [active, setActive] = useState<string | null>(null)

  const activeDeck = DECKS.find((d) => d.id === active)

  return (
    <div style={s.page}>
      <UnifiedNav currentPage="solvy" />

      <div style={s.container}>
        <div style={s.header}>
          <h1 style={s.title}>Investor &amp; Partner Presentations</h1>
          <p style={s.sub}>SOLVY Ecosystem™ · Confidential · For authorized use only</p>
        </div>

        {!active && (
          <div style={s.grid}>
            {DECKS.map((deck) => (
              <div key={deck.id} style={{ ...s.card, borderTop: `4px solid ${deck.accent}` }}>
                <div style={{ ...s.cardIcon, background: deck.color }}>{deck.icon}</div>
                <h2 style={s.cardTitle}>{deck.title}</h2>
                <p style={s.cardSubtitle}>{deck.subtitle}</p>
                <p style={s.cardDesc}>{deck.description}</p>
                <div style={s.tagRow}>
                  {deck.tags.map((t) => (
                    <span key={t} style={{ ...s.tag, background: `${deck.accent}22`, color: deck.color }}>{t}</span>
                  ))}
                </div>
                <div style={s.actions}>
                  <button onClick={() => setActive(deck.id)} style={{ ...s.viewBtn, background: deck.color }}>
                    View Presentation
                  </button>
                  <a href={deck.file} target="_blank" rel="noopener noreferrer" style={s.openBtn}>
                    Open in New Tab ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {active && activeDeck && (
          <div style={s.viewer}>
            <div style={s.viewerHeader}>
              <div>
                <div style={s.viewerTitle}>{activeDeck.title}</div>
                <div style={s.viewerSub}>{activeDeck.subtitle}</div>
              </div>
              <div style={s.viewerActions}>
                <a href={activeDeck.file} target="_blank" rel="noopener noreferrer" style={s.openBtn}>
                  Open Full Screen ↗
                </a>
                <button onClick={() => setActive(null)} style={s.backBtn}>
                  ← Back to All
                </button>
              </div>
            </div>
            <iframe
              src={activeDeck.file}
              style={s.iframe}
              title={activeDeck.title}
            />
          </div>
        )}
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { background: '#f8fafc', minHeight: '100vh' },
  container: { maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' },
  header: { marginBottom: '40px', paddingBottom: '24px', borderBottom: '2px solid #e2e8f0' },
  title: { fontSize: '1.8rem', fontWeight: 800, color: '#0f1e2c', margin: '0 0 8px' },
  sub: { color: '#94a3b8', fontSize: '0.9rem', margin: 0 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '28px' },
  card: { background: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '14px' },
  cardIcon: { width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem' },
  cardTitle: { fontSize: '1.25rem', fontWeight: 800, color: '#0f1e2c', margin: 0 },
  cardSubtitle: { fontSize: '0.85rem', fontWeight: 600, color: '#64748b', margin: 0 },
  cardDesc: { fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, margin: 0 },
  tagRow: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  tag: { fontSize: '0.72rem', fontWeight: 700, padding: '4px 10px', borderRadius: '20px' },
  actions: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' },
  viewBtn: { color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', flex: 1 },
  openBtn: { color: '#0f1e2c', border: '1.5px solid #cbd5e1', padding: '12px 20px', borderRadius: '10px', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none', display: 'inline-block', textAlign: 'center' },
  viewer: { background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' },
  viewerHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 28px', borderBottom: '1px solid #f0f4f8', flexWrap: 'wrap', gap: '12px' },
  viewerTitle: { fontSize: '1.1rem', fontWeight: 800, color: '#0f1e2c' },
  viewerSub: { fontSize: '0.82rem', color: '#64748b', marginTop: '2px' },
  viewerActions: { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' },
  backBtn: { background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#0f1e2c', padding: '10px 18px', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' },
  iframe: { width: '100%', height: '85vh', border: 'none', display: 'block' },
}
