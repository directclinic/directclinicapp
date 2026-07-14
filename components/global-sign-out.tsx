import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/actions/account'

/**
 * A single, app-wide sign-out control. Rendered from the root layout so it
 * appears on every page, but only when a user is actually signed in. This keeps
 * one consistent sign-out affordance everywhere instead of per-page buttons.
 */
export async function GlobalSignOut() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  return (
    <form action={signOut} className="fixed bottom-4 right-4 z-50">
      <button
        type="submit"
        className="inline-flex min-h-12 items-center gap-2 rounded-xl border-2 border-border bg-card px-4 text-base font-bold text-foreground shadow-lg transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
      >
        <LogOut className="size-5 shrink-0" aria-hidden="true" />
        Sign out
      </button>
    </form>
  )
}
