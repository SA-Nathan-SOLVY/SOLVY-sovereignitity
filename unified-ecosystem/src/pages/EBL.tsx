import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import UnifiedNav from '../components/UnifiedNav'
import SolvyFooter from '../components/SolvyFooter'
import './EBL.css'

function EBL() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [serviceType, setServiceType] = useState('')
  const [amount, setAmount] = useState('')

  return (
    <div className="ebl-app">
      <UnifiedNav currentPage="ebl" />

      {/* Hero Section */}
      <section className="ebl-hero">
        <div className="ebl-hero-content">
          <div className="ebl-title-bookend">
            <img src="/ebl-logo.png" alt="EBL Logo" className="ebl-bookend-logo" />
            <h1>Evergreen Beauty Lounge</h1>
            <img src="/ebl-logo.png" alt="EBL Logo" className="ebl-bookend-logo" />
          </div>
          <p className="ebl-tagline">Licensed Texas Cosmetology Services</p>
          <div className="ebl-badge">Licensed Professional • Veteran-Owned • SOLVY Pilot Partner #1</div>
          <p className="ebl-proof-statement">
            <strong>Eva's business is the proof.</strong> Real payments, real customers, real cooperative ownership in action.
          </p>
        </div>
      </section>

      {/* SOLVY Card Intro */}
      <section className="ebl-solvy-intro">
        <div className="container">
          <h2>Use Your SOLVY Card & Earn as an Owner!</h2>
          <p>
            Pay with your SOLVY Card for all EBL services. <strong>As a cooperative owner, 
            your "rewards" are actually profit sharing!</strong> Every transaction strengthens 
            our community and increases your ownership stake.
          </p>
          <div className="solvy-benefits">
            <span>Secure Payments</span>
            <span>Cooperative Ownership</span>
            <span>Profit Sharing</span>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="ebl-services" id="services">
        <div className="container">
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">💇</div>
              <h3>Hair Services</h3>
              <p>Styling, treatments, and wash services</p>
            </div>

            <div className="service-card">
              <div className="service-icon">💅</div>
              <h3>Nail Services</h3>
              <p>Manicures, pedicures, and nail art</p>
            </div>

            <div className="service-card">
              <div className="service-icon">✨</div>
              <h3>Beauty Services</h3>
              <p>Waxing, facials, brows, and lashes</p>
            </div>

            <div className="service-card">
              <div className="service-icon">📋</div>
              <h3>Consultation</h3>
              <p>Every new client starts here</p>
            </div>
          </div>
        </div>
      </section>

      {/* Book Appointment Section */}
      <section className="ebl-booking">
        <div className="container">
          <h2>Book Your Appointment</h2>
          <p>Call or text to schedule your service. Pricing determined during consultation.</p>
          <div className="booking-buttons">
            <a href="tel:9294295994" className="btn-call">Call (929) 429-5994</a>
            <a href="sms:9294295994" className="btn-text">Text (929) 429-5994</a>
            <a href="#pay" className="btn-pay">Pay Now</a>
          </div>
        </div>
      </section>

      {/* Payment Section — Tap to Pay */}
      <section className="ebl-payment" id="pay">
        <div className="container">
          <h2>Tap to Pay with SOLVY Card</h2>
          <p className="pilot-badge">EBL is a SOLVY Card Pilot Partner - Earn as You Spend!</p>

          <div className="payment-form">
            <div className="form-group">
              <label>Phone Number (to connect with Eva)</label>
              <input 
                type="tel" 
                placeholder="(929) 429-5994"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Service Type</label>
              <select value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
                <option value="">Select a service...</option>
                <option value="hair">Hair Services</option>
                <option value="nail">Nail Services</option>
                <option value="beauty">Beauty Services</option>
                <option value="reign">Reign Products</option>
              </select>
            </div>

            <div className="form-group">
              <label>Amount ($)</label>
              <input 
                type="number" 
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="payment-buttons">
              <button className="btn-solvy-pay">Tap SOLVY Card to Pay</button>
              <button className="btn-other-pay">Pay with Other Card</button>
            </div>

            <p className="profit-note">
              As a SOLVY Card owner, your rewards are profit sharing! 
              Every transaction strengthens the cooperative and increases your ownership stake.
            </p>
          </div>
        </div>
      </section>

      {/* ── EBL Hub Content ── */}

      {/* Reign Hub Section */}
      <section style={{ padding: '72px 24px', background: '#0a1628' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', color: '#34d399', textTransform: 'uppercase', marginBottom: '12px', textAlign: 'center' }}>REIGN BY EBL</p>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#f0fdf4', margin: '0 0 16px', textAlign: 'center' }}>Science-backed menstrual care</h2>
          <p style={{ color: 'rgba(240,253,244,0.7)', maxWidth: '600px', margin: '0 auto 40px', textAlign: 'center', lineHeight: 1.7 }}>
            Infused with Nobel Prize-winning graphene technology. Non-toxic, ultra-thin, with wings.
            Distributed exclusively through Evergreen Beauty Lounge — Rep ID 301272.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            {[
              { icon: '🔬', title: 'Nobel Prize Graphene', body: 'Advanced antimicrobial protection from the same material recognized by the Nobel Prize in Physics.' },
              { icon: '🌿', title: 'Non-Toxic Formula', body: "Free of harmful chemicals. Breathable, ultra-thin construction designed with women's health first." },
              { icon: '🛡️', title: 'Wings + Odor Control', body: 'Secure wing design with engineered odor neutralization. Light to regular absorbency.' },
              { icon: '📦', title: 'Monthly Subscription', body: 'Auto-delivered to your door across the US. Never run out — subscribe and save.' },
            ].map((f) => (
              <div key={f.title} style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)', borderRadius: '16px', padding: '24px' }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '12px' }}>{f.icon}</div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#34d399', margin: '0 0 8px' }}>{f.title}</h4>
                <p style={{ fontSize: '0.82rem', color: 'rgba(240,253,244,0.65)', margin: 0, lineHeight: 1.6 }}>{f.body}</p>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '32px' }}>
            <a href="https://youtu.be/igrZlzW-zQA" target="_blank" rel="noopener noreferrer" style={{ color: '#34d399', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', padding: '10px 20px', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '40px', background: 'rgba(52,211,153,0.08)' }}>▶ 30-Minute Product Demo</a>
            <a href="https://youtu.be/XwPHpMiBCR0" target="_blank" rel="noopener noreferrer" style={{ color: '#34d399', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', padding: '10px 20px', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '40px', background: 'rgba(52,211,153,0.08)' }}>▶ Product Overview</a>
          </div>
          <div style={{ textAlign: 'center', marginTop: '28px' }}>
            <a href="https://ebl.jewelpads.com/shop/" target="_blank" rel="noopener noreferrer" style={{ background: '#059669', color: 'white', padding: '14px 36px', borderRadius: '40px', textDecoration: 'none', fontWeight: 700, fontSize: '0.95rem' }}>
              Shop Reign at ebl.jewelpads.com →
            </a>
          </div>
        </div>
      </section>

      {/* Become a Distributor */}
      <section style={{ padding: '72px 24px', background: '#faf5ff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', color: '#7c3aed', textTransform: 'uppercase', marginBottom: '12px', textAlign: 'center' }}>OPPORTUNITY</p>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f1e2c', margin: '0 0 48px', textAlign: 'center' }}>Become a Reign Distributor</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '60px', alignItems: 'start' }}>
            <div>
              <p style={{ fontSize: '1.05rem', color: '#3b0764', fontWeight: 600, lineHeight: 1.7, margin: '0 0 16px' }}>
                Evergreen Beauty Lounge was built on a simple belief — when one person rises, they bring others with them. Eva opened EBL to serve her community. Now she's extending that same opportunity through Reign.
              </p>
              <p style={{ fontSize: '0.9rem', color: '#4b5563', lineHeight: 1.8, margin: '0 0 28px' }}>
                Reign is a premium, science-backed product that sells itself. As a distributor under EBL, you carry a product you can stand behind — graphene-infused, non-toxic, and genuinely better for women's health. No gimmicks. Real product. Real income potential.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
                {[
                  { icon: '💼', text: "Your own distributor storefront — your link, your customers" },
                  { icon: '📦', text: "Product ships directly to your buyers nationwide" },
                  { icon: '💰', text: "Earn commission on every order placed through your site" },
                  { icon: '🤝', text: "Backed by EBL — licensed professional, veteran-owned, community-first" },
                ].map((p) => (
                  <div key={p.text} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{p.icon}</span>
                    <span style={{ fontSize: '0.9rem', color: '#374151', lineHeight: 1.6 }}>{p.text}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <a href="https://ebl.jewelpads.com/enroll/" target="_blank" rel="noopener noreferrer" style={{ background: '#7c3aed', color: 'white', padding: '14px 32px', borderRadius: '40px', textDecoration: 'none', fontWeight: 700, fontSize: '0.95rem' }}>
                  Enroll as a Distributor →
                </a>
                <a href="https://youtu.be/igrZlzW-zQA" target="_blank" rel="noopener noreferrer" style={{ background: 'transparent', color: '#7c3aed', padding: '14px 28px', borderRadius: '40px', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', border: '1.5px solid #7c3aed' }}>
                  ▶ Watch Demo First
                </a>
              </div>
            </div>
            <div style={{ background: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 4px 24px rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.12)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
                <span style={{ fontSize: '1.8rem' }}>🌱</span>
                <span style={{ fontWeight: 800, color: '#5b21b6', fontSize: '0.95rem' }}>EBL Distributor Network</span>
              </div>
              {[
                { num: '$0', label: 'Upfront inventory required' },
                { num: '301272', label: 'Your sponsor Rep ID (EBL)' },
                { num: '🔬', label: 'Nobel Prize graphene technology' },
              ].map((stat) => (
                <div key={stat.label} style={{ padding: '16px 0', borderBottom: '1px solid #f3e8ff' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#7c3aed' }}>{stat.num}</div>
                  <div style={{ fontSize: '0.78rem', color: '#9ca3af', fontWeight: 600, marginTop: '2px' }}>{stat.label}</div>
                </div>
              ))}
              <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(124,58,237,0.06)', borderRadius: '12px', fontSize: '0.82rem', color: '#5b21b6', lineHeight: 1.6 }}>
                "I believe in putting people in position to win. Reign gave me that chance — I'm passing it on."
                <div style={{ marginTop: '8px', fontWeight: 700 }}>— Eva, Founder · Evergreen Beauty Lounge</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SPS Joint Venture Section */}
      <section className="ebl-sps" id="sps-joint-venture">
        <div className="container">
          <h2>SPS Joint Venture <span className="sps-proposal-badge">PROPOSAL</span></h2>
          <p>
            SPS — a major nail care supplier of EBL — is our proposed second pilot partner. 
            The vision: SPS customers receive a SOLVY Card, giving them the ability to track 
            every nail care purchase and generate ready-to-file expense reports at tax time, 
            while building cooperative ownership stake with every transaction.
          </p>
          <div className="sps-features">
            <div className="sps-feature">
              <div className="sps-icon">💳</div>
              <h4>SOLVY Card for SPS Customers</h4>
              <p>Proposed: SPS customers become cooperative owners, earning as they spend</p>
            </div>
            <div className="sps-feature">
              <div className="sps-icon">📊</div>
              <h4>Purchase Tracking & Tax Reports</h4>
              <p>Automatic expense reports from every transaction — simplifying tax prep</p>
            </div>
            <div className="sps-feature">
              <div className="sps-icon">🌍</div>
              <h4>Scaling the Ecosystem</h4>
              <p>One strategic supplier partnership scales SOLVY across thousands of customers</p>
            </div>
          </div>
        </div>
      </section>

      {/* QR Codes for Business Cards */}
      <section className="ebl-qr-codes" id="qr-codes">
        <div className="container">
          <h2>Business Card QR Codes</h2>
          <p className="qr-description">Scan these QR codes to visit our sites. Print-ready for business cards.</p>
          
          <div className="qr-grid">
            <div className="qr-card">
              <h3>SOLVY Web App</h3>
              <div className="qr-image">
                <QRCodeSVG 
                  value="https://solvy.cards"
                  size={180}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="H"
                />
              </div>
              <p className="qr-url">solvy.cards</p>
            </div>
            
            <div className="qr-card">
              <h3>Evergreen Beauty Lounge</h3>
              <div className="qr-image">
                <QRCodeSVG 
                  value="https://ebl.beauty"
                  size={180}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="H"
                />
              </div>
              <p className="qr-url">ebl.beauty</p>
            </div>

            <div className="qr-card">
              <h3>Reign/Jewelpads Shop</h3>
              <div className="qr-image">
                <QRCodeSVG 
                  value="https://ebl.beauty"
                  size={180}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="H"
                />
              </div>
              <p className="qr-url">ebl.beauty</p>
            </div>
          </div>
          
          <p className="print-note">Right-click on QR codes to save as image for printing on business cards.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="ebl-footer">

        {/* Business Card Preview */}
        <div className="biz-card-section">
          <h3 className="biz-card-heading">Business Card</h3>
          <p className="biz-card-subheading">Print-ready · Both sides shown below</p>

          <div className="biz-cards-wrapper">

            {/* FRONT */}
            <div className="biz-card-panel">
              <p className="biz-card-label">Front</p>
              <div className="biz-card biz-card-front">
                <div className="biz-card-front-inner">
                  <div className="biz-card-logo-row">
                    <img src="/ebl-logo-hd.png" alt="EBL" className="biz-card-logo" />
                    <div className="biz-card-name-block">
                      <p className="biz-card-business">Evergreen Beauty Lounge</p>
                      <p className="biz-card-license">Licensed Texas Cosmetology Services</p>
                    </div>
                  </div>
                  <div className="biz-card-divider" />
                  <div className="biz-card-contact">
                    <p className="biz-card-phone">(929) 429-5994</p>
                    <p className="biz-card-appt">Call or Text · Appointment Only</p>
                    <p className="biz-card-web">ebl.beauty</p>
                  </div>
                </div>
              </div>
            </div>

            {/* BACK */}
            <div className="biz-card-panel">
              <p className="biz-card-label">Back</p>
              <div className="biz-card biz-card-back">
                <div className="biz-card-qr-row">
                  <div className="biz-card-qr-item">
                    <div className="biz-card-qr-box">
                      <QRCodeSVG
                        value="https://ebl.beauty"
                        size={80}
                        bgColor="#fce4ec"
                        fgColor="#1a0a0e"
                        level="H"
                      />
                    </div>
                    <p className="biz-card-qr-label">Book Appointment</p>
                    <p className="biz-card-qr-sublabel">ebl.beauty</p>
                  </div>
                  <div className="biz-card-qr-divider" />
                  <div className="biz-card-qr-item">
                    <div className="biz-card-qr-box">
                      <QRCodeSVG
                        value="https://ebl.beauty"
                        size={80}
                        bgColor="#fce4ec"
                        fgColor="#1a0a0e"
                        level="H"
                      />
                    </div>
                    <p className="biz-card-qr-label">Shop Reign Products</p>
                    <p className="biz-card-qr-sublabel">ebl.beauty</p>
                  </div>
                </div>
                <p className="biz-card-back-tagline">Scan to book · Scan to shop Reign</p>
              </div>
            </div>

          </div>

          <button
            className="biz-card-print-btn"
            onClick={() => window.print()}
          >
            🖨️ Print Business Cards
          </button>
        </div>

      </footer>

      <SolvyFooter />
    </div>
  )
}

export default EBL
