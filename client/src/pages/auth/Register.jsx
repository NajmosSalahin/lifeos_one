import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { IconMood } from '../../utils/icons'

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
    catch (err) { setError(err.message.replace(/^\w+:\s*/, '').replace(/\(.*\)/, '')) }
    setLoading(false)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="card p-8 w-full max-w-sm">
        <div className="flex justify-center mb-4"><IconMood size={40} /></div>
        <h1 className="page-title text-center">Create Account</h1>
        {error && <p className="card-stat text-red-400 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Full Name</label>
            <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required className="form-input" />
          </div>
          <div>
            <label className="form-label">Email</label>
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="form-input" />
          </div>
          <div>
            <label className="form-label">Password</label>
            <input type="password" placeholder="Password (6+ chars)" value={password} onChange={e => setPassword(e.target.value)} required className="form-input" />
          </div>
          <div>
            <label className="form-label">Confirm Password</label>
            <input type="password" placeholder="Confirm Password" value={confirm} onChange={e => setConfirm(e.target.value)} required className="form-input" />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary w-full">Create Account</button>
        </form>
        <p className="mt-4 text-center text-sm text-muted">Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link></p>
      </div>
    </div>
  )
}
