import UnifiedNav from '../components/UnifiedNav'
import './Banking.css'

function Banking() {
  return (
    <div className="banking-page">
      <UnifiedNav />

      <section className="banking-hero">
        <div className="container">
          <h1>SOLVY Banking Portal</h1>
          <p className="banking-subtitle">
            Your cooperative financial services hub
          </p>
          <div className="banking-badges">
            <span className="badge">FDIC Insured</span>
            <span className="badge">Virtual Debit Cards</span>
            <span className="badge">Instant Transfers</span>
          </div>
        </div>
      </section>

      <section className="banking-info">
        <div className="container">
          <div className="info-grid">
            <div className="info-card">
              <div className="info-icon">🏦</div>
              <h3>Open Your Account</h3>
              <p>Quick verification process to get started with your SOLVY cooperative account</p>
            </div>
            <div className="info-card">
              <div className="info-icon">💳</div>
              <h3>Virtual Debit Card</h3>
              <p>Get instant access to your virtual card for online purchases</p>
            </div>
            <div className="info-card">
              <div className="info-icon">📱</div>
              <h3>Send & Receive</h3>
              <p>Transfer funds instantly to other SOLVY members</p>
            </div>
            <div className="info-card">
              <div className="info-icon">📊</div>
              <h3>Track Everything</h3>
              <p>Full transaction history and spending insights</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Banking
