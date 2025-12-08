import './UnifiedNav.css'

interface UnifiedNavProps {
  currentPage?: 'nitty' | 'decidey' | 'ebl' | 'home'
}

function UnifiedNav({ currentPage = 'nitty' }: UnifiedNavProps) {
  return (
    <nav className="unified-navbar">
      <div className="unified-nav-container">
        <a href="https://nitty.ebl.beauty" className="unified-nav-logo">
          <img src="/SolvyLogo-1024.png" alt="SOLVY" className="unified-logo-image" />
        </a>
        
        <div className="unified-nav-links">
          <a 
            href="https://nitty.ebl.beauty" 
            className={currentPage === 'nitty' ? 'active' : ''}
          >
            SOLVY Card
          </a>
          <a 
            href="https://decidey.ebl.beauty" 
            className={currentPage === 'decidey' ? 'active' : ''}
          >
            DECIDEY NGO
          </a>
          <a 
            href="https://ebl.beauty" 
            className={currentPage === 'ebl' ? 'active' : ''}
          >
            EBL Pilot
          </a>
          <a href="#sovereignitity">SOVEREIGNITITY™</a>
          <div className="nav-dropdown">
            <a href="#remittance" className="dropdown-toggle">Remittance ▼</a>
            <div className="dropdown-menu">
              <a href="https://remittance.ebl.beauty">Global Network</a>
              <a href="https://nitty.ebl.beauty#remittance">Overview</a>
            </div>
          </div>
        </div>
        
        <div className="unified-nav-cta">
          <a href="https://nitty.ebl.beauty#card" className="unified-btn-primary">
            Get Your Card
          </a>
        </div>
      </div>
    </nav>
  )
}

export default UnifiedNav
