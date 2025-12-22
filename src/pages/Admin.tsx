import React, { useState } from 'react'
import UnifiedNav from '../UnifiedNav'

interface WaitlistEntry {
  id: string
  email: string
  createdAt: string
  status: string
}

interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  createdAt: string
}

interface Stats {
  waitlist: number
  contact: number
}

export const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState<'waitlist' | 'messages'>('waitlist')
  const [stats, setStats] = useState<Stats>({ waitlist: 0, contact: 0 })
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([])
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(false)

  const API_URL = import.meta.env.VITE_API_URL || 'https://api.ebl.beauty'
  const ADMIN_TOKEN = 'Bearer solvy-admin-secret-2025'

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'solvy2025') {
      setIsAuthenticated(true)
      fetchData()
    } else {
      alert('Invalid password')
    }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const statsRes = await fetch(`${API_URL}/api/admin/stats`, { headers: { Authorization: ADMIN_TOKEN } })
      if (statsRes.ok) setStats(await statsRes.json())

      const waitlistRes = await fetch(`${API_URL}/api/admin/waitlist`, { headers: { Authorization: ADMIN_TOKEN } })
      if (waitlistRes.ok) setWaitlist(await waitlistRes.json())

      const messagesRes = await fetch(`${API_URL}/api/admin/contact`, { headers: { Authorization: ADMIN_TOKEN } })
      if (messagesRes.ok) setMessages(await messagesRes.json())
    } catch (error) {
      console.error('Failed to fetch admin data', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full mx-auto flex items-center justify-center shadow-lg mb-4">
              <span className="text-3xl">👑</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Command Center</h1>
            <p className="text-purple-200 mt-2">Secure Access Required</p>
          </div>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Access Code"
              className="w-full p-4 bg-white/5 border border-white/10 rounded-xl mb-6 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
            />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-slate-900 py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
            >
              Unlock Dashboard
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <UnifiedNav currentPage="decidey" />
      
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 pt-32 pb-20 px-4 sm:px-6 lg:px-8 shadow-xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <span className="text-yellow-400">👑</span> Command Center
              </h1>
              <p className="text-purple-200 text-lg">Overseeing the SOLVY Empire</p>
            </div>
            <button 
              onClick={fetchData}
              className="bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-white px-6 py-3 rounded-xl transition-all flex items-center gap-2"
            >
              <span>🔄</span> Refresh Data
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            <div className="bg-white/10 backdrop-blur border border-white/20 p-8 rounded-2xl relative overflow-hidden group hover:bg-white/15 transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-8xl group-hover:scale-110 transition-transform">👥</div>
              <h3 className="text-purple-200 text-sm font-medium uppercase tracking-wider">Total Waitlist</h3>
              <p className="text-5xl font-bold text-white mt-2">{stats.waitlist}</p>
              <div className="mt-4 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-400 w-3/4"></div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur border border-white/20 p-8 rounded-2xl relative overflow-hidden group hover:bg-white/15 transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-8xl group-hover:scale-110 transition-transform">💬</div>
              <h3 className="text-purple-200 text-sm font-medium uppercase tracking-wider">Total Messages</h3>
              <p className="text-5xl font-bold text-white mt-2">{stats.contact}</p>
              <div className="mt-4 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-blue-400 w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 pb-20">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button
              className={`flex-1 py-6 text-center font-bold text-lg transition-all ${
                activeTab === 'waitlist' 
                  ? 'bg-white text-purple-900 border-b-4 border-purple-600' 
                  : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('waitlist')}
            >
              Waitlist Signups
            </button>
            <button
              className={`flex-1 py-6 text-center font-bold text-lg transition-all ${
                activeTab === 'messages' 
                  ? 'bg-white text-blue-900 border-b-4 border-blue-600' 
                  : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('messages')}
            >
              Communications
            </button>
          </div>

          <div className="p-8">
            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading your empire's data...</p>
              </div>
            ) : activeTab === 'waitlist' ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Joined Date</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {waitlist.map((entry) => (
                      <tr key={entry.id} className="hover:bg-purple-50/50 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">{entry.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          <span className="text-gray-300 ml-2 text-xs">{new Date(entry.createdAt).toLocaleTimeString()}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
                            {entry.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <a 
                            href={`mailto:${entry.email}`}
                            className="text-purple-600 hover:text-purple-900 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Email Member →
                          </a>
                        </td>
                      </tr>
                    ))}
                    {waitlist.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-20 text-center text-gray-500">
                          <div className="text-4xl mb-4">📭</div>
                          No signups yet. Time to market!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow group relative">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                          {msg.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{msg.name}</h3>
                          <p className="text-sm text-gray-500">{msg.email}</p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="ml-16">
                      <h4 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide text-xs text-purple-600">Subject: {msg.subject}</h4>
                      <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                        {msg.message}
                      </p>
                      
                      <div className="mt-4 flex justify-end">
                        <a 
                          href={`mailto:${msg.email}?subject=Re: ${msg.subject}`}
                          className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-lg hover:bg-slate-800 transition-colors font-medium text-sm shadow-lg shadow-slate-200"
                        >
                          <span>↩️</span> Reply via Email
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
                {messages.length === 0 && (
                  <div className="text-center py-20 text-gray-500">
                    <div className="text-4xl mb-4">📭</div>
                    No messages yet.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
