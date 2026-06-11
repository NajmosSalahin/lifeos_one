import { useState, useRef } from 'react'
import { useCollection } from '../hooks/useFirestore'
import { todayStr, formatTime } from '../utils/helpers'
import { calculateSleepDuration, calculateSleepCycles, countCyclesBetween, calculateBedtimeFromCycles } from '../utils/calculations'
import { LoadingSpinner } from '../components/ui/Loaders'

export default function SleepTracker() {
  const { data: sleepLogs, loading, add, remove } = useCollection('sleep', { orderBy: { field: 'timestamp', direction: 'desc' } })
  const [type, setType] = useState('night')
  const [bedTime, setBedTime] = useState('')
  const [wakeTime, setWakeTime] = useState('')
  const [awakeMinutes, setAwakeMinutes] = useState(0)
  const [quality, setQuality] = useState('Good')
  const [goodNotes, setGoodNotes] = useState('')
  const [badNotes, setBadNotes] = useState('')
  const [error, setError] = useState('')
  const [calcMode, setCalcMode] = useState(1)
  const [calcWake, setCalcWake] = useState('07:00')
  const [calcCycles, setCalcCycles] = useState(5)
  const [calcBed, setCalcBed] = useState('23:00')
  const formRef = useRef(null)
  const today = todayStr()

  const dur = calculateSleepDuration(bedTime, wakeTime, awakeMinutes)
  const todayLogs = sleepLogs?.filter(s => s.date === today) || []

  async function handleSave() {
    setError('')
    if (!bedTime || !wakeTime) { setError('Please fill in both bed time and wake time.'); return }
    await add({
      type, bedTime, wakeTime, awakeMinutes: awakeMinutes || 0,
      hours: dur.hours, minutes: dur.minutes, quality,
      goodNotes, badNotes, date: today, timestamp: Date.now(), time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    })
    setBedTime(''); setWakeTime(''); setAwakeMinutes(0); setQuality('Good'); setGoodNotes(''); setBadNotes('')
  }

  function getCalcResult() {
    if (calcMode === 1 && calcWake && calcCycles) return calculateSleepCycles(calcWake, calcCycles)
    if (calcMode === 2 && calcBed && calcWake) {
      const r = countCyclesBetween(calcBed, calcWake)
      return { bedTime: calcBed, wakeTime: calcWake, duration: r.duration, cycles: r.cycles }
    }
    if (calcMode === 3 && calcBed && calcCycles) return calculateBedtimeFromCycles(calcBed, calcCycles)
    return null
  }

  function applyToSchedule() {
    const result = getCalcResult()
    if (result) {
      setBedTime(result.bedTime)
      setWakeTime(result.wakeTime)
      formRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const calcResult = getCalcResult()

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-app">Sleep Tracker</h1>
      <div ref={formRef} className="bg-surface border border-app rounded-xl p-6">
        <div className="flex gap-2 mb-4">
          <button onClick={() => setType('night')} className={`flex-1 py-2 rounded-lg font-bold transition ${type === 'night' ? 'bg-blue-500 text-white' : 'bg-app text-muted'}`}>🌙 Night Sleep</button>
          <button onClick={() => setType('nap')} className={`flex-1 py-2 rounded-lg font-bold transition ${type === 'nap' ? 'bg-yellow-500 text-white' : 'bg-app text-muted'}`}>😴 Nap / Rest</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="text-xs text-muted block mb-1">Bedtime</label>
            <input type="time" value={bedTime} onChange={e => setBedTime(e.target.value)} required className="w-full px-3 py-2 rounded-lg bg-app border border-app text-app focus:outline-none focus:border-primary transition" />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Wake Time</label>
            <input type="time" value={wakeTime} onChange={e => setWakeTime(e.target.value)} required className="w-full px-3 py-2 rounded-lg bg-app border border-app text-app focus:outline-none focus:border-primary transition" />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Time Awake (mins)</label>
            <input type="number" min="0" max="720" value={awakeMinutes} onChange={e => setAwakeMinutes(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg bg-app border border-app text-app focus:outline-none focus:border-primary transition" />
          </div>
        </div>
        <div className="text-center mb-4">
          <p className="text-3xl font-bold text-app">{dur.hours > 0 || dur.minutes > 0 ? `${dur.hours}h ${dur.minutes}m` : '—'}</p>
        </div>
        <div className="mb-4">
          <p className="text-xs text-muted mb-2">Quality</p>
          <div className="flex gap-2">
            {['Poor', 'Fair', 'Good', 'Excellent'].map(q => (
              <button key={q} onClick={() => setQuality(q)} className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${quality === q ? 'bg-primary text-white' : 'bg-app text-muted'}`}>{q}</button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <input type="text" placeholder="The Good (e.g. Deep sleep, good dreams)" value={goodNotes} onChange={e => setGoodNotes(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-app border border-app text-app placeholder-muted focus:outline-none focus:border-primary transition" />
          <input type="text" placeholder="Problems faced (e.g. Woke up frequently)" value={badNotes} onChange={e => setBadNotes(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-app border border-app text-app placeholder-muted focus:outline-none focus:border-primary transition" />
        </div>
        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
        <button onClick={handleSave} className="w-full py-2.5 rounded-lg bg-primary text-white font-bold hover:opacity-90 transition">Log Sleep</button>
      </div>
      <div className="bg-surface border border-app rounded-xl p-6">
        <h2 className="font-bold text-lg text-app mb-1">Sleep Cycle Calculator</h2>
        <p className="text-xs text-muted mb-4">Each sleep cycle lasts ~90 minutes. The ideal bedtime ensures you wake up at the end of a full cycle.</p>
        <div className="flex gap-1 mb-4 bg-app rounded-lg p-1">
          {[{ id: 1, label: 'Wake + Cycles' }, { id: 2, label: 'Bed + Wake' }, { id: 3, label: 'Bed + Cycles' }].map(m => (
            <button key={m.id} onClick={() => setCalcMode(m.id)} className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${calcMode === m.id ? 'bg-primary text-white border border-primary' : 'text-muted'}`}>{m.label}</button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {(calcMode === 1 || calcMode === 2) && (
            <div>
              <label className="text-xs text-muted block mb-1">Wake-up Time</label>
              <input type="time" value={calcMode === 1 ? calcWake : calcWake} onChange={e => calcMode === 1 ? setCalcWake(e.target.value) : setCalcWake(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-app border border-app text-app focus:outline-none focus:border-primary transition" />
            </div>
          )}
          {(calcMode === 2 || calcMode === 3) && (
            <div>
              <label className="text-xs text-muted block mb-1">Bedtime</label>
              <input type="time" value={calcBed} onChange={e => setCalcBed(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-app border border-app text-app focus:outline-none focus:border-primary transition" />
            </div>
          )}
          {(calcMode === 1 || calcMode === 3) && (
            <div>
              <label className="text-xs text-muted block mb-1">Sleep Cycles</label>
              <input type="range" min="0.5" max="7" step="0.5" value={calcCycles} onChange={e => setCalcCycles(Number(e.target.value))} className="w-full" />
              <div className="flex justify-between text-[10px] text-muted mt-1">
                <span>0.5 (45m)</span><span>1 (1.5h)</span><span>2 (3h)</span><span>5 (7.5h)</span><span>7 (10.5h)</span>
              </div>
              <p className="text-center text-sm text-app mt-1">{calcCycles} cycles ({Math.round(calcCycles * 90)} min)</p>
            </div>
          )}
        </div>
        {calcResult && (
          <div className="border border-primary/30 rounded-lg p-4 mb-4 bg-app">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted">Bedtime:</span> <span className="text-app font-bold">{calcResult.bedTime}</span></div>
              <div><span className="text-muted">Wake-up:</span> <span className="text-app font-bold">{calcResult.wakeTime}</span></div>
              <div><span className="text-muted">Duration:</span> <span className="text-app font-bold">{Math.floor(calcResult.duration / 60)}h {calcResult.duration % 60}m</span></div>
              <div><span className="text-muted">Cycles:</span> <span className="text-app font-bold">{calcResult.cycles}</span></div>
            </div>
            {calcResult.cycles === 5 && <p className="text-amber-400 text-xs mt-2">★ Optimal for most adults</p>}
            <p className="text-[10px] text-muted text-right mt-1">{Math.round(calcResult.duration / 60 * 10) / 10}h sleep</p>
            <button onClick={applyToSchedule} className="w-full mt-3 py-2 rounded-lg bg-primary text-white font-bold text-sm hover:opacity-90 transition">Apply to Schedule</button>
          </div>
        )}
      </div>
      <div className="bg-surface border border-app rounded-xl p-4">
        <h2 className="font-bold text-app mb-3">Today's Sleep History</h2>
        {todayLogs.length === 0 && <p className="text-muted text-sm italic">No sleep logged today.</p>}
        {[...todayLogs].reverse().map(s => (
          <div key={s.id} className="border border-app rounded-lg p-3 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${s.type === 'night' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                {s.type === 'night' ? 'Night Sleep' : 'Nap Session'}
              </span>
              <button onClick={() => remove(s.id)} className="text-red-400 text-xs">🗑️</button>
            </div>
            <p className="text-xl font-bold text-app">{s.hours}h {s.minutes}m</p>
            <p className="text-xs text-muted font-mono">{s.bedTime} — {s.wakeTime}</p>
            {s.awakeMinutes > 0 && <span className="text-xs text-red-400">(-{s.awakeMinutes}m awake)</span>}
            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${s.quality === 'Excellent' ? 'text-green-400' : s.quality === 'Good' ? 'text-blue-400' : s.quality === 'Fair' ? 'text-yellow-400' : 'text-red-400'}`}>{s.quality}</span>
            {s.goodNotes && <p className="text-xs text-green-400 mt-1 bg-green-500/5 p-2 rounded">👍 {s.goodNotes}</p>}
            {s.badNotes && <p className="text-xs text-red-400 mt-1 bg-red-500/5 p-2 rounded">👎 {s.badNotes}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
