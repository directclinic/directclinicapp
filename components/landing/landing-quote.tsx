import { Quote } from 'lucide-react'

export function LandingQuote() {
  return (
    <section id="voices" className="bg-secondary py-14 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Quote className="size-7" aria-hidden="true" />
        </span>
        <blockquote className="mt-6 text-balance text-2xl font-bold leading-snug text-foreground sm:text-3xl">
          &ldquo;If I can&apos;t navigate the [insurance] process, I can&apos;t
          imagine how it would be for those with a language barrier.&rdquo;
        </blockquote>
        <figcaption className="mt-6 text-lg font-semibold text-muted-foreground">
          <span className="font-bold text-foreground">Elyse Dreyer</span>
          {' — '}an insured citizen in NYC
        </figcaption>
      </div>
    </section>
  )
}
