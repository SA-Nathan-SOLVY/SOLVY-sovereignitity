import { useState } from 'react';
import UnifiedNav from '../UnifiedNav';
import { CheckCircle, CreditCard, User, Building2, ArrowRight } from 'lucide-react';

export default function RequestCard() {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    accountType: 'personal', // personal or business
    address: '',
    city: '',
    state: '',
    zip: ''
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCard) {
      alert('Please select a card design first.');
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
          <h1 className="text-4xl font-bold mb-4">Request Received!</h1>
          <p className="text-xl text-slate-400 max-w-lg mb-8">
            Thank you, {formData.firstName}. We have received your request for the <span className="text-purple-400 font-semibold">{cards.find(c => c.id === selectedCard)?.name}</span>.
          </p>
          <p className="text-slate-500 mb-8">
            Check your email at <span className="text-white">{formData.email}</span> for next steps on identity verification.
          </p>
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            Select Your SOLVY Card
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Choose the card that fits your lifestyle. Whether for personal freedom or business growth, SOLVY empowers your financial sovereignty.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-16">
          {/* Step 1: Select Card */}
          <div>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold text-xl">1</div>
              <h2 className="text-2xl font-bold">Choose Your Design</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {cards.map((card) => (
                <div 
                  key={card.id}
                  onClick={() => setSelectedCard(card.id)}
                  className={`relative group cursor-pointer rounded-2xl transition-all duration-300 ${
                    selectedCard === card.id 
                      ? 'ring-4 ring-purple-500 scale-105 bg-slate-800' 
                      : 'hover:scale-105 bg-slate-800/50 hover:bg-slate-800 border border-slate-700'
                  }`}
                >
                  <div className="p-4">
                    <div className="aspect-[1.586] relative rounded-xl overflow-hidden mb-4 shadow-lg">
                      <img 
                        src={card.image} 
                        alt={card.name}
                        className="w-full h-full object-contain bg-slate-900/50"
                      />
                      {selectedCard === card.id && (
                        <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center backdrop-blur-[2px]">
                          <CheckCircle className="w-12 h-12 text-white drop-shadow-lg" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                      {card.type === 'business' ? <Building2 className="w-4 h-4 text-blue-400" /> : <User className="w-4 h-4 text-pink-400" />}
                      {card.name}
                    </h3>
                    <ul className="space-y-1">
                      {card.features.map((feature, idx) => (
                        <li key={idx} className="text-xs text-slate-400 flex items-center gap-1">
                          <div className="w-1 h-1 rounded-full bg-slate-500"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: User Details */}
          <div className={`transition-all duration-500 ${selectedCard ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4 grayscale pointer-events-none'}`}>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold text-xl">2</div>
              <h2 className="text-2xl font-bold">Enter Your Details</h2>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 max-w-4xl">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-400 mb-2">Street Address</label>
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  placeholder="123 Sovereignty Way"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-400 mb-2">City</label>
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
                  <label className="block text-sm font-medium text-slate-400 mb-2">State</label>
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
                  <label className="block text-sm font-medium text-slate-400 mb-2">ZIP Code</label>
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
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pb-20">
            <button
              type="submit"
              disabled={!selectedCard}
              className={`group relative inline-flex items-center gap-3 px-12 py-4 rounded-full text-lg font-bold transition-all duration-300 ${
                selectedCard 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg hover:shadow-purple-500/40 hover:-translate-y-1' 
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <CreditCard className="w-6 h-6" />
              Request My Card
              <ArrowRight className={`w-5 h-5 transition-transform duration-300 ${selectedCard ? 'group-hover:translate-x-1' : ''}`} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
