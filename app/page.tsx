import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LandingPage } from '@/components/landing/landing-page'

// Public entry point. Logged-out visitors see the marketing landing page;
// signed-in users are routed to the right workspace based on their role.
export default async function RootPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <LandingPage />
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
    redirect('/patient')
  }

  // Doctors and clinics go to their clinic workspace.
  redirect('/dashboard')
}
