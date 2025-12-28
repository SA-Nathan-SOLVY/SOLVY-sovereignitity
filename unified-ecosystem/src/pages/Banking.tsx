import { useEffect, useRef } from 'react'
import UnifiedNav from '../components/UnifiedNav'
import './Banking.css'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'unit-elements-white-label-app': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        'jwt-token'?: string;
        'settings-json'?: string;
      }, HTMLElement>;
    }
  }
}

function Banking() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = ''
      
      const unitElement = document.createElement('unit-elements-white-label-app')
      unitElement.setAttribute('jwt-token', 'demo.jwt.token')
      unitElement.setAttribute('settings-json', JSON.stringify({
        global: {
          colors: {
            primary: "#7c3aed",
            secondary: "#14b8a6"
          },
          buttons: {
            primary: {
              default: {
                borderRadius: "8px"
              }
            }
          }
        },
        elementsCard: {
          designs: [
            {
              name: "default",
              url: "/SOV.png",
              fontColor: "#fafafa"
            }
          ]
        }
      }))
      
      containerRef.current.appendChild(unitElement)
    }
  }, [])

  return (
    <div className="banking-page">
      <UnifiedNav />
      
      <section className="banking-hero">
        <div className="container">
          <h1>SOLVY Banking Portal</h1>
          <p className="banking-subtitle">
            Powered by Unit.co - Your cooperative financial services hub
          </p>
          <div className="banking-badges">
            <span className="badge">FDIC Insured</span>
            <span className="badge">Virtual Debit Cards</span>
            <span className="badge">Instant Transfers</span>
          </div>
        </div>
      </section>

      <section className="banking-container">
        <div className="unit-wrapper" ref={containerRef}>
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading banking portal...</p>
          </div>
        </div>
      </section>

      <section className="banking-info">
        <div className="container">
          <div className="info-grid">
            <div className="info-card">
              <div className="info-icon">🏦</div>
              <h3>Open Your Account</h3>
              <p>Quick verification process to get started with your SOLVY cooperative account</p>
            </div>
            <div className="info-card">
              <div className="info-icon">💳</div>
              <h3>Virtual Debit Card</h3>
              <p>Get instant access to your virtual card for online purchases</p>
            </div>
            <div className="info-card">
              <div className="info-icon">📱</div>
              <h3>Send & Receive</h3>
              <p>Transfer funds instantly to other SOLVY members</p>
            </div>
            <div className="info-card">
              <div className="info-icon">📊</div>
              <h3>Track Everything</h3>
              <p>Full transaction history and spending insights</p>
            </div>
          </div>
        </div>
      </section>

      <section className="banking-notice">
        <div className="container">
          <p>
            <strong>Sandbox Mode:</strong> This is a demo environment using Unit.co's sandbox. 
            Real banking features will be available after production approval.
          </p>
        </div>
      </section>
    </div>
  )
}

export default Banking
