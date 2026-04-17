import { NextResponse } from "next/server";
import { createServerSupabase, getServiceSupabase } from "@/lib/supabase";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const supabase = await createServerSupabase(cookieStore);
  const adminClient = getServiceSupabase();

  // 1. Strict Authorization Audit
  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = user?.user_metadata?.role === "admin" || user?.email === "ranahaseeb9427@gmail.com";

  if (!isAdmin) {
    return NextResponse.json({ error: "Access Denied: Administrative Credentials Required" }, { status: 403 });
  }

  try {
    // 2. Fetch Pending Entities from Source-of-Truth Tables
    // Removed ghost 'donors' table query
    const [bloodRes, organRes, hospitalRes] = await Promise.all([
      adminClient
        .from("blood_donors")
        .select("*")
        .eq("approval_status", "pending")
        .order("created_at", { ascending: false }),
      adminClient
        .from("organ_donors")
        .select("*")
        .eq("approval_status", "pending")
        .order("created_at", { ascending: false }),
      adminClient
        .from("hospitals")
        .select("*")
        .eq("is_verified", false)
        .order("created_at", { ascending: false })
    ]);

    // 3. Normalization Pipeline
    // Transform disparate rows into a unified structure for the Admin Dashboard
    const normalizedDonors = [
      ...(bloodRes.data || []).map(d => ({
        id: d.id,
        user_id: d.user_id,
        full_name: d.full_name,
        email: d.email || "—",
        city: d.city,
        type: "blood",
        user_type: "blood_donor",
        detail: `Blood: ${d.blood_type}`,
        created_at: d.created_at,
      })),
      ...(organRes.data || []).map(d => ({
        id: d.id,
        user_id: d.user_id,
        full_name: d.full_name,
        email: d.email || "—",
        city: d.city,
        type: "organ",
        user_type: "organ_donor",
        detail: `Organ: ${(d.organs_available as string[] || []).join(', ')}`,
        created_at: d.created_at,
      }))
    ];

    const normalizedHospitals = (hospitalRes.data || []).map(h => ({
      id: h.id,
      user_id: h.user_id,
      full_name: h.name, // Corrected from hospital_name
      email: h.contact_email || "—",
      city: h.city,
      type: "hospital",
      user_type: "hospital",
      detail: `License: ${h.license_number || "PENDING"}`,
      created_at: h.created_at,
    }));

    const finalQueue = [...normalizedDonors, ...normalizedHospitals].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json(finalQueue, { status: 200 });
  } catch (error: any) {
    console.error("ADMIN QUEUE FETCH FAILURE:", error);
    return NextResponse.json({ error: "Internal System Audit failed to fetch queue." }, { status: 500 });
  }
}
