'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  CalendarClock,
  CalendarCheck,
  FileText,
  History,
  MapPin,
  Stethoscope,
  BellRing,
  Check,
  X,
  Loader2,
  Phone,
} from 'lucide-react'
import type { DashboardStrings } from '@/lib/dashboard-i18n'
import { setAppointmentConfirmation } from '@/app/actions/appointments'
import { cn } from '@/lib/utils'

// An appointment needs confirmation when it's within this many days.
const CONFIRM_WINDOW_DAYS = 3

function daysUntil(iso: string) {
  const target = new Date(iso + 'T00:00:00')
  const today = startOfToday()
  return Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  )
}

export interface PatientAppointment {
  id: string
  clinic_name: string
  provider_name: string | null
  care_type: string | null
  address: string | null
  appointment_date: string
  appointment_time: string
  reason: string | null
  status: string
  confirmation_status: string
  doctor_note: string | null
}

type Tab = 'upcoming' | 'past'

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function ConfirmationSection({
  appt,
  t,
}: {
  appt: PatientAppointment
  t: DashboardStrings
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function respond(status: 'confirmed' | 'declined') {
    setError(null)
    startTransition(async () => {
      const res = await setAppointmentConfirmation(appt.id, status)
      if (!res.ok) setError(res.error)
      else router.refresh()
    })
  }

  if (appt.confirmation_status === 'confirmed') {
    return (
      <div className="mt-5 flex items-center gap-2 rounded-2xl border-2 border-primary/25 bg-primary/5 px-4 py-3 text-base font-bold text-primary">
        <Check className="size-5 shrink-0" aria-hidden="true" />
        {t.confirmedBadge}
      </div>
    )
  }

  if (appt.confirmation_status === 'declined') {
    return (
      <div className="mt-5 flex items-center gap-2 rounded-2xl border-2 border-destructive/30 bg-destructive/10 px-4 py-3 text-base font-bold text-destructive">
        <X className="size-5 shrink-0" aria-hidden="true" />
        {t.declinedBadge}
      </div>
    )
  }

  const days = daysUntil(appt.appointment_date)
  const needsConfirm = days >= 0 && days <= CONFIRM_WINDOW_DAYS

  return (
    <div
      className={cn(
        'mt-5 rounded-2xl border-2 p-4',
        needsConfirm
          ? 'border-accent-foreground/20 bg-accent'
          : 'border-border bg-muted/40',
      )}
    >
      <p className="flex items-center gap-2 text-base font-bold text-foreground">
        <BellRing className="size-5 shrink-0 text-primary" aria-hidden="true" />
        {needsConfirm ? t.confirmTitle : t.awaitingConfirm}
      </p>
      <p className="mt-1 text-pretty text-base leading-relaxed text-muted-foreground">
        {t.stillComing}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => respond('confirmed')}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-base font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
        >
          {pending ? (
            <Loader2 className="size-5 shrink-0 animate-spin" aria-hidden="true" />
          ) : (
            <Check className="size-5 shrink-0" aria-hidden="true" />
          )}
          {t.yesConfirm}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => respond('declined')}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-border bg-card px-4 text-base font-bold text-foreground transition-colors hover:border-destructive hover:text-destructive disabled:opacity-60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
        >
          <X className="size-5 shrink-0" aria-hidden="true" />
          {t.noDecline}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-base font-semibold text-destructive">{error}</p>
      )}
    </div>
  )
}

function AppointmentCard({
  appt,
  isPast,
  t,
}: {
  appt: PatientAppointment
  isPast: boolean
  t: DashboardStrings
}) {
  return (
    <li className="rounded-3xl border-2 border-border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xl font-extrabold text-foreground">
            <Stethoscope
              className="size-5 shrink-0 text-primary"
              aria-hidden="true"
            />
            {appt.clinic_name}
          </p>
          {appt.provider_name && (
            <p className="mt-1 text-base text-muted-foreground">
              {appt.provider_name}
              {appt.care_type ? ` · ${appt.care_type}` : ''}
            </p>
          )}
          {!appt.provider_name && appt.care_type && (
            <p className="mt-1 text-base text-muted-foreground">
              {appt.care_type}
            </p>
          )}
          {appt.address && (
            <p className="mt-2 flex items-start gap-1.5 text-base text-muted-foreground">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {appt.address}
            </p>
          )}
          {appt.reason && (
            <p className="mt-2 text-pretty text-base text-foreground">
              <span className="font-semibold">{t.reasonLabel}</span>
              {appt.reason}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          <span className="inline-flex items-center gap-2 rounded-2xl bg-accent px-4 py-2 text-base font-bold text-accent-foreground">
            <CalendarClock className="size-4 shrink-0" aria-hidden="true" />
            {formatDate(appt.appointment_date)}
          </span>
          <span className="text-lg font-extrabold text-primary">
            {appt.appointment_time}
          </span>
        </div>
      </div>

      {/* Confirmation reminder shown for upcoming visits */}
      {!isPast && <ConfirmationSection appt={appt} t={t} />}

      {/* Direct call to the clinic/doctor for upcoming, non-declined visits */}
      {!isPast && appt.confirmation_status !== 'declined' && (
        <Link
          href={`/call/${appt.id}`}
          className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-primary bg-card px-4 text-base font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
        >
          <Phone className="size-5 shrink-0" aria-hidden="true" />
          {t.startCall}
        </Link>
      )}

      {/* Doctor's note, shared with the patient after the visit */}
      {appt.doctor_note ? (
        <div className="mt-5 rounded-2xl border-2 border-primary/25 bg-primary/5 p-4">
          <p className="flex items-center gap-2 text-base font-bold text-foreground">
            <FileText
              className="size-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            {t.doctorsNote}
          </p>
          <p className="mt-1.5 whitespace-pre-line text-pretty text-base leading-relaxed text-foreground">
            {appt.doctor_note}
          </p>
        </div>
      ) : (
        isPast && (
          <p className="mt-5 border-t-2 border-border pt-4 text-base text-muted-foreground">
            {t.noNoteYet}
          </p>
        )
      )}
    </li>
  )
}

export function PatientAppointments({
  appointments,
  t,
}: {
  appointments: PatientAppointment[]
  t: DashboardStrings
}) {
  const [tab, setTab] = useState<Tab>('upcoming')

  const today = startOfToday()
  const upcoming = appointments.filter(
    (a) => new Date(a.appointment_date + 'T00:00:00') >= today,
  )
  const past = appointments.filter(
    (a) => new Date(a.appointment_date + 'T00:00:00') < today,
  )

  const list = tab === 'upcoming' ? upcoming : past

  const needConfirmCount = upcoming.filter((a) => {
    const d = daysUntil(a.appointment_date)
    return (
      a.confirmation_status === 'pending' && d >= 0 && d <= CONFIRM_WINDOW_DAYS
    )
  }).length

  return (
    <div>
      {tab === 'upcoming' && needConfirmCount > 0 && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border-2 border-primary/30 bg-primary/5 p-4">
          <BellRing
            className="mt-0.5 size-6 shrink-0 text-primary"
            aria-hidden="true"
          />
          <div>
            <p className="text-lg font-extrabold text-foreground">
              {t.confirmTitle}
            </p>
            <p className="mt-0.5 text-pretty text-base leading-relaxed text-muted-foreground">
              {t.confirmPrompt}
            </p>
          </div>
        </div>
      )}
      <div
        role="tablist"
        aria-label="Appointment sections"
        className="flex gap-2 rounded-2xl border-2 border-border bg-card p-1.5"
      >
        <button
          role="tab"
          aria-selected={tab === 'upcoming'}
          onClick={() => setTab('upcoming')}
          className={cn(
            'flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl text-lg font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40',
            tab === 'upcoming'
              ? 'bg-primary text-primary-foreground'
              : 'text-foreground hover:bg-accent',
          )}
        >
          <CalendarCheck className="size-5 shrink-0" aria-hidden="true" />
          {t.upcoming} ({upcoming.length})
        </button>
        <button
          role="tab"
          aria-selected={tab === 'past'}
          onClick={() => setTab('past')}
          className={cn(
            'flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl text-lg font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40',
            tab === 'past'
              ? 'bg-primary text-primary-foreground'
              : 'text-foreground hover:bg-accent',
          )}
        >
          <History className="size-5 shrink-0" aria-hidden="true" />
          {t.past} ({past.length})
        </button>
      </div>

      <div className="mt-6">
        {list.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-border bg-card p-8 text-center">
            <CalendarClock
              className="mx-auto mb-3 size-10 text-muted-foreground"
              aria-hidden="true"
            />
            <p className="text-lg font-semibold text-muted-foreground">
              {tab === 'upcoming' ? t.noUpcoming : t.noPast}
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {list.map((a) => (
              <AppointmentCard
                key={a.id}
                appt={a}
                isPast={tab === 'past'}
                t={t}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
