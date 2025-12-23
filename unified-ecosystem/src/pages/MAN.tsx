import { useState } from 'react'
import EBLNav from '../components/EBLNav'
import './MAN.css'

function MAN() {
  const [emailTo, setEmailTo] = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [sendStatus, setSendStatus] = useState('')

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setSendStatus('sending')
    
    setTimeout(() => {
      setSendStatus('success')
      setEmailTo('')
      setEmailSubject('')
      setEmailBody('')
    }, 1500)
  }

  return (
    <div className="man-app">
      <EBLNav currentPage="man" />

      {/* Hero Section */}
      <section className="man-hero">
        <div className="container">
          <h1>MAN - Member Action Network</h1>
          <p className="man-tagline">SOLVY Operational Activity Hub</p>
          <div className="man-badge">Operations Dashboard • Communications • Email Center</div>
        </div>
      </section>

      {/* Operations Overview */}
      <section className="man-operations">
        <div className="container">
          <h2>SOLVY Operations Dashboard</h2>
          <p>Real-time visibility into cooperative activities and member engagement</p>

          <div className="ops-grid">
            <div className="ops-card">
              <div className="ops-icon">👥</div>
              <div className="ops-number">247</div>
              <div className="ops-label">Active Members</div>
            </div>
            <div className="ops-card">
              <div className="ops-icon">💳</div>
              <div className="ops-number">89</div>
              <div className="ops-label">Cards Issued</div>
            </div>
            <div className="ops-card">
              <div className="ops-icon">🔄</div>
              <div className="ops-number">1,234</div>
              <div className="ops-label">Transactions</div>
            </div>
            <div className="ops-card">
              <div className="ops-icon">🤝</div>
              <div className="ops-number">2</div>
              <div className="ops-label">Pilot Partners</div>
            </div>
          </div>

          <div className="pilot-status">
            <h3>Pilot Partner Status</h3>
            <div className="partner-list">
              <div className="partner-item active">
                <span className="partner-name">Evergreen Beauty Lounge</span>
                <span className="partner-status">✓ Active - Processing Payments</span>
              </div>
              <div className="partner-item active">
                <span className="partner-name">SPS Joint Venture</span>
                <span className="partner-status">✓ Active - Inventory Integration</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Communications Center */}
      <section className="man-comms" id="comms">
        <div className="container">
          <h2>Communications Center</h2>
          <p>Broadcast announcements and updates to cooperative members</p>

          <div className="comms-features">
            <div className="comms-card">
              <h3>📢 Announcements</h3>
              <p>Send important updates to all members instantly</p>
              <ul>
                <li>System maintenance notices</li>
                <li>New feature announcements</li>
                <li>Cooperative meeting invites</li>
                <li>Profit sharing notifications</li>
              </ul>
            </div>

            <div className="comms-card">
              <h3>📊 Member Segments</h3>
              <p>Target specific member groups</p>
              <ul>
                <li>All Members</li>
                <li>Card Holders Only</li>
                <li>Pilot Partners</li>
                <li>New Applicants</li>
              </ul>
            </div>

            <div className="comms-card">
              <h3>📱 Channels</h3>
              <p>Multi-channel communication</p>
              <ul>
                <li>Email (Resend)</li>
                <li>SMS Notifications</li>
                <li>In-App Messages</li>
                <li>Push Notifications</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Email Center */}
      <section className="man-email" id="email">
        <div className="container">
          <h2>Email Center (Resend)</h2>
          <p>Modern email infrastructure powered by Resend for reliable delivery</p>

          <div className="email-section">
            <div className="email-compose">
              <h3>Compose Email</h3>
              <form onSubmit={handleSendEmail}>
                <div className="form-group">
                  <label>To</label>
                  <input 
                    type="email" 
                    placeholder="member@email.com or select segment"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Subject</label>
                  <input 
                    type="text" 
                    placeholder="Email subject"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea 
                    placeholder="Write your message..."
                    rows={6}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn-send" disabled={sendStatus === 'sending'}>
                  {sendStatus === 'sending' ? 'Sending...' : 'Send Email'}
                </button>
                {sendStatus === 'success' && (
                  <p className="send-success">✓ Email sent successfully!</p>
                )}
              </form>
            </div>

            <div className="email-templates">
              <h3>Quick Templates</h3>
              <div className="template-list">
                <button className="template-btn" onClick={() => {
                  setEmailSubject('Welcome to SOLVY Cooperative!')
                  setEmailBody('Welcome to the SOLVY cooperative family! Your card application has been approved...')
                }}>
                  Welcome Email
                </button>
                <button className="template-btn" onClick={() => {
                  setEmailSubject('Your SOLVY Card Has Shipped')
                  setEmailBody('Great news! Your SOLVY Card is on its way...')
                }}>
                  Card Shipped
                </button>
                <button className="template-btn" onClick={() => {
                  setEmailSubject('Quarterly Profit Sharing Statement')
                  setEmailBody('As a cooperative owner, here is your quarterly profit sharing statement...')
                }}>
                  Profit Sharing
                </button>
                <button className="template-btn" onClick={() => {
                  setEmailSubject('Payment Receipt from EBL')
                  setEmailBody('Thank you for your payment at Evergreen Beauty Lounge...')
                }}>
                  Payment Receipt
                </button>
              </div>
            </div>
          </div>

          <div className="resend-features">
            <h3>Powered by Resend</h3>
            <div className="feature-grid">
              <div className="feature-item">
                <span className="feature-icon">⚡</span>
                <span>Fast Delivery</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📈</span>
                <span>Analytics</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🔒</span>
                <span>Secure</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✅</span>
                <span>Deliverability</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="man-footer">
        <div className="container">
          <p><strong>MAN - Member Action Network</strong></p>
          <p>SOLVY Operational Hub</p>
          <p>© 2025 SOLVY Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default MAN
