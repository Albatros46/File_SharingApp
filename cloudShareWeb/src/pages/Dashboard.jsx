import { CreditCard, Files, Globe, HardDrive, Upload } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { errorMessage, filesApi } from '../api/client'
import FileActions from '../components/FileActions'
import FileTypeIcon from '../components/FileTypeIcon'
import Spinner from '../components/Spinner'
import { useAuth } from '../context/AuthContext'
import { formatBytes, formatDate } from '../utils/format'

function Stat({ icon: Icon, label, value, tone }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <span className={`grid h-11 w-11 place-items-center rounded-lg ${tone}`}>
        <Icon size={22} />
      </span>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [files, setFiles] = useState(null)

  useEffect(() => {
    filesApi
      .list()
      .then(setFiles)
      .catch((e) => {
        toast.error(errorMessage(e, 'Could not load files'))
        setFiles([])
      })
  }, [])

  const totalSize = files?.reduce((sum, f) => sum + f.size, 0) ?? 0
  const publicCount = files?.filter((f) => f.isPublic).length ?? 0
  const recent = files?.slice(0, 5) ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Hi, {user.firstName} 👋</h1>
          <p className="text-sm text-slate-500">Here is an overview of your storage.</p>
        </div>
        <Link to="/upload" className="btn-primary">
          <Upload size={16} /> Upload files
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={CreditCard} label="Credits left" value={user.credits} tone="bg-brand-100 text-brand-700" />
        <Stat icon={Files} label="Total files" value={files?.length ?? '–'} tone="bg-sky-100 text-sky-700" />
        <Stat icon={Globe} label="Shared files" value={files ? publicCount : '–'} tone="bg-green-100 text-green-700" />
        <Stat icon={HardDrive} label="Storage used" value={formatBytes(totalSize)} tone="bg-amber-100 text-amber-700" />
      </div>

      {user.credits === 0 && (
        <div className="card flex flex-wrap items-center justify-between gap-3 border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">You are out of credits. Buy a plan to keep uploading.</p>
          <Link to="/subscriptions" className="btn-primary">
            Buy credits
          </Link>
        </div>
      )}

      <section className="card">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <h2 className="font-semibold text-slate-900">Recent files</h2>
          <Link to="/my-files" className="text-sm font-medium text-brand-700 hover:underline">
            View all
          </Link>
        </div>
        {files === null ? (
          <div className="grid place-items-center p-10">
            <Spinner />
          </div>
        ) : recent.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            No files yet.{' '}
            <Link to="/upload" className="font-medium text-brand-700 hover:underline">
              Upload your first file
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recent.map((f) => (
              <li key={f.id} className="flex items-center gap-3 p-4">
                <FileTypeIcon contentType={f.contentType} name={f.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-900">{f.name}</p>
                  <p className="text-xs text-slate-500">
                    {formatBytes(f.size)} · {formatDate(f.uploadedAt)}
                  </p>
                </div>
                <FileActions
                  file={f}
                  onChange={(u) => setFiles((list) => list.map((x) => (x.id === u.id ? u : x)))}
                  onDelete={(id) => setFiles((list) => list.filter((x) => x.id !== id))}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
