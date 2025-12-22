import { useState } from 'react';
import UnifiedNav from '../UnifiedNav';
import { MessageSquare, Bell, Shield, ArrowRight, CheckCircle } from 'lucide-react';

export default function CommunicationsCenter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      // In a real implementation, this would call an API
      setTimeout(() => setSubscribed(false), 3000);
      setEmail('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-purple-500/30">
      <UnifiedNav />
      
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/95 to-slate-900"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium mb-8 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            MAN Ecosystem Communications
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-blue-200">
            Communications Center
          </h1>
          
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            The central hub for all official updates, transparency reports, and community announcements from the Mutual Aid Network.
          </p>

          {/* Newsletter Signup */}
          <div className="max-w-md mx-auto bg-slate-800/50 backdrop-blur-sm p-2 rounded-2xl border border-slate-700 shadow-2xl">
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 bg-transparent border-none text-white placeholder-slate-500 focus:ring-0 px-4 py-3"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2"
              >
                {subscribed ? <CheckCircle className="w-5 h-5" /> : 'Subscribe'}
              </button>
            </form>
          </div>
          {subscribed && (
            <p className="text-green-400 mt-4 text-sm font-medium animate-fade-in">
              Successfully subscribed to updates!
            </p>
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-800/50 transition-all group">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Official Updates</h3>
            <p className="text-slate-400 mb-6">
              Verified announcements regarding platform governance, security protocols, and operational changes.
            </p>
            <a href="#" className="text-blue-400 font-medium flex items-center gap-1 hover:gap-2 transition-all">
              View Archive <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Feature 2 */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-800/50 transition-all group">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Community Digest</h3>
            <p className="text-slate-400 mb-6">
              Weekly highlights from our local community projects, success stories, and impact reports.
            </p>
            <a href="#" className="text-purple-400 font-medium flex items-center gap-1 hover:gap-2 transition-all">
              Read Latest <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Feature 3 */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-800/50 transition-all group">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Bell className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">System Alerts</h3>
            <p className="text-slate-400 mb-6">
              Real-time notifications about system maintenance, feature rollouts, and service status.
            </p>
            <a href="#" className="text-emerald-400 font-medium flex items-center gap-1 hover:gap-2 transition-all">
              Check Status <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Recent Communications Section */}
      <div className="bg-slate-800/20 py-20 border-y border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-10 text-center">Recent Communications</h2>
          
          <div className="space-y-4">
            {[
              { date: 'Dec 20, 2025', title: 'Q4 Transparency Report Released', category: 'Governance', color: 'blue' },
              { date: 'Dec 15, 2025', title: 'New Local Community Project: Urban Gardens', category: 'Community', color: 'green' },
              { date: 'Dec 10, 2025', title: 'Platform Update: Enhanced Security Features', category: 'Product', color: 'purple' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-6 p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-all cursor-pointer group">
                <div className="text-slate-500 text-sm font-mono whitespace-nowrap">{item.date}</div>
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-slate-200 group-hover:text-white transition-colors">{item.title}</h4>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${item.color}-500/10 text-${item.color}-400 border border-${item.color}-500/20`}>
                  {item.category}
                </span>
                <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Simple */}
      <footer className="py-12 text-center text-slate-500 text-sm">
        <p>© 2025 SOLVY. All rights reserved.</p>
      </footer>
    </div>
  );
}
