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
  const { pathname } = request.nextUrl;

  // Base Public Routes
  const publicRoutes = ['/auth/login', '/auth/donor/signup', '/auth/hospital/signup', '/', '/api/backend'];
  const isPublic = publicRoutes.some(route => pathname === route || pathname.startsWith(route));

  // GUEST Logic
  if (!user) {
    if (!isPublic && pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    return response;
  }

  const role = user.user_metadata?.role || "donor";
  const isAdmin = user.email?.toLowerCase() === "ranahaseeb9427@gmail.com";

  // LOGGED IN Logic — Prevent Auth Pages
  if (pathname.startsWith("/auth") && !pathname.includes('pending-approval')) {
    const target = isAdmin ? '/dashboard/admin' : `/dashboard/${role}`;
    return NextResponse.redirect(new URL(target, request.url));
  }

  // Dashboard Context Switching
  if (pathname === '/dashboard') {
    const target = isAdmin ? '/dashboard/admin' : `/dashboard/${role}`;
    return NextResponse.redirect(new URL(target, request.url));
  }

  // RBAC Guards (Prevent hopping between views)
  if (!isAdmin) {
    if (role === 'donor' && (pathname.startsWith('/dashboard/admin') || pathname.startsWith('/dashboard/hospital'))) {
      return NextResponse.redirect(new URL('/dashboard/donor', request.url));
    }
    if (role === 'hospital' && (pathname.startsWith('/dashboard/admin') || pathname.startsWith('/dashboard/donor'))) {
      return NextResponse.redirect(new URL('/dashboard/hospital', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|assets|api).*)'],
};
