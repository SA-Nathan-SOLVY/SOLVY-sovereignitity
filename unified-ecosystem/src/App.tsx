import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

// Pages
import NittyHome from './pages/NittyHome'
import Decidey from './pages/Decidey'
import Admin from './pages/Admin'
import EBL from './pages/EBL'
import SPS from './pages/SPS'
import MAN from './pages/MAN'
import Banking from './pages/Banking'
import FoundingMemberApply from './pages/FoundingMemberApply'
import MemberSuccess from './pages/MemberSuccess'

function App() {
  // Detect which subdomain we're on
  const hostname = window.location.hostname
  
  // Route based on subdomain
  // Remittance archived - hidden from navigation
  // if (hostname.includes('remittance')) {
  //   return <Remittance />
  // }
  if (hostname.includes('decidey')) {
    return <Decidey />
  } else if (hostname.includes('admin')) {
    return <Admin />
  } else if (hostname.includes('ebl') || hostname.includes('shop')) {
    return <EBL />
  } else {
    // Default routing for main platform
    return (
      <Router>
        <Routes>
          <Route path="/" element={<NittyHome />} />
          <Route path="/ebl" element={<EBL />} />
          <Route path="/sps" element={<SPS />} />
          <Route path="/man" element={<MAN />} />
          <Route path="/decidey" element={<Decidey />} />
          <Route path="/banking" element={<Banking />} />
          <Route path="/apply" element={<FoundingMemberApply />} />
          <Route path="/member-success" element={<MemberSuccess />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    )
  }
}

export default App
