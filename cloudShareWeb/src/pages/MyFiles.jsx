import { Globe, LayoutGrid, List, Lock, Search, Upload } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { errorMessage, filesApi } from '../api/client'
import FileActions from '../components/FileActions'
import FileTypeIcon from '../components/FileTypeIcon'
import Spinner from '../components/Spinner'
import { formatBytes, formatDate } from '../utils/format'

function VisibilityBadge({ isPublic }) {
  return isPublic ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
      <Globe size={12} /> Public
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
      <Lock size={12} /> Private
    </span>
  )
}

export default function MyFiles() {
  const [files, setFiles] = useState(null)
  const [query, setQuery] = useState('')
  const [view, setView] = useState('list')

  useEffect(() => {
    filesApi
      .list()
      .then(setFiles)
      .catch((e) => {
        toast.error(errorMessage(e, 'Could not load files'))
        setFiles([])
      })
  }, [])

  const filtered = useMemo(
    () => (files ?? []).filter((f) => f.name.toLowerCase().includes(query.trim().toLowerCase())),
    [files, query],
  )

  const onChange = (u) => setFiles((list) => list.map((x) => (x.id === u.id ? u : x)))
  const onDelete = (id) => setFiles((list) => list.filter((x) => x.id !== id))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">My files</h1>
          <p className="text-sm text-slate-500">{files ? `${files.length} file(s)` : 'Loading…'}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
            <input
              className="input w-56 pl-9"
              placeholder="Search files"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex rounded-lg border border-slate-200 bg-white p-0.5">
            <button
              className={`icon-btn ${view === 'list' ? 'bg-slate-100 text-slate-900' : ''}`}
              onClick={() => setView('list')}
              aria-label="List view"
            >
              <List size={16} />
            </button>
            <button
              className={`icon-btn ${view === 'grid' ? 'bg-slate-100 text-slate-900' : ''}`}
              onClick={() => setView('grid')}
              aria-label="Grid view"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {files === null ? (
        <div className="grid place-items-center p-16">
          <Spinner />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-slate-600">{files.length ? 'No files match your search.' : 'You have no files yet.'}</p>
          {!files.length && (
            <Link to="/upload" className="btn-primary mt-4">
              <Upload size={16} /> Upload files
            </Link>
          )}
        </div>
      ) : view === 'list' ? (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 text-left text-xs tracking-wide text-slate-500 uppercase">
              <tr>
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Size</th>
                <th className="p-4 font-medium">Uploaded</th>
                <th className="p-4 font-medium">Sharing</th>
                <th className="p-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <FileTypeIcon contentType={f.contentType} name={f.name} size={18} />
                      <span className="max-w-xs truncate font-medium text-slate-900">{f.name}</span>
                    </div>
                  </td>
                  <td className="p-4 whitespace-nowrap text-slate-600">{formatBytes(f.size)}</td>
                  <td className="p-4 whitespace-nowrap text-slate-600">{formatDate(f.uploadedAt)}</td>
                  <td className="p-4">
                    <VisibilityBadge isPublic={f.isPublic} />
                  </td>
                  <td className="p-4">
                    <FileActions file={f} onChange={onChange} onDelete={onDelete} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((f) => (
            <div key={f.id} className="card flex flex-col gap-4 p-4">
              <div className="flex items-start gap-3">
                <FileTypeIcon contentType={f.contentType} name={f.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-900" title={f.name}>
                    {f.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatBytes(f.size)} · {formatDate(f.uploadedAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <VisibilityBadge isPublic={f.isPublic} />
                <FileActions file={f} onChange={onChange} onDelete={onDelete} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
