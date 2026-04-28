import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

// Pages
import NittyHome from './pages/NittyHome'
import Decidey from './pages/Decidey'
import Admin from './pages/Admin'
import EBL from './pages/EBL'
import EBLHub from './pages/EBLHub'
import SPS from './pages/SPS'
import MAN from './pages/MAN'
import Banking from './pages/Banking'
import FoundingMemberApply from './pages/FoundingMemberApply'
import MemberSuccess from './pages/MemberSuccess'
import PrelaunchCommitment from './pages/PrelaunchCommitment'
import Underwriting from './pages/Underwriting'
import FirstCircleDeposit from './pages/FirstCircleDeposit'
import Heritage from './pages/Heritage'
import Manifesto from './pages/Manifesto'
import Sovereignty from './pages/Sovereignty'
import UnderwritingReview from './pages/UnderwritingReview'

import DataMarketplace from './pages/DataMarketplace'
import Presentations from './pages/Presentations'
import Comms from './pages/Comms'
import Mailbox from './pages/Mailbox'
import MOLI from './pages/MOLI'

function App() {
  const hostname = window.location.hostname

  // Resolve which component to show for the root path based on subdomain
  const getRootComponent = () => {
    if (hostname.includes('decidey')) return <Decidey />
    if (hostname.includes('admin')) return <Admin />
    if (hostname === 'ebl.beauty' || hostname === 'www.ebl.beauty') return <EBLHub />
    if (hostname.includes('ebl') || hostname.includes('shop')) return <EBL />
    return <NittyHome />
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={getRootComponent()} />
        <Route path="/ebl" element={<EBL />} />
        <Route path="/ebl-hub" element={<EBLHub />} />
        <Route path="/sps" element={<SPS />} />
        <Route path="/man" element={<MAN />} />
        <Route path="/decidey" element={<Decidey />} />
        <Route path="/banking" element={<Banking />} />
        <Route path="/apply" element={<FoundingMemberApply />} />
        <Route path="/member-success" element={<MemberSuccess />} />
        <Route path="/prelaunch" element={<PrelaunchCommitment />} />
        <Route path="/underwriting" element={<Underwriting />} />
        <Route path="/underwriting-review" element={<UnderwritingReview />} />
        <Route path="/first-circle-deposit" element={<FirstCircleDeposit />} />
        <Route path="/heritage" element={<Heritage />} />
        <Route path="/manifesto" element={<Manifesto />} />
        <Route path="/sovereignty" element={<Sovereignty />} />
        <Route path="/sovereignitity" element={<Sovereignty />} />
        <Route path="/data-marketplace" element={<DataMarketplace />} />
        <Route path="/presentations" element={<Presentations />} />
        <Route path="/comms" element={<Comms />} />
        <Route path="/mailbox" element={<Mailbox />} />
        <Route path="/moli" element={<MOLI />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
