import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Stethoscope, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { AutoRefresh } from '@/components/auto-refresh'
import { ClinicDashboard } from '@/components/dashboard/clinic-dashboard'
import { DoctorDashboard } from '@/components/dashboard/doctor-dashboard'
import type { ClinicRow } from '@/components/dashboard/clinic-list'
import type { AppointmentRow } from '@/components/dashboard/appointments-list'
import type { RosterClinic } from '@/components/dashboard/doctors-roster'
import type {
  DoctorMembership,
  ClinicMember,
} from '@/app/actions/clinic-members'
import type { DoctorProfile } from '@/app/actions/doctor-profile'

// Always render fresh so newly booked appointments appear on load.
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .maybeSingle()

  // Patients don't belong here; clinics/doctors do. No role -> onboarding.
  if (!profile?.role) redirect('/onboarding')
  if (profile.role === 'patient') redirect('/patient')

  const displayName =
    profile.full_name || user.user_metadata?.full_name || user.email

  // ---- Doctor dashboard: join clinics via "Find my clinic" ----
  if (profile.role === 'doctor') {
    const { data: membershipData } = await supabase
      .from('clinic_members')
      .select('id, clinic_id, created_at, clinics(name, address)')
      .eq('doctor_id', user.id)
      .order('created_at', { ascending: false })

    const memberships: DoctorMembership[] = (membershipData ?? []).map((m) => {
      const clinic = (
        m as unknown as {
          clinics?: { name?: string; address?: string } | { name?: string; address?: string }[]
        }
      ).clinics
      const c = Array.isArray(clinic) ? clinic[0] : clinic
      return {
        id: m.id,
        clinic_id: m.clinic_id,
        clinic_name: c?.name ?? 'Clinic',
        clinic_address: c?.address ?? null,
        created_at: m.created_at,
      }
    })

    // Doctor's public profile + appointments booked at clinics they belong to.
    const memberClinicIds = memberships.map((m) => m.clinic_id)
    const [{ data: docProfile }, apptRes] = await Promise.all([
      supabase
        .from('doctor_profiles')
        .select(
          'id, full_name, credential, specialty, bio, languages, years_experience, phone, accepting_new',
        )
        .eq('id', user.id)
        .maybeSingle(),
      memberClinicIds.length > 0
        ? supabase
            .from('appointments')
            .select(
              'id, patient_name, patient_email, patient_phone, care_type, appointment_date, appointment_time, reason, status, doctor_note, clinics(name)',
            )
            .in('clinic_id', memberClinicIds)
            .order('appointment_date', { ascending: true })
        : Promise.resolve({ data: [] as unknown[] }),
    ])

    const doctorAppointments: AppointmentRow[] = (
      (apptRes.data ?? []) as Record<string, unknown>[]
    ).map((a) => {
      const clinicName = a.clinics as
        | { name?: string }
        | { name?: string }[]
        | undefined
      const name = Array.isArray(clinicName)
        ? clinicName[0]?.name
        : clinicName?.name
      return {
        id: a.id as string,
        clinic_name: name ?? 'Clinic',
        patient_name: a.patient_name as string,
        patient_email: a.patient_email as string | null,
        patient_phone: a.patient_phone as string | null,
        care_type: a.care_type as string | null,
        appointment_date: a.appointment_date as string,
        appointment_time: a.appointment_time as string,
        reason: a.reason as string | null,
        status: a.status as string,
        doctor_note: a.doctor_note as string | null,
      }
    })

    const fallbackName =
      profile.full_name || user.user_metadata?.full_name || user.email || 'Doctor'

    return (
      <DashboardShell displayName={displayName} roleLabel="Doctor">
        <h1 className="text-balance text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">
          Welcome, {displayName}
        </h1>
        <p className="mb-8 mt-2 text-pretty text-lg leading-relaxed text-muted-foreground">
          Build your profile, review your appointments, and manage the clinics
          you work at.
        </p>
        <DoctorDashboard
          memberships={memberships}
          profile={(docProfile as DoctorProfile | null) ?? null}
          appointments={doctorAppointments}
          fallbackName={fallbackName}
        />
      </DashboardShell>
    )
  }

  // ---- Clinic dashboard: appointments, clinics, and doctor roster ----
  // Fetch clinics owned by this user, plus appointments made against them.
  const [{ data: clinicsData }, { data: apptData }] = await Promise.all([
    supabase
      .from('clinics')
      .select(
        'id, name, provider_name, specialty, neighborhood, borough, address, phone, accepting_new',
      )
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('appointments')
      .select(
        'id, clinic_id, patient_name, patient_email, patient_phone, care_type, appointment_date, appointment_time, reason, status, doctor_note, clinics(name)',
      )
      .eq('clinic_owner_id', user.id)
      .order('appointment_date', { ascending: true }),
  ])

  const appointments: AppointmentRow[] = (apptData ?? []).map((a) => {
    const clinicName =
      (a as unknown as { clinics?: { name?: string } | { name?: string }[] })
        .clinics
    const name = Array.isArray(clinicName)
      ? clinicName[0]?.name
      : clinicName?.name
    return {
      id: a.id,
      clinic_name: name ?? 'Your clinic',
      patient_name: a.patient_name,
      patient_email: a.patient_email,
      patient_phone: a.patient_phone,
      care_type: a.care_type,
      appointment_date: a.appointment_date,
      appointment_time: a.appointment_time,
      reason: a.reason,
      status: a.status,
      doctor_note: a.doctor_note,
    }
  })

  // Booking counts per clinic.
  const counts = new Map<string, number>()
  for (const a of apptData ?? []) {
    counts.set(a.clinic_id, (counts.get(a.clinic_id) ?? 0) + 1)
  }

  const clinics: ClinicRow[] = (clinicsData ?? []).map((c) => ({
    ...c,
    bookingCount: counts.get(c.id) ?? 0,
  }))

  // Doctor roster grouped per owned clinic.
  const clinicIds = (clinicsData ?? []).map((c) => c.id)
  let members: ClinicMember[] = []
  if (clinicIds.length > 0) {
    const { data: memberData } = await supabase
      .from('clinic_members')
      .select(
        'id, clinic_id, doctor_id, doctor_name, doctor_specialty, doctor_email, created_at',
      )
      .in('clinic_id', clinicIds)
      .order('created_at', { ascending: false })
    members = (memberData ?? []) as (ClinicMember & { clinic_id: string })[]
  }

  const roster: RosterClinic[] = (clinicsData ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    doctors: members.filter(
      (m) => (m as unknown as { clinic_id: string }).clinic_id === c.id,
    ),
  }))

  return (
    <DashboardShell displayName={displayName} roleLabel="Clinic">
      <h1 className="text-balance text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">
        Welcome, {displayName}
      </h1>
      <p className="mb-8 mt-2 text-pretty text-lg leading-relaxed text-muted-foreground">
        See your total appointments, manage your clinic listings, and view the
        doctors who work with you.
      </p>
      <ClinicDashboard
        clinics={clinics}
        appointments={appointments}
        roster={roster}
      />
    </DashboardShell>
  )
}

// Shared header + layout chrome for both the clinic and doctor dashboards.
function DashboardShell({
  displayName,
  roleLabel,
  children,
}: {
  displayName: string | null | undefined
  roleLabel: string
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <AutoRefresh />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-border bg-card px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Stethoscope className="size-6" aria-hidden="true" />
          </span>
          <span className="text-xl font-bold text-foreground">Insy Care</span>
          <span className="ml-2 rounded-full bg-accent px-3 py-1 text-sm font-bold text-accent-foreground">
            {roleLabel}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/intake"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-border bg-card px-4 text-base font-bold text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
          >
            <Search className="size-4 shrink-0" aria-hidden="true" />
            Patient view
          </Link>
        </div>
      </header>

      <main className="flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-4xl">{children}</div>
      </main>
    </div>
  )
}
