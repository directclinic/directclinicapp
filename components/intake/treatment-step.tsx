'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Activity,
  ArrowRight,
  Eye,
  HeartHandshake,
  Pencil,
  ShieldCheck,
  Smile,
  Stethoscope,
  type LucideIcon,
} from 'lucide-react'
import { TRANSLATIONS, type LanguageCode } from '@/lib/i18n'
import { CARE_OPTIONS, CARE_DESCRIPTIONS, type CareId } from '@/lib/intake'
import { useAccessibility } from '@/lib/use-accessibility'
import { IntakeHeader } from '@/components/intake-header'
import { cn } from '@/lib/utils'

const CARE_ICONS: Record<CareId, LucideIcon> = {
  pcp: Stethoscope,
  dental: Smile,
  eye: Eye,
  physical: Activity,
  geriatric: HeartHandshake,
}

export function TreatmentStep({
  initialLanguage,
  carrierName,
  plan,
}: {
  initialLanguage: LanguageCode
  carrierName: string
  plan: string
}) {
  const router = useRouter()
  const { language, setLanguage, fontStep, setFontStep } =
    useAccessibility(initialLanguage)
  const strings = TRANSLATIONS[language]
  const [care, setCare] = useState<CareId | null>(null)
  const [attempted, setAttempted] = useState(false)

  function handleSubmit() {
    if (!care) {
      setAttempted(true)
      return
    }
    const params = new URLSearchParams({ carrier: carrierName, plan, care })
    router.push(`/search?${params.toString()}`)
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
          <p className="mb-2 text-lg font-bold text-primary">Step 2 of 2</p>
          <h1 className="text-balance text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">
            {strings.intake.step2Label.replace(/^2\.\s*/, '')}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
            {strings.intake.step2Help}
          </p>
        </div>

        <div className="mx-auto w-full max-w-3xl">
          {/* Saved insurance banner with a change link */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-success/40 bg-success-muted px-5 py-4">
            <span className="flex items-center gap-3 text-base font-semibold text-success-muted-foreground sm:text-lg">
              <ShieldCheck className="size-6 shrink-0 text-success" aria-hidden="true" />
              <span>
                Using your insurance:{' '}
                <strong className="font-extrabold">{carrierName}</strong>
                {' — '}
                {plan}
              </span>
            </span>
            <Link
              href="/intake?change=1"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-border bg-card px-4 text-base font-bold text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
            >
              <Pencil className="size-4 shrink-0" aria-hidden="true" />
              Change insurance
            </Link>
          </div>

          <div className="rounded-3xl border-2 border-border bg-card p-6 shadow-sm sm:p-8">
            <div
              role="radiogroup"
              aria-label={strings.intake.step2Label}
              className="grid grid-cols-1 gap-3 sm:grid-cols-2"
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
                      'flex items-start gap-4 rounded-2xl border-2 p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40',
                      active
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card text-foreground hover:border-primary',
                    )}
                  >
                    <span
                      className={cn(
                        'flex size-14 shrink-0 items-center justify-center rounded-2xl',
                        active ? 'bg-primary-foreground/20' : 'bg-accent',
                      )}
                      aria-hidden="true"
                    >
                      <Icon
                        className={cn(
                          'size-8',
                          active ? 'text-primary-foreground' : 'text-primary',
                        )}
                      />
                    </span>
                    <span className="flex flex-col gap-1">
                      <span className="text-pretty text-lg font-bold leading-tight">
                        {strings.intake.care[option.id]}
                      </span>
                      <span
                        className={cn(
                          'text-pretty text-base leading-snug',
                          active
                            ? 'text-primary-foreground/85'
                            : 'text-muted-foreground',
                        )}
                      >
                        {CARE_DESCRIPTIONS[option.id]}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>

            {attempted && !care && (
              <p
                role="alert"
                className="mt-6 rounded-xl border-2 border-dashed border-primary/50 bg-accent px-4 py-3 text-center text-base font-semibold text-accent-foreground"
              >
                {strings.intake.step2Help}
              </p>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              aria-disabled={!care}
              className={cn(
                'mt-6 flex min-h-[72px] w-full items-center justify-center gap-3 rounded-2xl px-6 text-xl font-extrabold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 sm:text-2xl',
                care
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'cursor-not-allowed bg-primary/40 text-primary-foreground',
              )}
            >
              {strings.intake.findButton}
              <ArrowRight className="size-7 shrink-0" aria-hidden="true" />
            </button>
          </div>

          <p className="mt-6 flex items-center justify-center gap-2 text-center text-base font-medium text-muted-foreground">
            <ShieldCheck className="size-5 shrink-0 text-success" aria-hidden="true" />
            {strings.verified}
          </p>
        </div>
      </main>
    </div>
  )
}
