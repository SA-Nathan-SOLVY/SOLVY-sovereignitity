import { useState } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';

interface UnifiedNavProps {
  currentPage?: 'nitty' | 'decidey' | 'ebl' | 'home' | 'contact';
}

export default function UnifiedNav({ currentPage = 'nitty' }: UnifiedNavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isManOpen, setIsManOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Simplified Navigation for MVP
  const navLinks = [
    { href: '/solvy-card', label: 'SOLVY Card', active: window.location.pathname === '/solvy-card' },
    { href: '/sps-presentation', label: 'SPS Joint Venture', active: window.location.pathname === '/sps-presentation' },
    { href: 'https://ebl.beauty', label: 'EBL Pilot', active: currentPage === 'ebl' },
    // MAN Dropdown Logic Handled Separately in Render
    { href: 'https://sites.google.com/view/uplift-ascend-partnership-ebl/home', label: 'Local Community Projects', active: false, style: { color: '#fbbf24' } },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-slate-900/95 backdrop-blur-md border-b border-purple-500/30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <a href="https://nitty.ebl.beauty" className="flex-shrink-0 transition-transform hover:scale-105">
            <img src="/fulllogo.png" alt="SOLVY" className="h-10 w-auto" />
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`text-sm font-medium transition-colors px-3 py-2 rounded-md relative group ${
                  link.active 
                    ? 'text-purple-400 bg-purple-500/10' 
                    : 'text-slate-200 hover:text-purple-400 hover:bg-purple-500/10'
                }`}
                style={link.style}
              >
                {link.label}
                {link.active && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></span>
                )}
              </a>
            ))}

            {/* MAN Dropdown */}
            <div className="relative group">
              <button 
                className="flex items-center gap-1 text-slate-200 hover:text-purple-400 transition-colors font-medium text-sm px-3 py-2 rounded-md hover:bg-purple-500/10 focus:outline-none"
                onClick={() => setIsManOpen(!isManOpen)}
                onMouseEnter={() => setIsManOpen(true)}
                onMouseLeave={() => setIsManOpen(false)}
              >
                MAN
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {/* Dropdown Menu */}
              <div 
                className={`absolute top-full left-0 mt-2 w-56 bg-slate-900 border border-purple-500/30 rounded-lg shadow-xl overflow-hidden transition-all duration-200 transform origin-top-left ${
                  isManOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                }`}
                onMouseEnter={() => setIsManOpen(true)}
                onMouseLeave={() => setIsManOpen(false)}
              >
                <div className="py-2">
                  <a href="https://decidey.ebl.beauty/man.html" className="block px-4 py-3 text-sm text-slate-300 hover:bg-purple-500/20 hover:text-white transition-colors">
                    Transparency Report
                  </a>
                  <a href="/communications" className="block px-4 py-3 text-sm text-slate-300 hover:bg-purple-500/20 hover:text-white transition-colors">
                    Communications Center
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Button (Desktop) */}
          <div className="hidden lg:block">
            <a 
              href="https://nitty.ebl.beauty/signup.html" 
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all hover:-translate-y-0.5"
            >
              Get Your Card
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-slate-200 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-20 left-0 w-full bg-slate-900/98 border-b border-slate-800 shadow-xl animate-in slide-in-from-top-5">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`block px-4 py-3 rounded-lg text-base font-medium ${
                  link.active 
                    ? 'text-purple-400 bg-purple-500/10' 
                    : 'text-slate-200 hover:text-white hover:bg-slate-800'
                }`}
                style={link.style}
              >
                {link.label}
              </a>
            ))}
            
            {/* MAN Mobile Dropdown Items */}
            <div className="space-y-1 pt-2 border-t border-slate-800/50">
              <div className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">MAN Ecosystem</div>
              <a href="https://decidey.ebl.beauty/man.html" className="block px-4 py-3 rounded-lg text-base font-medium text-slate-200 hover:text-white hover:bg-slate-800">
                Transparency Report
              </a>
              <a href="/communications" className="block px-4 py-3 rounded-lg text-base font-medium text-slate-200 hover:text-white hover:bg-slate-800">
                Communications Center
              </a>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800">
              <a 
                href="https://nitty.ebl.beauty/signup.html" 
                className="block w-full text-center bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-bold"
              >
                Get Your Card
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
