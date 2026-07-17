'use server'

import { experimental_transcribe as transcribe, generateText } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

const RECORDINGS_BUCKET = 'call-recordings'

// Human-readable names for the language codes stored on a patient's profile,
// used to instruct the translation model.
const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  zh: 'Chinese (Cantonese)',
  ru: 'Russian',
  bn: 'Bengali',
  it: 'Italian',
  tl: 'Tagalog',
}

type Result =
  | { ok: true; recordingId: string }
  | { ok: false; error: string }

// Called by the client after a call ends. The audio blob has already been
// uploaded to `<appointmentId>/<recordingId>.webm`. We create the DB row and
// then run transcription + translation in the background of this request.
export async function finalizeRecording(params: {
  appointmentId: string
  recordingId: string
  storagePath: string
  durationSeconds: number
}): Promise<Result> {
  const { appointmentId, recordingId, storagePath, durationSeconds } = params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { ok: false, error: 'Not signed in.' }

  // Insert the recording row (RLS ensures the user is a participant).
  const { error: insertError } = await supabase.from('call_recordings').insert({
    id: recordingId,
    appointment_id: appointmentId,
    started_by: user.id,
    storage_path: storagePath,
    duration_seconds: durationSeconds,
    status: 'processing',
  })
  if (insertError) return { ok: false, error: insertError.message }

  revalidatePath('/patient')
  revalidatePath('/dashboard')

  // Process transcription + translation. Errors here are recorded on the row
  // rather than thrown, so the call itself is never blocked.
  await processRecording(appointmentId, recordingId, storagePath)

  return { ok: true, recordingId }
}

async function processRecording(
  appointmentId: string,
  recordingId: string,
  storagePath: string,
) {
  const admin = createAdminClient()
  try {
    // Download the audio from private storage.
    const { data: file, error: dlError } = await admin.storage
      .from(RECORDINGS_BUCKET)
      .download(storagePath)
    if (dlError || !file) {
      throw new Error(dlError?.message ?? 'Could not download recording.')
    }
    const audio = new Uint8Array(await file.arrayBuffer())

    // Transcribe in the spoken language via the AI Gateway.
    const { text: transcript, language } = await transcribe({
      model: 'openai/whisper-1',
      audio,
    })

    // Figure out the patient's preferred language for the translation.
    const { data: appt } = await admin
      .from('appointments')
      .select('patient_id')
      .eq('id', appointmentId)
      .maybeSingle()

    let targetCode = 'en'
    if (appt?.patient_id) {
      const { data: prof } = await admin
        .from('profiles')
        .select('preferred_language')
        .eq('id', appt.patient_id)
        .maybeSingle()
      if (prof?.preferred_language) targetCode = prof.preferred_language
    }
    const targetName = LANGUAGE_NAMES[targetCode] ?? 'English'

    let translated = ''
    if (transcript.trim()) {
      const { text } = await generateText({
        model: 'openai/gpt-4o-mini',
        prompt: `You are a medical interpreter. Translate the following consultation transcript into ${targetName}. Preserve medical meaning precisely and keep a clear, plain tone. Only output the translation.\n\nTranscript:\n${transcript}`,
      })
      translated = text.trim()
    }

    await admin
      .from('call_recordings')
      .update({
        transcript,
        transcript_language: language ?? null,
        translated_text: translated || null,
        translated_language: targetCode,
        status: 'ready',
      })
      .eq('id', recordingId)
  } catch (err) {
    await admin
      .from('call_recordings')
      .update({ status: 'failed' })
      .eq('id', recordingId)
    console.log('[v0] processRecording failed:', (err as Error).message)
  }

  revalidatePath('/patient')
  revalidatePath('/dashboard')
}

// Create a short-lived signed URL so a participant can play back the audio.
export async function getRecordingUrl(
  storagePath: string,
): Promise<{ url: string } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in.' }

  // The storage RLS policy already restricts access to participants; using the
  // user-scoped client here means a non-participant cannot mint a URL.
  const { data, error } = await supabase.storage
    .from(RECORDINGS_BUCKET)
    .createSignedUrl(storagePath, 60 * 60)

  if (error || !data) return { error: error?.message ?? 'Could not load audio.' }
  return { url: data.signedUrl }
}
