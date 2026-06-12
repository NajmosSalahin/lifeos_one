import { useState } from 'react'
import { useCollection } from '../hooks/useFirestore'
import { getDaysInMonth, getFirstDayOfMonth, toISODate, formatDate, formatMinutes } from '../utils/helpers'
import { LoadingSpinner } from '../components/ui/Loaders'
import Modal, { useModal } from '../components/ui/Modal'
import { IconChevronLeft, IconChevronRight } from '../utils/icons'

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

  function getMoodValue(dateStr) {
    const dayMoods = moods?.filter(m => m.date === dateStr) || []
    if (!dayMoods.length) return null
    return Math.round(dayMoods.reduce((s, m) => s + m.value, 0) / dayMoods.length)
  }

  function getActivityDots(dateStr) {
    const dots = []
    if (journals?.some(j => j.date === dateStr)) dots.push('bg-blue-400')
    if (sleepLogs?.some(s => s.date === dateStr)) dots.push('bg-purple-400')
    if (breathing?.some(b => b.date === dateStr)) dots.push('bg-emerald-400')
    if (habits?.some(h => h.doneDates?.includes(dateStr))) dots.push('bg-orange-400')
    if (hydrations?.some(h => h.date === dateStr)) dots.push('bg-cyan-400')
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
    <div className="page-enter space-y-5">
      <h1 className="page-title">Calendar</h1>
      <div className="card-panel">
        <div className="section-header mb-3">
          <button onClick={() => changeMonth(-1)} className="btn-icon"><IconChevronLeft size={18} /></button>
          <h2 className="font-display text-lg text-app flex-1 text-center">{monthLabel}</h2>
          <button onClick={() => changeMonth(1)} className="btn-icon"><IconChevronRight size={18} /></button>
          <span className="stamp">{year}</span>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {days.map(d => <p key={d} className="text-center data-stamp font-bold py-1">{d}</p>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1
            const dateObj = new Date(year, month, day)
            const dateStr = toISODate(dateObj)
            const isT = dateStr === todayStr
            const moodColor = getMoodColor(dateStr)
            const moodVal = getMoodValue(dateStr)
            const dots = getActivityDots(dateStr)
            let cls = 'h-14 rounded-lg text-xs font-bold flex flex-col items-center justify-center transition border cursor-pointer '
            if (isT) cls += 'bg-primary text-white border-primary shadow-md '
            else if (moodColor === 'red') cls += 'bg-red-500/15 text-red-400 border-red-500/30 '
            else if (moodColor === 'yellow') cls += 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30 '
            else if (moodColor === 'green') cls += 'bg-green-500/15 text-green-400 border-green-500/30 '
            else cls += 'bg-app text-app border-app hover:scale-[1.02] '
            return (
              <button key={day} className={cls} onClick={() => openDayDetail(dateStr)}>
                <span className="leading-none">{day}</span>
                {moodVal && <span className="text-[9px] opacity-70 leading-none mt-0.5">{moodVal}</span>}
                {dots.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {dots.map((c, j) => <span key={j} className={`w-1 h-1 rounded-full ${c}`}></span>)}
                  </div>
                )}
              </button>
            )
          })}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 text-[10px] text-muted items-center">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400"></span> Journal</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400"></span> Sleep</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Breathe</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400"></span> Habits</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400"></span> Hydrate</span>
        </div>
      </div>
      <Modal isOpen={detailModal.isOpen} onClose={detailModal.close} title={detailDate ? formatDate(detailDate) : ''}>
        {detailDate && (() => {
          const d = getDayDetail(detailDate)
          return (
            <div className="space-y-1">
              <div className="card-list-item flex justify-between">
                <span className="text-muted text-sm">Mood Avg</span>
                <span className="font-mono font-bold text-sm">{d.avgMood ? `${d.avgMood}/10` : 'None'}</span>
              </div>
              <div className="card-list-item flex justify-between">
                <span className="text-muted text-sm">Habits Done</span>
                <span className="font-mono font-bold text-sm">{d.dayHabits.length > 0 ? `${d.dayHabits.length} \u2014 ${d.dayHabits.map(h => h.name).join(', ')}` : 'None'}</span>
              </div>
              <div className="card-list-item flex justify-between">
                <span className="text-muted text-sm">Sleep Logged</span>
                <span className="font-mono font-bold text-sm">{d.totalSleepMins > 0 ? formatMinutes(d.totalSleepMins) : 'None'}</span>
              </div>
              <div className="card-list-item flex justify-between">
                <span className="text-muted text-sm">Hydration</span>
                <span className="font-mono font-bold text-sm">{d.totalHydration > 0 ? `${Math.round(d.totalHydration)}ml` : 'None'}</span>
              </div>
              <div className="card-list-item flex justify-between">
                <span className="text-muted text-sm">Mindful Time</span>
                <span className="font-mono font-bold text-sm">{d.totalBreathSecs > 0 ? `${Math.round(d.totalBreathSecs / 60)}m` : 'None'}</span>
              </div>
              {d.dayJournals.length > 0 && (
                <div className="pt-3">
                  <p className="text-muted text-sm mb-1">Journals:</p>
                  {d.dayJournals.map(j => <p key={j.id} className="text-app font-bold text-sm">\u2022 {j.title || 'Untitled Entry'}</p>)}
                </div>
              )}
            </div>
          )
        })()}
      </Modal>
    </div>
  )
}
