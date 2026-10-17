import { File, FileArchive, FileAudio, FileCode, FileImage, FileSpreadsheet, FileText, FileVideo } from 'lucide-react'

function pick(contentType = '', name = '') {
  const ext = name.split('.').pop()?.toLowerCase()
  if (contentType.startsWith('image/')) return [FileImage, 'bg-pink-50 text-pink-600']
  if (contentType.startsWith('video/')) return [FileVideo, 'bg-orange-50 text-orange-600']
  if (contentType.startsWith('audio/')) return [FileAudio, 'bg-teal-50 text-teal-600']
  if (contentType === 'application/pdf' || ['doc', 'docx', 'txt', 'md'].includes(ext))
    return [FileText, 'bg-red-50 text-red-600']
  if (['xls', 'xlsx', 'csv'].includes(ext)) return [FileSpreadsheet, 'bg-green-50 text-green-600']
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return [FileArchive, 'bg-amber-50 text-amber-600']
  if (['js', 'jsx', 'ts', 'java', 'py', 'html', 'css', 'json', 'xml'].includes(ext))
    return [FileCode, 'bg-sky-50 text-sky-600']
  return [File, 'bg-slate-100 text-slate-600']
}

export default function FileTypeIcon({ contentType, name, size = 20 }) {
  const [Icon, colors] = pick(contentType, name)
  return (
    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${colors}`}>
      <Icon size={size} />
    </span>
  )
}
