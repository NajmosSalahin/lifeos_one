import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import ProfileMenu from './ProfileMenu'
import { IconMenu } from '../../utils/icons'

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth()
  const [showProfile, setShowProfile] = useState(false)

  if (!user) return null

  return (
    <nav className="relative bg-surface border-b border-app px-4 py-2 flex items-center justify-between shrink-0">
      <Link to="/dashboard" className="font-display text-lg text-app no-underline">Zenith Tracker</Link>
      <div className="flex items-center gap-2">
        <button onClick={() => setShowProfile(!showProfile)}
          className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center hover:scale-110 transition-transform duration-150">
          {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
        </button>
        <button className="md:hidden text-muted hover:text-app transition p-1" onClick={onMenuClick}>
          <IconMenu size={22} />
        </button>
      </div>
      {showProfile && <ProfileMenu onClose={() => setShowProfile(false)} />}
    </nav>
  )
}
