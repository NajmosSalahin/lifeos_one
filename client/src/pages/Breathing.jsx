import { useState, useRef, useEffect } from 'react'
import { useCollection } from '../hooks/useFirestore'
import { todayStr, formatSeconds } from '../utils/helpers'
import { LoadingSpinner } from '../components/ui/Loaders'
import Modal, { useModal } from '../components/ui/Modal'

export default function Breathing() {
  const { data: techniques, loading: tLoad, add: addTech } = useCollection('breathingTechniques')
  const { data: sessions, loading: sLoad, add: addSession } = useCollection('breathing', { orderBy: { field: 'timestamp', direction: 'desc' } })
  const [activeTechId, setActiveTechId] = useState(null)
  const [isActive, setIsActive] = useState(false)
  const [phaseText, setPhaseText] = useState('READY')
  const [timer, setTimer] = useState(0)
  const [breathScale, setBreathScale] = useState(1)
  const timerRef = useRef(null)
  const phaseRef = useRef(null)
  const isActiveRef = useRef(false)
  const selectModal = useModal()
  const customModal = useModal()
  const [custom, setCustom] = useState({ name: '', inhale: 4, hold1: 4, exhale: 4, hold2: 4 })

  const activeTech = techniques?.find(t => t.id === activeTechId) || techniques?.[0]
  const today = todayStr()
  const todaySessions = sessions?.filter(s => s.date === today) || []
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
    return parts.join(' • ')
  }

  function runPhase(phase, tech) {
    if (!isActiveRef.current) return
    const phases = ['inhale', 'hold1', 'exhale', 'hold2']
    const durations = [tech.inhale, tech.hold1, tech.exhale, tech.hold2]
    const labels = ['INHALE', 'HOLD', 'EXHALE', 'HOLD']

    if (phase >= phases.length) { phase = 0 }
    if (durations[phase] <= 0) { setTimeout(() => runPhase(phase + 1, tech), 10); return }

    setPhaseText(labels[phase])
    setBreathScale(phases[phase] === 'inhale' ? 1.8 : phases[phase] === 'exhale' ? 1.0 : breathScale)

    phaseRef.current = setTimeout(() => runPhase(phase + 1, tech), durations[phase] * 1000)
  }

  function startBreathing() {
    if (!activeTech) return
    setIsActive(true)
    setTimer(0)
    setPhaseText('INHALE')
    setBreathScale(1.8)
    timerRef.current = setInterval(() => setTimer(t => t + 1), 1000)
    runPhase(1, activeTech)
  }

  function stopBreathing() {
    setIsActive(false)
    clearInterval(timerRef.current)
    clearTimeout(phaseRef.current)
    setPhaseText('READY')
    setBreathScale(1)
    if (timer >= 10) {
      addSession({
        techniqueId: activeTech?.id,
        techniqueName: activeTech?.name,
        durationSeconds: timer,
        timestamp: Date.now(),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        date: today
      })
    }
    setTimer(0)
  }

  if (tLoad || sLoad) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-app">Breathing Exercise</h1>
      <div className="bg-surface border border-app rounded-xl p-6 text-center">
        <button onClick={isActive ? null : selectModal.open} className={`text-lg font-bold text-app mb-1 ${isActive ? 'opacity-50' : 'hover:text-primary'}`}>
          {activeTech?.name || 'Select Technique'} ▾
        </button>
        <p className="text-xs text-muted mb-6">{getSubtext(activeTech)}</p>
        <div className="flex justify-center mb-6">
          <div className="relative w-48 h-48 flex items-center justify-center">
            <div id="breath-visual" className="absolute inset-0 rounded-full bg-primary/20 transition-all" style={{ transform: `scale(${breathScale})`, boxShadow: '0 0 40px var(--primary)', transitionDuration: isActive ? `${activeTech?.inhale || 4}s, ${activeTech?.exhale || 4}s` : '0.3s' }}></div>
            <div id="breath-visual-core" className="absolute inset-8 rounded-full bg-primary/40 transition-all" style={{ transform: `scale(${breathScale})`, boxShadow: '0 0 40px var(--primary)', transitionDuration: isActive ? `${activeTech?.inhale || 4}s, ${activeTech?.exhale || 4}s` : '0.3s' }}></div>
            <span className="relative z-10 text-2xl font-bold text-app">{phaseText}</span>
          </div>
        </div>
        <p id="breath-live-timer" className="text-3xl font-mono font-bold text-app mb-4">{String(Math.floor(timer / 60)).padStart(2, '0')}:{String(timer % 60).padStart(2, '0')}</p>
        {!isActive ? (
          <button onClick={startBreathing} className="px-8 py-3 rounded-xl bg-primary text-white font-bold text-lg hover:opacity-90 transition">Start</button>
        ) : (
          <button onClick={stopBreathing} className="px-8 py-3 rounded-xl bg-red-500 text-white font-bold text-lg hover:opacity-90 transition">Stop</button>
        )}
      </div>
      <div className="bg-surface border border-app rounded-xl p-4">
        <h2 className="font-bold text-app mb-3">Today's Stats</h2>
        <p className="text-lg font-bold text-primary">Total: {formatSeconds(totalSecs)}</p>
        <div className="mt-3 space-y-2">
          {todaySessions.length === 0 && <p className="text-muted text-sm italic">No sessions today.</p>}
          {[...todaySessions].reverse().map(s => (
            <div key={s.id} className="flex items-center justify-between p-2 rounded-lg border border-app">
              <div>
                <p className="text-sm text-app">{s.techniqueName}</p>
                <p className="text-xs text-muted">{s.time}</p>
              </div>
              <span className="text-sm font-mono font-bold text-primary">{formatSeconds(s.durationSeconds)}</span>
            </div>
          ))}
        </div>
      </div>
      <Modal isOpen={selectModal.isOpen} onClose={selectModal.close} title="Select Technique">
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {techniques?.map(t => (
            <button key={t.id} onClick={() => { setActiveTechId(t.id); selectModal.close() }} className={`w-full text-left p-3 rounded-lg border transition flex items-center gap-2 ${activeTechId === t.id ? 'border-primary ring-1 ring-primary' : 'border-app hover:border-primary/30'}`}>
              {activeTechId === t.id && <span className="text-primary">✓</span>}
              <div>
                <p className="text-sm font-bold text-app">{t.name}</p>
                <p className="text-xs text-muted">{getSubtext(t)}</p>
              </div>
            </button>
          ))}
        </div>
        <button onClick={() => { selectModal.close(); customModal.open() }} className="w-full mt-3 py-2 rounded-lg border border-dashed border-app text-app text-sm hover:bg-app transition">+ Custom Technique</button>
      </Modal>
      <Modal isOpen={customModal.isOpen} onClose={customModal.close} title="Custom Technique">
        <div className="space-y-3">
          <input type="text" placeholder="Technique Name" value={custom.name} onChange={e => setCustom(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-app border border-app text-app focus:outline-none focus:border-primary transition" />
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-muted">Inhale (1-20s)</label><input type="number" min="1" max="20" value={custom.inhale} onChange={e => setCustom(p => ({ ...p, inhale: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg bg-app border border-app text-app focus:outline-none focus:border-primary transition" /></div>
            <div><label className="text-xs text-muted">Top Hold (0-30s)</label><input type="number" min="0" max="30" value={custom.hold1} onChange={e => setCustom(p => ({ ...p, hold1: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg bg-app border border-app text-app focus:outline-none focus:border-primary transition" /></div>
            <div><label className="text-xs text-muted">Exhale (1-20s)</label><input type="number" min="1" max="20" value={custom.exhale} onChange={e => setCustom(p => ({ ...p, exhale: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg bg-app border border-app text-app focus:outline-none focus:border-primary transition" /></div>
            <div><label className="text-xs text-muted">Bottom Hold (0-30s)</label><input type="number" min="0" max="30" value={custom.hold2} onChange={e => setCustom(p => ({ ...p, hold2: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg bg-app border border-app text-app focus:outline-none focus:border-primary transition" /></div>
          </div>
          <button onClick={async () => {
            if (!custom.name.trim()) return
            const id = 'bc' + Date.now()
            await addTech({ id, name: custom.name.trim(), inhale: custom.inhale, hold1: custom.hold1, exhale: custom.exhale, hold2: custom.hold2 })
            setActiveTechId(id)
            customModal.close()
          }} className="w-full py-2 rounded-lg bg-primary text-white font-bold hover:opacity-90 transition">Create & Select</button>
        </div>
      </Modal>
    </div>
  )
}
