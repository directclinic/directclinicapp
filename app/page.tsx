import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Login-first entry point. Route users based on auth state + selected role.
export default async function RootPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.role) {
    redirect('/onboarding')
  }

  if (profile.role === 'patient') {
    redirect('/intake')
  }

  // Doctors and clinics go to their clinic workspace.
  redirect('/dashboard')
}
