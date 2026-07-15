'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Stethoscope, Mail, UserMinus, Users } from 'lucide-react'
import { removeMember, type ClinicMember } from '@/app/actions/clinic-members'

export interface RosterClinic {
  id: string
  name: string
  doctors: ClinicMember[]
}

export function DoctorsRoster({ clinics }: { clinics: RosterClinic[] }) {
  const totalDoctors = clinics.reduce((sum, c) => sum + c.doctors.length, 0)

  if (totalDoctors === 0) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-border bg-card p-8 text-center">
        <span className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Users className="size-7" aria-hidden="true" />
        </span>
        <p className="text-lg font-bold text-foreground">No doctors yet</p>
        <p className="mt-1 text-pretty text-base leading-relaxed text-muted-foreground">
          When a doctor finds your clinic and adds themselves, they&apos;ll
          appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {clinics
        .filter((c) => c.doctors.length > 0)
        .map((clinic) => (
          <div key={clinic.id}>
            <h3 className="mb-3 text-lg font-bold text-foreground">
              {clinic.name}{' '}
              <span className="text-muted-foreground">
                ({clinic.doctors.length})
              </span>
            </h3>
            <ul className="space-y-3">
              {clinic.doctors.map((doctor) => (
                <DoctorRow key={doctor.id} doctor={doctor} />
              ))}
            </ul>
          </div>
        ))}
    </div>
  )
}

function DoctorRow({ doctor }: { doctor: ClinicMember }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleRemove() {
    setError(null)
    startTransition(async () => {
      const result = await removeMember(doctor.id)
      if (!result.ok) {
        setError(result.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <li className="flex flex-wrap items-center gap-4 rounded-2xl border-2 border-border bg-card p-4">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Stethoscope className="size-6" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-lg font-bold text-foreground">
          {doctor.doctor_name}
        </p>
        {doctor.doctor_specialty && (
          <p className="truncate text-base text-muted-foreground">
            {doctor.doctor_specialty}
          </p>
        )}
        {doctor.doctor_email && (
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-muted-foreground">
            <Mail className="size-4 shrink-0" aria-hidden="true" />
            {doctor.doctor_email}
          </p>
        )}
        {error && <p className="mt-1 text-sm font-bold text-destructive">{error}</p>}
      </div>
      <button
        type="button"
        onClick={handleRemove}
        disabled={pending}
        className="inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-border bg-card px-4 text-base font-bold text-foreground transition-colors hover:border-destructive hover:text-destructive focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 disabled:opacity-60"
      >
        <UserMinus className="size-5 shrink-0" aria-hidden="true" />
        {pending ? 'Removing…' : 'Remove'}
      </button>
    </li>
  )
}
