'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Users, ChevronRight, Loader2, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface RosterDoctor {
  doctor_id: string
  doctor_name: string
  doctor_specialty: string | null
}

function initials(name: string) {
  const parts = name.replace(/^Dr\.?\s+/i, '').trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || 'DR'
}

// Shown on registered-clinic cards in patient search. Lazily loads the clinic's
// doctor roster and links each doctor to their public profile page.
export function ClinicDoctors({ clinicId }: { clinicId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [doctors, setDoctors] = useState<RosterDoctor[]>([])

  async function toggle(e: React.MouseEvent) {
    e.stopPropagation()
    const next = !open
    setOpen(next)
    if (next && !loaded) {
      setLoading(true)
      const supabase = createClient()
      const { data } = await supabase
        .from('clinic_members')
        .select('doctor_id, doctor_name, doctor_specialty')
        .eq('clinic_id', clinicId)
        .order('doctor_name', { ascending: true })
      setDoctors((data as RosterDoctor[]) ?? [])
      setLoaded(true)
      setLoading(false)
    }
  }

  return (
    <div className="mt-4 border-t-2 border-border pt-4">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="inline-flex min-h-11 w-full items-center justify-between gap-2 rounded-xl bg-muted px-4 text-base font-bold text-foreground transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
      >
        <span className="flex items-center gap-2">
          <Users className="size-5 shrink-0 text-primary" aria-hidden="true" />
          See our doctors
        </span>
        <ChevronDown
          className={`size-5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="mt-3">
          {loading && (
            <p className="flex items-center gap-2 px-1 text-base text-muted-foreground">
              <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden="true" />
              Loading doctors…
            </p>
          )}
          {loaded && doctors.length === 0 && (
            <p className="px-1 text-base text-muted-foreground">
              No doctors have added themselves to this clinic yet.
            </p>
          )}
          {doctors.length > 0 && (
            <ul className="space-y-2">
              {doctors.map((d) => (
                <li key={d.doctor_id}>
                  <Link
                    href={`/doctors/${d.doctor_id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-3 rounded-xl border-2 border-border bg-card p-3 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
                  >
                    <span
                      className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-base font-bold text-primary"
                      aria-hidden="true"
                    >
                      {initials(d.doctor_name)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-base font-bold text-foreground">
                        {d.doctor_name}
                      </span>
                      {d.doctor_specialty && (
                        <span className="block truncate text-sm text-muted-foreground">
                          {d.doctor_specialty}
                        </span>
                      )}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-primary">
                      View profile
                      <ChevronRight className="size-4 shrink-0" aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
