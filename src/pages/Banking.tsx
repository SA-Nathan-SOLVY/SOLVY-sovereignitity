import { useEffect, useRef, useState } from 'react'
import UnifiedNav from '../UnifiedNav'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'unit-elements-white-label-app': any;
    }
  }
}

function Banking() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    fetch('http://46.62.235.95:3001/api/unit/token' )
      .then(res => res.json())
      .then(data => setToken(data.token))
      .catch(err => console.error(err))
  }, [])

  useEffect(() => {
    if (containerRef.current && token) {
      const unitElement = document.createElement('unit-elements-white-label-app')
      unitElement.setAttribute('jwt-token', token)
      containerRef.current.appendChild(unitElement)
    }
  }, [token])

  return (
    <div style={{ minHeight: '100vh' }}>
      <UnifiedNav />
      <div ref={containerRef} style={{ padding: '100px 20px' }}></div>
    </div>
  )
}

export default Banking
