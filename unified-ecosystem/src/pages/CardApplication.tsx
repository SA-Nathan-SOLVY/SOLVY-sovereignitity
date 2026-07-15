import { useState } from 'react';
import './CardApplication.css';

interface CardApplicationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  ssn: string;
  address1: string;
  city: string;
  state: string;
  zip: string;
}

export default function CardApplication() {
  const [form, setForm] = useState<CardApplicationData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    ssn: '',
    address1: '',
    city: '',
    state: '',
    zip: '',
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // 1. Create account holder (KYC)
      const ahRes = await fetch('/api/card/account-holders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflow: 'KYC_BASIC',
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          dob: form.dob,
          governmentId: form.ssn,
          address: {
            address1: form.address1,
            city: form.city,
            state: form.state,
            postal_code: form.zip,
            country: 'USA',
          },
        }),
      });

      const ahData = await ahRes.json();
      if (!ahData.success) throw new Error(ahData.error || 'Account holder creation failed');

      const accountHolder = ahData.accountHolder;

      // 2. If account has an account_token, create a virtual card
      let card = null;
      const accountToken = accountHolder.account_token || accountHolder.token;
      if (accountToken) {
        try {
          const cardRes = await fetch('/api/card/cards', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              accountToken,
              type: 'VIRTUAL',
              memo: 'SOLVY Member Card',
            }),
          });
          const cardData = await cardRes.json();
          if (cardData.success) card = cardData.card;
        } catch (cardErr: any) {
          console.warn('Card creation skipped:', cardErr.message);
        }
      }

      setResult({ accountHolder, card });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-application-page">
      <div className="container">
        <h1>Apply for Your SOLVY Card™</h1>
        <p className="subtitle">
          Cooperative debit card. No credit check. Every swipe builds member ownership.
        </p>

        {error && <div className="alert error">❌ {error}</div>}

        {result ? (
          <div className="result-panel">
            <div className="alert success">
              ✅ Account holder created: <strong>{result.accountHolder.token}</strong>
              <br />
              Status: <strong>{result.accountHolder.status || 'pending'}</strong>
            </div>
            {result.card ? (
              <div className="card-result">
                <h2>Your Virtual Card</h2>
                <p>Card ending in <strong>{result.card.last_four}</strong></p>
                <p>Token: <code>{result.card.token}</code></p>
                <p>State: <strong>{result.card.state}</strong></p>
              </div>
            ) : (
              <div className="alert info">
                Your KYC is being reviewed. You will receive your virtual card once approved.
              </div>
            )}
            <button className="btn-primary" onClick={() => setResult(null)}>
              Apply for Another Card
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card-application-form">
            <div className="form-row">
              <input name="firstName" placeholder="First name" value={form.firstName} onChange={handleChange} required />
              <input name="lastName" placeholder="Last name" value={form.lastName} onChange={handleChange} required />
            </div>
            <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
            <input name="phone" type="tel" placeholder="Phone" value={form.phone} onChange={handleChange} required />
            <input name="dob" type="date" placeholder="Date of birth" value={form.dob} onChange={handleChange} required />
            <input name="ssn" placeholder="SSN / Government ID" value={form.ssn} onChange={handleChange} required />
            <input name="address1" placeholder="Street address" value={form.address1} onChange={handleChange} required />
            <div className="form-row">
              <input name="city" placeholder="City" value={form.city} onChange={handleChange} required />
              <input name="state" placeholder="State" value={form.state} onChange={handleChange} required />
              <input name="zip" placeholder="ZIP" value={form.zip} onChange={handleChange} required />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>

            <p className="privacy-note">
              Your information is used only for KYC/AML compliance. SOLVY never sells member data.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
