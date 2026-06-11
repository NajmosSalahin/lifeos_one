import { Router } from 'express'
import { verifyToken } from '../middleware/auth.js'
import { adminDb } from '../config/firebase.js'

const router = Router()

const COLLECTIONS = ['moods', 'habits', 'sleep', 'hydration', 'journals', 'breathing', 'customDrinks', 'breathingTechniques']

router.get('/data', verifyToken, async (req, res) => {
  try {
    const uid = req.user.uid
    const result = {}

    for (const name of COLLECTIONS) {
      const snap = await adminDb.collection('users').doc(uid).collection(name).get()
      result[name] = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    }

    res.json({ uid, exportedAt: new Date().toISOString(), ...result })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
