import { CheckCircle2, XCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { errorMessage, paymentsApi } from '../api/client'
import Spinner from '../components/Spinner'
import { useAuth } from '../context/AuthContext'

export default function PaymentSuccess() {
  const [params] = useSearchParams()
  const { setCredits } = useAuth()
  const [result, setResult] = useState(null)
  const started = useRef(false)

  useEffect(() => {
    const sessionId = params.get('session_id')
    if (started.current) return
    started.current = true
    if (!sessionId) {
      setResult({ success: false, message: 'Missing payment session' })
      return
    }
    paymentsApi
      .verify(sessionId)
      .then((res) => {
        setResult(res)
        setCredits(res.credits)
      })
      .catch((e) => setResult({ success: false, message: errorMessage(e, 'Could not verify payment') }))
  }, [params, setCredits])

  return (
    <div className="mx-auto max-w-md pt-10">
      <div className="card p-8 text-center">
        {result === null ? (
          <>
            <Spinner className="mx-auto" />
            <p className="mt-4 text-slate-600">Confirming your payment…</p>
          </>
        ) : result.success ? (
          <>
            <CheckCircle2 size={48} className="mx-auto text-green-600" />
            <h1 className="mt-4 text-xl font-semibold text-slate-900">Payment successful</h1>
            <p className="mt-1 text-slate-600">{result.message}</p>
            <p className="mt-1 text-sm text-slate-500">New balance: {result.credits} credits</p>
          </>
        ) : (
          <>
            <XCircle size={48} className="mx-auto text-red-600" />
            <h1 className="mt-4 text-xl font-semibold text-slate-900">Payment not completed</h1>
            <p className="mt-1 text-slate-600">{result.message}</p>
          </>
        )}
        {result && (
          <div className="mt-6 flex justify-center gap-2">
            <Link to="/upload" className="btn-primary">
              Upload files
            </Link>
            <Link to="/transactions" className="btn-secondary">
              Transactions
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
