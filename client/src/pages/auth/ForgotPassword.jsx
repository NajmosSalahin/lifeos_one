import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try { await resetPassword(email); setSent(true) }
    catch (err) { setError(err.message.replace('Firebase: ', '').replace(/\(.*\)/, '')) }
  }

  if (sent) return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-surface rounded-xl border border-app p-8 w-full max-w-md text-center">
        <p className="text-green-400 text-lg font-bold mb-2">✓ Email Sent</p>
        <p className="text-muted text-sm mb-4">Check your inbox for password reset instructions.</p>
        <Link to="/login" className="text-primary hover:underline">Back to Login</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-surface rounded-xl border border-app p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-app mb-6 text-center">Reset Password</h1>
        {error && <p className="text-red-400 text-sm mb-4 bg-red-500/10 p-3 rounded-lg">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-2.5 rounded-lg bg-app border border-app text-app placeholder-muted focus:outline-none focus:border-primary transition" />
          <button type="submit" className="w-full py-2.5 rounded-lg bg-primary text-white font-bold hover:opacity-90 transition">Send Reset Link</button>
        </form>
        <p className="mt-4 text-center text-sm text-muted"><Link to="/login" className="text-primary hover:underline">Back to Login</Link></p>
      </div>
    </div>
  )
}
