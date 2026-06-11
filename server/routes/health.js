import { Router } from 'express'

const router = Router()

router.get('/', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now(), version: '1.0.0' })
})

export default router
