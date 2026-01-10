import { useState } from 'react'
import { calculateSovereigntyAcceleration } from '../lib/solvyCalculations

const CONTRIBUTION_TIERS = [0.25, 0.50, 0.99]

interface SovereigntyAcceleratorProps {
  totalMembers: number
}

function SovereigntyAccelerator({ totalMembers }: SovereigntyAcceleratorProps) {
  const [contribution, setContribution] = useState(CONTRIBUTION_TIERS[1])
  const impact = calculateSovereigntyAcceleration(contribution, totalMembers)

  return (
    <div className="sovereignty-accelerator">
      <h3>🚀 Accelerate Our Sovereignty</h3>
      <p className="description">
        Choose a small monthly contribution to directly fund the community's UBI pool and sovereign infrastructure.
      </p>

      <div className="slider-section">
        <label htmlFor="contribution-slider">
          Your Monthly Sovereignty Contribution: <strong>${contribution.toFixed(2)}</strong>
        </label>
        <input
          id="contribution-slider"
          type="range"
          min="0"
          max={CONTRIBUTION_TIERS.length - 1}
          step="1"
          value={CONTRIBUTION_TIERS.indexOf(contribution)}
          onChange={(e) => {
            const tierIndex = parseInt(e.target.value)
            setContribution(CONTRIBUTION_TIERS[tierIndex])
          }}
          className="slider"
        />
        <div className="slider-ticks">
          {CONTRIBUTION_TIERS.map((tier) => (
            <span key={tier} className="tick-label">${tier}</span>
          ))}
        </div>
      </div>

      <div className="impact-display">
        <div className="impact-item">
          <span className="impact-label">Your Annual Contribution:</span>
          <span className="impact-value">${impact.memberAnnual}</span>
        </div>
        <div className="impact-item highlight">
          <span className="impact-label">
            If <strong>{totalMembers.toLocaleString()}</strong> members contribute:
          </span>
          <span className="impact-value">${impact.collectiveAnnual.toLocaleString()}/year</span>
        </div>
        <p className="impact-note">
          This capital directly funds the <strong>10% Sovereignty Fund</strong> for the UBI pool, DECIDEY education, and sovereign tech.
        </p>
      </div>
    </div>
  )
}

export default SovereigntyAccelerator
