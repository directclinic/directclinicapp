'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type Role = 'patient' | 'doctor' | 'clinic'

// Persist the chosen role on the user's profile, then route accordingly.
export async function setRole(role: Role) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', user.id)

  if (error) {
    // Surface as a thrown error the client boundary can catch.
    throw new Error(error.message)
  }

  if (role === 'patient') {
    redirect('/intake')
  }
  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}
