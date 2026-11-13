import type { EmailOtpType } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import type { NextRequest } from "next/server"

import { createSupabaseClient } from "@/lib/supabase"

// Invite and password-reset emails link here with a one-time token, which is
// exchanged for a session before sending the user on to `next`.
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const tokenHash = searchParams.get("token_hash")
  const type = searchParams.get("type") as EmailOtpType | null
  const next = searchParams.get("next") ?? "/"
  // Only same-site paths, so a crafted link can't bounce users elsewhere.
  const safeNext = /^\/(?![/\\])/.test(next) ? next : "/"

  if (tokenHash && type) {
    const supabase = await createSupabaseClient()
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    })
    if (!error) redirect(safeNext)
  }
  redirect("/login?error=link")
}
