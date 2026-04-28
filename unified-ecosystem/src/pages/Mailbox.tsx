import { useState } from 'react'
import UnifiedNav from '../components/UnifiedNav'
import SolvyFooter from '../components/SolvyFooter'
import './Mailbox.css'

const TEMPLATES = [
  {
    id: 'welcome',
    name: 'Welcome — New Interest',
    subject: 'Welcome to the SOLVY Movement!',
    body: `Thank you for your interest in SOLVY!

We're building America's first P2P payment platform with cooperative ownership - where members are owners, not customers.

Here's what makes us different:
• Zero-fee P2P transfers between members
• Cooperative profit sharing - you earn as we grow
• Military-grade data privacy - YOU own your data
• Real businesses accepting SOLVY (like Evergreen Beauty Lounge)

Visit our web app to learn more and apply for your SOLVY Card:
https://solvy.cards

Questions? Reply to this email - we're here to help!

Welcome to economic liberation,
The SOLVY Team`,
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
https://solvy.cards

Stay connected on Facebook for updates:
https://www.facebook.com/SANathanLLC/

To your financial freedom,
The SOLVY Team`,
  },
  {
    id: 'info-request',
    name: 'Detailed Information Request',
    subject: 'SOLVY Platform — Complete Information',
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
• SPS Joint Venture - Proposal

EDUCATION:
• DECIDEY NGO provides financial literacy
• YouTube educator network for ongoing learning
• Regular community updates

GET STARTED:
1. Visit https://solvy.cards
2. Apply for your SOLVY Card
3. Join the cooperative movement!

Learn more about our educational mission:
https://solvy.cards/decidey

Best regards,
The SOLVY Team`,
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
• SPS Joint Venture - Proposed

HOW IT WORKS:
1. Apply to become a Pilot Partner
2. Integration with your existing systems
3. Accept SOLVY Card payments
4. Grow with the cooperative

Ready to discuss partnership?
Reply to this email or visit: https://solvy.cards/ebl

Let's build together,
The SOLVY Team`,
  },
]

const TEAM_ADDRESSES = [
  { name: 'Sean Mayo', email: 'sean@solvy.cards', role: 'Founder · CEO', initial: 'S' },
  { name: 'Eva (EBL)', email: 'eva@solvy.cards', role: 'Pilot Partner #1', initial: 'E' },
  { name: 'Smayone', email: 'smayone@solvy.cards', role: 'Operations', initial: 'S' },
  { name: 'Sydney', email: 'sydney@solvy.cards', role: 'Community', initial: 'S' },
  { name: 'Full Team', email: 'team@solvy.cards', role: 'All Staff', initial: 'T' },
]

const INBOX = [
  { id: 1, from: 'Eva Martinez', subject: 'EBL — appointment question', preview: 'Hey team, had a client ask about…', time: '2 min ago', unread: true, cat: 'ebl' },
  { id: 2, from: 'SOLVY System', subject: 'New prelaunch commitment received', preview: 'A new member committed via the prelaunch form…', time: '1 hr ago', unread: true, cat: 'system' },
  { id: 3, from: 'Smayone', subject: 'Operations check-in', preview: 'Weekly check-in notes attached…', time: '3 hrs ago', unread: false, cat: 'ops' },
  { id: 4, from: 'SOLVY Treasury', subject: 'Q4 Profit Sharing Statement', preview: 'Quarterly distribution ready for review…', time: 'Yesterday', unread: false, cat: 'financial' },
  { id: 5, from: 'SPS Contact', subject: 'JV proposal follow-up', preview: 'Following up on the joint venture proposal…', time: 'Dec 20', unread: false, cat: 'partners' },
  { id: 6, from: 'Sydney', subject: 'Facebook community update', preview: 'DECIDEY page growing — here are this week\'s numbers…', time: 'Dec 18', unread: false, cat: 'ops' },
]

const CATS = ['all', 'system', 'ops', 'financial', 'ebl', 'partners']
const CAT_LABELS: Record<string, string> = {
  all: '📥 All', system: '🔔 System', ops: '⚙️ Ops',
  financial: '💰 Financial', ebl: '💅 EBL', partners: '🤝 Partners',
}

function Mailbox() {
  const [view, setView] = useState<'inbox' | 'compose' | 'read' | 'templates'>('inbox')
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState<number | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [copiedTemplate, setCopiedTemplate] = useState(false)
  const [toField, setToField] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [fromName, setFromName] = useState('')
  const [fromEmail, setFromEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const filtered = filter === 'all' ? INBOX : INBOX.filter(e => e.cat === filter)
  const unread = INBOX.filter(e => e.unread).length

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fromName || 'SOLVY Team',
          email: fromEmail || 'team@solvy.cards',
          subject,
          message: `To: ${toField}\n\n${body}`,
        }),
      })
      setStatus(res.ok ? 'sent' : 'error')
      if (res.ok) { setToField(''); setSubject(''); setBody(''); setFromName(''); setFromEmail('') }
    } catch {
      setStatus('error')
    }
  }

  const copyTemplate = (t: typeof TEMPLATES[0]) => {
    navigator.clipboard.writeText(`Subject: ${t.subject}\n\n${t.body}`)
    setCopiedTemplate(true)
    setTimeout(() => setCopiedTemplate(false), 2000)
  }

  const useTemplate = (t: typeof TEMPLATES[0]) => {
    setSubject(t.subject)
    setBody(t.body)
    setView('compose')
  }

  const openEmail = (id: number) => { setSelected(id); setView('read') }
  const currentEmail = INBOX.find(e => e.id === selected)

  return (
    <div className="mailbox-app">
      <UnifiedNav currentPage="man" />

      <section className="mailbox-hero">
        <div className="mailbox-hero-inner">
          <p className="mailbox-eyebrow">MAN · Internal</p>
          <h1>Team Mailbox</h1>
          <p className="mailbox-sub">@solvy.cards — internal team communications</p>
        </div>
      </section>

      <div className="mailbox-layout">

        {/* LEFT SIDEBAR */}
        <aside className="mailbox-sidebar">
          <button className="compose-btn" onClick={() => { setView('compose'); setStatus('idle') }}>
            ✏️ Compose
          </button>

          <nav className="folder-nav">
            {CATS.map(c => (
              <button
                key={c}
                className={`folder-btn ${filter === c && view === 'inbox' ? 'active' : ''}`}
                onClick={() => { setFilter(c); setView('inbox') }}
              >
                {CAT_LABELS[c]}
                {c === 'all' && <span className="badge">{unread}</span>}
              </button>
            ))}
          </nav>

          <button
            className={`folder-btn ${view === 'templates' ? 'active' : ''}`}
            onClick={() => setView('templates')}
          >
            📋 Templates
          </button>

          <div className="address-book">
            <h4>@solvy.cards</h4>
            {TEAM_ADDRESSES.map(t => (
              <button
                key={t.email}
                className="address-item"
                onClick={() => { setToField(t.email); setView('compose') }}
                title={`Compose to ${t.email}`}
              >
                <span className="addr-avatar">{t.initial}</span>
                <div>
                  <div className="addr-name">{t.name}</div>
                  <div className="addr-role">{t.role}</div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* MAIN AREA */}
        <main className="mailbox-main">

          {view === 'compose' && (
            <div className="compose-panel">
              <div className="panel-header">
                <h2>New Message</h2>
                <button className="close-btn" onClick={() => setView('inbox')}>✕</button>
              </div>
              <form onSubmit={handleSend}>
                <div className="mb-field">
                  <label>From Name</label>
                  <input type="text" placeholder="e.g. Sean Mayo" value={fromName} onChange={e => setFromName(e.target.value)} required />
                </div>
                <div className="mb-field">
                  <label>From Email</label>
                  <input type="email" placeholder="sean@solvy.cards" value={fromEmail} onChange={e => setFromEmail(e.target.value)} required />
                </div>
                <div className="mb-field">
                  <label>To</label>
                  <input type="text" placeholder="recipient@email.com" value={toField} onChange={e => setToField(e.target.value)} required />
                </div>
                <div className="mb-field">
                  <label>Subject</label>
                  <input type="text" placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} required />
                </div>
                <div className="mb-field">
                  <label>Message</label>
                  <textarea rows={8} placeholder="Write your message…" value={body} onChange={e => setBody(e.target.value)} required />
                </div>
                <div className="compose-actions">
                  <button type="submit" className="btn-send" disabled={status === 'sending'}>
                    {status === 'sending' ? 'Sending…' : '📤 Send'}
                  </button>
                  <button type="button" className="btn-discard" onClick={() => setView('inbox')}>Discard</button>
                </div>
                {status === 'sent' && <p className="mb-success">✓ Sent to team@solvy.cards</p>}
                {status === 'error' && <p className="mb-error">⚠ Failed. Email team@solvy.cards directly.</p>}
              </form>
            </div>
          )}

          {view === 'read' && currentEmail && (
            <div className="read-panel">
              <button className="back-btn" onClick={() => setView('inbox')}>← Back</button>
              <div className="read-header">
                <h2>{currentEmail.subject}</h2>
                <div className="read-meta">
                  <span>From: <strong>{currentEmail.from}</strong></span>
                  <span>{currentEmail.time}</span>
                </div>
              </div>
              <div className="read-body">
                <p>{currentEmail.preview}</p>
                <p>Full message content would appear here once connected to a live mail backend.</p>
              </div>
              <div className="read-actions">
                <button className="action-btn" onClick={() => { setToField(currentEmail.from); setSubject('Re: ' + currentEmail.subject); setView('compose') }}>↩️ Reply</button>
                <button className="action-btn">↪️ Forward</button>
                <button className="action-btn del" onClick={() => setView('inbox')}>🗑️ Delete</button>
              </div>
            </div>
          )}

          {view === 'templates' && (
            <div className="templates-panel">
              <div className="panel-header">
                <h2>📋 Response Templates</h2>
                <span className="panel-count">{TEMPLATES.length} templates</span>
              </div>
              <div className="templates-list">
                {TEMPLATES.map(t => (
                  <div
                    key={t.id}
                    className={`tpl-card ${selectedTemplate === t.id ? 'open' : ''}`}
                    onClick={() => setSelectedTemplate(selectedTemplate === t.id ? null : t.id)}
                  >
                    <div className="tpl-header">
                      <div>
                        <div className="tpl-name">{t.name}</div>
                        <div className="tpl-subject">Subject: {t.subject}</div>
                      </div>
                      <span className="tpl-chevron">{selectedTemplate === t.id ? '▲' : '▼'}</span>
                    </div>
                    {selectedTemplate === t.id && (
                      <div className="tpl-body">
                        <pre>{t.body}</pre>
                        <div className="tpl-actions">
                          <button className="btn-use-tpl" onClick={e => { e.stopPropagation(); useTemplate(t) }}>
                            ✏️ Use in Compose
                          </button>
                          <button className="btn-copy-tpl" onClick={e => { e.stopPropagation(); copyTemplate(t) }}>
                            {copiedTemplate ? '✓ Copied!' : '📋 Copy'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === 'inbox' && (
            <div className="inbox-panel">
              <div className="panel-header">
                <h2>{CAT_LABELS[filter] || 'Inbox'}</h2>
                <span className="panel-count">{filtered.length} messages</span>
              </div>
              {filtered.length === 0 ? (
                <p className="inbox-empty">No messages in this folder.</p>
              ) : (
                <ul className="email-list">
                  {filtered.map(email => (
                    <li
                      key={email.id}
                      className={`email-row ${email.unread ? 'unread' : ''}`}
                      onClick={() => openEmail(email.id)}
                    >
                      <div className="er-avatar">{email.from[0]}</div>
                      <div className="er-content">
                        <div className="er-top">
                          <span className="er-from">{email.from}</span>
                          <span className="er-time">{email.time}</span>
                        </div>
                        <div className="er-subject">{email.subject}</div>
                        <div className="er-preview">{email.preview}</div>
                      </div>
                      {email.unread && <span className="unread-dot" />}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

        </main>
      </div>
      <SolvyFooter />
    </div>
  )
}

export default Mailbox
