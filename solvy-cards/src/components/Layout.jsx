import { Link, useLocation } from 'react-router-dom'
import { Browser } from '@capacitor/browser'

function Layout({ children }) {
  const location = useLocation()
  const isActive = (path) => location.pathname === path

  const openPWA = async () => {
    await Browser.open({ url: 'https://ebl.beauty' })
  }

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/card', label: 'Card', icon: '💳' },
    { path: '/services', label: 'Services', icon: '✨' },
    { path: '/receipts', label: 'Receipts', icon: '🧾' },
    { path: '/more', label: 'More', icon: '⚙️' },
  ]

  return (
    <div className="app" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <nav style={{
        padding: '0.75rem 1rem',
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{
          maxWidth: 1400,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ position: 'relative' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <img src="/SolvyLogo-1024.png" alt="SOLVY" style={{ height: 32 }} />
              <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff' }}>SOLVY ▼</span>
            </Link>
            <div style={{
              display: 'none',
              position: 'absolute',
              left: 0,
              top: '100%',
              background: 'rgba(15,23,42,0.95)',
              backdropFilter: 'blur(10px)',
              minWidth: '240px',
              borderRadius: '12px',
              padding: '0.5rem 0',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.1)',
              zIndex: 1000
            }} className="logo-dropdown-menu">
              <div style={{ color: '#94a3b8', fontSize: '0.75rem', padding: '0.5rem 1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Main Sites</div>
              <a href="https://ebl.beauty" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none', display: 'block', padding: '0.6rem 1rem', fontSize: '0.85rem' }}>🏠 ebl.beauty</a>
              <a href="https://solvy.cards" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none', display: 'block', padding: '0.6rem 1rem', fontSize: '0.85rem' }}>💳 solvy.cards</a>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '0.25rem 0' }}></div>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem', padding: '0.5rem 1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Legal</div>
              <a href="https://solvy.cards/underwriting" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none', display: 'block', padding: '0.6rem 1rem', fontSize: '0.85rem' }}>📋 Underwriting</a>
              <a href="https://solvy.cards/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none', display: 'block', padding: '0.6rem 1rem', fontSize: '0.85rem' }}>🛡️ Privacy Policy</a>
              <a href="https://solvy.cards/terms" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none', display: 'block', padding: '0.6rem 1rem', fontSize: '0.85rem' }}>📄 Terms of Service</a>
              <a href="https://solvy.cards/cardholder" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none', display: 'block', padding: '0.6rem 1rem', fontSize: '0.85rem' }}>💳 Cardholder Agreement</a>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '0.25rem 0' }}></div>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem', padding: '0.5rem 1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Apps</div>
              <a href="https://solvy.cards/card-ios-app" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none', display: 'block', padding: '0.6rem 1rem', fontSize: '0.85rem' }}>🍎 iOS App</a>
              <a href="https://solvy.cards/card-android-app" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none', display: 'block', padding: '0.6rem 1rem', fontSize: '0.85rem' }}>🤖 Android App</a>
            </div>
          </div>
          <button 
            onClick={openPWA}
            style={{
              background: 'transparent',
              color: '#22c55e',
              border: '1px solid #22c55e',
              padding: '0.35rem 0.7rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            Full Platform ↗
          </button>
        </div>
      </nav>
      
      <main style={{ flex: 1 }}>{children}</main>
      
      {/* Mobile Bottom Navigation */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '0.4rem 0',
        zIndex: 100
      }}>
        {navItems.map(({ path, label, icon }) => (
          <Link key={path} to={path} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.15rem',
            color: isActive(path) ? '#22c55e' : '#94a3b8',
            textDecoration: 'none',
            fontSize: '0.65rem',
            padding: '0.3rem 0.5rem',
            borderRadius: '8px',
            background: isActive(path) ? 'rgba(34,197,94,0.1)' : 'transparent'
          }}>
            <span style={{ fontSize: '1.1rem' }}>{icon}</span>
            {label}
          </Link>
        ))}
      </nav>
    </div>
  )
}

export default Layout
