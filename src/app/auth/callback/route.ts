import { createServerSupabase, createClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in search params, use it as the redirection URL (fallback)
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Fetch user to get metadata (role)
      const { data: { user } } = await supabase.auth.getUser();
      const role = user?.user_metadata?.role || "donor";
      
      const redirectMap: Record<string, string> = {
        admin: "/dashboard/admin",
        hospital: "/dashboard/hospital",
        donor: "/dashboard/donor",
      };

      const targetPath = redirectMap[role] || "/dashboard/donor";
      // Redirect to specific dashboard with a verified flag for the UI
      return NextResponse.redirect(`${origin}${targetPath}?verified=true`);
    }
  }

  // return the user to an error page with instructions
  console.error("Auth callback error: No code or exchange failed");
  return NextResponse.redirect(`${origin}/auth/login?error=Verification failed`);
}
