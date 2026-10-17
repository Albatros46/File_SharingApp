import { CreditCard, Globe, ShieldCheck, Upload } from 'lucide-react'
import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import { useAuth } from '../context/AuthContext'

const FEATURES = [
  { icon: Upload, title: 'Easy uploads', text: 'Drag and drop several files at once and keep them in one place.' },
  { icon: Globe, title: 'Share with a link', text: 'Make any file public and send the link. No account needed to download.' },
  { icon: ShieldCheck, title: 'Private by default', text: 'Every file starts private. Only you decide what gets shared.' },
  { icon: CreditCard, title: 'Pay as you go', text: 'Start with free credits and buy more only when you need them.' },
]

export default function Landing() {
  const { user } = useAuth()
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between p-4 sm:p-6">
        <Logo />
        <div className="flex gap-2">
          {user ? (
            <Link to="/dashboard" className="btn-primary">
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn-secondary">
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                Get started
              </Link>
            </>
          )}
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 pt-16 pb-20 text-center sm:pt-24">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Share your files <span className="text-brand-600">securely</span> and simply
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-slate-600">
          Upload, manage and share files with anyone. Keep them private or create a public link in one click.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to={user ? '/upload' : '/register'} className="btn-primary px-6 py-3 text-base">
            Start sharing for free
          </Link>
        </div>
        <p className="mt-3 text-sm text-slate-500">5 free credits when you sign up</p>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-24 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map(({ icon: Icon, title, text }) => (
          <div key={title} className="card p-6">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-brand-100 text-brand-700">
              <Icon size={22} />
            </span>
            <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-600">{text}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} CloudShare
      </footer>
    </div>
  )
}
