'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export interface ClinicSearchResult {
  id: string
  name: string
  address: string | null
  provider_name: string | null
  languages: string[] | null
  already_member: boolean
}

export interface ClinicMember {
  id: string
  doctor_id: string
  doctor_name: string
  doctor_specialty: string | null
  doctor_email: string | null
  created_at: string
}

export interface DoctorMembership {
  id: string
  clinic_id: string
  clinic_name: string
  clinic_address: string | null
  created_at: string
}

// Doctor-facing: search clinics by name or address so a doctor can find the
// place they work and add themselves to it.
export async function searchClinics(
  term: string,
): Promise<{ ok: true; clinics: ClinicSearchResult[] } | { ok: false; error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'You must be signed in.' }

  const trimmed = term.trim()
  let query = supabase
    .from('clinics')
    .select('id, name, address, provider_name, languages')
    .order('name', { ascending: true })
    .limit(25)

  if (trimmed) {
    // Match on clinic name or address (case-insensitive).
    query = query.or(`name.ilike.%${trimmed}%,address.ilike.%${trimmed}%`)
  }

  const { data: clinics, error } = await query
  if (error) return { ok: false, error: error.message }

  // Flag clinics the doctor has already joined so the UI can show "Joined".
  const { data: memberships } = await supabase
    .from('clinic_members')
    .select('clinic_id')
    .eq('doctor_id', user.id)

  const joined = new Set((memberships ?? []).map((m) => m.clinic_id))

  return {
    ok: true,
    clinics: (clinics ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      address: c.address,
      provider_name: c.provider_name,
      languages: c.languages,
      already_member: joined.has(c.id),
    })),
  }
}

// Doctor-facing: add the current doctor to a clinic. Doctor details are
// snapshotted onto the membership so clinic owners can display them.
export async function joinClinic(
  clinicId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'You must be signed in.' }

  // Pull the doctor's own profile for the denormalized snapshot.
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .maybeSingle()

  const doctorName =
    profile?.full_name?.trim() || user.email?.split('@')[0] || 'Doctor'

  const { error } = await supabase.from('clinic_members').insert({
    clinic_id: clinicId,
    doctor_id: user.id,
    doctor_name: doctorName,
    doctor_specialty: null,
    doctor_email: user.email ?? null,
  })

  if (error) {
    // Friendly message for the unique-constraint violation.
    if (error.code === '23505') {
      return { ok: false, error: 'You have already joined this clinic.' }
    }
    return { ok: false, error: error.message }
  }

  revalidatePath('/dashboard')
  return { ok: true }
}

// Doctor-facing: leave a clinic the doctor previously joined.
export async function leaveClinic(
  membershipId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'You must be signed in.' }

  const { error } = await supabase
    .from('clinic_members')
    .delete()
    .eq('id', membershipId)
    .eq('doctor_id', user.id)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/dashboard')
  return { ok: true }
}

// Clinic-facing: remove a doctor from a clinic the current user owns.
export async function removeMember(
  membershipId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'You must be signed in.' }

  // RLS ensures a clinic owner can only delete members of clinics they own.
  const { error } = await supabase
    .from('clinic_members')
    .delete()
    .eq('id', membershipId)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/dashboard')
  return { ok: true }
}
