import { NavLink, Outlet } from 'react-router-dom'
import { FiHome, FiUploadCloud, FiClock, FiSettings, FiLogOut } from 'react-icons/fi'

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: FiHome },
  { to: '/upload', label: 'Upload Documents', icon: FiUploadCloud },
  { to: '/history', label: 'History', icon: FiClock },
  { to: '/settings', label: 'Settings', icon: FiSettings },
]

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-slate-200">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary-600 text-white grid place-items-center font-semibold">MC</div>
            <div className="font-semibold text-slate-800">Medical Coding</div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-700 hover:bg-slate-50'
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-200">
          <a href="/login" className="flex items-center gap-2 text-slate-600 text-sm hover:text-slate-900">
            <FiLogOut className="h-4 w-4"/> Logout
          </a>
        </div>
      </aside>

      <div className="md:pl-64">
        <header className="h-16 bg-white border-b border-ink-100 flex items-center">
          <div className="container-page flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="md:hidden h-9 w-9 rounded-xl bg-primary-600 text-white grid place-items-center font-semibold">MC</div>
              <h1 className="text-lg font-semibold text-slate-800">Medical Coding</h1>
            </div>
            
          </div>
        </header>
        <main className="py-6">
          <div className="container-page">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
