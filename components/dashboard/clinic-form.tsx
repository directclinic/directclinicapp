'use client'

import { useState, useTransition } from 'react'
import { Check, Building2, Plus } from 'lucide-react'
import { createClinic } from '@/app/actions/clinics'
import { INSURANCE_CARRIERS, CARE_OPTIONS, type CareId } from '@/lib/intake'
import { cn } from '@/lib/utils'

const BOROUGHS = [
  'Manhattan',
  'Brooklyn',
  'Queens',
  'Bronx',
  'Staten Island',
]

const CARE_LABELS: Record<CareId, string> = {
  pcp: 'Primary Care',
  dental: 'Dental',
  eye: 'Eye Care',
  physical: 'Physical Therapy',
  geriatric: 'Senior Care',
}

const inputClass =
  'min-h-14 w-full rounded-2xl border-2 border-border bg-card px-4 text-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40'

const labelClass = 'mb-1.5 block text-lg font-bold text-foreground'

export function ClinicForm({ onCreated }: { onCreated?: () => void }) {
  const [name, setName] = useState('')
  const [providerName, setProviderName] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [address, setAddress] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [borough, setBorough] = useState('')
  const [phone, setPhone] = useState('')
  const [languages, setLanguages] = useState('')
  const [copay, setCopay] = useState('')
  const [acceptingNew, setAcceptingNew] = useState(true)
  const [careTypes, setCareTypes] = useState<string[]>([])
  const [carriers, setCarriers] = useState<string[]>([])

  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function toggle(list: string[], set: (v: string[]) => void, id: string) {
    set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id])
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!name.trim() || !address.trim()) {
      setError('Please enter at least a clinic name and address.')
      return
    }
    startTransition(async () => {
      const result = await createClinic({
        name,
        providerName,
        specialty,
        careTypes,
        acceptedCarriers: carriers,
        neighborhood,
        borough,
        address,
        phone,
        languages: languages
          .split(',')
          .map((l) => l.trim())
          .filter(Boolean),
        copayUsd: copay ? Number.parseInt(copay, 10) : null,
        acceptingNew,
      })
      if (!result.ok) {
        setError(result.error)
        return
      }
      // Reset and notify parent.
      setName('')
      setProviderName('')
      setSpecialty('')
      setAddress('')
      setNeighborhood('')
      setBorough('')
      setPhone('')
      setLanguages('')
      setCopay('')
      setCareTypes([])
      setCarriers([])
      setAcceptingNew(true)
      onCreated?.()
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border-2 border-border bg-card p-6 shadow-sm sm:p-8"
    >
      <div className="mb-6 flex items-center gap-3">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Building2 className="size-6" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-2xl font-extrabold text-foreground">
            Add your clinic
          </h2>
          <p className="text-base text-muted-foreground">
            Patients will find this listing when searching near your address.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="clinic-name" className={labelClass}>
            Clinic name *
          </label>
          <input
            id="clinic-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Riverside Family Health"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="provider" className={labelClass}>
            Provider name
          </label>
          <input
            id="provider"
            value={providerName}
            onChange={(e) => setProviderName(e.target.value)}
            placeholder="Dr. Jane Doe, MD"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="specialty" className={labelClass}>
            Specialty
          </label>
          <input
            id="specialty"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            placeholder="Internal Medicine"
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="address" className={labelClass}>
            Street address *
          </label>
          <input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="215 W 125th St, New York, NY 10027"
            className={inputClass}
            required
          />
          <p className="mt-1 text-sm text-muted-foreground">
            We use this to place your clinic on the patient map.
          </p>
        </div>

        <div>
          <label htmlFor="neighborhood" className={labelClass}>
            Neighborhood
          </label>
          <input
            id="neighborhood"
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            placeholder="Harlem"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="borough" className={labelClass}>
            Borough
          </label>
          <select
            id="borough"
            value={borough}
            onChange={(e) => setBorough(e.target.value)}
            className={cn(inputClass, 'appearance-none')}
          >
            <option value="">Select a borough</option>
            {BOROUGHS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="phone" className={labelClass}>
            Phone
          </label>
          <input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(212) 555-0123"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="copay" className={labelClass}>
            Typical co-pay (USD)
          </label>
          <input
            id="copay"
            type="number"
            min="0"
            value={copay}
            onChange={(e) => setCopay(e.target.value)}
            placeholder="20"
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="languages" className={labelClass}>
            Languages spoken
          </label>
          <input
            id="languages"
            value={languages}
            onChange={(e) => setLanguages(e.target.value)}
            placeholder="English, Spanish, Mandarin"
            className={inputClass}
          />
          <p className="mt-1 text-sm text-muted-foreground">
            Separate with commas.
          </p>
        </div>
      </div>

      {/* Care types */}
      <fieldset className="mt-6">
        <legend className={labelClass}>Care types offered</legend>
        <div className="flex flex-wrap gap-2">
          {CARE_OPTIONS.map((opt) => {
            const active = careTypes.includes(opt.id)
            return (
              <button
                key={opt.id}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(careTypes, setCareTypes, opt.id)}
                className={cn(
                  'inline-flex min-h-12 items-center gap-2 rounded-full border-2 px-4 text-base font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40',
                  active
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-foreground hover:border-primary',
                )}
              >
                {active && <Check className="size-4" aria-hidden="true" />}
                {CARE_LABELS[opt.id]}
              </button>
            )
          })}
        </div>
      </fieldset>

      {/* Accepted insurance */}
      <fieldset className="mt-6">
        <legend className={labelClass}>Insurance accepted</legend>
        <div className="flex flex-wrap gap-2">
          {INSURANCE_CARRIERS.map((c) => {
            const active = carriers.includes(c.id)
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(carriers, setCarriers, c.id)}
                className={cn(
                  'inline-flex min-h-12 items-center gap-2 rounded-full border-2 px-4 text-base font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40',
                  active
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-foreground hover:border-primary',
                )}
              >
                {active && <Check className="size-4" aria-hidden="true" />}
                {c.name}
              </button>
            )
          })}
        </div>
      </fieldset>

      {/* Accepting new patients */}
      <label className="mt-6 flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={acceptingNew}
          onChange={(e) => setAcceptingNew(e.target.checked)}
          className="size-6 rounded-md border-2 border-border accent-[var(--primary)]"
        />
        <span className="text-lg font-semibold text-foreground">
          Currently accepting new patients
        </span>
      </label>

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-xl border-2 border-destructive/40 bg-destructive/10 px-4 py-2 text-center text-base font-semibold text-destructive"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-primary px-6 text-xl font-extrabold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
      >
        <Plus className="size-6 shrink-0" aria-hidden="true" />
        {pending ? 'Saving clinic…' : 'Save clinic'}
      </button>
    </form>
  )
}
