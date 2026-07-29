import { Router } from 'express'
import { verifyToken } from '../middleware/auth.js'
import { supabaseAdmin } from '../config/supabase.js'

const router = Router()

const TABLE_MAP = {
  customDrinks: 'custom_drinks',
  breathingTechniques: 'breathing_techniques'
}

const TABLES = ['moods', 'habits', 'sleep', 'hydration', 'journals', 'breathing', 'customDrinks', 'breathingTechniques']

router.get('/data', verifyToken, async (req, res) => {
  try {
    const uid = req.user.uid
    const result = {}

    for (const name of TABLES) {
      const t = TABLE_MAP[name] || name
      const { data, error } = await supabaseAdmin
        .from(t)
        .select('*')
        .eq('user_id', uid)
      if (error) throw error
      result[name] = data || []
    }

    res.json({ uid, exportedAt: new Date().toISOString(), ...result })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
