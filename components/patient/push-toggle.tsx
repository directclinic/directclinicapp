'use client'

import { useEffect, useState } from 'react'
import { Bell, BellRing, BellOff, Loader2, Check } from 'lucide-react'
import type { DashboardStrings } from '@/lib/dashboard-i18n'
import { VAPID_PUBLIC_KEY, urlBase64ToUint8Array } from '@/lib/push/config'
import {
  savePushSubscription,
  deletePushSubscription,
  sendTestNotification,
} from '@/app/actions/push'

type State =
  | 'loading'
  | 'unsupported'
  | 'ios-install'
  | 'ready' // supported, not yet subscribed
  | 'blocked'
  | 'subscribed'

// Detect iOS Safari that is NOT running as an installed PWA. Apple only allows
// web push when the site is launched from the Home Screen.
function isIosNeedingInstall(): boolean {
  if (typeof window === 'undefined') return false
  const ua = window.navigator.userAgent
  const isIos = /iPad|iPhone|iPod/.test(ua)
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    // @ts-expect-error legacy iOS Safari flag
    window.navigator.standalone === true
  return isIos && !isStandalone
}

export function PushToggle({ t }: { t: DashboardStrings }) {
  const [state, setState] = useState<State>('loading')
  const [busy, setBusy] = useState(false)
  const [tested, setTested] = useState(false)

  // Figure out the current capability + subscription state on mount.
  useEffect(() => {
    let active = true
    async function init() {
      if (
        !('serviceWorker' in navigator) ||
        !('PushManager' in window) ||
        !('Notification' in window)
      ) {
        if (isIosNeedingInstall()) {
          if (active) setState('ios-install')
        } else if (active) {
          setState('unsupported')
        }
        return
      }

      if (Notification.permission === 'denied') {
        if (active) setState('blocked')
        return
      }

      try {
        const reg = await navigator.serviceWorker.register('/sw.js')
        const existing = await reg.pushManager.getSubscription()
        if (active) setState(existing ? 'subscribed' : 'ready')
      } catch {
        if (active) setState('unsupported')
      }
    }
    init()
    return () => {
      active = false
    }
  }, [])

  async function enable() {
    setBusy(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setState('blocked')
        return
      }

      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })

      const json = sub.toJSON()
      const res = await savePushSubscription({
        endpoint: sub.endpoint,
        keys: {
          p256dh: json.keys?.p256dh ?? '',
          auth: json.keys?.auth ?? '',
        },
        userAgent: navigator.userAgent,
      })

      if (!res.ok) {
        setState('ready')
        return
      }
      setState('subscribed')
    } catch {
      setState('ready')
    } finally {
      setBusy(false)
    }
  }

  async function disable() {
    setBusy(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await deletePushSubscription(sub.endpoint)
        await sub.unsubscribe()
      }
      setState('ready')
      setTested(false)
    } finally {
      setBusy(false)
    }
  }

  async function test() {
    setBusy(true)
    try {
      await sendTestNotification()
      setTested(true)
    } finally {
      setBusy(false)
    }
  }

  if (state === 'loading') return null

  return (
    <section className="mb-8 rounded-3xl border-2 border-border bg-card p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {state === 'subscribed' ? (
            <BellRing className="size-6" aria-hidden="true" />
          ) : state === 'blocked' ? (
            <BellOff className="size-6" aria-hidden="true" />
          ) : (
            <Bell className="size-6" aria-hidden="true" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-extrabold text-foreground">
            {t.notifTitle}
          </h2>
          <p className="mt-1 text-pretty text-base leading-relaxed text-muted-foreground">
            {t.notifDesc}
          </p>

          {state === 'unsupported' && (
            <p className="mt-3 text-base font-semibold text-muted-foreground">
              {t.notifUnsupported}
            </p>
          )}

          {state === 'ios-install' && (
            <p className="mt-3 rounded-2xl border-2 border-border bg-muted/40 p-3 text-base leading-relaxed text-foreground">
              {t.notifIosHint}
            </p>
          )}

          {state === 'blocked' && (
            <p className="mt-3 text-base font-semibold text-destructive">
              {t.notifBlocked}
            </p>
          )}

          {state === 'ready' && (
            <button
              type="button"
              onClick={enable}
              disabled={busy}
              className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-base font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
            >
              {busy ? (
                <Loader2 className="size-5 shrink-0 animate-spin" aria-hidden="true" />
              ) : (
                <Bell className="size-5 shrink-0" aria-hidden="true" />
              )}
              {busy ? t.notifEnabling : t.notifEnable}
            </button>
          )}

          {state === 'subscribed' && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-xl border-2 border-primary/25 bg-primary/5 px-4 py-2 text-base font-bold text-primary">
                <Check className="size-5 shrink-0" aria-hidden="true" />
                {t.notifOn}
              </span>
              <button
                type="button"
                onClick={test}
                disabled={busy || tested}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-border bg-card px-4 text-base font-bold text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
              >
                {tested ? (
                  <Check className="size-5 shrink-0" aria-hidden="true" />
                ) : (
                  <BellRing className="size-5 shrink-0" aria-hidden="true" />
                )}
                {t.notifTest}
              </button>
              <button
                type="button"
                onClick={disable}
                disabled={busy}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-base font-semibold text-muted-foreground transition-colors hover:text-destructive disabled:opacity-60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
              >
                <BellOff className="size-5 shrink-0" aria-hidden="true" />
                {t.notifDisable}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
