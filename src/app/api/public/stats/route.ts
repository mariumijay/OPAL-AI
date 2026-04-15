import { getServiceSupabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

// Cache for 30 seconds to be real-time but avoid spamming Supabase
export const revalidate = 30;

export async function GET() {
  const adminClient = getServiceSupabase();

  try {
    const [bloodCount, organCount, hospitalTotal, matchesCount] = await Promise.all([
      adminClient.from("blood_donors").select("*", { count: "exact", head: true }),
      adminClient.from("organ_donors").select("*", { count: "exact", head: true }),
      adminClient.from("hospitals").select("*", { count: "exact", head: true }).eq("is_verified", true),
      adminClient.from("match_results").select("id", { count: "exact", head: true }),
    ]);

    return NextResponse.json({
      totalDonors: (bloodCount.count || 0) + (organCount.count || 0),
      totalHospitals: hospitalTotal.count || 0,
      livesSaved: (matchesCount.count || 0) * 2, // Assuming each match can save multiple lives
      citiesCovered: 12, // Preset for network spread
    });
  } catch (error: any) {
    console.error("Public Stats API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
