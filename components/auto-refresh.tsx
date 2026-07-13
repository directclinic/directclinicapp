'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Periodically re-fetches the current route's server data so newly booked
 * appointments (and doctor notes) show up without a manual reload. It also
 * refreshes when the tab regains focus, so switching back to the dashboard
 * always shows the latest state.
 */
export function AutoRefresh({ intervalMs = 15000 }: { intervalMs?: number }) {
  const router = useRouter()

  useEffect(() => {
    const id = setInterval(() => {
      // Only poll while the tab is visible to avoid needless work.
      if (document.visibilityState === 'visible') {
        router.refresh()
      }
    }, intervalMs)

    const onVisible = () => {
      if (document.visibilityState === 'visible') router.refresh()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [router, intervalMs])

  return null
}
