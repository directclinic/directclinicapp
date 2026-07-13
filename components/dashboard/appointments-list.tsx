'use client'

import { CalendarClock, Mail, Phone, User } from 'lucide-react'

export interface AppointmentRow {
  id: string
  clinic_name: string
  patient_name: string
  patient_email: string | null
  patient_phone: string | null
  care_type: string | null
  appointment_date: string
  appointment_time: string
  reason: string | null
  status: string
}

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function AppointmentsList({
  appointments,
}: {
  appointments: AppointmentRow[]
}) {
  if (appointments.length === 0) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-border bg-card p-8 text-center">
        <CalendarClock
          className="mx-auto mb-3 size-10 text-muted-foreground"
          aria-hidden="true"
        />
        <p className="text-lg font-semibold text-muted-foreground">
          No appointments yet. When a patient books one of your clinics,
          it&apos;ll show up here.
        </p>
      </div>
    )
  }

  return (
    <ul className="space-y-4">
      {appointments.map((a) => (
        <li
          key={a.id}
          className="rounded-3xl border-2 border-border bg-card p-6 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-xl font-extrabold text-foreground">
                <User className="size-5 shrink-0 text-primary" aria-hidden="true" />
                {a.patient_name}
              </p>
              <p className="mt-1 text-base text-muted-foreground">
                {a.clinic_name}
                {a.care_type ? ` · ${a.care_type}` : ''}
              </p>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-base text-muted-foreground">
                {a.patient_email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="size-4 shrink-0" aria-hidden="true" />
                    {a.patient_email}
                  </span>
                )}
                {a.patient_phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="size-4 shrink-0" aria-hidden="true" />
                    {a.patient_phone}
                  </span>
                )}
              </div>
              {a.reason && (
                <p className="mt-2 text-pretty text-base text-foreground">
                  <span className="font-semibold">Reason: </span>
                  {a.reason}
                </p>
              )}
            </div>

            <div className="flex flex-col items-end gap-2">
              <span className="inline-flex items-center gap-2 rounded-2xl bg-accent px-4 py-2 text-base font-bold text-accent-foreground">
                <CalendarClock className="size-4 shrink-0" aria-hidden="true" />
                {formatDate(a.appointment_date)}
              </span>
              <span className="text-lg font-extrabold text-primary">
                {a.appointment_time}
              </span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
