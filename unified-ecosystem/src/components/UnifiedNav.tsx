import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import './UnifiedNav.css'

interface UnifiedNavProps {
  currentPage?: 'solvy' | 'decidey' | 'ebl' | 'sps' | 'man' | 'admin' | 'remittance' | 'apply'
}

function UnifiedNav({ currentPage = 'solvy' }: UnifiedNavProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, isLoading, isAuthenticated } = useAuth()

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
          <a 
            href="/" 
            className={currentPage === 'solvy' ? 'active' : ''}
          >
            SOLVY Card
          </a>
          <a 
            href="/decidey" 
            className={currentPage === 'decidey' ? 'active' : ''}
          >
            DECIDEY NGO
          </a>
          <a 
            href="/ebl" 
            className={currentPage === 'ebl' ? 'active' : ''}
          >
            Evergreen Beauty Lounge
          </a>
          <a 
            href="/sps" 
            className={currentPage === 'sps' ? 'active' : ''}
          >
            SPS Joint Venture
          </a>
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
              <a href="/man">SOLVY Operations</a>
              <a href="/man#comms">Communications Center</a>
              <a href="/man#email">Email Center</a>
              <a href="/man#templates">Response Templates</a>
            </div>
          </div>
        </div>
        
        <div className="unified-nav-cta">
          {!isLoading && (
            <>
              {isAuthenticated ? (
                <>
                  <span className="nav-user-greeting">Hi, {user?.firstName || 'Member'}</span>
                  <a href="/banking" className="unified-btn-primary">
                    Open Banking
                  </a>
                  <a href="/api/logout" className="unified-btn-logout">
                    Logout
                  </a>
                </>
              ) : (
                <>
                  <a href="/apply" className="unified-btn-secondary">
                    Apply for Card
                  </a>
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
        <a href="/" className={currentPage === 'solvy' ? 'active' : ''} onClick={closeMobileMenu}>SOLVY Card</a>
        <a href="/decidey" className={currentPage === 'decidey' ? 'active' : ''} onClick={closeMobileMenu}>DECIDEY NGO</a>
        <a href="/ebl" className={currentPage === 'ebl' ? 'active' : ''} onClick={closeMobileMenu}>Evergreen Beauty Lounge</a>
        <a href="/sps" className={currentPage === 'sps' ? 'active' : ''} onClick={closeMobileMenu}>SPS Joint Venture</a>
        <div className="mobile-menu-divider"></div>
        <span className="mobile-menu-label">MAN - Mandatory Audit Network</span>
        <a href="/man" onClick={closeMobileMenu}>SOLVY Operations</a>
        <a href="/man#comms" onClick={closeMobileMenu}>Communications Center</a>
        <a href="/man#email" onClick={closeMobileMenu}>Email Center</a>
        <a href="/man#templates" onClick={closeMobileMenu}>Response Templates</a>
        <div className="mobile-menu-divider"></div>
        {!isLoading && (
          <>
            {isAuthenticated ? (
              <>
                <span className="mobile-user-greeting">Hi, {user?.firstName || 'Member'}</span>
                <a href="/banking" className="mobile-cta" onClick={closeMobileMenu}>Open Banking</a>
                <a href="/api/logout" className="mobile-logout" onClick={closeMobileMenu}>Logout</a>
              </>
            ) : (
              <>
                <a href="/apply" className="mobile-cta-secondary" onClick={closeMobileMenu}>Apply for Card</a>
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
