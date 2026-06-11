import { useAuth } from '../../contexts/AuthContext'

export default function ProfileMenu({ onClose }) {
  const { user, profile, logout } = useAuth()
  const initials = (user?.displayName || user?.email || 'U').split(' ').map(s => s[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="absolute top-12 right-4 z-50 bg-surface border border-app rounded-xl shadow-2xl w-64" onClick={e => e.stopPropagation()}>
      <div className="p-4 text-center border-b border-app">
        <div className="w-12 h-12 rounded-full bg-primary text-white text-xl font-bold flex items-center justify-center mx-auto mb-2">
          {initials}
        </div>
        <p className="text-app font-bold">{user?.displayName || 'User'}</p>
        <p className="text-muted text-xs">{user?.email}</p>
      </div>
      <div className="p-2">
        <button onClick={() => { logout(); onClose() }} className="w-full px-3 py-2 rounded-lg text-red-400 hover:bg-surface transition text-left text-sm">🚪 Sign Out</button>
      </div>
    </div>
  )
}
