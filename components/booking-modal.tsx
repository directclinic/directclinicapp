'use client'

import { useEffect, useState } from 'react'
import {
  CalendarCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Sun,
  Sunset,
  X,
} from 'lucide-react'
import type { Doctor } from '@/lib/doctors'
import type { Strings } from '@/lib/i18n'
import { cn } from '@/lib/utils'

// April 2026: the 1st falls on a Wednesday, so 3 leading blanks.
const LEADING_BLANKS = 3
const DAYS_IN_MONTH = 30

type Period = 'morning' | 'afternoon'
const TIME_SLOTS: { period: Period; time: string }[] = [
  { period: 'morning', time: '9:00 AM' },
  { period: 'morning', time: '10:00 AM' },
  { period: 'morning', time: '11:00 AM' },
  { period: 'afternoon', time: '1:00 PM' },
  { period: 'afternoon', time: '2:30 PM' },
  { period: 'afternoon', time: '3:30 PM' },
]

export function BookingModal({
  doctor,
  strings,
  onClose,
}: {
  doctor: Doctor
  strings: Strings
  onClose: () => void
}) {
  const t = strings.booking
  const [selectedDate, setSelectedDate] = useState<number>(14)
  const [selectedTime, setSelectedTime] = useState<string>('10:00 AM')
  const [confirmed, setConfirmed] = useState(false)

  // Close on Escape and lock body scroll while the modal is open.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end justify-center bg-foreground/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-card shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with the dynamically selected doctor */}
        <div className="flex items-start justify-between gap-4 border-b-2 border-border bg-primary px-6 py-5 text-primary-foreground">
          <div className="min-w-0">
            <p className="text-lg font-semibold text-primary-foreground/80">
              {t.scheduleWith}
            </p>
            <h2
              id="booking-title"
              className="text-pretty text-3xl font-extrabold leading-tight sm:text-4xl"
            >
              {doctor.fullName}, {doctor.credential}
            </h2>
            <p className="mt-1 text-lg font-medium text-primary-foreground/90">
              {doctor.specialty}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={strings.back}
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15 text-primary-foreground transition-colors hover:bg-primary-foreground/25 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-foreground/40"
          >
            <X className="size-6" aria-hidden="true" />
          </button>
        </div>

        {confirmed ? (
          <ConfirmedView
            doctor={doctor}
            strings={strings}
            month={t.monthLabel}
            day={selectedDate}
            time={selectedTime}
            onClose={onClose}
          />
        ) : (
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <div className="flex flex-col gap-6 p-6">
              {/* Clinic address */}
              <p className="flex items-start gap-2 rounded-xl bg-muted px-4 py-3 text-lg text-foreground">
                <MapPin className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <span>
                  <span className="sr-only">{t.addressLabel}: </span>
                  {doctor.address}
                </span>
              </p>

              {/* Date picker */}
              <div>
                <h3 className="mb-3 text-xl font-bold text-foreground">
                  {t.selectDate}
                </h3>
                <div className="mb-3 flex items-center justify-between">
                  <button
                    type="button"
                    className="flex size-11 items-center justify-center rounded-lg border-2 border-border text-foreground transition-colors hover:bg-muted"
                    aria-label={t.selectDate}
                  >
                    <ChevronLeft className="size-5" aria-hidden="true" />
                  </button>
                  <span className="text-lg font-bold text-foreground">
                    {t.monthLabel}
                  </span>
                  <button
                    type="button"
                    className="flex size-11 items-center justify-center rounded-lg border-2 border-border text-foreground transition-colors hover:bg-muted"
                    aria-label={t.selectDate}
                  >
                    <ChevronRight className="size-5" aria-hidden="true" />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {t.weekdays.map((day, i) => (
                    <div
                      key={`${day}-${i}`}
                      className="py-1 text-sm font-bold uppercase text-muted-foreground"
                      aria-hidden="true"
                    >
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: LEADING_BLANKS }).map((_, i) => (
                    <div key={`blank-${i}`} aria-hidden="true" />
                  ))}
                  {Array.from({ length: DAYS_IN_MONTH }).map((_, i) => {
                    const day = i + 1
                    const isSelected = selectedDate === day
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setSelectedDate(day)}
                        aria-pressed={isSelected}
                        aria-label={`${t.monthLabel} ${day}`}
                        className={cn(
                          'mx-auto flex size-11 items-center justify-center rounded-full text-base font-semibold transition-colors',
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground hover:bg-muted',
                        )}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Time picker: large touch-friendly tiles */}
              <div>
                <h3 className="mb-3 text-xl font-bold text-foreground">
                  {t.selectTime}
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {TIME_SLOTS.map(({ period, time }) => {
                    const isSelected = selectedTime === time
                    const PeriodIcon = period === 'morning' ? Sun : Sunset
                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedTime(time)}
                        aria-pressed={isSelected}
                        className={cn(
                          'flex min-h-16 items-center gap-3 rounded-2xl border-2 px-5 py-3 text-left transition-colors',
                          isSelected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-card text-foreground hover:border-primary/50 hover:bg-muted',
                        )}
                      >
                        <PeriodIcon
                          className={cn(
                            'size-6 shrink-0',
                            isSelected ? 'text-primary-foreground' : 'text-primary',
                          )}
                          aria-hidden="true"
                        />
                        <span className="flex flex-col">
                          <span
                            className={cn(
                              'text-sm font-semibold',
                              isSelected
                                ? 'text-primary-foreground/80'
                                : 'text-muted-foreground',
                            )}
                          >
                            {period === 'morning' ? t.morning : t.afternoon}
                          </span>
                          <span className="text-xl font-extrabold">{time}</span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Sticky footer with the giant purple confirm button */}
            <div className="sticky bottom-0 flex flex-col gap-3 border-t-2 border-border bg-card px-6 py-5">
              <button
                type="button"
                onClick={() => setConfirmed(true)}
                className="inline-flex min-h-16 w-full items-center justify-center gap-3 rounded-2xl bg-primary px-6 text-center text-xl font-extrabold text-primary-foreground shadow-lg transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
              >
                <CalendarCheck className="size-6 shrink-0" aria-hidden="true" />
                <span className="text-balance">
                  {t.confirmPrefix} {doctor.fullName}
                </span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl border-2 border-border px-6 text-lg font-bold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
              >
                {t.cancelBooking}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ConfirmedView({
  doctor,
  strings,
  month,
  day,
  time,
  onClose,
}: {
  doctor: Doctor
  strings: Strings
  month: string
  day: number
  time: string
  onClose: () => void
}) {
  const t = strings.booking
  return (
    <div className="flex flex-col items-center gap-5 p-8 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-success text-success-foreground">
        <Check className="size-11" aria-hidden="true" />
      </div>
      <h3 className="text-pretty text-3xl font-extrabold text-foreground">
        {t.confirmedTitle}
      </h3>
      <p className="text-xl text-foreground">
        {t.confirmedLead}{' '}
        <span className="font-bold text-primary">
          {doctor.fullName}, {doctor.credential}
        </span>
      </p>
      <div className="w-full rounded-2xl border-2 border-success/30 bg-success-muted px-6 py-4 text-success-muted-foreground">
        <p className="text-base font-semibold uppercase tracking-wide">
          {t.whenLabel}
        </p>
        <p className="text-2xl font-extrabold">
          {month} {day} · {time}
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="mt-2 inline-flex min-h-16 w-full items-center justify-center rounded-2xl bg-primary px-6 text-xl font-extrabold text-primary-foreground shadow-lg transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
      >
        {t.done}
      </button>
    </div>
  )
}
