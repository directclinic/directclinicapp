'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Check, Globe, Stethoscope } from 'lucide-react'
import { LANGUAGES, type LanguageCode } from '@/lib/i18n'
import { useAccessibility } from '@/lib/use-accessibility'
import { cn } from '@/lib/utils'

export function LanguagePicker({
  initialLanguage,
}: {
  initialLanguage: LanguageCode
}) {
  const router = useRouter()
  const { language, setLanguage } = useAccessibility(initialLanguage)
  const [saving, setSaving] = useState(false)

  function handleContinue() {
    setSaving(true)
    // Language is already persisted (device + account) via setLanguage.
    // New patients go to the insurance step next so we can save their plan
    // before they reach the dashboard.
    router.push('/intake')
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex items-center gap-2 border-b-2 border-border bg-card px-4 py-4 sm:px-6">
        <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Stethoscope className="size-6" aria-hidden="true" />
        </span>
        <span className="text-xl font-bold text-foreground">Insy Care</span>
      </header>

      <main className="flex-1 px-4 py-8 sm:py-12">
        <div className="mx-auto w-full max-w-2xl">
          <div className="mb-8 text-center">
            <span className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-accent text-primary">
              <Globe className="size-8" aria-hidden="true" />
            </span>
            <h1 className="text-balance text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">
              Choose your language
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
              We&apos;ll use this across Insy Care. You can change it anytime
              from the language button on any page.
            </p>
          </div>

          <div
            role="radiogroup"
            aria-label="Choose your language"
            className="grid grid-cols-1 gap-3 sm:grid-cols-2"
          >
            {LANGUAGES.map((lang) => {
              const active = lang.code === language
              return (
                <button
                  key={lang.code}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setLanguage(lang.code)}
                  className={cn(
                    'flex min-h-[72px] items-center justify-between gap-3 rounded-2xl border-2 px-5 py-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40',
                    active
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-foreground hover:border-primary hover:text-primary',
                  )}
                >
                  <span className="flex flex-col">
                    <span className="text-xl font-bold">{lang.label}</span>
                    <span
                      className={cn(
                        'text-base',
                        active
                          ? 'text-primary-foreground/80'
                          : 'text-muted-foreground',
                      )}
                    >
                      {lang.englishLabel}
                    </span>
                  </span>
                  <span
                    className={cn(
                      'flex size-8 shrink-0 items-center justify-center rounded-full border-2',
                      active
                        ? 'border-primary-foreground bg-primary-foreground/20'
                        : 'border-border',
                    )}
                    aria-hidden="true"
                  >
                    {active && <Check className="size-5" />}
                  </span>
                </button>
              )
            })}
          </div>

          <button
            type="button"
            onClick={handleContinue}
            disabled={saving}
            className="mt-8 flex min-h-[72px] w-full items-center justify-center gap-3 rounded-2xl bg-primary px-6 text-xl font-extrabold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 disabled:opacity-60 sm:text-2xl"
          >
            Continue
            <ArrowRight className="size-7 shrink-0" aria-hidden="true" />
          </button>
        </div>
      </main>
    </div>
  )
}
