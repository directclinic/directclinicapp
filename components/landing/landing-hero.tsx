import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Globe, ShieldCheck } from 'lucide-react'

export function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:py-16">
        {/* Left: headline + sub-headline + CTAs */}
        <div className="relative z-10 rounded-3xl bg-secondary p-6 sm:p-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-1.5 text-sm font-bold text-primary">
            <Globe className="size-4 shrink-0" aria-hidden="true" />
            For adult immigrants in NYC
          </span>

          <h1 className="mt-5 text-balance text-3xl font-extrabold leading-tight text-foreground sm:text-4xl lg:text-5xl">
            Ditch the hidden bills and take control.
          </h1>

          <p className="mt-4 text-pretty text-lg leading-relaxed text-secondary-foreground sm:text-xl">
            InsyCare gives adult immigrants in NYC a direct way to find local
            clinics matching their native language and insurance.
          </p>

          <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Healthcare that finally fits your life. InsyCare puts you in direct
            contact with nearby medical centers that match your exact plan and
            language.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/auth/sign-up"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-lg font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
            >
              Find a clinic for you
              <ArrowRight className="size-5 shrink-0" aria-hidden="true" />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex min-h-14 items-center justify-center rounded-xl border-2 border-border bg-card px-6 text-lg font-bold text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
            >
              I already have an account
            </Link>
          </div>

          <p className="mt-5 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <ShieldCheck className="size-5 shrink-0 text-primary" aria-hidden="true" />
            No hidden fees. Your search stays private.
          </p>
        </div>

        {/* Right: hero image with overlay badge */}
        <div className="relative">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border-2 border-border shadow-xl">
            <Image
              src="/landing/hero-clinic.png"
              alt="A friendly doctor welcoming a diverse group of adult immigrants in a bright New York City clinic"
              fill
              priority
              sizes="(min-width: 1024px) 40rem, 100vw"
              className="object-cover"
            />
            <div className="absolute right-4 top-4 rounded-2xl bg-primary px-5 py-3 text-primary-foreground shadow-lg">
              <p className="text-lg font-extrabold leading-tight">
                In-network. In your language.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
