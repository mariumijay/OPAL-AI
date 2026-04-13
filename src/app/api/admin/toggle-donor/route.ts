import { sendDonorReActivationEmail, sendDonorSuspensionEmail } from "@/lib/mailer";
import { createServerSupabase, getServiceSupabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = await createServerSupabase(cookieStore);
  const adminClient = getServiceSupabase();

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error("Auth Error in Toggle API:", authError);
    }

    // Safety check: Admin role or explicit override
    const isAdmin = user?.user_metadata?.role === "admin" || user?.email === "ranahaseeb9427@gmail.com";

    if (!isAdmin) {
      console.warn("Unauthorized toggle attempt by:", user?.email || "Anonymous");
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    const { donor_id, type, current_status, reason } = await request.json();

    if (!donor_id || !type) {
      return NextResponse.json({ error: "Donor ID and type are required" }, { status: 400 });
    }

    const tableName = type === "blood" ? "blood_donors" : "organ_donors";
    const nextStatus = !current_status;

    // 0. Fetch donor details using service client to ensure visibility
    const { data: donor, error: fetchError } = await adminClient
      .from(tableName)
      .select("email, full_name, user_id")
      .eq("id", donor_id)
      .single();

    if (fetchError || !donor) {
      throw new Error(`Donor not found: ${donor_id}`);
    }

    // 1. Update specialized table using service client (bypasses RLS)
    const { error: specErr } = await adminClient
      .from(tableName)
      .update({
        is_available: nextStatus,
        suspension_reason: nextStatus ? null : (reason || "Administrative Review")
      })
      .eq("id", donor_id);

    if (specErr) throw specErr;

    // 2. Update central table using service client if user_id exists
    if (donor.user_id) {
      await adminClient.from("donors").update({
        status: nextStatus ? 'active' : 'suspended',
        suspension_reason: nextStatus ? null : (reason || "Administrative Review")
      }).eq("user_id", donor.user_id);
    }

    // 3. Send Email (Non-blocking)
    try {
      if (nextStatus) {
        await sendDonorReActivationEmail(donor.email, donor.full_name);
      } else {
        await sendDonorSuspensionEmail(donor.email, donor.full_name, reason || "Administrative Review");
      }
    } catch (emailError) {
      console.error("Notification email failed, but DB updated:", emailError);
    }

    return NextResponse.json({ success: true, newStatus: nextStatus });
  } catch (error: any) {
    console.error("Toggle API Final Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
