'use server'

import webpush from 'web-push'
import { createClient } from '@/lib/supabase/server'
import { VAPID_PUBLIC_KEY, normalizeVapidSubject } from '@/lib/push/config'

// Configure web-push once per server instance. Guarded so a missing private
// key doesn't crash import — send calls will simply no-op with an error.
let configured = false
function ensureConfigured(): boolean {
  if (configured) return true
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject = normalizeVapidSubject(process.env.VAPID_SUBJECT)
  if (!privateKey) return false
  webpush.setVapidDetails(subject, VAPID_PUBLIC_KEY, privateKey)
  configured = true
  return true
}

type ActionResult = { ok: true } | { ok: false; error: string }

// Persist a browser's push subscription for the signed-in user. Upserts on the
// unique endpoint so re-subscribing on the same device updates in place.
export async function savePushSubscription(sub: {
  endpoint: string
  keys: { p256dh: string; auth: string }
  userAgent?: string
}): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { ok: false, error: 'Not signed in.' }

  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: user.id,
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
      user_agent: sub.userAgent ?? null,
    },
    { onConflict: 'endpoint' },
  )

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

// Remove a subscription (when the user disables notifications on a device).
export async function deletePushSubscription(
  endpoint: string,
): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { ok: false, error: 'Not signed in.' }

  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('endpoint', endpoint)
    .eq('user_id', user.id)

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

// Send a test notification to all of the current user's devices so they can
// confirm notifications work right after enabling them.
export async function sendTestNotification(): Promise<ActionResult> {
  if (!ensureConfigured()) {
    return { ok: false, error: 'Push is not configured on the server.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { ok: false, error: 'Not signed in.' }

  const { data: subs, error } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('user_id', user.id)

  if (error) return { ok: false, error: error.message }
  if (!subs || subs.length === 0) {
    return { ok: false, error: 'No devices enabled yet.' }
  }

  const payload = JSON.stringify({
    title: 'Insy Care',
    body: 'Notifications are on. We will remind you before your appointments.',
    url: '/patient',
    tag: 'insycare-test',
  })

  await Promise.allSettled(
    subs.map((s) =>
      webpush.sendNotification(
        {
          endpoint: s.endpoint,
          keys: { p256dh: s.p256dh, auth: s.auth },
        },
        payload,
      ),
    ),
  )

  return { ok: true }
}
