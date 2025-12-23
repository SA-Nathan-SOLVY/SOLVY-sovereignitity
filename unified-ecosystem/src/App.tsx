import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

// Pages
import NittyHome from './pages/NittyHome'
import Remittance from './pages/Remittance'
import Decidey from './pages/Decidey'
import Admin from './pages/Admin'
import EBL from './pages/EBL'

function App() {
  // Detect which subdomain we're on
  const hostname = window.location.hostname
  
  // Route based on subdomain
  if (hostname.includes('remittance')) {
    return <Remittance />
  } else if (hostname.includes('decidey')) {
    return <Decidey />
  } else if (hostname.includes('admin')) {
    return <Admin />
  } else if (hostname.includes('ebl') || hostname.includes('shop')) {
    return <EBL />
  } else {
    // Default to nitty (main platform)
    return (
      <Router>
        <Routes>
          <Route path="/" element={<NittyHome />} />
          <Route path="/ebl" element={<EBL />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    )
  }
}

export default App
