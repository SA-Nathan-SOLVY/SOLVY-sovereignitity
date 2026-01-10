import { useState } from 'react'
import { calculateProfitShare } from '../lib/solvyCalculations
import SovereigntyAccelerator from '../components/SovereigntyAccelerator'
import UnifiedNav from '../UnifiedNav'
import '../dashboardStyles.css'

function MemberDashboard() {
  const [demoData] = useState({
    memberVolume: 1250.75,
    totalVolume: 1250750.00,
    totalInterchange: 23139.38,
    totalMembers: 10000
  })

  const profitShare = calculateProfitShare(
    demoData.memberVolume,
    demoData.totalVolume,
    demoData.totalInterchange
  )

  return (
    <>
      <UnifiedNav />
      <div className="member-dashboard">
        <header>
          <h1>Your Share & Impact</h1>
          <p>Your direct stake in the SOLVY Cooperative.</p>
        </header>

        <section className="profit-share-section">
          <h2>Your Profit Share Calculation</h2>

          <div className="activity-summary">
            <div className="stat">
              <span className="label">Your Spending Volume:</span>
              <span className="value">${demoData.memberVolume.toLocaleString()}</span>
            </div>
            <div className="stat">
              <span className="label">Co-op's Total Volume:</span>
              <span className="value">${demoData.totalVolume.toLocaleString()}</span>
            </div>
            <div className="stat highlight">
              <span className="label">Your Patronage:</span>
              <span className="value">{profitShare.patronagePercentage.toFixed(4)}%</span>
            </div>
          </div>

          <div className="allocation-visual">
            <p className="chart-label">Every $1 of interchange is split as:</p>
            <div className="allocation-bar">
              <div className="segment ops" style={{ width: '70%' }}>70% Operations</div>
              <div className="segment pool" style={{ width: '20%' }}>20% Member Pool</div>
              <div className="segment sovereign" style={{ width: '10%' }}>10% Sovereignty Fund</div>
            </div>
          </div>

          <div className="share-calculation">
            <h3>Your Estimated Share of the 20% Member Pool</h3>
            <div className="calculation-result">
              <span className="formula">
                {profitShare.patronagePercentage.toFixed(4)}% × ${(demoData.totalInterchange * 0.20).toFixed(2)}
              </span>
              <span className="equals"> = </span>
              <strong className="final-share">${profitShare.memberShare.toFixed(2)}</strong>
            </div>
            <p className="calculation-note">Distributed quarterly based on verified patronage.</p>
          </div>
        </section>

        <section className="sovereignty-section">
          <SovereigntyAccelerator totalMembers={demoData.totalMembers} />
        </section>
      </div>
    </>
  )
}

export default MemberDashboard
