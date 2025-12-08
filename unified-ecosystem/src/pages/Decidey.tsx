import UnifiedNav from '../components/UnifiedNav'
import './Decidey.css'

function Decidey() {
  return (
    <div className="decidey-page">
      <UnifiedNav currentPage="decidey" />

      {/* Hero */}
      <section className="decidey-hero">
        <div className="container">
          <h1>DECIDEY NGO</h1>
          <p className="hero-subtitle">Education • Advocacy • Digital Rights • Economic Justice</p>
        </div>
      </section>

      {/* Mission */}
      <section className="mission-section">
        <div className="container">
          <h2>Our Mission</h2>
          <p className="mission-statement">
            Breaking systemic barriers through education and digital rights advocacy. 
            Continuing the legacy of Marcus Garvey, MLK, and Malcolm X in the modern era of data sovereignty and economic autonomy.
          </p>
        </div>
      </section>

      {/* What We Do */}
      <section className="programs-section">
        <div className="container">
          <h2>What We Do</h2>
          
          <div className="programs-grid">
            <div className="program-card">
              <div className="program-icon">📚</div>
              <h3>Digital Rights Education</h3>
              <p>
                Teaching communities about data sovereignty, digital privacy, and the importance of controlling your own information in the Web3 era.
              </p>
            </div>

            <div className="program-card">
              <div className="program-icon">💡</div>
              <h3>Financial Literacy</h3>
              <p>
                Empowering members with knowledge about cooperative economics, wealth-building strategies, and breaking free from predatory financial systems.
              </p>
            </div>

            <div className="program-card">
              <div className="program-icon">🤝</div>
              <h3>Community Organizing</h3>
              <p>
                Building networks of economically empowered individuals who understand the power of collective ownership and cooperative wealth.
              </p>
            </div>

            <div className="program-card">
              <div className="program-icon">⚖️</div>
              <h3>Policy Advocacy</h3>
              <p>
                Advocating for policies that protect data rights, promote economic justice, and support community-owned financial infrastructure.
              </p>
            </div>

            <div className="program-card">
              <div className="program-icon">🎓</div>
              <h3>Member Onboarding</h3>
              <p>
                Comprehensive training for new SOLVY Card members on using the platform, understanding cooperative ownership, and maximizing benefits.
              </p>
            </div>

            <div className="program-card">
              <div className="program-icon">🌍</div>
              <h3>Global Solidarity</h3>
              <p>
                Connecting diaspora communities worldwide, fostering international cooperation, and building a global network of economic sovereignty.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="philosophy-section">
        <div className="container">
          <h2>Our Philosophy</h2>
          
          <div className="philosophy-content">
            <div className="philosophy-item">
              <h3>Self-Determination</h3>
              <p>
                We believe in the fundamental right of all people to control their own economic destiny. 
                No one should be trapped in systems designed to extract wealth from their communities.
              </p>
            </div>

            <div className="philosophy-item">
              <h3>Cooperative Economics</h3>
              <p>
                Following the principles of Marcus Garvey and Dr. King's Poor People's Campaign, we advocate for economic systems 
                that serve the community, not exploit it.
              </p>
            </div>

            <div className="philosophy-item">
              <h3>Data as Labor</h3>
              <p>
                Your data generates value. In the Web3 economy, we recognize data as the new commodity and ensure members 
                retain ownership and benefit from their digital labor.
              </p>
            </div>

            <div className="philosophy-item">
              <h3>Education as Liberation</h3>
              <p>
                Knowledge is power. We provide the education necessary for communities to understand and navigate 
                the digital economy on their own terms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Get Involved */}
      <section className="cta-section">
        <div className="container">
          <h2>Join the Movement</h2>
          <p>
            DECIDEY NGO is more than education - it's a movement for economic justice and digital sovereignty. 
            Get your SOLVY Card and become part of the cooperative.
          </p>
          <div className="cta-buttons">
            <a href="https://nitty.ebl.beauty#card" className="btn-primary">Get Your SOLVY Card</a>
            <a href="https://nitty.ebl.beauty#sovereignitity" className="btn-secondary">Learn About SOVEREIGNITITY™</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2025 DECIDEY NGO. Part of the SOLVY Platform.</p>
          <p>Continuing the legacy of economic justice and self-determination.</p>
        </div>
      </footer>
    </div>
  )
}

export default Decidey
