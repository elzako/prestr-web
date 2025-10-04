import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import { isE2ETestMode } from '@/lib/e2e/test-mode'
import { getSession, getUserById } from '@/lib/e2e/testStore'

const SESSION_COOKIE_NAME = 'prestr-e2e-session'

function evaluateRouteFlags(request: NextRequest) {
  const protectedRoutes = ['/dashboard', '/profile', '/settings']
  const authRoutes = ['/login', '/register']

  const pathname = request.nextUrl.pathname

  const isOrganizationRoute =
    /^\/[^\/]+\/?/.test(pathname) &&
    !authRoutes.some((route) => pathname.startsWith(route)) &&
    !protectedRoutes.some((route) => pathname.startsWith(route)) &&
    pathname !== '/'

  const isProtectedRoute =
    protectedRoutes.some((route) => pathname.startsWith(route)) ||
    isOrganizationRoute

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  return { isProtectedRoute, isAuthRoute }
}

function getTestUserFromRequest(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)
  if (!sessionCookie) {
    return null
  }

  const session = getSession(sessionCookie.value)
  if (!session) {
    return null
  }

  return getUserById(session.userId)
}

function handleTestMiddleware(request: NextRequest) {
  const response = NextResponse.next({ request })
  const { isProtectedRoute, isAuthRoute } = evaluateRouteFlags(request)
  const user = getTestUserFromRequest(request)

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectedFrom', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return response
}

export async function middleware(request: NextRequest) {
  if (isE2ETestMode()) {
    return handleTestMiddleware(request)
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { isProtectedRoute, isAuthRoute } = evaluateRouteFlags(request)

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectedFrom', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
