export default function Settings(){
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Settings</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Profile</h3>
          <div className="grid gap-4">
            <div>
              <label className="label">Display Name</label>
              <input className="input" defaultValue="Hospital Staff"/>
            </div>
            <div>
              <label className="label">Role</label>
              <select className="input" defaultValue="Hospital Staff">
                <option>Hospital Staff</option>
                <option>Medical Coder</option>
                <option>Admin</option>
              </select>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Security</h3>
          <div className="space-y-3 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4" defaultChecked/> Enable 2FA</label>
            <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4" /> Email notifications</label>
          </div>
        </div>
      </div>
    </div>
  )
}

