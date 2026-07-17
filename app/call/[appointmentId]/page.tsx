import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Stethoscope } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { CallRoom } from '@/components/call/call-room'
import {
  RecordingsPanel,
  type CallRecording,
} from '@/components/call/recordings-panel'

export const dynamic = 'force-dynamic'

export default async function CallPage({
  params,
}: {
  params: Promise<{ appointmentId: string }>
}) {
  const { appointmentId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // RLS restricts this row to the patient, clinic owner, or a member doctor —
  // so a returned row already means the user is authorized to be on the call.
  const { data: appt } = await supabase
    .from('appointments')
    .select(
      'id, patient_id, clinic_owner_id, clinic_id, patient_name, provider_name, clinic_name',
    )
    .eq('id', appointmentId)
    .maybeSingle()

  if (!appt) notFound()

  const isPatient = appt.patient_id === user.id
  const backHref = isPatient ? '/patient' : '/dashboard'

  // Label the other party appropriately for each side.
  const providerName = appt.provider_name || appt.clinic_name || 'Your clinic'
  const patientName = appt.patient_name || 'Patient'
  const selfLabel = isPatient ? patientName : providerName
  const peerLabel = isPatient ? providerName : patientName

  // Existing recordings for this appointment (newest first).
  const { data: recData } = await supabase
    .from('call_recordings')
    .select(
      'id, storage_path, duration_seconds, transcript, transcript_language, translated_text, translated_language, status, created_at',
    )
    .eq('appointment_id', appointmentId)
    .order('created_at', { ascending: false })

  const recordings = (recData ?? []) as CallRecording[]

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-border bg-card px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Stethoscope className="size-6" aria-hidden="true" />
          </span>
          <span className="text-xl font-bold text-foreground">Insy Care</span>
        </div>
        <Link
          href={backHref}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-border bg-card px-4 text-base font-bold text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
        >
          <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
          Back
        </Link>
      </header>

      <main className="flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto flex max-w-2xl flex-col gap-10">
          <section>
            <h1 className="mb-2 text-balance text-3xl font-extrabold leading-tight text-foreground">
              Call with {peerLabel}
            </h1>
            <p className="mb-6 text-pretty text-lg leading-relaxed text-muted-foreground">
              Talk directly in your browser. Both people need to open this page
              and join. The call is recorded, then transcribed and translated.
            </p>
            <CallRoom
              appointmentId={appointmentId}
              selfLabel={selfLabel}
              peerLabel={peerLabel}
              backHref={backHref}
            />
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-extrabold text-foreground">
              Past calls
            </h2>
            <RecordingsPanel recordings={recordings} />
          </section>
        </div>
      </main>
    </div>
  )
}
