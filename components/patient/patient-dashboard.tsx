'use client'

import Link from 'next/link'
import {
  CalendarCheck,
  FileText,
  History,
  Search,
  Stethoscope,
} from 'lucide-react'
import { AutoRefresh } from '@/components/auto-refresh'
import { LanguageSwitcher } from '@/components/language-switcher'
import { InsuranceCard } from '@/components/patient/insurance-card'
import {
  PatientAppointments,
  type PatientAppointment,
} from '@/components/patient/patient-appointments'
import { DASHBOARD_TRANSLATIONS } from '@/lib/dashboard-i18n'
import { type LanguageCode } from '@/lib/i18n'
import { useAccessibility } from '@/lib/use-accessibility'

/**
 * Client shell for the patient dashboard. Owns a single useAccessibility
 * instance so the language switcher and all translated text share one source
 * of truth — changing the language re-renders the whole dashboard instantly.
 */
export function PatientDashboard({
  displayName,
  initialLanguage,
  insuranceCarrier,
  insurancePlan,
  appointments,
}: {
  displayName: string
  initialLanguage: LanguageCode
  insuranceCarrier: string | null
  insurancePlan: string | null
  appointments: PatientAppointment[]
}) {
  const { language, setLanguage } = useAccessibility(initialLanguage)
  const t = DASHBOARD_TRANSLATIONS[language]

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const upcomingCount = appointments.filter(
    (a) => new Date(a.appointment_date + 'T00:00:00') >= today,
  ).length
  const pastCount = appointments.length - upcomingCount
  const notesCount = appointments.filter((a) => a.doctor_note).length

  const stats = [
    { label: t.statUpcoming, value: upcomingCount, icon: CalendarCheck },
    { label: t.statPastVisits, value: pastCount, icon: History },
    { label: t.statDoctorNotes, value: notesCount, icon: FileText },
  ]

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <AutoRefresh />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-border bg-card px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Stethoscope className="size-6" aria-hidden="true" />
          </span>
          <span className="text-xl font-bold text-foreground">
            Direct Clinic
          </span>
          <span className="ml-2 rounded-full bg-accent px-3 py-1 text-sm font-bold text-accent-foreground">
            {t.patientBadge}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher language={language} setLanguage={setLanguage} />
          <Link
            href="/intake"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-base font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
          >
            <Search className="size-4 shrink-0" aria-hidden="true" />
            {t.findBookCare}
          </Link>
        </div>
      </header>

      <main className="flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <h1 className="text-balance text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">
              {t.welcomeBack}, {displayName}
            </h1>
            <p className="mt-2 text-pretty text-lg leading-relaxed text-muted-foreground">
              {t.subtitle}
            </p>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map((s) => {
              const Icon = s.icon
              return (
                <div
                  key={s.label}
                  className="flex items-center gap-4 rounded-3xl border-2 border-border bg-card p-5 shadow-sm"
                >
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="size-7" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-3xl font-extrabold text-foreground">
                      {s.value}
                    </p>
                    <p className="text-base text-muted-foreground">{s.label}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <InsuranceCard
            carrier={insuranceCarrier}
            plan={insurancePlan}
            t={t}
          />

          <PatientAppointments appointments={appointments} t={t} />
        </div>
      </main>
    </div>
  )
}
