import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { errorMessage, paymentsApi } from '../api/client'
import Spinner from '../components/Spinner'
import { formatDateTime, formatMoney } from '../utils/format'

const STATUS_STYLE = {
  SUCCESS: 'bg-green-50 text-green-700',
  PENDING: 'bg-amber-50 text-amber-700',
  FAILED: 'bg-red-50 text-red-700',
}

export default function Transactions() {
  const [items, setItems] = useState(null)

  useEffect(() => {
    paymentsApi
      .transactions()
      .then(setItems)
      .catch((e) => {
        toast.error(errorMessage(e, 'Could not load transactions'))
        setItems([])
      })
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Transactions</h1>
        <p className="text-sm text-slate-500">Your credit purchases.</p>
      </div>

      {items === null ? (
        <div className="grid place-items-center p-16">
          <Spinner />
        </div>
      ) : items.length === 0 ? (
        <div className="card p-12 text-center text-slate-600">No transactions yet.</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 text-left text-xs tracking-wide text-slate-500 uppercase">
              <tr>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Plan</th>
                <th className="p-4 font-medium">Credits</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((t) => (
                <tr key={t.id}>
                  <td className="p-4 whitespace-nowrap text-slate-600">{formatDateTime(t.createdAt)}</td>
                  <td className="p-4 font-medium text-slate-900">{t.planName}</td>
                  <td className="p-4 text-slate-600">{t.credits}</td>
                  <td className="p-4 text-slate-600">{formatMoney(t.amountCents, t.currency)}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[t.status]}`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
