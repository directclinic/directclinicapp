'use client'

import { useState, useTransition } from 'react'
import {
  HeartPulse,
  Stethoscope,
  Building2,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react'
import { setRole, type Role } from '@/app/actions/account'
import { cn } from '@/lib/utils'

const ROLES: {
  id: Role
  title: string
  description: string
  icon: LucideIcon
}[] = [
  {
    id: 'patient',
    title: "I'm a patient",
    description: 'Find in-network doctors near you and book appointments.',
    icon: HeartPulse,
  },
  {
    id: 'doctor',
    title: "I'm a doctor",
    description: 'List your practice and manage patient appointments.',
    icon: Stethoscope,
  },
  {
    id: 'clinic',
    title: "I'm a clinic",
    description: 'Register your clinic and track who books with you.',
    icon: Building2,
  },
]

export function RolePicker() {
  const [selected, setSelected] = useState<Role | null>(null)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleContinue() {
    if (!selected) return
    setError(null)
    startTransition(async () => {
      try {
        await setRole(selected)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong.')
      }
    })
  }

  return (
    <div className="w-full">
      <div
        role="radiogroup"
        aria-label="Choose your account type"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        {ROLES.map((role) => {
          const Icon = role.icon
          const active = selected === role.id
          return (
            <button
              key={role.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setSelected(role.id)}
              className={cn(
                'flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-3xl border-2 p-6 text-center transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40',
                active
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-foreground hover:border-primary',
              )}
            >
              <span
                className={cn(
                  'flex size-16 items-center justify-center rounded-2xl',
                  active ? 'bg-primary-foreground/20' : 'bg-accent',
                )}
                aria-hidden="true"
              >
                <Icon
                  className={cn(
                    'size-9',
                    active ? 'text-primary-foreground' : 'text-primary',
                  )}
                />
              </span>
              <span className="text-xl font-extrabold leading-tight">
                {role.title}
              </span>
              <span
                className={cn(
                  'text-pretty text-base leading-relaxed',
                  active
                    ? 'text-primary-foreground/90'
                    : 'text-muted-foreground',
                )}
              >
                {role.description}
              </span>
            </button>
          )
        })}
      </div>

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-xl border-2 border-destructive/40 bg-destructive/10 px-4 py-2 text-center text-base font-semibold text-destructive"
        >
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleContinue}
        disabled={!selected || pending}
        className={cn(
          'mt-8 flex min-h-[64px] w-full items-center justify-center gap-3 rounded-2xl px-6 text-xl font-extrabold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40',
          selected && !pending
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'cursor-not-allowed bg-primary/40 text-primary-foreground',
        )}
      >
        {pending ? 'Setting up…' : 'Continue'}
        <ArrowRight className="size-6 shrink-0" aria-hidden="true" />
      </button>
    </div>
  )
}
