'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
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

interface AccessibilityValue {
  language: LanguageCode
  setLanguage: (c: LanguageCode) => void
  fontStep: number
  setFontStep: (n: number) => void
}

const AccessibilityContext = createContext<AccessibilityValue | null>(null)

/**
 * Provides shared accessibility preferences (language + text size) to the whole
 * app. Mounted once in the root layout, which the Next.js App Router keeps alive
 * across page navigations — so a senior's language choice on the intake page
 * stays consistent on the map, booking, and every other page with no reset or
 * flash. Preferences are also mirrored to localStorage so they survive reloads.
 * This stores UI preferences only — never medical or personal data.
 */
export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('en')
  const [fontStep, setFontStepState] = useState(1)

  // Load saved preferences on first mount.
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
    document.documentElement.style.fontSize = `${FONT_STEPS[fontStep]}px`
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

  return (
    <AccessibilityContext.Provider
      value={{ language, setLanguage, fontStep, setFontStep }}
    >
      {children}
    </AccessibilityContext.Provider>
  )
}

/**
 * Read the shared language + text-size preferences. Must be used inside
 * <AccessibilityProvider> (mounted in the root layout).
 */
export function useAccessibility() {
  const ctx = useContext(AccessibilityContext)
  if (!ctx) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider')
  }
  return ctx
}
