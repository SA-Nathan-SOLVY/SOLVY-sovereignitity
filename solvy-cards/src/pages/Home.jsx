function Home() {
  return (
    <>
      <section className="hero" style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        padding: '6rem 2rem 4rem',
        background: 'linear-gradient(135deg, #0f172a, #1e293b, #0f172a)'
      }}>
        <div style={{
          maxWidth: 1400,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '4rem',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <img 
              src="/SolvyLogo-1024.png" 
              alt="SOLVY Logo" 
              style={{ 
                maxWidth: 500, 
                width: '100%', 
                height: 'auto',
                filter: 'drop-shadow(0 10px 30px rgba(147,51,234,0.3))'
              }} 
            />
            <h1 style={{
              fontSize: '2.8rem',
              fontWeight: 900,
              background: 'linear-gradient(135deg, #a855f7, #60a5fa, #34d399)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '0.5rem',
              letterSpacing: '-0.5px'
            }}>
              SOLVY Ecosystem™
            </h1>
            <p style={{
              fontSize: '1.8rem',
              background: 'linear-gradient(135deg, #9333ea, #3b82f6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
              marginBottom: '1rem'
            }}>
              America's First P2P Payment Platform
            </p>
            <p style={{ fontSize: '1.2rem', color: '#94a3b8', lineHeight: 1.6 }}>
              Building generational wealth infrastructure for families who survived 
              slavery, displacement, and colonialism through cooperative economic ownership.
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button style={{
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: '#fff',
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                border: 'none'
              }}>
                Get Started
              </button>
              <button style={{
                background: 'transparent',
                color: '#fff',
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                border: '1px solid rgba(255,255,255,0.3)'
              }}>
                Learn More
              </button>
            </div>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '24px',
            padding: '2rem',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            {/* Placeholder for card/payment visual */}
            <div style={{
              aspectRatio: '1.586',
              background: 'linear-gradient(135deg, #a855f7, #3b82f6, #22c55e)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 700
            }}>
              SOLVY Card™
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Home
