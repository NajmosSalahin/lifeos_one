import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import ProfileMenu from './ProfileMenu'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [showProfile, setShowProfile] = useState(false)
  const [showMobile, setShowMobile] = useState(false)
  const isLanding = location.pathname === '/'

  if (isLanding && !user) return null

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/mood', label: 'Mood', icon: '😊' },
    { path: '/habits', label: 'Habits', icon: '✅' },
    { path: '/sleep', label: 'Sleep', icon: '💤' },
    { path: '/hydration', label: 'Hydration', icon: '💧' },
    { path: '/breathing', label: 'Breathe', icon: '🌬️' },
    { path: '/journal', label: 'Journal', icon: '📝' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
    { path: '/calendar', label: 'Calendar', icon: '📅' },
    { path: '/settings', label: 'Settings', icon: '⚙️' }
  ]

  return (
    <nav className="bg-surface border-b border-app px-4 py-2 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="text-app font-bold text-lg">Zenith Tracker</Link>
      </div>
      <div className="hidden md:flex items-center gap-1 overflow-x-auto">
        {navLinks.map(l => (
          <Link key={l.path} to={l.path} className={`px-2 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${location.pathname === l.path ? 'bg-primary text-white' : 'text-muted hover:text-app hover:bg-surface'}`}>
            {l.icon} {l.label}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-2">
        {user && (
          <button onClick={() => setShowProfile(!showProfile)} className="w-8 h-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center">
            {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
          </button>
        )}
        <button className="md:hidden text-app text-xl" onClick={() => setShowMobile(!showMobile)}>☰</button>
      </div>
      {showProfile && <ProfileMenu onClose={() => setShowProfile(false)} />}
      {showMobile && (
        <div className="fixed inset-0 z-50 bg-black/50 md:hidden" onClick={() => setShowMobile(false)}>
          <div className="bg-surface w-64 h-full p-4 overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-app">Menu</span>
              <button onClick={() => setShowMobile(false)} className="text-app text-xl">&times;</button>
            </div>
            {navLinks.map(l => (
              <Link key={l.path} to={l.path} onClick={() => setShowMobile(false)} className={`block px-3 py-2 rounded-lg mb-1 transition ${location.pathname === l.path ? 'bg-primary text-white' : 'text-app hover:bg-surface'}`}>
                {l.icon} {l.label}
              </Link>
            ))}
            <button onClick={() => { logout(); setShowMobile(false) }} className="w-full mt-4 px-3 py-2 rounded-lg text-red-400 hover:bg-surface transition text-left">🚪 Logout</button>
          </div>
        </div>
      )}
    </nav>
  )
}
