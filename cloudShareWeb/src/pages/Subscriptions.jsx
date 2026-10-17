import { Check, CreditCard } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useSearchParams } from 'react-router-dom'
import { errorMessage, paymentsApi } from '../api/client'
import Spinner from '../components/Spinner'
import { useAuth } from '../context/AuthContext'
import { formatMoney } from '../utils/format'

export default function Subscriptions() {
  const { user } = useAuth()
  const [params] = useSearchParams()
  const [plans, setPlans] = useState(null)
  const [buying, setBuying] = useState(null)

  useEffect(() => {
    paymentsApi
      .plans()
      .then(setPlans)
      .catch((e) => {
        toast.error(errorMessage(e, 'Could not load plans'))
        setPlans([])
      })
  }, [])

  useEffect(() => {
    if (params.get('canceled')) toast('Payment canceled', { icon: 'ℹ️' })
  }, [params])

  const buy = async (plan) => {
    setBuying(plan.id)
    try {
      const { checkoutUrl } = await paymentsApi.checkout(plan.id)
      // Stripe Checkout (or the demo success page) takes over from here
      window.location.href = checkoutUrl
    } catch (e) {
      toast.error(errorMessage(e, 'Could not start payment'))
      setBuying(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Subscription</h1>
        <p className="text-sm text-slate-500">Buy a credit pack. One credit = one file upload. Credits never expire.</p>
      </div>

      <div className="card flex items-center gap-4 p-5">
        <span className="grid h-11 w-11 place-items-center rounded-lg bg-brand-100 text-brand-700">
          <CreditCard size={22} />
        </span>
        <div>
          <p className="text-sm text-slate-500">Current balance</p>
          <p className="text-2xl font-semibold text-slate-900">{user.credits} credits</p>
        </div>
      </div>

      {plans === null ? (
        <div className="grid place-items-center p-16">
          <Spinner />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`card relative flex flex-col p-6 ${plan.recommended ? 'border-brand-500 ring-2 ring-brand-100' : ''}`}
            >
              {plan.recommended && (
                <span className="absolute -top-3 left-6 rounded-full bg-brand-600 px-3 py-0.5 text-xs font-medium text-white">
                  Recommended
                </span>
              )}
              <h2 className="text-lg font-semibold text-slate-900">{plan.name}</h2>
              <p className="mt-2">
                <span className="text-3xl font-bold text-slate-900">{formatMoney(plan.priceCents, plan.currency)}</span>
                <span className="text-sm text-slate-500"> one-time</span>
              </p>
              <p className="mt-1 text-sm font-medium text-brand-700">{plan.credits} credits</p>
              <ul className="mt-5 flex-1 space-y-2 text-sm text-slate-600">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check size={16} className="text-green-600" /> {f}
                  </li>
                ))}
              </ul>
              <button
                className={`${plan.recommended ? 'btn-primary' : 'btn-secondary'} mt-6 w-full`}
                onClick={() => buy(plan)}
                disabled={buying !== null}
              >
                {buying === plan.id ? 'Redirecting…' : 'Buy now'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
