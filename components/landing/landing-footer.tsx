import Link from 'next/link'
import { Stethoscope } from 'lucide-react'

export function LandingFooter() {
  return (
    <footer className="border-t-2 border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Stethoscope className="size-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-bold text-foreground">Insy Care</span>
        </div>
        <p className="text-center text-sm text-muted-foreground sm:text-right">
          Helping adult immigrants in NYC find in-network care in their
          language.
        </p>
        <div className="flex items-center gap-6">
          <Link
            href="/auth/login"
            className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
          >
            Sign in
          </Link>
          <Link
            href="/auth/sign-up"
            className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
          >
            Get started
          </Link>
        </div>
      </div>
    </footer>
  )
}
