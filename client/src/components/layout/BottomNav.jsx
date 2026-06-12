import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { NAV_ICONS } from '../../utils/icons'

export default function BottomNav() {
  const location = useLocation()
  const { user } = useAuth()

  const links = [
    { path: '/dashboard', label: 'Home', icon: NAV_ICONS.dashboard },
    { path: '/mood', label: 'Mood', icon: NAV_ICONS.mood },
    { path: '/habits', label: 'Habits', icon: NAV_ICONS.habits },
    { path: '/sleep', label: 'Sleep', icon: NAV_ICONS.sleep },
    { path: '/journal', label: 'Journal', icon: NAV_ICONS.journal },
    { path: '/settings', label: 'More', icon: NAV_ICONS.settings },
  ]

  if (!user) return null

  return (
    <nav className="md:hidden bg-surface border-t border-app px-2 py-1 flex items-center justify-around shrink-0">
      {links.map(l => {
        const isActive = location.pathname === l.path
        const Icon = l.icon
        return (
          <Link key={l.path} to={l.path}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] transition ${isActive ? 'text-primary' : 'text-muted hover:text-app'}`}>
            <Icon size={18} />
            <span>{l.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
