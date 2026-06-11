import { createContext, useContext, useState, useEffect } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail, updateProfile } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'
import { DEFAULT_HABITS, DEFAULT_DRINKS, DEFAULT_TECHNIQUES, DEFAULT_PROFILE } from '../utils/defaults'
import { applyTheme } from '../utils/themes'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) await loadProfile(u.uid)
      else setProfile(null)
      setLoading(false)
    })
    return unsub
  }, [])

  async function loadProfile(uid) {
    const ref = doc(db, 'users', uid)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      const data = snap.data()
      setProfile(data)
      if (data.theme) applyTheme(data.theme)
    } else {
      await seedDefaults(uid)
    }
  }

  async function seedDefaults(uid) {
    const p = { ...DEFAULT_PROFILE }
    const ref = doc(db, 'users', uid)
    await setDoc(ref, {
      displayName: user?.displayName || 'User',
      email: user?.email || '',
      ...p,
      createdAt: Date.now()
    })
    setProfile({ displayName: user?.displayName || 'User', email: user?.email || '', ...p })
    applyTheme(p.theme)
    // Seed subcollections
    const batch = []
    DEFAULT_HABITS.forEach(h => {
      const ref = doc(db, 'users', uid, 'habits', 'h' + Date.now() + Math.random())
      batch.push(setDoc(ref, { id: ref.id, name: h.name, archived: false, doneDates: [], skippedDates: [], createdAt: Date.now() }))
    })
    DEFAULT_DRINKS.forEach(d => {
      const ref = doc(db, 'users', uid, 'customDrinks', 'd' + Date.now() + Math.random())
      batch.push(setDoc(ref, { id: ref.id, ...d }))
    })
    DEFAULT_TECHNIQUES.forEach(t => {
      const ref = doc(db, 'users', uid, 'breathingTechniques', 't' + Date.now() + Math.random())
      batch.push(setDoc(ref, { id: ref.id, ...t }))
    })
    await Promise.all(batch)
  }

  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    await loadProfile(cred.user.uid)
    return cred
  }

  async function register(email, password, displayName) {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName })
    await seedDefaults(cred.user.uid)
    return cred
  }

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider()
    const cred = await signInWithPopup(auth, provider)
    await loadProfile(cred.user.uid)
    return cred
  }

  async function logout() {
    await signOut(auth)
    setProfile(null)
  }

  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email)
  }

  async function updateProfileField(fields) {
    if (!user) return
    const ref = doc(db, 'users', user.uid)
    await setDoc(ref, fields, { merge: true })
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
