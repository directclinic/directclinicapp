'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, CalendarClock, LayoutGrid, PlusCircle } from 'lucide-react'
import { ClinicForm } from '@/components/dashboard/clinic-form'
import { ClinicList, type ClinicRow } from '@/components/dashboard/clinic-list'
import {
  AppointmentsList,
  type AppointmentRow,
} from '@/components/dashboard/appointments-list'
import { cn } from '@/lib/utils'

type Tab = 'overview' | 'add'

export function DashboardTabs({
  clinics,
  appointments,
}: {
  clinics: ClinicRow[]
  appointments: AppointmentRow[]
}) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('overview')

  const totalBookings = appointments.length
  const upcoming = appointments.filter(
    (a) => new Date(a.appointment_date + 'T00:00:00') >= startOfToday(),
  ).length

  const stats = [
    { label: 'Clinics', value: clinics.length, icon: Building2 },
    { label: 'Total bookings', value: totalBookings, icon: CalendarClock },
    { label: 'Upcoming', value: upcoming, icon: LayoutGrid },
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
        <button
          role="tab"
          aria-selected={tab === 'overview'}
          onClick={() => setTab('overview')}
          className={cn(
            'flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl text-lg font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40',
            tab === 'overview'
              ? 'bg-primary text-primary-foreground'
              : 'text-foreground hover:bg-accent',
          )}
        >
          <LayoutGrid className="size-5 shrink-0" aria-hidden="true" />
          Overview
        </button>
        <button
          role="tab"
          aria-selected={tab === 'add'}
          onClick={() => setTab('add')}
          className={cn(
            'flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl text-lg font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40',
            tab === 'add'
              ? 'bg-primary text-primary-foreground'
              : 'text-foreground hover:bg-accent',
          )}
        >
          <PlusCircle className="size-5 shrink-0" aria-hidden="true" />
          Add clinic
        </button>
      </div>

      {tab === 'overview' ? (
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
      ) : (
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

function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}
