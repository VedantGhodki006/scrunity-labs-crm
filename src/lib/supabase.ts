import "server-only"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Queries run as the signed-in user (from the session cookie), so the
// database's row-level security policies decide what each request can do.
export async function createSupabaseClient() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY. Copy .env.example to .env.local and fill them in."
    )
  }
  const cookieStore = await cookies()
  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Server Components can't set cookies; the proxy refreshes sessions.
        }
      },
    },
  })
}
