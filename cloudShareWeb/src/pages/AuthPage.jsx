import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { errorMessage } from '../api/client'
import Logo from '../components/Logo'
import { useAuth } from '../context/AuthContext'

/** Login and register share one form; `mode` picks which fields and which API call. */
export default function AuthPage({ mode }) {
  const isRegister = mode === 'register'
  const { user, login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to="/dashboard" replace />

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const u = isRegister ? await register(form) : await login({ email: form.email, password: form.password })
      toast.success(`Welcome, ${u.firstName}!`)
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true })
    } catch (err) {
      toast.error(errorMessage(err, isRegister ? 'Registration failed' : 'Login failed'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-b from-brand-50 to-white px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <form onSubmit={submit} className="card space-y-4 p-6 sm:p-8">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              {isRegister ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-sm text-slate-500">
              {isRegister ? 'You get 5 free upload credits.' : 'Log in to manage your files.'}
            </p>
          </div>

          {isRegister && (
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm font-medium text-slate-700">
                First name
                <input className="input mt-1" name="firstName" value={form.firstName} onChange={update} required />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Last name
                <input className="input mt-1" name="lastName" value={form.lastName} onChange={update} required />
              </label>
            </div>
          )}

          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              className="input mt-1"
              type="email"
              name="email"
              autoComplete="email"
              value={form.email}
              onChange={update}
              required
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Password
            <input
              className="input mt-1"
              type="password"
              name="password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              minLength={isRegister ? 6 : undefined}
              value={form.password}
              onChange={update}
              required
            />
          </label>

          <button className="btn-primary w-full py-2.5" disabled={submitting}>
            {submitting ? 'Please wait…' : isRegister ? 'Create account' : 'Log in'}
          </button>

          <p className="text-center text-sm text-slate-600">
            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            <Link to={isRegister ? '/login' : '/register'} className="font-medium text-brand-700 hover:underline">
              {isRegister ? 'Log in' : 'Sign up'}
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
