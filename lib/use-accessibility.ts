'use client'

import { useCallback, useEffect, useState } from 'react'
import { LANGUAGES, type LanguageCode } from '@/lib/i18n'

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
export function useAccessibility() {
  const [language, setLanguageState] = useState<LanguageCode>('en')
  const [fontStep, setFontStepState] = useState(1)

  // Load saved preferences on mount.
  useEffect(() => {
    const savedLang = localStorage.getItem(LANG_KEY)
    if (isLanguageCode(savedLang)) setLanguageState(savedLang)

    const savedFont = Number(localStorage.getItem(FONT_KEY))
    if (Number.isInteger(savedFont) && savedFont >= MIN_STEP && savedFont <= MAX_STEP) {
      setFontStepState(savedFont)
    }
  }, [])

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
  }, [])

  const setFontStep = useCallback((step: number) => {
    const clamped = Math.min(MAX_STEP, Math.max(MIN_STEP, step))
    setFontStepState(clamped)
    localStorage.setItem(FONT_KEY, String(clamped))
  }, [])

  return { language, setLanguage, fontStep, setFontStep }
}
