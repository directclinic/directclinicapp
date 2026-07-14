'use client'

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import dynamic from 'next/dynamic'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  DOCTORS,
  CARRIER_ID_BY_NAME,
  estimateCopay,
  distanceMiles,
  clinicToDoctor,
  type ClinicRecord,
  type Doctor,
} from '@/lib/doctors'
import { createClient } from '@/lib/supabase/client'
import { geocodeAddress, reverseGeocode, type GeoResult } from '@/lib/geocode'
import { getRoute, type RouteResult } from '@/lib/routing'
import { TRANSLATIONS } from '@/lib/i18n'
import { type CareId } from '@/lib/intake'
import { useAccessibility, MIN_STEP, MAX_STEP } from '@/lib/use-accessibility'
import { TopNav } from '@/components/top-nav'
import { SearchFilterBar } from '@/components/search-filter-bar'
import { DoctorCard } from '@/components/doctor-card'
import { BookingModal } from '@/components/booking-modal'
import { DirectionsPanel } from '@/components/directions-panel'

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
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState('')
  const [activeBorough, setActiveBorough] = useState<string>('All Boroughs')
  const [focused, setFocused] = useState<Doctor | null>(null)
  // The doctor whose booking modal is currently open (null when closed).
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null)
  // The searcher's geocoded address; when set, results are sorted by proximity.
  const [userLocation, setUserLocation] = useState<GeoResult | null>(null)
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  // Live directions to a chosen clinic (route line + turn-by-turn steps).
  const [directionsTo, setDirectionsTo] = useState<Doctor | null>(null)
  const [route, setRoute] = useState<RouteResult | null>(null)
  const [routeStatus, setRouteStatus] = useState<
    'idle' | 'loading' | 'error' | 'denied'
  >('idle')
  const routeAbort = useRef<AbortController | null>(null)
  // Clinics registered by doctors/clinics in Supabase, merged into search.
  const [registered, setRegistered] = useState<Doctor[]>([])
  const listRef = useRef<HTMLDivElement>(null)
  const geoAbort = useRef<AbortController | null>(null)

  const strings = TRANSLATIONS[language]

  // Load real clinics once so patient bookings flow to their dashboards.
  useEffect(() => {
    let active = true
    const supabase = createClient()
    supabase
      .from('clinics')
      .select(
        'id, owner_id, name, provider_name, specialty, care_types, accepted_carriers, neighborhood, borough, address, phone, latitude, longitude, languages, copay_usd, accepting_new',
      )
      .then(({ data }) => {
        if (!active || !data) return
        const mapped = (data as ClinicRecord[])
          .map(clinicToDoctor)
          .filter((d): d is Doctor => d !== null)
        setRegistered(mapped)
      })
    return () => {
      active = false
    }
  }, [])

  // Geocode the typed address (via OpenStreetMap) and store the coordinates so
  // clinics can be sorted by real-world distance from that point.
  const handleAddressSearch = useCallback(async (address: string) => {
    const trimmed = address.trim()
    if (!trimmed) {
      setUserLocation(null)
      setGeoStatus('idle')
      return
    }
    geoAbort.current?.abort()
    const controller = new AbortController()
    geoAbort.current = controller
    setGeoStatus('loading')
    try {
      const result = await geocodeAddress(trimmed, controller.signal)
      if (controller.signal.aborted) return
      if (!result) {
        setUserLocation(null)
        setGeoStatus('error')
        return
      }
      setUserLocation(result)
      setGeoStatus('idle')
      setFocused(null)
      listRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      if (!controller.signal.aborted) setGeoStatus('error')
    }
  }, [])

  // Resolve the browser's GPS position, then reverse-geocode it to a label.
  const handleUseMyLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setGeoStatus('error')
      return
    }
    setGeoStatus('loading')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        const label = await reverseGeocode(latitude, longitude)
        setUserLocation({ lat: latitude, lng: longitude, label })
        setQuery(label)
        setGeoStatus('idle')
        setFocused(null)
        listRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
      },
      () => setGeoStatus('error'),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }, [])

  const clearLocation = useCallback(() => {
    geoAbort.current?.abort()
    setUserLocation(null)
    setGeoStatus('idle')
    setQuery('')
  }, [])

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
    // Registered clinics first so real listings surface alongside seed data.
    const all = [...registered, ...DOCTORS]
    const filtered = all.filter((d) => {
      // Care type is the primary filter: only doctors who provide it are shown.
      const careOk = !care || d.careTypes.includes(care)
      // Insurance filter: when a carrier is chosen, only show in-network clinics.
      const networkOk = !carrierId || d.acceptedCarriers.includes(carrierId)
      const boroughOk =
        activeBorough === 'All Boroughs' || d.borough === activeBorough
      return careOk && networkOk && boroughOk
    })
      // Apply the co-pay estimated from the selected plan + care type, plus the
      // real-world distance from the searcher's address (when one is set).
      .map((d) => ({
        ...d,
        copayUsd: estimatedCopay ?? d.copayUsd,
        distanceMi: userLocation
          ? distanceMiles(userLocation.lat, userLocation.lng, d.latitude, d.longitude)
          : undefined,
      }))
      // When an address is set, sort nearest-first; otherwise sort by rating.
      .sort((a, b) =>
        userLocation
          ? (a.distanceMi ?? Infinity) - (b.distanceMi ?? Infinity)
          : b.rating - a.rating,
      )

    // With an address set, narrow to clinics within a walkable/short-transit
    // radius. If nothing falls inside it (e.g. an address at the city's edge),
    // fall back to the nearest handful so the list is never empty.
    if (userLocation) {
      const RADIUS_MI = 4
      const MIN_RESULTS = 6
      const within = filtered.filter((d) => (d.distanceMi ?? Infinity) <= RADIUS_MI)
      return within.length >= MIN_RESULTS ? within : filtered.slice(0, MIN_RESULTS)
    }
    return filtered
  }, [activeBorough, care, carrierId, estimatedCopay, userLocation, registered])

  // Resolve a usable start point for directions: reuse the searcher's address
  // if they already set one, otherwise ask the browser for live GPS location.
  const resolveStartLocation = useCallback(async (): Promise<
    GeoResult | 'denied' | null
  > => {
    if (userLocation) return userLocation
    if (!('geolocation' in navigator)) return 'denied'
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords
          const label = await reverseGeocode(latitude, longitude)
          const loc = { lat: latitude, lng: longitude, label }
          setUserLocation(loc)
          setQuery(label)
          resolve(loc)
        },
        () => resolve('denied'),
        { enableHighAccuracy: true, timeout: 10000 },
      )
    })
  }, [userLocation])

  const handleDirections = useCallback(
    async (d: Doctor) => {
      setFocused(d)
      setDirectionsTo(d)
      setRoute(null)
      setRouteStatus('loading')
      // Ask for the patient's live location (or reuse a typed address).
      const start = await resolveStartLocation()
      if (start === 'denied') {
        setRouteStatus('denied')
        return
      }
      if (!start) {
        setRouteStatus('error')
        return
      }
      routeAbort.current?.abort()
      const controller = new AbortController()
      routeAbort.current = controller
      try {
        const result = await getRoute(
          { lat: start.lat, lng: start.lng },
          { lat: d.latitude, lng: d.longitude },
          controller.signal,
        )
        if (controller.signal.aborted) return
        if (!result) {
          setRouteStatus('error')
          return
        }
        setRoute(result)
        setRouteStatus('idle')
      } catch {
        if (!controller.signal.aborted) setRouteStatus('error')
      }
    },
    [resolveStartLocation],
  )

  const closeDirections = useCallback(() => {
    routeAbort.current?.abort()
    setDirectionsTo(null)
    setRoute(null)
    setRouteStatus('idle')
  }, [])

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
                distanceMi={d.distanceMi}
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
            onAddressSearch={handleAddressSearch}
            onUseMyLocation={handleUseMyLocation}
            onClearLocation={clearLocation}
            geoStatus={geoStatus}
            locationLabel={userLocation?.label ?? null}
          />
          <div className="h-full w-full">
            <DoctorMap
              doctors={doctors}
              focused={focused}
              onSelect={setFocused}
              copayLabel={strings.copay}
              userLocation={userLocation}
              nearYouPrefix={strings.nearYouPrefix}
              route={route?.coordinates ?? null}
            />
          </div>

          {directionsTo && (
            <DirectionsPanel
              doctor={directionsTo}
              route={route}
              status={routeStatus}
              title={strings.mapDirections}
              onClose={closeDirections}
              onRetry={() => handleDirections(directionsTo)}
            />
          )}
        </section>
      </div>

      {bookingDoctor && (
        <BookingModal
          doctor={bookingDoctor}
          strings={strings}
          language={language}
          onClose={() => setBookingDoctor(null)}
          onConfirmedClose={() => {
            setBookingDoctor(null)
            // Send the patient to their dashboard and force a fresh server
            // render so the just-booked appointment always shows up.
            router.push('/patient')
            router.refresh()
          }}
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
