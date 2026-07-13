'use client'

import { useState } from 'react'
import {
  CalendarClock,
  CalendarCheck,
  FileText,
  History,
  MapPin,
  Stethoscope,
} from 'lucide-react'
import { cn } from '@/lib/utils'

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

function AppointmentCard({
  appt,
  isPast,
}: {
  appt: PatientAppointment
  isPast: boolean
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
              <span className="font-semibold">Reason: </span>
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

      {/* Doctor's note, shared with the patient after the visit */}
      {appt.doctor_note ? (
        <div className="mt-5 rounded-2xl border-2 border-primary/25 bg-primary/5 p-4">
          <p className="flex items-center gap-2 text-base font-bold text-foreground">
            <FileText
              className="size-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            Doctor&apos;s note
          </p>
          <p className="mt-1.5 whitespace-pre-line text-pretty text-base leading-relaxed text-foreground">
            {appt.doctor_note}
          </p>
        </div>
      ) : (
        isPast && (
          <p className="mt-5 border-t-2 border-border pt-4 text-base text-muted-foreground">
            No note from the doctor yet.
          </p>
        )
      )}
    </li>
  )
}

export function PatientAppointments({
  appointments,
}: {
  appointments: PatientAppointment[]
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

  return (
    <div>
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
          Upcoming ({upcoming.length})
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
          Past ({past.length})
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
              {tab === 'upcoming'
                ? 'You have no upcoming appointments. Find a clinic to book your next visit.'
                : 'No past appointments yet.'}
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {list.map((a) => (
              <AppointmentCard key={a.id} appt={a} isPast={tab === 'past'} />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
