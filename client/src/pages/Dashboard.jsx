import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCollection, useTodayCollection } from '../hooks/useFirestore'
import { todayStr, getWeekDates } from '../utils/helpers'
import { moodEmoji } from '../utils/calculations'
import { LoadingSpinner } from '../components/ui/Loaders'
import MoodTrendChart from '../components/charts/MoodTrendChart'
import { NAV_ICONS } from '../utils/icons'

export default function Dashboard() {
  const { data: moods, loading: mLoad } = useCollection('moods')
  const habitsColl = useCollection('habits')
  const { data: sleepLogs, loading: sLoad } = useTodayCollection('sleep')
  const { data: hydrations, loading: hLoad } = useTodayCollection('hydration')
  const { data: journals, loading: jLoad } = useTodayCollection('journals')
  const [activeHabits, setActiveHabits] = useState([])
  const { data: allHabits } = habitsColl

  useEffect(() => {
    if (allHabits) setActiveHabits(allHabits.filter(h => !h.archived))
  }, [allHabits])

  const latestMood = moods?.filter(m => m.date === todayStr()).sort((a, b) => b.timestamp - a.timestamp)[0]
  const doneToday = activeHabits.filter(h => h.doneDates?.includes(todayStr())).length
  const totalActive = activeHabits.length

  const nightSleep = sleepLogs?.filter(s => s.type === 'night') || []
  const totalNightMins = nightSleep.reduce((sum, s) => sum + (s.hours || 0) * 60 + (s.minutes || 0), 0)
  const sleepDisplay = totalNightMins > 0 ? `${Math.floor(totalNightMins / 60)}h ${totalNightMins % 60}m` : '—'

  const todayHydration = hydrations?.reduce((sum, h) => sum + (h.volume || 0) * (h.multiplier || 1), 0) || 0

  const weekDates = getWeekDates()
  const weekMoods = weekDates.map(date => {
    const dayMoods = moods?.filter(m => m.date === date) || []
    return dayMoods.length ? dayMoods.reduce((s, m) => s + m.value, 0) / dayMoods.length : null
  })

  async function setHabitStatus(id, status) {
    const h = allHabits.find(x => x.id === id)
    if (!h) return
    let doneDates = [...(h.doneDates || [])]
    let skippedDates = [...(h.skippedDates || [])]
    const today = todayStr()
    doneDates = doneDates.filter(d => d !== today)
    skippedDates = skippedDates.filter(d => d !== today)
    if (status === 'done') doneDates.push(today)
    else if (status === 'skip') skippedDates.push(today)
    await habitsColl.update(id, { doneDates, skippedDates })
  }

  const todayJournals = [...(journals || [])].sort((a, b) => b.timestamp - a.timestamp)

  if (mLoad && sLoad && hLoad && jLoad && habitsColl.loading) return <LoadingSpinner />

  return (
    <div className="space-y-5">
      <div className="section-header">
        <h2>Today's Report</h2>
        <span className="rule" />
        <span className="stamp">{new Date().toLocaleDateString('en', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger">
        <div className="card-stat">
          <p className="stat-label">Mood</p>
          <p className="stat-value mt-1">{latestMood ? `${latestMood.value}/10` : '—'}</p>
        </div>
        <div className="card-stat">
          <p className="stat-label">Habits</p>
          <p className="stat-value mt-1">{doneToday}<span className="text-sm font-mono text-muted">/{totalActive}</span></p>
        </div>
        <div className="card-stat">
          <p className="stat-label">Hydration</p>
          <p className="stat-value mt-1">{todayHydration > 0 ? `${todayHydration}` : '—'}</p>
          <p className="text-[0.65rem] text-muted font-mono mt-0.5">ml today</p>
        </div>
        <div className="card-stat">
          <p className="stat-label">Sleep</p>
          <p className="stat-value mt-1 font-mono" style={{ fontSize: '1.15rem' }}>{sleepDisplay}</p>
        </div>
      </div>
      <div className="card-panel">
        <div className="section-header mb-0">
          <h2>Action Panel</h2>
          <span className="rule" />
          <Link to="/habits" className="stamp hover:text-primary transition">Manage All</Link>
        </div>
        <div className="mt-4 space-y-1">
          {activeHabits.length === 0 && <p className="text-muted text-sm italic py-2">No active habits.</p>}
          {activeHabits.map(h => {
            const done = h.doneDates?.includes(todayStr())
            const skipped = h.skippedDates?.includes(todayStr())
            return (
              <div key={h.id} className={`flex items-center justify-between py-2.5 px-3 rounded-xl transition ${done ? 'bg-primary/5' : ''}`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${done ? 'bg-primary' : skipped ? 'bg-muted/40' : 'bg-muted/20'}`} />
                  <span className={`text-sm truncate ${done ? 'line-through text-muted' : skipped ? 'text-muted' : 'text-app'}`}>{h.name}</span>
                  {skipped && <span className="text-[0.65rem] text-muted font-mono shrink-0">skipped</span>}
                </div>
                <div className="flex gap-1 shrink-0">
                  {done ? (
                    <button onClick={() => setHabitStatus(h.id, 'none')} className="btn btn-ghost btn-sm text-xs">Undo</button>
                  ) : skipped ? (
                    <button onClick={() => setHabitStatus(h.id, 'none')} className="btn btn-ghost btn-sm text-xs">Undo</button>
                  ) : (
                    <>
                      <button onClick={() => setHabitStatus(h.id, 'done')} className="btn btn-ghost btn-sm text-xs text-green-600 hover:text-green-700">✓&nbsp;Done</button>
                      <button onClick={() => setHabitStatus(h.id, 'skip')} className="btn btn-ghost btn-sm text-xs">–&nbsp;Skip</button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card-panel">
          <div className="section-header mb-0">
            <h2>Today's Journal</h2>
            <span className="rule" />
            <Link to="/journal" className="stamp hover:text-primary transition">+ New</Link>
          </div>
          <div className="mt-4">
            {todayJournals.length === 0 ? (
              <p className="text-muted text-sm italic py-2">No entries today.</p>
            ) : todayJournals.slice(0, 3).map(j => (
              <div key={j.id} className="card-list-item first:pt-0 last:pb-0">
                <p className="text-sm font-medium text-app truncate">{j.title || 'Untitled'}</p>
                <p className="text-xs text-muted line-clamp-2 mt-0.5 leading-relaxed">{j.body}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="card-panel">
          <div className="section-header mb-0">
            <h2>Mood Trend</h2>
            <span className="rule" />
            <span className="stamp">7 days</span>
          </div>
          <div className="mt-4" style={{ height: 180 }}>
            <MoodTrendChart data={weekMoods} labels={weekDates.map(d => new Date(d + 'T12:00:00').toLocaleDateString('en', { weekday: 'short' }))} />
          </div>
        </div>
      </div>
    </div>
  )
}
