import { createServerSupabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createServerSupabase();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.user_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { hospital_id } = await request.json();

    if (!hospital_id) {
      return NextResponse.json({ error: "Hospital ID is required" }, { status: 400 });
    }

    // 1. Get details first
    const { data: hospital, error: fetchError } = await supabase
      .from("hospitals")
      .select("email, hospital_name")
      .eq("hospital_id", hospital_id)
      .single();

    if (fetchError || !hospital) throw new Error("Hospital not found");

    // 2. Delete record
    const { error: deleteError } = await supabase
      .from("hospitals")
      .delete()
      .eq("hospital_id", hospital_id);

    if (deleteError) throw deleteError;

    // 3. Notify
    const origin = request.headers.get("origin") || "http://localhost:3000";
    await fetch(`${origin}/api/auth/notify-hospital`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: hospital.email,
        hospital_name: hospital.hospital_name,
        status: "rejected"
      })
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
