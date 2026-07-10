'use client'

import Link from 'next/link'
import {
  BadgeCheck,
  CalendarCheck,
  MapPin,
  Star,
  TrainFront,
} from 'lucide-react'
import type { Doctor } from '@/lib/doctors'
import type { Strings } from '@/lib/i18n'
import { cn } from '@/lib/utils'

function initials(name: string) {
  const parts = name.replace('Dr. ', '').split(' ')
  return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')
}

const AVATAR_TONES = [
  'bg-[oklch(0.92_0.06_300)] text-[oklch(0.4_0.2_300)]',
  'bg-[oklch(0.92_0.06_200)] text-[oklch(0.4_0.15_240)]',
  'bg-[oklch(0.93_0.06_150)] text-[oklch(0.38_0.12_150)]',
  'bg-[oklch(0.93_0.06_60)] text-[oklch(0.42_0.12_60)]',
]

export function DoctorCard({
  doctor,
  strings,
  isFocused,
  onDirections,
  onSelect,
  tone,
}: {
  doctor: Doctor
  strings: Strings
  isFocused: boolean
  onDirections: () => void
  onSelect: () => void
  tone: number
}) {
  return (
    <article
      onClick={onSelect}
      className={cn(
        'rounded-2xl border-2 bg-card p-5 shadow-sm transition-colors',
        isFocused
          ? 'border-primary ring-2 ring-primary/40'
          : 'border-border hover:border-primary/50',
      )}
    >
      <div className="flex gap-4">
        <div
          className={cn(
            'flex size-20 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold',
            AVATAR_TONES[tone % AVATAR_TONES.length],
          )}
          aria-hidden="true"
        >
          {initials(doctor.fullName)}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-pretty text-2xl font-bold leading-tight text-foreground">
            {doctor.fullName}, {doctor.credential}
          </h3>
          <p className="mt-1 text-lg font-medium text-muted-foreground">
            {doctor.specialty}
          </p>
          <p className="flex items-center gap-1.5 text-base text-muted-foreground">
            <MapPin className="size-4 shrink-0" aria-hidden="true" />
            {doctor.neighborhood}, {doctor.borough}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-base font-medium text-foreground">
            <Star
              className="size-4 shrink-0 fill-[oklch(0.75_0.15_80)] text-[oklch(0.75_0.15_80)]"
              aria-hidden="true"
            />
            {doctor.rating.toFixed(1)}
            <span className="font-normal text-muted-foreground">
              ({doctor.reviewCount} {strings.reviews})
            </span>
          </p>
        </div>
      </div>

      {/* Verified in-network badge */}
      <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-success px-4 py-2 text-base font-bold text-success-foreground">
        <BadgeCheck className="size-5 shrink-0" aria-hidden="true" />
        {'\u2713'} {strings.verified}
      </div>

      {/* Price breakdown */}
      <div className="mt-3 rounded-xl border-2 border-success/30 bg-success-muted p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-lg font-semibold text-success-muted-foreground">
            {strings.copay}
          </span>
          <span className="text-3xl font-extrabold tracking-tight text-success-muted-foreground">
            ${doctor.copayUsd}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
          <span className="text-lg font-semibold text-success-muted-foreground">
            {strings.deductible}
          </span>
          <span className="text-2xl font-extrabold text-success-muted-foreground">
            {strings.deductibleMet}
          </span>
        </div>
        <p className="mt-2 text-sm text-success-muted-foreground/90">
          {strings.priceDisclaimer}
        </p>
      </div>

      {/* Languages */}
      <p className="mt-4 text-base text-foreground">
        <span className="font-semibold">{strings.languagesSpoken}: </span>
        {doctor.languages.join(', ')}
      </p>

      {/* Insurance accepted */}
      <div className="mt-3">
        <p className="text-base font-semibold text-foreground">
          {strings.insuranceAccepted}:
        </p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {doctor.insurancePlans.map((plan) => (
            <li
              key={plan}
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-primary/25 bg-primary/5 px-3 py-1.5 text-sm font-medium text-foreground"
            >
              <BadgeCheck className="size-4 shrink-0 text-primary" aria-hidden="true" />
              {plan}
            </li>
          ))}
        </ul>
      </div>

      {/* Transit */}
      <p className="mt-2 flex items-start gap-2 rounded-lg bg-muted px-3 py-2 text-base text-foreground">
        <TrainFront className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
        {doctor.transitNote}
      </p>

      {/* Actions */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Link
          href={`/book?doctor=${doctor.id}`}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-lg font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
        >
          <CalendarCheck className="size-5 shrink-0" aria-hidden="true" />
          {strings.bookAppointment}
        </Link>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onDirections()
          }}
          className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl border-2 border-primary bg-card px-4 text-lg font-bold text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
        >
          <MapPin className="size-5 shrink-0" aria-hidden="true" />
          {strings.mapDirections}
        </button>
      </div>
    </article>
  )
}
