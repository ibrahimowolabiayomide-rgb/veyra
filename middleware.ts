import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@veyra.ng';

const PROTECTED_ROUTES = ['/profile', '/dashboard', '/checkout', '/messages', '/notifications', '/settings'];
const ADMIN_ROUTES = ['/admin', '/dashboard/admin'];
const AUTH_ROUTES = ['/auth/login', '/auth/signup'];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;

  // Create supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return req.cookies.get(name)?.value; },
        set(name, value, options) { res.cookies.set({ name, value, ...options }); },
        remove(name, options) { res.cookies.set({ name, value: '', ...options }); },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  // Redirect logged-in users away from auth pages
  if (session && AUTH_ROUTES.some(r => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Protect authenticated routes
  if (!session && PROTECTED_ROUTES.some(r => pathname.startsWith(r))) {
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Protect admin routes — ONLY admin email
  if (ADMIN_ROUTES.some(r => pathname.startsWith(r))) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login?redirect=' + pathname, req.url));
    }
    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      // Non-admins get redirected to home with no hint admin exists
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // Rate limiting headers
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js).*)'],
};
