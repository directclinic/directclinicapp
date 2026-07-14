'use client'

import { Navigation, X, Clock, Route as RouteIcon, Loader2 } from 'lucide-react'
import {
  formatDistance,
  formatDuration,
  type RouteResult,
} from '@/lib/routing'
import type { Doctor } from '@/lib/doctors'

// Floating overlay on the map that shows the live driving route to a clinic:
// total distance/time plus scrollable turn-by-turn steps.
export function DirectionsPanel({
  doctor,
  route,
  status,
  title,
  onClose,
  onRetry,
}: {
  doctor: Doctor
  route: RouteResult | null
  status: 'idle' | 'loading' | 'error' | 'denied'
  title: string
  onClose: () => void
  onRetry: () => void
}) {
  return (
    <div className="absolute inset-x-3 bottom-3 z-[1000] max-h-[55%] overflow-hidden rounded-2xl border-2 border-border bg-card shadow-2xl sm:inset-x-auto sm:right-4 sm:w-96">
      <div className="flex items-start justify-between gap-3 border-b-2 border-border bg-primary px-4 py-3 text-primary-foreground">
        <div className="flex min-w-0 items-center gap-2">
          <Navigation className="size-5 shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <p className="truncate text-base font-extrabold leading-tight">
              {title}
            </p>
            <p className="truncate text-sm opacity-90">{doctor.fullName}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close directions"
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15 transition-colors hover:bg-primary-foreground/25 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-foreground/40"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>

      {status === 'loading' && (
        <div className="flex items-center gap-3 px-4 py-6 text-base font-medium text-muted-foreground">
          <Loader2 className="size-5 shrink-0 animate-spin" aria-hidden="true" />
          Getting live directions…
        </div>
      )}

      {status === 'denied' && (
        <div className="px-4 py-5">
          <p className="text-pretty text-base font-medium text-foreground">
            We need your location to show directions. Please allow location
            access in your browser, or type your address in the search bar.
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col gap-3 px-4 py-5">
          <p className="text-base font-medium text-foreground">
            We couldn&apos;t load directions right now.
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl bg-primary px-4 text-base font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
          >
            Try again
          </button>
        </div>
      )}

      {status === 'idle' && route && (
        <div className="flex max-h-[calc(55vh-64px)] flex-col">
          <div className="flex items-center gap-4 border-b-2 border-border bg-muted/40 px-4 py-3">
            <span className="inline-flex items-center gap-1.5 text-lg font-extrabold text-primary">
              <Clock className="size-5 shrink-0" aria-hidden="true" />
              {formatDuration(route.durationSeconds)}
            </span>
            <span className="inline-flex items-center gap-1.5 text-lg font-bold text-foreground">
              <RouteIcon className="size-5 shrink-0" aria-hidden="true" />
              {formatDistance(route.distanceMeters)}
            </span>
          </div>
          <ol className="min-h-0 flex-1 divide-y divide-border overflow-y-auto">
            {route.steps.map((step, i) => (
              <li
                key={i}
                className="flex items-start gap-3 px-4 py-3 text-base text-foreground"
              >
                <span
                  className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <span className="flex-1 text-pretty leading-snug">
                  {step.instruction}
                  {step.distanceMeters > 5 && (
                    <span className="ml-1 text-sm text-muted-foreground">
                      · {formatDistance(step.distanceMeters)}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
