import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiShield } from 'react-icons/fi'

export default function Login() {
  const [role, setRole] = useState('Hospital Staff')
  const [use2fa, setUse2fa] = useState(false)
  const navigate = useNavigate()

  function handleSubmit(e){
    e.preventDefault()
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50/60 to-ink-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mx-auto w-12 h-12 rounded-xl bg-primary-600 text-white grid place-items-center shadow-soft">
          <FiShield />
        </div>
        <h1 className="mt-4 text-2xl font-semibold text-ink-900 text-center">Sign in to Medical Coding</h1>
        <p className="text-center text-ink-600 mt-1">Secure access with role-based login</p>

        <form onSubmit={handleSubmit} className="card p-6 mt-6 space-y-4">
          <div>
            <label className="label">Role</label>
            <div className="grid grid-cols-3 gap-2">
              {['Hospital Staff','Medical Coder','Admin'].map(r => (
                <button type="button" key={r} onClick={() => setRole(r)}
                  className={`px-3 py-2 rounded-lg text-sm border ${role===r ? 'bg-primary-600 text-white border-primary-600' : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'}`}
                >{r}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Email</label>
            <input required type="email" className="input" placeholder="you@hospital.org" />
          </div>
          <div>
            <label className="label">Password</label>
            <input required type="password" className="input" placeholder="••••••••" />
          </div>

          <div className="flex items-center justify-between">
            <label className="inline-flex items-center gap-2 text-sm text-ink-600">
              <input type="checkbox" checked={use2fa} onChange={(e)=>setUse2fa(e.target.checked)} className="h-4 w-4"/>
              Enable 2FA
            </label>
            <Link className="link text-sm" to="#">Forgot password?</Link>
          </div>

          {use2fa && (
            <div>
              <label className="label">2FA Code</label>
              <input type="text" inputMode="numeric" maxLength={6} className="input" placeholder="123456" />
              <p className="text-xs text-slate-500 mt-1">Enter the 6-digit code from your authenticator app.</p>
            </div>
          )}

          <button className="btn btn-primary w-full">Login</button>
          <p className="text-center text-sm text-ink-600">Don&apos;t have an account? <Link className="link" to="/signup">Create one</Link></p>

          <div className="text-center text-xs text-ink-500">HIPAA-aware UX • SOC2-style demo • Secure by design</div>
        </form>
      </div>
    </div>
  )
}
