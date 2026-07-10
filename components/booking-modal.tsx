'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  CalendarCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  MapPin,
  ShieldCheck,
  Sun,
  Sunset,
  X,
} from 'lucide-react'
import { carrierNames, type Doctor } from '@/lib/doctors'
import type { LanguageCode, Strings } from '@/lib/i18n'
import { cn } from '@/lib/utils'

// The booking flow opens on April 2026 and users can page forward month by
// month from there. We never allow navigating before this starting month.
const START_YEAR = 2026
const START_MONTH = 3 // April (0-indexed)

// Map each supported UI language to a BCP-47 locale so month names format
// natively (e.g. "abril de 2026", "2026年4月").
const LOCALE_BY_LANGUAGE: Record<LanguageCode, string> = {
  en: 'en-US',
  es: 'es',
  zh: 'zh-Hant',
  ru: 'ru',
  bn: 'bn',
  it: 'it',
  tl: 'fil',
}

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
  language,
  onClose,
}: {
  doctor: Doctor
  strings: Strings
  language: LanguageCode
  onClose: () => void
}) {
  const t = strings.booking
  const locale = LOCALE_BY_LANGUAGE[language] ?? 'en-US'

  // The month currently shown in the calendar grid.
  const [viewYear, setViewYear] = useState(START_YEAR)
  const [viewMonth, setViewMonth] = useState(START_MONTH)
  // The chosen appointment date (defaults to April 14, 2026).
  const [selectedDate, setSelectedDate] = useState(
    () => new Date(START_YEAR, START_MONTH, 14),
  )
  const [selectedTime, setSelectedTime] = useState<string>('10:00 AM')
  const [confirmed, setConfirmed] = useState(false)

  // Derived calendar geometry for the month in view.
  const leadingBlanks = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const atStartMonth = viewYear === START_YEAR && viewMonth === START_MONTH

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: 'long',
        year: 'numeric',
      }).format(new Date(viewYear, viewMonth, 1)),
    [locale, viewYear, viewMonth],
  )

  const selectedDateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(selectedDate),
    [locale, selectedDate],
  )

  function goToPreviousMonth() {
    if (atStartMonth) return
    if (viewMonth === 0) {
      setViewYear((y) => y - 1)
      setViewMonth(11)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  function goToNextMonth() {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1)
      setViewMonth(0)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

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
            dateLabel={selectedDateLabel}
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

              {/* Accepted insurance — matches the doctor's listing on the map */}
              <div>
                <p className="flex items-center gap-1.5 text-lg font-bold text-foreground">
                  <ShieldCheck className="size-5 shrink-0 text-primary" aria-hidden="true" />
                  {strings.acceptsInsurance}
                </p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {carrierNames(doctor.acceptedCarriers).map((name) => (
                    <li
                      key={name}
                      className="rounded-full border-2 border-border bg-muted px-3 py-1 text-sm font-semibold text-foreground"
                    >
                      {name}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Date picker */}
              <div>
                <h3 className="mb-3 text-xl font-bold text-foreground">
                  {t.selectDate}
                </h3>
                <div className="mb-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={goToPreviousMonth}
                    disabled={atStartMonth}
                    className="flex size-11 items-center justify-center rounded-lg border-2 border-border text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                    aria-label={t.previousMonth}
                  >
                    <ChevronLeft className="size-5" aria-hidden="true" />
                  </button>
                  <span
                    className="text-lg font-bold text-foreground"
                    aria-live="polite"
                  >
                    {monthLabel}
                  </span>
                  <button
                    type="button"
                    onClick={goToNextMonth}
                    className="flex size-11 items-center justify-center rounded-lg border-2 border-border text-foreground transition-colors hover:bg-muted"
                    aria-label={t.nextMonth}
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
                  {Array.from({ length: leadingBlanks }).map((_, i) => (
                    <div key={`blank-${i}`} aria-hidden="true" />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1
                    const isSelected =
                      selectedDate.getFullYear() === viewYear &&
                      selectedDate.getMonth() === viewMonth &&
                      selectedDate.getDate() === day
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() =>
                          setSelectedDate(new Date(viewYear, viewMonth, day))
                        }
                        aria-pressed={isSelected}
                        aria-label={`${monthLabel} ${day}`}
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
  dateLabel,
  time,
  onClose,
}: {
  doctor: Doctor
  strings: Strings
  dateLabel: string
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
          {dateLabel} · {time}
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
