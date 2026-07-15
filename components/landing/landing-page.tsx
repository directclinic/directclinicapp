import { LandingHeader } from './landing-header'
import { LandingHero } from './landing-hero'
import { LandingValue } from './landing-value'
import { LandingQuote } from './landing-quote'
import { LandingCta } from './landing-cta'
import { LandingFooter } from './landing-footer'

export function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <LandingHeader />
      <main className="flex-1">
        <LandingHero />
        <LandingValue />
        <LandingQuote />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  )
}
