import { Link } from 'react-router-dom'

function Layout({ children }) {
  return (
    <div className="app">
      <nav style={{
        padding: '1rem 2rem',
        background: 'rgba(15, 23, 42, 0.9)',
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
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img src="/SolvyLogo-1024.png" alt="SOLVY" style={{ height: 40 }} />
            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff' }}>SOLVY</span>
          </Link>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <Link to="/" style={{ color: '#fff', opacity: 0.8 }}>Home</Link>
            <Link to="/card" style={{ color: '#fff', opacity: 0.8 }}>Card</Link>
            <Link to="/banking" style={{ color: '#fff', opacity: 0.8 }}>Banking</Link>
          </div>
        </div>
      </nav>
      <main>{children}</main>
      <footer style={{
        padding: '2rem',
        textAlign: 'center',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        color: '#94a3b8'
      }}>
        <p>Product of SA Nathan LLC</p>
        <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
          SOLVY Ecosystem™ — Building generational wealth
        </p>
      </footer>
    </div>
  )
}

export default Layout
