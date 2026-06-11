import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try { await register(email, password, name) }
    catch (err) { setError(err.message.replace('Firebase: ', '').replace(/\(.*\)/, '')) }
    setLoading(false)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-surface rounded-xl border border-app p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-app mb-6 text-center">Create Account</h1>
        {error && <p className="text-red-400 text-sm mb-4 bg-red-500/10 p-3 rounded-lg">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-2.5 rounded-lg bg-app border border-app text-app placeholder-muted focus:outline-none focus:border-primary transition" />
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-2.5 rounded-lg bg-app border border-app text-app placeholder-muted focus:outline-none focus:border-primary transition" />
          <input type="password" placeholder="Password (6+ chars)" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-2.5 rounded-lg bg-app border border-app text-app placeholder-muted focus:outline-none focus:border-primary transition" />
          <input type="password" placeholder="Confirm Password" value={confirm} onChange={e => setConfirm(e.target.value)} required className="w-full px-4 py-2.5 rounded-lg bg-app border border-app text-app placeholder-muted focus:outline-none focus:border-primary transition" />
          <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg bg-primary text-white font-bold hover:opacity-90 transition disabled:opacity-50">Create Account</button>
        </form>
        <p className="mt-4 text-center text-sm text-muted">Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link></p>
      </div>
    </div>
  )
}
