import Link from 'next/link'
import { Stethoscope, Phone } from 'lucide-react'

const NAV_LINKS = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#why-insycare', label: 'Why InsyCare' },
  { href: '#voices', label: 'Voices' },
]

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b-2 border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Stethoscope className="size-6" aria-hidden="true" />
          </span>
          <span className="text-xl font-bold text-foreground">Insy Care</span>
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-8 md:flex"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-base font-semibold text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/auth/login"
            className="hidden min-h-11 items-center rounded-xl px-4 text-base font-bold text-foreground transition-colors hover:text-primary sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="/auth/sign-up"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-base font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 sm:px-5"
          >
            <Phone className="size-5 shrink-0" aria-hidden="true" />
            Get started
          </Link>
        </div>
      </div>
    </header>
  )
}
