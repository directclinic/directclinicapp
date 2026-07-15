'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Building2,
  CalendarClock,
  LayoutGrid,
  PlusCircle,
  Users,
  Stethoscope,
} from 'lucide-react'
import { ClinicForm } from '@/components/dashboard/clinic-form'
import { ClinicList, type ClinicRow } from '@/components/dashboard/clinic-list'
import {
  AppointmentsList,
  type AppointmentRow,
} from '@/components/dashboard/appointments-list'
import {
  DoctorsRoster,
  type RosterClinic,
} from '@/components/dashboard/doctors-roster'
import { cn } from '@/lib/utils'

type Tab = 'overview' | 'doctors' | 'add'

export function ClinicDashboard({
  clinics,
  appointments,
  roster,
}: {
  clinics: ClinicRow[]
  appointments: AppointmentRow[]
  roster: RosterClinic[]
}) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('overview')

  const totalBookings = appointments.length
  const totalDoctors = roster.reduce((sum, c) => sum + c.doctors.length, 0)

  const stats = [
    { label: 'Total appointments', value: totalBookings, icon: CalendarClock },
    { label: 'Clinics', value: clinics.length, icon: Building2 },
    { label: 'Doctors', value: totalDoctors, icon: Users },
  ]

  const tabs: { id: Tab; label: string; icon: typeof LayoutGrid }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'doctors', label: 'Doctors', icon: Stethoscope },
    { id: 'add', label: 'Add clinic', icon: PlusCircle },
  ]

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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

      {/* Tab switcher */}
      <div
        role="tablist"
        aria-label="Dashboard sections"
        className="mt-8 flex gap-2 rounded-2xl border-2 border-border bg-card p-1.5"
      >
        {tabs.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl text-base font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 sm:text-lg',
                tab === t.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-accent',
              )}
            >
              <Icon className="size-5 shrink-0" aria-hidden="true" />
              {t.label}
            </button>
          )
        })}
      </div>

      {tab === 'overview' && (
        <div className="mt-8 space-y-10">
          <section>
            <h2 className="mb-4 text-2xl font-extrabold text-foreground">
              Your clinics
            </h2>
            <ClinicList clinics={clinics} />
          </section>
          <section>
            <h2 className="mb-4 text-2xl font-extrabold text-foreground">
              Appointments booked with you
            </h2>
            <AppointmentsList appointments={appointments} />
          </section>
        </div>
      )}

      {tab === 'doctors' && (
        <div className="mt-8">
          <section>
            <h2 className="mb-4 text-2xl font-extrabold text-foreground">
              Doctors in your clinics
            </h2>
            <DoctorsRoster clinics={roster} />
          </section>
        </div>
      )}

      {tab === 'add' && (
        <div className="mt-8">
          <ClinicForm
            onCreated={() => {
              setTab('overview')
              router.refresh()
            }}
          />
        </div>
      )}
    </div>
  )
}
