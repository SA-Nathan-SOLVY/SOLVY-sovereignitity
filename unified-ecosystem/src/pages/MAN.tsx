import { useState } from 'react'
import UnifiedNav from '../components/UnifiedNav'
import './MAN.css'

function MAN() {
  const [emailTo, setEmailTo] = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [sendStatus, setSendStatus] = useState('')
  const [selectedEmail, setSelectedEmail] = useState<number | null>(null)
  const [inboxFilter, setInboxFilter] = useState('all')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [copiedTemplate, setCopiedTemplate] = useState(false)

  const responseTemplates = [
    {
      id: 'welcome',
      name: 'Welcome - New Interest',
      subject: 'Welcome to the SOLVY Movement!',
      body: `Thank you for your interest in SOLVY!

We're building America's first P2P payment platform with cooperative ownership - where members are owners, not customers.

Here's what makes us different:
• Zero-fee P2P transfers between members
• Cooperative profit sharing - you earn as we grow
• Military-grade data privacy - YOU own your data
• Real businesses accepting SOLVY (like Evergreen Beauty Lounge)

Visit our web app to learn more and apply for your SOLVY Card:
https://nitty.ebl.beauty

Questions? Reply to this email - we're here to help!

Welcome to economic liberation,
The SOLVY Team`
    },
    {
      id: 'fb-interest',
      name: 'Facebook Interest Response',
      subject: 'You Asked About SOLVY on Facebook!',
      body: `Hi there!

Thanks for reaching out through our Facebook page. We're excited to share more about SOLVY with you!

SOLVY is built on three pillars:
1. SOVEREIGNITITY™ - You control your data
2. Cooperative Ownership - Members share in profits
3. Zero-Fee P2P - Send money free to other members

Our pilot partners (like Eva's Evergreen Beauty Lounge) are already proving this model works in real businesses.

Ready to join? Apply for your SOLVY Card:
https://nitty.ebl.beauty

Stay connected on Facebook for updates:
https://www.facebook.com/SANathanLLC/

To your financial freedom,
The SOLVY Team`
    },
    {
      id: 'info-request',
      name: 'Detailed Information Request',
      subject: 'SOLVY Platform - Complete Information',
      body: `Thank you for requesting more information about SOLVY!

SOLVY SOVEREIGNITITY Platform Overview:

WHAT WE ARE:
• America's first cooperative P2P payment platform
• Member-owned financial infrastructure
• Built by the community, for the community

KEY FEATURES:
• SOLVY Card - NFC tap-to-pay, works anywhere
• Zero-fee transfers between members
• Profit sharing - members earn from platform growth
• Privacy-first - your data stays yours

PILOT PARTNERS:
• Evergreen Beauty Lounge (Eva Martinez) - Active
• SPS Joint Venture - Active

EDUCATION:
• DECIDEY NGO provides financial literacy
• YouTube educator network for ongoing learning
• Regular community updates

GET STARTED:
1. Visit https://nitty.ebl.beauty
2. Apply for your SOLVY Card
3. Join the cooperative movement!

Learn more about our educational mission:
https://nitty.ebl.beauty/decidey

Best regards,
The SOLVY Team`
    },
    {
      id: 'partner-inquiry',
      name: 'Business Partner Inquiry',
      subject: 'Become a SOLVY Pilot Partner',
      body: `Thank you for your interest in becoming a SOLVY Partner!

As a SOLVY Pilot Partner, your business joins a cooperative movement that rewards both you and your customers.

PARTNER BENEFITS:
• Lower transaction fees than traditional processors
• Access to SOLVY member network
• Cooperative profit sharing
• Featured on our platform
• Marketing support

CURRENT PARTNERS:
• Evergreen Beauty Lounge - Beauty services
• SPS Joint Venture - Inventory management

HOW IT WORKS:
1. Apply to become a Pilot Partner
2. Integration with your existing systems
3. Accept SOLVY Card payments
4. Grow with the cooperative

Ready to discuss partnership?
Reply to this email or visit: https://nitty.ebl.beauty/ebl

Let's build together,
The SOLVY Team`
    }
  ]

  const copyTemplate = (template: typeof responseTemplates[0]) => {
    const text = `Subject: ${template.subject}\n\n${template.body}`
    navigator.clipboard.writeText(text)
    setCopiedTemplate(true)
    setTimeout(() => setCopiedTemplate(false), 2000)
  }

  const emails = [
    { id: 1, from: 'Eva Martinez', subject: 'Welcome to SOLVY Cooperative!', preview: 'Thank you for joining our community. Your application has been approved...', time: '2 min ago', unread: true, category: 'system' },
    { id: 2, from: 'SOLVY Support', subject: 'Your SOLVY Card Has Shipped', preview: 'Great news! Your SOLVY Card is on its way. Expected delivery in 3-5 business days...', time: '1 hour ago', unread: true, category: 'system' },
    { id: 3, from: 'Evergreen Beauty Lounge', subject: 'Appointment Confirmation - Dec 28', preview: 'Your appointment has been confirmed for December 28th at 2:00 PM...', time: '3 hours ago', unread: false, category: 'business' },
    { id: 4, from: 'SOLVY Treasury', subject: 'Q4 Profit Sharing Statement', preview: 'As a cooperative owner, here is your quarterly profit sharing statement...', time: 'Yesterday', unread: false, category: 'financial' },
    { id: 5, from: 'SPS Joint Venture', subject: 'Inventory Update - Week 52', preview: 'Weekly inventory report is now available. 23 items processed this week...', time: 'Dec 20', unread: false, category: 'business' },
    { id: 6, from: 'SOLVY Network', subject: 'New Member Referral Bonus', preview: 'You earned a referral bonus! $25 has been credited to your account...', time: 'Dec 18', unread: false, category: 'financial' },
  ]

  const filteredEmails = inboxFilter === 'all' ? emails : emails.filter(e => e.category === inboxFilter)

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
      <UnifiedNav currentPage="man" />

      {/* Hero Section */}
      <section className="man-hero">
        <div className="container">
          <h1>MAN - Mandatory Audit Network</h1>
          <p className="man-tagline">Transparency & Accountability for Members</p>
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
                <li>Email</li>
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
          <h2>Email Center</h2>
          <p>Your unified inbox for all cooperative communications</p>

          <div className="inbox-container">
            <div className="inbox-sidebar">
              <button className="compose-btn" onClick={() => setSelectedEmail(-1)}>
                ✏️ Compose
              </button>
              <div className="inbox-folders">
                <button className={`folder-btn ${inboxFilter === 'all' ? 'active' : ''}`} onClick={() => setInboxFilter('all')}>
                  📥 All Mail <span className="count">{emails.length}</span>
                </button>
                <button className={`folder-btn ${inboxFilter === 'system' ? 'active' : ''}`} onClick={() => setInboxFilter('system')}>
                  🔔 System <span className="count">{emails.filter(e => e.category === 'system').length}</span>
                </button>
                <button className={`folder-btn ${inboxFilter === 'business' ? 'active' : ''}`} onClick={() => setInboxFilter('business')}>
                  💼 Business <span className="count">{emails.filter(e => e.category === 'business').length}</span>
                </button>
                <button className={`folder-btn ${inboxFilter === 'financial' ? 'active' : ''}`} onClick={() => setInboxFilter('financial')}>
                  💰 Financial <span className="count">{emails.filter(e => e.category === 'financial').length}</span>
                </button>
              </div>
              <div className="inbox-stats">
                <div className="stat-item">
                  <span className="stat-num">{emails.filter(e => e.unread).length}</span>
                  <span className="stat-label">Unread</span>
                </div>
                <div className="stat-item">
                  <span className="stat-num">{emails.length}</span>
                  <span className="stat-label">Total</span>
                </div>
              </div>
            </div>

            <div className="inbox-main">
              {selectedEmail === -1 ? (
                <div className="compose-view">
                  <h3>New Message</h3>
                  <form onSubmit={handleSendEmail}>
                    <div className="form-group">
                      <label>To</label>
                      <input 
                        type="email" 
                        placeholder="member@email.com"
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
                        rows={8}
                        value={emailBody}
                        onChange={(e) => setEmailBody(e.target.value)}
                        required
                      />
                    </div>
                    <div className="compose-actions">
                      <button type="submit" className="btn-send" disabled={sendStatus === 'sending'}>
                        {sendStatus === 'sending' ? 'Sending...' : 'Send'}
                      </button>
                      <button type="button" className="btn-cancel" onClick={() => setSelectedEmail(null)}>Cancel</button>
                    </div>
                    {sendStatus === 'success' && <p className="send-success">✓ Sent!</p>}
                  </form>
                </div>
              ) : selectedEmail !== null ? (
                <div className="email-view">
                  <button className="back-btn" onClick={() => setSelectedEmail(null)}>← Back to Inbox</button>
                  {(() => {
                    const email = emails.find(e => e.id === selectedEmail)
                    if (!email) return null
                    return (
                      <>
                        <div className="email-header">
                          <h3>{email.subject}</h3>
                          <div className="email-meta">
                            <span className="email-from">From: {email.from}</span>
                            <span className="email-time">{email.time}</span>
                          </div>
                        </div>
                        <div className="email-body">
                          <p>{email.preview}</p>
                          <p>This is the full email content that would be displayed here. The cooperative keeps you informed about all important updates, transactions, and community activities.</p>
                        </div>
                        <div className="email-actions">
                          <button className="action-btn">↩️ Reply</button>
                          <button className="action-btn">↪️ Forward</button>
                          <button className="action-btn">🗑️ Delete</button>
                        </div>
                      </>
                    )
                  })()}
                </div>
              ) : (
                <div className="email-list">
                  {filteredEmails.map(email => (
                    <div 
                      key={email.id} 
                      className={`email-item ${email.unread ? 'unread' : ''}`}
                      onClick={() => setSelectedEmail(email.id)}
                    >
                      <div className="email-sender">{email.from}</div>
                      <div className="email-content">
                        <div className="email-subject">{email.subject}</div>
                        <div className="email-preview">{email.preview}</div>
                      </div>
                      <div className="email-time">{email.time}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Response Templates */}
      <section className="man-templates" id="templates">
        <div className="container">
          <h2>Response Templates</h2>
          <p>Ready-to-use templates for responding to interested parties from Facebook and other sources</p>

          <div className="templates-grid">
            {responseTemplates.map(template => (
              <div 
                key={template.id} 
                className={`template-card ${selectedTemplate === template.id ? 'selected' : ''}`}
                onClick={() => setSelectedTemplate(selectedTemplate === template.id ? null : template.id)}
              >
                <h3>{template.name}</h3>
                <p className="template-subject">Subject: {template.subject}</p>
                
                {selectedTemplate === template.id && (
                  <div className="template-content">
                    <pre>{template.body}</pre>
                    <button 
                      className="copy-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        copyTemplate(template)
                      }}
                    >
                      {copiedTemplate ? '✓ Copied!' : 'Copy Template'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="man-footer">
        <div className="container">
          <p><strong>MAN - Mandatory Audit Network</strong></p>
          <p>Transparency & Accountability for SOLVY Members</p>
          <p>© 2025 SOLVY Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default MAN
