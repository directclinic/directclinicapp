import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

export function LandingCta() {
  return (
    <section className="bg-background py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid overflow-hidden rounded-3xl border-2 border-border shadow-xl lg:grid-cols-2">
          {/* Left: message + CTA */}
          <div className="flex flex-col justify-center bg-primary p-8 text-primary-foreground sm:p-12">
            <h2 className="text-balance text-3xl font-extrabold leading-tight sm:text-4xl">
              Take control of your care today.
            </h2>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-primary-foreground/90">
              Search NYC clinics that match your insurance and your language in
              minutes. No hidden bills. No middlemen. Just care that fits your
              life.
            </p>
            <div className="mt-8">
              <Link
                href="/auth/sign-up"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-card px-7 text-lg font-bold text-primary transition-colors hover:bg-card/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-foreground/50"
              >
                Find a clinic for you
                <ArrowRight className="size-5 shrink-0" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Right: reassuring image */}
          <div className="relative min-h-64 lg:min-h-full">
            <Image
              src="/landing/cta-patient.png"
              alt="An immigrant woman smiling with relief while using InsyCare on her phone at home"
              fill
              sizes="(min-width: 1024px) 36rem, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
