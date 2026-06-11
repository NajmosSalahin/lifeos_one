import { useState, useRef, useEffect } from 'react'

export default function Modal({ isOpen, onClose, title, children, className = '', cardClassName = '' }) {
  if (!isOpen) return null
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 ${className}`} onClick={onClose}>
      <div className={`bg-surface rounded-xl border border-app shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto ${cardClassName}`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-app">
          <h2 className="text-lg font-bold text-app">{title}</h2>
          <button onClick={onClose} className="text-muted hover:text-app text-xl leading-none">&times;</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}

export function useModal() {
  const [isOpen, setIsOpen] = useState(false)
  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)
  return { isOpen, open, close }
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText, danger }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-surface rounded-xl border border-app shadow-2xl w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <h3 className="text-lg font-bold text-app mb-2">{title}</h3>
          <p className="text-muted text-sm mb-6">{message}</p>
          <div className="flex gap-3 justify-end">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-app text-app hover:bg-surface transition">Cancel</button>
            <button onClick={() => { onConfirm(); onClose() }} className={`px-4 py-2 rounded-lg font-bold text-white transition ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:opacity-90'}`}>{confirmText || 'Confirm'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
