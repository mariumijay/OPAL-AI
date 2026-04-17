import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = await createServerSupabase(cookieStore);
    
    // 1. Session Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const { request_type, blood_type, organ_type, urgency, city } = await request.json();

    // 2. Fetch Hospital ID associated with this user
    const { data: hospital, error: hError } = await supabase
      .from("hospitals")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (hError || !hospital) {
      return NextResponse.json({ error: "No hospital associated with this account." }, { status: 403 });
    }

    // 3. Create Request entry in 'organ_requests'
    // This table was defined in the repair migration
    const { data, error: insertError } = await supabase
      .from("organ_requests")
      .insert([{
        hospital_id: hospital.id,
        patient_blood_type: blood_type || "O+",
        required_organs: request_type === "blood" ? ["Whole Blood"] : [organ_type],
        urgency_level: urgency,
        status: 'open'
      }])
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ 
      success: true, 
      request_id: data.id,
      message: "Clinical request broadcasted to the OPAL-AI network." 
    }, { status: 201 });

  } catch (error: any) {
    console.error("CREATE REQUEST FAILURE:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
