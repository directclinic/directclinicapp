'use server'

import { revalidatePath } from 'next/cache'
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

  // Refresh both dashboards so the new booking shows up right away.
  revalidatePath('/dashboard')
  revalidatePath('/patient')
  return { ok: true }
}

// Let a doctor/clinic add or update the note for one of their appointments.
// Scoped to clinic_owner_id so a user can only write notes on their own
// appointments; the DB RLS policy enforces this too.
export async function saveDoctorNote(
  appointmentId: string,
  note: string,
): Promise<BookingResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, error: 'Please sign in to save a note.' }
  }

  const { error } = await supabase
    .from('appointments')
    .update({
      doctor_note: note.trim() || null,
      note_updated_at: new Date().toISOString(),
    })
    .eq('id', appointmentId)
    .eq('clinic_owner_id', user.id)

  if (error) return { ok: false, error: error.message }

  // Patient dashboard reads these notes; refresh it and the doctor view.
  revalidatePath('/patient')
  revalidatePath('/dashboard')
  return { ok: true }
}
