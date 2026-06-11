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

app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }))
app.use(express.json({ limit: '10mb' }))

app.use('/api/health', healthRoutes)
app.use('/api/export', exportRoutes)

app.get('/api', (req, res) => {
  res.json({ name: 'Zenith Tracker API', version: '1.0.0' })
})

app.listen(PORT, () => {
  console.log(`Zenith API running on port ${PORT}`)
})

export default app
