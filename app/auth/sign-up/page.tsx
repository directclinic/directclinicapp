'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, Lock, Mail, ArrowRight, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { createAccount } from '@/app/actions/account'
import { AuthShell } from '@/components/auth/auth-shell'
import { OAuthButtons } from '@/components/auth/oauth-buttons'

export default function SignUpPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)

    // Create a pre-confirmed account server-side (no confirmation email).
    const result = await createAccount({ email, password, fullName })
    if (!result.ok) {
      setError(result.error)
      setLoading(false)
      return
    }

    // Immediately sign the new user in and route them to role selection.
    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })
    if (signInError) {
      // Account exists but sign-in failed — send them to the login page.
      setError('Account created. Please sign in to continue.')
      setLoading(false)
      router.push('/auth/login')
      return
    }
    router.push('/onboarding')
    router.refresh()
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join Insy Care to find care or list your practice."
      footer={
        <>
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="font-bold text-primary underline underline-offset-4"
          >
            Sign in
          </Link>
        </>
      }
    >
      <Link
        href="/"
        className="mb-4 inline-flex min-h-11 items-center gap-2 text-base font-bold text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
      >
        <ArrowLeft className="size-5 shrink-0" aria-hidden="true" />
        Back to home
      </Link>

      <OAuthButtons
        labels={{
          google: 'Sign up with Google',
          or: 'or',
        }}
      />

      <form onSubmit={handleSignUp} className="space-y-4">
        <div>
          <label
            htmlFor="fullName"
            className="mb-1.5 block text-lg font-bold text-foreground"
          >
            Full name
          </label>
          <div className="relative">
            <User
              className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Doe"
              className="min-h-14 w-full rounded-2xl border-2 border-border bg-card pl-12 pr-4 text-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-lg font-bold text-foreground"
          >
            Email
          </label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="min-h-14 w-full rounded-2xl border-2 border-border bg-card pl-12 pr-4 text-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-lg font-bold text-foreground"
          >
            Password
          </label>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="min-h-14 w-full rounded-2xl border-2 border-border bg-card pl-12 pr-4 text-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="confirm"
            className="mb-1.5 block text-lg font-bold text-foreground"
          >
            Confirm password
          </label>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter your password"
              className="min-h-14 w-full rounded-2xl border-2 border-border bg-card pl-12 pr-4 text-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
            />
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-xl border-2 border-destructive/40 bg-destructive/10 px-4 py-2 text-center text-base font-semibold text-destructive"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-primary px-6 text-xl font-extrabold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
        >
          {loading ? 'Creating account…' : 'Create account'}
          <ArrowRight className="size-6 shrink-0" aria-hidden="true" />
        </button>
      </form>
    </AuthShell>
  )
}
