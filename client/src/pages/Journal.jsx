import { useState } from 'react'
import { useCollection } from '../hooks/useFirestore'
import { todayStr } from '../utils/helpers'
import { LoadingSpinner } from '../components/ui/Loaders'
import Modal, { useModal } from '../components/ui/Modal'
import { IconDelete } from '../utils/icons'
import { useToast } from '../components/ui/Toast'

export default function Journal() {
  const { data: journals, loading, add, remove } = useCollection('journals', { orderBy: { field: 'timestamp', direction: 'desc' } })
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [error, setError] = useState('')
  const errorModal = useModal()
  const toast = useToast()

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
    toast('Entry saved!')
  }

  if (loading) return <LoadingSpinner />

  const today = new Date()
  const dateLabel = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const sortedJournals = [...(journals || [])].sort((a, b) => {
    if (a.date !== b.date) return a.date > b.date ? -1 : 1
    return b.timestamp - a.timestamp
  })

  return (
    <div className="page-enter space-y-6">
      <h1 className="page-title">Journal</h1>
      <div className="card-panel">
        <p className="data-stamp mb-4">{dateLabel}</p>
        <input type="text" placeholder="Entry Title (e.g., Morning Thoughts)" value={title} onChange={e => setTitle(e.target.value)} className="w-full text-xl font-bold text-app bg-transparent border-b-2 border-app pb-2 mb-4 placeholder-muted focus:outline-none focus:border-primary transition" />
        <textarea placeholder="Write your thoughts..." value={body} onChange={e => setBody(e.target.value)} rows="6" className="form-input resize-none mb-4"></textarea>
        <button onClick={handleSave} className="btn btn-primary w-full">Save Entry</button>
      </div>
      <div className="card-panel">
        <div className="section-header">
          <h2>Entries</h2>
          <span className="rule" />
          <span className="stamp">{journals?.length || 0} total</span>
        </div>
        {sortedJournals.length === 0 && <p className="data-stamp italic py-8 text-center">No entries yet. Write your first one!</p>}
        {sortedJournals.map(j => (
          <div key={j.id} className="card-list-item group relative">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-app">{j.title || 'Untitled Entry'}</h3>
              <span className="data-stamp">{j.date}</span>
            </div>
            <p className="text-sm text-app whitespace-pre-wrap">{j.body}</p>
            <button onClick={() => { remove(j.id); toast('Entry deleted!') }} className="absolute top-3 right-0 text-red-400 opacity-0 group-hover:opacity-100 focus:opacity-100 transition">
              <IconDelete size={16} />
            </button>
          </div>
        ))}
      </div>
      <Modal isOpen={errorModal.isOpen} onClose={errorModal.close} title="Error">
        <p className="text-app text-sm mb-4">{error}</p>
        <button onClick={errorModal.close} className="btn btn-primary">OK</button>
      </Modal>
    </div>
  )
}
