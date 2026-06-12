import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { applyTheme } from '../utils/themes'
import { IconMood, IconHabits, IconSleep, IconHydration, IconBreathing, IconJournal, IconAnalytics, IconCalendar, IconTheme, IconExport } from '../utils/icons'

export default function Landing() {
  const { user } = useAuth()

  useEffect(() => {
    applyTheme('Tokyo Night')
    return () => {
      const root = document.documentElement
      ;['--bg', '--surface', '--border', '--text-main', '--text-muted', '--primary']
        .forEach(p => root.style.removeProperty(p))
    }
  }, [])

  const features = [
    { icon: IconMood, title: 'Mood Tracker', desc: 'Log your mood on a 10-point scale with notes and track patterns over time.' },
    { icon: IconHabits, title: 'Habit Tracker', desc: 'Build streaks with a 7-day grid. Add, rename, archive, or delete habits.' },
    { icon: IconSleep, title: 'Sleep Tracker', desc: 'Log night and nap sessions. Calculate sleep cycles and find ideal bedtimes.' },
    { icon: IconHydration, title: 'Hydration Tracker', desc: 'Smart goal based on your body. Quick-add drinks, 1-click templates, weather integration.' },
    { icon: IconBreathing, title: 'Breathing Exercises', desc: 'Multiple techniques with an animated breathing circle and session timer.' },
    { icon: IconJournal, title: 'Journal', desc: 'Write multiple entries daily with titles and rich body text.' },
    { icon: IconAnalytics, title: 'Analytics', desc: 'Beautiful charts showing mood-sleep correlation, habit completion, and more.' },
    { icon: IconCalendar, title: 'Calendar', desc: 'Visual month view with activity indicators and daily summaries.' },
    { icon: IconTheme, title: '75+ Themes', desc: 'Dark, light, colorful, earthy, and studio themes that transform the entire UI.' },
    { icon: IconExport, title: 'Export & Import', desc: 'Export your data as CSV, Markdown, PDF, or JSON. Restore from backup.' }
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% -10%, rgba(122, 162, 247, 0.15) 0%, transparent 60%)' }} />
      <div className="relative z-10">
        <div className="text-center py-24 px-4 max-w-2xl mx-auto">
          <h1 className="font-display text-5xl text-app mb-4 leading-tight">Zenith Tracker</h1>
          <p className="text-muted text-lg max-w-lg mx-auto mb-10 leading-relaxed">Your complete wellness companion — track moods, habits, sleep, hydration, and more in one place.</p>
          <Link to={user ? '/dashboard' : '/register'} className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-white font-semibold text-base hover:opacity-90 transition shadow-sm">
            {user ? 'Go to Dashboard' : 'Get Started Free'}
          </Link>
          {!user && (
            <p className="mt-4 text-sm text-muted">Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link></p>
          )}
        </div>
        <div className="max-w-5xl mx-auto px-4 pb-24">
          <div className="section-header">
            <h2>Everything you need</h2>
            <span className="rule" />
            <span className="stamp">{features.length} modules</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 stagger">
            {features.map(f => {
              const FeatureIcon = f.icon
              return (
                <div key={f.title} className="card-glass">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                    <FeatureIcon size={18} />
                  </div>
                  <h3 className="font-display text-base text-app mb-1.5">{f.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
        <footer className="glass-footer">
          <p className="text-xs text-muted py-6 text-center">Zenith Tracker <span className="font-mono text-primary">v1.0.0</span></p>
        </footer>
      </div>
    </div>
  )
}
