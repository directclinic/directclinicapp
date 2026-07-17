'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  CalendarCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  Phone,
  ShieldCheck,
  Sun,
  Sunset,
  X,
} from 'lucide-react'
import { CARRIER_NAME_BY_ID, type Doctor } from '@/lib/doctors'
import type { LanguageCode, Strings } from '@/lib/i18n'
import { bookAppointment } from '@/app/actions/appointments'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

// Format a Date as YYYY-MM-DD in local time (matches how bookings are stored).
function toISODate(d: Date) {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

// The calendar opens on the current month and cannot page earlier than it.
const NOW = new Date()
const BASE_YEAR = NOW.getFullYear()
const BASE_MONTH = NOW.getMonth() // current month (0-indexed)
// Midnight today, used to disable any date before today.
const TODAY = new Date(BASE_YEAR, BASE_MONTH, NOW.getDate())
// How many months forward the user may browse.
const MAX_MONTHS_AHEAD = 11

// BCP-47 locale used to render localized month names for each supported language.
const LOCALE_BY_LANG: Record<LanguageCode, string> = {
  en: 'en-US',
  es: 'es-ES',
  zh: 'zh-HK',
  ru: 'ru-RU',
  bn: 'bn-BD',
  it: 'it-IT',
  tl: 'fil-PH',
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

// Total number of months from the current month, used to clamp paging.
function monthOffset(year: number, month: number) {
  return (year - BASE_YEAR) * 12 + (month - BASE_MONTH)
}

export function BookingModal({
  doctor,
  strings,
  language,
  onClose,
  onConfirmedClose,
}: {
  doctor: Doctor
  strings: Strings
  language: LanguageCode
  onClose: () => void
  // Called when the patient dismisses the *confirmed* view (Done button or the
  // close icon). Used to send them to their dashboard after booking.
  onConfirmedClose: () => void
}) {
  const t = strings.booking
  const locale = LOCALE_BY_LANG[language] ?? 'en-US'

  // The visible month and the currently selected calendar date.
  const [viewYear, setViewYear] = useState(BASE_YEAR)
  const [viewMonth, setViewMonth] = useState(BASE_MONTH)
  const [selected, setSelected] = useState<Date>(() => new Date(TODAY))
  const [selectedTime, setSelectedTime] = useState<string>('10:00 AM')
  const [confirmed, setConfirmed] = useState(false)

  // Times already taken for the selected date at this clinic. These are grayed
  // out so two patients can't book the same slot.
  const [bookedTimes, setBookedTimes] = useState<Set<string>>(new Set())
  const [loadingSlots, setLoadingSlots] = useState(false)

  // Patient contact info collected before confirming.
  const [patientName, setPatientName] = useState('')
  const [patientPhone, setPatientPhone] = useState('')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  async function handleConfirm() {
    setSaveError(null)
    // Always show a brief loading state so the tap registers as "working".
    setSaving(true)
    const yyyy = selected.getFullYear()
    const mm = String(selected.getMonth() + 1).padStart(2, '0')
    const dd = String(selected.getDate()).padStart(2, '0')
    // Persist every booking so it shows on the patient's dashboard. Registered
    // clinics also link back to the owner via clinicId/ownerId; mock/seed
    // clinics store their details as a snapshot on the appointment instead.
    const result = await bookAppointment({
      clinicId: doctor.clinicId,
      clinicOwnerId: doctor.ownerId,
      clinicName: doctor.fullName,
      clinicAddress: doctor.address,
      providerName: doctor.fullName,
      patientName,
      patientPhone,
      careType: doctor.specialty,
      appointmentDate: `${yyyy}-${mm}-${dd}`,
      appointmentTime: selectedTime,
      reason,
    })
    if (!result.ok) {
      setSaving(false)
      setSaveError(result.error)
      return
    }
    setSaving(false)
    setConfirmed(true)
  }

  const leadingBlanks = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const monthFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }),
    [locale],
  )
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    [locale],
  )

  const monthLabel = monthFormatter.format(new Date(viewYear, viewMonth, 1))
  const offset = monthOffset(viewYear, viewMonth)
  const canGoPrev = offset > 0
  const canGoNext = offset < MAX_MONTHS_AHEAD

  // Carrier display names for the insurances accepted at this clinic.
  const acceptedInsurances = doctor.acceptedCarriers
    .map((id) => CARRIER_NAME_BY_ID[id])
    .filter(Boolean)

  function goToMonth(delta: number) {
    const next = new Date(viewYear, viewMonth + delta, 1)
    const nextOffset = monthOffset(next.getFullYear(), next.getMonth())
    if (nextOffset < 0 || nextOffset > MAX_MONTHS_AHEAD) return
    setViewYear(next.getFullYear())
    setViewMonth(next.getMonth())
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

  // Load which times are already booked for the selected date, so we can gray
  // them out. Re-runs whenever the chosen date (or clinic) changes.
  const selectedISO = toISODate(selected)
  useEffect(() => {
    let active = true
    setLoadingSlots(true)
    const supabase = createClient()
    supabase
      .rpc('booked_slots', {
        p_clinic_id: doctor.clinicId ?? null,
        p_clinic_name: doctor.fullName,
        p_date: selectedISO,
      })
      .then(({ data, error }) => {
        if (!active) return
        setBookedTimes(
          error || !data ? new Set() : new Set(data as string[]),
        )
        setLoadingSlots(false)
      })
    return () => {
      active = false
    }
  }, [selectedISO, doctor.clinicId, doctor.fullName])

  // If the currently selected time becomes unavailable, move to the first
  // open slot so the patient never confirms a taken time.
  useEffect(() => {
    if (bookedTimes.has(selectedTime)) {
      const firstOpen = TIME_SLOTS.find((s) => !bookedTimes.has(s.time))
      if (firstOpen) setSelectedTime(firstOpen.time)
    }
  }, [bookedTimes, selectedTime])

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
            onClick={confirmed ? onConfirmedClose : onClose}
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
            dateLabel={dateFormatter.format(selected)}
            time={selectedTime}
            onClose={onConfirmedClose}
          />
        ) : (
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <div className="flex flex-col gap-6 p-6">
              {/* Clinic contact: address + phone */}
              <div className="rounded-xl bg-muted p-4">
                <h3 className="mb-2 text-base font-bold uppercase tracking-wide text-muted-foreground">
                  {t.contactHeading}
                </h3>
                <p className="flex items-start gap-2 text-lg text-foreground">
                  <MapPin
                    className="mt-0.5 size-5 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <span>
                    <span className="sr-only">{t.addressLabel}: </span>
                    {doctor.address}
                  </span>
                </p>
                <p className="mt-2 flex items-center gap-2 text-lg text-foreground">
                  <Phone
                    className="size-5 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <span className="sr-only">{t.phoneLabel}: </span>
                  <a
                    href={`tel:${doctor.phone.replace(/[^\d+]/g, '')}`}
                    className="font-semibold text-primary underline-offset-2 hover:underline"
                  >
                    {doctor.phone}
                  </a>
                </p>
              </div>

              {/* Insurance accepted at this clinic */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-xl font-bold text-foreground">
                  <ShieldCheck
                    className="size-6 shrink-0 text-success"
                    aria-hidden="true"
                  />
                  {t.insuranceHeading}
                </h3>
                <ul className="flex flex-wrap gap-2">
                  {acceptedInsurances.map((name) => (
                    <li
                      key={name}
                      className="inline-flex items-center gap-1.5 rounded-full border-2 border-success/30 bg-success-muted px-4 py-2 text-base font-semibold text-success-muted-foreground"
                    >
                      <Check className="size-4 shrink-0" aria-hidden="true" />
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
                    onClick={() => goToMonth(-1)}
                    disabled={!canGoPrev}
                    className="flex size-11 items-center justify-center rounded-lg border-2 border-border text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                    aria-label={`${t.selectDate} — ${monthFormatter.format(new Date(viewYear, viewMonth - 1, 1))}`}
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
                    onClick={() => goToMonth(1)}
                    disabled={!canGoNext}
                    className="flex size-11 items-center justify-center rounded-lg border-2 border-border text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                    aria-label={`${t.selectDate} — ${monthFormatter.format(new Date(viewYear, viewMonth + 1, 1))}`}
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
                    const dayDate = new Date(viewYear, viewMonth, day)
                    const isSelected =
                      selected.getFullYear() === viewYear &&
                      selected.getMonth() === viewMonth &&
                      selected.getDate() === day
                    // Any date before today is blocked from selection.
                    const isPast = dayDate < TODAY
                    return (
                      <button
                        key={day}
                        type="button"
                        disabled={isPast}
                        onClick={() => setSelected(dayDate)}
                        aria-pressed={isSelected}
                        aria-disabled={isPast}
                        aria-label={dateFormatter.format(dayDate)}
                        className={cn(
                          'mx-auto flex size-11 items-center justify-center rounded-full text-base font-semibold transition-colors',
                          isPast
                            ? 'cursor-not-allowed text-muted-foreground/40 line-through'
                            : isSelected
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
                    const isBooked = bookedTimes.has(time)
                    const isSelected = !isBooked && selectedTime === time
                    const PeriodIcon = period === 'morning' ? Sun : Sunset
                    return (
                      <button
                        key={time}
                        type="button"
                        disabled={isBooked || loadingSlots}
                        onClick={() => setSelectedTime(time)}
                        aria-pressed={isSelected}
                        aria-disabled={isBooked}
                        className={cn(
                          'flex min-h-16 items-center gap-3 rounded-2xl border-2 px-5 py-3 text-left transition-colors',
                          isBooked
                            ? 'cursor-not-allowed border-border bg-muted text-muted-foreground/60'
                            : isSelected
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border bg-card text-foreground hover:border-primary/50 hover:bg-muted',
                        )}
                      >
                        <PeriodIcon
                          className={cn(
                            'size-6 shrink-0',
                            isBooked
                              ? 'text-muted-foreground/50'
                              : isSelected
                                ? 'text-primary-foreground'
                                : 'text-primary',
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
                          <span
                            className={cn(
                              'text-xl font-extrabold',
                              isBooked && 'line-through',
                            )}
                          >
                            {time}
                          </span>
                        </span>
                        {isBooked && (
                          <span className="ml-auto rounded-full bg-border px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                            {t.slotTaken}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Patient details */}
              <div>
                <h3 className="mb-3 text-xl font-bold text-foreground">
                  {t.yourDetails}
                </h3>
                <div className="space-y-3">
                  <div>
                    <label
                      htmlFor="patient-name"
                      className="mb-1.5 block text-base font-bold text-foreground"
                    >
                      {t.yourNameLabel}
                    </label>
                    <input
                      id="patient-name"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder={t.yourNamePlaceholder}
                      className="min-h-14 w-full rounded-2xl border-2 border-border bg-card px-4 text-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="patient-phone"
                      className="mb-1.5 block text-base font-bold text-foreground"
                    >
                      {t.yourPhoneLabel}
                    </label>
                    <input
                      id="patient-phone"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      placeholder="(212) 555-0123"
                      className="min-h-14 w-full rounded-2xl border-2 border-border bg-card px-4 text-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="patient-reason"
                      className="mb-1.5 block text-base font-bold text-foreground"
                    >
                      {t.reasonLabel}
                    </label>
                    <textarea
                      id="patient-reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder={t.reasonPlaceholder}
                      rows={2}
                      className="w-full rounded-2xl border-2 border-border bg-card px-4 py-3 text-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky footer with the giant purple confirm button */}
            <div className="sticky bottom-0 flex flex-col gap-3 border-t-2 border-border bg-card px-6 py-5">
              {saveError && (
                <p
                  role="alert"
                  className="rounded-xl border-2 border-destructive/40 bg-destructive/10 px-4 py-2 text-center text-base font-semibold text-destructive"
                >
                  {saveError}
                </p>
              )}
              <button
                type="button"
                onClick={handleConfirm}
                disabled={saving}
                className="inline-flex min-h-16 w-full items-center justify-center gap-3 rounded-2xl bg-primary px-6 text-center text-xl font-extrabold text-primary-foreground shadow-lg transition-colors hover:bg-primary/90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
              >
                {saving ? (
                  <Loader2
                    className="size-6 shrink-0 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <CalendarCheck className="size-6 shrink-0" aria-hidden="true" />
                )}
                <span className="text-balance">
                  {saving
                    ? t.saving
                    : `${t.confirmPrefix} ${doctor.fullName}`}
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
