import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { DEFAULT_HABITS, DEFAULT_DRINKS, DEFAULT_TECHNIQUES, DEFAULT_PROFILE } from '../utils/defaults'
import { applyTheme } from '../utils/themes'

const AuthContext = createContext(null)

function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
}

function mapProfileToCamel(row) {
  if (!row || typeof row !== 'object') return row
  const result = {}
  for (const [key, value] of Object.entries(row)) {
    result[snakeToCamel(key)] = value
  }
  return result
}

function camelToSnake(str) {
  return str.replace(/[A-Z]/g, c => '_' + c.toLowerCase())
}

function mapProfileToSnake(data) {
  if (!data || typeof data !== 'object') return data
  const result = {}
  for (const [key, value] of Object.entries(data)) {
    result[camelToSnake(key)] = value
  }
  return result
}

function mapUser(sessionUser) {
  if (!sessionUser) return null
  return {
    ...sessionUser,
    uid: sessionUser.id,
    displayName: sessionUser.user_metadata?.display_name || sessionUser.user_metadata?.full_name || sessionUser.email?.split('@')[0] || 'User'
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const u = mapUser(session?.user)
      setUser(u)
      if (u) await loadProfile(u.id)
      else setProfile(null)
      setLoading(false)
    })
    return () => subscription?.unsubscribe()
  }, [])

  async function loadProfile(uid) {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle()
    if (data && !error) {
      const camel = mapProfileToCamel(data)
      setProfile(camel)
      if (camel.theme) applyTheme(camel.theme)
    } else {
      await seedDefaults(uid)
    }
  }

  async function seedDefaults(uid) {
    const p = { ...DEFAULT_PROFILE }
    const profSnake = mapProfileToSnake({
      id: uid,
      displayName: user?.displayName || 'User',
      email: user?.email || '',
      ...p,
      createdAt: new Date().toISOString()
    })
    const { error } = await supabase.from('profiles').upsert(profSnake)
    if (error) throw error
    setProfile({ displayName: user?.displayName || 'User', email: user?.email || '', ...p })
    applyTheme(p.theme)

    const habits = DEFAULT_HABITS.map(h => ({
      user_id: uid, name: h.name, archived: false, done_dates: [], skipped_dates: [],
      weekly_goal: 0, freeze_limit: 0, created_at: new Date().toISOString()
    }))
    const drinks = DEFAULT_DRINKS.map(d => ({ user_id: uid, name: d.name, volume: d.volume, multiplier: d.multiplier, icon: d.icon }))
    const techniques = DEFAULT_TECHNIQUES.map(t => ({ user_id: uid, name: t.name, inhale: t.inhale, hold1: t.hold1, exhale: t.exhale, hold2: t.hold2 }))

    await Promise.all([
      supabase.from('habits').insert(habits),
      supabase.from('custom_drinks').insert(drinks),
      supabase.from('breathing_techniques').insert(techniques)
    ])
  }

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    await loadProfile(data.user.id)
    return data
  }

  async function register(email, password, displayName) {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { display_name: displayName } }
    })
    if (error) throw error
    await seedDefaults(data.user.id)
    return data
  }

  async function loginWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
    if (error) throw error
    return data
  }

  async function logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setProfile(null)
  }

  async function resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`
    })
    if (error) throw error
  }

  async function updateProfileField(fields) {
    if (!user) return
    const { error } = await supabase.from('profiles').update(mapProfileToSnake(fields)).eq('id', user.id)
    if (error) throw error
    setProfile(prev => ({ ...prev, ...fields }))
    if (fields.theme) applyTheme(fields.theme)
  }

  return (
    <AuthContext.Provider value={{ user, loading, profile, login, register, loginWithGoogle, logout, resetPassword, updateProfileField }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
