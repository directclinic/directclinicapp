'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, Globe, Check, Minus, Plus, Stethoscope } from 'lucide-react'
import {
  LANGUAGES,
  type LanguageCode,
  type Strings,
} from '@/lib/i18n'
import { cn } from '@/lib/utils'

export function TopNav({
  language,
  setLanguage,
  strings,
  fontStep,
  setFontStep,
  minStep,
  maxStep,
}: {
  language: LanguageCode
  setLanguage: (c: LanguageCode) => void
  strings: Strings
  fontStep: number
  setFontStep: (n: number) => void
  minStep: number
  maxStep: number
}) {
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
    <header className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-border bg-card px-4 py-3 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="inline-flex min-h-14 items-center gap-2 rounded-xl border-2 border-primary bg-card px-5 text-lg font-bold text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
        >
          <ChevronLeft className="size-6 shrink-0" aria-hidden="true" />
          {strings.back}
        </button>
        <div className="hidden items-center gap-2 sm:flex">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Stethoscope className="size-6" aria-hidden="true" />
          </span>
          <span className="text-xl font-bold text-foreground">NYC Care Finder</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Text size toggle */}
        <div
          className="flex items-center gap-1 rounded-xl border-2 border-border bg-card p-1"
          role="group"
          aria-label={strings.textSize}
        >
          <span className="px-2 text-base font-semibold text-muted-foreground">
            {strings.textSize}
          </span>
          <button
            type="button"
            onClick={() => setFontStep(Math.max(minStep, fontStep - 1))}
            disabled={fontStep <= minStep}
            aria-label={strings.decreaseText}
            className="inline-flex size-12 items-center justify-center rounded-lg bg-secondary text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground disabled:opacity-40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
          >
            <Minus className="size-4" aria-hidden="true" />
            <span aria-hidden="true" className="text-base font-bold">A</span>
          </button>
          <button
            type="button"
            onClick={() => setFontStep(Math.min(maxStep, fontStep + 1))}
            disabled={fontStep >= maxStep}
            aria-label={strings.increaseText}
            className="inline-flex size-12 items-center justify-center rounded-lg bg-secondary text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground disabled:opacity-40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
          >
            <span aria-hidden="true" className="text-lg font-bold">A</span>
            <Plus className="size-4" aria-hidden="true" />
          </button>
        </div>

        {/* Language selector */}
        <div className="relative" ref={ref}>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-label={strings.language}
            className="inline-flex min-h-14 items-center gap-2 rounded-xl bg-primary px-5 text-lg font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
          >
            <Globe className="size-6 shrink-0" aria-hidden="true" />
            {current.englishLabel}
          </button>
          {open && (
            <ul
              role="listbox"
              className="absolute right-0 z-[1200] mt-2 w-64 overflow-hidden rounded-xl border-2 border-border bg-popover py-1 shadow-xl"
            >
              {LANGUAGES.map((lang) => (
                <li key={lang.code} role="option" aria-selected={lang.code === language}>
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
                      <span className="ml-2 text-muted-foreground">{lang.label}</span>
                    </span>
                    {lang.code === language && (
                      <Check className="size-5 shrink-0 text-primary" aria-hidden="true" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </header>
  )
}
