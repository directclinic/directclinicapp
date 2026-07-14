import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LANGUAGES, type LanguageCode } from '@/lib/i18n'
import { InsuranceStep } from '@/components/intake/insurance-step'

export const dynamic = 'force-dynamic'

function toLanguageCode(v: string | null | undefined): LanguageCode {
  return LANGUAGES.some((l) => l.code === v) ? (v as LanguageCode) : 'en'
}

export default async function IntakeInsurancePage({
  searchParams,
}: {
  searchParams: Promise<{ change?: string }>
}) {
  const { change } = await searchParams
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

  const hasInsurance = Boolean(
    profile?.insurance_carrier && profile?.insurance_plan,
  )

  // Returning patients with saved insurance skip straight to the treatment
  // step — unless they explicitly asked to change insurance (?change=1).
  if (hasInsurance && !change) {
    redirect('/intake/treatment')
  }

  return (
    <InsuranceStep
      initialLanguage={toLanguageCode(profile?.preferred_language)}
      initialCarrierName={change ? profile?.insurance_carrier : null}
      initialPlan={change ? profile?.insurance_plan : null}
    />
  )
}
