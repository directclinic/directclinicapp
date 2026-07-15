import { Languages, BadgeCheck, PhoneCall } from 'lucide-react'

const FEATURES = [
  {
    icon: Languages,
    title: 'Matches your language',
    body: 'Find clinics with staff who speak your native language, so nothing gets lost in translation.',
  },
  {
    icon: BadgeCheck,
    title: 'Matches your insurance',
    body: 'See only in-network clinics that accept your exact plan, with clear prices and no surprise bills.',
  },
  {
    icon: PhoneCall,
    title: 'Direct contact, no middlemen',
    body: 'Connect straight to nearby medical centers. Fast, accurate, and on your terms.',
  },
]

export function LandingValue() {
  return (
    <section id="why-insycare" className="bg-background py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Value proposition band */}
        <div className="rounded-3xl bg-primary p-6 text-primary-foreground sm:p-10">
          <p className="text-sm font-bold uppercase tracking-wide text-primary-foreground/80">
            Why InsyCare
          </p>
          <p className="mt-4 text-balance text-2xl font-bold leading-snug sm:text-3xl">
            Adult immigrants in NYC choose InsyCare because it&apos;s the only
            way to have fast, accurate, and direct contact to NYC clinics that
            match their insurance and language&nbsp;&mdash; without trading off
            their money, autonomy, and their trust.
          </p>
        </div>

        {/* Feature cards */}
        <div
          id="how-it-works"
          className="mt-10 grid gap-6 md:grid-cols-3"
        >
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border-2 border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8"
            >
              <span className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
                <feature.icon className="size-7" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-xl font-bold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-pretty text-base leading-relaxed text-muted-foreground">
                {feature.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
