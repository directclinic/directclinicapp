'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { geocodeAddress } from '@/lib/geocode'

export interface ClinicInput {
  name: string
  providerName: string
  specialty: string
  careTypes: string[]
  acceptedCarriers: string[]
  neighborhood: string
  borough: string
  address: string
  phone: string
  languages: string[]
  copayUsd: number | null
  acceptingNew: boolean
}

export type ActionResult = { ok: true } | { ok: false; error: string }

// Register a new clinic owned by the current doctor/clinic user. The address is
// geocoded server-side so the clinic can appear on the patient map & search.
export async function createClinic(input: ClinicInput): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { ok: false, error: 'You must be signed in.' }
  if (!input.name.trim() || !input.address.trim()) {
    return { ok: false, error: 'Clinic name and address are required.' }
  }

  // Best-effort geocoding; a clinic still saves without coordinates.
  let latitude: number | null = null
  let longitude: number | null = null
  try {
    const geo = await geocodeAddress(input.address)
    if (geo) {
      latitude = geo.lat
      longitude = geo.lng
    }
  } catch {
    // ignore geocoding failures
  }

  const { error } = await supabase.from('clinics').insert({
    owner_id: user.id,
    name: input.name.trim(),
    provider_name: input.providerName.trim() || null,
    specialty: input.specialty.trim() || null,
    care_types: input.careTypes,
    accepted_carriers: input.acceptedCarriers,
    neighborhood: input.neighborhood.trim() || null,
    borough: input.borough || null,
    address: input.address.trim(),
    phone: input.phone.trim() || null,
    latitude,
    longitude,
    languages: input.languages,
    copay_usd: input.copayUsd,
    accepting_new: input.acceptingNew,
  })

  if (error) return { ok: false, error: error.message }

  revalidatePath('/dashboard')
  return { ok: true }
}

export async function deleteClinic(clinicId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'You must be signed in.' }

  const { error } = await supabase
    .from('clinics')
    .delete()
    .eq('id', clinicId)
    .eq('owner_id', user.id)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/dashboard')
  return { ok: true }
}
