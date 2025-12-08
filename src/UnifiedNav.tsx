import './UnifiedNav.css'

interface UnifiedNavProps {
  currentPage?: 'nitty' | 'decidey' | 'ebl' | 'home'
}

function UnifiedNav({ currentPage = 'nitty' }: UnifiedNavProps) {
  return (
    <nav className="unified-navbar">
      <div className="unified-nav-container">
        <a href="https://nitty.ebl.beauty" className="unified-nav-logo">
          <img src="/solvy-crown-icon.png" alt="SOLVY" className="unified-logo-image" />
          <span className="unified-logo-text">SOLVY</span>
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
          <a href="#remittance">Remittance</a>
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
