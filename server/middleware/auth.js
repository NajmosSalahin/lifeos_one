import { supabaseAdmin } from '../config/supabase.js'

export async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  try {
    const token = authHeader.split('Bearer ')[1]
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
    if (error || !user) throw new Error('Invalid token')
    req.user = { uid: user.id, ...user }
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}
