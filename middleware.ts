import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is protected (dashboard routes)
  if (pathname.startsWith('/dashboard')) {
    // Check for authentication token
    const accessToken = request.cookies.get('accessToken')?.value;

    console.log('Middleware - pathname:', pathname);
    console.log('Middleware - accessToken present:', !!accessToken);
    console.log('Middleware - all cookies:', request.cookies.getAll());

    // If no token found, redirect to login
    if (!accessToken) {
      console.log('Middleware - No token, redirecting to login');
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    console.log('Middleware - Token found, allowing access');
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
