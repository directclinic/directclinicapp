'use client'

import { useState } from 'react'
import {
  Play,
  Pause,
  FileText,
  Languages,
  Loader2,
  AlertCircle,
  Clock,
} from 'lucide-react'
import { getRecordingUrl } from '@/app/actions/calls'
import { cn } from '@/lib/utils'

export type CallRecording = {
  id: string
  storage_path: string | null
  duration_seconds: number | null
  transcript: string | null
  transcript_language: string | null
  translated_text: string | null
  translated_language: string | null
  status: string
  created_at: string
}

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  zh: 'Chinese (Cantonese)',
  ru: 'Russian',
  bn: 'Bengali',
  it: 'Italian',
  tl: 'Tagalog',
}

function formatDuration(seconds: number | null) {
  if (!seconds || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function RecordingsPanel({
  recordings,
}: {
  recordings: CallRecording[]
}) {
  if (recordings.length === 0) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-border bg-muted/30 p-8 text-center">
        <FileText
          className="mx-auto size-8 text-muted-foreground"
          aria-hidden="true"
        />
        <p className="mt-3 text-base font-semibold text-muted-foreground">
          No call recordings yet. When you finish a call, the recording,
          transcript, and translation will appear here.
        </p>
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-4">
      {recordings.map((rec) => (
        <RecordingCard key={rec.id} rec={rec} />
      ))}
    </ul>
  )
}

function RecordingCard({ rec }: { rec: CallRecording }) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [loadingAudio, setLoadingAudio] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [showOriginal, setShowOriginal] = useState(false)

  async function togglePlay() {
    setError(null)
    // Load the signed URL lazily on first play.
    if (!audioUrl) {
      if (!rec.storage_path) {
        setError('Recording file is unavailable.')
        return
      }
      setLoadingAudio(true)
      const res = await getRecordingUrl(rec.storage_path)
      setLoadingAudio(false)
      if ('error' in res) {
        setError(res.error)
        return
      }
      const el = new Audio(res.url)
      el.addEventListener('ended', () => setPlaying(false))
      el.addEventListener('pause', () => setPlaying(false))
      el.addEventListener('play', () => setPlaying(true))
      setAudioUrl(res.url)
      setAudioEl(el)
      await el.play()
      return
    }
    if (audioEl) {
      if (playing) audioEl.pause()
      else await audioEl.play()
    }
  }

  const isProcessing = rec.status === 'processing'
  const isFailed = rec.status === 'failed'
  const translatedName = rec.translated_language
    ? (LANGUAGE_NAMES[rec.translated_language] ?? rec.translated_language)
    : null

  return (
    <li className="rounded-3xl border-2 border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={togglePlay}
            disabled={loadingAudio || isProcessing}
            aria-label={playing ? 'Pause recording' : 'Play recording'}
            className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
          >
            {loadingAudio ? (
              <Loader2 className="size-6 animate-spin" aria-hidden="true" />
            ) : playing ? (
              <Pause className="size-6" aria-hidden="true" />
            ) : (
              <Play className="size-6" aria-hidden="true" />
            )}
          </button>
          <div>
            <p className="text-base font-extrabold text-foreground">
              Call recording
            </p>
            <p className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
              <Clock className="size-4" aria-hidden="true" />
              {formatDuration(rec.duration_seconds)} · {formatDate(rec.created_at)}
            </p>
          </div>
        </div>
        <StatusBadge status={rec.status} />
      </div>

      {error && (
        <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-destructive">
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      {isProcessing && (
        <p className="mt-4 flex items-center gap-2 rounded-2xl border-2 border-border bg-muted/40 px-4 py-3 text-base font-semibold text-muted-foreground">
          <Loader2 className="size-5 shrink-0 animate-spin" aria-hidden="true" />
          Transcribing and translating this call…
        </p>
      )}

      {isFailed && (
        <p className="mt-4 flex items-center gap-2 rounded-2xl border-2 border-destructive/30 bg-destructive/10 px-4 py-3 text-base font-semibold text-destructive">
          <AlertCircle className="size-5 shrink-0" aria-hidden="true" />
          We couldn&apos;t transcribe this recording, but the audio is still
          available above.
        </p>
      )}

      {/* Translation is the primary text shown to the patient; the original
          transcript is available behind a toggle. */}
      {rec.translated_text && (
        <div className="mt-4">
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-primary">
            <Languages className="size-4" aria-hidden="true" />
            {translatedName
              ? `Summary in ${translatedName}`
              : 'Translated summary'}
          </p>
          <p className="mt-1.5 whitespace-pre-wrap text-pretty text-base leading-relaxed text-foreground">
            {rec.translated_text}
          </p>
        </div>
      )}

      {rec.transcript && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowOriginal((v) => !v)}
            className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
          >
            <FileText className="size-4" aria-hidden="true" />
            {showOriginal ? 'Hide original transcript' : 'Show original transcript'}
          </button>
          {showOriginal && (
            <p className="mt-2 whitespace-pre-wrap text-pretty text-base leading-relaxed text-muted-foreground">
              {rec.transcript}
            </p>
          )}
        </div>
      )}
    </li>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    ready: {
      label: 'Ready',
      cls: 'border-primary/25 bg-primary/5 text-primary',
    },
    processing: {
      label: 'Processing',
      cls: 'border-border bg-muted text-muted-foreground',
    },
    failed: {
      label: 'Transcript failed',
      cls: 'border-destructive/30 bg-destructive/10 text-destructive',
    },
  }
  const cfg = map[status] ?? map.processing
  return (
    <span
      className={cn(
        'rounded-full border-2 px-3 py-1 text-xs font-bold uppercase tracking-wide',
        cfg.cls,
      )}
    >
      {cfg.label}
    </span>
  )
}
