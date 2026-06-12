import { useRef, useState, createElement } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useCollection } from '../hooks/useFirestore'
import { exportCSV, exportMD, exportJSON } from '../utils/export'
import { LoadingSpinner } from '../components/ui/Loaders'
import Modal, { ConfirmModal, useModal } from '../components/ui/Modal'
import { doc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { IconExport, IconImport, IconTheme, IconMoon, IconSun, IconPalette, IconLeaf, IconSparkle } from '../utils/icons'
import { useToast } from '../components/ui/Toast'

const CATEGORY_ICONS = { moon: IconMoon, sun: IconSun, palette: IconPalette, leaf: IconLeaf, sparkle: IconSparkle }

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
  const toast = useToast()

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
        toast('Data restored successfully!')
      } catch {
        setImportResult('Import Failed: The file format is invalid.')
        importResultModal.open()
        toast('Import failed', 'error')
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
    <div className="page-enter space-y-6">
      <h1 className="page-title">Settings</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4 lg:gap-6">
        <div className="card-panel">
          <div className="section-header mb-3">
            <h2>Theme Engine</h2>
            <span className="rule" />
            <span className="stamp"><IconTheme size={14} /> {activeTheme}</span>
          </div>
          {categories.map(cat => {
            const catThemes = themeEntries.filter(([_, t]) => t.category === cat.name)
            return (
              <div key={cat.name} className="mb-3">
                <h3 className="text-sm font-bold text-app mb-1.5 inline-flex items-center gap-1">{CATEGORY_ICONS[cat.icon] && createElement(CATEGORY_ICONS[cat.icon], { size: 14 })} {cat.name}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {catThemes.map(([name, theme]) => (
                    <button key={name} onClick={() => updateProfileField({ theme: name })} className={`p-2 rounded-lg border text-xs text-center transition leading-tight ${activeTheme === name ? 'ring-1 ring-primary border-primary' : 'border-app hover:border-primary/30'}`} style={{ background: theme.surface, color: theme.textMain }}>
                      <div className="flex gap-1 mb-1 justify-center">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: theme.primary }}></span>
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: theme.bg }}></span>
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: theme.textMain }}></span>
                      </div>
                      <p className="truncate">{name}</p>
                      {activeTheme === name && <span className="text-primary block mt-0.5">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
        <div className="card-panel space-y-5">
          <div>
            <div className="section-header mb-3">
              <h2>Data Management</h2>
              <span className="rule" />
              <span className="stamp">export / import</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button onClick={handleExportCSV} className="btn btn-secondary btn-sm"><IconExport size={14} /> CSV</button>
              <button onClick={handleExportMD} className="btn btn-secondary btn-sm"><IconExport size={14} /> MD</button>
              <button onClick={handleExportPDF} className="btn btn-secondary btn-sm"><IconExport size={14} /> PDF</button>
              <button onClick={handleExportJSON} className="btn btn-secondary btn-sm"><IconExport size={14} /> Backup</button>
            </div>
            <label className="btn btn-secondary btn-sm cursor-pointer inline-flex items-center gap-1.5 border-dashed">
              {importing ? 'Importing...' : <><IconImport size={14} /> Import JSON</>}
              <input ref={importRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>
          <div className="pt-4 border-t border-red-500/20">
            <div className="flex items-center justify-between">
              <p className="text-xs text-red-400 font-semibold uppercase tracking-wider">Danger Zone</p>
              <button onClick={wipeModal.open} className="btn btn-danger btn-sm">Wipe All Data</button>
            </div>
          </div>
        </div>
      </div>
      <ConfirmModal isOpen={wipeModal.isOpen} onClose={wipeModal.close} onConfirm={executeFactoryReset} title="Wipe All Data" message="This will permanently delete ALL your data. This action cannot be undone!" confirmText="Wipe Everything" danger />
      <Modal isOpen={importResultModal.isOpen} onClose={importResultModal.close} title="Import">
        <p className="text-app text-sm">{importResult}</p>
      </Modal>
    </div>
  )
}
