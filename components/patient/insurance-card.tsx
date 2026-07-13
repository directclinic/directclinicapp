'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ShieldCheck,
  Check,
  ChevronDown,
  Pencil,
  X,
} from 'lucide-react'
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
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Preselect the current carrier (matched by display name) when editing.
  const initialCarrierId = useMemo(
    () => INSURANCE_CARRIERS.find((c) => c.name === carrier)?.id ?? null,
    [carrier],
  )
  const [carrierId, setCarrierId] = useState<string | null>(initialCarrierId)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(plan)
  const [planOpen, setPlanOpen] = useState(false)

  const selectedCarrier = useMemo(
    () => INSURANCE_CARRIERS.find((c) => c.id === carrierId) ?? null,
    [carrierId],
  )

  const ready = Boolean(selectedCarrier && selectedPlan)

  function cancel() {
    setEditing(false)
    setError(null)
    setPlanOpen(false)
    setCarrierId(initialCarrierId)
    setSelectedPlan(plan)
  }

  async function handleSave() {
    if (!ready || !selectedCarrier || !selectedPlan) return
    setSaving(true)
    setError(null)
    const result = await saveInsurance({
      carrier: selectedCarrier.name,
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

  return (
    <section
      aria-labelledby="insurance-heading"
      className="mb-8 rounded-3xl border-2 border-border bg-card p-6 shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck className="size-6" aria-hidden="true" />
          </span>
          <div>
            <h2
              id="insurance-heading"
              className="text-xl font-extrabold text-foreground"
            >
              Your insurance
            </h2>
            <p className="text-base text-muted-foreground">
              Used to find in-network care.
            </p>
          </div>
        </div>

        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-border bg-card px-4 text-base font-bold text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
          >
            <Pencil className="size-4 shrink-0" aria-hidden="true" />
            Change
          </button>
        )}
      </div>

      {!editing ? (
        <div className="mt-5">
          {carrier && plan ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-accent px-4 py-2 text-lg font-bold text-accent-foreground">
                {carrier}
              </span>
              <span className="rounded-full border-2 border-border px-4 py-2 text-lg font-semibold text-foreground">
                {plan}
              </span>
            </div>
          ) : (
            <p className="rounded-2xl border-2 border-dashed border-border bg-muted/40 px-4 py-4 text-pretty text-base font-medium text-muted-foreground">
              You haven&apos;t added your insurance yet. Add it so we can match
              you with in-network doctors.
            </p>
          )}
        </div>
      ) : (
        <div className="mt-5 space-y-5">
          {/* Carrier picker */}
          <div>
            <p className="mb-2 text-lg font-bold text-foreground">
              Insurance carrier
            </p>
            <div
              role="radiogroup"
              aria-label="Insurance carrier"
              className="grid grid-cols-1 gap-3 sm:grid-cols-2"
            >
              {INSURANCE_CARRIERS.map((c) => {
                const active = c.id === carrierId
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => {
                      setCarrierId(c.id)
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
                        'flex size-7 shrink-0 items-center justify-center rounded-full border-2',
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
          </div>

          {/* Plan picker */}
          {selectedCarrier && (
            <div>
              <p className="mb-2 text-lg font-bold text-foreground">Plan</p>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setPlanOpen((o) => !o)}
                  aria-haspopup="listbox"
                  aria-expanded={planOpen}
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
              className="rounded-xl border-2 border-destructive/40 bg-destructive/10 px-4 py-2 text-base font-semibold text-destructive"
            >
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={!ready || saving}
              className={cn(
                'inline-flex min-h-12 items-center gap-2 rounded-xl px-5 text-lg font-extrabold text-primary-foreground transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40',
                ready && !saving
                  ? 'bg-primary hover:bg-primary/90'
                  : 'cursor-not-allowed bg-primary/40',
              )}
            >
              <Check className="size-5 shrink-0" aria-hidden="true" />
              {saving ? 'Saving…' : 'Save insurance'}
            </button>
            <button
              type="button"
              onClick={cancel}
              className="inline-flex min-h-12 items-center gap-2 rounded-xl border-2 border-border bg-card px-5 text-lg font-bold text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
            >
              <X className="size-5 shrink-0" aria-hidden="true" />
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
