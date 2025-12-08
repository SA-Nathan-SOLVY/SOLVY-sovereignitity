import { useState } from 'react'
import './App.css'

function App() {
  const [currentCard, setCurrentCard] = useState(0)
  
  const cards = [
    { name: 'SOLVY Business Card - Mastercard', image: '/SOV.png', type: 'Business' },
    { name: 'SOLVY Business Card - Visa', image: '/SOV-visa.png', type: 'Business' },
    { name: 'SOLVY Personal Card - Mastercard', image: '/SOV-personal-mc.png', type: 'Personal' },
    { name: 'SOLVY Personal Card - Visa', image: '/SOV-personal-visa.png', type: 'Personal' }
  ]

  const nextCard = () => {
    setCurrentCard((prev) => (prev + 1) % cards.length)
  }

  const prevCard = () => {
    setCurrentCard((prev) => (prev - 1 + cards.length) % cards.length)
  }

  return (
    <div className="app">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <span className="crown-icon">👑</span>
            <span className="logo-text">SOLVY</span>
          </div>
          <div className="nav-links">
            <a href="#home">Home</a>
            <a href="#card">SOLVY Card</a>
            <a href="#sovereignitity">SOVEREIGNITITY™</a>
            <a href="https://ebl.beauty" target="_blank" rel="noopener">EBL Pilot</a>
            <a href="#decidey">DECIDEY NGO</a>
            <a href="#remittance">Remittance</a>
          </div>
          <div className="nav-cta">
            <button className="btn-primary">Get Your Card</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-headline">SOLUTIONS VALUED YOU</h1>
            <h2 className="hero-subheadline">America's First P2P Payment Platform</h2>
            <p className="hero-statement">
              Created by SA Nathan, SOLVY serves Americans who understand the truth - that this nation was built by those seeking opportunity. As <strong>America's first peer-to-peer payment platform</strong>, we deliver data sovereignty and economic autonomy through cooperative ownership, breaking free from systems of economic entrapment.
            </p>
            <div className="hero-cta">
              <button className="btn-large btn-primary">Get Your SOLVY Card</button>
              <button className="btn-large btn-secondary">See It In Action</button>
            </div>
          </div>
          <div className="hero-card-showcase">
            <div className="card-display">
              <img 
                src={cards[currentCard].image} 
                alt={cards[currentCard].name}
                className="card-image"
              />
              <div className="card-info">
                <span className="card-type">{cards[currentCard].type} Card</span>
              </div>
            </div>
            <div className="card-controls">
              <button onClick={prevCard} className="card-nav-btn">←</button>
              <div className="card-dots">
                {cards.map((_, index) => (
                  <span 
                    key={index}
                    className={`dot ${index === currentCard ? 'active' : ''}`}
                    onClick={() => setCurrentCard(index)}
                  />
                ))}
              </div>
              <button onClick={nextCard} className="card-nav-btn">→</button>
            </div>
          </div>
        </div>
      </section>

      {/* SOLVY Card Section */}
      <section className="section card-section" id="card">
        <div className="container">
          <h2 className="section-title">👑 The SOLVY Card</h2>
          <p className="section-subtitle">Cooperative Ownership • Data Sovereignty • Member-First</p>
          
          <div className="card-grid">
            <div className="feature-card">
              <div className="feature-icon">🏢</div>
              <h3>Business Cards</h3>
              <p>For business owners who want their brand front and center. Accept payments with pride while maintaining data sovereignty.</p>
              <div className="card-preview-small">
                <img src="/SOV.png" alt="Business Card" />
              </div>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">👤</div>
              <h3>Personal Cards</h3>
              <p>For individuals seeking financial autonomy. Your name, your data, your sovereignty - not the bank's.</p>
              <div className="card-preview-small">
                <img src="/SOV-personal-mc.png" alt="Personal Card" />
              </div>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Privacy First</h3>
              <p>NFC-enabled contactless payments with PII protection. Your data stays yours, always.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🤝</div>
              <h3>Cooperative Model</h3>
              <p>Member-owned, not bank-owned. Share in the success through genuine cooperative ownership.</p>
            </div>
          </div>
          
          <div className="cta-center">
            <button className="btn-large btn-primary">Customize Your Card</button>
          </div>
        </div>
      </section>

      {/* SOVEREIGNITITY Section */}
      <section className="section sovereignitity-section" id="sovereignitity">
        <div className="container">
          <h2 className="section-title">SOVEREIGNITITY™</h2>
          <p className="section-subtitle">The Exercise of Achieving Control of Banking Through Cooperative Ownership</p>
          
          <div className="sovereignitity-content">
            <div className="sovereignitity-text">
              <h3>What is SOVEREIGNITITY™?</h3>
              <p>
                SOVEREIGNITITY™ is more than a concept - it's a movement. It represents the exercise of achieving true control of your banking through cooperative ownership. When you hold a SOLVY Card, you're not just a customer - you're a member-owner with genuine stake in the platform.
              </p>
              <h3>Data Sovereignty</h3>
              <p>
                Your financial data is yours. Period. No selling to third parties, no hidden tracking, no exploitation. We build technology that serves you, not the other way around.
              </p>
              <h3>Economic Autonomy</h3>
              <p>
                Break free from systems of economic entrapment. Build wealth cooperatively, earn income through the platform, and achieve true financial independence.
              </p>
            </div>
            <div className="sovereignitity-benefits">
              <div className="benefit-item">
                <span className="benefit-icon">✓</span>
                <span>Member-owned cooperative structure</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">✓</span>
                <span>Data sovereignty guaranteed</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">✓</span>
                <span>Income earning opportunities</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">✓</span>
                <span>Lower processing fees</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">✓</span>
                <span>Privacy-first technology</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">✓</span>
                <span>Community empowerment</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EBL Pilot Section */}
      <section className="section pilot-section">
        <div className="container">
          <h2 className="section-title">💅 See It In Action</h2>
          <p className="section-subtitle">Evergreen Beauty Lounge - Pilot Partner #1</p>
          
          <div className="pilot-content">
            <div className="pilot-text">
              <h3>Live & Processing Payments</h3>
              <p>
                Evergreen Beauty Lounge is our first pilot partner, demonstrating what genuine economic freedom achieves through community empowerment. Eva's beauty business now processes payments with full data sovereignty, keeping customer information private while building cooperative wealth.
              </p>
              <p>
                <strong>This is proof that SOLVY Card works.</strong> Real business, real payments, real sovereignty.
              </p>
              <div className="pilot-cta">
                <a href="https://ebl.beauty" target="_blank" rel="noopener" className="btn-large btn-secondary">
                  Visit EBL Site →
                </a>
              </div>
            </div>
            <div className="pilot-stats">
              <div className="stat-card">
                <div className="stat-value">✓</div>
                <div className="stat-label">Live Payments</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">✓</div>
                <div className="stat-label">NFC Enabled</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">✓</div>
                <div className="stat-label">Data Sovereign</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DECIDEY NGO Section */}
      <section className="section decidey-section" id="decidey">
        <div className="container">
          <h2 className="section-title">📚 DECIDEY NGO</h2>
          <p className="section-subtitle">Education • Advocacy • Digital Rights</p>
          
          <div className="decidey-content">
            <p className="decidey-mission">
              Breaking systemic barriers through education and digital rights advocacy. Continuing the legacy of Marcus Garvey, MLK, and Malcolm X in the modern era.
            </p>
            <div className="decidey-cta">
              <button className="btn-large btn-primary">Learn More</button>
            </div>
          </div>
        </div>
      </section>

      {/* Remittance Section */}
      <section className="section remittance-section" id="remittance">
        <div className="container">
          <h2 className="section-title">🌍 Global Remittance</h2>
          <p className="section-subtitle">SOLVY Card for Members Outside the US</p>
          
          <div className="remittance-content">
            <p>
              Send and receive money globally with SOLVY Card. Lower fees, faster transfers, and complete data sovereignty for international members.
            </p>
            <div className="remittance-features">
              <div className="remittance-feature">
                <span className="feature-icon">💸</span>
                <span>Lower Fees</span>
              </div>
              <div className="remittance-feature">
                <span className="feature-icon">⚡</span>
                <span>Fast Transfers</span>
              </div>
              <div className="remittance-feature">
                <span className="feature-icon">🔒</span>
                <span>Secure & Private</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section cta-section">
        <div className="container">
          <h2 className="cta-title">Ready to Achieve Financial Sovereignty?</h2>
          <p className="cta-text">
            Join the movement. Get your SOLVY Card and take control of your banking.
          </p>
          <button className="btn-large btn-primary">Get Started Today</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <span className="crown-icon">👑</span>
              <span className="logo-text">SOLVY</span>
              <p>Solutions Valued You</p>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>Platform</h4>
                <a href="#card">SOLVY Card</a>
                <a href="#sovereignitity">SOVEREIGNITITY™</a>
                <a href="#remittance">Remittance</a>
              </div>
              <div className="footer-column">
                <h4>Community</h4>
                <a href="https://ebl.beauty">EBL Pilot</a>
                <a href="#decidey">DECIDEY NGO</a>
              </div>
              <div className="footer-column">
                <h4>Legal</h4>
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 SOLVY. SOVEREIGNITITY™ is a trademark of SA Nathan. All rights reserved.</p>
            <p>Future home: solvy.chain</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
