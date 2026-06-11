import { useState } from 'react'
import { useCollection } from '../hooks/useFirestore'
import { todayStr } from '../utils/helpers'
import { moodEmoji } from '../utils/calculations'
import { MOOD_LABELS } from '../utils/defaults'
import { LoadingSpinner } from '../components/ui/Loaders'
import Modal, { useModal, ConfirmModal } from '../components/ui/Modal'

export default function MoodTracker() {
  const { data: moods, loading, add, remove } = useCollection('moods', { orderBy: { field: 'timestamp', direction: 'desc' } })
  const [value, setValue] = useState(5)
  const [note, setNote] = useState('')

  const todayMoods = moods?.filter(m => m.date === todayStr()) || []
  const latestToday = todayMoods.sort((a, b) => b.timestamp - a.timestamp)[0]

  async function handleLog() {
    await add({
      value,
      note,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      date: todayStr()
    })
    setNote('')
    setValue(5)
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-app">Mood Tracker</h1>
      <div className="bg-surface border border-app rounded-xl p-6">
        <div className="text-center mb-4">
          <span className="text-6xl block mb-2">{moodEmoji(value)}</span>
          <p className="text-lg font-bold text-app">{MOOD_LABELS[value]} ({value}/10)</p>
        </div>
        <input type="range" min="1" max="10" value={value} onChange={e => setValue(Number(e.target.value))} className="w-full mb-4" style={{ accentColor: 'var(--primary)' }} />
        <input type="text" placeholder="How are you feeling? (optional)" value={note} onChange={e => setNote(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-app border border-app text-app placeholder-muted focus:outline-none focus:border-primary transition mb-3" />
        <button onClick={handleLog} className="w-full py-2.5 rounded-lg bg-primary text-white font-bold hover:opacity-90 transition">Log Current Mood</button>
      </div>
      <div className="bg-surface border border-app rounded-xl p-4">
        <h2 className="font-bold text-app mb-3">Today's Mood Log</h2>
        {todayMoods.length === 0 && <p className="text-muted text-sm italic">No moods logged today.</p>}
        {[...todayMoods].reverse().map(m => (
          <div key={m.id} className="flex items-start gap-3 mb-3 p-3 rounded-lg border border-app">
            <span className="text-2xl">{moodEmoji(m.value)}</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-app">{MOOD_LABELS[m.value]} <span className="text-muted font-normal">({m.value}/10)</span></p>
              {m.note && <p className="text-xs text-muted mt-1 border-l-2 border-primary pl-2">{m.note}</p>}
              <p className="text-xs text-muted mt-1 font-mono">{m.time}</p>
            </div>
            <button onClick={() => remove(m.id)} className="text-red-400 hover:text-red-300 text-sm">🗑️</button>
          </div>
        ))}
      </div>
    </div>
  )
}
