import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase";

/**
 * Server-side Authorization Guard for the Hospital Dashboard.
 */
export default async function HospitalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = await createServerSupabase(cookieStore);

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login?reason=session_required");
  }

  const role = user.user_metadata?.role;
  const isSuperAdmin = user.email?.toLowerCase() === "ranahaseeb9427@gmail.com";

  // Hospitals and Admins can view this
  if (role !== "hospital" && role !== "admin" && !isSuperAdmin) {
    redirect("/dashboard/donor?reason=unauthorized_facility_access");
  }

  return <>{children}</>;
}
