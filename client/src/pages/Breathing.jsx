import { useState, useRef, useEffect } from 'react'
import { useCollection } from '../hooks/useFirestore'
import { todayStr, formatSeconds } from '../utils/helpers'
import { LoadingSpinner } from '../components/ui/Loaders'
import Modal, { useModal } from '../components/ui/Modal'
import { IconChevronDown, IconAdd } from '../utils/icons'
import { useToast } from '../components/ui/Toast'

export default function Breathing() {
  const { data: techniques, loading: tLoad, add: addTech } = useCollection('breathingTechniques')
  const { data: sessions, loading: sLoad, add: addSession } = useCollection('breathing', { orderBy: { field: 'timestamp', direction: 'desc' } })
  const [activeTechId, setActiveTechId] = useState(null)
  const [isActive, setIsActive] = useState(false)
  const [phaseText, setPhaseText] = useState('READY')
  const [timer, setTimer] = useState(0)
  const ringRef = useRef(null)
  const coreRef = useRef(null)
  const timerRef = useRef(null)
  const phaseRef = useRef(null)
  const isActiveRef = useRef(false)
  const runPhaseRef = useRef(null)
  const techRef = useRef(null)
  const startTimeRef = useRef(0)
  const selectModal = useModal()
  const customModal = useModal()
  const [custom, setCustom] = useState({ name: '', inhale: 4, hold1: 4, exhale: 4, hold2: 4 })
  const toast = useToast()

  const activeTech = techniques?.find(t => t.id === activeTechId) || techniques?.[0]
  techRef.current = activeTech
  const today = todayStr()
  const oneMonthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
  const recentSessions = sessions?.filter(s => s.timestamp >= oneMonthAgo) || []
  const todaySessions = recentSessions.filter(s => s.date === today) || []
  const totalSecs = todaySessions.reduce((sum, s) => sum + (s.durationSeconds || 0), 0)

  useEffect(() => {
    if (!activeTechId && techniques?.length) setActiveTechId(techniques[0].id)
  }, [techniques])

  useEffect(() => {
    isActiveRef.current = isActive
  }, [isActive])

  function getSubtext(t) {
    if (!t) return ''
    const parts = []
    if (t.inhale > 0) parts.push(`${t.inhale}s Inhale`)
    if (t.hold1 > 0) parts.push(`${t.hold1}s Hold`)
    if (t.exhale > 0) parts.push(`${t.exhale}s Exhale`)
    if (t.hold2 > 0) parts.push(`${t.hold2}s Hold`)
    return parts.join(' \u2022 ')
  }

  function setRingScale(scale, duration) {
    const rings = [ringRef.current, coreRef.current]
    rings.forEach(el => {
      if (!el) return
      if (duration !== undefined) {
        el.style.transition = `transform ${duration}s linear`
      }
      el.style.transform = `scale(${scale})`
    })
  }

  runPhaseRef.current = (phase) => {
    if (!isActiveRef.current) return
    const tech = techRef.current
    if (!tech) return
    const phases = ['inhale', 'hold1', 'exhale', 'hold2']
    const durations = [tech.inhale, tech.hold1, tech.exhale, tech.hold2]
    const labels = ['INHALE', 'HOLD', 'EXHALE', 'HOLD']

    if (phase >= phases.length) phase = 0
    if (durations[phase] <= 0) { setTimeout(() => runPhaseRef.current(phase + 1), 10); return }

    setPhaseText(labels[phase])

    if (phases[phase] === 'inhale') {
      setRingScale(2.0, tech.inhale)
    } else if (phases[phase] === 'exhale') {
      setRingScale(1.0, tech.exhale)
    }

    phaseRef.current = setTimeout(() => runPhaseRef.current(phase + 1), durations[phase] * 1000)
  }

  function startBreathing() {
    if (!activeTech) return
    setIsActive(true)
    isActiveRef.current = true
    setTimer(0)
    setPhaseText('INHALE')
    setRingScale(2.0, activeTech.inhale)
    startTimeRef.current = Date.now()
    timerRef.current = setInterval(() => {
      setTimer((Date.now() - startTimeRef.current) / 1000)
    }, 100)
    phaseRef.current = setTimeout(() => runPhaseRef.current(1), activeTech.inhale * 1000)
  }

  function stopBreathing() {
    setIsActive(false)
    isActiveRef.current = false
    clearInterval(timerRef.current)
    clearTimeout(phaseRef.current)
    setPhaseText('READY')
    setRingScale(1, 0.3)
    if (timer >= 10) {
      addSession({
        techniqueId: activeTech?.id,
        techniqueName: activeTech?.name,
        durationSeconds: timer,
        timestamp: Date.now(),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        date: today
      })
      toast('Session saved!')
    }
    setTimer(0)
  }

  if (tLoad || sLoad) return <LoadingSpinner />

  return (
    <div className="page-enter space-y-4">
      <h1 className="page-title">Breathing Exercise</h1>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="md:col-span-3">
          <div className="card-panel h-full text-center overflow-hidden">
            <button onClick={isActive ? null : selectModal.open} className={`inline-flex items-center gap-1.5 text-base font-bold text-app mb-1 ${isActive ? 'opacity-50 pointer-events-none' : 'hover:text-primary cursor-pointer'}`}>
              {activeTech?.name || 'Select Technique'}
              {!isActive && <IconChevronDown size={14} className="text-muted" />}
            </button>
            <p className="data-stamp mb-4">{getSubtext(activeTech)}</p>
            <div className="flex flex-col items-center mb-4">
              <div className="relative w-64 h-64 rounded-full border-2 border-[var(--border)] overflow-hidden flex items-center justify-center">
                <div ref={ringRef} className="absolute inset-0 rounded-full bg-primary/20" style={{ boxShadow: '0 0 40px var(--primary)' }}></div>
                <div ref={coreRef} className="absolute inset-10 rounded-full bg-primary/40" style={{ boxShadow: '0 0 40px var(--primary)' }}></div>
                <span className="relative z-10 text-2xl font-bold text-app">{phaseText}</span>
              </div>
              <div className="flex items-center justify-center gap-3 mt-2">
                {['INHALE', 'HOLD', 'EXHALE'].map(label => (
                  <div key={label} className={`flex items-center gap-1.5 text-xs font-medium ${phaseText === label ? 'text-primary' : 'text-muted'}`}>
                    <div className={`w-2 h-2 rounded-full ${phaseText === label ? 'bg-primary shadow-[0_0_6px_var(--primary)]' : 'bg-[var(--border)]'}`} />
                    {label}
                  </div>
                ))}
              </div>
            </div>
            <p id="breath-live-timer" className="stat-value mb-3">{String(Math.floor(timer / 60)).padStart(2, '0')}:{String(Math.floor(timer % 60)).padStart(2, '0')}.{String(Math.floor((timer * 10) % 10))}</p>
            {!isActive ? (
              <button onClick={startBreathing} className="btn btn-primary">Start</button>
            ) : (
              <button onClick={stopBreathing} className="btn btn-danger">Stop</button>
            )}
          </div>
        </div>
        <div className="md:col-span-2">
          <div className="card-panel h-full">
            <div className="section-header">
              <h2>Today's Stats</h2>
              <span className="rule" />
              <span className="stamp">{todayStr}</span>
            </div>
            <p className="stat-value text-primary">Total: {formatSeconds(totalSecs)}</p>
            <div className="mt-3 max-h-[320px] overflow-y-auto space-y-1 pr-1">
              {todaySessions.length === 0 && <p className="data-stamp italic">No sessions today.</p>}
              {todaySessions.map(s => (
                <div key={s.id} className="card-list-item flex items-center justify-between">
                  <div>
                    <p className="text-sm text-app font-medium">{s.techniqueName}</p>
                    <p className="data-stamp">{s.time} &middot; {s.date}</p>
                  </div>
                  <span className="font-mono text-sm font-bold text-primary">{formatSeconds(s.durationSeconds)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Modal isOpen={selectModal.isOpen} onClose={selectModal.close} title="Select Technique" className="" cardClassName="-translate-x-24">
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {techniques?.map(t => (
            <button key={t.id} onClick={() => { setActiveTechId(t.id); selectModal.close() }}
              className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-all ${
                activeTechId === t.id
                  ? 'border-primary bg-primary/5'
                  : 'border-app hover:border-primary/30 hover:bg-[var(--surface)] hover:scale-[1.01] hover:-translate-y-0.5'
              }`}>
              <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition ${
                activeTechId === t.id ? 'border-primary' : 'border-[var(--border)]'
              }`}>
                {activeTechId === t.id && <div className="w-2 h-2 rounded-full bg-primary" />}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-app">{t.name}</p>
                <p className="text-xs text-muted truncate">{getSubtext(t)}</p>
              </div>
            </button>
          ))}
        </div>
        <button onClick={() => { selectModal.close(); customModal.open() }} className="btn btn-ghost w-full border border-dashed border-app mt-3">
          <IconAdd size={16} /> Custom Technique
        </button>
      </Modal>
      <Modal isOpen={customModal.isOpen} onClose={customModal.close} title="Custom Technique">
        <div className="space-y-3">
          <input type="text" placeholder="Technique Name" value={custom.name} onChange={e => setCustom(p => ({ ...p, name: e.target.value }))} className="form-input" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Inhale (1-20s)</label>
              <input type="number" min="1" max="20" value={custom.inhale} onChange={e => setCustom(p => ({ ...p, inhale: Number(e.target.value) }))} className="form-input" />
            </div>
            <div>
              <label className="form-label">Top Hold (0-30s)</label>
              <input type="number" min="0" max="30" value={custom.hold1} onChange={e => setCustom(p => ({ ...p, hold1: Number(e.target.value) }))} className="form-input" />
            </div>
            <div>
              <label className="form-label">Exhale (1-20s)</label>
              <input type="number" min="1" max="20" value={custom.exhale} onChange={e => setCustom(p => ({ ...p, exhale: Number(e.target.value) }))} className="form-input" />
            </div>
            <div>
              <label className="form-label">Bottom Hold (0-30s)</label>
              <input type="number" min="0" max="30" value={custom.hold2} onChange={e => setCustom(p => ({ ...p, hold2: Number(e.target.value) }))} className="form-input" />
            </div>
          </div>
          <button onClick={async () => {
            if (!custom.name.trim()) return
            const id = 'bc' + Date.now()
            await addTech({ id, name: custom.name.trim(), inhale: custom.inhale, hold1: custom.hold1, exhale: custom.exhale, hold2: custom.hold2 })
            setActiveTechId(id)
            customModal.close()
            toast('Technique created!')
          }} className="btn btn-primary w-full">Create & Select</button>
        </div>
      </Modal>
    </div>
  )
}
