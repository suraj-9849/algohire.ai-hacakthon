import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const app = express()

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}))
app.use(morgan('combined'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'Collaborative Candidate Notes API is running!'
  })
})

// Simple API routes for testing
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Backend API is working!',
    environment: process.env.NODE_ENV || 'development'
  })
})

// Placeholder routes (to be implemented)
app.get('/api/candidates', (req, res) => {
  res.json({
    success: true,
    data: {
      candidates: [
        { id: '1', name: 'John Doe', email: 'john@example.com', createdAt: new Date() },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', createdAt: new Date() }
      ]
    }
  })
})

app.post('/api/candidates', (req, res) => {
  const { name, email } = req.body
  res.status(201).json({
    success: true,
    message: 'Candidate created successfully',
    data: {
      id: Date.now().toString(),
      name,
      email,
      createdAt: new Date()
    }
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  })
})

// Error handling
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error:', err)
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  })
})

const PORT = process.env.PORT || 5001

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🔗 API base URL: http://localhost:${PORT}/api`)
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`)
})