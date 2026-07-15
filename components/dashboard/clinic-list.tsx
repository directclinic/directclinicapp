'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Phone, Trash2, Users } from 'lucide-react'
import { deleteClinic } from '@/app/actions/clinics'

export interface ClinicRow {
  id: string
  name: string
  provider_name: string | null
  specialty: string | null
  neighborhood: string | null
  borough: string | null
  address: string
  phone: string | null
  accepting_new: boolean
  bookingCount: number
}

export function ClinicList({ clinics }: { clinics: ClinicRow[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteClinic(id)
      router.refresh()
    })
  }

  if (clinics.length === 0) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-border bg-card p-8 text-center">
        <p className="text-lg font-semibold text-muted-foreground">
          You haven&apos;t added any clinics yet. Use the form to register your
          first location.
        </p>
      </div>
    )
  }

  return (
    <ul className="space-y-4">
      {clinics.map((c) => (
        <li
          key={c.id}
          className="rounded-3xl border-2 border-border bg-card p-6 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-xl font-extrabold text-foreground">
                {c.name}
              </h3>
              {c.provider_name && (
                <p className="text-base text-muted-foreground">
                  {c.provider_name}
                  {c.specialty ? ` · ${c.specialty}` : ''}
                </p>
              )}
              <p className="mt-2 flex items-center gap-1.5 text-base text-muted-foreground">
                <MapPin className="size-4 shrink-0" aria-hidden="true" />
                {c.address}
              </p>
              {c.phone && (
                <p className="mt-1 flex items-center gap-1.5 text-base text-muted-foreground">
                  <Phone className="size-4 shrink-0" aria-hidden="true" />
                  {c.phone}
                </p>
              )}
            </div>

            <div className="flex flex-col items-end gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-base font-bold text-primary">
                <Users className="size-4 shrink-0" aria-hidden="true" />
                {c.bookingCount}{' '}
                {c.bookingCount === 1 ? 'booking' : 'bookings'}
              </span>
              <button
                type="button"
                onClick={() => handleDelete(c.id)}
                disabled={pending}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-destructive/40 bg-card px-4 text-base font-bold text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-destructive/30"
              >
                <Trash2 className="size-4 shrink-0" aria-hidden="true" />
                Remove
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
