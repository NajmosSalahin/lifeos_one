import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Landing() {
  const { user } = useAuth()
  const features = [
    { icon: '😊', title: 'Mood Tracker', desc: 'Log your mood on a 10-point scale with notes and track patterns over time.' },
    { icon: '✅', title: 'Habit Tracker', desc: 'Build streaks with a 7-day grid. Add, rename, archive, or delete habits.' },
    { icon: '💤', title: 'Sleep Tracker', desc: 'Log night and nap sessions. Calculate sleep cycles and find ideal bedtimes.' },
    { icon: '💧', title: 'Hydration Tracker', desc: 'Smart goal based on your body. Quick-add drinks, 1-click templates, weather integration.' },
    { icon: '🌬️', title: 'Breathing Exercises', desc: 'Multiple techniques with an animated breathing circle and session timer.' },
    { icon: '📝', title: 'Journal', desc: 'Write multiple entries daily with titles and rich body text.' },
    { icon: '📈', title: 'Analytics', desc: 'Beautiful charts showing mood-sleep correlation, habit completion, and more.' },
    { icon: '📅', title: 'Calendar', desc: 'Visual month view with activity indicators and daily summaries.' },
    { icon: '🎨', title: '60+ Themes', desc: 'Dark, light, colorful, and earthy themes that transform the entire UI.' },
    { icon: '📤', title: 'Export & Import', desc: 'Export your data as CSV, Markdown, PDF, or JSON. Restore from backup.' }
  ]

  return (
    <div className="min-h-screen">
      <div className="text-center py-20 px-4">
        <h1 className="text-5xl font-bold text-app mb-4">Zenith Tracker</h1>
        <p className="text-xl text-muted max-w-lg mx-auto mb-8">Your complete wellness companion — track moods, habits, sleep, hydration, and more.</p>
        <Link to={user ? '/dashboard' : '/register'} className="inline-block px-8 py-3 rounded-xl bg-primary text-white font-bold text-lg hover:opacity-90 transition shadow-lg">
          {user ? 'Go to Dashboard' : 'Get Started Free'}
        </Link>
        {!user && (
          <p className="mt-3 text-sm text-muted">Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link></p>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto px-4 pb-16">
        {features.map(f => (
          <div key={f.title} className="bg-surface border border-app rounded-xl p-5 hover:border-primary/30 transition group">
            <span className="text-3xl mb-3 block">{f.icon}</span>
            <h3 className="font-bold text-app mb-1">{f.title}</h3>
            <p className="text-sm text-muted">{f.desc}</p>
          </div>
        ))}
      </div>
      <footer className="text-center py-6 text-xs text-muted border-t border-app">
        <p>Zenith Tracker <span className="text-primary">v1.0.0</span></p>
      </footer>
    </div>
  )
}
