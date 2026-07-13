import { redirect } from 'next/navigation'
import { Stethoscope } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { RolePicker } from '@/components/onboarding/role-picker'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // If a role is already set, skip straight to the right place.
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role === 'patient') redirect('/patient')
  if (profile?.role === 'doctor' || profile?.role === 'clinic') {
    redirect('/dashboard')
  }

  const displayName =
    profile?.full_name || user.user_metadata?.full_name || user.email

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex items-center justify-between gap-2 border-b-2 border-border bg-card px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Stethoscope className="size-6" aria-hidden="true" />
          </span>
          <span className="text-xl font-bold text-foreground">
            Direct Clinic
          </span>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-3xl">
          <div className="mb-8 text-center">
            <h1 className="text-balance text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">
              Welcome, {displayName}
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Tell us how you&apos;ll use Direct Clinic so we can set up the
              right experience for you.
            </p>
          </div>

          <RolePicker />
        </div>
      </main>
    </div>
  )
}
