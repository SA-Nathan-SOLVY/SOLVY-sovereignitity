import { useState, useEffect } from 'react'
import './UnifiedNav.css'

function UnifiedNav() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <nav className="unified-navbar">
      <div className="unified-nav-container">
        <a href="/" className="unified-nav-logo">
          <img src="/SolvyLogo-1024.png" alt="SOLVY" className="unified-logo-image" />
        </a>

        <button 
          className="hamburger-btn" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
        </button>
        
        <div className="unified-nav-links">
          <a href="/">SOLVY Card</a>
          <a href="/banking">Banking</a>
          <a href="/decidey">DECIDEY NGO</a>
          <a href="https://ebl.beauty" target="_blank" rel="noopener noreferrer">EBL Pilot</a>
          <a href="/sps-presentation">SPS Joint Venture</a>
          <div 
            className={`nav-dropdown ${dropdownOpen ? 'open' : ''}`}
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="dropdown-toggle"
            >
              MAN ▼
            </button>
            <div className="dropdown-menu">
              <a href="/communications">Communications Center</a>
              <a href="/sps-presentation">SPS Modernized Content</a>
            </div>
          </div>
        </div>
        
        <div className="unified-nav-cta">
          <a href="/request-card" className="unified-btn-secondary">
            Apply for Card
          </a>
        </div>
      </div>

      <div className={`mobile-menu-overlay ${mobileMenuOpen ? 'open' : ''}`} onClick={closeMobileMenu}></div>
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <a href="/" onClick={closeMobileMenu}>SOLVY Card</a>
        <a href="/banking" onClick={closeMobileMenu}>Banking</a>
        <a href="/decidey" onClick={closeMobileMenu}>DECIDEY NGO</a>
        <a href="https://ebl.beauty" target="_blank" rel="noopener noreferrer" onClick={closeMobileMenu}>EBL Pilot</a>
        <a href="/sps-presentation" onClick={closeMobileMenu}>SPS Joint Venture</a>
        <div className="mobile-menu-divider"></div>
        <span className="mobile-menu-label">MAN - Mandatory Audit Network</span>
        <a href="/communications" onClick={closeMobileMenu}>Communications Center</a>
        <a href="/sps-presentation" onClick={closeMobileMenu}>SPS Modernized Content</a>
        <div className="mobile-menu-divider"></div>
        <a href="/request-card" className="mobile-cta" onClick={closeMobileMenu}>Apply for Card</a>
      </div>
    </nav>
   )
}

export default UnifiedNav
