import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { IconEdit, IconSettings, IconLogout } from '../../utils/icons'

export default function ProfileMenu({ onClose }) {
  const { user, logout } = useAuth()
  const initials = (user?.displayName || user?.email || 'U').split(' ').map(s => s[0]).join('').toUpperCase().slice(0, 2)

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute top-full right-4 mt-1 z-50 bg-surface border border-app rounded-2xl shadow-xl overflow-hidden min-w-[200px]" onClick={e => e.stopPropagation()}>
        <div className="p-4 text-center">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary text-base font-bold flex items-center justify-center mx-auto mb-2 font-mono">
            {initials}
          </div>
          <p className="text-app font-semibold text-sm">{user?.displayName || 'User'}</p>
          <p className="text-muted text-xs mt-0.5 truncate">{user?.email}</p>
        </div>
        <div className="px-2 pb-2 space-y-0.5">
          <Link to="/profile" onClick={onClose} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-muted hover:text-app hover:bg-[var(--border)]/30 transition text-sm no-underline">
            <IconEdit size={16} />
            Profile
          </Link>
          <Link to="/settings" onClick={onClose} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-muted hover:text-app hover:bg-[var(--border)]/30 transition text-sm no-underline">
            <IconSettings size={16} />
            Settings
          </Link>
          <div className="border-t border-app my-1" />
          <button onClick={() => { logout(); onClose() }} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-muted hover:text-red-500 hover:bg-red-500/10 transition text-sm">
            <IconLogout size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </>
  )
}
