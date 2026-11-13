import type { Metadata } from "next"

import { AuthCard } from "@/components/auth/auth-card"
import { ForgotPasswordForm } from "@/components/auth/auth-forms"

export const metadata: Metadata = { title: "Reset password · Scrunity CRM" }

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Reset your password"
      description="Enter your email and we'll send you a link to choose a new password."
    >
      <ForgotPasswordForm />
    </AuthCard>
  )
}
