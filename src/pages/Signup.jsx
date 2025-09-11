import { Link, useNavigate } from 'react-router-dom'
import { FiUserPlus } from 'react-icons/fi'

export default function Signup(){
  const navigate = useNavigate()
  function handleSubmit(e){
    e.preventDefault()
    navigate('/dashboard')
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50/50 to-ink-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <div className="mx-auto w-12 h-12 rounded-xl bg-primary-600 text-white grid place-items-center shadow-soft"><FiUserPlus/></div>
        <h1 className="text-2xl font-semibold text-center mt-4">Join Medical Coding Portal</h1>
        <p className="text-ink-600 text-center">Create your account to start processing healthcare documents</p>

        <form onSubmit={handleSubmit} className="card mt-6 p-6 md:p-8">
          <h2 className="text-lg font-semibold mb-4">Create your account</h2>
          <p className="text-slate-600 text-sm mb-6">Fill in your information to get started with secure medical coding</p>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">First Name</label>
              <input className="input" placeholder="Enter your first name" required/>
            </div>
            <div>
              <label className="label">Last Name</label>
              <input className="input" placeholder="Enter your last name" required/>
            </div>
            <div className="md:col-span-2">
              <label className="label">Email Address</label>
              <input type="email" className="input" placeholder="Enter your professional email" required/>
            </div>
            <div>
              <label className="label">Professional Role</label>
              <select className="input">
                <option>Select your professional role</option>
                <option>Hospital Staff</option>
                <option>Medical Coder</option>
                <option>Admin</option>
              </select>
            </div>
            <div>
              <label className="label">Phone Number (Optional)</label>
              <input className="input" placeholder="Your phone number"/>
            </div>
            <div>
              <label className="label">Organization</label>
              <input className="input" placeholder="Hospital/Healthcare facility"/>
            </div>
            <div className="md:col-span-2 grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Password</label>
                <input type="password" className="input" placeholder="Create a strong password" required/>
              </div>
              <div>
                <label className="label">Confirm Password</label>
                <input type="password" className="input" placeholder="Confirm your password" required/>
              </div>
            </div>
          </div>

          <label className="flex items-start gap-3 text-sm text-ink-600 mt-4">
            <input type="checkbox" required className="mt-1 h-4 w-4"/>
            <span>
              I agree to the <a className="link" href="#">Terms of Service</a> and <a className="link" href="#">Privacy Policy</a>, and confirm that I am authorized to process healthcare data in accordance with HIPAA regulations.
            </span>
          </label>

          <button className="btn btn-primary w-full mt-6">Create Account</button>
          <p className="text-center text-sm text-ink-600 mt-2">Already have an account? <Link className="link" to="/login">Sign in here</Link></p>
          <div className="text-center text-xs text-ink-500 mt-1">HIPAA compliant • SOC 2 Type II inspired • Secure by design</div>
        </form>
      </div>
    </div>
  )
}
