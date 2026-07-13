import { Stethoscope } from 'lucide-react'
import type { ReactNode } from 'react'

// Centered, senior-friendly branded container shared by login and sign-up.
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex items-center gap-2 border-b-2 border-border bg-card px-4 py-4 sm:px-6">
        <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Stethoscope className="size-6" aria-hidden="true" />
        </span>
        <span className="text-xl font-bold text-foreground">Direct Clinic</span>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <h1 className="text-balance text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">
              {title}
            </h1>
            <p className="mx-auto mt-2 max-w-sm text-pretty text-lg leading-relaxed text-muted-foreground">
              {subtitle}
            </p>
          </div>

          <div className="rounded-3xl border-2 border-border bg-card p-6 shadow-sm sm:p-8">
            {children}
          </div>

          {footer && (
            <div className="mt-6 text-center text-lg text-muted-foreground">
              {footer}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
