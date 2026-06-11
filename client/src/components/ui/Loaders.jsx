export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
}

export function EmptyState({ message, icon }) {
  return (
    <p className="text-muted italic text-sm py-4 text-center">
      {icon || '📭'} {message || 'Nothing here yet.'}
    </p>
  )
}
