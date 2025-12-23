import './EBLNav.css'

function EBLNav() {
  return (
    <nav className="ebl-navbar">
      <div className="ebl-nav-container">
        <a href="/" className="ebl-nav-logo">
          <img src="/SolvyLogo-1024.png" alt="SOLVY" className="ebl-logo-image" />
        </a>
        
        <div className="ebl-nav-links">
          <a href="/#card">SOLVY Card</a>
          <a href="/" className="active">Evergreen Beauty Lounge</a>
          <a href="#sps-joint-venture">SPS Joint Venture</a>
          <div className="ebl-nav-dropdown">
            <a href="#man" className="dropdown-toggle">MAN ▼</a>
            <div className="dropdown-menu">
              <a href="#communications">Communications Center</a>
              <a href="#email-center">Email Center</a>
            </div>
          </div>
          <a href="https://sites.google.com/view/uplift-ascend-partnership-ebl/home" target="_blank" rel="noopener noreferrer">
            Local Community Projects
          </a>
        </div>
        
        <div className="ebl-nav-cta">
          <a href="#pay" className="ebl-btn-primary">
            Pay Now
          </a>
        </div>
      </div>
    </nav>
  )
}

export default EBLNav
