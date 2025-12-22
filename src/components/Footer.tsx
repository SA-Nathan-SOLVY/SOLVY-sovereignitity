

export default function Footer() {
  return (
    <footer className="bg-[#0B172A] text-white py-12 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src="/solvy-logo.png" alt="SOLVY" className="h-8" />
              <span className="text-xl font-bold tracking-wider">SOLVY</span>
            </div>
            <p className="text-slate-400 max-w-sm">
              America's First P2P Payment Platform. Empowering financial sovereignty through cooperative ownership and decentralized technology.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4 text-[#fbbf24]">Ecosystem</h3>
            <ul className="space-y-2 text-slate-400">
              <li><a href="https://nitty.ebl.beauty" className="hover:text-white transition-colors">SOLVY Card</a></li>
              <li><a href="https://decidey.ebl.beauty" className="hover:text-white transition-colors">DECIDEY NGO</a></li>
              <li><a href="https://ebl.beauty" className="hover:text-white transition-colors">EBL Pilot</a></li>
              <li><a href="https://remittance.ebl.beauty" className="hover:text-white transition-colors">Global Remittance</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4 text-[#fbbf24]">Legal</h3>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Compliance</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-slate-500 text-sm">
            © {new Date().getFullYear()} SOLVY. All rights reserved. SOVEREIGNITITY™
          </div>
          <div className="flex items-center gap-6">
            <img src="/E-dotlogocopy.png" alt="EBL" className="h-8 opacity-50 hover:opacity-100 transition-opacity" />
            <img src="/SolvyLogo-1024.png" alt="SOLVY Crown" className="h-8 opacity-50 hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </footer>
  );
}
