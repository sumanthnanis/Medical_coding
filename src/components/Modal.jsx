export default function Modal({ open, onClose, title, children, footer, actions, onPrev, onNext }){
  if(!open) return null
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-soft border border-ink-100 w-full max-w-5xl overflow-hidden">
          <div className="px-5 py-3 border-b border-ink-100 flex items-center justify-between">
            <h3 className="font-semibold text-ink-900 truncate pr-4">{title}</h3>
            <div className="flex items-center gap-2">
              {typeof onPrev === 'function' && (
                <button aria-label="Previous document" className="btn btn-outline px-3 py-1.5" onClick={onPrev}>&larr;</button>
              )}
              {typeof onNext === 'function' && (
                <button aria-label="Next document" className="btn btn-outline px-3 py-1.5" onClick={onNext}>&rarr;</button>
              )}
              {actions}
              <button aria-label="Close preview" className="text-ink-500 hover:text-ink-800 ml-1" onClick={onClose}>✕</button>
            </div>
          </div>
          <div className="p-4 max-h-[70vh] overflow-auto">{children}</div>
          {footer && <div className="px-5 py-3 border-t border-ink-100 bg-ink-50">{footer}</div>}
        </div>
      </div>
    </div>
  )
}
