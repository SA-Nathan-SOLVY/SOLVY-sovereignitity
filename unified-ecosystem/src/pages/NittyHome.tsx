import { useState } from 'react'
import UnifiedNav from '../components/UnifiedNav'
import '../App.css'
import './VirtualCard.css'

function NittyHome() {
  const [currentCard, setCurrentCard] = useState(0)
  const [isApproved, setIsApproved] = useState(false)
  const [showNfcDemo, setShowNfcDemo] = useState(false)
  const [privacyMode, setPrivacyMode] = useState(false)
  const [p2pConnected, setP2pConnected] = useState(true)
  const [cardColor, setCardColor] = useState('#1a1a2e')
  const [customLogo, setCustomLogo] = useState<string | null>(null)
  const [showCustomization, setShowCustomization] = useState(false)

  const colorOptions = [
    { name: 'Royal Purple', value: '#1a1a2e' },
    { name: 'Deep Blue', value: '#0d1b3e' },
    { name: 'Forest Green', value: '#0d2818' },
    { name: 'Burgundy', value: '#2d1a1a' },
    { name: 'Midnight Black', value: '#0a0a0a' },
    { name: 'Ocean Teal', value: '#0d2b2b' },
  ]

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setCustomLogo(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }
  
  const cards = [
    { name: 'SOLVY Business Card - Mastercard', image: '/SOV.png', type: 'Business', network: 'Mastercard' },
    { name: 'SOLVY Business Card - Visa', image: '/SOV-visa.png', type: 'Business', network: 'Visa' },
    { name: 'SOLVY Personal Card - Mastercard', image: '/SOV-personal-mc.png', type: 'Personal', network: 'Mastercard' },
    { name: 'SOLVY Personal Card - Visa', image: '/SOV-personal-visa.png', type: 'Personal', network: 'Visa' }
  ]

  const mockTransactions = [
    { id: 1, merchant: 'Evergreen Beauty Lounge', amount: -85.00, date: '2025-01-15', type: 'purchase' },
    { id: 2, merchant: 'P2P Transfer from @marcus', amount: 150.00, date: '2025-01-14', type: 'p2p_in' },
    { id: 3, merchant: 'Coffee Shop', amount: -6.50, date: '2025-01-14', type: 'purchase' },
    { id: 4, merchant: 'P2P Transfer to @eva', amount: -45.00, date: '2025-01-13', type: 'p2p_out' },
    { id: 5, merchant: 'Grocery Store', amount: -127.34, date: '2025-01-12', type: 'purchase' }
  ]

  const balance = 2847.52

  const nextCard = () => {
    setCurrentCard((prev) => (prev + 1) % cards.length)
  }

  const prevCard = () => {
    setCurrentCard((prev) => (prev - 1 + cards.length) % cards.length)
  }

  const handleNfcDemo = () => {
    setShowNfcDemo(true)
    setTimeout(() => setShowNfcDemo(false), 3000)
  }

  if (isApproved) {
    return (
      <div className="app">
        <UnifiedNav currentPage="solvy" />
        
        <section className="virtual-card-section">
          <div className="container">
            <div className="vc-header">
              <h2>Your SOLVY Card</h2>
              <div className="vc-status">
                <span className="status-dot active"></span>
                Virtual Card Active
              </div>
            </div>

            <div className="vc-main">
              <div className="vc-card-container">
                <div 
                  className={`vc-card ${showNfcDemo ? 'nfc-active' : ''}`}
                  style={{ 
                    '--card-color': cardColor,
                    boxShadow: `0 20px 60px ${cardColor}66, 0 0 40px ${cardColor}33`
                  } as React.CSSProperties}
                >
                  <div className="card-color-overlay" style={{ backgroundColor: cardColor }}></div>
                  <img src={cards[currentCard].image} alt={cards[currentCard].name} />
                  {customLogo && (
                    <div className="custom-logo-overlay">
                      <img src={customLogo} alt="Your logo" />
                    </div>
                  )}
                  {showNfcDemo && (
                    <div className="nfc-animation">
                      <div className="nfc-wave"></div>
                      <div className="nfc-wave delay-1"></div>
                      <div className="nfc-wave delay-2"></div>
                      <div className="nfc-checkmark">Payment Authorized</div>
                    </div>
                  )}
                </div>
                
                <div className="vc-card-controls">
                  <button onClick={prevCard} className="vc-nav-btn">◀</button>
                  <span className="vc-card-info">{cards[currentCard].type} • {cards[currentCard].network}</span>
                  <button onClick={nextCard} className="vc-nav-btn">▶</button>
                </div>

                <button onClick={handleNfcDemo} className="nfc-demo-btn">
                  📱 Tap to Pay Demo
                </button>

                <button onClick={() => setShowCustomization(!showCustomization)} className="customize-btn">
                  🎨 Customize Card
                </button>

                {showCustomization && (
                  <div className="customization-panel">
                    <h4>Personalize Your Card</h4>
                    <p className="customize-note">Crown background stays for SOLVY branding</p>
                    
                    <div className="color-selection">
                      <label>Card Color Theme</label>
                      <div className="color-options">
                        {colorOptions.map((color) => (
                          <button
                            key={color.value}
                            className={`color-swatch ${cardColor === color.value ? 'selected' : ''}`}
                            style={{ backgroundColor: color.value }}
                            onClick={() => setCardColor(color.value)}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="logo-upload">
                      <label>Upload Your Logo</label>
                      <div className="upload-area">
                        {customLogo ? (
                          <div className="logo-preview">
                            <img src={customLogo} alt="Custom logo" />
                            <button onClick={() => setCustomLogo(null)} className="remove-logo">✕</button>
                          </div>
                        ) : (
                          <label className="upload-btn">
                            <input type="file" accept="image/*" onChange={handleLogoUpload} hidden />
                            📤 Choose Logo
                          </label>
                        )}
                      </div>
                      <p className="upload-hint">PNG or JPG, max 2MB</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="vc-balance-container">
                <div className="vc-balance-header">
                  <h3>Available Balance</h3>
                  <div className="privacy-controls">
                    <button 
                      onClick={() => {
                        const newConnected = !p2pConnected
                        setP2pConnected(newConnected)
                        if (!newConnected) {
                          setPrivacyMode(true)
                        } else {
                          setPrivacyMode(false)
                        }
                      }}
                      className={`p2p-toggle ${p2pConnected ? 'connected' : 'disconnected'}`}
                    >
                      {p2pConnected ? '🔗 P2P Connected' : '🔒 P2P Detached'}
                    </button>
                    {!p2pConnected && (
                      <button 
                        onClick={() => setPrivacyMode(!privacyMode)}
                        className="privacy-toggle"
                      >
                        {privacyMode ? '👁️ Reveal' : '🛡️ Hide'}
                      </button>
                    )}
                  </div>
                </div>
                
                <div className={`vc-balance ${privacyMode && !p2pConnected ? 'hidden' : ''}`}>
                  {privacyMode && !p2pConnected ? (
                    <span className="balance-hidden">••••••</span>
                  ) : (
                    <span className="balance-amount">${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  )}
                </div>

                {!p2pConnected && (
                  <div className="military-grade-notice">
                    🛡️ Military-Grade Privacy Mode Active
                    <p>Balance hidden from P2P network. Your financial data is completely private.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="vc-actions">
              <button className="vc-action-btn send">
                <span className="action-icon">↗️</span>
                Send Money
              </button>
              <button className="vc-action-btn receive">
                <span className="action-icon">↙️</span>
                Request Payment
              </button>
              <button className="vc-action-btn connect">
                <span className="action-icon">🔗</span>
                Connect Bank
              </button>
            </div>

            <div className="vc-transactions">
              <h3>Recent Transactions</h3>
              <div className="transaction-list">
                {mockTransactions.map(tx => (
                  <div key={tx.id} className={`transaction-item ${tx.type}`}>
                    <div className="tx-icon">
                      {tx.type === 'p2p_in' ? '↙️' : tx.type === 'p2p_out' ? '↗️' : '🛒'}
                    </div>
                    <div className="tx-details">
                      <span className="tx-merchant">{tx.merchant}</span>
                      <span className="tx-date">{tx.date}</span>
                    </div>
                    <div className={`tx-amount ${tx.amount > 0 ? 'positive' : 'negative'}`}>
                      {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => setIsApproved(false)} className="back-to-apply">
              ← Back to Card Info
            </button>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="app">
      <UnifiedNav currentPage="solvy" />

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="hero-content">
          <div className="hero-text">
            <img src="/fulllogo.png" alt="SOLVY - Solutions Valued You" className="hero-logo" />
            
            <h2 className="hero-subheadline">America's First P2P Payment Platform</h2>
            <p className="hero-statement">
              Created by SA Nathan, SOLVY serves Americans who understand the truth - that this nation was built by those seeking opportunity. 
              As <strong>America's first peer-to-peer payment platform</strong>, we deliver data sovereignty and economic autonomy through cooperative ownership, 
              breaking free from systems of economic entrapment.
            </p>
          </div>
          <div className="hero-image">
            <img src="/hero_payment_image.webp" alt="Payment at POS Terminal" />
          </div>
        </div>
      </section>

      {/* The SOLVY Card Section */}
      <section className="solvy-card-section" id="card">
        <div className="container">
          <h2 className="section-title">👑 The SOLVY Card</h2>
          <p className="section-subtitle">Cooperative Ownership • Data Sovereignty • Member-First</p>

          {/* Card Carousel with NFC Demo */}
          <div className="card-carousel">
            <button className="carousel-btn prev" onClick={prevCard}>‹</button>
            <div className="card-display">
              <div className={`card-wrapper ${showNfcDemo ? 'nfc-active' : ''}`}>
                <img src={cards[currentCard].image} alt={cards[currentCard].name} />
                {showNfcDemo && (
                  <div className="nfc-overlay">
                    <div className="nfc-waves">
                      <div className="wave"></div>
                      <div className="wave delay-1"></div>
                      <div className="wave delay-2"></div>
                    </div>
                    <div className="nfc-status">Tap to Pay Active</div>
                  </div>
                )}
              </div>
              <p className="card-name">{cards[currentCard].name}</p>
              <p className="card-type">{cards[currentCard].type} Card</p>
              <button onClick={handleNfcDemo} className="nfc-demo-trigger">
                📱 Demo NFC Tap-to-Pay
              </button>
            </div>
            <button className="carousel-btn next" onClick={nextCard}>›</button>
          </div>

          <div className="demo-virtual-card">
            <p>Already approved? Access your virtual card:</p>
            <button onClick={() => setIsApproved(true)} className="btn-primary">
              View My Virtual Card →
            </button>
          </div>

          {/* 4 Key Points */}
          <div className="key-points">
            <div className="key-point-card">
              <div className="key-point-icon">🔑</div>
              <h3>Entry Point to Digital Sovereignty</h3>
              <p>Your gateway to digital data self-sovereignty autonomy with income earning potential. Take control of your financial future.</p>
            </div>

            <div className="key-point-card">
              <div className="key-point-icon">📱</div>
              <h3>NFC Enabled</h3>
              <p>Contactless payments with cutting-edge NFC technology. Tap, authorize, and transact with complete privacy protection.</p>
            </div>

            <div className="key-point-card">
              <div className="key-point-icon">🤝</div>
              <h3>Cooperative Owned</h3>
              <p>Member-owned, not bank-owned. Every cardholder is a cooperative owner sharing in the platform's success.</p>
            </div>

            <div className="key-point-card">
              <div className="key-point-icon">💎</div>
              <h3>Data is the New Commodity</h3>
              <p>Recognize data as the new commodity of Web3. Your data, your value, your control in the decentralized economy.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SOVEREIGNITITY Section */}
      <section className="sovereignitity-section" id="sovereignitity">
        <div className="container">
          <h2 className="section-title">SOVEREIGNITITY™</h2>
          <p className="section-subtitle">The Exercise of Achieving Control of Banking Through Cooperative Ownership</p>

          <div className="sovereignitity-content">
            <div className="sovereignitity-text">
              <h3>What is SOVEREIGNITITY™?</h3>
              <p>
                SOVEREIGNITITY™ is more than a concept - it's a movement. It represents the exercise of achieving true control of your banking 
                through cooperative ownership. When you hold a SOLVY Card, you're not just a customer - you're a member-owner with genuine stake in the platform.
              </p>

              <h3>Data Sovereignty</h3>
              <p>
                Your financial data is yours. Period. No selling to third parties, no hidden tracking, no exploitation. 
                We build technology that serves you, not the other way around.
              </p>

              <h3>Economic Autonomy</h3>
              <p>
                Break free from systems of economic entrapment. Build wealth cooperatively, earn income through the platform, 
                and achieve true financial independence.
              </p>
            </div>

            <div className="sovereignitity-benefits">
              <div className="benefit-item">✓ Member-owned cooperative structure</div>
              <div className="benefit-item">✓ Data sovereignty guaranteed</div>
              <div className="benefit-item">✓ Income earning opportunities</div>
              <div className="benefit-item">✓ Lower processing fees</div>
              <div className="benefit-item">✓ Privacy-first technology</div>
              <div className="benefit-item">✓ Community empowerment</div>
            </div>
          </div>
        </div>
      </section>

      {/* EBL Pilot Section */}
      <section className="ebl-section">
        <div className="container">
          <h2 className="section-title">💅 See It In Action</h2>
          <p className="section-subtitle">Evergreen Beauty Lounge - Pilot Partner #1</p>

          <div className="ebl-content">
            <h3>Live & Processing Payments</h3>
            <p>
              Evergreen Beauty Lounge is our first pilot partner, demonstrating what genuine economic freedom achieves through community empowerment. 
              Eva's beauty business now processes payments with full data sovereignty, keeping customer information private while building cooperative wealth.
            </p>
            <p className="ebl-proof">
              <strong>This is proof that SOLVY Card works.</strong> Real business, real payments, real sovereignty.
            </p>
            <a href="https://ebl.beauty" className="btn-secondary" target="_blank" rel="noopener">Visit EBL Services →</a>
          </div>
        </div>
      </section>

      {/* DECIDEY NGO Section */}
      <section className="decidey-section">
        <div className="container">
          <h2 className="section-title">📚 DECIDEY NGO</h2>
          <p className="section-subtitle">Education • Advocacy • Digital Rights</p>

          <p>
            Breaking systemic barriers through education and digital rights advocacy. 
            Continuing the legacy of Marcus Garvey, MLK, and Malcolm X in the modern era.
          </p>
          <a href="https://decidey.ebl.beauty" className="btn-secondary">Learn More →</a>
        </div>
      </section>

      {/* Card Application Section */}
      <section className="application-section" id="apply">
        <div className="container">
          <h2 className="section-title">📋 Apply for Your SOLVY Card</h2>
          <p className="section-subtitle">Regulatory Compliance • Secure Verification • Member Protection</p>

          <div className="kyc-aml-info">
            <div className="compliance-intro">
              <p>
                As a regulated financial platform, SOLVY Card requires identity verification to protect our members 
                and comply with federal regulations. This ensures the safety and integrity of our cooperative.
              </p>
            </div>

            <div className="requirements-grid">
              <div className="requirement-card">
                <div className="requirement-icon">🪪</div>
                <h3>KYC Verification</h3>
                <p><strong>Know Your Customer</strong></p>
                <ul>
                  <li>Valid government-issued ID (Driver's License, Passport, or State ID)</li>
                  <li>Proof of US residency</li>
                  <li>Social Security Number</li>
                  <li>Date of birth verification</li>
                </ul>
              </div>

              <div className="requirement-card">
                <div className="requirement-icon">🛡️</div>
                <h3>AML Compliance</h3>
                <p><strong>Anti-Money Laundering</strong></p>
                <ul>
                  <li>Source of funds declaration</li>
                  <li>OFAC screening verification</li>
                  <li>Transaction monitoring consent</li>
                  <li>Beneficial ownership disclosure</li>
                </ul>
              </div>

              <div className="requirement-card">
                <div className="requirement-icon">📝</div>
                <h3>Application Process</h3>
                <p><strong>Simple Steps</strong></p>
                <ul>
                  <li>Complete online application (5-10 minutes)</li>
                  <li>Upload verification documents</li>
                  <li>Identity verification (1-3 business days)</li>
                  <li>Receive your SOLVY Card</li>
                </ul>
              </div>
            </div>

            <div className="compliance-note">
              <p>
                <strong>🔒 Your Privacy Matters:</strong> All verification data is encrypted and used solely for regulatory compliance. 
                Unlike traditional banks, we never sell your data to third parties.
              </p>
            </div>
          </div>

          <div className="cta-buttons">
            <a href="#card-application-form" className="btn-primary">Apply Now - Start KYC</a>
            <a href="#card" className="btn-secondary">Learn More About SOLVY Card</a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Achieve Financial Sovereignty?</h2>
          <p>Join the movement. Complete your verification and get your SOLVY Card today.</p>
          <a href="#apply" className="btn-primary">Apply for Your Card</a>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <img src="/solvy-logo.png" alt="SOLVY - Solutions Valued You" className="footer-logo" />
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>Platform</h4>
                <a href="#card">SOLVY Card</a>
                <a href="#sovereignitity">SOVEREIGNITITY™</a>
                <a href="https://decidey.ebl.beauty">DECIDEY NGO</a>
                <a href="#apply">Apply for Card</a>
              </div>
              <div className="footer-column">
                <h4>Company</h4>
                <a href="#about">About</a>
                <a href="https://ebl.beauty">EBL Pilot</a>
                <a href="#contact">Contact</a>
              </div>
              <div className="footer-column">
                <h4>Legal</h4>
                <a href="#privacy">Privacy Policy</a>
                <a href="#terms">Terms of Service</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 SOLVY Platform. All rights reserved.</p>
            <p>Created by SA Nathan</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default NittyHome
