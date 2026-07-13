'use server'

import { redirect } from 'next/navigation'
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
      email: user.email ?? null,
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
    redirect('/patient')
  }
  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}
