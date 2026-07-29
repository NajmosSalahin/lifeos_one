import { useState } from 'react'
import { useCollection } from '../hooks/useSupabase'
import { todayStr, daysAgo, weekdayAbbr, isToday } from '../utils/helpers'
import { calculateStreak } from '../utils/calculations'
import { LoadingSpinner } from '../components/ui/Loaders'
import Modal, { useModal, ConfirmModal } from '../components/ui/Modal'
import { IconStreak, IconDelete, IconEdit, IconArchive, IconAdd } from '../utils/icons'
import { useToast } from '../components/ui/Toast'

export default function HabitTracker() {
  const { data: habits, loading, add, update, remove } = useCollection('habits')
  const [newName, setNewName] = useState('')
  const [error, setError] = useState('')
  const renameModal = useModal()
  const deleteModal = useModal()
  const [selectedHabit, setSelectedHabit] = useState(null)
  const [renameName, setRenameName] = useState('')
  const [editGoal, setEditGoal] = useState(0)
  const [editFreeze, setEditFreeze] = useState(0)
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
    add({ name, archived: false, doneDates: [], skippedDates: [], weeklyGoal: 0, freezeLimit: 0, createdAt: new Date().toISOString() })
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
    setEditGoal(h.weeklyGoal || 0)
    setEditFreeze(h.freezeLimit || 0)
    renameModal.open()
  }

  function handleRename() {
    if (selectedHabit) update(selectedHabit.id, { name: renameName.trim(), weeklyGoal: editGoal, freezeLimit: editFreeze })
    renameModal.close()
    toast('Habit updated')
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

  function renderDayCell(h, dayIndex) {
    const d = weekDays[dayIndex]
    const status = getDayStatus(h, d)
    const isT = isToday(d)
    let cls = 'w-4 h-4 rounded-full transition cursor-pointer mx-auto flex items-center justify-center '
    if (status === 'done') cls += 'bg-green-500 '
    else if (status === 'skipped') cls += 'text-muted text-xs leading-none '
    else cls += 'bg-muted/25 border border-muted/30 opacity-35 hover:opacity-100 '
    if (isT && status !== 'skipped') cls += 'ring-2 ring-primary/40 '
    if (!isT && status === 'none') cls += 'hover:bg-muted/40 '
    return (
      <td key={d} className="text-center py-0.5 w-[30px]">
        <button title={d} className={cls} onClick={() => {
          if (isT) toggleHabitDate(h.id)
          else {
            if (status === 'done') setDayStatus(h.id, d, 'none')
            else if (status === 'skipped') setDayStatus(h.id, d, 'none')
            else setDayStatus(h.id, d, 'done')
          }
        }}>
          {status === 'skipped' && '-'}
        </button>
      </td>
    )
  }

  if (loading) return <LoadingSpinner />

  const weekLabels = weekDays.map(d => weekdayAbbr(d))

  return (
    <div className="space-y-3">
      <h1 className="page-title">Habit Tracker</h1>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="md:col-span-3 card-panel">
          <div className="flex gap-2 pb-3 border-b border-border mb-3">
            <input type="text" placeholder="New habit name..." value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} className="form-input flex-1" />
            <button onClick={handleAdd} className="btn btn-primary shrink-0"><IconAdd size={16} /> Add</button>
          </div>
          {error && <p className="text-red-400 text-xs -mt-2 mb-2">{error}</p>}

          <table className="w-full table-fixed">
            <thead>
              <tr className="text-[10px] text-muted font-semibold uppercase tracking-wider">
                <th className="text-left font-normal py-0.5">Habit</th>
                <th className="text-center font-normal py-0.5 w-14">Goal</th>
                <th className="text-center font-normal py-0.5 px-0.5 w-[30px]">{weekLabels[0]}</th>
                <th className="text-center font-normal py-0.5 px-0.5 w-[30px]">{weekLabels[1]}</th>
                <th className="text-center font-normal py-0.5 px-0.5 w-[30px]">{weekLabels[2]}</th>
                <th className="text-center font-normal py-0.5 px-0.5 w-[30px]">{weekLabels[3]}</th>
                <th className="text-center font-normal py-0.5 px-0.5 w-[30px]">{weekLabels[4]}</th>
                <th className="text-center font-normal py-0.5 px-0.5 w-[30px]">{weekLabels[5]}</th>
                <th className="text-center font-normal py-0.5 px-0.5 w-[30px]">{weekLabels[6]}</th>
                
                <th className="py-0.5 w-14" />
              </tr>
            </thead>
            <tbody>
              {activeHabits.length === 0 && (
                <tr><td colSpan={10} className="text-center text-muted text-sm italic py-4">No active habits.</td></tr>
              )}
              {activeHabits.map(h => {
                const { streak, freezesUsed } = calculateStreak(h.doneDates || [], h.skippedDates || [], h.freezeLimit || 0)
                const goal = h.weeklyGoal || 0
                const doneThisWeek = weekDays.filter(d => (h.doneDates || []).includes(d)).length
                return (
                  <tr key={h.id} className="group hover:bg-surface/50 transition rounded-lg">
                    <td className="py-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-sm font-medium text-app truncate">{h.name}</span>
                        {streak > 0 && <span className="text-xs text-orange-400 shrink-0 flex items-center gap-0.5"><IconStreak size={12} />{streak}</span>}
                        {freezesUsed > 0 && <span className="text-xs text-sky-400 shrink-0 flex items-center gap-0.5">❄️{freezesUsed}/{h.freezeLimit}</span>}
                      </div>
                    </td>
                    <td className="text-center py-0.5 w-14">
                      {goal > 0 ? (
                        <div className="flex items-center gap-1 justify-center">
                          <span className="text-[10px] font-mono text-muted">{doneThisWeek}/{goal}</span>
                          <div className="w-8 h-1.5 bg-muted/20 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${doneThisWeek >= goal ? 'bg-green-500' : doneThisWeek > 0 ? 'bg-yellow-500' : 'bg-muted/30'}`} style={{ width: `${Math.min(doneThisWeek / goal, 1) * 100}%` }} />
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted/30 text-xs">—</span>
                      )}
                    </td>
                    {renderDayCell(h, 0)}
                    {renderDayCell(h, 1)}
                    {renderDayCell(h, 2)}
                    {renderDayCell(h, 3)}
                    {renderDayCell(h, 4)}
                    {renderDayCell(h, 5)}
                    {renderDayCell(h, 6)}
                    <td className="py-0.5">
                      <div className="flex gap-0.5 opacity-35 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openRename(h)} className="btn btn-ghost btn-icon p-1" title="Edit"><IconEdit size={14} /></button>
                        <button onClick={() => toggleArchive(h)} className="btn btn-ghost btn-icon p-1" title="Archive"><IconArchive size={14} /></button>
                        <button onClick={() => openDelete(h)} className="btn btn-ghost btn-icon p-1 text-red-400 hover:text-red-300" title="Delete"><IconDelete size={14} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="md:col-span-2 space-y-3">
          <div className="card-panel">
            <div className="section-header mb-2">
              <h2>Quick Stats</h2>
              <span className="rule" />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-lg font-bold text-app">{activeHabits.length}</div>
                <div className="text-[10px] text-muted uppercase tracking-wider">Total</div>
              </div>
              <div>
                <div className="text-lg font-bold text-orange-400">{Math.max(...activeHabits.map(h => calculateStreak(h.doneDates || [], h.skippedDates || [], h.freezeLimit || 0).streak), 0)}</div>
                <div className="text-[10px] text-muted uppercase tracking-wider">Best Streak</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-400">
                  {activeHabits.length === 0
                    ? '—'
                    : Math.round(
                        activeHabits.reduce((sum, h) => {
                          const doneThisWeek = weekDays.filter(d => (h.doneDates || []).includes(d)).length
                          return sum + doneThisWeek
                        }, 0) / (activeHabits.length * 7) * 100
                      ) + '%'
                  }
                </div>
                <div className="text-[10px] text-muted uppercase tracking-wider">This Week</div>
              </div>
            </div>
          </div>
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
        </div>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted items-center">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Done</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full border border-muted/30 flex items-center justify-center text-[8px] leading-none text-muted">–</span> Skipped</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-muted/25 border border-muted/30"></span> Pending</span>
        <span className="flex items-center gap-1 text-orange-400"><IconStreak size={10} /> Streak</span>
        <span className="flex items-center gap-1 text-sky-400">❄ Freeze</span>
        <span className="flex items-center gap-1"><IconEdit size={10} /> Rename</span>
        <span className="flex items-center gap-1"><IconArchive size={10} /> Archive</span>
        <span className="flex items-center gap-1"><IconDelete size={10} /> Delete</span>
      </div>
      <Modal isOpen={renameModal.isOpen} onClose={renameModal.close} title="Edit Habit">
        <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Name</label>
        <input type="text" value={renameName} onChange={e => setRenameName(e.target.value)} autoFocus className="form-input mb-3" onFocus={e => e.target.select()} onKeyDown={e => e.key === 'Enter' && handleRename()} />
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Weekly Goal</label>
            <input type="number" min={0} max={7} value={editGoal} onChange={e => setEditGoal(Math.max(0, Math.min(7, Number(e.target.value))))} className="form-input" />
          </div>
          <div>
            <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1">Freeze Limit</label>
            <input type="number" min={0} max={7} value={editFreeze} onChange={e => setEditFreeze(Math.max(0, Math.min(7, Number(e.target.value))))} className="form-input" />
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={renameModal.close} className="btn btn-secondary">Cancel</button>
          <button onClick={handleRename} className="btn btn-primary">Save</button>
        </div>
      </Modal>
      <ConfirmModal isOpen={deleteModal.isOpen} onClose={deleteModal.close} onConfirm={handleDelete} title="Delete Habit" message={`Permanently delete "${selectedHabit?.name}" and all its history?`} confirmText="Delete" danger />
    </div>
  )
}
