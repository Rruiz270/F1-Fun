import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'f1-fun-default-secret'
);

const COOKIE_NAME = 'f1fun_token';

const publicPaths = ['/', '/login', '/register'];
const pendingPaths = ['/pending'];
const adminPaths = ['/admin'];
const approvedPaths = ['/dashboard', '/bet', '/results', '/leaderboard'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes and static files
  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  let user: { role: string; status: string } | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      user = payload as unknown as { role: string; status: string };
    } catch {
      // Invalid token - clear it
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete(COOKIE_NAME);
      return response;
    }
  }

  // Public paths - redirect logged-in users
  if (publicPaths.includes(pathname)) {
    if (user) {
      if (user.status === 'pending') {
        return NextResponse.redirect(new URL('/pending', request.url));
      }
      if (user.role === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // No user - redirect to login
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Pending paths
  if (pendingPaths.some(p => pathname.startsWith(p))) {
    if (user.status !== 'pending') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Admin paths
  if (adminPaths.some(p => pathname.startsWith(p))) {
    if (user.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Approved paths
  if (approvedPaths.some(p => pathname.startsWith(p))) {
    if (user.status === 'pending') {
      return NextResponse.redirect(new URL('/pending', request.url));
    }
    if (user.status === 'rejected') {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete(COOKIE_NAME);
      return response;
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
