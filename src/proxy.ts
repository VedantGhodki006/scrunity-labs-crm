import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// Pages a signed-out visitor is allowed to open.
const PUBLIC_PATHS = ["/login", "/forgot-password", "/auth/confirm"]
// Pages that make no sense once signed in.
const SIGNED_OUT_ONLY = ["/login", "/forgot-password"]

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet, headers) {
          // Pass refreshed tokens to the page being rendered and to the browser.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
          Object.entries(headers).forEach(([key, value]) =>
            response.headers.set(key, value)
          )
        },
      },
    }
  )

  // Refreshes an expired session before anything else reads it.
  const { data } = await supabase.auth.getClaims()
  const signedIn = data !== null
  const { pathname } = request.nextUrl

  if (!signedIn && !PUBLIC_PATHS.includes(pathname)) {
    return redirectKeepingCookies(request, "/login", response)
  }
  if (signedIn && SIGNED_OUT_ONLY.includes(pathname)) {
    return redirectKeepingCookies(request, "/", response)
  }
  return response
}

function redirectKeepingCookies(
  request: NextRequest,
  path: string,
  from: NextResponse
) {
  const redirect = NextResponse.redirect(new URL(path, request.url))
  from.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie))
  return redirect
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
