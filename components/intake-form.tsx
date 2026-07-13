'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Activity,
  ArrowRight,
  Check,
  ChevronDown,
  Eye,
  HeartHandshake,
  Lock,
  ShieldCheck,
  Smile,
  Stethoscope,
  type LucideIcon,
} from 'lucide-react'
import type { Strings } from '@/lib/i18n'
import {
  CARE_OPTIONS,
  INSURANCE_CARRIERS,
  type CareId,
} from '@/lib/intake'
import { saveInsurance } from '@/app/actions/account'
import { cn } from '@/lib/utils'

const CARE_ICONS: Record<CareId, LucideIcon> = {
  pcp: Stethoscope,
  dental: Smile,
  eye: Eye,
  physical: Activity,
  geriatric: HeartHandshake,
}

export function IntakeForm({ strings }: { strings: Strings }) {
  const router = useRouter()
  const [carrierId, setCarrierId] = useState<string | null>(null)
  const [plan, setPlan] = useState<string | null>(null)
  const [care, setCare] = useState<CareId | null>(null)
  const [planOpen, setPlanOpen] = useState(false)
  const [attempted, setAttempted] = useState(false)
  const planRef = useRef<HTMLDivElement>(null)

  const carrier = useMemo(
    () => INSURANCE_CARRIERS.find((c) => c.id === carrierId) ?? null,
    [carrierId],
  )

  // Close the plan dropdown when clicking outside.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (planRef.current && !planRef.current.contains(e.target as Node)) {
        setPlanOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const ready = Boolean(carrier && plan && care)

  async function handleSubmit() {
    if (!ready || !carrier || !plan || !care) {
      setAttempted(true)
      return
    }
    // Save the chosen insurance to the patient's profile so it persists and
    // can be edited later from the dashboard. Don't block navigation on it.
    void saveInsurance({ carrier: carrier.name, plan })
    // Pass the intake selections into the NYC map page query.
    const params = new URLSearchParams({
      carrier: carrier.name,
      plan,
      care,
    })
    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="rounded-3xl border-2 border-border bg-card p-6 shadow-sm sm:p-8">
        {/* SECTION A: Insurance carrier */}
        <section aria-labelledby="step-1-label">
          <h2
            id="step-1-label"
            className="text-pretty text-2xl font-extrabold leading-tight text-foreground sm:text-3xl"
          >
            {strings.intake.step1Label}
          </h2>
          <p className="mt-1 text-lg text-muted-foreground">{strings.intake.step1Help}</p>

          <div
            role="radiogroup"
            aria-label={strings.intake.selectCarrier}
            className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2"
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
                    setPlan(null)
                    setPlanOpen(false)
                  }}
                  className={cn(
                    'flex min-h-[60px] items-center justify-between gap-3 rounded-2xl border-2 px-5 py-3 text-left text-lg font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40',
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

          {/* Plan dropdown appears once a carrier is chosen */}
          {carrier && (
            <div className="mt-5" ref={planRef}>
              <label
                id="plan-label"
                className="block text-xl font-bold text-foreground"
              >
                {strings.intake.planLabel}
              </label>
              <div className="relative mt-2">
                <button
                  type="button"
                  onClick={() => setPlanOpen((o) => !o)}
                  aria-haspopup="listbox"
                  aria-expanded={planOpen}
                  aria-labelledby="plan-label"
                  className={cn(
                    'flex min-h-[60px] w-full items-center justify-between gap-3 rounded-2xl border-2 bg-card px-5 text-left text-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40',
                    plan ? 'border-primary text-foreground' : 'border-border text-muted-foreground',
                  )}
                >
                  {plan ?? strings.intake.selectPlan}
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
                    aria-labelledby="plan-label"
                    className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border-2 border-border bg-popover py-1 shadow-xl"
                  >
                    {carrier.plans.map((p) => (
                      <li key={p} role="option" aria-selected={p === plan}>
                        <button
                          type="button"
                          onClick={() => {
                            setPlan(p)
                            setPlanOpen(false)
                          }}
                          className={cn(
                            'flex min-h-[56px] w-full items-center justify-between gap-2 px-5 py-3 text-left text-lg transition-colors hover:bg-accent hover:text-accent-foreground',
                            p === plan && 'font-bold text-primary',
                          )}
                        >
                          {p}
                          {p === plan && (
                            <Check className="size-5 shrink-0 text-primary" aria-hidden="true" />
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </section>

        <hr className="my-7 border-border" />

        {/* SECTION B: General care selection */}
        <section aria-labelledby="step-2-label">
          <h2
            id="step-2-label"
            className="text-pretty text-2xl font-extrabold leading-tight text-foreground sm:text-3xl"
          >
            {strings.intake.step2Label}
          </h2>
          <p className="mt-1 text-lg text-muted-foreground">{strings.intake.step2Help}</p>

          <div
            role="radiogroup"
            aria-label={strings.intake.step2Label}
            className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3"
          >
            {CARE_OPTIONS.map((option) => {
              const Icon = CARE_ICONS[option.id]
              const active = care === option.id
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setCare(option.id)}
                  className={cn(
                    'flex min-h-[120px] flex-col items-center justify-center gap-3 rounded-2xl border-2 p-4 text-center text-lg font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40',
                    active
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-foreground hover:border-primary hover:text-primary',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-14 items-center justify-center rounded-2xl',
                      active ? 'bg-primary-foreground/20' : 'bg-accent',
                    )}
                    aria-hidden="true"
                  >
                    <Icon className={cn('size-8', active ? 'text-primary-foreground' : 'text-primary')} />
                  </span>
                  <span className="text-pretty leading-tight">{strings.intake.care[option.id]}</span>
                </button>
              )
            })}
          </div>
        </section>

        {/* Gentle validation hint */}
        {attempted && !ready && (
          <p
            role="alert"
            className="mt-6 rounded-xl border-2 border-dashed border-primary/50 bg-accent px-4 py-3 text-center text-base font-semibold text-accent-foreground"
          >
            {strings.intake.step1Help} {strings.intake.step2Help}
          </p>
        )}

        {/* SECTION C: Start finder button */}
        <button
          type="button"
          onClick={handleSubmit}
          aria-disabled={!ready}
          className={cn(
            'mt-6 flex min-h-[72px] w-full items-center justify-center gap-3 rounded-2xl px-6 text-xl font-extrabold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 sm:text-2xl',
            ready
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'cursor-not-allowed bg-primary/40 text-primary-foreground',
          )}
        >
          {strings.intake.findButton}
          <ArrowRight className="size-7 shrink-0" aria-hidden="true" />
        </button>

        {/* Security / privacy badge */}
        <p className="mt-4 flex items-start justify-center gap-2 text-pretty text-center text-base leading-relaxed text-success-muted-foreground">
          <Lock className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <span>{strings.intake.privacyBadge}</span>
        </p>
      </div>

      {/* Trust footer */}
      <p className="mt-6 flex items-center justify-center gap-2 text-center text-base font-medium text-muted-foreground">
        <ShieldCheck className="size-5 shrink-0 text-success" aria-hidden="true" />
        {strings.verified}
      </p>
    </div>
  )
}
