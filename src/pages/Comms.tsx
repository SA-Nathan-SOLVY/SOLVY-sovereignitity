import { useState } from 'react'
import UnifiedNav from '../components/UnifiedNav'
import SolvyFooter from '../components/SolvyFooter'
import './Comms.css'

const TEAM = [
  { name: 'Sean Mayo', email: 'sean@solvy.cards', role: 'Founder · CEO' },
  { name: 'Eva (EBL)', email: 'eva@solvy.cards', role: 'Pilot Partner #1' },
  { name: 'Smayone', email: 'smayone@solvy.cards', role: 'Operations' },
  { name: 'Sydney', email: 'sydney@solvy.cards', role: 'Community' },
  { name: 'Full Team', email: 'team@solvy.cards', role: 'All Staff' },
]

const SEGMENTS = [
  'All Members',
  'Card Holders Only',
  'Pilot Partners',
  'New Applicants',
  'Prelaunch Commitments',
]

const CHANNELS = ['Email', 'SMS', 'In-App Message', 'Push Notification']

function Comms() {
  const [segment, setSegment] = useState('All Members')
  const [channels, setChannels] = useState<string[]>(['Email'])
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const toggleChannel = (ch: string) => {
    setChannels(prev => prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch])
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'SOLVY Team',
          email: 'team@solvy.cards',
          subject: `[BROADCAST · ${segment}] ${subject}`,
          message: `Channels: ${channels.join(', ')}\nSegment: ${segment}\n\n${body}`,
        }),
      })
      setStatus(res.ok ? 'sent' : 'error')
      if (res.ok) { setSubject(''); setBody('') }
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="comms-app">
      <UnifiedNav currentPage="man" />

      <section className="comms-hero">
        <div className="comms-hero-inner">
          <p className="comms-eyebrow">MAN · Internal</p>
          <h1>Comms Center</h1>
          <p className="comms-sub">Broadcast announcements to cooperative members</p>
        </div>
      </section>

      <div className="comms-layout">

        {/* LEFT — Team Directory */}
        <aside className="comms-sidebar">
          <h3>Team Directory</h3>
          <ul className="team-list">
            {TEAM.map(t => (
              <li key={t.email} className="team-item">
                <span className="team-avatar">{t.name[0]}</span>
                <div>
                  <div className="team-name">{t.name}</div>
                  <div className="team-role">{t.role}</div>
                  <a href={`mailto:${t.email}`} className="team-email">{t.email}</a>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        {/* RIGHT — Broadcast Composer */}
        <main className="comms-main">
          <form className="broadcast-form" onSubmit={handleSend}>

            <div className="comms-field">
              <label>Audience Segment</label>
              <div className="segment-pills">
                {SEGMENTS.map(s => (
                  <button
                    key={s}
                    type="button"
                    className={`pill ${segment === s ? 'active' : ''}`}
                    onClick={() => setSegment(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="comms-field">
              <label>Channels</label>
              <div className="channel-pills">
                {CHANNELS.map(ch => (
                  <button
                    key={ch}
                    type="button"
                    className={`pill ${channels.includes(ch) ? 'active' : ''}`}
                    onClick={() => toggleChannel(ch)}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>

            <div className="comms-field">
              <label>Subject</label>
              <input
                type="text"
                placeholder="Announcement subject…"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                required
              />
            </div>

            <div className="comms-field">
              <label>Message</label>
              <textarea
                rows={8}
                placeholder="Write your announcement…"
                value={body}
                onChange={e => setBody(e.target.value)}
                required
              />
            </div>

            <div className="broadcast-footer">
              <div className="broadcast-meta">
                Sending to <strong>{segment}</strong> via <strong>{channels.join(', ') || '—'}</strong>
              </div>
              <button type="submit" className="btn-broadcast" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : '📢 Send Broadcast'}
              </button>
            </div>

            {status === 'sent' && <p className="comms-success">✓ Broadcast queued and sent to team@solvy.cards</p>}
            {status === 'error' && <p className="comms-error">⚠ Failed to send. Email team@solvy.cards directly.</p>}
          </form>

          {/* Quick announcements */}
          <div className="quick-announce">
            <h4>Quick Announce</h4>
            <div className="qa-grid">
              {[
                { label: 'System Maintenance', icon: '🔧' },
                { label: 'New Feature Live', icon: '🚀' },
                { label: 'Profit Share Ready', icon: '💰' },
                { label: 'Cooperative Meeting', icon: '📅' },
              ].map(q => (
                <button
                  key={q.label}
                  type="button"
                  className="qa-btn"
                  onClick={() => setSubject(q.label)}
                >
                  {q.icon} {q.label}
                </button>
              ))}
            </div>
          </div>
        </main>

      </div>
      <SolvyFooter />
    </div>
  )
}

export default Comms
