import { CloudUpload, X } from 'lucide-react'
import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { errorMessage, filesApi } from '../api/client'
import FileTypeIcon from '../components/FileTypeIcon'
import { useAuth } from '../context/AuthContext'
import { formatBytes } from '../utils/format'

const MAX_FILES = 5
const MAX_SIZE = 50 * 1024 * 1024

export default function UploadPage() {
  const { user, setCredits } = useAuth()
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const [files, setFiles] = useState([])
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState(null)

  const addFiles = (list) => {
    const incoming = Array.from(list)
    const tooBig = incoming.filter((f) => f.size > MAX_SIZE)
    if (tooBig.length) toast.error(`${tooBig.map((f) => f.name).join(', ')} is larger than 50MB`)
    const next = [...files, ...incoming.filter((f) => f.size <= MAX_SIZE)]
    if (next.length > MAX_FILES) toast.error(`You can upload up to ${MAX_FILES} files at once`)
    setFiles(next.slice(0, MAX_FILES))
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  const notEnough = files.length > user.credits

  const upload = async () => {
    setProgress(0)
    try {
      const res = await filesApi.upload(files, setProgress)
      setCredits(res.remainingCredits)
      toast.success(`${res.files.length} file(s) uploaded`)
      navigate('/my-files')
    } catch (e) {
      toast.error(errorMessage(e, 'Upload failed'))
      setProgress(null)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Upload files</h1>
        <p className="text-sm text-slate-500">
          Each file costs 1 credit. You have <b>{user.credits}</b> credit(s) left.
        </p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`card flex cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed p-12 text-center transition ${
          dragging ? 'border-brand-500 bg-brand-50' : 'border-slate-300 hover:border-brand-500'
        }`}
      >
        <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-100 text-brand-700">
          <CloudUpload size={28} />
        </span>
        <p className="font-medium text-slate-900">Drag and drop files here, or click to browse</p>
        <p className="text-xs text-slate-500">Up to {MAX_FILES} files, 50MB each</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          onChange={(e) => {
            addFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </div>

      {files.length > 0 && (
        <div className="card divide-y divide-slate-100">
          {files.map((f, i) => (
            <div key={`${f.name}-${i}`} className="flex items-center gap-3 p-4">
              <FileTypeIcon contentType={f.type} name={f.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-slate-900">{f.name}</p>
                <p className="text-xs text-slate-500">{formatBytes(f.size)}</p>
              </div>
              <button
                className="icon-btn"
                onClick={() => setFiles(files.filter((_, j) => j !== i))}
                disabled={progress !== null}
                aria-label={`Remove ${f.name}`}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {progress !== null && (
        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}

      {notEnough && (
        <p className="text-sm text-amber-700">
          You need {files.length} credits but have {user.credits}.{' '}
          <Link to="/subscriptions" className="font-medium underline">
            Buy more credits
          </Link>
        </p>
      )}

      <div className="flex justify-end gap-2">
        <button className="btn-secondary" onClick={() => setFiles([])} disabled={!files.length || progress !== null}>
          Clear
        </button>
        <button className="btn-primary" onClick={upload} disabled={!files.length || notEnough || progress !== null}>
          {progress !== null ? `Uploading… ${progress}%` : `Upload ${files.length || ''} file(s)`}
        </button>
      </div>
    </div>
  )
}
