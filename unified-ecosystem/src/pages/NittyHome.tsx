import { useState } from 'react'
import UnifiedNav from '../components/UnifiedNav'
import SolvyFooter from '../components/SolvyFooter'
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
                    <p className="customize-note">Choose your color theme</p>
                    
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
            <img src="/fulllogo.png" alt="SOLVY Ecosystem" className="hero-logo" />
            <h1 className="hero-ecosystem-title">SOLVY Ecosystem™</h1>
            <h2 className="hero-subheadline">Own your spend. Own your future.</h2>
            <p className="hero-statement">
              <strong>SOLVY (Solutions Valued You)</strong> is the cooperative ecosystem where members own their financial future.
              Created by SA Nathan, SOLVY Ecosystem™ is America's first peer-to-peer payment platform — delivering data sovereignty 
              and economic autonomy through cooperative ownership, breaking free from systems of economic entrapment.
            </p>
          </div>
          <div className="hero-image">
            <img src="/hero_payment_image.webp" alt="Payment at POS Terminal" />
          </div>
        </div>
      </section>

      {/* Funding Momentum Banner */}
      <section style={{ background: 'linear-gradient(135deg, #0f1e2c 0%, #1e3a5f 100%)', padding: '48px 24px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'inline-block', background: 'rgba(255,179,71,0.15)', border: '1px solid #ffb347', color: '#ffb347', padding: '6px 18px', borderRadius: '40px', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '16px' }}>
              🚀 PRELAUNCH — FOUNDING MEMBERS ONLY
            </div>
            <h2 style={{ color: 'white', fontSize: '1.9rem', fontWeight: 800, margin: '0 0 12px' }}>
              The cooperative card is launching. Lock in your spot now.
            </h2>
            <p style={{ color: '#94a3b8', maxWidth: '640px', margin: '0 auto 32px', fontSize: '1rem', lineHeight: 1.6 }}>
              SOLVY has secured partnerships and is approaching a major funding milestone. 
              Founding members who commit today lock in the highest cooperative ownership tier — before the public launch.
            </p>
          </div>

          {/* Partner Ecosystem */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '40px' }}>
            {[
              { name: 'Unit.co', role: 'Card Issuance & Banking', icon: '🏦', highlight: true },
              { name: 'Baanx', role: 'Web3 Crypto Card Infrastructure', icon: '⛓️', highlight: false },
              { name: 'AlchemyPay', role: 'Fiat ↔ Crypto Payments', icon: '💱', highlight: false },
              { name: 'Stripe', role: 'Merchant Payment Processing', icon: '💳', highlight: false },
            ].map((p) => (
              <div key={p.name} style={{
                background: p.highlight ? 'rgba(255,179,71,0.12)' : 'rgba(255,255,255,0.06)',
                border: p.highlight ? '1px solid #ffb347' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '20px 24px',
                minWidth: '180px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{p.icon}</div>
                <div style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>{p.name}</div>
                <div style={{ color: '#64748b', fontSize: '0.75rem', lineHeight: 1.4 }}>{p.role}</div>
                {p.highlight && <div style={{ color: '#ffb347', fontSize: '0.7rem', fontWeight: 700, marginTop: '8px' }}>FUNDING IN PROGRESS</div>}
              </div>
            ))}
          </div>

          {/* Why Now bullets */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '36px', maxWidth: '900px', margin: '0 auto 36px' }}>
            {[
              { icon: '🔐', title: 'Founding Member Pricing', body: 'First 1,000 members lock in the lowest monthly fee — permanently.' },
              { icon: '⛓️', title: 'Baanx Integration', body: 'Crypto-linked SOLVY Card through Baanx Web3 infrastructure — coming at launch.' },
              { icon: '💱', title: 'AlchemyPay Bridge', body: 'Spend crypto, earn fiat interchange. AlchemyPay powers the SOLVY fiat/crypto bridge.' },
              { icon: '💰', title: 'Interchange Revenue', body: 'Every swipe earns 0.5–1% interchange, distributed 70% to the member cooperative pool.' },
            ].map((b) => (
              <div key={b.title} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{b.icon}</div>
                <div style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px' }}>{b.title}</div>
                <div style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: 1.5 }}>{b.body}</div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <a href="/prelaunch" style={{ display: 'inline-block', background: 'linear-gradient(135deg, #ffb347 0%, #e08a00 100%)', color: '#0f1e2c', padding: '16px 40px', borderRadius: '40px', fontWeight: 800, fontSize: '1rem', textDecoration: 'none', boxShadow: '0 8px 24px rgba(255,179,71,0.35)' }}>
              🔮 Commit as a Founding Member — Free Until Launch
            </a>
            <p style={{ color: '#475569', fontSize: '0.78rem', marginTop: '12px' }}>No payment required. No credit check. Just your commitment to the cooperative.</p>
          </div>
        </div>
      </section>

      {/* The SOLVY Card Section */}
      <section className="solvy-card-section" id="card">
        <div className="container">
          <h2 className="section-title"><img src="/SolvyLogo-1024.png" alt="SOLVY" className="section-title-logo" /> SOLVY Card™</h2>
          <p className="section-subtitle">Earn ownership with every swipe.</p>
          <p className="section-tagline">The debit card that shares profit with members.</p>

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
              <div className="key-point-icon">📡</div>
              <h3>NFC — Tap. Pay. Own.</h3>
              <p>Full NFC contactless payments at any terminal worldwide. Tap-to-pay, P2P tap transfers, and merchant acceptance — all tokenized and private. Every tap earns cooperative ownership.</p>
            </div>

            <div className="key-point-card">
              <div className="key-point-icon">🤝🏿🤝🏾🤝🏽</div>
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

      {/* NFC Section */}
      <section id="nfc" style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0f2240 50%, #0a1628 100%)', padding: '80px 24px', borderTop: '1px solid rgba(16,185,129,0.15)', borderBottom: '1px solid rgba(16,185,129,0.15)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div style={{ display: 'inline-block', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.4)', color: '#10b981', padding: '6px 20px', borderRadius: '40px', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '20px' }}>
              📡 NFC-ENABLED
            </div>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#fff', margin: '0 0 16px' }}>
              Tap. Pay. Own.
            </h2>
            <p style={{ color: '#94a3b8', maxWidth: '640px', margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.7 }}>
              The SOLVY Card™ is built with Near Field Communication (NFC) — the same contactless technology in Apple Pay and Google Pay. 
              But unlike those platforms, every tap earns cooperative ownership, not corporate profit.
            </p>
          </div>

          {/* How NFC works on SOLVY */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '56px' }}>
            {[
              {
                icon: '📱',
                title: 'Tap to Pay at Any Terminal',
                body: 'Hold your SOLVY Card within 4 cm of any NFC-enabled payment terminal — at grocery stores, restaurants, transit. No PIN, no swipe, no waiting.',
                highlight: false,
              },
              {
                icon: '🏪',
                title: 'Evergreen Beauty Lounge — Live',
                body: 'Our pilot merchant, Evergreen Beauty Lounge, already accepts SOLVY NFC payments. Every tap at EBL routes interchange back to the cooperative pool.',
                highlight: true,
              },
              {
                icon: '🤝',
                title: 'P2P Tap Transfers',
                body: 'Member-to-member NFC transfers — tap phones to send money instantly between SOLVY accounts. No bank routing numbers. No delays.',
                highlight: false,
              },
              {
                icon: '🛡️',
                title: 'Privacy by Design',
                body: 'Every NFC transaction is tokenized — your card number is never transmitted. Dynamic cryptograms protect each tap. You control when the card is active.',
                highlight: false,
              },
            ].map((card) => (
              <div key={card.title} style={{
                background: card.highlight ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.04)',
                border: card.highlight ? '1px solid rgba(16,185,129,0.35)' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px',
                padding: '28px 24px',
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '14px' }}>{card.icon}</div>
                <h3 style={{ color: card.highlight ? '#10b981' : '#fff', fontWeight: 700, fontSize: '1rem', marginBottom: '10px' }}>{card.title}</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.65, margin: 0 }}>{card.body}</p>
                {card.highlight && (
                  <div style={{ marginTop: '14px', display: 'inline-block', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', borderRadius: '20px', padding: '4px 14px', fontSize: '0.72rem', fontWeight: 700 }}>
                    LIVE NOW
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* NFC vs Traditional Comparison */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '20px', padding: '36px', marginBottom: '48px' }}>
            <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1.3rem', textAlign: 'center', marginBottom: '28px' }}>
              SOLVY NFC vs. The Old Way
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr>
                    <th style={{ color: '#64748b', textAlign: 'left', padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontWeight: 600 }}>Feature</th>
                    <th style={{ color: '#f87171', textAlign: 'center', padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontWeight: 600 }}>Apple Pay / Google Pay</th>
                    <th style={{ color: '#10b981', textAlign: 'center', padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontWeight: 600 }}>SOLVY NFC</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Contactless tap payments', '✓', '✓'],
                    ['Works at NFC terminals worldwide', '✓', '✓'],
                    ['Tokenized, secure transactions', '✓', '✓'],
                    ['Interchange revenue returned to you', '✗ — goes to Apple/Google', '✓ — 70% to member pool'],
                    ['Cooperative ownership per tap', '✗', '✓'],
                    ['P2P tap transfers between users', '✗ — app-based only', '✓ — card-to-card NFC'],
                    ['Data sovereignty', '✗ — tracked by Big Tech', '✓ — member-controlled'],
                    ['Who profits', 'Shareholders', 'Member-Owners'],
                  ].map(([feature, old, solvy]) => (
                    <tr key={feature} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px 16px', color: '#cbd5e1', fontWeight: 500 }}>{feature}</td>
                      <td style={{ padding: '12px 16px', color: '#f87171', textAlign: 'center' }}>{old}</td>
                      <td style={{ padding: '12px 16px', color: '#10b981', textAlign: 'center', fontWeight: old === '✓' ? 400 : 700 }}>{solvy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tap counter / call to action */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
              Every tap builds the cooperative. Every swipe funds the community pool.
            </p>
            <a href="/apply" style={{ display: 'inline-block', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', padding: '14px 36px', borderRadius: '40px', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', boxShadow: '0 8px 24px rgba(16,185,129,0.3)' }}>
              Apply for Your NFC Card →
            </a>
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
          <h2 className="section-title"><img src="/ebl-logo.png" alt="EBL" className="section-title-logo" /> See It In Action <img src="/ebl-logo.png" alt="EBL" className="section-title-logo" /></h2>
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
          <h2 className="section-title"><img src="/solvy-crown-icon.png" alt="SOLVY" className="section-title-logo" /> DECIDEY NGO <img src="/solvy-crown-icon.png" alt="SOLVY" className="section-title-logo" /></h2>
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
          <h2 className="section-title"><img src="/solvy-crown-icon.png" alt="SOLVY" className="section-title-logo" /> Apply for Your SOLVY Card™ <img src="/solvy-crown-icon.png" alt="SOLVY" className="section-title-logo" /></h2>
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
          <p>Join the SOLVY Ecosystem™. Complete your verification and get your SOLVY Card™ today.</p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '8px' }}>
            <a href="/apply" className="btn-primary">Apply for Your SOLVY Card™</a>
            <a href="/prelaunch" className="btn-secondary" style={{ background: 'linear-gradient(135deg, #ffb347 0%, #e08a00 100%)', color: '#0f1e2c', border: 'none', fontWeight: 700 }}>
              🔮 Prelaunch Commitment
            </a>
          </div>
          <p style={{ marginTop: '16px', fontSize: '0.85rem', opacity: 0.75 }}>
            Not ready for full KYC? Make a no-charge spending commitment and secure your founding member spot.
          </p>
        </div>
      </section>

      <SolvyFooter />
    </div>
  )
}

export default NittyHome
