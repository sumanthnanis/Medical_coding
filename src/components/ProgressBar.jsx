export default function ProgressBar({ value = 0, size = 'md' }) {
  const h = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2'
  return (
    <div className={`w-full bg-ink-100 rounded-full ${h} overflow-hidden`}>
      <div className={`bg-primary-600 ${h} rounded-full transition-all`} style={{ width: `${value}%` }} />
    </div>
  )
}
