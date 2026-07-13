'use client'

import {
  HeartHandshake,
  LoaderCircle,
  LocateFixed,
  MapPin,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react'
import { BOROUGHS } from '@/lib/doctors'
import type { Strings } from '@/lib/i18n'
import { cn } from '@/lib/utils'

export function SearchFilterBar({
  strings,
  query,
  setQuery,
  activeBorough,
  setActiveBorough,
  insuranceLabel,
  careLabel,
  onAddressSearch,
  onUseMyLocation,
  onClearLocation,
  geoStatus,
  locationLabel,
}: {
  strings: Strings
  query: string
  setQuery: (v: string) => void
  activeBorough: string
  setActiveBorough: (v: string) => void
  insuranceLabel?: string
  careLabel?: string
  onAddressSearch: (address: string) => void
  onUseMyLocation: () => void
  onClearLocation: () => void
  geoStatus: 'idle' | 'loading' | 'error'
  locationLabel: string | null
}) {
  const loading = geoStatus === 'loading'

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-[1000] p-4">
      <div className="pointer-events-auto mx-auto max-w-3xl space-y-3">
        {/* Address search pill */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onAddressSearch(query)
          }}
          className="flex items-center gap-2 rounded-full border-2 border-primary bg-card py-2 pl-5 pr-2 shadow-lg"
        >
          <MapPin className="size-6 shrink-0 text-primary" aria-hidden="true" />
          <label htmlFor="area-search" className="sr-only">
            {strings.addressPlaceholder}
          </label>
          <input
            id="area-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={strings.addressPlaceholder}
            className="min-h-11 flex-1 bg-transparent text-lg text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={onUseMyLocation}
            title={strings.useMyLocation}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-primary bg-card px-3 text-base font-bold text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
          >
            <LocateFixed className="size-5 shrink-0" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">{strings.useMyLocation}</span>
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-lg font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 disabled:opacity-70"
          >
            {loading ? (
              <LoaderCircle className="size-5 shrink-0 animate-spin" aria-hidden="true" />
            ) : (
              <Search className="size-5 shrink-0" aria-hidden="true" />
            )}
          </button>
        </form>

        {/* Geocoding status / active location */}
        {loading && (
          <p className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-base font-semibold text-foreground shadow-sm">
            <LoaderCircle className="size-5 shrink-0 animate-spin text-primary" aria-hidden="true" />
            {strings.searchingLocation}
          </p>
        )}
        {geoStatus === 'error' && (
          <p
            role="alert"
            className="rounded-2xl border-2 border-destructive/40 bg-destructive/10 px-4 py-2 text-base font-semibold text-destructive"
          >
            {strings.locationNotFound}
          </p>
        )}
        {locationLabel && geoStatus !== 'loading' && (
          <div className="inline-flex max-w-full items-center gap-2 rounded-full bg-primary px-4 py-2 text-base font-semibold text-primary-foreground shadow-sm">
            <LocateFixed className="size-5 shrink-0" aria-hidden="true" />
            <span className="truncate">
              {strings.nearYouPrefix} {locationLabel.split(',').slice(0, 2).join(',')}
            </span>
            <button
              type="button"
              onClick={onClearLocation}
              className="ml-1 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-foreground/20 transition-colors hover:bg-primary-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground"
              aria-label={strings.clearLocation}
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Active filter badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-success-muted px-4 py-2 text-base font-semibold text-success-muted-foreground shadow-sm">
            <ShieldCheck className="size-5 shrink-0" aria-hidden="true" />
            {insuranceLabel ?? strings.insuranceFilter}
          </span>
          {careLabel && (
            <span className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-base font-semibold text-accent-foreground shadow-sm">
              <HeartHandshake className="size-5 shrink-0 text-primary" aria-hidden="true" />
              {careLabel}
            </span>
          )}
        </div>

        {/* Borough quick filters */}
        <div className="flex flex-wrap gap-2">
          {BOROUGHS.map((b) => {
            const active = activeBorough === b
            const label = b === 'All Boroughs' ? strings.allBoroughs : b
            return (
              <button
                key={b}
                type="button"
                onClick={() => setActiveBorough(b)}
                aria-pressed={active}
                className={cn(
                  'min-h-12 rounded-full border-2 px-5 text-base font-bold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40',
                  active
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-foreground hover:border-primary hover:text-primary',
                )}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
