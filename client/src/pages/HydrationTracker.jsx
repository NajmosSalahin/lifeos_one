import { useState } from 'react'
import { useCollection } from '../hooks/useFirestore'
import { useAuth } from '../contexts/AuthContext'
import { todayStr } from '../utils/helpers'
import { calculateHydrationGoal } from '../utils/calculations'
import { ACTIVITY_OPTIONS, DRINK_ICONS } from '../utils/defaults'
import { LoadingSpinner } from '../components/ui/Loaders'
import Modal, { useModal } from '../components/ui/Modal'
import { IconHydration, IconDelete, IconSettings, IconEdit, IconAdd } from '../utils/icons'
import { useToast } from '../components/ui/Toast'

export default function HydrationTracker() {
  const { data: hydrations, loading, add, remove } = useCollection('hydration', { orderBy: { field: 'timestamp', direction: 'desc' } })
  const { data: customDrinks, add: addDrink, remove: removeDrink, update: updateDrink } = useCollection('customDrinks')
  const { profile, updateProfileField } = useAuth()
  const [quickMl, setQuickMl] = useState('')
  const [error, setError] = useState('')
  const addDrinkModal = useModal()
  const manageDrinksModal = useModal()
  const profileModal = useModal()
  const [newDrink, setNewDrink] = useState({ name: '', volume: 250, multiplier: 1.0, icon: 'ph-drop' })
  const [profFields, setProfFields] = useState({
    weight: profile?.weight || 65, height: profile?.height || 170,
    activityLevel: profile?.activityLevel || 1.2, temp: profile?.temp || 22, humidity: profile?.humidity || 50
  })
  const [weatherBtn, setWeatherBtn] = useState('Auto-Detect Weather')
  const toast = useToast()

  const today = todayStr()
  const todayHydrations = hydrations?.filter(h => h.date === today) || []
  const totalEffective = todayHydrations.reduce((sum, h) => sum + (h.volume || 0) * (h.multiplier || 1), 0)
  const goal = calculateHydrationGoal(profile)
  const fillPercent = Math.min((totalEffective / goal) * 100, 100)
  const defaultDrinks = [
    { name: 'Glass of Water', volume: 250, multiplier: 1.0, icon: '💧' },
    { name: 'Water Bottle', volume: 500, multiplier: 1.0, icon: '🧴' },
    { name: 'Coffee', volume: 250, multiplier: 0.8, icon: '☕' },
    { name: 'Tea', volume: 250, multiplier: 0.9, icon: '🍵' },
    { name: 'Soda / Juice', volume: 330, multiplier: 0.6, icon: '🧃' }
  ]
  const allDrinks = [...defaultDrinks, ...(customDrinks || [])]

  async function handleQuickAdd() {
    const ml = parseInt(quickMl)
    if (!ml || ml < 1 || ml > 5000) { setError('Enter a volume between 1-5000ml'); return }
    setError('')
    try {
      await add({ drinkId: 'quick', drinkName: 'Quick Add', volume: ml, multiplier: 1.0, icon: '💧', time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), timestamp: Date.now(), date: today })
      setQuickMl('')
      toast('Drink logged')
    } catch {
      toast('Failed to log drink', 'error')
    }
  }

  async function handleTemplateClick(t) {
    try {
      await add({ drinkId: t.name, drinkName: t.name, volume: t.volume, multiplier: t.multiplier, icon: t.icon || '💧', time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), timestamp: Date.now(), date: today })
      toast('Drink logged')
    } catch {
      toast('Failed to log drink', 'error')
    }
  }

  async function handleAddDrink() {
    if (!newDrink.name.trim() || !newDrink.volume) return
    try {
      await addDrink({ name: newDrink.name.trim(), volume: Number(newDrink.volume), multiplier: Number(newDrink.multiplier), icon: newDrink.icon })
      setNewDrink({ name: '', volume: 250, multiplier: 1.0, icon: 'ph-drop' })
      addDrinkModal.close()
      toast('Drink created')
    } catch {
      toast('Failed to create drink', 'error')
    }
  }

  async function handleSaveProfile() {
    try {
      await updateProfileField(profFields)
      profileModal.close()
      toast('Profile saved')
    } catch {
      toast('Failed to save profile', 'error')
    }
  }

  async function fetchLocalWeather() {
    setWeatherBtn('Detecting...')
    if (!navigator.geolocation) { setWeatherBtn('Geolocation unavailable'); return }
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&current=temperature_2m,relative_humidity_2m`)
        const data = await res.json()
        const t = Math.round(data.current.temperature_2m)
        const h = Math.round(data.current.relative_humidity_2m)
        setProfFields(p => ({ ...p, temp: t, humidity: h }))
        setWeatherBtn(`✓ Found! ${t}°C, ${h}% Hum`)
      } catch { setWeatherBtn('Network Error') }
    }, () => setWeatherBtn('Permission Denied'))
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-5">
      <h1 className="page-title">Hydration Tracker</h1>
      <div className="card-panel">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="stat-label">Goal: {goal}ml</p>
            <p className="stat-value mt-1">{totalEffective}ml</p>
          </div>
          <div className="flex gap-1">
            <button onClick={profileModal.open} className="btn btn-ghost btn-icon"><IconSettings size={16} /></button>
            <button onClick={manageDrinksModal.open} className="btn btn-ghost btn-icon"><IconEdit size={16} /></button>
          </div>
        </div>
        <div className="w-full h-4 bg-app rounded-full overflow-hidden mb-2">
          <div className="h-full bg-primary rounded-full transition-all duration-[800ms] ease-[cubic-bezier(0.4,0,0.2,1)]" style={{ width: `${fillPercent}%` }}></div>
        </div>
        <p className="data-stamp text-right">{Math.round(fillPercent)}% of daily goal</p>
      </div>
      <div className="card-panel">
        <div className="section-header">
          <h2>Quick Add</h2>
          <span className="rule" />
          <span className="stamp">manual ml</span>
        </div>
        <div className="flex gap-2">
          <input type="number" placeholder="e.g. 250" min="1" max="5000" value={quickMl} onChange={e => setQuickMl(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleQuickAdd()} className="form-input flex-1" />
          <button onClick={handleQuickAdd} className="btn btn-primary">Log Amount</button>
        </div>
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      </div>
      <div className="card-panel">
        <div className="section-header">
          <h2>1-Click Drinks</h2>
          <span className="rule" />
          <span className="stamp">{allDrinks.length} presets</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {allDrinks.map((t, i) => (
            <button key={i} onClick={() => handleTemplateClick(t)} className="flex items-center gap-2 p-3 rounded-xl border border-app hover:border-primary/30 transition group">
              <IconHydration size={20} className="shrink-0 text-muted group-hover:text-primary transition" />
              <div className="text-left min-w-0">
                <p className="text-xs font-bold text-app truncate">{t.name}</p>
                <p className="data-stamp">{t.volume}ml</p>
              </div>
            </button>
          ))}
          <button onClick={addDrinkModal.open} className="flex items-center justify-center gap-1 p-3 rounded-xl border-2 border-dashed border-app text-muted hover:border-primary/30 hover:text-app transition">
            <IconAdd size={16} /> Create Preset
          </button>
        </div>
      </div>
      <div className="card-panel">
        <div className="section-header">
          <h2>Today's Logbook</h2>
          <span className="rule" />
          <span className="stamp">{todayHydrations.length} drink{todayHydrations.length !== 1 ? 's' : ''}</span>
        </div>
        {todayHydrations.length === 0 && <p className="text-muted text-sm italic">No drinks logged today.</p>}
        <div className="space-y-0 mt-4">
          {[...todayHydrations].reverse().map(h => (
            <div key={h.id} className="card-list-item flex items-center gap-3 first:pt-0 last:pb-0">
              <span className="w-8 h-8 rounded-xl bg-app flex items-center justify-center shrink-0"><IconHydration size={16} className="text-muted" /></span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-app">{h.drinkName}</p>
                <p className="data-stamp">{h.volume}ml · {h.time}</p>
              </div>
              <span className={`data-stamp font-bold ${h.multiplier >= 1 ? 'text-green-400' : 'text-red-400'}`}>{Math.round(h.volume * h.multiplier)}ml</span>
              <button onClick={async () => { try { await remove(h.id); toast('Entry deleted') } catch { toast('Failed to delete', 'error') } }} className="btn btn-ghost btn-icon text-red-400 shrink-0"><IconDelete /></button>
            </div>
          ))}
        </div>
      </div>
      <Modal isOpen={addDrinkModal.isOpen} onClose={addDrinkModal.close} title="Create Custom Drink">
        <div className="space-y-3">
          <input type="text" placeholder="Template Name" value={newDrink.name} onChange={e => setNewDrink(p => ({ ...p, name: e.target.value }))} className="form-input" />
          <input type="number" placeholder="Volume (ml)" min="1" max="5000" value={newDrink.volume} onChange={e => setNewDrink(p => ({ ...p, volume: Number(e.target.value) }))} className="form-input" />
          <select value={newDrink.multiplier} onChange={e => setNewDrink(p => ({ ...p, multiplier: Number(e.target.value) }))} className="form-input">
            <option value="0.5">0.5x — Low hydration</option>
            <option value="0.8">0.8x — Moderate</option>
            <option value="0.9">0.9x — Good</option>
            <option value="1.0">1.0x — Full hydration</option>
            <option value="1.2">1.2x — Extra hydrating</option>
          </select>
          <select value={newDrink.icon} onChange={e => setNewDrink(p => ({ ...p, icon: e.target.value }))} className="form-input">
            {DRINK_ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
          </select>
          <button onClick={handleAddDrink} className="btn btn-primary w-full">Save Drink</button>
        </div>
      </Modal>
      <Modal isOpen={manageDrinksModal.isOpen} onClose={manageDrinksModal.close} title="Manage Custom Drinks">
        <div className="space-y-2">
          {customDrinks?.length === 0 && <p className="text-muted text-sm italic">No custom drinks yet.</p>}
          {customDrinks?.map(d => (
            <div key={d.id} className="card-list-item flex items-center justify-between">
              <span className="text-sm text-app">{d.icon} {d.name} — {d.volume}ml ×{d.multiplier}</span>
              <button onClick={async () => { try { await removeDrink(d.id); toast('Drink deleted') } catch { toast('Failed to delete', 'error') } }} className="btn btn-ghost btn-icon text-red-400"><IconDelete /></button>
            </div>
          ))}
        </div>
      </Modal>
      <Modal isOpen={profileModal.isOpen} onClose={profileModal.close} title="Hydration Profile">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="form-label">Weight (kg)</label><input type="number" value={profFields.weight} onChange={e => setProfFields(p => ({ ...p, weight: Number(e.target.value) }))} className="form-input" /></div>
            <div><label className="form-label">Height (cm)</label><input type="number" value={profFields.height} onChange={e => setProfFields(p => ({ ...p, height: Number(e.target.value) }))} className="form-input" /></div>
          </div>
          <div><label className="form-label">Activity Level</label>
            <select value={profFields.activityLevel} onChange={e => setProfFields(p => ({ ...p, activityLevel: Number(e.target.value) }))} className="form-input">
              {ACTIVITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label} ({o.value}x)</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="form-label">Temp (°C)</label><input type="number" value={profFields.temp} onChange={e => setProfFields(p => ({ ...p, temp: Number(e.target.value) }))} className="form-input" /></div>
            <div><label className="form-label">Humidity (%)</label><input type="number" value={profFields.humidity} onChange={e => setProfFields(p => ({ ...p, humidity: Number(e.target.value) }))} className="form-input" /></div>
          </div>
          <button onClick={fetchLocalWeather} className="w-full py-2 rounded-lg border border-dashed border-app text-app text-sm hover:bg-app transition">{weatherBtn}</button>
          <button onClick={handleSaveProfile} className="btn btn-primary w-full">Save Profile</button>
        </div>
      </Modal>
    </div>
  )
}
