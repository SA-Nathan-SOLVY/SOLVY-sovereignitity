import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import memberRoutes from './routes/members'
import paymentRoutes from './routes/payments'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: [
    'https://nitty.ebl.beauty',
    'https://decidey.ebl.beauty',
    'https://ebl.beauty',
    'https://remittance.ebl.beauty',
    'http://localhost:5173', // Local development
  ],
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'SOLVY API',
    version: '1.0.0'
  })
})

// API routes
app.use('/api/members', memberRoutes)
app.use('/api/payments', paymentRoutes)

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString()
  })
})

// Error handler
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Error:', err)
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString()
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SOLVY API server running on port ${PORT}`)
  console.log(`📍 Health check: http://localhost:${PORT}/health`)
  console.log(`🛡️  Environment: ${process.env.NODE_ENV || 'development'}`)
})

export default app
