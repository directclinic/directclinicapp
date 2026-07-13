'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, Check, ShieldCheck, Pencil } from 'lucide-react'
import { INSURANCE_CARRIERS } from '@/lib/intake'
import { saveInsurance } from '@/app/actions/account'
import { cn } from '@/lib/utils'

export function InsuranceCard({
  carrier,
  plan,
}: {
  carrier: string | null
  plan: string | null
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [carrierName, setCarrierName] = useState<string | null>(carrier)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(plan)
  const [planOpen, setPlanOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedCarrier = useMemo(
    () => INSURANCE_CARRIERS.find((c) => c.name === carrierName) ?? null,
    [carrierName],
  )

  async function handleSave() {
    if (!carrierName || !selectedPlan) {
      setError('Please choose a carrier and a plan.')
      return
    }
    setSaving(true)
    setError(null)
    const result = await saveInsurance({
      carrier: carrierName,
      plan: selectedPlan,
    })
    setSaving(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setEditing(false)
    router.refresh()
  }

  function handleCancel() {
    setCarrierName(carrier)
    setSelectedPlan(plan)
    setEditing(false)
    setPlanOpen(false)
    setError(null)
  }

  return (
    <div className="mb-8 rounded-3xl border-2 border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck className="size-7" aria-hidden="true" />
          </span>
          <div>
            <p className="text-base font-semibold text-muted-foreground">
              Your insurance
            </p>
            {carrier && plan ? (
              <p className="text-xl font-extrabold text-foreground">
                {carrier}
                <span className="font-semibold text-muted-foreground">
                  {' '}
                  · {plan}
                </span>
              </p>
            ) : (
              <p className="text-xl font-extrabold text-foreground">
                No insurance saved yet
              </p>
            )}
          </div>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border-2 border-border bg-card px-4 text-base font-bold text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
          >
            <Pencil className="size-4 shrink-0" aria-hidden="true" />
            Change
          </button>
        )}
      </div>

      {editing && (
        <div className="mt-5 border-t-2 border-border pt-5">
          <label className="block text-lg font-bold text-foreground">
            Insurance carrier
          </label>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {INSURANCE_CARRIERS.map((c) => {
              const active = c.name === carrierName
              return (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => {
                    setCarrierName(c.name)
                    setSelectedPlan(null)
                    setPlanOpen(false)
                  }}
                  className={cn(
                    'flex min-h-[56px] items-center justify-between gap-3 rounded-2xl border-2 px-5 py-3 text-left text-lg font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40',
                    active
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-foreground hover:border-primary hover:text-primary',
                  )}
                >
                  {c.name}
                  <span
                    className={cn(
                      'flex size-6 shrink-0 items-center justify-center rounded-full border-2',
                      active
                        ? 'border-primary-foreground bg-primary-foreground/20'
                        : 'border-border',
                    )}
                    aria-hidden="true"
                  >
                    {active && <Check className="size-4" />}
                  </span>
                </button>
              )
            })}
          </div>

          {selectedCarrier && (
            <div className="mt-5">
              <label
                id="dash-plan-label"
                className="block text-lg font-bold text-foreground"
              >
                Plan
              </label>
              <div className="relative mt-2">
                <button
                  type="button"
                  onClick={() => setPlanOpen((o) => !o)}
                  aria-haspopup="listbox"
                  aria-expanded={planOpen}
                  aria-labelledby="dash-plan-label"
                  className={cn(
                    'flex min-h-[56px] w-full items-center justify-between gap-3 rounded-2xl border-2 bg-card px-5 text-left text-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40',
                    selectedPlan
                      ? 'border-primary text-foreground'
                      : 'border-border text-muted-foreground',
                  )}
                >
                  {selectedPlan ?? 'Select your plan'}
                  <ChevronDown
                    className={cn(
                      'size-6 shrink-0 text-primary transition-transform',
                      planOpen && 'rotate-180',
                    )}
                    aria-hidden="true"
                  />
                </button>
                {planOpen && (
                  <ul
                    role="listbox"
                    aria-labelledby="dash-plan-label"
                    className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border-2 border-border bg-popover py-1 shadow-xl"
                  >
                    {selectedCarrier.plans.map((p) => (
                      <li key={p} role="option" aria-selected={p === selectedPlan}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPlan(p)
                            setPlanOpen(false)
                          }}
                          className={cn(
                            'flex min-h-[52px] w-full items-center justify-between gap-2 px-5 py-3 text-left text-lg transition-colors hover:bg-accent hover:text-accent-foreground',
                            p === selectedPlan && 'font-bold text-primary',
                          )}
                        >
                          {p}
                          {p === selectedPlan && (
                            <Check
                              className="size-5 shrink-0 text-primary"
                              aria-hidden="true"
                            />
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-xl border-2 border-destructive/40 bg-destructive/10 px-4 py-2 text-base font-semibold text-destructive"
            >
              {error}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-lg font-extrabold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
            >
              {saving ? 'Saving…' : 'Save insurance'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-border bg-card px-6 text-lg font-bold text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
