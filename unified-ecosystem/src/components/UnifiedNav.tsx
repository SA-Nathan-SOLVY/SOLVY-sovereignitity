import './UnifiedNav.css'

interface UnifiedNavProps {
  currentPage?: 'nitty' | 'decidey' | 'ebl' | 'remittance' | 'admin'
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
