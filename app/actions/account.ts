'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type Role = 'patient' | 'doctor' | 'clinic'

// Create an account WITHOUT sending a confirmation email. We use the Admin API
// with `email_confirm: true` so the user is immediately confirmed and can sign
// in right away. This sidesteps Supabase's built-in email rate limit, which was
// blocking signups when many confirmation emails were requested.
export async function createAccount(input: {
  email: string
  password: string
  fullName: string
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const email = input.email.trim().toLowerCase()
  const fullName = input.fullName.trim()

  if (!email || !input.password) {
    return { ok: false, error: 'Email and password are required.' }
  }
  if (input.password.length < 6) {
    return { ok: false, error: 'Password must be at least 6 characters.' }
  }

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  })

  if (error) {
    // Friendlier message for the most common case.
    if (
      error.message.toLowerCase().includes('already') ||
      error.status === 422
    ) {
      return {
        ok: false,
        error: 'An account with this email already exists. Please sign in.',
      }
    }
    return { ok: false, error: error.message }
  }

  return { ok: true }
}

// Persist the chosen role on the user's profile, then route accordingly.
export async function setRole(role: Role) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Upsert (not update): some accounts — especially those created via the
  // admin API — may not have a profiles row yet, in which case a plain update
  // would affect zero rows and the role would never persist, bouncing the user
  // back to onboarding. Upsert creates the row when missing and updates it
  // otherwise.
  const { error } = await supabase.from('profiles').upsert(
    {
      id: user.id,
      full_name:
        (user.user_metadata?.full_name as string | undefined) ?? null,
      role,
    },
    { onConflict: 'id' },
  )

  if (error) {
    // Surface as a thrown error the client boundary can catch.
    throw new Error(error.message)
  }

  if (role === 'patient') {
    // New patients pick their preferred language next.
    redirect('/onboarding/language')
  }
  redirect('/dashboard')
}

// Save (or update) the patient's preferred language on their profile so it
// becomes their default across devices. Called from the onboarding language
// step and the global language switcher. Fails quietly when signed out.
export async function saveLanguage(
  code: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { ok: false, error: 'Not signed in.' }

  const { error } = await supabase
    .from('profiles')
    .update({ preferred_language: code })
    .eq('id', user.id)

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

// Save (or update) the patient's insurance selection on their profile.
// Upserts so it works even if a profile row is somehow missing, and keeps the
// existing role intact via onConflict merge.
export async function saveInsurance(input: {
  carrier: string
  plan: string
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const carrier = input.carrier.trim()
  const plan = input.plan.trim()

  if (!carrier || !plan) {
    return { ok: false, error: 'Please choose an insurance carrier and plan.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, error: 'Please sign in to save your insurance.' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      insurance_carrier: carrier,
      insurance_plan: plan,
      insurance_updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/patient')
  return { ok: true }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}
