import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import healthRoutes from './routes/health.js'
import exportRoutes from './routes/export.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env') })

const app = express()
const PORT = process.env.PORT || 3001

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: [
        "'self'",
        "https://api.open-meteo.com",
        "https://fonts.googleapis.com",
        "https://fonts.gstatic.com",
        "https://*.supabase.co",
        "wss://*.supabase.co"
      ],
      imgSrc: ["'self'", "blob:", "data:"],
      upgradeInsecureRequests: []
    }
  }
}))
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }))
app.use(express.json({ limit: '10mb' }))

// Serve favicon.ico (redirect to SVG for browsers that auto-request .ico)
app.get('/favicon.ico', (req, res) => {
  res.redirect('/favicon.svg')
})

// Serve built client app
const distPath = resolve(__dirname, '../client/dist')
app.use(express.static(distPath))

app.use('/api/health', healthRoutes)
app.use('/api/export', exportRoutes)

app.get('/api', (req, res) => {
  res.json({ name: 'Zenith Tracker API', version: '1.0.0' })
})

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(resolve(distPath, 'index.html'))
  }
})

app.listen(PORT, () => {
  console.log(`Zenith API running on port ${PORT}`)
})

export default app
