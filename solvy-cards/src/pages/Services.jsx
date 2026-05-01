import { Browser } from '@capacitor/browser'
import { AppLauncher } from '@capacitor/app-launcher'

function Services() {
  const openLink = async (url) => {
    await Browser.open({ url })
  }

  const services = [
    {
      title: 'Evergreen Beauty Lounge',
      description: 'Book beauty services, spa treatments, and wellness sessions. Pay with SOLVY Card™.',
      url: 'https://ebl.beauty',
      icon: '💅',
      color: '#a855f7'
    },
    {
      title: 'Reign by EBL',
      description: 'Shop premium beauty products, skincare, and self-care essentials.',
      url: 'https://ebl.beauty/#reign',
      icon: '👑',
      color: '#f59e0b'
    },
    {
      title: 'SOLVY Banking',
      description: 'Full banking portal — accounts, transfers, statements, and more.',
      url: 'https://ebl.beauty/banking',
      icon: '🏦',
      color: '#3b82f6'
    },
    {
      title: 'SPS Partnership',
      description: 'Supply chain solutions and vendor management for the ecosystem.',
      url: 'https://ebl.beauty/sps',
      icon: '🤝',
      color: '#22c55e'
    },
    {
      title: 'DECIDEY NGO',
      description: 'Community development projects and cooperative initiatives.',
      url: 'https://ebl.beauty/decidey',
      icon: '🌍',
      color: '#ec4899'
    }
  ]

  return (
    <div style={{ padding: '1rem', paddingBottom: '80px' }}>
      <h1 style={{
        fontSize: '1.5rem',
        fontWeight: 800,
        color: '#fff',
        marginBottom: '0.5rem'
      }}>
        SOLVY Services
      </h1>
      <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        Access the full SOLVY Ecosystem™ from one place.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {services.map((service, i) => (
          <ServiceCard key={i} {...service} onClick={() => openLink(service.url)} />
        ))}
      </div>

      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        background: 'rgba(34, 197, 94, 0.1)',
        border: '1px solid rgba(34, 197, 94, 0.3)',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#22c55e', fontSize: '0.85rem', fontWeight: 600 }}>
          🛡️ All transactions secured by Unit.co & Thread Bank
        </p>
      </div>
    </div>
  )
}

function ServiceCard({ title, description, icon, color, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '1rem',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '16px',
      padding: '1.25rem',
      color: '#fff',
      textAlign: 'left',
      cursor: 'pointer',
      width: '100%',
      transition: 'all 0.2s'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: `${color}20`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.5rem',
        flexShrink: 0
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>{title}</p>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.4 }}>{description}</p>
      </div>
      <span style={{ color: color, fontSize: '1.2rem', flexShrink: 0 }}>↗</span>
    </button>
  )
}

export default Services
