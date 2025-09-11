const palette = {
  primary: 'text-primary-700 bg-primary-100',
  green: 'text-green-700 bg-green-100',
  amber: 'text-amber-700 bg-amber-100',
  blue: 'text-blue-700 bg-blue-100',
}

export default function StatCard({ icon: Icon, label, value, accent='primary' }){
  const cls = palette[accent] || palette.primary
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-ink-500">{label}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
        {Icon && (
          <div className={`h-10 w-10 rounded-lg grid place-items-center ${cls}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  )
}
