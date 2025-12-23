import { useState } from 'react'
import './EBLNav.css'

interface EBLNavProps {
  currentPage?: 'solvy' | 'decidey' | 'ebl' | 'sps' | 'man'
}

function EBLNav({ currentPage = 'ebl' }: EBLNavProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <nav className="ebl-navbar">
      <div className="ebl-nav-container">
        <a href="/" className="ebl-nav-logo">
          <img src="/SolvyLogo-1024.png" alt="SOLVY" className="ebl-logo-image" />
        </a>
        
        <div className="ebl-nav-links">
          <a href="/" className={currentPage === 'solvy' ? 'active' : ''}>
            SOLVY Card
          </a>
          <a href="/decidey" className={currentPage === 'decidey' ? 'active' : ''}>
            DECIDEY NGO
          </a>
          <a href="/ebl" className={currentPage === 'ebl' ? 'active' : ''}>
            Evergreen Beauty Lounge
          </a>
          <a href="/sps" className={currentPage === 'sps' ? 'active' : ''}>
            SPS Joint Venture
          </a>
          <div 
            className={`ebl-nav-dropdown ${dropdownOpen ? 'open' : ''}`}
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
