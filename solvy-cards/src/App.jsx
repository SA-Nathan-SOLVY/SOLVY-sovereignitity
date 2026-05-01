import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Card from './pages/Card'
import Services from './pages/Services'
import Receipts from './pages/Receipts'
import More from './pages/More'

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
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
