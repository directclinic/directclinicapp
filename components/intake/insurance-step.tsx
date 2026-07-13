'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Check, ChevronDown, Lock } from 'lucide-react'
import { TRANSLATIONS, type LanguageCode } from '@/lib/i18n'
import { INSURANCE_CARRIERS } from '@/lib/intake'
import { saveInsurance } from '@/app/actions/account'
import { useAccessibility } from '@/lib/use-accessibility'
import { IntakeHeader } from '@/components/intake-header'
import { cn } from '@/lib/utils'

export function InsuranceStep({
  initialLanguage,
  initialCarrierName,
  initialPlan,
}: {
  initialLanguage: LanguageCode
  initialCarrierName?: string | null
  initialPlan?: string | null
}) {
  const router = useRouter()
  const { language, setLanguage, fontStep, setFontStep } =
    useAccessibility(initialLanguage)
  const strings = TRANSLATIONS[language]

  // Preselect the saved carrier/plan (used when the patient taps "Change").
  const initialCarrierId =
    INSURANCE_CARRIERS.find((c) => c.name === initialCarrierName)?.id ?? null
  const [carrierId, setCarrierId] = useState<string | null>(initialCarrierId)
  const [plan, setPlan] = useState<string | null>(initialPlan ?? null)
  const [planOpen, setPlanOpen] = useState(false)
  const [attempted, setAttempted] = useState(false)
  const [saving, setSaving] = useState(false)
  const planRef = useRef<HTMLDivElement>(null)

  const carrier = useMemo(
    () => INSURANCE_CARRIERS.find((c) => c.id === carrierId) ?? null,
    [carrierId],
  )

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (planRef.current && !planRef.current.contains(e.target as Node)) {
        setPlanOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const ready = Boolean(carrier && plan)

  async function handleContinue() {
    if (!ready || !carrier || !plan) {
      setAttempted(true)
      return
    }
    setSaving(true)
    await saveInsurance({ carrier: carrier.name, plan })
    router.push('/intake/treatment')
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <IntakeHeader
        language={language}
        setLanguage={setLanguage}
        strings={strings}
        fontStep={fontStep}
        setFontStep={setFontStep}
      />

      <main className="flex-1 px-4 py-8 sm:py-12">
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <p className="mb-2 text-lg font-bold text-primary">Step 1 of 2</p>
          <h1 className="text-balance text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">
            {strings.intake.step1Label.replace(/^1\.\s*/, '')}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
            {strings.intake.step1Help}
          </p>
        </div>

        <div className="mx-auto w-full max-w-3xl">
          <div className="rounded-3xl border-2 border-border bg-card p-6 shadow-sm sm:p-8">
            <div
              role="radiogroup"
              aria-label={strings.intake.selectCarrier}
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
                      plan
                        ? 'border-primary text-foreground'
                        : 'border-border text-muted-foreground',
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

            {attempted && !ready && (
              <p
                role="alert"
                className="mt-6 rounded-xl border-2 border-dashed border-primary/50 bg-accent px-4 py-3 text-center text-base font-semibold text-accent-foreground"
              >
                {strings.intake.step1Help}
              </p>
            )}

            <button
              type="button"
              onClick={handleContinue}
              aria-disabled={!ready}
              disabled={saving}
              className={cn(
                'mt-6 flex min-h-[72px] w-full items-center justify-center gap-3 rounded-2xl px-6 text-xl font-extrabold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 sm:text-2xl',
                ready
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'cursor-not-allowed bg-primary/40 text-primary-foreground',
              )}
            >
              Continue
              <ArrowRight className="size-7 shrink-0" aria-hidden="true" />
            </button>

            <p className="mt-4 flex items-start justify-center gap-2 text-pretty text-center text-base leading-relaxed text-success-muted-foreground">
              <Lock className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
              <span>{strings.intake.privacyBadge}</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
