import { Browser } from '@capacitor/browser'

function Card() {
  return (
    <div style={{ padding: '1rem', paddingBottom: '80px' }}>
      <h1 style={{
        fontSize: '1.5rem',
        fontWeight: 800,
        color: '#fff',
        marginBottom: '0.5rem'
      }}>
        SOLVY Card™
      </h1>
      <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        Your cooperative debit card for generational wealth.
      </p>

      {/* Card Visual */}
      <div style={{
        background: 'linear-gradient(135deg, #a855f7, #3b82f6, #22c55e)',
        borderRadius: '20px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)'
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 900 }}>SOLVY</span>
            <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>DEBIT</span>
          </div>
          <p style={{ fontSize: '1.1rem', letterSpacing: '2px', marginBottom: '1.5rem' }}>
            •••• •••• •••• 0000
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.6rem', opacity: 0.7, textTransform: 'uppercase' }}>Card Holder</p>
              <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>MEMBER NAME</p>
            </div>
            <div>
              <p style={{ fontSize: '0.6rem', opacity: 0.7, textTransform: 'uppercase' }}>Expires</p>
              <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>MM/YY</p>
            </div>
          </div>
        </div>
      </div>

      {/* Card Controls */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0.75rem',
        marginBottom: '1.5rem'
      }}>
        <ControlButton icon="🔒" label="Lock" />
        <ControlButton icon="📍" label="PIN" />
        <ControlButton icon="💳" label="Limit" />
        <ControlButton icon="📋" label="Details" />
      </div>

      {/* 70/20/10 Model */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
          70/20/10 Economic Model
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <ModelBar label="Member Dividends" percent={70} color="#22c55e" />
          <ModelBar label="Community Development" percent={20} color="#3b82f6" />
          <ModelBar label="Operations Reserve" percent={10} color="#a855f7" />
        </div>
      </div>

      {/* Unit.co Integration Note */}
      <div style={{
        padding: '1rem',
        background: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '12px'
      }}>
        <p style={{ color: '#3b82f6', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
          🏦 Powered by Unit.co + Thread Bank
        </p>
        <p style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
          Your deposits are FDIC-insured up to $250,000 through our banking partner.
        </p>
      </div>
    </div>
  )
}

function ControlButton({ icon, label }) {
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
      <span style={{ fontSize: '1.3rem' }}>{icon}</span>
      {label}
    </button>
  )
}

function ModelBar({ label, percent, color }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
        <span style={{ fontSize: '0.8rem', color: '#fff' }}>{label}</span>
        <span style={{ fontSize: '0.8rem', color, fontWeight: 700 }}>{percent}%</span>
      </div>
      <div style={{
        width: '100%',
        height: '8px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${percent}%`,
          height: '100%',
          background: color,
          borderRadius: '4px'
        }} />
      </div>
    </div>
  )
}

export default Card
