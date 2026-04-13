import { createServerSupabase, getServiceSupabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const supabase = await createServerSupabase(cookieStore);
  const adminClient = getServiceSupabase();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const isAdmin = user?.user_metadata?.role === "admin" || user?.email === "ranahaseeb9427@gmail.com";
    
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Use service client for stats to ensure full visibility
    const [bloodCount, organCount, hospitalTotal, hospitalPending, matchesCount] = await Promise.all([
      adminClient.from("blood_donors").select("*", { count: "exact", head: true }),
      adminClient.from("organ_donors").select("*", { count: "exact", head: true }),
      adminClient.from("hospitals").select("*", { count: "exact", head: true }),
      adminClient.from("hospitals").select("*", { count: "exact", head: true }).eq("is_verified", false),
      adminClient.from("match_results").select("*", { count: "exact", head: true }),
    ]);

    return NextResponse.json({
      totalDonors: (bloodCount.count || 0) + (organCount.count || 0),
      totalHospitals: hospitalTotal.count || 0,
      pendingHospitals: hospitalPending.count || 0,
      totalMatches: matchesCount.count || 0,
    });
  } catch (error: any) {
    console.error("Stats API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
