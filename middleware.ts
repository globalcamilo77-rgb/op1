import { NextRequest, NextResponse } from 'next/server'

const ADMIN_SESSION_COOKIE = 'alfa-admin-session'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/adminlr')) {
    const session = req.cookies.get(ADMIN_SESSION_COOKIE)
    if (!session?.value) {
      const loginUrl = req.nextUrl.clone()
      loginUrl.pathname = '/login'
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/adminlr/:path*'],
}
