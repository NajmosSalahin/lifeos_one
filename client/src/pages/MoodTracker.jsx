import { useState } from 'react'
import { useCollection } from '../hooks/useFirestore'
import { todayStr } from '../utils/helpers'
import { moodEmoji } from '../utils/calculations'
import { MOOD_LABELS } from '../utils/defaults'
import { LoadingSpinner } from '../components/ui/Loaders'
import Modal, { useModal, ConfirmModal } from '../components/ui/Modal'
import { IconDelete } from '../utils/icons'
import { useToast } from '../components/ui/Toast'

export default function MoodTracker() {
  const { data: moods, loading, add, remove } = useCollection('moods', { orderBy: { field: 'timestamp', direction: 'desc' } })
  const [value, setValue] = useState(5)
  const [note, setNote] = useState('')
  const toast = useToast()

  const todayMoods = moods?.filter(m => m.date === todayStr()) || []
  const latestToday = todayMoods.sort((a, b) => b.timestamp - a.timestamp)[0]

  async function handleLog() {
    try {
      await add({
        value,
        note,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now(),
        date: todayStr()
      })
      setNote('')
      setValue(5)
      toast('Mood logged')
    } catch {
      toast('Failed to log mood', 'error')
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-5">
      <h1 className="page-title">Mood Tracker</h1>
      <div className="card-panel">
        <div className="text-center mb-5">
          <span className="text-6xl block mb-2">{moodEmoji(value)}</span>
          <p className="stat-value">{MOOD_LABELS[value]} <span className="text-sm text-muted font-mono font-normal">({value}/10)</span></p>
        </div>
        <input type="range" min="1" max="10" value={value} onChange={e => setValue(Number(e.target.value))} className="w-full mb-4" />
        <input type="text" placeholder="How are you feeling? (optional)" value={note} onChange={e => setNote(e.target.value)} className="form-input mb-4" />
        <button onClick={handleLog} className="btn btn-primary w-full">Log Current Mood</button>
      </div>
      <div className="card-panel">
        <div className="section-header">
          <h2>Today's Mood Log</h2>
          <span className="rule" />
          <span className="stamp">{todayMoods.length} logged</span>
        </div>
        {todayMoods.length === 0 && <p className="text-muted text-sm italic">No moods logged today.</p>}
        <div className="space-y-0 mt-4">
          {[...todayMoods].reverse().map(m => (
            <div key={m.id} className="card-list-item flex items-start gap-3 first:pt-0 last:pb-0">
              <span className="text-2xl shrink-0 mt-0.5">{moodEmoji(m.value)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-app">{MOOD_LABELS[m.value]} <span className="text-muted font-normal">({m.value}/10)</span></p>
                {m.note && <p className="text-xs text-muted mt-1 border-l-2 border-primary pl-2">{m.note}</p>}
                <p className="data-stamp mt-1">{m.time}</p>
              </div>
              <button onClick={async () => { try { await remove(m.id); toast('Entry deleted') } catch { toast('Failed to delete', 'error') } }} className="btn btn-ghost btn-icon text-red-400 hover:text-red-300 shrink-0"><IconDelete /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
