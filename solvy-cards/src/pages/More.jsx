import { Browser } from '@capacitor/browser'
import { Share } from '@capacitor/share'

function More() {
  const openPWA = async () => {
    await Browser.open({ url: 'https://ebl.beauty' })
  }

  const shareApp = async () => {
    await Share.share({
      title: 'SOLVY Card™',
      text: 'Join the SOLVY Ecosystem™ — America\'s First Cooperative P2P Payment Platform.',
      url: 'https://ebl.beauty',
      dialogTitle: 'Share SOLVY'
    })
  }

  const menuItems = [
    { icon: '🏦', label: 'Full Banking Portal', action: openPWA },
    { icon: '📋', label: 'Account Settings', action: () => {} },
    { icon: '🔔', label: 'Notifications', action: () => {} },
    { icon: '🛡️', label: 'Security', action: () => {} },
    { icon: '❓', label: 'Help & Support', action: () => {} },
    { icon: '📤', label: 'Share SOLVY', action: shareApp },
  ]

  return (
    <div style={{ padding: '1rem', paddingBottom: '80px' }}>
      <h1 style={{
        fontSize: '1.5rem',
        fontWeight: 800,
        color: '#fff',
        marginBottom: '0.5rem'
      }}>
        More
      </h1>
      <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        Settings, support, and ecosystem access.
      </p>

      {/* User Profile */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '16px',
        padding: '1.25rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #a855f7, #3b82f6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem'
        }}>
          👤
        </div>
        <div>
          <p style={{ fontWeight: 700, color: '#fff' }}>Member Account</p>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>SOLVY Card™ Holder</p>
        </div>
      </div>

      {/* Menu Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {menuItems.map((item, i) => (
          <MenuItem key={i} {...item} />
        ))}
      </div>

      {/* Version Info */}
      <div style={{
        marginTop: '2rem',
        textAlign: 'center',
        color: '#64748b',
        fontSize: '0.75rem'
      }}>
        <p>SOLVY Card™ v1.0.0</p>
        <p style={{ marginTop: '0.25rem' }}>Product of SA Nathan LLC</p>
        <p style={{ marginTop: '0.25rem' }}>© 2026 SOLVY Ecosystem™</p>
      </div>
    </div>
  )
}

function MenuItem({ icon, label, action }) {
  return (
    <button onClick={action} style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: '12px',
      padding: '1rem',
      color: '#fff',
      textAlign: 'left',
      cursor: 'pointer',
      width: '100%'
    }}>
      <span style={{ fontSize: '1.25rem', width: '32px', textAlign: 'center' }}>{icon}</span>
      <span style={{ flex: 1, fontSize: '0.9rem' }}>{label}</span>
      <span style={{ color: '#64748b' }}>›</span>
    </button>
  )
}

export default More
