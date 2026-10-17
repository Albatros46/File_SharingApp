import { Loader2 } from 'lucide-react'

export default function Spinner({ size = 28, className = '' }) {
  return <Loader2 size={size} className={`animate-spin text-brand-600 ${className}`} aria-label="Loading" />
}
