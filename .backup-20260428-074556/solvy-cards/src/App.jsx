import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Card from './pages/Card'
import Banking from './pages/Banking'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/card" element={<Card />} />
          <Route path="/banking" element={<Banking />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
