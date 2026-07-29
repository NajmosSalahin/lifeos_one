import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { IconMood, IconCheck } from '../../utils/icons'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try { await resetPassword(email); setSent(true) }
    catch (err) { setError(err.message.replace(/^\w+:\s*/, '').replace(/\(.*\)/, '')) }
  }

  if (sent) return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="card p-8 w-full max-w-sm text-center">
        <div className="flex justify-center mb-4"><IconCheck size={40} className="text-green-400" /></div>
        <p className="text-green-400 text-lg font-bold mb-2">Email Sent</p>
        <p className="text-muted text-sm mb-4">Check your inbox for password reset instructions.</p>
        <Link to="/login" className="text-primary hover:underline">Back to Login</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="card p-8 w-full max-w-sm">
        <div className="flex justify-center mb-4"><IconMood size={40} /></div>
        <h1 className="page-title text-center">Reset Password</h1>
        {error && <p className="card-stat text-red-400 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Email</label>
            <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required className="form-input" />
          </div>
          <button type="submit" className="btn btn-primary w-full">Send Reset Link</button>
        </form>
        <p className="mt-4 text-center text-sm text-muted"><Link to="/login" className="text-primary hover:underline">Back to Login</Link></p>
      </div>
    </div>
  )
}
