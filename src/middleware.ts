import { NextRequest, NextResponse } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

const PUBLIC_ADMIN_PATHS = ['/admin/login', '/admin/register']

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  if (PUBLIC_ADMIN_PATHS.some((publicPath) => pathname.startsWith(publicPath))) {
    return NextResponse.next()
  }

  const sessionCookie = getSessionCookie(request)

  // Authenticated user with active Better Auth session
  if (sessionCookie) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/admin')) {
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('next', `${pathname}${search}`)
    return NextResponse.redirect(loginUrl)
  }

  if (pathname.startsWith('/account') || pathname.startsWith('/set-route')) {
    const homeUrl = new URL('/', request.url)
    homeUrl.searchParams.set('auth', 'required')
    homeUrl.searchParams.set('next', `${pathname}${search}`)
    return NextResponse.redirect(homeUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/account/:path*', '/admin/:path*', '/set-route/:path*'],
}
