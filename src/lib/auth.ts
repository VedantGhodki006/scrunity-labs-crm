import "server-only"

import { redirect } from "next/navigation"
import { connection } from "next/server"
import { cache } from "react"

import { createSupabaseClient } from "@/lib/supabase"

export type User = { id: string; email: string }

// getClaims() verifies the session JWT locally against the project's signing
// keys, so checking auth doesn't cost a round trip to Supabase.
export const getUser = cache(async (): Promise<User | null> => {
  // Checking token expiry reads the clock, so this must run at request time.
  await connection()
  const supabase = await createSupabaseClient()
  const { data } = await supabase.auth.getClaims()
  if (!data) return null
  return { id: data.claims.sub, email: data.claims.email ?? "" }
})

export async function requireUser(): Promise<User> {
  const user = await getUser()
  if (!user) redirect("/login")
  return user
}
