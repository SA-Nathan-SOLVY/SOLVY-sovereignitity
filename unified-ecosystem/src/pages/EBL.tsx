import { useState } from 'react'
import EBLNav from '../components/EBLNav'
import './EBL.css'

function EBL() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [serviceType, setServiceType] = useState('')
  const [amount, setAmount] = useState('')

  return (
    <div className="ebl-app">
      <EBLNav />

      {/* Hero Section */}
      <section className="ebl-hero">
        <div className="ebl-hero-content">
          <img src="/fulllogo.png" alt="EBL Logo" className="ebl-hero-logo" />
          <h1>Evergreen Beauty Lounge</h1>
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
              <p>Blow dry Queen, relaxing hair wash, professional styling and treatments</p>
            </div>

            <div className="service-card">
              <div className="service-icon">💅</div>
              <h3>Nail Services</h3>
              <p>Manicures, pedicures, and nail art by licensed specialists</p>
            </div>

            <div className="service-card">
              <div className="service-icon">✨</div>
              <h3>Beauty Services</h3>
              <p>Waxing, Facials, Eyebrow shaping, Individual eyelashes</p>
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

      {/* Reign Products Section */}
      <section className="ebl-reign">
        <div className="container">
          <h2>Reign Menstrual Health Products</h2>
          <p className="reign-description">
            Premium sanitary napkins infused with Nobel Prize-winning Graphene technology
          </p>
          
          <div className="reign-videos">
            <a href="https://youtu.be/igrZlzW-zQA" target="_blank" rel="noopener noreferrer" className="video-link">
              Watch: 30 Minute Demonstration
            </a>
            <a href="https://youtu.be/XwPHpMiBCR0" target="_blank" rel="noopener noreferrer" className="video-link">
              Watch: Product Overview
            </a>
          </div>
          
          <a href="https://ebl.jewelpads.com/" target="_blank" rel="noopener noreferrer" className="btn-order">
            Place Your Order Now
          </a>
        </div>
      </section>

      {/* SPS Joint Venture Section */}
      <section className="ebl-sps" id="sps-joint-venture">
        <div className="container">
          <h2>SPS Joint Venture</h2>
          <p>
            Strategic Partnership Services - Building cooperative business relationships 
            that empower communities through shared ownership and mutual success.
          </p>
          <div className="sps-features">
            <div className="sps-feature">
              <div className="sps-icon">🤝</div>
              <h4>Cooperative Partnerships</h4>
              <p>Joint ventures built on trust and shared vision</p>
            </div>
            <div className="sps-feature">
              <div className="sps-icon">📈</div>
              <h4>Shared Growth</h4>
              <p>Success that benefits all stakeholders</p>
            </div>
            <div className="sps-feature">
              <div className="sps-icon">🌍</div>
              <h4>Community Impact</h4>
              <p>Local empowerment through economic development</p>
            </div>
          </div>
        </div>
      </section>

      {/* MAN Section */}
      <section className="ebl-man" id="man">
        <div className="container">
          <h2>MAN - Member Action Network</h2>
          <p>Stay connected with our community through integrated communications.</p>
          
          <div className="man-sections">
            <div className="man-card" id="communications">
              <h3>Communications Center</h3>
              <p>Direct messaging, announcements, and community updates for all members.</p>
              <ul>
                <li>Member announcements</li>
                <li>Event notifications</li>
                <li>Community updates</li>
              </ul>
            </div>
            
            <div className="man-card" id="email-center">
              <h3>Email Center</h3>
              <p>Secure email communications for business correspondence and member services.</p>
              <ul>
                <li>Appointment confirmations</li>
                <li>Payment receipts</li>
                <li>Newsletter subscriptions</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Section */}
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

      {/* Community Projects Section */}
      <section className="ebl-community">
        <div className="container">
          <h2>Local Community Projects</h2>
          <p>
            Evergreen Beauty Lounge is proud to partner with <strong>Uplift Ascend</strong>,
            a community-driven initiative empowering individuals through education,
            mentorship, and economic opportunity.
          </p>
          <p>
            Through this partnership, we're creating pathways for veterans, freelancers,
            and small business owners to achieve financial independence and build
            generational wealth.
          </p>
          <a 
            href="https://sites.google.com/view/uplift-ascend-partnership-ebl/home" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-community"
          >
            Learn More About Local Community Projects
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="ebl-footer">
        <div className="container">
          <p><strong>Evergreen Beauty Lounge</strong></p>
          <p>Licensed Texas Cosmetology Services • Veteran-Owned</p>
          <p>A proud client of S.A. Nathan LLC • Pilot partner of SOLVY Card</p>
          <p className="copyright">© 2025 Evergreen Beauty Lounge. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default EBL
