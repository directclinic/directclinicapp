'use client'

import { MapPin, Search, ShieldCheck } from 'lucide-react'
import { BOROUGHS } from '@/lib/doctors'
import type { Strings } from '@/lib/i18n'
import { cn } from '@/lib/utils'

export function SearchFilterBar({
  strings,
  query,
  setQuery,
  activeBorough,
  setActiveBorough,
}: {
  strings: Strings
  query: string
  setQuery: (v: string) => void
  activeBorough: string
  setActiveBorough: (v: string) => void
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-[1000] p-4">
      <div className="pointer-events-auto mx-auto max-w-3xl space-y-3">
        {/* Search pill */}
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex items-center gap-3 rounded-full border-2 border-primary bg-card py-2 pl-5 pr-2 shadow-lg"
        >
          <Search className="size-6 shrink-0 text-primary" aria-hidden="true" />
          <label htmlFor="area-search" className="sr-only">
            {strings.searchPlaceholder}
          </label>
          <input
            id="area-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={strings.searchPlaceholder}
            className="min-h-11 flex-1 bg-transparent text-lg text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-lg font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
          >
            <Search className="size-5 sm:hidden" aria-hidden="true" />
            <span className="hidden sm:inline">{strings.searchPlaceholder.split(' ')[0]}</span>
          </button>
        </form>

        {/* Active filter badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-success-muted px-4 py-2 text-base font-semibold text-success-muted-foreground shadow-sm">
            <ShieldCheck className="size-5 shrink-0" aria-hidden="true" />
            {strings.insuranceFilter}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-base font-semibold text-foreground shadow-sm">
            <MapPin className="size-5 shrink-0 text-primary" aria-hidden="true" />
            {strings.locationFilter}
          </span>
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
