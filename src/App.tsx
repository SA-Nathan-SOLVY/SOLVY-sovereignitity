import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Decidey from './pages/Decidey'
import { Contact } from './pages/Contact'
import { Admin } from './pages/Admin'
import SPSPresentation from './pages/SPSPresentation'
import SolvyCard from './pages/SolvyCard'
import CommunicationsCenter from './pages/CommunicationsCenter'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Decidey />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/sps-presentation" element={<SPSPresentation />} />
        <Route path="/solvy-card" element={<SolvyCard />} />
        <Route path="/communications" element={<CommunicationsCenter />} />
      </Routes>
    </Router>
  )
}

export default App
