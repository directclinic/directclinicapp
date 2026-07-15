'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Stethoscope, Save } from 'lucide-react'
import { saveDoctorProfile, type DoctorProfile } from '@/app/actions/doctor-profile'
import { cn } from '@/lib/utils'

const COMMON_LANGUAGES = [
  'English',
  'Spanish',
  'Mandarin',
  'Cantonese',
  'Bengali',
  'Haitian Creole',
  'Russian',
  'Korean',
  'Arabic',
  'French',
]

const inputClass =
  'min-h-14 w-full rounded-2xl border-2 border-border bg-card px-4 text-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40'

const labelClass = 'mb-1.5 block text-lg font-bold text-foreground'

export function DoctorProfileForm({
  profile,
  fallbackName,
}: {
  profile: DoctorProfile | null
  fallbackName: string
}) {
  const router = useRouter()

  const [fullName, setFullName] = useState(profile?.full_name ?? fallbackName)
  const [credential, setCredential] = useState(profile?.credential ?? '')
  const [specialty, setSpecialty] = useState(profile?.specialty ?? '')
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [languages, setLanguages] = useState<string[]>(profile?.languages ?? [])
  const [yearsExperience, setYearsExperience] = useState(
    profile?.years_experience != null ? String(profile.years_experience) : '',
  )
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [acceptingNew, setAcceptingNew] = useState(profile?.accepting_new ?? true)

  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [pending, startTransition] = useTransition()

  function toggleLanguage(lang: string) {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang],
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaved(false)
    if (!fullName.trim()) {
      setError('Please enter your name.')
      return
    }
    startTransition(async () => {
      const result = await saveDoctorProfile({
        fullName,
        credential,
        specialty,
        bio,
        languages,
        yearsExperience,
        phone,
        acceptingNew,
      })
      if (!result.ok) {
        setError(result.error)
        return
      }
      setSaved(true)
      router.refresh()
      setTimeout(() => setSaved(false), 2500)
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border-2 border-border bg-card p-6 shadow-sm sm:p-8"
    >
      <div className="mb-6 flex items-center gap-3">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Stethoscope className="size-6" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-2xl font-extrabold text-foreground">
            Your public profile
          </h2>
          <p className="text-base text-muted-foreground">
            Patients see this when they tap your name while browsing a clinic.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="doc-name" className={labelClass}>
            Full name *
          </label>
          <input
            id="doc-name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Dr. Jane Doe"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="doc-credential" className={labelClass}>
            Credentials
          </label>
          <input
            id="doc-credential"
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
            placeholder="MD, DO, NP…"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="doc-specialty" className={labelClass}>
            Specialty
          </label>
          <input
            id="doc-specialty"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            placeholder="Internal Medicine"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="doc-years" className={labelClass}>
            Years of experience
          </label>
          <input
            id="doc-years"
            type="number"
            min="0"
            value={yearsExperience}
            onChange={(e) => setYearsExperience(e.target.value)}
            placeholder="10"
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="doc-phone" className={labelClass}>
            Contact phone
          </label>
          <input
            id="doc-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(212) 555-0123"
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="doc-bio" className={labelClass}>
            About you
          </label>
          <textarea
            id="doc-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="Share your background, approach to care, and what patients can expect…"
            className="w-full rounded-2xl border-2 border-border bg-card p-4 text-lg leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
          />
        </div>
      </div>

      {/* Languages */}
      <fieldset className="mt-6">
        <legend className={labelClass}>Languages you speak</legend>
        <div className="flex flex-wrap gap-2">
          {COMMON_LANGUAGES.map((lang) => {
            const active = languages.includes(lang)
            return (
              <button
                key={lang}
                type="button"
                aria-pressed={active}
                onClick={() => toggleLanguage(lang)}
                className={cn(
                  'inline-flex min-h-12 items-center gap-2 rounded-full border-2 px-4 text-base font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40',
                  active
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-foreground hover:border-primary',
                )}
              >
                {active && <Check className="size-4" aria-hidden="true" />}
                {lang}
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

      <div className="mt-6 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-primary px-6 text-xl font-extrabold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
        >
          <Save className="size-6 shrink-0" aria-hidden="true" />
          {pending ? 'Saving…' : 'Save profile'}
        </button>
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-lg font-semibold text-success">
            <Check className="size-5 shrink-0" aria-hidden="true" />
            Saved
          </span>
        )}
      </div>
    </form>
  )
}
