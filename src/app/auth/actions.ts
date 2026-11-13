"use server"

import { redirect } from "next/navigation"
import { z } from "zod"

import { createSupabaseClient } from "@/lib/supabase"

export type AuthFormState =
  | { error?: string; message?: string; email?: string }
  | undefined

const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
})

export async function signIn(
  _: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "")
  const parsed = signInSchema.safeParse({
    email,
    password: formData.get("password"),
  })
  if (!parsed.success) {
    return { error: "Enter your email and password.", email }
  }

  const supabase = await createSupabaseClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) {
    return {
      error:
        error.code === "invalid_credentials"
          ? "Incorrect email or password."
          : error.message,
      email,
    }
  }
  redirect("/")
}

export async function signOut() {
  const supabase = await createSupabaseClient()
  await supabase.auth.signOut()
  redirect("/login")
}

export async function requestPasswordReset(
  _: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "")
  const parsed = z.email().safeParse(email)
  if (!parsed.success) return { error: "Enter a valid email address.", email }

  const supabase = await createSupabaseClient()
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data)
  if (error?.status === 429) {
    return { error: "Too many requests. Wait a minute and try again.", email }
  }
  if (error && (error.status ?? 500) >= 500) {
    return { error: "Couldn't send the email. Try again later.", email }
  }
  // Same reply whether or not the account exists, so this can't be used to
  // find out who has an account.
  return { message: "If that email has an account, a reset link is on its way." }
}

const passwordSchema = z
  .object({
    password: z.string().min(8, "Use at least 8 characters."),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords don't match.",
  })

export async function setPassword(
  _: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = passwordSchema.safeParse({
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createSupabaseClient()
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  })
  if (error) {
    return {
      error:
        error.code === "same_password"
          ? "Choose a different password from your current one."
          : error.message,
    }
  }
  redirect("/")
}
