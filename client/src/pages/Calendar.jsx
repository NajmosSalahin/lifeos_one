import { useState } from 'react'
import { useCollection } from '../hooks/useFirestore'
import { getDaysInMonth, getFirstDayOfMonth, toISODate, formatDate, formatMinutes } from '../utils/helpers'
import { LoadingSpinner } from '../components/ui/Loaders'
import Modal, { useModal } from '../components/ui/Modal'

export default function Calendar() {
  const { data: moods, loading: mLoad } = useCollection('moods')
  const { data: habits, loading: hLoad } = useCollection('habits')
  const { data: sleepLogs, loading: sLoad } = useCollection('sleep')
  const { data: hydrations, loading: dLoad } = useCollection('hydration')
  const { data: breathing, loading: bLoad } = useCollection('breathing')
  const { data: journals, loading: jLoad } = useCollection('journals')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [detailDate, setDetailDate] = useState(null)
  const detailModal = useModal()

  if (mLoad || hLoad || sLoad || dLoad || bLoad || jLoad) return <LoadingSpinner />

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const todayStr = toISODate(new Date())

  function changeMonth(delta) {
    const d = new Date(currentDate)
    d.setMonth(d.getMonth() + delta)
    setCurrentDate(d)
  }

  function getMoodColor(dateStr) {
    const dayMoods = moods?.filter(m => m.date === dateStr) || []
    if (!dayMoods.length) return null
    const avg = dayMoods.reduce((s, m) => s + m.value, 0) / dayMoods.length
    if (avg <= 3) return 'red'
    if (avg <= 6) return 'yellow'
    return 'green'
  }

  function getActivityDots(dateStr) {
    const dots = []
    if (journals?.some(j => j.date === dateStr)) dots.push('bg-blue-400')
    if (sleepLogs?.some(s => s.date === dateStr)) dots.push('bg-purple-400')
    if (breathing?.some(b => b.date === dateStr)) dots.push('bg-emerald-400')
    return dots
  }

  function openDayDetail(dateStr) {
    setDetailDate(dateStr)
    detailModal.open()
  }

  function getDayDetail(dateStr) {
    const dayMoods = moods?.filter(m => m.date === dateStr) || []
    const avgMood = dayMoods.length ? (dayMoods.reduce((s, m) => s + m.value, 0) / dayMoods.length).toFixed(1) : null
    const daySleep = sleepLogs?.filter(s => s.date === dateStr) || []
    const totalSleepMins = daySleep.reduce((sum, s) => sum + (s.hours || 0) * 60 + (s.minutes || 0), 0)
    const dayHabits = habits?.filter(h => h.doneDates?.includes(dateStr)) || []
    const dayHydration = hydrations?.filter(h => h.date === dateStr) || []
    const totalHydration = dayHydration.reduce((sum, h) => sum + h.volume * h.multiplier, 0)
    const dayBreathing = breathing?.filter(b => b.date === dateStr) || []
    const totalBreathSecs = dayBreathing.reduce((sum, b) => sum + (b.durationSeconds || 0), 0)
    const dayJournals = journals?.filter(j => j.date === dateStr) || []
    return { avgMood, dayHabits, totalSleepMins, totalHydration, totalBreathSecs, dayJournals }
  }

  const monthLabel = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-app">Calendar</h1>
      <div className="bg-surface border border-app rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => changeMonth(-1)} className="text-app hover:text-primary text-xl px-2">◀</button>
          <h2 className="text-lg font-bold text-app">{monthLabel}</h2>
          <button onClick={() => changeMonth(1)} className="text-app hover:text-primary text-xl px-2">▶</button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {days.map(d => <p key={d} className="text-center text-xs text-muted font-bold py-1">{d}</p>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1
            const dateObj = new Date(year, month, day)
            const dateStr = toISODate(dateObj)
            const isT = dateStr === todayStr
            const moodColor = getMoodColor(dateStr)
            const dots = getActivityDots(dateStr)
            let cls = 'aspect-square rounded-lg text-xs font-bold flex flex-col items-center justify-center transition border '
            if (isT) cls += 'bg-primary text-white border-primary shadow-md '
            else if (moodColor === 'red') cls += 'bg-red-500/15 text-red-400 border-red-500/30 '
            else if (moodColor === 'yellow') cls += 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30 '
            else if (moodColor === 'green') cls += 'bg-green-500/15 text-green-400 border-green-500/30 '
            else cls += 'bg-app text-app border-app hover:scale-[1.02] '
            return (
              <button key={day} className={cls} onClick={() => openDayDetail(dateStr)}>
                <span>{day}</span>
                {dots.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {dots.map((c, j) => <span key={j} className={`w-1 h-1 rounded-full ${c}`}></span>)}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
      <Modal isOpen={detailModal.isOpen} onClose={detailModal.close} title={detailDate ? formatDate(detailDate) : ''}>
        {detailDate && (() => {
          const d = getDayDetail(detailDate)
          return (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted">Mood Avg</span><span className="text-app font-bold">{d.avgMood ? `${d.avgMood}/10` : 'None'}</span></div>
              <div className="flex justify-between"><span className="text-muted">Habits Done</span><span className="text-app font-bold">{d.dayHabits.length > 0 ? `${d.dayHabits.length} — ${d.dayHabits.map(h => h.name).join(', ')}` : 'None'}</span></div>
              <div className="flex justify-between"><span className="text-muted">Sleep Logged</span><span className="text-app font-bold">{d.totalSleepMins > 0 ? formatMinutes(d.totalSleepMins) : 'None'}</span></div>
              <div className="flex justify-between"><span className="text-muted">Hydration</span><span className="text-app font-bold">{d.totalHydration > 0 ? `${Math.round(d.totalHydration)}ml` : 'None'}</span></div>
              <div className="flex justify-between"><span className="text-muted">Mindful Time</span><span className="text-app font-bold">{d.totalBreathSecs > 0 ? `${Math.round(d.totalBreathSecs / 60)}m` : 'None'}</span></div>
              {d.dayJournals.length > 0 && (
                <div>
                  <p className="text-muted mb-1">Journals:</p>
                  {d.dayJournals.map(j => <p key={j.id} className="text-app font-bold">• {j.title || 'Untitled Entry'}</p>)}
                </div>
              )}
            </div>
          )
        })()}
      </Modal>
    </div>
  )
}
