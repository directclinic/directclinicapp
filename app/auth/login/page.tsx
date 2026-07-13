'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Lock, Mail, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { AuthShell } from '@/components/auth/auth-shell'
import { OAuthButtons } from '@/components/auth/oauth-buttons'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    // Root page decides where to send them based on role.
    router.push('/')
    router.refresh()
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to find in-network care or manage your clinic."
      footer={
        <>
          New here?{' '}
          <Link
            href="/auth/sign-up"
            className="font-bold text-primary underline underline-offset-4"
          >
            Create an account
          </Link>
        </>
      }
    >
      <OAuthButtons
        labels={{
          google: 'Continue with Google',
          or: 'or',
        }}
      />

      <form onSubmit={handleLogin} className="space-y-4">
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
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
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
          {loading ? 'Signing in…' : 'Sign in'}
          <ArrowRight className="size-6 shrink-0" aria-hidden="true" />
        </button>
      </form>
    </AuthShell>
  )
}
