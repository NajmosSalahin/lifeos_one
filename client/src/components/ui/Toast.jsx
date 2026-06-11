import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { IconCheck, IconInfo, IconClose } from '../../utils/icons'

const ToastContext = createContext(null)

let toastId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const remove = useCallback((id) => {
    clearTimeout(timers.current[id])
    delete timers.current[id]
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t))
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 200)
  }, [])

  const toast = useCallback((message, type = 'success') => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, message, type, exiting: false }])
    timers.current[id] = setTimeout(() => remove(id), 3500)
    return id
  }, [remove])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all duration-200 ${t.exiting ? 'opacity-0 translate-y-[-12px]' : 'opacity-100 translate-y-0'} ${t.type === 'success' ? 'bg-white text-gray-800 border-gray-200' : t.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' : 'bg-white text-gray-800 border-gray-200'}`}>
            {t.type === 'success' ? <IconCheck size={16} className="text-green-600 shrink-0" /> : t.type === 'error' ? <IconInfo size={16} className="text-red-600 shrink-0" /> : <IconInfo size={16} className="text-blue-600 shrink-0" />}
            <span>{t.message}</span>
            <button onClick={() => remove(t.id)} className="ml-2 text-muted hover:text-app shrink-0"><IconClose size={14} /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
