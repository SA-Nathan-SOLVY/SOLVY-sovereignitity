import UnifiedNav from '../UnifiedNav'
import { WaitlistForm } from '../components/WaitlistForm'
import { Facebook, Youtube, BookOpen, Users, Shield, ArrowUpRight } from 'lucide-react'

function Decidey() {
  return (
    <div className="min-h-screen bg-[#0B172A] text-white">
      <UnifiedNav currentPage="decidey" />
      <div className="pt-20">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold mb-2 bg-gradient-to-br from-purple-400 to-pink-500 bg-clip-text text-transparent">
              DECIDEY NGO
            </h1>
            <p className="text-2xl text-purple-400 italic mb-4">
              /dee-see-day/
            </p>
            <p className="text-xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
              <strong>D</strong>ecentralized <strong>E</strong>mpowerment <strong>C</strong>ontrol <strong>I</strong>dentity <strong>D</strong>ata <strong>E</strong>conomy of <strong>Y</strong>ours
            </p>
          </div>

          {/* Mission Statement */}
          <div className="bg-gradient-to-br from-purple-600/20 to-pink-500/20 rounded-2xl p-12 border-2 border-purple-500/40 mb-16">
            <h2 className="text-3xl font-bold mb-6 text-white flex items-center gap-4">
              <Shield className="w-8 h-8 text-purple-400" />
              Our Mission
            </h2>
            <p className="text-xl text-slate-300 leading-relaxed mb-6">
              Breaking systemic barriers through education and digital rights advocacy. Continuing the legacy of Marcus Garvey, MLK, and Malcolm X in the modern era of economic sovereignty and data ownership.
            </p>
            <p className="text-xl text-slate-300 leading-relaxed">
              DECIDEY NGO empowers communities to achieve true financial independence through cooperative ownership, self-sovereign identity, and control over their digital economy.
            </p>
          </div>

          {/* Three Pillars */}
          <div className="mb-16">
            <h2 className="text-4xl font-bold mb-8 text-center text-white">
              Our Three Pillars
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <BookOpen className="w-12 h-12 text-purple-400" />,
                  title: 'Education',
                  description: 'Teaching financial literacy, cooperative economics, and digital sovereignty to empower communities with knowledge and tools for economic independence.'
                },
                {
                  icon: <Users className="w-12 h-12 text-pink-400" />,
                  title: 'Advocacy',
                  description: 'Fighting for digital rights, data ownership, and economic justice. Amplifying voices of marginalized communities in the Web3 revolution.'
                },
                {
                  icon: <Shield className="w-12 h-12 text-blue-400" />,
                  title: 'Digital Rights',
                  description: 'Protecting self-sovereign identity, ensuring data privacy, and building systems that serve people, not corporations.'
                }
              ].map((pillar, idx) => (
                <div key={idx} className="bg-purple-500/15 rounded-xl p-8 border border-purple-500/30 hover:scale-105 transition-transform duration-300">
                  <div className="mb-4">{pillar.icon}</div>
                  <h3 className="text-2xl font-bold mb-4 text-white">
                    {pillar.title}
                  </h3>
                  <p className="text-lg text-slate-300 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Legacy Section */}
          <div className="bg-green-500/15 rounded-2xl p-12 border-2 border-green-500/30 mb-16">
            <h2 className="text-4xl font-bold mb-8 text-white">
              Continuing the Legacy
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: 'Marcus Garvey',
                  legacy: 'Economic self-sufficiency and cooperative ownership'
                },
                {
                  name: 'Dr. Martin Luther King Jr.',
                  legacy: 'Economic justice and systemic change through collective action'
                },
                {
                  name: 'Malcolm X',
                  legacy: 'Self-determination and building independent economic systems'
                }
              ].map((leader, idx) => (
                <div key={idx} className="p-6 bg-green-500/10 rounded-lg border border-green-500/20">
                  <h3 className="text-2xl font-bold mb-3 text-green-400">
                    {leader.name}
                  </h3>
                  <p className="text-lg text-slate-300 leading-relaxed">
                    {leader.legacy}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Connect Section */}
          <div className="bg-blue-500/15 rounded-2xl p-12 border-2 border-blue-500/30 mb-16">
            <h2 className="text-4xl font-bold mb-8 text-white">
              Connect with SA Nathan
            </h2>
            <div className="flex flex-col gap-6">
              <a 
                href="https://www.facebook.com/sanathan.solvy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-6 bg-blue-500/20 rounded-xl border border-blue-500/40 text-white hover:translate-x-2 hover:bg-blue-500/30 transition-all duration-300 group"
              >
                <Facebook className="w-8 h-8 text-blue-400" />
                <div>
                  <div className="text-xl font-semibold">Facebook</div>
                  <div className="text-base text-slate-300">@sanathan.solvy</div>
                </div>
                <ArrowUpRight className="w-6 h-6 ml-auto text-blue-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </a>

              <div className="p-8 bg-gradient-to-br from-red-500/20 to-red-600/15 rounded-2xl border-2 border-red-500/40">
                <div className="flex items-center gap-4 mb-6">
                  <Youtube className="w-12 h-12 text-red-500" />
                  <div>
                    <div className="text-3xl font-bold text-white">YouTube 2024 Recap</div>
                    <div className="text-lg text-red-300">SA Nathan's Learning Journey</div>
                  </div>
                </div>
                
                <div className="bg-black/30 rounded-xl p-8 mb-6 border border-red-500/30">
                  <h3 className="text-3xl font-bold mb-4 text-yellow-400 text-center">
                    Financial
                  </h3>
                  <p className="text-xl text-slate-200 leading-relaxed text-center mb-8">
                    You've been learning about smart investing and financial strategies to build wealth
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { topic: 'personal finance', gradient: 'from-yellow-400 to-amber-500' },
                      { topic: 'investment strategies', gradient: 'from-blue-500 to-blue-600' },
                      { topic: 'economic trends', gradient: 'from-emerald-500 to-emerald-600' }
                    ].map((item, idx) => (
                      <div key={idx} className={`bg-gradient-to-br ${item.gradient} rounded-lg p-4 text-center font-semibold text-lg text-white shadow-lg`}>
                        {item.topic}
                      </div>
                    ))}
                  </div>
                </div>
                
                <p className="text-base text-slate-300 leading-relaxed text-center italic">
                  This learning journey directly informs DECIDEY NGO's mission to teach financial literacy and economic sovereignty to underserved communities.
                </p>
              </div>
            </div>
          </div>

          {/* Waitlist Section */}
          <div id="waitlist" className="bg-gradient-to-br from-white/5 to-white/2 rounded-2xl p-12 border border-white/10 mb-16">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-4 text-white">
                Join the Movement
              </h2>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                Be the first to know when we launch. Early members get special perks.
              </p>
            </div>
            <WaitlistForm />
          </div>

          {/* Research Resources */}
          <div className="bg-purple-500/15 rounded-2xl p-12 border-2 border-purple-500/30">
            <h2 className="text-4xl font-bold mb-8 text-white">
              Research & Resources
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Cooperative Economics',
                  description: 'Building wealth through collective ownership and mutual aid',
                  topics: ['Worker cooperatives', 'Credit unions', 'Community land trusts']
                },
                {
                  title: 'Self-Sovereign Identity',
                  description: 'Taking control of your digital identity and personal data',
                  topics: ['Decentralized ID', 'Data ownership', 'Privacy rights']
                },
                {
                  title: 'Economic Justice',
                  description: 'Addressing systemic inequality through policy and action',
                  topics: ['Reparations', 'Wealth gap', 'Financial literacy']
                }
              ].map((resource, idx) => (
                <div key={idx} className="p-6 bg-purple-500/10 rounded-xl border border-purple-500/30">
                  <h3 className="text-2xl font-bold mb-3 text-purple-400">
                    {resource.title}
                  </h3>
                  <p className="text-base text-slate-300 mb-4 leading-relaxed">
                    {resource.description}
                  </p>
                  <ul className="space-y-2">
                    {resource.topics.map((topic, tidx) => (
                      <li key={tidx} className="text-sm text-slate-400 pl-6 relative">
                        <span className="absolute left-0 text-green-400">✓</span>
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Decidey
