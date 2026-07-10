'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { DOCTORS, type Doctor } from '@/lib/doctors'
import { TRANSLATIONS, type LanguageCode } from '@/lib/i18n'
import { TopNav } from '@/components/top-nav'
import { SearchFilterBar } from '@/components/search-filter-bar'
import { DoctorCard } from '@/components/doctor-card'

// Leaflet touches `window`, so load the map only on the client.
const DoctorMap = dynamic(() => import('@/components/doctor-map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#e8eef5] text-lg font-medium text-muted-foreground">
      Loading live NYC map…
    </div>
  ),
})

const FONT_STEPS = [16, 18, 20, 22, 24] // px applied to the document root
const MIN_STEP = 0
const MAX_STEP = FONT_STEPS.length - 1

export default function Page() {
  const [language, setLanguage] = useState<LanguageCode>('en')
  const [fontStep, setFontStep] = useState(1)
  const [query, setQuery] = useState('')
  const [activeBorough, setActiveBorough] = useState<string>('All Boroughs')
  const [focused, setFocused] = useState<Doctor | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const strings = TRANSLATIONS[language]

  // Scale every rem-based size in the UI by adjusting the root font size.
  useEffect(() => {
    const root = document.documentElement
    root.style.fontSize = `${FONT_STEPS[fontStep]}px`
    return () => {
      root.style.fontSize = ''
    }
  }, [fontStep])

  const doctors = useMemo(() => {
    const q = query.trim().toLowerCase()
    return DOCTORS.filter((d) => {
      const boroughOk =
        activeBorough === 'All Boroughs' || d.borough === activeBorough
      const queryOk =
        q === '' ||
        d.neighborhood.toLowerCase().includes(q) ||
        d.borough.toLowerCase().includes(q) ||
        d.fullName.toLowerCase().includes(q) ||
        d.specialty.toLowerCase().includes(q)
      return boroughOk && queryOk
    })
  }, [query, activeBorough])

  function handleDirections(d: Doctor) {
    setFocused(d)
  }

  return (
    <div className="flex h-dvh flex-col bg-background">
      <TopNav
        language={language}
        setLanguage={setLanguage}
        strings={strings}
        fontStep={fontStep}
        setFontStep={setFontStep}
        minStep={MIN_STEP}
        maxStep={MAX_STEP}
      />

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Left: doctor listings */}
        <section
          aria-label="Doctor listings"
          className="flex min-h-0 flex-col border-b-2 border-border lg:w-[480px] lg:border-b-0 lg:border-r-2 xl:w-[540px]"
        >
          <div className="border-b-2 border-border bg-card px-5 py-4">
            <h1 className="text-pretty text-2xl font-extrabold leading-tight text-foreground sm:text-3xl">
              <span className="text-primary">{doctors.length}</span>{' '}
              {strings.doctorsFoundPrefix}
            </h1>
          </div>
          <div
            ref={listRef}
            className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-background p-4"
          >
            {doctors.map((d, i) => (
              <DoctorCard
                key={d.id}
                doctor={d}
                strings={strings}
                tone={i}
                isFocused={focused?.id === d.id}
                onSelect={() => setFocused(d)}
                onDirections={() => handleDirections(d)}
              />
            ))}
            {doctors.length === 0 && (
              <p className="rounded-xl border-2 border-dashed border-border p-8 text-center text-lg text-muted-foreground">
                No in-network doctors match your search. Try another borough.
              </p>
            )}
          </div>
        </section>

        {/* Right: live interactive map */}
        <section
          aria-label="Interactive map of New York City"
          className="relative min-h-[420px] flex-1"
        >
          <SearchFilterBar
            strings={strings}
            query={query}
            setQuery={setQuery}
            activeBorough={activeBorough}
            setActiveBorough={setActiveBorough}
          />
          <div className="h-full w-full">
            <DoctorMap
              doctors={doctors}
              focused={focused}
              onSelect={setFocused}
            />
          </div>
        </section>
      </div>
    </div>
  )
}
