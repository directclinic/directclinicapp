import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Stethoscope, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { AutoRefresh } from '@/components/auto-refresh'
import { DashboardTabs } from '@/components/dashboard/dashboard-tabs'
import type { ClinicRow } from '@/components/dashboard/clinic-list'
import type { AppointmentRow } from '@/components/dashboard/appointments-list'

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

  const displayName =
    profile.full_name || user.user_metadata?.full_name || user.email
  const roleLabel = profile.role === 'doctor' ? 'Doctor' : 'Clinic'

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <AutoRefresh />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-border bg-card px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Stethoscope className="size-6" aria-hidden="true" />
          </span>
          <span className="text-xl font-bold text-foreground">
            Insy Care
          </span>
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
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-balance text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">
              Welcome, {displayName}
            </h1>
            <p className="mt-2 text-pretty text-lg leading-relaxed text-muted-foreground">
              Manage your clinic listings and see who&apos;s booked an
              appointment with you.
            </p>
          </div>

          <DashboardTabs clinics={clinics} appointments={appointments} />
        </div>
      </main>
    </div>
  )
}
