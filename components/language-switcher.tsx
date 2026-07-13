'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Globe } from 'lucide-react'
import { LANGUAGES, type LanguageCode } from '@/lib/i18n'
import { useAccessibility } from '@/lib/use-accessibility'
import { cn } from '@/lib/utils'

/**
 * Standalone language selector for pages that don't use the full IntakeHeader
 * (e.g. the patient dashboard). Changing the language persists to this device
 * and to the patient's account so it stays their default everywhere.
 */
export function LanguageSwitcher({
  initialLanguage,
}: {
  initialLanguage?: LanguageCode
}) {
  const { language, setLanguage } = useAccessibility(initialLanguage)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const current = LANGUAGES.find((l) => l.code === language)!

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Language"
        className="inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-border bg-card px-4 text-base font-bold text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
      >
        <Globe className="size-5 shrink-0" aria-hidden="true" />
        {current.englishLabel}
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-[1200] mt-2 w-64 overflow-hidden rounded-xl border-2 border-border bg-popover py-1 shadow-xl"
        >
          {LANGUAGES.map((lang) => (
            <li
              key={lang.code}
              role="option"
              aria-selected={lang.code === language}
            >
              <button
                type="button"
                onClick={() => {
                  setLanguage(lang.code)
                  setOpen(false)
                }}
                className={cn(
                  'flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-lg transition-colors hover:bg-accent hover:text-accent-foreground',
                  lang.code === language && 'font-bold text-primary',
                )}
              >
                <span>
                  {lang.englishLabel}
                  <span className="ml-2 text-muted-foreground">
                    {lang.label}
                  </span>
                </span>
                {lang.code === language && (
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
  )
}
