import { NextRequest, NextResponse } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

const PUBLIC_ADMIN_PATHS = ['/admin/login', '/admin/register']

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const host = request.headers.get('host') || ''

  // Canonicalize apex jalur.world -> www.jalur.world so cookies & sessions remain unified
  if (host === 'jalur.world') {
    const redirectUrl = new URL(request.url)
    redirectUrl.host = 'www.jalur.world'
    redirectUrl.protocol = 'https'
    return NextResponse.redirect(redirectUrl, { status: 308 })
  }

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

  if (
    pathname.startsWith('/account') ||
    pathname.startsWith('/set-route') ||
    pathname.startsWith('/super-admin')
  ) {
    const homeUrl = new URL('/', request.url)
    homeUrl.searchParams.set('auth', 'required')
    homeUrl.searchParams.set('next', `${pathname}${search}`)
    return NextResponse.redirect(homeUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}
