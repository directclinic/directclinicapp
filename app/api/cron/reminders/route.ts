import { NextResponse } from 'next/server'
import webpush from 'web-push'
import { createAdminClient } from '@/lib/supabase/admin'
import { VAPID_PUBLIC_KEY, normalizeVapidSubject } from '@/lib/push/config'
import { reminderCopy } from '@/lib/push/messages'

// Daily cron: push a reminder to patients whose appointment is tomorrow, asking
// them to confirm they are still coming. Protected by CRON_SECRET so only
// Vercel Cron (or an authorized caller) can trigger it.
export const dynamic = 'force-dynamic'

function tomorrowISO(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  const auth = request.headers.get('authorization')
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const privateKey = process.env.VAPID_PRIVATE_KEY
  if (!privateKey) {
    return NextResponse.json(
      { error: 'Push not configured' },
      { status: 500 },
    )
  }
  webpush.setVapidDetails(
    normalizeVapidSubject(process.env.VAPID_SUBJECT),
    VAPID_PUBLIC_KEY,
    privateKey,
  )

  const supabase = createAdminClient()
  const target = tomorrowISO()

  // Appointments happening tomorrow that still need confirmation and haven't
  // already had a reminder sent.
  const { data: appts, error } = await supabase
    .from('appointments')
    .select('id, patient_id, clinic_name')
    .eq('appointment_date', target)
    .eq('status', 'booked')
    .neq('confirmation_status', 'declined')
    .is('reminder_sent_at', null)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  if (!appts || appts.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, appointments: 0 })
  }

  let sent = 0

  for (const appt of appts) {
    if (!appt.patient_id) continue

    // Patient language for localized copy.
    const { data: profile } = await supabase
      .from('profiles')
      .select('preferred_language')
      .eq('id', appt.patient_id)
      .maybeSingle()

    const copy = reminderCopy(profile?.preferred_language)
    const payload = JSON.stringify({
      title: copy.title(appt.clinic_name || 'your clinic'),
      body: copy.body,
      url: '/patient',
      tag: `reminder-${appt.id}`,
    })

    // All of this patient's devices.
    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('user_id', appt.patient_id)

    if (subs && subs.length > 0) {
      const results = await Promise.allSettled(
        subs.map((s) =>
          webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            payload,
          ),
        ),
      )

      // Clean up subscriptions the push service reports as gone (404/410).
      for (let i = 0; i < results.length; i++) {
        const r = results[i]
        if (r.status === 'fulfilled') {
          sent++
        } else {
          const statusCode = (r.reason as { statusCode?: number })?.statusCode
          if (statusCode === 404 || statusCode === 410) {
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('endpoint', subs[i].endpoint)
          }
        }
      }
    }

    // Mark reminded regardless of device count so we don't re-scan it daily.
    await supabase
      .from('appointments')
      .update({ reminder_sent_at: new Date().toISOString() })
      .eq('id', appt.id)
  }

  return NextResponse.json({ ok: true, sent, appointments: appts.length })
}
