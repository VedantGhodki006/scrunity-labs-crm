import type { Metadata } from "next"
import { Suspense } from "react"

import { AuthCard } from "@/components/auth/auth-card"
import { LoginForm } from "@/components/auth/auth-forms"

export const metadata: Metadata = { title: "Sign in · Scrunity CRM" }

async function ExpiredLinkNotice({
  searchParams,
}: {
  searchParams: PageProps<"/login">["searchParams"]
}) {
  const { error } = await searchParams
  if (error !== "link") return null
  return (
    <p role="alert" className="text-sm text-destructive">
      That link is invalid or has expired. Sign in, or request a new password
      reset link.
    </p>
  )
}

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <AuthCard title="Sign in" description="Use the email and password for your account.">
      <Suspense>
        <ExpiredLinkNotice searchParams={searchParams} />
      </Suspense>
      <LoginForm />
    </AuthCard>
  )
}
