import { useState } from 'react'
import { useCollection } from '../hooks/useFirestore'
import { todayStr, formatDate } from '../utils/helpers'
import { LoadingSpinner } from '../components/ui/Loaders'
import Modal, { useModal } from '../components/ui/Modal'

export default function Journal() {
  const { data: journals, loading, add, remove } = useCollection('journals', { orderBy: { field: 'timestamp', direction: 'desc' } })
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [error, setError] = useState('')
  const errorModal = useModal()

  async function handleSave() {
    setError('')
    if (!body.trim()) { setError('Body cannot be empty.'); errorModal.open(); return }
    const today = todayStr()
    await add({
      title: title.trim(),
      body: body.trim(),
      date: today,
      timestamp: Date.now()
    })
    setTitle(''); setBody('')
  }

  if (loading) return <LoadingSpinner />

  const today = new Date()
  const dateLabel = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const sortedJournals = [...(journals || [])].sort((a, b) => {
    if (a.date !== b.date) return a.date > b.date ? -1 : 1
    return b.timestamp - a.timestamp
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-app">Journal</h1>
      <div className="bg-surface border border-app rounded-xl p-6">
        <p className="text-xs text-muted mb-4">{dateLabel}</p>
        <input type="text" placeholder="Entry Title (e.g., Morning Thoughts)" value={title} onChange={e => setTitle(e.target.value)} className="w-full text-xl font-bold text-app bg-transparent border-b-2 border-app pb-2 mb-4 placeholder-muted focus:outline-none focus:border-primary transition" />
        <textarea placeholder="Write your thoughts..." value={body} onChange={e => setBody(e.target.value)} rows="6" className="w-full px-4 py-3 rounded-lg bg-app border border-app text-app placeholder-muted focus:outline-none focus:border-primary transition resize-none mb-4"></textarea>
        <button onClick={handleSave} className="w-full py-2.5 rounded-lg bg-primary text-white font-bold hover:opacity-90 transition">Save Entry</button>
      </div>
      <div className="space-y-3">
        {sortedJournals.map(j => (
          <div key={j.id} className="bg-surface border border-app rounded-xl p-4 group relative">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-app">{j.title || 'Untitled Entry'}</h3>
              <span className="text-[10px] text-muted font-mono uppercase">{j.date}</span>
            </div>
            <p className="text-sm text-app whitespace-pre-wrap">{j.body}</p>
            <button onClick={() => remove(j.id)} className="absolute top-2 right-2 text-red-400 text-xs opacity-0 group-hover:opacity-100 focus:opacity-100 transition">🗑️</button>
          </div>
        ))}
        {sortedJournals.length === 0 && <p className="text-center text-muted italic py-8">No entries yet. Write your first one!</p>}
      </div>
      <Modal isOpen={errorModal.isOpen} onClose={errorModal.close} title="Error">
        <p className="text-app text-sm mb-4">{error}</p>
        <button onClick={errorModal.close} className="px-4 py-2 rounded-lg bg-primary text-white font-bold">OK</button>
      </Modal>
    </div>
  )
}
