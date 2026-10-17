import { Copy, Download, FileX } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useParams } from 'react-router-dom'
import { publicApi } from '../api/client'
import FileTypeIcon from '../components/FileTypeIcon'
import Logo from '../components/Logo'
import Spinner from '../components/Spinner'
import { formatBytes, formatDate } from '../utils/format'

/** The page a share link opens. Works without logging in. */
export default function PublicFile() {
  const { id } = useParams()
  const [file, setFile] = useState(undefined)

  useEffect(() => {
    publicApi
      .info(id)
      .then(setFile)
      .catch(() => setFile(null))
  }, [id])

  const copy = async () => {
    await navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      <header className="mx-auto flex max-w-4xl items-center justify-between p-4 sm:p-6">
        <Logo />
        <Link to="/register" className="btn-secondary">
          Share your own files
        </Link>
      </header>

      <main className="mx-auto max-w-lg px-4 pt-10">
        <div className="card p-8 text-center">
          {file === undefined ? (
            <Spinner className="mx-auto" />
          ) : file === null ? (
            <>
              <FileX size={48} className="mx-auto text-slate-400" />
              <h1 className="mt-4 text-xl font-semibold text-slate-900">File not available</h1>
              <p className="mt-1 text-sm text-slate-500">
                This file does not exist or its owner stopped sharing it.
              </p>
            </>
          ) : (
            <>
              <div className="flex justify-center">
                <FileTypeIcon contentType={file.contentType} name={file.name} size={28} />
              </div>
              <h1 className="mt-4 text-xl font-semibold break-words text-slate-900">{file.name}</h1>
              <p className="mt-1 text-sm text-slate-500">
                {formatBytes(file.size)} · shared by {file.ownerName} · {formatDate(file.uploadedAt)}
              </p>
              <div className="mt-6 flex justify-center gap-2">
                <a href={publicApi.downloadUrl(file.id)} className="btn-primary">
                  <Download size={16} /> Download
                </a>
                <button className="btn-secondary" onClick={copy}>
                  <Copy size={16} /> Copy link
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
