import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { IconMood } from '../../utils/icons'
import Modal from '../../components/ui/Modal'

export default function Login() {
  const { login, loginWithGoogle } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try { await login(email, password) }
    catch (err) { setError(err.message.replace(/^\w+:\s*/, '').replace(/\(.*\)/, '')) }
    setLoading(false)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="card p-8 w-full max-w-sm">
        <div className="flex justify-center mb-4"><IconMood size={40} /></div>
        <h1 className="page-title text-center">Welcome Back</h1>
        {error && <p className="card-stat text-red-400 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Email</label>
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="form-input" />
          </div>
          <div>
            <label className="form-label">Password</label>
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="form-input" />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary w-full">Sign In</button>
        </form>
        <button onClick={loginWithGoogle} className="btn btn-secondary w-full mt-3">
          <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/><path fill="none" d="M1 1h22v22H1z"/></svg> Sign in with Google
        </button>
        <div className="mt-4 text-center text-sm text-muted">
          <Link to="/forgot-password" className="hover:text-primary transition">Forgot password?</Link>
          <span className="mx-2">·</span>
          <Link to="/register" className="hover:text-primary transition">Create account</Link>
        </div>
      </div>
    </div>
  )
}
