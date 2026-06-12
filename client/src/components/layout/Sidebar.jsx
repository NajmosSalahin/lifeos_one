import { Link, useLocation } from 'react-router-dom'
import { NAV_ICONS } from '../../utils/icons'

function SidebarNav({ isMobile, onClose }) {
  const location = useLocation()

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: NAV_ICONS.dashboard },
    { path: '/mood', label: 'Mood', icon: NAV_ICONS.mood },
    { path: '/habits', label: 'Habits', icon: NAV_ICONS.habits },
    { path: '/sleep', label: 'Sleep', icon: NAV_ICONS.sleep },
    { path: '/hydration', label: 'Hydrate', icon: NAV_ICONS.hydration },
    { path: '/breathing', label: 'Breathe', icon: NAV_ICONS.breathing },
    { path: '/journal', label: 'Journal', icon: NAV_ICONS.journal },
    { path: '/analytics', label: 'Analytics', icon: NAV_ICONS.analytics },
    { path: '/calendar', label: 'Calendar', icon: NAV_ICONS.calendar },
    { path: '/profile', label: 'Profile', icon: NAV_ICONS.profile },
    { path: '/settings', label: 'Settings', icon: NAV_ICONS.settings }
  ]

  return (
    <div className="flex flex-col h-full">
      <nav className="flex-1 px-2 space-y-0.5 pt-4">
        {navLinks.map(l => {
          const isActive = location.pathname === l.path
          const NavIcon = l.icon
          return (
            <Link key={l.path} to={l.path} onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors duration-200 ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted hover:text-app hover:bg-[var(--border)]/30'}`}
              title={!isMobile && !isActive ? l.label : undefined}>
              <NavIcon size={22} />
              {isMobile && <span>{l.label}</span>}
              {!isMobile && <span className="overflow-hidden whitespace-nowrap transition-all duration-500 delay-100 max-w-0 group-hover:max-w-[120px] opacity-0 group-hover:opacity-100">{l.label}</span>}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export default function Sidebar({ mobileOpen, onMobileClose }) {
  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={onMobileClose}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative bg-surface w-64 h-full shadow-xl" onClick={e => e.stopPropagation()}>
            <SidebarNav isMobile onClose={onMobileClose} />
          </div>
        </div>
      )}

      <aside className="hidden md:flex w-16 hover:w-52 group transition-all duration-300 ease-in-out shrink-0 flex-col bg-surface border-r border-app z-30 min-h-0 overflow-hidden">
        <SidebarNav />
      </aside>
    </>
  )
}
