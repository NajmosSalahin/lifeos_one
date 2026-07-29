import { useState, useRef } from 'react'
import { useCollection } from '../hooks/useSupabase'
import { todayStr, formatTime } from '../utils/helpers'
import { calculateSleepDuration, calculateSleepCycles, countCyclesBetween, calculateBedtimeFromCycles } from '../utils/calculations'
import { LoadingSpinner } from '../components/ui/Loaders'
import { IconSleep, IconDelete, IconSettings } from '../utils/icons'
import { useToast } from '../components/ui/Toast'
import Modal, { useModal } from '../components/ui/Modal'

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
  const toast = useToast()
  const calcModal = useModal()

  const dur = calculateSleepDuration(bedTime, wakeTime, awakeMinutes)
  const todayLogs = sleepLogs?.filter(s => s.date === today) || []

  async function handleSave() {
    setError('')
    if (!bedTime || !wakeTime) { setError('Please fill in both bed time and wake time.'); return }
    try {
      await add({
        type, bedTime, wakeTime, awakeMinutes: awakeMinutes || 0,
        hours: dur.hours, minutes: dur.minutes, quality,
        goodNotes, badNotes, date: today, timestamp: Date.now(), time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      })
      setBedTime(''); setWakeTime(''); setAwakeMinutes(0); setQuality('Good'); setGoodNotes(''); setBadNotes('')
      toast('Sleep logged')
    } catch {
      toast('Failed to log sleep', 'error')
    }
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
      calcModal.close()
      formRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const calcResult = getCalcResult()

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Sleep Tracker</h1>
        <button onClick={calcModal.open} className="btn btn-ghost btn-icon" title="Sleep Cycle Calculator">
          <IconSettings size={20} />
        </button>
      </div>
      <div className="flex flex-col lg:flex-row lg:gap-5">
        <div className="lg:w-2/3 space-y-5">
          <div ref={formRef} className="card-panel">
            <div className="section-header">
              <h2>Log Sleep</h2>
              <span className="rule" />
              <span className="stamp">{todayStr()}</span>
            </div>
            <div className="flex gap-2 mb-4">
              <button onClick={() => setType('night')} className={`btn flex-1 ${type === 'night' ? 'btn-primary' : 'btn-secondary'}`}><IconSleep size={16} /> Night Sleep</button>
              <button onClick={() => setType('nap')} className={`btn flex-1 ${type === 'nap' ? 'btn-primary' : 'btn-secondary'}`}><IconSleep size={16} /> Nap / Rest</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div>
                <label className="form-label">Bedtime</label>
                <input type="time" value={bedTime} onChange={e => setBedTime(e.target.value)} required className="form-input" />
              </div>
              <div>
                <label className="form-label">Wake Time</label>
                <input type="time" value={wakeTime} onChange={e => setWakeTime(e.target.value)} required className="form-input" />
              </div>
              <div>
                <label className="form-label">Time Awake (mins)</label>
                <input type="number" min="0" max="720" value={awakeMinutes} onChange={e => setAwakeMinutes(Number(e.target.value))} className="form-input" />
              </div>
            </div>
            <div className="text-center mb-4">
              <p className="stat-value">{dur.hours > 0 || dur.minutes > 0 ? `${dur.hours}h ${dur.minutes}m` : '—'}</p>
            </div>
            <div className="mb-4">
              <p className="form-label mb-2">Quality</p>
              <div className="flex gap-2">
                {['Poor', 'Fair', 'Good', 'Excellent'].map(q => (
                  <button key={q} onClick={() => setQuality(q)} className={`btn btn-sm flex-1 ${quality === q ? 'btn-primary' : 'btn-secondary'}`}>{q}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <input type="text" placeholder="The Good (e.g. Deep sleep, good dreams)" value={goodNotes} onChange={e => setGoodNotes(e.target.value)} className="form-input" />
              <input type="text" placeholder="Problems faced (e.g. Woke up frequently)" value={badNotes} onChange={e => setBadNotes(e.target.value)} className="form-input" />
            </div>
            {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
            <button onClick={handleSave} className="btn btn-primary w-full">Log Sleep</button>
          </div>
        </div>
        <div className="lg:w-1/3 space-y-5">
          <div className="card-panel">
            <div className="section-header">
              <h2>Today's Sleep History</h2>
              <span className="rule" />
              <span className="stamp">{todayLogs.length} log{todayLogs.length !== 1 ? 's' : ''}</span>
            </div>
            {todayLogs.length === 0 && <p className="text-muted text-sm italic">No sleep logged today.</p>}
            <div className="space-y-0 mt-4">
              {[...todayLogs].reverse().map(s => (
                <div key={s.id} className="card-list-item first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`data-stamp px-2 py-0.5 rounded-full font-bold ${s.type === 'night' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {s.type === 'night' ? 'Night Sleep' : 'Nap Session'}
                    </span>
                    <button onClick={async () => { try { await remove(s.id); toast('Entry deleted') } catch { toast('Failed to delete', 'error') } }} className="btn btn-ghost btn-icon text-red-400"><IconDelete /></button>
                  </div>
                  <p className="stat-value">{s.hours}h {s.minutes}m</p>
                  <p className="data-stamp">{s.bedTime} — {s.wakeTime}</p>
                  {s.awakeMinutes > 0 && <span className="data-stamp text-red-400">(-{s.awakeMinutes}m awake)</span>}
                  <span className={`ml-2 data-stamp px-2 py-0.5 rounded-full ${s.quality === 'Excellent' ? 'text-green-400' : s.quality === 'Good' ? 'text-blue-400' : s.quality === 'Fair' ? 'text-yellow-400' : 'text-red-400'}`}>{s.quality}</span>
                  {s.goodNotes && <p className="text-xs text-green-400 mt-1 bg-green-500/5 p-2 rounded">👍 {s.goodNotes}</p>}
                  {s.badNotes && <p className="text-xs text-red-400 mt-1 bg-red-500/5 p-2 rounded">👎 {s.badNotes}</p>}
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted items-center">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500/40"></span> Night Sleep</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500/40"></span> Nap</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400"></span> Excellent</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400"></span> Good</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400"></span> Fair</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400"></span> Poor</span>
            <span className="flex items-center gap-1"><IconSettings size={10} /> Cycle calculator</span>
          </div>
        </div>
      </div>
      <Modal isOpen={calcModal.isOpen} onClose={calcModal.close} title="Sleep Cycle Calculator">
        <p className="text-xs text-muted mb-4">Each sleep cycle lasts ~90 minutes. The ideal bedtime ensures you wake up at the end of a full cycle.</p>
        <div className="flex gap-1 mb-4 bg-app rounded-lg p-1">
          {[{ id: 1, label: 'Wake + Cycles' }, { id: 2, label: 'Bed + Wake' }, { id: 3, label: 'Bed + Cycles' }].map(m => (
            <button key={m.id} onClick={() => setCalcMode(m.id)} className={`btn btn-sm flex-1 ${calcMode === m.id ? 'btn-primary' : 'btn-ghost'}`}>{m.label}</button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {(calcMode === 1 || calcMode === 2) && (
            <div>
              <label className="form-label">Wake-up Time</label>
              <input type="time" value={calcWake} onChange={e => calcMode === 1 ? setCalcWake(e.target.value) : setCalcWake(e.target.value)} className="form-input" />
            </div>
          )}
          {(calcMode === 2 || calcMode === 3) && (
            <div>
              <label className="form-label">Bedtime</label>
              <input type="time" value={calcBed} onChange={e => setCalcBed(e.target.value)} className="form-input" />
            </div>
          )}
          {(calcMode === 1 || calcMode === 3) && (
            <div>
              <label className="form-label">Sleep Cycles</label>
              <input type="range" min="0.5" max="7" step="0.5" value={calcCycles} onChange={e => setCalcCycles(Number(e.target.value))} className="w-full" />
              <div className="flex justify-between text-[10px] text-muted mt-1">
                <span>0.5 (45m)</span><span>1 (1.5h)</span><span>2 (3h)</span><span>5 (7.5h)</span><span>7 (10.5h)</span>
              </div>
              <p className="text-center text-sm text-app mt-1">{calcCycles} cycles ({Math.round(calcCycles * 90)} min)</p>
            </div>
          )}
        </div>
        {calcResult && (
          <div className="border border-primary/30 rounded-xl p-4 mb-4 bg-app">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted">Bedtime:</span> <span className="text-app font-bold">{calcResult.bedTime}</span></div>
              <div><span className="text-muted">Wake-up:</span> <span className="text-app font-bold">{calcResult.wakeTime}</span></div>
              <div><span className="text-muted">Duration:</span> <span className="text-app font-bold">{Math.floor(calcResult.duration / 60)}h {calcResult.duration % 60}m</span></div>
              <div><span className="text-muted">Cycles:</span> <span className="text-app font-bold">{calcResult.cycles}</span></div>
            </div>
            {calcResult.cycles === 5 && <p className="text-amber-400 text-xs mt-2">★ Optimal for most adults</p>}
            <p className="data-stamp text-right mt-1">{Math.round(calcResult.duration / 60 * 10) / 10}h sleep</p>
            <button onClick={applyToSchedule} className="btn btn-primary w-full mt-3">Apply to Schedule</button>
          </div>
        )}
      </Modal>
    </div>
  )
}
