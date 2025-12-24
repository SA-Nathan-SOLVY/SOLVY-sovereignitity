import { useState } from 'react'
import UnifiedNav from '../components/UnifiedNav'
import './FoundingMemberApply.css'

interface FormData {
  email: string
  firstName: string
  lastName: string
  phone: string
  addressLine1: string
  addressCity: string
  addressState: string
  addressZip: string
}

function FoundingMemberApply() {
  const [step, setStep] = useState<'info' | 'payment' | 'processing'>('info')
  const [formData, setFormData] = useState<FormData>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    addressLine1: '',
    addressCity: '',
    addressState: '',
    addressZip: '',
  })
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [memberNumber, setMemberNumber] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const API_BASE = ''

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE}/api/founding-member/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Application failed')
      }

      setCustomerId(data.customerId)
      setMemberNumber(data.member.member_number)
      setStep('payment')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckout = async (planType: 'monthly' | 'annual') => {
    setLoading(true)
    setError(null)
    setStep('processing')

    try {
      const priceId = planType === 'monthly' 
        ? 'price_1ShigTCeCdOYW1f8saD37e7V'
        : 'price_1ShigUCeCdOYW1f8QbabsjsR'

      const checkoutResponse = await fetch(`${API_BASE}/api/founding-member/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          priceId,
        }),
      })

      const data = await checkoutResponse.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Failed to create checkout session')
      }
    } catch (err: any) {
      setError(err.message)
      setStep('payment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="founding-member-apply">
      <UnifiedNav currentPage="apply" />

      <div className="apply-container">
        <div className="apply-header">
          <img src="/solvy-crown-icon.png" alt="SOLVY" className="apply-crown" />
          <h1>Become a SOLVY Founding Member</h1>
          <p className="apply-subtitle">Join America's first cooperative-owned P2P payment platform</p>
        </div>

        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}

        {step === 'info' && (
          <form onSubmit={handleSubmitApplication} className="apply-form">
            <div className="form-section">
              <h2>Personal Information</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    placeholder="Sean"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    placeholder="Mayo"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="sean.mayo@example.com"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2>Mailing Address</h2>
              
              <div className="form-group full-width">
                <label htmlFor="addressLine1">Street Address</label>
                <input
                  type="text"
                  id="addressLine1"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleInputChange}
                  placeholder="123 Main Street"
                />
              </div>

              <div className="form-row triple">
                <div className="form-group">
                  <label htmlFor="addressCity">City</label>
                  <input
                    type="text"
                    id="addressCity"
                    name="addressCity"
                    value={formData.addressCity}
                    onChange={handleInputChange}
                    placeholder="New York"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="addressState">State</label>
                  <select
                    id="addressState"
                    name="addressState"
                    value={formData.addressState}
                    onChange={handleInputChange}
                  >
                    <option value="">Select...</option>
                    <option value="NY">New York</option>
                    <option value="CA">California</option>
                    <option value="TX">Texas</option>
                    <option value="FL">Florida</option>
                    <option value="IL">Illinois</option>
                    <option value="PA">Pennsylvania</option>
                    <option value="OH">Ohio</option>
                    <option value="GA">Georgia</option>
                    <option value="NC">North Carolina</option>
                    <option value="MI">Michigan</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="addressZip">ZIP Code</label>
                  <input
                    type="text"
                    id="addressZip"
                    name="addressZip"
                    value={formData.addressZip}
                    onChange={handleInputChange}
                    placeholder="10001"
                  />
                </div>
              </div>
            </div>

            <div className="form-section benefits">
              <h2>Founding Member Benefits</h2>
              <ul className="benefits-list">
                <li>Cooperative ownership stake in SOLVY platform</li>
                <li>Data sovereignty - your financial data stays yours</li>
                <li>Profit sharing from platform growth</li>
                <li>Priority access to new features</li>
                <li>Founding member badge on your SOLVY Card</li>
                <li>Lower processing fees vs traditional banks</li>
              </ul>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Processing...' : 'Continue to Payment'}
            </button>
          </form>
        )}

        {step === 'payment' && (
          <div className="payment-step">
            <div className="member-info-card">
              <h2>Welcome, {formData.firstName}!</h2>
              <p className="member-number">Your Member Number: <strong>{memberNumber}</strong></p>
            </div>

            <h2>Choose Your Membership Plan</h2>
            
            <div className="pricing-cards">
              <div className="pricing-card">
                <h3>Monthly</h3>
                <div className="price">$9.99<span>/month</span></div>
                <ul>
                  <li>Full cooperative ownership</li>
                  <li>Data sovereignty</li>
                  <li>Profit sharing</li>
                  <li>Cancel anytime</li>
                </ul>
                <button 
                  onClick={() => handleCheckout('monthly')} 
                  className="btn-checkout"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Start Monthly Plan'}
                </button>
              </div>

              <div className="pricing-card featured">
                <div className="save-badge">Save 17%</div>
                <h3>Annual</h3>
                <div className="price">$99.99<span>/year</span></div>
                <ul>
                  <li>Full cooperative ownership</li>
                  <li>Data sovereignty</li>
                  <li>Profit sharing</li>
                  <li>2 months free</li>
                </ul>
                <button 
                  onClick={() => handleCheckout('annual')} 
                  className="btn-checkout featured"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Start Annual Plan'}
                </button>
              </div>
            </div>

            <p className="sandbox-notice">
              This is a sandbox test environment. Use test card: 4242 4242 4242 4242
            </p>
          </div>
        )}

        {step === 'processing' && (
          <div className="processing-step">
            <div className="spinner"></div>
            <h2>Redirecting to Secure Checkout...</h2>
            <p>Please wait while we connect you to Stripe.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default FoundingMemberApply
