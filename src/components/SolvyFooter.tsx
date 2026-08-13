import './SolvyFooter.css'

export default function SolvyFooter() {
  return (
    <footer className="solvy-footer">
      <div className="sf-inner">
        <div className="sf-top">
          <div className="sf-brand">
            <img src="/solvy-crown-icon.png" alt="SOLVY" className="sf-logo" />
            <div>
              <p className="sf-brand-name">SOLVY Ecosystem™</p>
              <p className="sf-brand-tagline">SOLVY (Solutions Valued You)</p>
              <p className="sf-brand-sub">America's First Cooperative P2P Payment Platform</p>
            </div>
          </div>

          <div className="sf-links">
            <div className="sf-col">
              <h4>Platform</h4>
              <a href="/">SOLVY Home</a>
              <a href="/apply">Apply for Card</a>
              <a href="/prelaunch">Prelaunch Commitment</a>
              <a href="/remittance">Remittance</a>
            </div>
            <div className="sf-col">
              <h4>Pilots</h4>
              <a href="/ebl">Evergreen Beauty Lounge</a>
              <a href="/sps">SPS Joint Venture</a>
              <a href="https://decidey.ebl.beauty" target="_blank" rel="noopener noreferrer">DECIDEY NGO</a>
            </div>
            <div className="sf-col">
              <h4>Internal</h4>
              <a href="/man">Operations</a>
              <a href="/comms">Comms Center</a>
              <a href="/mailbox">Team Mailbox</a>
            </div>
            <div className="sf-col">
              <h4>Legal</h4>
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
              <a href="#sovereignty">SOVEREIGNITITY™</a>
            </div>
          </div>
        </div>

        <div className="sf-bottom">
          <p>© 2025 SOLVY Ecosystem™. All rights reserved. SOLVY Card™ is a trademark of SOLVY Ecosystem.</p>
          <p>Created by SA Nathan · <a href="https://solvy.cards" target="_blank" rel="noopener noreferrer">solvy.cards</a></p>
        </div>
      </div>
    </footer>
  )
}
