'use client'

import { useCallback, useEffect, useState } from 'react'
import { LANGUAGES, type LanguageCode } from '@/lib/i18n'
import { saveLanguage } from '@/app/actions/account'

// px applied to the document root so every rem-based size scales together.
export const FONT_STEPS = [16, 18, 20, 22, 24]
export const MIN_STEP = 0
export const MAX_STEP = FONT_STEPS.length - 1

const LANG_KEY = 'dc_language'
const FONT_KEY = 'dc_font_step'

function isLanguageCode(v: string | null): v is LanguageCode {
  return !!v && LANGUAGES.some((l) => l.code === v)
}

/**
 * Shared accessibility preferences (language + text size) persisted to
 * localStorage so a senior's choices carry across the intake and map pages.
 * This stores UI preferences only — never medical or personal data.
 */
export function useAccessibility(initialLanguage?: LanguageCode) {
  const [language, setLanguageState] = useState<LanguageCode>(
    initialLanguage ?? 'en',
  )
  const [fontStep, setFontStepState] = useState(1)

  // Load saved preferences on mount. localStorage (this device) wins over the
  // server-provided default so the switch feels instant on repeat visits.
  useEffect(() => {
    const savedLang = localStorage.getItem(LANG_KEY)
    if (isLanguageCode(savedLang)) setLanguageState(savedLang)
    else if (initialLanguage) localStorage.setItem(LANG_KEY, initialLanguage)

    const savedFont = Number(localStorage.getItem(FONT_KEY))
    if (Number.isInteger(savedFont) && savedFont >= MIN_STEP && savedFont <= MAX_STEP) {
      setFontStepState(savedFont)
    }
  }, [initialLanguage])

  // Scale every rem-based size in the UI by adjusting the root font size.
  useEffect(() => {
    const root = document.documentElement
    root.style.fontSize = `${FONT_STEPS[fontStep]}px`
    return () => {
      root.style.fontSize = ''
    }
  }, [fontStep])

  const setLanguage = useCallback((code: LanguageCode) => {
    setLanguageState(code)
    localStorage.setItem(LANG_KEY, code)
    // Persist to the account too (best-effort) so it follows the user across
    // devices. Ignored silently when signed out.
    void saveLanguage(code).catch(() => {})
  }, [])

  const setFontStep = useCallback((step: number) => {
    const clamped = Math.min(MAX_STEP, Math.max(MIN_STEP, step))
    setFontStepState(clamped)
    localStorage.setItem(FONT_KEY, String(clamped))
  }, [])

  return { language, setLanguage, fontStep, setFontStep }
}
