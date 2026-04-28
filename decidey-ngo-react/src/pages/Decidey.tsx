import UnifiedNav from '../UnifiedNav'

function Decidey() {
  return (
    <div className="app">
      <UnifiedNav currentPage="decidey" />
      <div style={{ 
        minHeight: '100vh', 
        background: '#1a2332',
        color: 'white',
        paddingTop: '80px'
      }}>
        <div className="container mx-auto px-4 py-12" style={{ maxWidth: '1200px' }}>
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 style={{ 
              fontSize: '4rem', 
              fontWeight: 'bold', 
              marginBottom: '0.5rem',
              background: 'linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              DECIDEY NGO
            </h1>
            <p style={{ 
              fontSize: '1.5rem', 
              color: '#a78bfa',
              fontStyle: 'italic',
              marginBottom: '1rem'
            }}>
              /dee-see-day/
            </p>
            <p style={{ 
              fontSize: '1.25rem', 
              color: '#cbd5e1',
              maxWidth: '900px',
              margin: '0 auto',
              lineHeight: '1.8'
            }}>
              <strong>D</strong>ecentralized <strong>E</strong>mpowerment <strong>C</strong>ontrol <strong>I</strong>dentity <strong>D</strong>ata <strong>E</strong>conomy of <strong>Y</strong>ours
            </p>
          </div>

          {/* Mission Statement */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)',
              borderRadius: '16px',
              padding: '3rem',
              border: '2px solid rgba(139, 92, 246, 0.4)',
              marginBottom: '4rem'
            }}
          >
              <h2 style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold', 
              marginBottom: '1.5rem',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <span style={{ fontSize: '32px' }}>🛡️</span>
              Our Mission
            </h2>
            <p style={{ 
              fontSize: '1.25rem', 
              color: '#cbd5e1',
              lineHeight: '1.8',
              marginBottom: '1.5rem'
            }}>
              Breaking systemic barriers through education and digital rights advocacy. Continuing the legacy of Marcus Garvey, MLK, and Malcolm X in the modern era of economic sovereignty and data ownership.
            </p>
            <p style={{ 
              fontSize: '1.25rem', 
              color: '#cbd5e1',
              lineHeight: '1.8'
            }}>
              DECIDEY NGO empowers communities to achieve true financial independence through cooperative ownership, self-sovereign identity, and control over their digital economy.
            </p>
          </div>

          {/* Three Pillars */}
          <div
            style={{ marginBottom: '4rem' }}
          >
            <h2 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 'bold', 
              marginBottom: '2rem',
              textAlign: 'center',
              color: 'white'
            }}>
              Our Three Pillars
            </h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '2rem' 
            }}>
                {[
                {
                  icon: '📚',
                  title: 'Education',
                  description: 'Teaching financial literacy, cooperative economics, and digital sovereignty to empower communities with knowledge and tools for economic independence.'
                },
                {
                  icon: '👥',
                  title: 'Advocacy',
                  description: 'Fighting for digital rights, data ownership, and economic justice. Amplifying voices of marginalized communities in the Web3 revolution.'
                },
                {
                  icon: '🛡️',
                  title: 'Digital Rights',
                  description: 'Protecting self-sovereign identity, ensuring data privacy, and building systems that serve people, not corporations.'
                }
              ].map((pillar, idx) => (
                <div key={idx} style={{
                  background: 'rgba(139, 92, 246, 0.15)',
                  borderRadius: '12px',
                  padding: '2rem',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  transition: 'transform 0.3s ease'
                }}>
                  <div style={{ 
                    fontSize: '48px',
                    marginBottom: '1rem' 
                  }}>{pillar.icon}</div>
                  <h3 style={{ 
                    fontSize: '1.75rem', 
                    fontWeight: 'bold', 
                    marginBottom: '1rem',
                    color: 'white'
                  }}>
                    {pillar.title}
                  </h3>
                  <p style={{ 
                    fontSize: '1.1rem', 
                    color: '#cbd5e1',
                    lineHeight: '1.6'
                  }}>
                    {pillar.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Legacy Section */}
          <div
            style={{
              background: 'rgba(34, 197, 94, 0.15)',
              borderRadius: '16px',
              padding: '3rem',
              border: '2px solid rgba(34, 197, 94, 0.3)',
              marginBottom: '4rem'
            }}
          >
            <h2 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 'bold', 
              marginBottom: '2rem',
              color: 'white'
            }}>
              Continuing the Legacy
            </h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '2rem' 
            }}>
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
                <div key={idx} style={{
                  padding: '1.5rem',
                  background: 'rgba(34, 197, 94, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(34, 197, 94, 0.2)'
                }}>
                  <h3 style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold', 
                    marginBottom: '0.75rem',
                    color: '#4ade80'
                  }}>
                    {leader.name}
                  </h3>
                  <p style={{ 
                    fontSize: '1.1rem', 
                    color: '#cbd5e1',
                    lineHeight: '1.6'
                  }}>
                    {leader.legacy}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Connect Section */}
          <div
            style={{
              background: 'rgba(59, 130, 246, 0.15)',
              borderRadius: '16px',
              padding: '3rem',
              border: '2px solid rgba(59, 130, 246, 0.3)',
              marginBottom: '4rem'
            }}
          >
            <h2 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 'bold', 
              marginBottom: '2rem',
              color: 'white'
            }}>
              Connect with SA Nathan
            </h2>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: '1.5rem' 
            }}>
              <a 
                href="https://www.facebook.com/sanathan.solvy" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1.5rem',
                  background: 'rgba(59, 130, 246, 0.2)',
                  borderRadius: '12px',
                  border: '1px solid rgba(59, 130, 246, 0.4)',
                  textDecoration: 'none',
                  color: 'white',
                  transition: 'transform 0.3s ease, background 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateX(10px)'
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.3)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)'
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'
                }}
              >
                <span style={{ fontSize: '32px' }}>📘</span>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>Facebook</div>
                  <div style={{ fontSize: '1rem', color: '#cbd5e1' }}>@sanathan.solvy</div>
                </div>
                <span style={{ fontSize: '20px', marginLeft: 'auto' }}>↗</span>
              </a>

              <div style={{
                padding: '2rem',
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.15) 100%)',
                borderRadius: '16px',
                border: '2px solid rgba(239, 68, 68, 0.4)'
              }}>
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  <span style={{ fontSize: '48px' }}>📺</span>
                  <div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>YouTube 2024 Recap</div>
                    <div style={{ fontSize: '1.1rem', color: '#fca5a5' }}>SA Nathan's Learning Journey</div>
                  </div>
                </div>
                
                <div style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '12px',
                  padding: '2rem',
                  marginBottom: '1.5rem',
                  border: '1px solid rgba(239, 68, 68, 0.3)'
                }}>
                  <h3 style={{ 
                    fontSize: '2rem', 
                    fontWeight: 'bold', 
                    marginBottom: '1rem',
                    color: '#fbbf24',
                    textAlign: 'center'
                  }}>
                    Financial
                  </h3>
                  <p style={{ 
                    fontSize: '1.25rem', 
                    color: '#e5e7eb',
                    lineHeight: '1.8',
                    textAlign: 'center',
                    marginBottom: '2rem'
                  }}>
                    You've been learning about smart investing and financial strategies to build wealth
                  </p>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem'
                  }}>
                    {[
                      { topic: 'personal finance', gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' },
                      { topic: 'investment strategies', gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' },
                      { topic: 'economic trends', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }
                    ].map((item, idx) => (
                      <div key={idx} style={{
                        background: item.gradient,
                        borderRadius: '8px',
                        padding: '1rem',
                        textAlign: 'center',
                        fontWeight: '600',
                        fontSize: '1.1rem',
                        color: 'white',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
                      }}>
                        {item.topic}
                      </div>
                    ))}
                  </div>
                </div>
                
                <p style={{ 
                  fontSize: '1rem', 
                  color: '#cbd5e1',
                  lineHeight: '1.6',
                  textAlign: 'center',
                  fontStyle: 'italic'
                }}>
                  This learning journey directly informs DECIDEY NGO's mission to teach financial literacy and economic sovereignty to underserved communities.
                </p>
              </div>
            </div>
          </div>

          {/* Research Resources */}
          <div
            style={{
              background: 'rgba(168, 85, 247, 0.15)',
              borderRadius: '16px',
              padding: '3rem',
              border: '2px solid rgba(168, 85, 247, 0.3)'
            }}
          >
            <h2 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 'bold', 
              marginBottom: '2rem',
              color: 'white'
            }}>
              Research & Resources
            </h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '1.5rem' 
            }}>
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
                <div key={idx} style={{
                  padding: '1.5rem',
                  background: 'rgba(168, 85, 247, 0.1)',
                  borderRadius: '12px',
                  border: '1px solid rgba(168, 85, 247, 0.3)'
                }}>
                  <h3 style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold', 
                    marginBottom: '0.75rem',
                    color: '#a78bfa'
                  }}>
                    {resource.title}
                  </h3>
                  <p style={{ 
                    fontSize: '1rem', 
                    color: '#cbd5e1',
                    marginBottom: '1rem',
                    lineHeight: '1.6'
                  }}>
                    {resource.description}
                  </p>
                  <ul style={{ 
                    listStyle: 'none', 
                    padding: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}>
                    {resource.topics.map((topic, tidx) => (
                      <li key={tidx} style={{ 
                        fontSize: '0.95rem',
                        color: '#94a3b8',
                        paddingLeft: '1.5rem',
                        position: 'relative'
                      }}>
                        <span style={{
                          position: 'absolute',
                          left: 0,
                          color: '#4ade80'
                        }}>✓</span>
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
