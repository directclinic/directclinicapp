import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { AuthShell } from '@/components/auth/auth-shell'

export default function AuthErrorPage() {
  return (
    <AuthShell
      title="Something went wrong"
      subtitle="We couldn't complete that sign-in. Please try again."
      footer={
        <Link
          href="/auth/login"
          className="font-bold text-primary underline underline-offset-4"
        >
          Back to sign in
        </Link>
      }
    >
      <div className="rounded-2xl border-2 border-destructive/40 bg-destructive/10 px-5 py-6 text-center">
        <AlertTriangle
          className="mx-auto mb-3 size-10 text-destructive"
          aria-hidden="true"
        />
        <p className="text-lg font-semibold text-destructive">
          The authentication link may have expired or already been used.
        </p>
      </div>
    </AuthShell>
  )
}
