import { useState } from 'react'
import { useCollection } from '../hooks/useFirestore'
import { todayStr, daysAgo, weekdayAbbr, isToday } from '../utils/helpers'
import { calculateStreak } from '../utils/calculations'
import { LoadingSpinner } from '../components/ui/Loaders'
import Modal, { useModal, ConfirmModal } from '../components/ui/Modal'

export default function HabitTracker() {
  const { data: habits, loading, add, update, remove } = useCollection('habits')
  const [newName, setNewName] = useState('')
  const [error, setError] = useState('')
  const renameModal = useModal()
  const deleteModal = useModal()
  const [selectedHabit, setSelectedHabit] = useState(null)
  const [renameName, setRenameName] = useState('')

  const today = todayStr()
  const pastDays = Array.from({ length: 6 }, (_, i) => daysAgo(6 - i))
  const weekDays = [...pastDays, today]
  const activeHabits = habits?.filter(h => !h.archived) || []
  const archivedHabits = habits?.filter(h => h.archived) || []

  function handleAdd() {
    setError('')
    const name = newName.trim()
    if (!name) { setError('Habit name cannot be empty'); return }
    add({ name, archived: false, doneDates: [], skippedDates: [], createdAt: Date.now() })
    setNewName('')
  }

  function toggleHabitDate(id) {
    const h = habits.find(x => x.id === id)
    if (!h) return
    let doneDates = [...(h.doneDates || [])]
    let skippedDates = [...(h.skippedDates || [])]
    skippedDates = skippedDates.filter(d => d !== today)
    if (doneDates.includes(today)) doneDates = doneDates.filter(d => d !== today)
    else doneDates.push(today)
    update(id, { doneDates, skippedDates })
  }

  function setDayStatus(id, dateStr, status) {
    const h = habits.find(x => x.id === id)
    if (!h) return
    let doneDates = [...(h.doneDates || [])]
    let skippedDates = [...(h.skippedDates || [])]
    doneDates = doneDates.filter(d => d !== dateStr)
    skippedDates = skippedDates.filter(d => d !== dateStr)
    if (status === 'done') doneDates.push(dateStr)
    else if (status === 'skip') skippedDates.push(dateStr)
    update(id, { doneDates, skippedDates })
  }

  function openRename(h) {
    setSelectedHabit(h)
    setRenameName(h.name)
    renameModal.open()
  }

  function handleRename() {
    if (selectedHabit) update(selectedHabit.id, { name: renameName.trim() })
    renameModal.close()
  }

  function openDelete(h) {
    setSelectedHabit(h)
    deleteModal.open()
  }

  function handleDelete() {
    if (selectedHabit) remove(selectedHabit.id)
    deleteModal.close()
  }

  function toggleArchive(h) {
    update(h.id, { archived: !h.archived })
  }

  function getDayStatus(h, dateStr) {
    if (h.doneDates?.includes(dateStr)) return 'done'
    if (h.skippedDates?.includes(dateStr)) return 'skipped'
    return 'none'
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-app">Habit Tracker</h1>
      <div className="bg-surface border border-app rounded-xl p-4">
        <div className="flex gap-2">
          <input type="text" placeholder="New habit name..." value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} className="flex-1 px-4 py-2 rounded-lg bg-app border border-app text-app placeholder-muted focus:outline-none focus:border-primary transition" />
          <button onClick={handleAdd} className="px-4 py-2 rounded-lg bg-primary text-white font-bold hover:opacity-90 transition">+ Add</button>
        </div>
        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      </div>
      {activeHabits.map(h => {
        const streak = calculateStreak(h.doneDates || [], h.skippedDates || [])
        return (
          <div key={h.id} className="bg-surface border border-app rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-app">{h.name}</h3>
              <div className="flex gap-1">
                <button onClick={() => toggleArchive(h)} className="text-xs text-muted hover:text-app px-2 py-1">📦</button>
                <button onClick={() => openRename(h)} className="text-xs text-muted hover:text-app px-2 py-1">✏️</button>
                <button onClick={() => openDelete(h)} className="text-xs text-red-400 hover:text-red-300 px-2 py-1">🗑️</button>
              </div>
            </div>
            {streak > 0 && <p className="text-sm text-orange-400 mb-2">🔥 {streak} Streak</p>}
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((d, i) => {
                const status = getDayStatus(h, d)
                const isT = isToday(d)
                let cls = 'w-full aspect-square rounded-full text-xs font-bold transition '
                if (isT) cls += 'bg-primary text-white shadow-md '
                else if (status === 'done') cls += 'bg-green-500/20 text-green-400 '
                else if (status === 'skipped') cls += 'bg-yellow-500/20 text-yellow-400 '
                else cls += 'bg-app text-muted hover:scale-105 '
                return (
                  <div key={d} className="text-center">
                    <p className="text-xs text-muted mb-1">{weekdayAbbr(d)}</p>
                    <button className={cls} onClick={() => {
                      if (isT) toggleHabitDate(h.id)
                      else {
                        if (status === 'done') setDayStatus(h.id, d, 'none')
                        else if (status === 'skipped') setDayStatus(h.id, d, 'none')
                        else setDayStatus(h.id, d, 'done')
                      }
                    }}>
                      {status === 'done' ? '✓' : status === 'skipped' ? '−' : '·'}
                    </button>
                    {isT && <p className="text-[10px] text-primary">Today</p>}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
      {activeHabits.length === 0 && <p className="text-center text-muted italic py-8">No active habits. Add one above!</p>}
      {archivedHabits.length > 0 && (
        <div className="mt-8">
          <h2 className="font-bold text-app mb-3">📦 Archived Vault</h2>
          {archivedHabits.map(h => (
            <div key={h.id} className="bg-surface border border-app rounded-xl p-3 flex items-center justify-between mb-2">
              <span className="text-sm text-muted line-through">{h.name}</span>
              <div className="flex gap-2">
                <button onClick={() => toggleArchive(h)} className="text-xs text-primary hover:underline">Restore</button>
                <button onClick={() => openDelete(h)} className="text-xs text-red-400 hover:underline">Drop</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal isOpen={renameModal.isOpen} onClose={renameModal.close} title="Rename Habit">
        <input type="text" value={renameName} onChange={e => setRenameName(e.target.value)} autoFocus className="w-full px-4 py-2 rounded-lg bg-app border border-app text-app focus:outline-none focus:border-primary transition mb-4" onFocus={e => e.target.select()} onKeyDown={e => e.key === 'Enter' && handleRename()} />
        <div className="flex gap-3 justify-end">
          <button onClick={renameModal.close} className="px-4 py-2 rounded-lg border border-app text-app">Cancel</button>
          <button onClick={handleRename} className="px-4 py-2 rounded-lg bg-primary text-white font-bold">Save</button>
        </div>
      </Modal>
      <ConfirmModal isOpen={deleteModal.isOpen} onClose={deleteModal.close} onConfirm={handleDelete} title="Delete Habit" message={`Permanently delete "${selectedHabit?.name}" and all its history?`} confirmText="Delete" danger />
    </div>
  )
}
