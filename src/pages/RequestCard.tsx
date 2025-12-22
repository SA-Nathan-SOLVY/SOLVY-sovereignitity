import { useState } from 'react';
import UnifiedNav from '../UnifiedNav';
import { CheckCircle, CreditCard, Shield, Lock } from 'lucide-react';

export default function RequestCard() {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [physicalCard, setPhysicalCard] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
    ssnLast4: '',
    idType: '',
    idNumber: '',
    agreed: false
  });
  const [submitted, setSubmitted] = useState(false);

  const cards = [
    {
      id: 'personal-visa',
      name: 'Personal Visa',
      image: '/SOV-personal-visa.png',
      type: 'personal',
      features: ['Global Acceptance', 'No Monthly Fees', 'Instant P2P Transfers']
    },
    {
      id: 'personal-mc',
      name: 'Personal Mastercard',
      image: '/SOV-personal-mc.png',
      type: 'personal',
      features: ['Travel Benefits', 'Purchase Protection', 'Cashback Rewards']
    },
    {
      id: 'business-visa',
      name: 'Business Visa',
      image: '/SOV-visa.png',
      type: 'business',
      features: ['Expense Management', 'Higher Limits', 'Employee Cards']
    },
    {
      id: 'business-sov',
      name: 'Foundation Card',
      image: '/SOV.png',
      type: 'business',
      features: ['Community Impact', 'Tax Reporting', 'Grant Access']
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    if (name === 'physicalCard') {
      setPhysicalCard(checked);
    } else if (name === 'agreed') {
      setFormData(prev => ({ ...prev, agreed: checked }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCard) {
      alert('Please select a card design first.');
      return;
    }
    if (!formData.agreed) {
      alert('Please agree to the Terms of Service.');
      return;
    }
    // Simulate API call
    setSubmitted(true);
    window.scrollTo(0, 0);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <UnifiedNav />
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 animate-bounce">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Welcome to the Movement!</h1>
          <p className="text-xl text-slate-400 max-w-lg mb-8">
            Thank you, {formData.firstName}. Your request for the <span className="text-purple-400 font-semibold">{cards.find(c => c.id === selectedCard)?.name}</span> has been received.
          </p>
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 max-w-md w-full mb-8 text-left">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-400" /> Next Steps
            </h3>
            <ul className="space-y-3 text-slate-300 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                <span>Identity verification in progress (usually instant)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                <span>Virtual card details will be emailed securely</span>
              </li>
              {physicalCard && (
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                  <span>Physical card shipping to {formData.city}, {formData.state} (7-10 days)</span>
                </li>
              )}
            </ul>
          </div>
          <a href="/" className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-xl font-medium transition-all">
            Return Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-purple-500/30">
      <UnifiedNav />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            Join the SOLVY Movement
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Become a member-owner and take control of your financial sovereignty. Get instant access to your virtual card and optionally order a physical card.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Step 1: Select Card */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center font-bold text-sm">1</div>
              <h2 className="text-xl font-bold">Select Your Card Design</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {cards.map((card) => (
                <div 
                  key={card.id}
                  onClick={() => setSelectedCard(card.id)}
                  className={`relative group cursor-pointer rounded-xl transition-all duration-300 ${
                    selectedCard === card.id 
                      ? 'ring-2 ring-purple-500 bg-slate-800 shadow-lg shadow-purple-500/20' 
                      : 'hover:bg-slate-800/50 border border-slate-700/50'
                  }`}
                >
                  <div className="p-3">
                    <div className="aspect-[1.586] relative rounded-lg overflow-hidden mb-3 shadow-md">
                      <img 
                        src={card.image} 
                        alt={card.name}
                        className="w-full h-full object-contain bg-slate-900/50"
                      />
                      {selectedCard === card.id && (
                        <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center backdrop-blur-[1px]">
                          <CheckCircle className="w-8 h-8 text-white drop-shadow-lg" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-xs font-bold text-center truncate">{card.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Personal Information */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center font-bold text-sm">2</div>
              <h2 className="text-xl font-bold">Personal Information</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Date of Birth *</label>
              <input
                type="date"
                name="dob"
                required
                value={formData.dob}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-slate-300"
              />
            </div>
          </div>

          {/* Step 3: Address Information */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center font-bold text-sm">3</div>
              <h2 className="text-xl font-bold">Address Information</h2>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-400 mb-2">Street Address *</label>
              <input
                type="text"
                name="address"
                required
                value={formData.address}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-400 mb-2">City *</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">State *</label>
                <input
                  type="text"
                  name="state"
                  required
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">ZIP Code *</label>
                <input
                  type="text"
                  name="zip"
                  required
                  value={formData.zip}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Country *</label>
              <select
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-slate-300"
              >
                <option value="United States">United States</option>
              </select>
            </div>
          </div>

          {/* Step 4: KYC Verification */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center font-bold text-sm">4</div>
              <h2 className="text-xl font-bold">KYC Verification</h2>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6 flex gap-3">
              <Lock className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-200">
                <span className="font-bold">Why we need this:</span> Federal regulations require identity verification for financial services. Your information is encrypted and never sold to third parties.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-400 mb-2">Social Security Number (Last 4 digits) *</label>
              <input
                type="password"
                name="ssnLast4"
                maxLength={4}
                required
                value={formData.ssnLast4}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all tracking-widest"
                placeholder="••••"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">ID Type *</label>
                <select
                  name="idType"
                  required
                  value={formData.idType}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-slate-300"
                >
                  <option value="">Select ID Type</option>
                  <option value="driver_license">Driver's License</option>
                  <option value="state_id">State ID</option>
                  <option value="passport">Passport</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">ID Number *</label>
                <input
                  type="text"
                  name="idNumber"
                  required
                  value={formData.idNumber}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Step 5: Card Options */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center font-bold text-sm">5</div>
              <h2 className="text-xl font-bold">Card Options</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                <div className="mt-1">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Virtual Card (Included)</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Instant access to your virtual SOLVY Card upon approval. Use it immediately for online purchases and mobile payments.
                  </p>
                </div>
              </div>

              <label className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${physicalCard ? 'bg-purple-500/10 border-purple-500/50' : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'}`}>
                <div className="mt-1">
                  <input
                    type="checkbox"
                    name="physicalCard"
                    checked={physicalCard}
                    onChange={handleCheckboxChange}
                    className="w-5 h-5 rounded border-slate-600 text-purple-600 focus:ring-purple-500 bg-slate-800"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-white">Order Physical Card (+$10 one-time fee)</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    NFC-enabled contactless card shipped to your address within 7-10 business days.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Terms & Submit */}
          <div className="pt-4">
            <label className="flex items-start gap-3 mb-8 cursor-pointer group">
              <input
                type="checkbox"
                name="agreed"
                checked={formData.agreed}
                onChange={handleCheckboxChange}
                className="mt-1 w-5 h-5 rounded border-slate-600 text-purple-600 focus:ring-purple-500 bg-slate-800"
              />
              <span className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">
                I agree to the <a href="#" className="text-purple-400 hover:underline">Terms of Service</a> and <a href="#" className="text-purple-400 hover:underline">Privacy Policy</a>. I understand that I'm becoming a member-owner of the SOLVY cooperative.
              </span>
            </label>

            <button
              type="submit"
              disabled={!selectedCard || !formData.agreed}
              className={`w-full md:w-auto md:min-w-[300px] flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-lg font-bold transition-all duration-300 ${
                selectedCard && formData.agreed
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg hover:shadow-purple-500/40 hover:-translate-y-1' 
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Shield className="w-5 h-5" />
              Complete Signup & Get My Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
