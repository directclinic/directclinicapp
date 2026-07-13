'use client'

import { TRANSLATIONS } from '@/lib/i18n'
import { useAccessibility } from '@/lib/use-accessibility'
import { IntakeHeader } from '@/components/intake-header'
import { IntakeForm } from '@/components/intake-form'

export default function IntakePage() {
  const { language, setLanguage, fontStep, setFontStep } = useAccessibility()
  const strings = TRANSLATIONS[language]

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
          <h1 className="text-balance text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">
            {strings.intake.welcomeTitle}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
            {strings.intake.welcomeSubtitle}
          </p>
        </div>

        <IntakeForm strings={strings} />
      </main>
    </div>
  )
}
