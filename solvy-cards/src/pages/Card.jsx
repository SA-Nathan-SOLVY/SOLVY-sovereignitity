function Card() {
  return (
    <div className="container">
      <h1 style={{
        fontSize: '3rem',
        fontWeight: 900,
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, #a855f7, #3b82f6)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        SOLVY Card™
      </h1>
      <p style={{ fontSize: '1.2rem', color: '#94a3b8', marginBottom: '3rem' }}>
        Your gateway to cooperative financial empowerment.
      </p>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '16px',
          padding: '2rem',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <h3 style={{ color: '#22c55e', marginBottom: '1rem' }}>70% Member Dividends</h3>
          <p style={{ color: '#94a3b8' }}>
            The majority of interchange revenue goes directly back to member-owners 
            as patronage dividends.
          </p>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '16px',
          padding: '2rem',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <h3 style={{ color: '#22c55e', marginBottom: '1rem' }}>20% Community Development</h3>
          <p style={{ color: '#94a3b8' }}>
            Community-controlled development pool for cooperative economic projects.
          </p>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '16px',
          padding: '2rem',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <h3 style={{ color: '#22c55e', marginBottom: '1rem' }}>10% Operations Reserve</h3>
          <p style={{ color: '#94a3b8' }}>
            Sustainable operations to keep the platform running for generations.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Card
