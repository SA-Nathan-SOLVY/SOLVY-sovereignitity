import React, { useState } from 'react';
import { Upload, FileSpreadsheet, Database, TrendingUp, ShieldCheck, Users, Truck, ChevronRight, ChevronLeft, CheckCircle, ArrowRight } from 'lucide-react';
import UnifiedNav from '../UnifiedNav';
import Footer from '../components/Footer';

export default function SPSPresentation() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success'>('idle');
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setUploadStatus('uploading');
    setTimeout(() => setUploadStatus('success'), 2000);
  };

  const slides = [
    {
      title: "1. The Purchase",
      desc: "Customer purchases supplies using the SOLVY Card.",
      icon: <Users size={32} className="text-blue-400" />
    },
    {
      title: "2. Data Capture",
      desc: "Transaction data is instantly captured for tracking.",
      icon: <Database size={32} className="text-purple-400" />
    },
    {
      title: "3. Inventory Sync",
      desc: "SPS inventory updates in real-time.",
      icon: <FileSpreadsheet size={32} className="text-green-400" />
    },
    {
      title: "4. Supplier Reorder",
      desc: "Low stock triggers automated reorder manifests.",
      icon: <Truck size={32} className="text-orange-400" />
    }
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="min-h-screen bg-[#0B172A] font-sans text-white flex flex-col">
      <UnifiedNav />
      
      {/* Hero Section - Compact & Cohesive */}
      <div className="relative py-16 px-4 overflow-hidden flex-grow flex items-center">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* S Crest Logo - Smaller */}
          <div className="mb-6 flex justify-center">
             <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-900 rounded-full flex items-center justify-center shadow-lg border border-blue-400/30">
                <span className="font-serif text-2xl font-bold text-white">S</span>
             </div>
          </div>

          <div className="inline-block px-3 py-1 bg-blue-900/30 rounded-full text-blue-200 text-xs font-medium mb-6 border border-blue-800/50">
            SPS x SOLVY Joint Venture
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Complete Financial <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Ecosystem</span>
          </h1>
          <p className="text-base text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
            Supporting small businesses and family foundations - the heartbeat of the American economy. A unified system connecting Customer Purchases, SPS Inventory, and Supplier Reordering.
          </p>
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-[#fbbf24] text-[#0B172A] px-8 py-3 rounded-lg font-bold hover:bg-yellow-400 transition-all shadow-lg text-sm flex items-center gap-2"
            >
              See the Demo <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Process Slideshow - Compact */}
      <div className="py-12 px-4 bg-[#0f172a] border-t border-slate-800">
        <div className="max-w-3xl mx-auto">
          <div className="relative bg-[#1e293b]/50 rounded-2xl p-8 shadow-lg border border-slate-700 min-h-[280px] flex flex-col items-center justify-center text-center">
            <div className="mb-6 bg-[#0B172A] p-4 rounded-xl shadow-md border border-slate-700">
              {slides[currentSlide].icon}
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">{slides[currentSlide].title}</h3>
            <p className="text-base text-slate-300 max-w-md">{slides[currentSlide].desc}</p>

            <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white">
              <ChevronLeft size={24} />
            </button>
            <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white">
              <ChevronRight size={24} />
            </button>

            <div className="absolute bottom-6 flex gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${idx === currentSlide ? 'bg-blue-500 w-6' : 'bg-slate-600'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Demo Section - Compact */}
      <div id="demo" className="py-16 px-4 bg-[#0B172A] border-t border-slate-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white mb-2">Live Integration Demo</h2>
            <p className="text-slate-400 text-sm">Experience the power of Reverse Inventory</p>
          </div>

          <div className="grid md:grid-cols-1 gap-8 max-w-3xl mx-auto">
            <div className="bg-[#1e293b] p-8 rounded-2xl shadow-xl border border-slate-700">
              {uploadStatus !== 'success' ? (
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => {
                    setUploadStatus('uploading');
                    setTimeout(() => setUploadStatus('success'), 2000);
                  }}
                  className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer group
                    ${isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 hover:border-blue-400 hover:bg-slate-800'}
                  `}
                >
                  {uploadStatus === 'idle' && (
                    <>
                      <div className="bg-blue-900/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-400 border border-blue-500/30">
                        <Upload size={24} />
                      </div>
                      <p className="text-lg font-bold text-white mb-1">Upload Manifest</p>
                      <p className="text-xs text-slate-400">Drag & Drop .CSV or click</p>
                    </>
                  )}
                  
                  {uploadStatus === 'uploading' && (
                    <div className="py-4">
                      <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p className="text-blue-400 font-bold text-sm">Processing...</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-6 text-center animate-fade-in">
                  <div className="flex items-center justify-center gap-2 text-green-400 font-bold mb-2 text-lg">
                    <CheckCircle size={20} />
                    <span>Complete</span>
                  </div>
                  <p className="text-green-200/80 text-sm">Data distributed to all systems.</p>
                  <button onClick={() => setUploadStatus('idle')} className="mt-4 text-xs text-slate-400 hover:text-white underline">Reset</button>
                </div>
              )}
            </div>
          </div>

          {/* Results View */}
          {uploadStatus === 'success' && (
            <div className="mt-8 grid md:grid-cols-2 gap-6 animate-fade-in-up">
              <div className="bg-[#1e293b] rounded-xl shadow-lg overflow-hidden border border-slate-700">
                <div className="bg-blue-900/50 p-4 text-white flex justify-between items-center border-b border-blue-800/50">
                  <h3 className="font-bold flex items-center gap-2 text-sm"><TrendingUp size={16} /> Tax Report</h3>
                  <span className="text-[10px] bg-blue-500/20 px-2 py-0.5 rounded text-blue-200">Client View</span>
                </div>
                <div className="p-4">
                  <table className="w-full text-xs text-left text-slate-300">
                    <thead className="text-slate-500 uppercase bg-[#0f172a]">
                      <tr><th className="px-2 py-2">Item</th><th className="px-2 py-2 text-right">Amount</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      <tr><td className="px-2 py-2">Salon Chair</td><td className="px-2 py-2 text-right">$450.00</td></tr>
                      <tr><td className="px-2 py-2">Shampoo</td><td className="px-2 py-2 text-right">$120.00</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-[#1e293b] rounded-xl shadow-lg overflow-hidden border border-slate-700">
                <div className="bg-slate-800 p-4 text-white flex justify-between items-center border-b border-slate-700">
                  <h3 className="font-bold flex items-center gap-2 text-sm"><ShieldCheck size={16} /> Inventory</h3>
                  <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-300">Internal</span>
                </div>
                <div className="p-4">
                  <table className="w-full text-xs text-left text-slate-300">
                    <thead className="text-slate-500 uppercase bg-[#0f172a]">
                      <tr><th className="px-2 py-2">SKU</th><th className="px-2 py-2">Status</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      <tr><td className="px-2 py-2">CH-001</td><td className="px-2 py-2 text-red-400 font-bold">Reorder Sent</td></tr>
                      <tr><td className="px-2 py-2">SH-500</td><td className="px-2 py-2 text-green-400">Healthy</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
