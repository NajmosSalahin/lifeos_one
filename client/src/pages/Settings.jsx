import { useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useCollection } from '../hooks/useFirestore'
import { exportCSV, exportMD, exportJSON } from '../utils/export'
import { LoadingSpinner } from '../components/ui/Loaders'
import Modal, { ConfirmModal, useModal } from '../components/ui/Modal'
import { doc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase'

export default function Settings() {
  const { profile, updateProfileField } = useAuth()
  const { themes, categories } = useTheme()
  const { data: moods } = useCollection('moods')
  const { data: sleepLogs } = useCollection('sleep')
  const { data: hydrationLogs } = useCollection('hydration')
  const { data: breathingSessions } = useCollection('breathing')
  const { data: journals } = useCollection('journals')
  const { data: habits } = useCollection('habits')
  const { data: customDrinks } = useCollection('customDrinks')
  const { data: breathingTechniques } = useCollection('breathingTechniques')
  const { user } = useAuth()
  const importRef = useRef(null)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const wipeModal = useModal()
  const importResultModal = useModal()

  function handleExportCSV() {
    exportCSV(moods, sleepLogs, hydrationLogs, breathingSessions)
  }

  function handleExportMD() {
    exportMD(journals, moods, sleepLogs, hydrationLogs, breathingSessions)
  }

  function handleExportJSON() {
    const state = { moods, sleepLogs, hydrationLogs, breathingSessions, journals, habits, customDrinks, breathingTechniques }
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

  async function handleImport(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    const reader = new FileReader()
    reader.onload = async (evt) => {
      try {
        const data = JSON.parse(evt.target.result)
        if (typeof data !== 'object') throw new Error('Invalid format')
        const collections = ['moods', 'sleepLogs', 'hydrationLogs', 'breathingSessions', 'journals', 'habits', 'customDrinks', 'breathingTechniques']
        const collectionMap = { sleepLogs: 'sleep', hydrationLogs: 'hydration', breathingSessions: 'breathing', customDrinks: 'customDrinks', breathingTechniques: 'breathingTechniques' }
        let total = 0
        for (const key of collections) {
          const items = data[key]
          if (!Array.isArray(items)) continue
          const path = collectionMap[key] || key
          for (const item of items) {
            const ref = doc(db, 'users', user.uid, path, item.id)
            await setDoc(ref, item, { merge: true })
            total++
          }
        }
        setImportResult(`Restored ${total} documents from backup. Reload to see your data.`)
        importResultModal.open()
      } catch {
        setImportResult('Import Failed: The file format is invalid.')
        importResultModal.open()
      }
    }
    reader.readAsText(file)
    e.target.value = ''
    setImporting(false)
  }

  async function executeFactoryReset() {
    const paths = ['moods', 'habits', 'sleep', 'hydration', 'journals', 'breathing', 'customDrinks', 'breathingTechniques']
    for (const path of paths) {
      const ref = collection(db, 'users', user.uid, path)
      const snap = await getDocs(ref)
      const deletes = snap.docs.map(d => deleteDoc(doc(db, 'users', user.uid, path, d.id)))
      await Promise.all(deletes)
    }
    await deleteDoc(doc(db, 'users', user.uid))
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
            {importing ? '⏳ Importing...' : '📥 Import JSON Backup'}
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
      <Modal isOpen={importResultModal.isOpen} onClose={importResultModal.close} title="Import">
        <p className="text-app text-sm">{importResult}</p>
      </Modal>
    </div>
  )
}
