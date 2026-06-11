import { Router } from 'express'
import { verifyToken } from '../middleware/auth.js'

const router = Router()

router.get('/data', verifyToken, async (req, res) => {
  try {
    res.json({ message: 'Export endpoint ready', userId: req.user.uid })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
