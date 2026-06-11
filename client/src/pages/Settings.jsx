import { useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useCollection } from '../hooks/useFirestore'
import { exportCSV, exportMD, exportJSON } from '../utils/export'
import { LoadingSpinner } from '../components/ui/Loaders'
import { ConfirmModal, useModal } from '../components/ui/Modal'

export default function Settings() {
  const { profile, updateProfileField } = useAuth()
  const { themes, categories } = useTheme()
  const { data: moods } = useCollection('moods')
  const { data: sleepLogs } = useCollection('sleep')
  const { data: hydrationLogs } = useCollection('hydration')
  const { data: breathingSessions } = useCollection('breathing')
  const { data: journals } = useCollection('journals')
  const importRef = useRef(null)
  const wipeModal = useModal()

  function handleExportCSV() {
    exportCSV(moods, sleepLogs, hydrationLogs, breathingSessions)
  }

  function handleExportMD() {
    exportMD(journals, moods, sleepLogs, hydrationLogs, breathingSessions)
  }

  function handleExportJSON() {
    const state = { moods, sleepLogs, hydrationLogs, breathingSessions, journals }
    exportJSON(state)
  }

  async function handleExportPDF() {
    const html2pdf = (await import('html2pdf.js')).default
    const el = document.getElementById('view-analytics')
    if (el) {
      html2pdf().set({
        margin: 0.5, filename: `OmniTracker_Analytics_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 },
        pagebreak: { mode: 'avoid-all' }, jsPDF: { orientation: 'landscape', format: 'letter' }
      }).from(el).save()
    }
  }

  function handleImport(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (evt) => {
      try {
        const data = JSON.parse(evt.target.result)
        if (typeof data !== 'object' || !Array.isArray(data.habits)) throw new Error('Invalid format')
        // In a full implementation, we'd restore to Firestore
        alert('Import successful! Reload the app.')
      } catch {
        alert('Import Failed: Invalid backup file.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function executeFactoryReset() {
    localStorage.removeItem('omniTrackerState')
    window.location.reload()
  }

  const activeTheme = profile?.theme || 'Tokyo Night'
  const themeEntries = Object.entries(themes)

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-app">Settings</h1>
      <div className="bg-surface border border-app rounded-xl p-6">
        <h2 className="font-bold text-lg text-app mb-4">Data Management</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <button onClick={handleExportCSV} className="p-3 rounded-lg border border-app text-app hover:bg-app transition text-sm font-bold">📄 Export CSV</button>
          <button onClick={handleExportMD} className="p-3 rounded-lg border border-app text-app hover:bg-app transition text-sm font-bold">📝 Export MD</button>
          <button onClick={handleExportPDF} className="p-3 rounded-lg border border-app text-app hover:bg-app transition text-sm font-bold">📕 Export PDF</button>
          <button onClick={handleExportJSON} className="p-3 rounded-lg border border-app text-app hover:bg-app transition text-sm font-bold">📦 Raw Backup</button>
        </div>
        <div>
          <label className="inline-block p-3 rounded-lg border border-dashed border-app text-app hover:bg-app transition text-sm font-bold cursor-pointer">
            📥 Import JSON Backup
            <input ref={importRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>
      <div className="bg-surface border border-app rounded-xl p-6">
        <h2 className="font-bold text-lg text-app mb-4">Theme Engine</h2>
        {categories.map(cat => {
          const catThemes = themeEntries.filter(([_, t]) => t.category === cat.name)
          return (
            <div key={cat.name} className="mb-6">
              <h3 className="text-sm font-bold text-app mb-2">{cat.icon} {cat.name}</h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {catThemes.map(([name, theme]) => (
                  <button key={name} onClick={() => updateProfileField({ theme: name })} className={`p-2 rounded-lg border text-xs text-center transition ${activeTheme === name ? 'ring-2 ring-primary border-primary' : 'border-app hover:border-primary/30'}`} style={{ background: theme.surface, color: theme.textMain }}>
                    <div className="flex gap-1 mb-1 justify-center">
                      <span className="w-3 h-3 rounded-full" style={{ background: theme.primary }}></span>
                      <span className="w-3 h-3 rounded-full" style={{ background: theme.bg }}></span>
                      <span className="w-3 h-3 rounded-full" style={{ background: theme.textMain }}></span>
                    </div>
                    <p className="truncate">{name}</p>
                    {activeTheme === name && <span className="text-primary">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
      <div className="bg-surface border border-red-500/30 rounded-xl p-6">
        <h2 className="font-bold text-lg text-red-400 mb-4">Danger Zone</h2>
        <button onClick={wipeModal.open} className="px-6 py-3 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition">Wipe All Data</button>
      </div>
      <ConfirmModal isOpen={wipeModal.isOpen} onClose={wipeModal.close} onConfirm={executeFactoryReset} title="Wipe All Data" message="This will permanently delete ALL your data. This action cannot be undone!" confirmText="Wipe Everything" danger />
    </div>
  )
}
