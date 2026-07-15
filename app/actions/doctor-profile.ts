'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export interface DoctorProfile {
  id: string
  full_name: string
  credential: string | null
  specialty: string | null
  bio: string | null
  languages: string[]
  years_experience: number | null
  phone: string | null
  accepting_new: boolean
}

// Doctor-facing: read the current doctor's own public profile (if created).
export async function getMyDoctorProfile(): Promise<DoctorProfile | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('doctor_profiles')
    .select(
      'id, full_name, credential, specialty, bio, languages, years_experience, phone, accepting_new',
    )
    .eq('id', user.id)
    .maybeSingle()

  return (data as DoctorProfile | null) ?? null
}

// Doctor-facing: create or update the current doctor's public profile.
export async function saveDoctorProfile(
  input: {
    fullName: string
    credential: string
    specialty: string
    bio: string
    languages: string[]
    yearsExperience: string
    phone: string
    acceptingNew: boolean
  },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'You must be signed in.' }

  const fullName = input.fullName.trim()
  if (!fullName) return { ok: false, error: 'Please enter your name.' }

  const yearsParsed = Number.parseInt(input.yearsExperience, 10)
  const years =
    Number.isFinite(yearsParsed) && yearsParsed >= 0 ? yearsParsed : null

  const row = {
    id: user.id,
    full_name: fullName,
    credential: input.credential.trim() || null,
    specialty: input.specialty.trim() || null,
    bio: input.bio.trim() || null,
    languages: input.languages.filter((l) => l.trim()),
    years_experience: years,
    phone: input.phone.trim() || null,
    accepting_new: input.acceptingNew,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('doctor_profiles')
    .upsert(row, { onConflict: 'id' })

  if (error) return { ok: false, error: error.message }

  // Keep the denormalized roster snapshot in sync so clinic owners and
  // patients see the doctor's latest name/specialty.
  await supabase
    .from('clinic_members')
    .update({ doctor_name: fullName, doctor_specialty: row.specialty })
    .eq('doctor_id', user.id)

  revalidatePath('/dashboard')
  return { ok: true }
}
