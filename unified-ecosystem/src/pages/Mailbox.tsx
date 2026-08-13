import { useEffect, useState } from 'react'
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
  { name: 'Sean Mayo', email: 'sean@ebl.beauty', role: 'Founder · Passive Member', initial: 'S' },
  { name: 'Evergreen Mayo', email: 'eva@solvy.cards', role: 'CEO · Managing Owner', initial: 'E' },
  { name: 'Eva (EBL)', email: 'eva@ebl.beauty', role: 'Pilot Partner #1', initial: 'E' },
  { name: 'Smayone', email: 'smayone@ebl.beauty', role: 'Operations', initial: 'S' },
  { name: 'Sydney', email: 'sydney@ebl.beauty', role: 'Community', initial: 'S' },
  { name: 'Full Team', email: 'team@ebl.beauty', role: 'All Staff', initial: 'T' },
]

interface InboxMeta {
  key: string
  label: string
  configured: boolean
}

interface InboxMessage {
  id: string
  thread_id: string
  inbox_id: string
  from: { email: string; name?: string }[]
  to: { email: string; name?: string }[]
  subject: string
  preview: string
  created_at: string
  labels: string[]
}

interface FullMessage extends InboxMessage {
  body?: { text?: string; html?: string }
  attachments?: { filename: string; content_type: string; size: number }[]
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return d.toLocaleDateString()
}

function senderName(from: { email: string; name?: string }[]): string {
  if (!from || from.length === 0) return 'Unknown'
  const f = from[0]
  return f.name && f.name !== f.email ? `${f.name} <${f.email}>` : f.email
}

function senderInitial(from: { email: string; name?: string }[]): string {
  if (!from || from.length === 0) return '?'
  const name = from[0].name || from[0].email
  return name.trim()[0].toUpperCase()
}

function Mailbox() {
  const [view, setView] = useState<'inbox' | 'compose' | 'read' | 'templates'>('inbox')
  const [selected, setSelected] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [copiedTemplate, setCopiedTemplate] = useState(false)
  const [toField, setToField] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [fromName, setFromName] = useState('')
  const [fromEmail, setFromEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  // Live inbox state
  const [inboxes, setInboxes] = useState<InboxMeta[]>([])
  const [activeInbox, setActiveInbox] = useState<string>('eva')
  const [messages, setMessages] = useState<InboxMessage[]>([])
  const [fullMessage, setFullMessage] = useState<FullMessage | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/email/inboxes')
      .then(r => r.json())
      .then(data => {
        const list = (data.inboxes || []) as InboxMeta[]
        setInboxes(list)
        // Prefer eva inbox if configured, otherwise first configured
        const eva = list.find(i => i.key === 'eva' && i.configured)
        if (eva) setActiveInbox('eva')
        else {
          const first = list.find(i => i.configured)
          if (first) setActiveInbox(first.key)
        }
      })
      .catch(err => {
        console.error('[Mailbox] Failed to load inboxes:', err)
        setError('Email backend not configured')
      })
  }, [])

  useEffect(() => {
    if (!activeInbox) return
    setLoading(true)
    setError('')
    fetch(`/api/email/inbox/${activeInbox}?limit=50`)
      .then(async r => {
        if (!r.ok) throw new Error(await r.text())
        return r.json()
      })
      .then(data => {
        setMessages(data.messages || [])
      })
      .catch(err => {
        console.error('[Mailbox] Failed to load messages:', err)
        setError(err.message || 'Failed to load messages')
      })
      .finally(() => setLoading(false))
  }, [activeInbox])

  const openEmail = (id: string) => {
    setSelected(id)
    setFullMessage(null)
    setView('read')
    const msg = messages.find(m => m.id === id)
    if (!msg) return
    fetch(`/api/email/message/${activeInbox}/${id}`)
      .then(async r => {
        if (!r.ok) throw new Error(await r.text())
        return r.json()
      })
      .then(data => setFullMessage(data.message))
      .catch(err => {
        console.error('[Mailbox] Failed to load message:', err)
        setError(err.message || 'Failed to load message')
      })
  }

  const currentEmail = messages.find(e => e.id === selected)
  const unread = messages.filter(e => !e.labels.includes('read')).length

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

  return (
    <div className="mailbox-app">
      <UnifiedNav currentPage="man" />

      <section className="mailbox-hero">
        <div className="mailbox-hero-inner">
          <p className="mailbox-eyebrow">MAN · Internal</p>
          <h1>Team Mailbox</h1>
          <p className="mailbox-sub">@solvy.cards — view replies from partners and members</p>
        </div>
      </section>

      <div className="mailbox-layout">

        {/* LEFT SIDEBAR */}
        <aside className="mailbox-sidebar">
          <button className="compose-btn" onClick={() => { setView('compose'); setStatus('idle') }}>
            ✏️ Compose
          </button>

          <div className="folder-nav">
            <div style={{ padding: '0 12px 8px', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Received Mail
            </div>
            {inboxes.length === 0 && (
              <div style={{ padding: '12px', fontSize: '0.85rem', color: '#94a3b8' }}>
                No inboxes configured.
              </div>
            )}
            {inboxes.map(box => (
              <button
                key={box.key}
                className={`folder-btn ${activeInbox === box.key && view === 'inbox' ? 'active' : ''}`}
                onClick={() => { setActiveInbox(box.key); setView('inbox') }}
                title={box.configured ? box.label : `${box.label} — not configured`}
              >
                {box.configured ? '📧' : '⚠️'} {box.label}
                {box.key === activeInbox && <span className="badge">{unread}</span>}
              </button>
            ))}
          </div>

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
                  <input type="text" placeholder="e.g. Evergreen Mayo" value={fromName} onChange={e => setFromName(e.target.value)} required />
                </div>
                <div className="mb-field">
                  <label>From Email</label>
                  <input type="email" placeholder="eva@solvy.cards" value={fromEmail} onChange={e => setFromEmail(e.target.value)} required />
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
                  <span>From: <strong>{senderName(currentEmail.from)}</strong></span>
                  <span>{formatTime(currentEmail.created_at)}</span>
                </div>
                <div className="read-meta">
                  <span>To: {currentEmail.to.map(t => t.email).join(', ')}</span>
                </div>
              </div>
              <div className="read-body">
                {fullMessage?.body?.html ? (
                  <div dangerouslySetInnerHTML={{ __html: fullMessage.body.html }} />
                ) : fullMessage?.body?.text ? (
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{fullMessage.body.text}</pre>
                ) : (
                  <>
                    <p>{currentEmail.preview}</p>
                    <p>Loading full message…</p>
                  </>
                )}
              </div>
              {fullMessage?.attachments && fullMessage.attachments.length > 0 && (
                <div className="read-attachments">
                  <strong>Attachments:</strong>
                  <ul>
                    {fullMessage.attachments.map(a => (
                      <li key={a.filename}>{a.filename} ({a.content_type}, {a.size} bytes)</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="read-actions">
                <button className="action-btn" onClick={() => { setToField(senderName(currentEmail.from)); setSubject('Re: ' + currentEmail.subject); setView('compose') }}>↩️ Reply</button>
                <button className="action-btn" onClick={() => setView('inbox')}>↪️ Forward</button>
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
                <h2>{inboxes.find(i => i.key === activeInbox)?.label || 'Inbox'}</h2>
                <span className="panel-count">{loading ? 'Loading…' : `${messages.length} messages`}</span>
              </div>
              {error && <p className="inbox-error" style={{ color: '#ef4444', padding: '12px' }}>⚠ {error}</p>}
              {!loading && messages.length === 0 && (
                <p className="inbox-empty">
                  {inboxes.find(i => i.key === activeInbox)?.configured
                    ? 'No messages in this inbox.'
                    : 'Inbox not configured. Add the Mailcow IMAP password to .env and restart the server.'}
                </p>
              )}
              {!loading && messages.length > 0 && (
                <ul className="email-list">
                  {messages.map(email => (
                    <li
                      key={email.id}
                      className={`email-row ${!email.labels.includes('read') ? 'unread' : ''}`}
                      onClick={() => openEmail(email.id)}
                    >
                      <div className="er-avatar">{senderInitial(email.from)}</div>
                      <div className="er-content">
                        <div className="er-top">
                          <span className="er-from">{senderName(email.from)}</span>
                          <span className="er-time">{formatTime(email.created_at)}</span>
                        </div>
                        <div className="er-subject">{email.subject}</div>
                        <div className="er-preview">{email.preview}</div>
                      </div>
                      {!email.labels.includes('read') && <span className="unread-dot" />}
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
