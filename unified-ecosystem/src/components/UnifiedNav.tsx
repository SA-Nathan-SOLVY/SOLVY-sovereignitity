import './UnifiedNav.css'

interface UnifiedNavProps {
  currentPage?: 'solvy' | 'decidey' | 'ebl' | 'sps' | 'man' | 'admin'
}

function UnifiedNav({ currentPage = 'solvy' }: UnifiedNavProps) {
  return (
    <nav className="unified-navbar">
      <div className="unified-nav-container">
        <a href="/" className="unified-nav-logo">
          <img src="/SolvyLogo-1024.png" alt="SOLVY" className="unified-logo-image" />
        </a>
        
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
          <div className="nav-dropdown">
            <a href="/man" className={`dropdown-toggle ${currentPage === 'man' ? 'active' : ''}`}>
              MAN ▼
            </a>
            <div className="dropdown-menu">
              <a href="/man">SOLVY Operations</a>
              <a href="/man#comms">Communications Center</a>
              <a href="/man#email">Email Center (Resend)</a>
            </div>
          </div>
        </div>
        
        <div className="unified-nav-cta">
          <a href="#apply" className="unified-btn-primary">
            Apply for Card
          </a>
        </div>
      </div>
    </nav>
  )
}

export default UnifiedNav
