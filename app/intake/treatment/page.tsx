import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LANGUAGES, type LanguageCode } from '@/lib/i18n'
import { TreatmentStep } from '@/components/intake/treatment-step'

export const dynamic = 'force-dynamic'

function toLanguageCode(v: string | null | undefined): LanguageCode {
  return LANGUAGES.some((l) => l.code === v) ? (v as LanguageCode) : 'en'
}

export default async function IntakeTreatmentPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('insurance_carrier, insurance_plan, preferred_language')
    .eq('id', user.id)
    .maybeSingle()

  // Must choose insurance before picking a treatment.
  if (!profile?.insurance_carrier || !profile?.insurance_plan) {
    redirect('/intake')
  }

  return (
    <TreatmentStep
      initialLanguage={toLanguageCode(profile.preferred_language)}
      carrierName={profile.insurance_carrier}
      plan={profile.insurance_plan}
    />
  )
}
