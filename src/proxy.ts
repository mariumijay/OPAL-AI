import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname, searchParams } = request.nextUrl;

  const publicRoutes = [
    '/auth/login',
    '/auth/donor/signup',
    '/auth/hospital/signup',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/verify-email',
    '/auth/role-select',
    '/auth/pending-approval', 
    '/',
  ];

  const isPublic = publicRoutes.some(route => pathname === route || pathname.startsWith(route));

  if (!user) {
    if (!isPublic && pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    return response;
  }

  if (user && pathname.startsWith("/auth") && 
      !pathname.includes('pending-approval') && 
      !pathname.includes('donor/signup') && 
      !pathname.includes('hospital/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Logged in — RBAC for Dashboards
  if (pathname.startsWith('/dashboard')) {
    const role = user.user_metadata?.role;
    const email = user.email?.toLowerCase();
    const isAdminMode = searchParams.get("mode") === "admin_view";
    const isSuperAdmin = email === "ranahaseeb9427@gmail.com";

    // 1. Super Admin / Admin Override
    if (role === 'admin' || isSuperAdmin || isAdminMode) {
      if (pathname === '/dashboard') {
        return NextResponse.redirect(new URL('/dashboard/admin', request.url));
      }
      return response;
    }

    // 2. Role-based Root Dashboard Routing
    if (pathname === '/dashboard') {
      if (role === 'hospital') return NextResponse.redirect(new URL('/dashboard/hospital', request.url));
      if (role === 'doctor') return NextResponse.redirect(new URL('/dashboard/doctor', request.url));
      return NextResponse.redirect(new URL('/dashboard/donor', request.url));
    }

    // 3. Donor Strict Guard
    if (role === 'donor') {
      if (pathname.startsWith('/dashboard/admin') || pathname.startsWith('/dashboard/hospital')) {
         return NextResponse.redirect(new URL('/dashboard/donor', request.url));
      }
    }

    // 4. Hospital Strict Guard
    if (role === 'hospital') {
      if (pathname.startsWith('/dashboard/admin') || pathname.startsWith('/dashboard/donor')) {
         return NextResponse.redirect(new URL('/dashboard/hospital', request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|assets|api).*)'],
};
