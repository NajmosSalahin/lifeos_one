import { useEffect, useRef } from 'react'
import { useCollection } from '../hooks/useSupabase'
import { getWeekDates, formatSeconds } from '../utils/helpers'
import { LoadingSpinner } from '../components/ui/Loaders'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

export default function Analytics() {
  const { data: moods, loading: mLoad } = useCollection('moods')
  const { data: sleepLogs, loading: sLoad } = useCollection('sleep')
  const { data: habits, loading: hLoad } = useCollection('habits')
  const { data: hydrations, loading: dLoad } = useCollection('hydration')
  const { data: breathing, loading: bLoad } = useCollection('breathing')
  const { data: journals } = useCollection('journals')

  if (mLoad || sLoad || hLoad || dLoad || bLoad) return <LoadingSpinner />

  const weekDates = getWeekDates()
  const activeHabits = habits?.filter(h => !h.archived) || []

  const weekMoods = weekDates.map(date => {
    const dayMoods = moods?.filter(m => m.date === date) || []
    return dayMoods.length ? dayMoods.reduce((s, m) => s + m.value, 0) / dayMoods.length : null
  })
  const avgMood = weekMoods.filter(v => v !== null).length
    ? (weekMoods.filter(v => v !== null).reduce((s, v) => s + v, 0) / weekMoods.filter(v => v !== null).length).toFixed(1)
    : '-'

  const weekNightSleep = weekDates.map(date => {
    const daySleep = sleepLogs?.filter(s => s.date === date && s.type === 'night') || []
    return daySleep.reduce((sum, s) => sum + (s.hours || 0) + (s.minutes || 0) / 60, 0)
  })
  const avgSleepDays = weekNightSleep.filter(v => v > 0).length
  const avgSleep = avgSleepDays > 0 ? (weekNightSleep.filter(v => v > 0).reduce((s, v) => s + v, 0) / avgSleepDays).toFixed(1) : '-'

  const weekHabitRate = weekDates.map(date => {
    const active = activeHabits.length
    const skipped = activeHabits.filter(h => h.skippedDates?.includes(date)).length
    const done = activeHabits.filter(h => h.doneDates?.includes(date)).length
    const possible = active - skipped
    return possible > 0 ? (done / possible) * 100 : null
  })
  const avgRateDays = weekHabitRate.filter(v => v !== null).length
  const avgRate = avgRateDays > 0 ? Math.round(weekHabitRate.filter(v => v !== null).reduce((s, v) => s + v, 0) / avgRateDays) + '%' : '-'

  const weekBreathing = weekDates.map(date => {
    return breathing?.filter(b => b.date === date).reduce((sum, b) => sum + (b.durationSeconds || 0), 0) || 0
  })
  const totalBreathSecs = weekBreathing.reduce((s, v) => s + v, 0)
  const avgBreathe = formatSeconds(Math.round(totalBreathSecs / 7))

  const lifetimeMood = moods?.length ? (moods.reduce((s, m) => s + m.value, 0) / moods.length).toFixed(1) : '-'
  const totalSleepHours = sleepLogs?.reduce((sum, s) => sum + (s.hours || 0) + (s.minutes || 0) / 60, 0).toFixed(1) || '0'
  const totalWater = hydrations?.reduce((sum, h) => sum + (h.volume || 0) * (h.multiplier || 1), 0) / 1000 || 0
  const mindfulMins = Math.round((breathing?.reduce((sum, b) => sum + (b.durationSeconds || 0), 0) || 0) / 60)
  const journalCount = journals?.length || 0

  return (
    <div className="page-enter space-y-6" id="view-analytics">
      <h1 className="page-title">Analytics</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Avg Mood (7d)" value={avgMood} />
        <StatCard label="Avg Sleep (7d)" value={avgSleep !== '-' ? `${avgSleep}h` : '-'} />
        <StatCard label="Habits Hit Rate (7d)" value={avgRate} />
        <StatCard label="Avg Breathe (7d)" value={avgBreathe} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Mood & Sleep Correlation">
          <LineChart
            labels={weekDates.map(d => new Date(d + 'T12:00:00').toLocaleDateString('en', { weekday: 'short' }))}
            datasets={[
              { label: 'Mood', data: weekMoods, borderColor: 'var(--primary)', yAxisID: 'y', spanGaps: true },
              { label: 'Sleep (Hrs)', data: weekNightSleep, borderColor: '#10b981', borderDash: [5, 5], yAxisID: 'y1', spanGaps: true }
            ]}
            dual
          />
        </ChartCard>
        <ChartCard title="Habit Completion Rate">
          <BarChart
            labels={weekDates.map(d => new Date(d + 'T12:00:00').toLocaleDateString('en', { weekday: 'short' }))}
            data={weekHabitRate}
          />
        </ChartCard>
      </div>
      <ChartCard title="Hydration & Mindful Minutes" full>
        <MixedChart
          labels={weekDates.map(d => new Date(d + 'T12:00:00').toLocaleDateString('en', { weekday: 'short' }))}
          hydration={weekDates.map(date => hydrations?.filter(h => h.date === date).reduce((sum, h) => sum + h.volume * h.multiplier, 0) || 0)}
          breathing={weekBreathing.map(s => Math.round(s / 60 * 10) / 10)}
        />
      </ChartCard>
      <div className="card-panel">
        <div className="section-header">
          <h2>Lifetime Overview</h2>
          <span className="rule" />
          <span className="stamp">all time</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <LifetimeStat label="Lifetime Mood" value={lifetimeMood !== '-' ? `${lifetimeMood}/10` : '-'} />
          <LifetimeStat label="Total Sleep" value={`${totalSleepHours}h`} />
          <LifetimeStat label="Total Water" value={`${totalWater.toFixed(1)}L`} />
          <LifetimeStat label="Mindful Time" value={`${mindfulMins}m`} />
          <LifetimeStat label="Journals" value={journalCount} />
        </div>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted items-center">
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded-full bg-primary inline-block"></span> Mood</span>
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded-full bg-[#10b981] inline-block" style={{ borderTop: '1px dashed #10b981', height: 0 }}></span> Sleep</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#f59e0b80] inline-block"></span> Habit Rate</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-primary inline-block"></span> Hydration</span>
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#10b981] inline-block"></span> Breathing</span>
      </div>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="card-stat">
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
    </div>
  )
}

function ChartCard({ title, children, full }) {
  return (
    <div className={`card-panel ${full ? 'lg:col-span-2' : ''}`}>
      <h2 className="font-display text-xl text-app mb-4">{title}</h2>
      {children}
    </div>
  )
}

function LifetimeStat({ label, value }) {
  return (
    <div className="card-stat text-center">
      <p className="stat-value text-primary">{value}</p>
      <p className="stat-label">{label}</p>
    </div>
  )
}

function LineChart({ labels, datasets, dual }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!ref.current) return
    const ctx = ref.current.getContext('2d')
    const root = getComputedStyle(document.documentElement)
    const primary = root.getPropertyValue('--primary').trim()
    const textMuted = root.getPropertyValue('--text-muted').trim()
    const chart = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets: datasets.map(ds => ({
        ...ds,
        borderColor: ds.borderColor === 'var(--primary)' ? primary : ds.borderColor,
        backgroundColor: (ds.borderColor === 'var(--primary)' ? primary : ds.borderColor) + '20',
        fill: true,
        tension: 0.3,
        pointRadius: 3
      })) },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: { legend: { labels: { color: textMuted } } },
        scales: dual ? {
          y: { min: 0, max: 10, ticks: { color: textMuted }, grid: { color: textMuted + '20' }, title: { display: true, text: 'Mood', color: textMuted } },
          y1: { position: 'right', min: 0, max: 12, ticks: { color: textMuted }, grid: { display: false }, title: { display: true, text: 'Hours', color: textMuted } }
        } : {
          y: { min: 0, ticks: { color: textMuted }, grid: { color: textMuted + '20' } },
          x: { ticks: { color: textMuted }, grid: { display: false } }
        }
      }
    })
    return () => chart.destroy()
  }, [labels, datasets, dual])
  return <div className="h-48"><canvas ref={ref} /></div>
}

function BarChart({ labels, data }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!ref.current) return
    const ctx = ref.current.getContext('2d')
    const root = getComputedStyle(document.documentElement)
    const textMuted = root.getPropertyValue('--text-muted').trim()
    const chart = new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets: [{
        data, backgroundColor: '#f59e0b80', borderColor: '#f59e0b', borderWidth: 1, borderRadius: 6
      }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { min: 0, max: 100, ticks: { color: textMuted, callback: v => v + '%' }, grid: { color: textMuted + '20' } },
          x: { ticks: { color: textMuted }, grid: { display: false } }
        }
      }
    })
    return () => chart.destroy()
  }, [labels, data])
  return <div className="h-48"><canvas ref={ref} /></div>
}

function MixedChart({ labels, hydration, breathing }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!ref.current) return
    const ctx = ref.current.getContext('2d')
    const root = getComputedStyle(document.documentElement)
    const primary = root.getPropertyValue('--primary').trim()
    const textMuted = root.getPropertyValue('--text-muted').trim()
    const chart = new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets: [
        { type: 'bar', label: 'Hydration (ml)', data: hydration, backgroundColor: primary || '#7aa2f7', yAxisID: 'y' },
        { type: 'line', label: 'Breathing (Mins)', data: breathing, borderColor: '#10b981', backgroundColor: '#10b98120', fill: true, tension: 0.3, pointRadius: 3, yAxisID: 'y1' }
      ] },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: { legend: { labels: { color: textMuted } } },
        scales: {
          y: { position: 'left', ticks: { color: textMuted }, grid: { color: textMuted + '20' }, title: { display: true, text: 'ml', color: textMuted } },
          y1: { position: 'right', ticks: { color: textMuted }, grid: { display: false }, title: { display: true, text: 'Mins', color: textMuted } },
          x: { ticks: { color: textMuted }, grid: { display: false } }
        }
      }
    })
    return () => chart.destroy()
  }, [labels, hydration, breathing])
  return <div className="h-48"><canvas ref={ref} /></div>
}
