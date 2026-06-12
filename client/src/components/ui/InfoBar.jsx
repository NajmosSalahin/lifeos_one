export default function InfoBar({ items = [] }) {
  if (items.length === 0) return null
  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-surface/50 border-t border-border/50 text-xs text-muted">
      <span className="font-semibold text-app shrink-0">How It Works</span>
      <span className="text-muted/20 shrink-0">|</span>
      <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-0.5">{item}{i < items.length - 1 && <span className="text-muted/20 ml-1.5">·</span>}</span>
        ))}
      </span>
    </div>
  )
}
