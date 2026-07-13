'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const REDIRECT =
  process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
  (typeof window !== 'undefined'
    ? `${window.location.origin}/auth/callback`
    : undefined)

function GoogleIcon() {
  return (
    <svg className="size-6 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg
      className="size-6 shrink-0"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.05 12.54c-.02-2.06 1.68-3.05 1.76-3.1-.96-1.4-2.45-1.6-2.99-1.62-1.27-.13-2.48.75-3.13.75-.64 0-1.64-.73-2.7-.71-1.39.02-2.67.81-3.38 2.05-1.44 2.5-.37 6.2 1.03 8.23.69.99 1.5 2.1 2.57 2.06 1.03-.04 1.42-.66 2.67-.66 1.24 0 1.6.66 2.69.64 1.11-.02 1.81-1 2.49-2 .78-1.15 1.1-2.26 1.12-2.32-.02-.01-2.15-.82-2.17-3.26ZM15.0 6.28c.57-.69.95-1.65.85-2.6-.82.03-1.81.54-2.4 1.23-.53.61-.99 1.58-.87 2.51.91.07 1.85-.46 2.42-1.14Z" />
    </svg>
  )
}

export function OAuthButtons({
  labels,
}: {
  labels: { google: string; apple: string; or: string }
}) {
  const [loading, setLoading] = useState<null | 'google' | 'apple'>(null)
  const [error, setError] = useState<string | null>(null)

  async function signInWith(provider: 'google' | 'apple') {
    setError(null)
    setLoading(provider)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: REDIRECT },
    })
    if (error) {
      setError(error.message)
      setLoading(null)
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => signInWith('google')}
        disabled={loading !== null}
        className="flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl border-2 border-border bg-card px-5 text-lg font-bold text-foreground transition-colors hover:border-primary hover:bg-accent disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
      >
        <GoogleIcon />
        {loading === 'google' ? '…' : labels.google}
      </button>
      <button
        type="button"
        onClick={() => signInWith('apple')}
        disabled={loading !== null}
        className="flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl border-2 border-foreground bg-foreground px-5 text-lg font-bold text-background transition-colors hover:opacity-90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
      >
        <AppleIcon />
        {loading === 'apple' ? '…' : labels.apple}
      </button>

      {error && (
        <p
          role="alert"
          className="rounded-xl border-2 border-destructive/40 bg-destructive/10 px-4 py-2 text-center text-base font-semibold text-destructive"
        >
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 py-1">
        <span className="h-0.5 flex-1 bg-border" />
        <span className="text-base font-semibold text-muted-foreground">
          {labels.or}
        </span>
        <span className="h-0.5 flex-1 bg-border" />
      </div>
    </div>
  )
}
