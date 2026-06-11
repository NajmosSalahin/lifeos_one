import { useState } from 'react'
import { useCollection } from '../hooks/useFirestore'
import { useAuth } from '../contexts/AuthContext'
import { todayStr } from '../utils/helpers'
import { calculateHydrationGoal } from '../utils/calculations'
import { ACTIVITY_OPTIONS, DRINK_ICONS } from '../utils/defaults'
import { LoadingSpinner } from '../components/ui/Loaders'
import Modal, { useModal } from '../components/ui/Modal'

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
    await add({ drinkId: 'quick', drinkName: 'Quick Add', volume: ml, multiplier: 1.0, icon: '💧', time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), timestamp: Date.now(), date: today })
    setQuickMl('')
  }

  async function handleTemplateClick(t) {
    await add({ drinkId: t.name, drinkName: t.name, volume: t.volume, multiplier: t.multiplier, icon: t.icon || '💧', time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), timestamp: Date.now(), date: today })
  }

  async function handleAddDrink() {
    if (!newDrink.name.trim() || !newDrink.volume) return
    await addDrink({ name: newDrink.name.trim(), volume: Number(newDrink.volume), multiplier: Number(newDrink.multiplier), icon: newDrink.icon })
    setNewDrink({ name: '', volume: 250, multiplier: 1.0, icon: 'ph-drop' })
    addDrinkModal.close()
  }

  async function handleSaveProfile() {
    await updateProfileField(profFields)
    profileModal.close()
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-app">Hydration Tracker</h1>
      <div className="bg-surface border border-app rounded-xl p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-xs text-muted">Goal: {goal}ml</p>
            <p className="text-2xl font-bold text-app">{totalEffective}ml</p>
          </div>
          <div className="flex gap-2">
            <button onClick={profileModal.open} className="text-xs text-muted hover:text-app px-2 py-1">⚙️</button>
            <button onClick={manageDrinksModal.open} className="text-xs text-muted hover:text-app px-2 py-1">✏️</button>
          </div>
        </div>
        <div className="w-full h-4 bg-app rounded-full overflow-hidden mb-4">
          <div className="h-full bg-primary rounded-full transition-all duration-[800ms] ease-[cubic-bezier(0.4,0,0.2,1)]" style={{ width: `${fillPercent}%` }}></div>
        </div>
        <p className="text-right text-xs text-muted">{Math.round(fillPercent)}% of daily goal</p>
      </div>
      <div className="bg-surface border border-app rounded-xl p-4">
        <h2 className="font-bold text-app mb-3">Quick Add</h2>
        <div className="flex gap-2">
          <input type="number" placeholder="e.g. 250" min="1" max="5000" value={quickMl} onChange={e => setQuickMl(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleQuickAdd()} className="flex-1 px-4 py-2 rounded-lg bg-app border border-app text-app placeholder-muted focus:outline-none focus:border-primary transition" />
          <button onClick={handleQuickAdd} className="px-4 py-2 rounded-lg bg-primary text-white font-bold hover:opacity-90 transition">Log Amount</button>
        </div>
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      </div>
      <div className="bg-surface border border-app rounded-xl p-4">
        <h2 className="font-bold text-app mb-3">1-Click Drinks</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {allDrinks.map((t, i) => (
            <button key={i} onClick={() => handleTemplateClick(t)} className="flex items-center gap-2 p-3 rounded-lg border border-app hover:border-primary/30 transition group">
              <span className="text-lg group-hover:scale-110 transition">{t.icon || '💧'}</span>
              <div className="text-left">
                <p className="text-xs font-bold text-app">{t.name}</p>
                <p className="text-[10px] text-muted">{t.volume}ml</p>
              </div>
            </button>
          ))}
          <button onClick={addDrinkModal.open} className="flex items-center justify-center p-3 rounded-lg border-2 border-dashed border-app text-muted hover:border-primary/30 hover:text-app transition">
            + Create Preset
          </button>
        </div>
      </div>
      <div className="bg-surface border border-app rounded-xl p-4">
        <h2 className="font-bold text-app mb-3">Today's Logbook</h2>
        {todayHydrations.length === 0 && <p className="text-muted text-sm italic">No drinks logged today.</p>}
        {[...todayHydrations].reverse().map(h => (
          <div key={h.id} className="flex items-center gap-3 mb-2 p-2 rounded-lg border border-app">
            <span className="w-8 h-8 rounded-full bg-app flex items-center justify-center text-sm">{h.icon || '💧'}</span>
            <div className="flex-1">
              <p className="text-sm text-app">{h.drinkName}</p>
              <p className="text-xs font-mono text-muted">{h.volume}ml · {h.time}</p>
            </div>
            <span className={`text-xs font-bold ${h.multiplier >= 1 ? 'text-green-400' : 'text-red-400'}`}>{Math.round(h.volume * h.multiplier)}ml</span>
            <button onClick={() => remove(h.id)} className="text-red-400 text-xs">🗑️</button>
          </div>
        ))}
      </div>
      <Modal isOpen={addDrinkModal.isOpen} onClose={addDrinkModal.close} title="Create Custom Drink">
        <div className="space-y-3">
          <input type="text" placeholder="Template Name" value={newDrink.name} onChange={e => setNewDrink(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-app border border-app text-app focus:outline-none focus:border-primary transition" />
          <input type="number" placeholder="Volume (ml)" min="1" max="5000" value={newDrink.volume} onChange={e => setNewDrink(p => ({ ...p, volume: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg bg-app border border-app text-app focus:outline-none focus:border-primary transition" />
          <select value={newDrink.multiplier} onChange={e => setNewDrink(p => ({ ...p, multiplier: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg bg-app border border-app text-app focus:outline-none focus:border-primary transition">
            <option value="0.5">0.5x — Low hydration</option>
            <option value="0.8">0.8x — Moderate</option>
            <option value="0.9">0.9x — Good</option>
            <option value="1.0">1.0x — Full hydration</option>
            <option value="1.2">1.2x — Extra hydrating</option>
          </select>
          <select value={newDrink.icon} onChange={e => setNewDrink(p => ({ ...p, icon: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-app border border-app text-app focus:outline-none focus:border-primary transition">
            {DRINK_ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
          </select>
          <button onClick={handleAddDrink} className="w-full py-2 rounded-lg bg-primary text-white font-bold hover:opacity-90 transition">Save Drink</button>
        </div>
      </Modal>
      <Modal isOpen={manageDrinksModal.isOpen} onClose={manageDrinksModal.close} title="Manage Custom Drinks">
        <div className="space-y-2">
          {customDrinks?.length === 0 && <p className="text-muted text-sm italic">No custom drinks yet.</p>}
          {customDrinks?.map(d => (
            <div key={d.id} className="flex items-center justify-between p-2 rounded-lg border border-app">
              <span className="text-sm text-app">{d.icon} {d.name} — {d.volume}ml ×{d.multiplier}</span>
              <button onClick={() => removeDrink(d.id)} className="text-red-400 text-xs">🗑️</button>
            </div>
          ))}
        </div>
      </Modal>
      <Modal isOpen={profileModal.isOpen} onClose={profileModal.close} title="Hydration Profile">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-muted">Weight (kg)</label><input type="number" value={profFields.weight} onChange={e => setProfFields(p => ({ ...p, weight: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg bg-app border border-app text-app focus:outline-none focus:border-primary transition" /></div>
            <div><label className="text-xs text-muted">Height (cm)</label><input type="number" value={profFields.height} onChange={e => setProfFields(p => ({ ...p, height: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg bg-app border border-app text-app focus:outline-none focus:border-primary transition" /></div>
          </div>
          <div><label className="text-xs text-muted">Activity Level</label>
            <select value={profFields.activityLevel} onChange={e => setProfFields(p => ({ ...p, activityLevel: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg bg-app border border-app text-app focus:outline-none focus:border-primary transition">
              {ACTIVITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label} ({o.value}x)</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-muted">Temp (°C)</label><input type="number" value={profFields.temp} onChange={e => setProfFields(p => ({ ...p, temp: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg bg-app border border-app text-app focus:outline-none focus:border-primary transition" /></div>
            <div><label className="text-xs text-muted">Humidity (%)</label><input type="number" value={profFields.humidity} onChange={e => setProfFields(p => ({ ...p, humidity: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg bg-app border border-app text-app focus:outline-none focus:border-primary transition" /></div>
          </div>
          <button onClick={fetchLocalWeather} className="w-full py-2 rounded-lg border border-dashed border-app text-app text-sm hover:bg-app transition">{weatherBtn}</button>
          <button onClick={handleSaveProfile} className="w-full py-2 rounded-lg bg-primary text-white font-bold hover:opacity-90 transition">Save Profile</button>
        </div>
      </Modal>
    </div>
  )
}
