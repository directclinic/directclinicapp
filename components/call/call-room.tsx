'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Mic,
  MicOff,
  PhoneOff,
  Phone,
  Loader2,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { finalizeRecording } from '@/app/actions/calls'
import { cn } from '@/lib/utils'

type Phase = 'idle' | 'connecting' | 'waiting' | 'connected' | 'ended'

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
]

export function CallRoom({
  appointmentId,
  selfLabel,
  peerLabel,
  backHref,
}: {
  appointmentId: string
  selfLabel: string
  peerLabel: string
  backHref: string
}) {
  const router = useRouter()

  const [phase, setPhase] = useState<Phase>('idle')
  const [muted, setMuted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [processing, setProcessing] = useState(false)

  // Refs for the live call objects (not React state — they must persist and
  // never trigger re-renders).
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const channelRef = useRef<ReturnType<
    ReturnType<typeof createClient>['channel']
  > | null>(null)
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null)

  // Recording plumbing.
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const audioCtxRef = useRef<AudioContext | null>(null)
  const mixDestRef = useRef<MediaStreamAudioDestinationNode | null>(null)
  const startedAtRef = useRef<number>(0)
  const recordingIdRef = useRef<string>('')

  // Signaling identity + negotiation guards.
  const clientIdRef = useRef<string>(
    Math.random().toString(36).slice(2) + Date.now().toString(36),
  )
  const peerIdRef = useRef<string | null>(null)
  const negotiatedRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const send = useCallback((event: string, payload: Record<string, unknown>) => {
    channelRef.current?.send({
      type: 'broadcast',
      event,
      payload: { ...payload, from: clientIdRef.current },
    })
  }, [])

  const addRemoteToMix = useCallback((stream: MediaStream) => {
    const ctx = audioCtxRef.current
    const dest = mixDestRef.current
    if (!ctx || !dest) return
    try {
      const src = ctx.createMediaStreamSource(stream)
      src.connect(dest)
    } catch {
      // Ignore duplicate connections.
    }
  }, [])

  const startRecording = useCallback(() => {
    if (recorderRef.current || !localStreamRef.current) return
    try {
      const ctx = new AudioContext()
      const dest = ctx.createMediaStreamDestination()
      audioCtxRef.current = ctx
      mixDestRef.current = dest
      // Mix local mic into the recording.
      const localSrc = ctx.createMediaStreamSource(localStreamRef.current)
      localSrc.connect(dest)

      const recorder = new MediaRecorder(dest.stream, {
        mimeType: 'audio/webm',
      })
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorderRef.current = recorder
      chunksRef.current = []
      recordingIdRef.current = crypto.randomUUID()
      startedAtRef.current = Date.now()
      recorder.start(1000)
    } catch (err) {
      console.log('[v0] startRecording failed:', (err as Error).message)
    }
  }, [])

  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })

    pc.onicecandidate = (e) => {
      if (e.candidate) send('ice', { candidate: e.candidate.toJSON() })
    }

    pc.ontrack = (e) => {
      const [stream] = e.streams
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = stream
      }
      addRemoteToMix(stream)
      setPhase('connected')
      startRecording()
      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          setElapsed((s) => s + 1)
        }, 1000)
      }
    }

    pc.onconnectionstatechange = () => {
      if (
        pc.connectionState === 'failed' ||
        pc.connectionState === 'disconnected'
      ) {
        setError('The connection dropped. You can end the call and try again.')
      }
    }

    return pc
  }, [send, addRemoteToMix, startRecording])

  const maybeNegotiate = useCallback(async () => {
    // Once both peers know each other, the one with the larger id creates the
    // offer. This deterministic rule avoids both sides offering at once.
    if (negotiatedRef.current) return
    const peerId = peerIdRef.current
    if (!peerId) return
    const amInitiator = clientIdRef.current > peerId
    if (!amInitiator) {
      setPhase('waiting')
      return
    }
    negotiatedRef.current = true
    const pc = pcRef.current
    if (!pc) return
    try {
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      send('offer', { sdp: pc.localDescription })
    } catch (err) {
      setError('Could not start the call. ' + (err as Error).message)
    }
  }, [send])

  const join = useCallback(async () => {
    setError(null)
    setPhase('connecting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      localStreamRef.current = stream

      const pc = createPeerConnection()
      pcRef.current = pc
      stream.getTracks().forEach((track) => pc.addTrack(track, stream))

      const supabase = createClient()
      const channel = supabase.channel(`call:${appointmentId}`, {
        config: { broadcast: { self: false } },
      })
      channelRef.current = channel

      channel.on('broadcast', { event: 'hello' }, async ({ payload }) => {
        if (payload.from === clientIdRef.current) return
        peerIdRef.current = payload.from as string
        // Answer the greeting so the newcomer learns our id too.
        send('hello-back', {})
        await maybeNegotiate()
      })

      channel.on('broadcast', { event: 'hello-back' }, async ({ payload }) => {
        if (payload.from === clientIdRef.current) return
        peerIdRef.current = payload.from as string
        await maybeNegotiate()
      })

      channel.on('broadcast', { event: 'offer' }, async ({ payload }) => {
        if (payload.from === clientIdRef.current) return
        const pcNow = pcRef.current
        if (!pcNow) return
        try {
          await pcNow.setRemoteDescription(
            new RTCSessionDescription(payload.sdp as RTCSessionDescriptionInit),
          )
          const answer = await pcNow.createAnswer()
          await pcNow.setLocalDescription(answer)
          send('answer', { sdp: pcNow.localDescription })
        } catch (err) {
          setError('Failed to answer the call. ' + (err as Error).message)
        }
      })

      channel.on('broadcast', { event: 'answer' }, async ({ payload }) => {
        if (payload.from === clientIdRef.current) return
        const pcNow = pcRef.current
        if (!pcNow) return
        try {
          await pcNow.setRemoteDescription(
            new RTCSessionDescription(payload.sdp as RTCSessionDescriptionInit),
          )
        } catch (err) {
          console.log('[v0] setRemoteDescription(answer) failed:', err)
        }
      })

      channel.on('broadcast', { event: 'ice' }, async ({ payload }) => {
        if (payload.from === clientIdRef.current) return
        const pcNow = pcRef.current
        if (!pcNow) return
        try {
          await pcNow.addIceCandidate(
            new RTCIceCandidate(payload.candidate as RTCIceCandidateInit),
          )
        } catch (err) {
          console.log('[v0] addIceCandidate failed:', err)
        }
      })

      channel.on('broadcast', { event: 'bye' }, ({ payload }) => {
        if (payload.from === clientIdRef.current) return
        setError(`${peerLabel} left the call.`)
      })

      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setPhase('waiting')
          send('hello', {})
        }
      })
    } catch (err) {
      setError(
        'Could not access your microphone. Please allow mic access and try again.',
      )
      setPhase('idle')
      console.log('[v0] join failed:', (err as Error).message)
    }
  }, [appointmentId, createPeerConnection, maybeNegotiate, send, peerLabel])

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    localStreamRef.current?.getTracks().forEach((t) => t.stop())
    localStreamRef.current = null
    pcRef.current?.close()
    pcRef.current = null
    if (channelRef.current) {
      const supabase = createClient()
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }
    audioCtxRef.current?.close().catch(() => {})
    audioCtxRef.current = null
    mixDestRef.current = null
  }, [])

  // Finalize: stop the recorder, upload the audio, kick off processing.
  const endCall = useCallback(async () => {
    send('bye', {})
    setPhase('ended')

    const recorder = recorderRef.current
    const wasRecording = recorder && recorder.state !== 'inactive'
    const durationSeconds = startedAtRef.current
      ? Math.round((Date.now() - startedAtRef.current) / 1000)
      : 0

    if (wasRecording) {
      setProcessing(true)
      const blob: Blob = await new Promise((resolve) => {
        recorder!.onstop = () =>
          resolve(new Blob(chunksRef.current, { type: 'audio/webm' }))
        recorder!.stop()
      })

      try {
        const supabase = createClient()
        const recordingId = recordingIdRef.current
        const path = `${appointmentId}/${recordingId}.webm`
        const { error: upErr } = await supabase.storage
          .from('call-recordings')
          .upload(path, blob, { contentType: 'audio/webm', upsert: true })
        if (upErr) throw new Error(upErr.message)

        await finalizeRecording({
          appointmentId,
          recordingId,
          storagePath: path,
          durationSeconds,
        })
      } catch (err) {
        console.log('[v0] finalize failed:', (err as Error).message)
        setError(
          'The call ended, but we could not save the recording: ' +
            (err as Error).message,
        )
      }
      setProcessing(false)
    }

    cleanup()
    router.push(backHref)
    router.refresh()
  }, [appointmentId, backHref, cleanup, router, send])

  // Tear everything down if the component unmounts mid-call.
  useEffect(() => {
    return () => cleanup()
  }, [cleanup])

  function toggleMute() {
    const stream = localStreamRef.current
    if (!stream) return
    const next = !muted
    stream.getAudioTracks().forEach((t) => (t.enabled = !next))
    setMuted(next)
  }

  const mmss = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')}`

  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-3xl border-2 border-border bg-card p-8 text-center shadow-sm">
      {/* Hidden element that plays the remote party's audio. */}
      <audio ref={remoteAudioRef} autoPlay className="sr-only" />

      <div
        className={cn(
          'flex size-24 items-center justify-center rounded-full border-4',
          phase === 'connected'
            ? 'border-primary bg-primary/10'
            : 'border-border bg-muted',
        )}
      >
        <Phone
          className={cn(
            'size-10',
            phase === 'connected' ? 'text-primary' : 'text-muted-foreground',
          )}
          aria-hidden="true"
        />
      </div>

      <h2 className="mt-5 text-2xl font-extrabold text-foreground">
        {peerLabel}
      </h2>
      <p className="mt-1 flex items-center gap-2 text-base font-semibold text-muted-foreground">
        {phase === 'connected' ? (
          <>
            <Wifi className="size-4 text-primary" aria-hidden="true" />
            Connected · {mmss}
          </>
        ) : phase === 'waiting' ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Waiting for {peerLabel} to join…
          </>
        ) : phase === 'connecting' ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Connecting…
          </>
        ) : phase === 'ended' ? (
          <>
            <WifiOff className="size-4" aria-hidden="true" />
            Call ended
          </>
        ) : (
          `You are joining as ${selfLabel}`
        )}
      </p>

      {error && (
        <p className="mt-4 rounded-2xl border-2 border-destructive/30 bg-destructive/10 px-4 py-3 text-base font-semibold text-destructive">
          {error}
        </p>
      )}

      {processing && (
        <p className="mt-4 flex items-center gap-2 text-base font-semibold text-muted-foreground">
          <Loader2 className="size-5 animate-spin" aria-hidden="true" />
          Saving recording…
        </p>
      )}

      <div className="mt-8 flex items-center gap-4">
        {phase === 'idle' ? (
          <button
            type="button"
            onClick={join}
            className="inline-flex min-h-14 items-center gap-2 rounded-full bg-primary px-8 text-lg font-extrabold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
          >
            <Phone className="size-6" aria-hidden="true" />
            Join call
          </button>
        ) : phase !== 'ended' ? (
          <>
            <button
              type="button"
              onClick={toggleMute}
              aria-pressed={muted}
              aria-label={muted ? 'Unmute microphone' : 'Mute microphone'}
              className={cn(
                'inline-flex size-14 items-center justify-center rounded-full border-2 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40',
                muted
                  ? 'border-destructive bg-destructive/10 text-destructive'
                  : 'border-border bg-card text-foreground hover:bg-muted',
              )}
            >
              {muted ? (
                <MicOff className="size-6" aria-hidden="true" />
              ) : (
                <Mic className="size-6" aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              onClick={endCall}
              disabled={processing}
              aria-label="End call"
              className="inline-flex size-14 items-center justify-center rounded-full bg-destructive text-destructive-foreground transition-opacity hover:opacity-90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-destructive/40"
            >
              <PhoneOff className="size-6" aria-hidden="true" />
            </button>
          </>
        ) : null}
      </div>

      <p className="mt-6 text-pretty text-sm leading-relaxed text-muted-foreground">
        This call is recorded. After it ends, a transcript and translation are
        generated for the patient.
      </p>
    </div>
  )
}
