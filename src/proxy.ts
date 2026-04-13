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
      auth: {
        storageKey: "opal-ai-auth-token",
      },
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

  // Public routes — always allow
  const publicRoutes = [
    '/auth/login',
    '/auth/donor/signup',
    '/auth/hospital/signup',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/verify-email',
    '/auth/role-select',
    '/',
  ];

  const isPublic = publicRoutes.some(route => pathname === route || pathname.startsWith(route));

  // Not logged in — allow public, block protected
  if (!user) {
    if (!isPublic && pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    return response;
  }

  // Logged in — allow everything, proxy handles session
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|assets|api).*)'],
};
