import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  Stethoscope,
  Building2,
  MapPin,
  Phone,
  Languages,
  BadgeCheck,
  Clock,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface DoctorProfileRow {
  id: string
  full_name: string
  credential: string | null
  specialty: string | null
  bio: string | null
  languages: string[] | null
  years_experience: number | null
  phone: string | null
  accepting_new: boolean
}

export default async function DoctorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Public profile (readable by anyone via RLS) + the clinics this doctor
  // works at, pulled from their membership snapshot.
  const [{ data: profile }, { data: memberships }] = await Promise.all([
    supabase
      .from('doctor_profiles')
      .select(
        'id, full_name, credential, specialty, bio, languages, years_experience, phone, accepting_new',
      )
      .eq('id', id)
      .maybeSingle(),
    supabase
      .from('clinic_members')
      .select('clinic_id, doctor_name, doctor_specialty, clinics(name, address)')
      .eq('doctor_id', id),
  ])

  const roster = (memberships ?? []) as unknown as {
    clinic_id: string
    doctor_name: string | null
    doctor_specialty: string | null
    clinics: { name?: string; address?: string } | { name?: string; address?: string }[] | null
  }[]

  // If the doctor never filled in a profile, fall back to the roster snapshot
  // so patients still see a basic page instead of a 404.
  const snapshotName = roster[0]?.doctor_name ?? null
  const snapshotSpecialty = roster[0]?.doctor_specialty ?? null

  const doc: DoctorProfileRow | null =
    (profile as DoctorProfileRow | null) ??
    (snapshotName
      ? {
          id,
          full_name: snapshotName,
          credential: null,
          specialty: snapshotSpecialty,
          bio: null,
          languages: [],
          years_experience: null,
          phone: null,
          accepting_new: true,
        }
      : null)

  if (!doc) notFound()

  const clinics = roster.map((r) => {
    const c = Array.isArray(r.clinics) ? r.clinics[0] : r.clinics
    return {
      id: r.clinic_id,
      name: c?.name ?? 'Clinic',
      address: c?.address ?? null,
    }
  })

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b-2 border-border bg-card px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Stethoscope className="size-6" aria-hidden="true" />
          </span>
          <span className="text-xl font-bold text-foreground">Insy Care</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <Link
          href="/search"
          className="mb-6 inline-flex min-h-11 items-center gap-2 text-base font-bold text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
        >
          <ArrowLeft className="size-5 shrink-0" aria-hidden="true" />
          Back to search
        </Link>

        {/* Identity */}
        <section className="rounded-3xl border-2 border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start gap-5">
            <span
              className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-3xl font-extrabold text-primary"
              aria-hidden="true"
            >
              {initials(doc.full_name)}
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="text-balance text-3xl font-extrabold leading-tight text-foreground">
                {doc.full_name}
                {doc.credential ? `, ${doc.credential}` : ''}
              </h1>
              {doc.specialty && (
                <p className="mt-1 text-xl font-semibold text-muted-foreground">
                  {doc.specialty}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                {doc.accepting_new && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-success px-4 py-1.5 text-base font-bold text-success-foreground">
                    <BadgeCheck className="size-4 shrink-0" aria-hidden="true" />
                    Accepting new patients
                  </span>
                )}
                {doc.years_experience != null && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-base font-bold text-accent-foreground">
                    <Clock className="size-4 shrink-0" aria-hidden="true" />
                    {doc.years_experience}+ years experience
                  </span>
                )}
              </div>
            </div>
          </div>

          {doc.bio && (
            <p className="mt-6 text-pretty text-lg leading-relaxed text-foreground">
              {doc.bio}
            </p>
          )}

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {doc.languages && doc.languages.length > 0 && (
              <div className="flex items-start gap-3 rounded-2xl border-2 border-border p-4">
                <Languages
                  className="mt-0.5 size-5 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-base font-bold text-foreground">
                    Languages
                  </p>
                  <p className="text-base text-muted-foreground">
                    {doc.languages.join(', ')}
                  </p>
                </div>
              </div>
            )}
            {doc.phone && (
              <div className="flex items-start gap-3 rounded-2xl border-2 border-border p-4">
                <Phone
                  className="mt-0.5 size-5 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-base font-bold text-foreground">Phone</p>
                  <a
                    href={`tel:${doc.phone}`}
                    className="text-base text-primary underline-offset-2 hover:underline"
                  >
                    {doc.phone}
                  </a>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Clinics */}
        {clinics.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-4 text-2xl font-extrabold text-foreground">
              Where you can see {firstName(doc.full_name)}
            </h2>
            <ul className="space-y-3">
              {clinics.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center gap-4 rounded-2xl border-2 border-border bg-card p-4"
                >
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Building2 className="size-6" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-lg font-bold text-foreground">
                      {c.name}
                    </p>
                    {c.address && (
                      <p className="flex items-center gap-1.5 truncate text-base text-muted-foreground">
                        <MapPin className="size-4 shrink-0" aria-hidden="true" />
                        {c.address}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  )
}

function initials(name: string) {
  const parts = name.replace(/^Dr\.?\s+/i, '').trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || 'DR'
}

function firstName(name: string) {
  const cleaned = name.replace(/^Dr\.?\s+/i, '').trim()
  return cleaned.split(/\s+/)[0] || cleaned
}
