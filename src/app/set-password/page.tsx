import type { Metadata } from "next"
import { Suspense } from "react"

import { AuthCard } from "@/components/auth/auth-card"
import { SetPasswordForm } from "@/components/auth/auth-forms"
import { Skeleton } from "@/components/ui/skeleton"
import { requireUser } from "@/lib/auth"

export const metadata: Metadata = { title: "Set password · Scrunity CRM" }

async function SignedInForm() {
  const user = await requireUser()
  return <SetPasswordForm email={user.email} />
}

// Invite and password-reset links land here after /auth/confirm signs the
// user in.
export default function SetPasswordPage() {
  return (
    <AuthCard
      title="Set your password"
      description="Choose a password to finish setting up your account."
    >
      <Suspense fallback={<Skeleton className="h-48 w-full" />}>
        <SignedInForm />
      </Suspense>
    </AuthCard>
  )
}
