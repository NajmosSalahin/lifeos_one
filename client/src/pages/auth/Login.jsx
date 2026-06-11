import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
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
    catch (err) { setError(err.message.replace('Firebase: ', '').replace(/\(.*\)/, '')) }
    setLoading(false)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-surface rounded-xl border border-app p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-app mb-6 text-center">Welcome Back</h1>
        {error && <p className="text-red-400 text-sm mb-4 bg-red-500/10 p-3 rounded-lg">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-2.5 rounded-lg bg-app border border-app text-app placeholder-muted focus:outline-none focus:border-primary transition" />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-2.5 rounded-lg bg-app border border-app text-app placeholder-muted focus:outline-none focus:border-primary transition" />
          <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg bg-primary text-white font-bold hover:opacity-90 transition disabled:opacity-50">Sign In</button>
        </form>
        <button onClick={loginWithGoogle} className="w-full mt-3 py-2.5 rounded-lg border border-app text-app hover:bg-app transition flex items-center justify-center gap-2">
          <span>🔵</span> Sign in with Google
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
