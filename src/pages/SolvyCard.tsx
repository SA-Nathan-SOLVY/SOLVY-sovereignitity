import { useState, useEffect } from 'react';
import { Users, Smartphone, Gem, Crown, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import UnifiedNav from '../UnifiedNav';
import Footer from '../components/Footer';

export default function SolvyCard() {
  const [currentCard, setCurrentCard] = useState(0);
  
  const cards = [
    {
      type: "BUSINESS",
      color: "from-blue-600 to-purple-600",
      number: "•••• 4289",
      holder: "YOUR BUSINESS",
      bgPattern: "cubes"
    },
    {
      type: "PERSONAL",
      color: "from-emerald-500 to-teal-700",
      number: "•••• 1092",
      holder: "JOHN DOE",
      bgPattern: "hexagons"
    },
    {
      type: "FOUNDATION",
      color: "from-amber-500 to-orange-700",
      number: "•••• 8831",
      holder: "FAMILY TRUST",
      bgPattern: "circles"
    },
    {
      type: "ACCESS",
      color: "from-slate-700 to-slate-900",
      number: "•••• 5520",
      holder: "MEMBER ACCESS",
      bgPattern: "lines"
    }
  ];

  const nextCard = () => setCurrentCard((prev) => (prev + 1) % cards.length);
  const prevCard = () => setCurrentCard((prev) => (prev - 1 + cards.length) % cards.length);

  // Auto-rotate cards
  useEffect(() => {
    const timer = setInterval(nextCard, 5000);
    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: <Crown size={24} />,
      title: "Digital Sovereignty",
      desc: "Your gateway to data autonomy and income potential."
    },
    {
      icon: <Smartphone size={24} />,
      title: "NFC Enabled",
      desc: "Contactless payments with complete privacy protection."
    },
    {
      icon: <Users size={24} />,
      title: "Cooperative Owned",
      desc: "Member-owned. Share in the platform's success."
    },
    {
      icon: <Gem size={24} />,
      title: "Data Value",
      desc: "Your data, your value, your control in the economy."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B172A] font-sans text-white flex flex-col">
      <UnifiedNav currentPage="nitty" />
      
      {/* Hero Section */}
      <div className="relative py-12 md:py-20 px-4 overflow-hidden flex-grow flex items-center">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 md:gap-20 items-center relative z-10 w-full">
          
          {/* Left Column: Text Content */}
          <div className="text-center md:text-left order-2 md:order-1">
            {/* S Crest Logo */}
            <div className="mb-6 flex justify-center md:justify-start items-center gap-3">
               <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-900 rounded-full flex items-center justify-center shadow-lg border border-blue-400/30">
                  <span className="font-serif text-2xl font-bold text-white">S</span>
               </div>
               <span className="text-blue-200 font-medium tracking-wider text-xs md:text-sm uppercase border border-blue-500/20 px-3 py-1 rounded-full bg-blue-900/20">America's First P2P Platform</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              SOLVY <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Card</span>
            </h1>
            
            <p className="text-base md:text-lg text-slate-300 max-w-lg mb-8 leading-relaxed mx-auto md:mx-0">
              Created by SA Nathan. We deliver data sovereignty and economic autonomy through cooperative ownership, breaking free from systems of economic entrapment.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 text-sm md:text-base hover:-translate-y-0.5">
                Get Your Card
              </button>
              <a href="/sps-presentation" className="flex items-center justify-center gap-2 text-slate-300 hover:text-white px-8 py-3 rounded-lg font-medium transition-colors text-sm md:text-base border border-slate-700 hover:bg-white/5 group">
                View Joint Venture <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

          {/* Right Column: Card Carousel */}
          <div className="relative perspective-1000 group order-1 md:order-2 flex justify-center items-center py-8">
            
            {/* Carousel Controls */}
            <button 
              onClick={prevCard}
              className="absolute left-0 md:-left-4 z-20 p-2 bg-white/5 hover:bg-white/10 rounded-full backdrop-blur-sm border border-white/10 text-white/70 hover:text-white transition-all"
            >
              <ChevronLeft size={24} />
            </button>
            
            <button 
              onClick={nextCard}
              className="absolute right-0 md:-right-4 z-20 p-2 bg-white/5 hover:bg-white/10 rounded-full backdrop-blur-sm border border-white/10 text-white/70 hover:text-white transition-all"
            >
              <ChevronRight size={24} />
            </button>

            {/* The Card Container */}
            <div className="relative w-full max-w-[340px] transform transition-all duration-500 hover:scale-105">
              {/* Card Glow */}
              <div className={`absolute -inset-4 bg-gradient-to-r ${cards[currentCard].color} rounded-[2rem] blur-2xl opacity-30 transition-all duration-500`}></div>
              
              {/* The Card Itself */}
              <div className={`relative bg-gradient-to-br ${cards[currentCard].color} rounded-2xl p-6 shadow-2xl border border-white/20 aspect-[1.586/1] flex flex-col justify-between overflow-hidden transition-all duration-500`}>
                
                {/* Texture Overlay */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-bl-full blur-2xl"></div>
                
                {/* Card Header */}
                <div className="flex justify-between items-start relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded flex items-center justify-center font-bold text-white text-sm font-serif border border-white/30 shadow-inner">S</div>
                    <span className="font-bold tracking-widest text-white text-sm drop-shadow-md">SOLVY</span>
                  </div>
                  <div className="text-white/90 font-mono text-[10px] tracking-[0.2em] border border-white/30 px-2 py-0.5 rounded bg-black/10 backdrop-blur-sm">
                    {cards[currentCard].type}
                  </div>
                </div>

                {/* Card Body */}
                <div className="relative z-10 mt-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-7 bg-gradient-to-br from-yellow-200 to-yellow-500 rounded shadow-inner border border-yellow-600/30"></div>
                    <div className="text-white text-lg font-mono tracking-widest drop-shadow-md">{cards[currentCard].number}</div>
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-[8px] text-white/60 uppercase tracking-wider mb-0.5">Cardholder</div>
                      <div className="text-white text-xs font-bold tracking-wide drop-shadow-sm">{cards[currentCard].holder}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[8px] text-white/60 uppercase tracking-wider mb-0.5">Valid Thru</div>
                      <div className="text-white text-xs font-bold tracking-wide drop-shadow-sm">12/28</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Reflection */}
              <div className="absolute -bottom-8 left-4 right-4 h-4 bg-black/20 blur-xl rounded-full"></div>
            </div>

            {/* Pagination Dots */}
            <div className="absolute -bottom-12 flex gap-2">
              {cards.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentCard(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentCard ? 'w-6 bg-blue-500' : 'w-1.5 bg-slate-600 hover:bg-slate-500'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-16 px-4 bg-[#0f172a] border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-[#1e293b]/50 p-6 rounded-xl border border-slate-700 hover:border-blue-500/30 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-900/10 group">
                <div className="w-12 h-12 bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform border border-blue-500/20">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
