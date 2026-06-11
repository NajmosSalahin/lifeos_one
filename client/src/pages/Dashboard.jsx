import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCollection, useTodayCollection } from '../hooks/useFirestore'
import { todayStr, getWeekDates } from '../utils/helpers'
import { moodEmoji } from '../utils/calculations'
import { LoadingSpinner } from '../components/ui/Loaders'
import MoodTrendChart from '../components/charts/MoodTrendChart'

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
  const sleepDisplay = totalNightMins > 0 ? `${Math.floor(totalNightMins / 60)}h ${totalNightMins % 60}m` : '-'

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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-app">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-surface border border-app rounded-xl p-4">
          <p className="text-xs text-muted mb-1">Mood</p>
          <p className="text-xl font-bold text-app">{latestMood ? `${latestMood.value}/10` : '-'}</p>
        </div>
        <div className="bg-surface border border-app rounded-xl p-4">
          <p className="text-xs text-muted mb-1">Habits</p>
          <p className="text-xl font-bold text-app">{doneToday}/{totalActive}</p>
        </div>
        <div className="bg-surface border border-app rounded-xl p-4">
          <p className="text-xs text-muted mb-1">Hydration</p>
          <p className="text-xl font-bold text-app">{todayHydration > 0 ? `${todayHydration} ml` : '-'}</p>
        </div>
        <div className="bg-surface border border-app rounded-xl p-4">
          <p className="text-xs text-muted mb-1">Sleep</p>
          <p className="text-xl font-bold text-app">{sleepDisplay}</p>
        </div>
      </div>
      <div className="bg-surface border border-app rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-app">Action Panel</h2>
          <Link to="/habits" className="text-xs text-primary hover:underline">Manage All</Link>
        </div>
        <div className="space-y-2">
          {activeHabits.length === 0 && <p className="text-muted text-sm italic">No active habits.</p>}
          {activeHabits.map(h => {
            const done = h.doneDates?.includes(todayStr())
            const skipped = h.skippedDates?.includes(todayStr())
            return (
              <div key={h.id} className={`flex items-center justify-between p-3 rounded-lg border border-app transition ${done ? 'bg-primary/10 border-primary/30' : skipped ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-2">
                  {done ? <span className="text-primary text-lg">✅</span> : skipped ? <span className="text-muted text-lg">➖</span> : <span className="text-muted text-lg">⭕</span>}
                  <span className={`text-sm ${done ? 'line-through text-app/70' : skipped ? 'text-muted' : 'text-app'}`}>{h.name}</span>
                  {skipped && <span className="text-xs text-muted">(Skipped)</span>}
                </div>
                <div className="flex gap-1">
                  {done ? (
                    <button onClick={() => setHabitStatus(h.id, 'none')} className="text-xs text-primary hover:underline">Undo</button>
                  ) : skipped ? (
                    <button onClick={() => setHabitStatus(h.id, 'none')} className="text-xs text-primary hover:underline">Undo</button>
                  ) : (
                    <>
                      <button onClick={() => setHabitStatus(h.id, 'done')} className="text-xs text-green-400 hover:underline">✓ Done</button>
                      <button onClick={() => setHabitStatus(h.id, 'skip')} className="text-xs text-muted hover:underline">− Skip</button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-app rounded-xl p-4">
          <h2 className="font-bold text-app mb-3">Today's Journals</h2>
          {todayJournals.length === 0 ? (
            <p className="text-muted text-sm italic">No journals today.</p>
          ) : todayJournals.map(j => (
            <div key={j.id} className="mb-3 border-l-2 border-primary pl-3">
              <p className="text-sm font-bold text-app truncate">{j.title || 'Untitled Entry'}</p>
              <p className="text-xs text-muted line-clamp-3">{j.body}</p>
            </div>
          ))}
          <Link to="/journal" className="text-xs text-primary hover:underline mt-2 inline-block">+ New Entry</Link>
        </div>
        <div className="bg-surface border border-app rounded-xl p-4">
          <h2 className="font-bold text-app mb-3">Weekly Mood Trend</h2>
          <MoodTrendChart data={weekMoods} labels={weekDates.map(d => new Date(d + 'T12:00:00').toLocaleDateString('en', { weekday: 'short' }))} />
        </div>
      </div>
    </div>
  )
}
