import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PatientDashboard } from '@/components/patient/patient-dashboard'
import { type PatientAppointment } from '@/components/patient/patient-appointments'
import { LANGUAGES, type LanguageCode } from '@/lib/i18n'

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
    .select(
      'role, full_name, insurance_carrier, insurance_plan, preferred_language',
    )
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

  const displayName =
    profile.full_name || user.user_metadata?.full_name || user.email || ''

  const preferredLanguage: LanguageCode = LANGUAGES.some(
    (l) => l.code === profile.preferred_language,
  )
    ? (profile.preferred_language as LanguageCode)
    : 'en'

  return (
    <PatientDashboard
      displayName={displayName}
      initialLanguage={preferredLanguage}
      insuranceCarrier={profile.insurance_carrier ?? null}
      insurancePlan={profile.insurance_plan ?? null}
      appointments={appointments}
    />
  )
}
