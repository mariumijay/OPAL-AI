import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase";

/**
 * Server-side Authorization Guard for the Admin Dashboard.
 * Prevents unauthorized client rendering of sensitive medical controls.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = await createServerSupabase(cookieStore);

  // 1. Authenticated Session Check
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login?reason=session_required");
  }

  // 2. Role-Based Access Control (RBAC) Audit
  // Source of truth: user_metadata (cached) or profiles table (deep check)
  const role = user.user_metadata?.role;
  const isSuperAdmin = user.email?.toLowerCase() === "ranahaseeb9427@gmail.com";

  if (role !== "admin" && !isSuperAdmin) {
    // If user exists but is not an admin, redirect to their respective dashboard
    const targetDashboard = role ? `/dashboard/${role}` : "/dashboard/donor";
    redirect(targetDashboard);
  }

  // 3. Authorized Context Delivery
  return <>{children}</>;
}
