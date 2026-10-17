import { Copy, Download, Globe, Lock, Trash2 } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { errorMessage, filesApi } from '../api/client'
import { saveBlob, shareUrl } from '../utils/format'

/** Download / share toggle / copy link / delete buttons for one file. */
export default function FileActions({ file, onChange, onDelete }) {
  const [busy, setBusy] = useState(false)

  const run = async (fn) => {
    setBusy(true)
    try {
      await fn()
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  const download = () => run(async () => saveBlob(await filesApi.download(file.id), file.name))

  const toggle = () =>
    run(async () => {
      const updated = await filesApi.setVisibility(file.id, !file.isPublic)
      onChange?.(updated)
      toast.success(updated.isPublic ? 'File is now public' : 'File is now private')
    })

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl(file.id))
    toast.success('Share link copied')
  }

  const remove = () => {
    if (!window.confirm(`Delete "${file.name}"? This cannot be undone.`)) return
    run(async () => {
      await filesApi.remove(file.id)
      onDelete?.(file.id)
      toast.success('File deleted')
    })
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <button className="icon-btn" onClick={download} disabled={busy} title="Download">
        <Download size={16} />
      </button>
      <button
        className={`icon-btn ${file.isPublic ? 'text-green-600' : ''}`}
        onClick={toggle}
        disabled={busy}
        title={file.isPublic ? 'Make private' : 'Make public'}
      >
        {file.isPublic ? <Globe size={16} /> : <Lock size={16} />}
      </button>
      {file.isPublic && (
        <button className="icon-btn" onClick={copyLink} title="Copy share link">
          <Copy size={16} />
        </button>
      )}
      <button className="icon-btn hover:text-red-600" onClick={remove} disabled={busy} title="Delete">
        <Trash2 size={16} />
      </button>
    </div>
  )
}
