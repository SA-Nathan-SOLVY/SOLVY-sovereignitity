import { useState } from 'react'
import UnifiedNav from '../components/UnifiedNav'
import './Remittance.css'

function Remittance() {
  const [sendAmount, setSendAmount] = useState(500)
  const [country, setCountry] = useState('Nigeria')

  const traditionalFee = sendAmount * 0.06
  const traditionalReceives = sendAmount - traditionalFee
  const solvyReceives = sendAmount
  const annualSavings = traditionalFee * 12

  return (
    <div className="remittance-page">
      <UnifiedNav currentPage="remittance" />

      {/* Hero */}
      <section className="remittance-hero">
        <div className="container">
          <h1>Global Remittance Vision & Roadmap</h1>
          <p className="hero-subtitle">Building the future of diaspora financial sovereignty through strategic partnership goals</p>
        </div>
      </section>

      {/* Vision */}
      <section className="vision-section">
        <div className="container">
          <h2>Future Vision: Self-Determined Economic Liberation</h2>
          <p>
            While HR 40 represents important progress, diaspora communities worldwide are building their own pathways to economic opportunity. 
            SOLVY's roadmap envisions zero-fee family remittances connecting communities globally through our Ethereum-ready and Polygon-integrated Web3 infrastructure. 
            This comprehensive network will enable immediate economic sovereignty through cooperative wealth-building, supporting all communities seeking financial independence and self-determination.
          </p>
        </div>
      </section>

      {/* Roadmap */}
      <section className="roadmap-section">
        <div className="container">
          <h2>Development Roadmap</h2>
          
          <div className="roadmap-grid">
            <div className="roadmap-phase">
              <div className="phase-status in-progress">In Progress</div>
              <h3>Phase 1: Foundation</h3>
              <p className="phase-timeline">2025 Q1-Q2</p>
              <ul>
                <li>EBL Services integration (Current)</li>
                <li>SOLVY Card deployment</li>
                <li>DECIDEY NGO education platform</li>
                <li>SOVEREIGNITITY™ LIFE PROGRAM wealth-building strategies</li>
              </ul>
            </div>

            <div className="roadmap-phase">
              <div className="phase-status planned">Planned</div>
              <h3>Phase 2: Regional Expansion</h3>
              <p className="phase-timeline">2025 Q3-Q4</p>
              <ul>
                <li>African Diaspora remittance pilot</li>
                <li>Nigeria, Ghana, Kenya partnerships</li>
                <li>Family card network testing</li>
                <li>Cooperative economics education</li>
              </ul>
            </div>

            <div className="roadmap-phase">
              <div className="phase-status vision">Vision</div>
              <h3>Phase 3: Global Integration</h3>
              <p className="phase-timeline">2026 Q1-Q2</p>
              <ul>
                <li>Web3 infrastructure deployment</li>
                <li>Ethereum and Polygon network integration</li>
                <li>International partnership development</li>
                <li>Cross-border payment infrastructure</li>
              </ul>
            </div>

            <div className="roadmap-phase">
              <div className="phase-status vision">Vision</div>
              <h3>Phase 4: Global Network</h3>
              <p className="phase-timeline">2026 Q3+</p>
              <ul>
                <li>Top remittance market integration</li>
                <li>Multi-currency support expansion</li>
                <li>Global cooperative network</li>
                <li>Economic sovereignty achievement</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section className="calculator-section">
        <div className="container">
          <h2>Future Savings Calculator</h2>
          
          <div className="calculator-inputs">
            <div className="input-group">
              <label>Send Amount (USD)</label>
              <input 
                type="number" 
                value={sendAmount} 
                onChange={(e) => setSendAmount(Number(e.target.value))}
                min="0"
                step="50"
              />
            </div>
            <div className="input-group">
              <label>Destination Country</label>
              <select value={country} onChange={(e) => setCountry(e.target.value)}>
                <option>Nigeria</option>
                <option>Ghana</option>
                <option>Kenya</option>
                <option>Mexico</option>
                <option>Philippines</option>
                <option>India</option>
              </select>
            </div>
          </div>

          <div className="calculator-results">
            <div className="result-card traditional">
              <h4>Traditional Remittance</h4>
              <div className="result-breakdown">
                <div className="breakdown-item">
                  <span>Send Amount:</span>
                  <span>${sendAmount.toFixed(2)}</span>
                </div>
                <div className="breakdown-item fee">
                  <span>Fees (6%):</span>
                  <span>-${traditionalFee.toFixed(2)}</span>
                </div>
              </div>
              <div className="result-total">
                <div className="total-amount">${traditionalReceives.toFixed(2)}</div>
                <div className="total-label">Recipient Gets</div>
              </div>
            </div>

            <div className="result-card solvy">
              <h4>SOLVY Family Network (Future)</h4>
              <div className="result-breakdown">
                <div className="breakdown-item">
                  <span>Send Amount:</span>
                  <span>${sendAmount.toFixed(2)}</span>
                </div>
                <div className="breakdown-item">
                  <span>Fees:</span>
                  <span>$0.00 (Family Cards)</span>
                </div>
              </div>
              <div className="result-total">
                <div className="total-amount">${solvyReceives.toFixed(2)}</div>
                <div className="total-label">Recipient Gets</div>
              </div>
            </div>
          </div>

          <div className="annual-savings">
            <h3>Projected Annual Savings</h3>
            <div className="savings-amount">${annualSavings.toFixed(2)}</div>
            <p>Per year (monthly transfers)</p>
          </div>
        </div>
      </section>

      {/* Countries */}
      <section className="countries-section">
        <div className="container">
          <h2>Comprehensive Global Network Vision</h2>
          <p className="section-subtitle">BRICS Members, Partner Countries, and Strategic Markets</p>

          <h3>BRICS Full Members (2025)</h3>
          <div className="country-grid">
            <div className="country-card">
              <div className="country-flag">🇧🇷</div>
              <h4>Brazil</h4>
              <p className="remittance-volume">$2.8B annually</p>
              <p className="country-info">0.15% GDP | BRICS founding member</p>
            </div>
            <div className="country-card">
              <div className="country-flag">🇷🇺</div>
              <h4>Russia</h4>
              <p className="remittance-volume">$1.2B annually</p>
              <p className="country-info">0.07% GDP | Energy powerhouse</p>
            </div>
            <div className="country-card">
              <div className="country-flag">🇮🇳</div>
              <h4>India</h4>
              <p className="remittance-volume">$125B annually</p>
              <p className="country-info">3.2% GDP | Fastest growing economy</p>
            </div>
            <div className="country-card">
              <div className="country-flag">🇨🇳</div>
              <h4>China</h4>
              <p className="remittance-volume">$18.1B annually</p>
              <p className="country-info">0.1% GDP | Second largest economy</p>
            </div>
            <div className="country-card">
              <div className="country-flag">🇿🇦</div>
              <h4>South Africa</h4>
              <p className="remittance-volume">$1.1B annually</p>
              <p className="country-info">0.27% GDP | African economic hub</p>
            </div>
            <div className="country-card">
              <div className="country-flag">🇸🇦</div>
              <h4>Saudi Arabia</h4>
              <p className="remittance-volume">$36.1B annually</p>
              <p className="country-info">4.8% GDP | Gulf powerhouse</p>
            </div>
            <div className="country-card">
              <div className="country-flag">🇪🇬</div>
              <h4>Egypt</h4>
              <p className="remittance-volume">$31.9B annually</p>
              <p className="country-info">6.2% GDP | North African gateway</p>
            </div>
            <div className="country-card">
              <div className="country-flag">🇦🇪</div>
              <h4>UAE</h4>
              <p className="remittance-volume">$18.8B annually</p>
              <p className="country-info">3.9% GDP | Financial hub</p>
            </div>
            <div className="country-card">
              <div className="country-flag">🇪🇹</div>
              <h4>Ethiopia</h4>
              <p className="remittance-volume">$5.4B annually</p>
              <p className="country-info">4.1% GDP | East African leader</p>
            </div>
            <div className="country-card">
              <div className="country-flag">🇮🇩</div>
              <h4>Indonesia</h4>
              <p className="remittance-volume">$8.9B annually</p>
              <p className="country-info">0.65% GDP | Southeast Asian giant</p>
            </div>
            <div className="country-card">
              <div className="country-flag">🇮🇷</div>
              <h4>Iran</h4>
              <p className="remittance-volume">$1.8B annually</p>
              <p className="country-info">0.9% GDP | Regional power</p>
            </div>
          </div>

          <h3>African Diaspora Priority Markets</h3>
          <div className="country-grid">
            <div className="country-card">
              <div className="country-flag">🇳🇬</div>
              <h4>Nigeria</h4>
              <p className="remittance-volume">$25.1B annually</p>
              <p className="country-info">Africa's largest economy</p>
            </div>
            <div className="country-card">
              <div className="country-flag">🇬🇭</div>
              <h4>Ghana</h4>
              <p className="remittance-volume">$4.7B annually</p>
              <p className="country-info">West African gold coast</p>
            </div>
            <div className="country-card">
              <div className="country-flag">🇰🇪</div>
              <h4>Kenya</h4>
              <p className="remittance-volume">$4.2B annually</p>
              <p className="country-info">East African tech hub</p>
            </div>
            <div className="country-card">
              <div className="country-flag">🇲🇦</div>
              <h4>Morocco</h4>
              <p className="remittance-volume">$10.9B annually</p>
              <p className="country-info">North African gateway</p>
            </div>
            <div className="country-card">
              <div className="country-flag">🇸🇳</div>
              <h4>Senegal</h4>
              <p className="remittance-volume">$2.8B annually</p>
              <p className="country-info">West African cultural center</p>
            </div>
            <div className="country-card">
              <div className="country-flag">🇨🇲</div>
              <h4>Cameroon</h4>
              <p className="remittance-volume">$1.8B annually</p>
              <p className="country-info">Central African hub</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="benefits-section">
        <div className="container">
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">💰</div>
              <h3>Economic Sovereignty</h3>
              <p>Self-determined financial independence through cooperative wealth-building and data ownership</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🌍</div>
              <h3>Diaspora Unity</h3>
              <p>Connect families across continents, strengthen cultural and economic bonds, build cooperative networks</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🚀</div>
              <h3>Global Impact</h3>
              <p>Deploy Web3 infrastructure globally, advance blockchain-based financial systems, create decentralized networks</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2025 SOLVY Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default Remittance
