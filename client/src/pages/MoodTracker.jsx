import { useState } from 'react'
import { useCollection } from '../hooks/useFirestore'
import { todayStr } from '../utils/helpers'
import { moodIcon } from '../utils/calculations'
import { MOOD_LABELS, ENERGY_LABELS } from '../utils/defaults'
import { LoadingSpinner } from '../components/ui/Loaders'
import { IconDelete } from '../utils/icons'
import { useToast } from '../components/ui/Toast'

export default function MoodTracker() {
  const { data: moods, loading, add, remove } = useCollection('moods', { orderBy: { field: 'timestamp', direction: 'desc' } })
  const [value, setValue] = useState(5)
  const [energy, setEnergy] = useState(6)
  const [note, setNote] = useState('')
  const toast = useToast()

  async function handleLog() {
    try {
      await add({
        value,
        energy,
        note,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now(),
        date: todayStr()
      })
      setNote('')
      setValue(5)
      setEnergy(6)
      toast('Mood logged')
    } catch {
      toast('Failed to log mood', 'error')
    }
  }

  if (loading) return <LoadingSpinner />

  const MoodIcon = moodIcon(value)

  return (
    <div className="space-y-3">
      <h1 className="page-title">Mood Tracker</h1>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="md:col-span-3 card-panel">
          <div className="text-center mb-3">
            <span className="block mb-1"><MoodIcon size={48} /></span>
            <p className="stat-value">{MOOD_LABELS[value]} <span className="text-sm text-muted font-mono font-normal">({value}/10)</span></p>
          </div>
          <input type="range" min="1" max="10" value={value} onChange={e => setValue(Number(e.target.value))} className="w-full mb-3" />
          <div className="mb-3">
            <p className="text-xs text-muted font-medium mb-1">Energy: {ENERGY_LABELS[energy]} ({energy}/10)</p>
            <input type="range" min="1" max="10" value={energy} onChange={e => setEnergy(Number(e.target.value))} className="w-full" />
          </div>
          <input type="text" placeholder="How are you feeling? (optional)" value={note} onChange={e => setNote(e.target.value)} className="form-input mb-3" />
          <button onClick={handleLog} className="btn btn-primary w-full">Log Current Mood</button>
        </div>
        <div className="md:col-span-2 card-panel">
          <div className="section-header">
            <h2>Mood History</h2>
            <span className="rule" />
            <span className="stamp">{moods?.length || 0} total</span>
          </div>
          {(moods?.length || 0) === 0 && <p className="text-muted text-sm italic py-2">No moods logged yet.</p>}
          <div className="space-y-0 mt-2 max-h-[240px] overflow-y-auto">
            {moods?.map(m => {
              const LogIcon = moodIcon(m.value)
              return (
                <div key={m.id} className="card-list-item flex items-start gap-2 py-1.5 first:pt-0 last:pb-0">
                  <span className="shrink-0 mt-0.5"><LogIcon size={20} /></span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-app">{MOOD_LABELS[m.value]} · {ENERGY_LABELS[m.energy || 6]}</p>
                    {m.note && <p className="text-xs text-muted mt-0.5 border-l-2 border-primary pl-2 leading-relaxed">{m.note}</p>}
                    <p className="data-stamp mt-0.5">{m.date} · {m.time} · E{m.energy || 6}/10</p>
                  </div>
                  <button onClick={async () => { try { await remove(m.id); toast('Entry deleted') } catch { toast('Failed to delete', 'error') } }} className="btn btn-ghost btn-icon text-red-400 hover:text-red-300 shrink-0"><IconDelete /></button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
