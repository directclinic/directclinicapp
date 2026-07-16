// Localized copy for the day-before appointment reminder push. Keyed by the
// patient's preferred_language (falls back to English).
type ReminderCopy = { title: (clinic: string) => string; body: string }

export const REMINDER_MESSAGES: Record<string, ReminderCopy> = {
  en: {
    title: (clinic) => `Reminder: appointment tomorrow at ${clinic}`,
    body: 'Please open Insy Care to confirm you are still coming.',
  },
  es: {
    title: (clinic) => `Recordatorio: cita mañana en ${clinic}`,
    body: 'Abre Insy Care para confirmar si aún vas a asistir.',
  },
  zh: {
    title: (clinic) => `提提你：聽日喺 ${clinic} 有預約`,
    body: '請開啟 Insy Care 確認你係咪仲會嚟。',
  },
  ru: {
    title: (clinic) => `Напоминание: завтра приём в ${clinic}`,
    body: 'Откройте Insy Care, чтобы подтвердить, что вы придёте.',
  },
  bn: {
    title: (clinic) => `রিমাইন্ডার: আগামীকাল ${clinic}-এ অ্যাপয়েন্টমেন্ট`,
    body: 'আপনি আসছেন কিনা নিশ্চিত করতে Insy Care খুলুন।',
  },
  it: {
    title: (clinic) => `Promemoria: domani appuntamento presso ${clinic}`,
    body: 'Apri Insy Care per confermare che verrai.',
  },
  tl: {
    title: (clinic) => `Paalala: appointment bukas sa ${clinic}`,
    body: 'Buksan ang Insy Care para makumpirma na pupunta ka pa rin.',
  },
}

export function reminderCopy(language: string | null | undefined) {
  return REMINDER_MESSAGES[language ?? 'en'] ?? REMINDER_MESSAGES.en
}
