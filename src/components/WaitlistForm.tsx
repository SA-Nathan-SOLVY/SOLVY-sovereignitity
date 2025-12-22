import React, { useState } from 'react'

export const WaitlistForm: React.FC = () => {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const response = await fetch('https://api.ebl.beauty/api/public/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(data.message || 'Successfully joined waitlist!')
        setEmail('')
        setName('')
      } else {
        setStatus('error')
        setMessage(data.error || 'Failed to join waitlist')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Network error. Please try again.')
    }
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-md mx-auto border border-purple-100">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Join the Revolution</h3>
        <p className="text-gray-600">Be the first to own your financial future.</p>
      </div>

      {status === 'success' ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            🎉
          </div>
          <h4 className="text-xl font-bold text-gray-900 mb-2">You're on the list!</h4>
          <p className="text-gray-600 mb-6">{message}</p>
          <button 
            onClick={() => setStatus('idle')}
            className="text-purple-600 font-semibold hover:text-purple-700"
          >
            Add another email
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              placeholder="John Doe"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              placeholder="john@example.com"
            />
          </div>

          {status === 'error' && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-indigo-700 transform hover:scale-[1.02] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
          >
            {status === 'loading' ? 'Joining...' : 'Join Waitlist'}
          </button>
          
          <p className="text-xs text-center text-gray-500 mt-4">
            We respect your privacy. No spam, ever.
          </p>
        </form>
      )}
    </div>
  )
}
