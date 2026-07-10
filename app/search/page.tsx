'use client'

import { Suspense, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import {
  DOCTORS,
  CARRIER_ID_BY_NAME,
  estimateCopay,
  type Doctor,
} from '@/lib/doctors'
import { TRANSLATIONS } from '@/lib/i18n'
import { type CareId } from '@/lib/intake'
import { useAccessibility, MIN_STEP, MAX_STEP } from '@/lib/use-accessibility'
import { TopNav } from '@/components/top-nav'
import { SearchFilterBar } from '@/components/search-filter-bar'
import { DoctorCard } from '@/components/doctor-card'
import { BookingModal } from '@/components/booking-modal'

// Leaflet touches `window`, so load the map only on the client.
const DoctorMap = dynamic(() => import('@/components/doctor-map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#e8eef5] text-lg font-medium text-muted-foreground">
      Loading live NYC map…
    </div>
  ),
})

function SearchView() {
  const { language, setLanguage, fontStep, setFontStep } = useAccessibility()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState('')
  const [activeBorough, setActiveBorough] = useState<string>('All Boroughs')
  const [focused, setFocused] = useState<Doctor | null>(null)
  // The doctor whose booking modal is currently open (null when closed).
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const strings = TRANSLATIONS[language]

  // Intake selections passed in from the onboarding page.
  const carrier = searchParams.get('carrier')
  const plan = searchParams.get('plan')
  const care = searchParams.get('care') as CareId | null
  const carrierId = carrier ? CARRIER_ID_BY_NAME[carrier] ?? null : null

  const insuranceLabel = carrier
    ? `${carrier}${plan ? ` · ${plan}` : ''}`
    : undefined
  const careLabel =
    care && strings.intake.care[care] ? strings.intake.care[care] : undefined

  // Co-pay is determined by the chosen plan + care type, so it is uniform across
  // in-network results for this selection.
  const estimatedCopay = useMemo(
    () => (plan ? estimateCopay(plan, care, 20) : null),
    [plan, care],
  )

  const doctors = useMemo(() => {
    const q = query.trim().toLowerCase()
    return DOCTORS.filter((d) => {
      // Care type is the primary filter: only doctors who provide it are shown.
      const careOk = !care || d.careTypes.includes(care)
      // Insurance filter: when a carrier is chosen, only show in-network clinics.
      const networkOk = !carrierId || d.acceptedCarriers.includes(carrierId)
      const boroughOk =
        activeBorough === 'All Boroughs' || d.borough === activeBorough
      const queryOk =
        q === '' ||
        d.neighborhood.toLowerCase().includes(q) ||
        d.borough.toLowerCase().includes(q) ||
        d.fullName.toLowerCase().includes(q) ||
        d.specialty.toLowerCase().includes(q)
      return careOk && networkOk && boroughOk && queryOk
    })
      // Apply the co-pay estimated from the selected plan + care type.
      .map((d) => ({ ...d, copayUsd: estimatedCopay ?? d.copayUsd }))
      .sort((a, b) => b.rating - a.rating)
  }, [query, activeBorough, care, carrierId, estimatedCopay])

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
                onBook={() => setBookingDoctor(d)}
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
            insuranceLabel={insuranceLabel}
            careLabel={careLabel}
          />
          <div className="h-full w-full">
            <DoctorMap
              doctors={doctors}
              focused={focused}
              onSelect={setFocused}
              copayLabel={strings.copay}
            />
          </div>
        </section>
      </div>

      {bookingDoctor && (
        <BookingModal
          doctor={bookingDoctor}
          strings={strings}
          language={language}
          onClose={() => setBookingDoctor(null)}
        />
      )}
    </div>
  )
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex h-dvh items-center justify-center bg-background text-lg font-medium text-muted-foreground">
          Loading…
        </div>
      }
    >
      <SearchView />
    </Suspense>
  )
}
