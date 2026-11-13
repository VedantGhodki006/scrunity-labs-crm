"use client"

import Link from "next/link"
import { useActionState } from "react"

import {
  requestPasswordReset,
  setPassword,
  signIn,
} from "@/app/auth/actions"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

function SubmitButton({
  pending,
  children,
}: {
  pending: boolean
  children: React.ReactNode
}) {
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Spinner data-icon="inline-start" />}
      {children}
    </Button>
  )
}

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, undefined)
  return (
    <form action={action}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={state?.email}
            required
          />
        </Field>
        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link
              href="/forgot-password"
              className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </Field>
        {state?.error && <FieldError>{state.error}</FieldError>}
        <SubmitButton pending={pending}>Sign in</SubmitButton>
        <FieldDescription className="text-center">
          Accounts are invite-only. Ask an admin for access.
        </FieldDescription>
      </FieldGroup>
    </form>
  )
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(
    requestPasswordReset,
    undefined
  )
  if (state?.message) {
    return (
      <>
        <p className="text-sm">{state.message}</p>
        <BackToSignIn />
      </>
    )
  }
  return (
    <form action={action}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={state?.email}
            required
          />
        </Field>
        {state?.error && <FieldError>{state.error}</FieldError>}
        <SubmitButton pending={pending}>Send reset link</SubmitButton>
        <BackToSignIn />
      </FieldGroup>
    </form>
  )
}

function BackToSignIn() {
  return (
    <FieldDescription className="text-center">
      <Link href="/login">Back to sign in</Link>
    </FieldDescription>
  )
}

export function SetPasswordForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState(setPassword, undefined)
  return (
    <form action={action}>
      {/* Lets password managers save the new password against this account. */}
      <input
        type="email"
        name="username"
        autoComplete="username"
        value={email}
        readOnly
        hidden
      />
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="password">New password</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
          <FieldDescription>At least 8 characters.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm">Confirm password</FieldLabel>
          <Input
            id="confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            required
          />
        </Field>
        {state?.error && <FieldError>{state.error}</FieldError>}
        <SubmitButton pending={pending}>Save password</SubmitButton>
      </FieldGroup>
    </form>
  )
}
