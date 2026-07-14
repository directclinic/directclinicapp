'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CalendarClock,
  Check,
  FileText,
  Mail,
  Phone,
  User,
} from 'lucide-react'
import { saveDoctorNote } from '@/app/actions/appointments'

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
  doctor_note: string | null
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

function NoteEditor({
  appointmentId,
  initialNote,
}: {
  appointmentId: string
  initialNote: string | null
}) {
  const router = useRouter()
  const [note, setNote] = useState(initialNote ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const dirty = note.trim() !== (initialNote ?? '').trim()

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSaved(false)
    const result = await saveDoctorNote(appointmentId, note)
    setSaving(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setSaved(true)
    router.refresh()
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="mt-5 border-t-2 border-border pt-4">
      <label
        htmlFor={`note-${appointmentId}`}
        className="flex items-center gap-2 text-base font-bold text-foreground"
      >
        <FileText className="size-4 shrink-0 text-primary" aria-hidden="true" />
        Doctor&apos;s note for the patient
      </label>
      <p className="mb-2 mt-0.5 text-sm text-muted-foreground">
        Shared with the patient in their dashboard after the visit.
      </p>
      <textarea
        id={`note-${appointmentId}`}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        placeholder="Add care instructions, diagnosis summary, or follow-up steps…"
        className="w-full rounded-2xl border-2 border-border bg-background p-3 text-base leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
      />
      {error && (
        <p className="mt-2 text-sm font-semibold text-destructive">{error}</p>
      )}
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !dirty}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-base font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save note'}
        </button>
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-base font-semibold text-success">
            <Check className="size-4 shrink-0" aria-hidden="true" />
            Saved
          </span>
        )}
      </div>
    </div>
  )
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

          <NoteEditor appointmentId={a.id} initialNote={a.doctor_note} />
        </li>
      ))}
    </ul>
  )
}
