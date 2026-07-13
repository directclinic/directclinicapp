import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CalendarCheck, FileText, History, Search, Stethoscope } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { AutoRefresh } from '@/components/auto-refresh'
import { InsuranceCard } from '@/components/patient/insurance-card'
import {
  PatientAppointments,
  type PatientAppointment,
} from '@/components/patient/patient-appointments'

// Always render fresh so newly booked appointments and doctor notes appear.
export const dynamic = 'force-dynamic'

export default async function PatientDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, insurance_carrier, insurance_plan')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.role) redirect('/onboarding')
  // Doctors/clinics have their own dashboard.
  if (profile.role !== 'patient') redirect('/dashboard')

  const { data: apptData } = await supabase
    .from('appointments')
    .select(
      'id, care_type, appointment_date, appointment_time, reason, status, doctor_note, clinics(name, provider_name, address)',
    )
    .eq('patient_id', user.id)
    .order('appointment_date', { ascending: true })

  const appointments: PatientAppointment[] = (apptData ?? []).map((a) => {
    const clinic = (
      a as unknown as {
        clinics?:
          | { name?: string; provider_name?: string; address?: string }
          | { name?: string; provider_name?: string; address?: string }[]
      }
    ).clinics
    const c = Array.isArray(clinic) ? clinic[0] : clinic
    return {
      id: a.id,
      clinic_name: c?.name ?? 'Clinic',
      provider_name: c?.provider_name ?? null,
      care_type: a.care_type,
      address: c?.address ?? null,
      appointment_date: a.appointment_date,
      appointment_time: a.appointment_time,
      reason: a.reason,
      status: a.status,
      doctor_note: a.doctor_note,
    }
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const upcomingCount = appointments.filter(
    (a) => new Date(a.appointment_date + 'T00:00:00') >= today,
  ).length
  const pastCount = appointments.length - upcomingCount
  const notesCount = appointments.filter((a) => a.doctor_note).length

  const displayName =
    profile.full_name || user.user_metadata?.full_name || user.email

  const stats = [
    { label: 'Upcoming', value: upcomingCount, icon: CalendarCheck },
    { label: 'Past visits', value: pastCount, icon: History },
    { label: 'Doctor notes', value: notesCount, icon: FileText },
  ]

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <AutoRefresh />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-border bg-card px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Stethoscope className="size-6" aria-hidden="true" />
          </span>
          <span className="text-xl font-bold text-foreground">
            Direct Clinic
          </span>
          <span className="ml-2 rounded-full bg-accent px-3 py-1 text-sm font-bold text-accent-foreground">
            Patient
          </span>
        </div>
        <Link
          href="/intake"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-base font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
        >
          <Search className="size-4 shrink-0" aria-hidden="true" />
          Find &amp; book care
        </Link>
      </header>

      <main className="flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <h1 className="text-balance text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">
              Welcome back, {displayName}
            </h1>
            <p className="mt-2 text-pretty text-lg leading-relaxed text-muted-foreground">
              Track your upcoming and past appointments, and read the notes your
              doctor left after each visit.
            </p>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map((s) => {
              const Icon = s.icon
              return (
                <div
                  key={s.label}
                  className="flex items-center gap-4 rounded-3xl border-2 border-border bg-card p-5 shadow-sm"
                >
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="size-7" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-3xl font-extrabold text-foreground">
                      {s.value}
                    </p>
                    <p className="text-base text-muted-foreground">{s.label}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <InsuranceCard
            carrier={profile.insurance_carrier ?? null}
            plan={profile.insurance_plan ?? null}
          />

          <PatientAppointments appointments={appointments} />
        </div>
      </main>
    </div>
  )
}
