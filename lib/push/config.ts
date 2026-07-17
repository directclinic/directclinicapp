// Public VAPID key — safe to ship to the browser. The matching private key is
// stored server-side in the VAPID_PRIVATE_KEY env var and never exposed.
export const VAPID_PUBLIC_KEY =
  'BBceXi9Nj0sJyGjipRa00SVEr4S9T8QWlRaZYYVsIHQNOIeHOVnWmNJcOzaaOC9uiHxOabZSytS1GY-XCs6C00s'

// web-push requires the VAPID subject to be a `mailto:` or http(s) URL.
// Normalize whatever the operator put in VAPID_SUBJECT so a bare email or
// domain still produces a valid value instead of throwing at send time.
export function normalizeVapidSubject(raw?: string | null): string {
  const value = (raw ?? '').trim()
  if (!value) return 'mailto:care@insycare.com'
  if (
    value.startsWith('mailto:') ||
    value.startsWith('http://') ||
    value.startsWith('https://')
  ) {
    return value
  }
  if (value.includes('@')) return `mailto:${value}`
  return `https://${value}`
}

// Convert a base64url VAPID key into the Uint8Array the Push API expects.
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const output = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) {
    output[i] = raw.charCodeAt(i)
  }
  return output
}
