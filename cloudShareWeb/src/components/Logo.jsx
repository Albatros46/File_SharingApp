import { Cloud } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Logo({ to = '/' }) {
  return (
    <Link to={to} className="flex items-center gap-2 text-lg font-bold text-slate-900">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 text-white">
        <Cloud size={20} />
      </span>
      CloudShare
    </Link>
  )
}
