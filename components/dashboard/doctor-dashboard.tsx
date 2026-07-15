'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Building2,
  MapPin,
  Plus,
  Check,
  LogOut,
  Loader2,
  UserRound,
  CalendarClock,
} from 'lucide-react'
import {
  searchClinics,
  joinClinic,
  leaveClinic,
  type ClinicSearchResult,
  type DoctorMembership,
} from '@/app/actions/clinic-members'
import type { DoctorProfile } from '@/app/actions/doctor-profile'
import {
  DoctorProfileForm,
} from '@/components/dashboard/doctor-profile-form'
import {
  AppointmentsList,
  type AppointmentRow,
} from '@/components/dashboard/appointments-list'
import { cn } from '@/lib/utils'

type DoctorTab = 'profile' | 'appointments' | 'clinics'

export function DoctorDashboard({
  memberships,
  profile,
  appointments,
  fallbackName,
}: {
  memberships: DoctorMembership[]
  profile: DoctorProfile | null
  appointments: AppointmentRow[]
  fallbackName: string
}) {
  const [tab, setTab] = useState<DoctorTab>('profile')

  const tabs: { id: DoctorTab; label: string; icon: typeof UserRound }[] = [
    { id: 'profile', label: 'My profile', icon: UserRound },
    { id: 'appointments', label: `Appointments (${appointments.length})`, icon: CalendarClock },
    { id: 'clinics', label: `My clinics (${memberships.length})`, icon: Building2 },
  ]

  return (
    <div>
      <div
        role="tablist"
        aria-label="Doctor dashboard sections"
        className="mb-8 flex flex-wrap gap-2 border-b-2 border-border"
      >
        {tabs.map((t) => {
          const Icon = t.icon
          const active = tab === t.id
          return (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={cn(
                '-mb-0.5 inline-flex min-h-12 items-center gap-2 border-b-4 px-4 text-base font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40',
                active
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="size-5 shrink-0" aria-hidden="true" />
              {t.label}
            </button>
          )
        })}
      </div>

      {tab === 'profile' && (
        <DoctorProfileForm profile={profile} fallbackName={fallbackName} />
      )}

      {tab === 'appointments' && (
        <section>
          <h2 className="mb-2 text-2xl font-extrabold text-foreground">
            Your appointments
          </h2>
          <p className="mb-4 text-pretty text-base leading-relaxed text-muted-foreground">
            Patients who booked at the clinics you joined. Add a note after each
            visit and the patient will see it in their dashboard.
          </p>
          <AppointmentsList appointments={appointments} variant="doctor" />
        </section>
      )}

      {tab === 'clinics' && <MyClinics memberships={memberships} />}
    </div>
  )
}

function MyClinics({ memberships }: { memberships: DoctorMembership[] }) {
  const router = useRouter()

  const [term, setTerm] = useState('')
  const [results, setResults] = useState<ClinicSearchResult[] | null>(null)
  const [searching, startSearch] = useTransition()
  const [searchError, setSearchError] = useState<string | null>(null)
  const [joiningId, setJoiningId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setSearchError(null)
    startSearch(async () => {
      const result = await searchClinics(term)
      if (!result.ok) {
        setSearchError(result.error)
        setResults([])
        return
      }
      setResults(result.clinics)
    })
  }

  async function handleJoin(clinicId: string) {
    setActionError(null)
    setJoiningId(clinicId)
    const result = await joinClinic(clinicId)
    setJoiningId(null)
    if (!result.ok) {
      setActionError(result.error)
      return
    }
    // Reflect the new membership immediately in the search list, then refresh
    // the server data so the "Your clinics" section updates too.
    setResults((prev) =>
      prev
        ? prev.map((c) =>
            c.id === clinicId ? { ...c, already_member: true } : c,
          )
        : prev,
    )
    router.refresh()
  }

  return (
    <div className="space-y-10">
      {/* Find my clinic */}
      <section>
        <h2 className="mb-2 text-2xl font-extrabold text-foreground">
          Find my clinic
        </h2>
        <p className="mb-4 text-pretty text-base leading-relaxed text-muted-foreground">
          Search for the clinic you work at by name or address, then add
          yourself so patients can find you there.
        </p>

        <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="text"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Clinic name or address"
              aria-label="Search clinics by name or address"
              className="min-h-14 w-full rounded-2xl border-2 border-border bg-card pl-12 pr-4 text-lg text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-lg font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 disabled:opacity-60"
          >
            {searching ? (
              <Loader2 className="size-5 shrink-0 animate-spin" aria-hidden="true" />
            ) : (
              <Search className="size-5 shrink-0" aria-hidden="true" />
            )}
            Search
          </button>
        </form>

        {searchError && (
          <p className="mt-3 text-base font-bold text-destructive">
            {searchError}
          </p>
        )}
        {actionError && (
          <p className="mt-3 text-base font-bold text-destructive">
            {actionError}
          </p>
        )}

        {results && (
          <div className="mt-5">
            {results.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-border bg-card p-6 text-center">
                <p className="text-base text-muted-foreground">
                  No clinics found. Try a different name or address.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {results.map((clinic) => (
                  <li
                    key={clinic.id}
                    className="flex flex-wrap items-center gap-4 rounded-2xl border-2 border-border bg-card p-4"
                  >
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Building2 className="size-6" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-lg font-bold text-foreground">
                        {clinic.name}
                      </p>
                      {clinic.address && (
                        <p className="flex items-center gap-1.5 truncate text-base text-muted-foreground">
                          <MapPin className="size-4 shrink-0" aria-hidden="true" />
                          {clinic.address}
                        </p>
                      )}
                    </div>
                    {clinic.already_member ? (
                      <span className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary/10 px-4 text-base font-bold text-primary">
                        <Check className="size-5 shrink-0" aria-hidden="true" />
                        Joined
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleJoin(clinic.id)}
                        disabled={joiningId === clinic.id}
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-base font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 disabled:opacity-60"
                      >
                        {joiningId === clinic.id ? (
                          <Loader2
                            className="size-5 shrink-0 animate-spin"
                            aria-hidden="true"
                          />
                        ) : (
                          <Plus className="size-5 shrink-0" aria-hidden="true" />
                        )}
                        Add me
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      {/* Clinics I've joined */}
      <section>
        <h2 className="mb-4 text-2xl font-extrabold text-foreground">
          Your clinics
        </h2>
        {memberships.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-border bg-card p-8 text-center">
            <span className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Building2 className="size-7" aria-hidden="true" />
            </span>
            <p className="text-lg font-bold text-foreground">
              You haven&apos;t joined any clinics yet
            </p>
            <p className="mt-1 text-pretty text-base leading-relaxed text-muted-foreground">
              Use &quot;Find my clinic&quot; above to search and add yourself to
              the clinics where you work.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {memberships.map((m) => (
              <MembershipRow key={m.id} membership={m} />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function MembershipRow({ membership }: { membership: DoctorMembership }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleLeave() {
    setError(null)
    startTransition(async () => {
      const result = await leaveClinic(membership.id)
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
        <Building2 className="size-6" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-lg font-bold text-foreground">
          {membership.clinic_name}
        </p>
        {membership.clinic_address && (
          <p className="flex items-center gap-1.5 truncate text-base text-muted-foreground">
            <MapPin className="size-4 shrink-0" aria-hidden="true" />
            {membership.clinic_address}
          </p>
        )}
        {error && (
          <p className="mt-1 text-sm font-bold text-destructive">{error}</p>
        )}
      </div>
      <button
        type="button"
        onClick={handleLeave}
        disabled={pending}
        className={cn(
          'inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-border bg-card px-4 text-base font-bold text-foreground transition-colors hover:border-destructive hover:text-destructive focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 disabled:opacity-60',
        )}
      >
        <LogOut className="size-5 shrink-0" aria-hidden="true" />
        {pending ? 'Leaving…' : 'Leave'}
      </button>
    </li>
  )
}
