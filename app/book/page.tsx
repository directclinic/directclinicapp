'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { DOCTORS } from '@/lib/doctors'

// --- April 2026 calendar helpers ---------------------------------------
const MONTH_LABEL = 'April 2026'
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
// April 1, 2026 is a Wednesday -> leading blank cells = 3
const LEADING_BLANKS = 3
const DAYS_IN_MONTH = 30

const TIME_SLOTS = [
  '9:00 AM',
  '9:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '1:00 PM',
  '1:30 PM',
  '2:00 PM',
  '2:30 PM',
  '3:00 PM',
  '3:30 PM',
]

const LANGUAGES = [
  'English',
  'Spanish',
  'Mandarin Chinese',
  'Bengali',
  'Haitian Creole',
  'Russian',
  'Korean',
  'Arabic',
]

function BookAppointmentView() {
  const searchParams = useSearchParams()
  const doctorId = searchParams.get('doctor')
  const doctor =
    DOCTORS.find((d) => d.id === doctorId) ?? DOCTORS[0]

  const [selectedDate, setSelectedDate] = useState<number | null>(14)
  const [selectedTime, setSelectedTime] = useState<string | null>('10:00 AM')
  const [language, setLanguage] = useState('')

  return (
    <main className="min-h-dvh bg-[#F7F4FA] text-[#6C5287]">
      {/* Header Navigation */}
      <header className="sticky top-0 z-10 border-b border-[#6C5287]/20 bg-[#F7F4FA]/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-3">
          <Link
            href="/"
            className="inline-flex h-12 min-w-12 items-center gap-1 rounded-xl border border-[#6C5287]/40 px-3 text-base font-semibold text-[#6C5287] transition-colors hover:bg-white"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            Back
          </Link>
          <h1 className="flex-1 text-center text-lg font-bold text-[#6C5287] sm:text-xl">
            Book Your Appointment
          </h1>
          {/* Spacer to keep the title centered against the Back button */}
          <div className="h-12 w-12 shrink-0" aria-hidden="true" />
        </div>
      </header>

      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6">
        {/* Selected Clinic Summary Card */}
        <section
          aria-label="Selected clinic"
          className="w-full rounded-2xl border border-[#6C5287]/40 bg-white p-5 shadow-sm"
        >
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold text-[#6C5287]">
              {doctor.fullName}, {doctor.credential}
            </h2>
            <p className="text-base leading-relaxed text-[#4D6E37]">
              {doctor.address}
            </p>
            <div className="mt-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#AACF8F] px-3 py-1.5 text-sm font-semibold text-[#2f4a1f]">
                <Check className="h-4 w-4" aria-hidden="true" />
                In-Network &mdash; ${doctor.copayUsd} Co-pay Verified
              </span>
            </div>
            <p className="mt-1 text-base font-medium text-[#6C5287]">
              {doctor.specialty}
            </p>
          </div>
        </section>

        {/* Date & Time Picker */}
        <section
          aria-label="Choose date and time"
          className="grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          {/* Select a Date */}
          <div className="rounded-2xl border border-[#6C5287]/25 bg-white p-5">
            <h3 className="mb-4 text-lg font-bold text-[#6C5287]">
              Select a Date
            </h3>

            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#6C5287]/30 text-[#6C5287] transition-colors hover:bg-[#F7F4FA]"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <span className="text-base font-semibold text-[#4D6E37]">
                {MONTH_LABEL}
              </span>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#6C5287]/30 text-[#6C5287] transition-colors hover:bg-[#F7F4FA]"
                aria-label="Next month"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {WEEKDAYS.map((day, i) => (
                <div
                  key={`${day}-${i}`}
                  className="py-1 text-xs font-bold uppercase text-[#4D6E37]"
                  aria-hidden="true"
                >
                  {day}
                </div>
              ))}

              {Array.from({ length: LEADING_BLANKS }).map((_, i) => (
                <div key={`blank-${i}`} aria-hidden="true" />
              ))}

              {Array.from({ length: DAYS_IN_MONTH }).map((_, i) => {
                const day = i + 1
                const isSelected = selectedDate === day
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDate(day)}
                    aria-pressed={isSelected}
                    aria-label={`April ${day}, 2026`}
                    className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-[#B18FCF] text-white'
                        : 'text-[#6C5287] hover:bg-[#F7F4FA]'
                    }`}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Select a Time */}
          <div className="rounded-2xl border border-[#6C5287]/25 bg-white p-5">
            <h3 className="mb-4 text-lg font-bold text-[#6C5287]">
              Select a Time
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-2">
              {TIME_SLOTS.map((slot) => {
                const isSelected = selectedTime === slot
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedTime(slot)}
                    aria-pressed={isSelected}
                    className={`flex h-12 items-center justify-center rounded-full border text-sm font-semibold transition-colors ${
                      isSelected
                        ? 'border-[#B18FCF] bg-[#B18FCF] text-white'
                        : 'border-[#6C5287]/40 bg-white text-[#6C5287] hover:bg-[#F7F4FA]'
                    }`}
                  >
                    {slot}
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        {/* Translation & Accessibility */}
        <section
          aria-label="Translation helper"
          className="rounded-2xl border border-[#6C5287]/25 bg-white p-5"
        >
          <h3 className="text-lg font-bold text-[#6C5287]">
            Request a translation helper for your clinic phone call?
          </h3>

          <div className="mt-4">
            <label
              htmlFor="language"
              className="mb-2 block text-base font-semibold text-[#6C5287]"
            >
              Select Your Preferred Language
            </label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="h-12 w-full rounded-xl border border-[#6C5287]/60 bg-white px-4 text-base text-[#6C5287] outline-none focus:border-[#B18FCF] focus:ring-2 focus:ring-[#B18FCF]/40"
            >
              <option value="" disabled>
                Choose a language&hellip;
              </option>
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <p className="text-base leading-relaxed text-[#4D6E37]">
              The clinic selected also has the following languages spoken at the
              front desk: {doctor.languages.join(', ')}.
            </p>
            <div className="rounded-xl bg-[#AACF8F]/25 p-4">
              <p className="text-base leading-relaxed text-[#4D6E37]">
                <span className="font-bold text-[#2f4a1f]">
                  Translators Available:
                </span>{' '}
                This option will automatically activate our live in-app call
                translation tool when completing your booking verification call.
              </p>
            </div>
          </div>
        </section>

        {/* Footer Action Buttons */}
        <section aria-label="Appointment actions" className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <button
              type="button"
              className="h-12 flex-1 rounded-xl bg-[#B18FCF] px-6 text-base font-bold text-white shadow-sm transition-colors hover:bg-[#9d78bf] focus:outline-none focus:ring-2 focus:ring-[#B18FCF]/50"
            >
              Book Appointment
            </button>
            <button
              type="button"
              className="h-12 flex-1 rounded-xl border-2 border-[#4D6E37] px-6 text-base font-bold text-[#4D6E37] transition-colors hover:bg-[#AACF8F]/20 focus:outline-none focus:ring-2 focus:ring-[#4D6E37]/40"
            >
              Cancel Appointment
            </button>
          </div>

          <Link
            href="/"
            className="mx-auto inline-flex h-12 items-center px-4 text-base font-semibold text-[#6C5287] underline-offset-4 hover:underline"
          >
            Home
          </Link>
        </section>
      </div>
    </main>
  )
}

export default function BookAppointmentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-[#F7F4FA] text-lg font-medium text-[#6C5287]">
          Loading…
        </div>
      }
    >
      <BookAppointmentView />
    </Suspense>
  )
}
