import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/ui/Toast'

export default function Profile() {
  const { user, profile, updateProfileField } = useAuth()
  const toast = useToast()

  const initials = (user?.displayName || user?.email || 'U')
    .split(' ').map(s => s[0]).join('').toUpperCase().slice(0, 2)

  const [fields, setFields] = useState({
    displayName: '', weight: 65, height: 170
  })

  useEffect(() => {
    if (profile) {
      setFields({
        displayName: profile.displayName || '',
        weight: profile.weight ?? 65,
        height: profile.height ?? 170
      })
    }
  }, [profile])

  async function handleSave() {
    try {
      await updateProfileField(fields)
      toast('Profile saved')
    } catch {
      toast('Failed to save profile', 'error')
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="page-title">Profile</h1>
      <div className="card-panel max-w-xl">
        <div className="section-header mb-4">
          <h2>Personal Info</h2>
          <span className="rule" />
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary text-xl font-bold flex items-center justify-center font-mono shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-app font-semibold">{user?.displayName || 'User'}</p>
            <p className="text-muted text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="form-label">Display Name</label>
            <input type="text" value={fields.displayName} onChange={e => setFields(p => ({ ...p, displayName: e.target.value }))} className="form-input" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Weight (kg)</label>
              <input type="number" min="20" max="300" value={fields.weight} onChange={e => setFields(p => ({ ...p, weight: Number(e.target.value) }))} className="form-input" />
            </div>
            <div>
              <label className="form-label">Height (cm)</label>
              <input type="number" min="50" max="300" value={fields.height} onChange={e => setFields(p => ({ ...p, height: Number(e.target.value) }))} className="form-input" />
            </div>
          </div>

          <button onClick={handleSave} className="btn btn-primary w-full">Save Profile</button>
        </div>
      </div>
    </div>
  )
}
