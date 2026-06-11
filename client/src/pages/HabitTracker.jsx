import { useState } from 'react'
import { useCollection } from '../hooks/useFirestore'
import { todayStr, daysAgo, weekdayAbbr, isToday } from '../utils/helpers'
import { calculateStreak } from '../utils/calculations'
import { LoadingSpinner } from '../components/ui/Loaders'
import Modal, { useModal, ConfirmModal } from '../components/ui/Modal'
import { IconCheck, IconSkip, IconPending, IconStreak, IconDelete, IconEdit, IconArchive, IconAdd } from '../utils/icons'
import { useToast } from '../components/ui/Toast'

export default function HabitTracker() {
  const { data: habits, loading, add, update, remove } = useCollection('habits')
  const [newName, setNewName] = useState('')
  const [error, setError] = useState('')
  const renameModal = useModal()
  const deleteModal = useModal()
  const [selectedHabit, setSelectedHabit] = useState(null)
  const [renameName, setRenameName] = useState('')
  const toast = useToast()

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
    toast('Habit created')
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
    toast('Habit renamed')
  }

  function openDelete(h) {
    setSelectedHabit(h)
    deleteModal.open()
  }

  function handleDelete() {
    if (selectedHabit) remove(selectedHabit.id)
    deleteModal.close()
    toast('Habit deleted')
  }

  function toggleArchive(h) {
    update(h.id, { archived: !h.archived })
    toast(h.archived ? 'Habit restored' : 'Habit archived')
  }

  function getDayStatus(h, dateStr) {
    if (h.doneDates?.includes(dateStr)) return 'done'
    if (h.skippedDates?.includes(dateStr)) return 'skipped'
    return 'none'
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-5">
      <h1 className="page-title">Habit Tracker</h1>
      <div className="card-panel">
        <div className="flex gap-2">
          <input type="text" placeholder="New habit name..." value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} className="form-input flex-1" />
          <button onClick={handleAdd} className="btn btn-primary"><IconAdd size={16} /> Add</button>
        </div>
        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      </div>
      {activeHabits.map(h => {
        const streak = calculateStreak(h.doneDates || [], h.skippedDates || [])
        return (
          <div key={h.id} className="card-panel">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg text-app">{h.name}</h3>
              <div className="flex gap-1">
                <button onClick={() => toggleArchive(h)} className="btn btn-ghost btn-icon"><IconArchive /></button>
                <button onClick={() => openRename(h)} className="btn btn-ghost btn-icon"><IconEdit /></button>
                <button onClick={() => openDelete(h)} className="btn btn-ghost btn-icon text-red-400 hover:text-red-300"><IconDelete /></button>
              </div>
            </div>
            {streak > 0 && <p className="text-sm text-orange-400 mb-3 flex items-center gap-1"><IconStreak size={16} /> {streak} Streak</p>}
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((d, i) => {
                const status = getDayStatus(h, d)
                const isT = isToday(d)
                let cls = 'w-full aspect-square rounded-full text-xs font-bold transition flex items-center justify-center '
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
                      {status === 'done' ? <IconCheck size={14} /> : status === 'skipped' ? <IconSkip size={14} /> : <IconPending size={14} />}
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
        <div className="card-panel">
          <div className="section-header">
            <h2>Archived Vault</h2>
            <span className="rule" />
            <span className="stamp">{archivedHabits.length}</span>
          </div>
          <div className="space-y-0">
            {archivedHabits.map(h => (
              <div key={h.id} className="card-list-item flex items-center justify-between first:pt-0 last:pb-0">
                <span className="text-sm text-muted line-through">{h.name}</span>
                <div className="flex gap-2">
                  <button onClick={() => toggleArchive(h)} className="btn btn-ghost btn-sm text-primary">Restore</button>
                  <button onClick={() => openDelete(h)} className="btn btn-ghost btn-sm text-red-400">Drop</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <Modal isOpen={renameModal.isOpen} onClose={renameModal.close} title="Rename Habit">
        <input type="text" value={renameName} onChange={e => setRenameName(e.target.value)} autoFocus className="form-input mb-4" onFocus={e => e.target.select()} onKeyDown={e => e.key === 'Enter' && handleRename()} />
        <div className="flex gap-3 justify-end">
          <button onClick={renameModal.close} className="btn btn-secondary">Cancel</button>
          <button onClick={handleRename} className="btn btn-primary">Save</button>
        </div>
      </Modal>
      <ConfirmModal isOpen={deleteModal.isOpen} onClose={deleteModal.close} onConfirm={handleDelete} title="Delete Habit" message={`Permanently delete "${selectedHabit?.name}" and all its history?`} confirmText="Delete" danger />
    </div>
  )
}
