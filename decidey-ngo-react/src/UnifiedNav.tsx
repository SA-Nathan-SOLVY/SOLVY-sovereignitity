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
            Evergreen Beauty Lounge
          </a>
          <a href="#sovereignitity">SOVEREIGNITITY™</a>
          <a href="https://remittance.ebl.beauty">Remittance</a>
          <a href="https://decidey.ebl.beauty/sps-upload">SPS Upload</a>
          <a href="https://decidey.ebl.beauty/man.html">MAN</a>
          <a href="https://sites.google.com/view/uplift-ascend-partnership-ebl/home" target="_blank" style={{ color: '#fbbf24', fontWeight: 600 }}>Uplift Ascend</a>
        </div>
        
        <div className="unified-nav-cta">
          <a href="https://nitty.ebl.beauty/signup.html" className="unified-btn-primary">
            Get Your Card
          </a>
        </div>
      </div>
    </nav>
  )
}

export default UnifiedNav
