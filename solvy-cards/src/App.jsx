import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Card from './pages/Card'
import Services from './pages/Services'
import Receipts from './pages/Receipts'
import More from './pages/More'
import TestReceiptScan from './pages/TestReceiptScan'
import KycCapture from './pages/KycCapture'
import TestKycCapture from './pages/TestKycCapture'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/card" element={<Card />} />
          <Route path="/services" element={<Services />} />
          <Route path="/receipts" element={<Receipts />} />
          <Route path="/more" element={<More />} />
          <Route path="/test-receipt" element={<TestReceiptScan />} />
          <Route path="/kyc" element={<KycCapture />} />
          <Route path="/test-kyc" element={<TestKycCapture />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
