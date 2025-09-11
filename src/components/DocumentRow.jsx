import { FiFileText } from 'react-icons/fi'

export default function DocumentRow({ item, onClick }){
  return (
    <button onClick={onClick} className="w-full text-left group">
      <div className="flex items-center justify-between p-3.5 md:p-4 border border-ink-100 rounded-xl hover:bg-ink-50/60 hover:ring-1 hover:ring-primary-200 transition">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary-50 text-primary-700 grid place-items-center"><FiFileText/></div>
          <div>
            <div className="font-semibold text-ink-900 flex items-center gap-1">
              {item.name}
              <span className="opacity-0 group-hover:opacity-100 transition text-ink-400">→</span>
            </div>
            <div className="text-xs text-ink-500">{item.date}</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {item.accuracy>0 && (
            <div className="text-sm text-primary-700 font-medium">{Math.round(item.accuracy*100)}% accuracy</div>
          )}
          <div>
            {item.status === 'Completed' && <span className="badge badge-success">Completed</span>}
            {item.status === 'In Progress' && <span className="badge badge-info">In Progress</span>}
            {item.status === 'Pending' && <span className="badge badge-warning">Pending</span>}
          </div>
        </div>
      </div>
    </button>
  )
}
