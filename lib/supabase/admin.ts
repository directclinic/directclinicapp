import { createClient } from '@supabase/supabase-js'

// Service-role client for privileged, server-only operations (e.g. creating
// pre-confirmed users). NEVER import this from client components — the service
// role key must never reach the browser.
export function createAdminClient() {
  const url =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
