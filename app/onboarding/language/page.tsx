import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LANGUAGES, type LanguageCode } from '@/lib/i18n'
import { LanguagePicker } from '@/components/onboarding/language-picker'

export const dynamic = 'force-dynamic'

function toLanguageCode(v: string | null | undefined): LanguageCode {
  return LANGUAGES.some((l) => l.code === v) ? (v as LanguageCode) : 'en'
}

export default async function OnboardingLanguagePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, preferred_language')
    .eq('id', user.id)
    .maybeSingle()

  // Only patients pick a language here. Others go to their workspace.
  if (!profile?.role) redirect('/onboarding')
  if (profile.role !== 'patient') redirect('/dashboard')

  return (
    <LanguagePicker
      initialLanguage={toLanguageCode(profile.preferred_language)}
    />
  )
}
