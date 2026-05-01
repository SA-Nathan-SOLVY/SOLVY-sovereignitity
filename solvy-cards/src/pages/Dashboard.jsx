import { Browser } from '@capacitor/browser'

function Dashboard() {
  const openEBL = async () => {
    await Browser.open({ url: 'https://ebl.beauty' })
  }

  const openReign = async () => {
    await Browser.open({ url: 'https://ebl.beauty/#reign' })
  }

  return (
    <div style={{ padding: '1rem', paddingBottom: '80px' }}>
      {/* Balance Card */}
      <div style={{
        background: 'linear-gradient(135deg, #a855f7, #3b82f6, #22c55e)',
        borderRadius: '20px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        color: '#fff'
      }}>
        <p style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '0.5rem' }}>Available Balance</p>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '0.5rem' }}>$0.00</h2>
        <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>SOLVY Card™ •••• 0000</p>
      </div>

      {/* Quick Actions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0.75rem',
        marginBottom: '1.5rem'
      }}>
        <ActionButton icon="💸" label="Send" />
        <ActionButton icon="📥" label="Request" />
        <ActionButton icon="📷" label="Scan" />
        <ActionButton icon="🏦" label="Deposit" />
      </div>

      {/* Recent Activity */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>Recent Activity</h3>
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '1.5rem',
          textAlign: 'center',
          color: '#94a3b8'
        }}>
          <span style={{ fontSize: '2rem' }}>📊</span>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>No transactions yet</p>
          <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Your activity will appear here</p>
        </div>
      </div>

      {/* Ecosystem Links */}
      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>SOLVY Ecosystem</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <EcosystemCard
            title="Evergreen Beauty Lounge"
            subtitle="Book services & pay with SOLVY"
            icon="💅"
            onClick={openEBL}
          />
          <EcosystemCard
            title="Reign by EBL"
            subtitle="Order products & essentials"
            icon="👑"
            onClick={openReign}
          />
        </div>
      </div>
    </div>
  )
}

function ActionButton({ icon, label }) {
  return (
    <button style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.5rem',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '12px',
      padding: '0.75rem',
      color: '#fff',
      fontSize: '0.7rem',
      cursor: 'pointer',
      width: '100%'
    }}>
      <span style={{ fontSize: '1.5rem' }}>{icon}</span>
      {label}
    </button>
  )
}

function EcosystemCard({ title, subtitle, icon, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '12px',
      padding: '1rem',
      color: '#fff',
      textAlign: 'left',
      cursor: 'pointer',
      width: '100%'
    }}>
      <span style={{ fontSize: '2rem' }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{title}</p>
        <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>{subtitle}</p>
      </div>
      <span style={{ color: '#22c55e', fontSize: '1.2rem' }}>→</span>
    </button>
  )
}

export default Dashboard
