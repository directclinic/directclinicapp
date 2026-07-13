'use server'

import { createClient } from '@/lib/supabase/server'

export interface BookingInput {
  clinicId: string
  clinicOwnerId: string
  patientName: string
  patientEmail?: string
  patientPhone?: string
  careType?: string
  appointmentDate: string // YYYY-MM-DD
  appointmentTime: string
  reason?: string
}

export type BookingResult = { ok: true } | { ok: false; error: string }

// Persist a patient's booking so it appears on the clinic owner's dashboard.
export async function bookAppointment(
  input: BookingInput,
): Promise<BookingResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, error: 'Please sign in to book an appointment.' }
  }

  const { error } = await supabase.from('appointments').insert({
    clinic_id: input.clinicId,
    clinic_owner_id: input.clinicOwnerId,
    patient_id: user.id,
    patient_name: input.patientName.trim() || user.email || 'Patient',
    patient_email: input.patientEmail?.trim() || user.email || null,
    patient_phone: input.patientPhone?.trim() || null,
    care_type: input.careType || null,
    appointment_date: input.appointmentDate,
    appointment_time: input.appointmentTime,
    reason: input.reason?.trim() || null,
  })

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}
