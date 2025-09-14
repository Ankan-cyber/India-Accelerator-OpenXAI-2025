import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from './lib/auth'

// 1. Specify protected and public routes
const protectedRoutes = ['/', '/schedule', '/progress', '/health-tips']
const publicRoutes = ['/login', '/register']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 2. Check if the user is trying to access a protected route
  const isProtectedRoute = protectedRoutes.includes(pathname)

  // 3. Decrypt the session from the cookie
  const cookie = request.cookies.get('session')?.value
  const session = await decrypt(cookie)

  // 4. Redirect unauthenticated users to the login page
  if (isProtectedRoute && !session?.userId) {
    return NextResponse.redirect(new URL('/login', request.nextUrl))
  }

  // 5. Redirect authenticated users away from public routes
  if (
    publicRoutes.includes(pathname) &&
    session?.userId
  ) {
    return NextResponse.redirect(new URL('/', request.nextUrl))
  }

  return NextResponse.next()
}

// Match all request paths except for the ones starting with:
// - api (API routes)
// - _next/static (static files)
// - _next/image (image optimization files)
// - favicon.ico (favicon file)
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
