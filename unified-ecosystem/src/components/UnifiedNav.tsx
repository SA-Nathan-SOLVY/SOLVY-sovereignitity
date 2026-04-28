import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './UnifiedNav.css'

interface UnifiedNavProps {
  currentPage?: 'solvy' | 'decidey' | 'ebl' | 'sps' | 'man' | 'admin' | 'remittance' | 'apply' | 'about'
}

function UnifiedNav({ currentPage = 'solvy' }: UnifiedNavProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false)
  const [decideyDropdownOpen, setDecideyDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, isLoading, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

  const closeMobileMenu = () => setMobileMenuOpen(false)

  const handleManLink = (hash: string) => {
    closeMobileMenu()
    setDropdownOpen(false)
    navigate('/man' + hash)
  }

  return (
    <nav className="unified-navbar">
      <div className="unified-nav-container">
        <Link to="/" className="unified-nav-logo">
          <img src="/SolvyLogo-1024.png" alt="SOLVY" className="unified-logo-image" />
        </Link>

        <button 
          className="hamburger-btn" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
        </button>
        
        {/* SOLVY ECOSYSTEM NAVBAR — three conceptual groups
            LEFT   (Public / Pilots & Revenue):  SOLVY Card · EBL · SPS
            CENTER (Public / Education):          About · DECIDEY → SOVEREIGNITITY
            RIGHT  (Members-only / Transparency): MAN
            REMITTANCE: intentionally absent (competition blind spot) */}
        <div className="unified-nav-links">

          {/* LEFT — Pilots & Revenue */}
          <div className="nav-group-left">
            <Link to="/" className={currentPage === 'solvy' ? 'active' : ''}>SOLVY Card</Link>
            <Link to="/ebl" className={currentPage === 'ebl' ? 'active' : ''}>Evergreen Beauty Lounge</Link>
            <Link to="/sps" className={currentPage === 'sps' ? 'active' : ''}>SPS Joint Venture</Link>
          </div>

          {/* CENTER — Education → SOVEREIGNITITY */}
          <div className="nav-group-center">
            <div
              className={`nav-dropdown ${aboutDropdownOpen ? 'open' : ''}`}
              onMouseEnter={() => setAboutDropdownOpen(true)}
              onMouseLeave={() => setAboutDropdownOpen(false)}
            >
              <button
                onClick={() => setAboutDropdownOpen(!aboutDropdownOpen)}
                className={`dropdown-toggle ${currentPage === 'about' ? 'active' : ''}`}
              >
                About ▼
              </button>
              <div className="dropdown-menu">
                <Link to="/manifesto" onClick={() => setAboutDropdownOpen(false)}>📜 Manifesto</Link>
                <Link to="/heritage" onClick={() => setAboutDropdownOpen(false)}>🏛️ Heritage</Link>
                <Link to="/sovereignitity" onClick={() => setAboutDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><img src="/solvy-crown-icon.png" alt="" style={{ height: '18px', width: 'auto', opacity: 0.9 }} /> SOVEREIGNITITY™</Link>
              </div>
            </div>

            <div
              className={`nav-dropdown ${decideyDropdownOpen ? 'open' : ''}`}
              onMouseEnter={() => setDecideyDropdownOpen(true)}
              onMouseLeave={() => setDecideyDropdownOpen(false)}
            >
              <button
                onClick={() => setDecideyDropdownOpen(!decideyDropdownOpen)}
                className={`dropdown-toggle ${currentPage === 'decidey' ? 'active' : ''}`}
              >
                DECIDEY ▼
              </button>
              <div className="dropdown-menu">
                <a href="https://www.facebook.com/profile.php?id=61586031364116" target="_blank" rel="noopener noreferrer" onClick={() => setDecideyDropdownOpen(false)}>📘 Connect on Facebook</a>
                <a href="/presentations/SOVEREIGNITITY-Cooperative-Neobank-IBC.pdf" target="_blank" rel="noopener noreferrer" onClick={() => setDecideyDropdownOpen(false)}>🏦 IBC Partnership Deck</a>
              </div>
            </div>
          </div>

          {/* RIGHT — Members-only / MAN */}
          <div className="nav-group-right">
            <div
              className={`nav-dropdown ${dropdownOpen ? 'open' : ''}`}
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`dropdown-toggle ${currentPage === 'man' ? 'active' : ''}`}
              >
                MAN ▼
              </button>
              <div className="dropdown-menu">
                <button onClick={() => handleManLink('')}>SOLVY Operations</button>
                <Link to="/comms" onClick={() => setDropdownOpen(false)}>📬 Comms Center</Link>
                <Link to="/mailbox" onClick={() => setDropdownOpen(false)}>✉️ Mailbox</Link>
                <Link to="/mailbox" onClick={() => setDropdownOpen(false)}>📋 Response Templates</Link>
                <Link to="/presentations" onClick={() => setDropdownOpen(false)}>📊 Presentations</Link>
              </div>
            </div>
          </div>

        </div>
        
        <div className="unified-nav-cta">
          {!isLoading && (
            <>
              {isAuthenticated ? (
                <>
                  <span className="nav-user-greeting">Hi, {user?.firstName || 'Member'}</span>
                  <Link to="/banking" className="unified-btn-primary">
                    Open Banking
                  </Link>
                  <a href="/api/logout" className="unified-btn-logout">
                    Logout
                  </a>
                </>
              ) : (
                <>
                  <Link to="/prelaunch" className="unified-btn-prelaunch">
                    Prelaunch Commit
                  </Link>
                  <Link to="/apply" className="unified-btn-secondary">
                    Apply for Card
                  </Link>
                  <a href="/api/login" className="unified-btn-primary">
                    Member Login
                  </a>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${mobileMenuOpen ? 'open' : ''}`} onClick={closeMobileMenu}></div>
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        {/* LEFT — Pilots & Revenue */}
        <span className="mobile-menu-label">Pilots &amp; Revenue</span>
        <Link to="/" className={currentPage === 'solvy' ? 'active' : ''} onClick={closeMobileMenu}>💳 SOLVY Card</Link>
        <Link to="/ebl" className={currentPage === 'ebl' ? 'active' : ''} onClick={closeMobileMenu}>Evergreen Beauty Lounge</Link>
        <Link to="/sps" className={currentPage === 'sps' ? 'active' : ''} onClick={closeMobileMenu}>SPS Joint Venture</Link>
        <div className="mobile-menu-divider"></div>
        {/* CENTER — Education → SOVEREIGNITITY */}
        <span className="mobile-menu-label">Education · DECIDEY</span>
        <Link to="/manifesto" onClick={closeMobileMenu}>📜 Manifesto</Link>
        <Link to="/heritage" onClick={closeMobileMenu}>🏛️ Heritage</Link>
        <Link to="/sovereignitity" onClick={closeMobileMenu} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><img src="/solvy-crown-icon.png" alt="" style={{ height: '20px', width: 'auto', opacity: 0.9 }} /> SOVEREIGNITITY™</Link>
        <a href="https://www.facebook.com/profile.php?id=61586031364116" target="_blank" rel="noopener noreferrer" onClick={closeMobileMenu}>📘 DECIDEY on Facebook</a>
        <a href="/presentations/SOVEREIGNITITY-Cooperative-Neobank-IBC.pdf" target="_blank" rel="noopener noreferrer" onClick={closeMobileMenu}>🏦 IBC Partnership Deck</a>
        <div className="mobile-menu-divider"></div>
        {/* RIGHT — Members-only / MAN */}
        <span className="mobile-menu-label">Members · MAN</span>
        <button className="mobile-menu-btn" onClick={() => handleManLink('')}>SOLVY Operations</button>
        <Link to="/comms" className="mobile-menu-btn" onClick={closeMobileMenu}>📬 Comms Center</Link>
        <Link to="/mailbox" className="mobile-menu-btn" onClick={closeMobileMenu}>✉️ Mailbox</Link>
        <Link to="/mailbox" className="mobile-menu-btn" onClick={closeMobileMenu}>📋 Response Templates</Link>
        <div className="mobile-menu-divider"></div>
        {!isLoading && (
          <>
            {isAuthenticated ? (
              <>
                <span className="mobile-user-greeting">Hi, {user?.firstName || 'Member'}</span>
                <Link to="/banking" className="mobile-cta" onClick={closeMobileMenu}>Open Banking</Link>
                <a href="/api/logout" className="mobile-logout" onClick={closeMobileMenu}>Logout</a>
              </>
            ) : (
              <>
                <Link to="/prelaunch" className="mobile-cta-prelaunch" onClick={closeMobileMenu}>Prelaunch Commit</Link>
                <Link to="/apply" className="mobile-cta-secondary" onClick={closeMobileMenu}>Apply for Card</Link>
                <a href="/api/login" className="mobile-cta" onClick={closeMobileMenu}>Member Login</a>
              </>
            )}
          </>
        )}
      </div>
    </nav>
  )
}

export default UnifiedNav
