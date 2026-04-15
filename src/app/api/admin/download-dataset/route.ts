import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { getServiceSupabase } from "@/lib/supabase";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const supabase = await createServerSupabase(cookieStore);
  const adminClient = getServiceSupabase();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = user?.user_metadata?.role === "admin" || user?.email === "ranahaseeb9427@gmail.com";

  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    // Fetch all blood donors
    const { data: bloodDonors } = await adminClient
      .from("blood_donors")
      .select("full_name, blood_type, age, city, gender, is_diabetic, is_smoker, approval_status, created_at")
      .order("created_at", { ascending: false });

    // Fetch all organ donors
    const { data: organDonors } = await adminClient
      .from("organ_donors")
      .select("full_name, blood_type, age, city, gender, medical_conditions, organ_type, approval_status, created_at")
      .order("created_at", { ascending: false });

    // Fetch all hospitals
    const { data: hospitals } = await adminClient
      .from("hospitals")
      .select("hospital_name, city, hospital_type, specialization, is_verified, approval_status, created_at")
      .order("created_at", { ascending: false });

    // Build CSV content
    let csv = "";

    // Blood Donors Section
    csv += "=== BLOOD DONORS ===\r\n";
    csv += "Full Name,Blood Type,Age,City,Gender,Is Diabetic,Is Smoker,Approval Status,Registered At\r\n";
    (bloodDonors || []).forEach((d: any) => {
      csv += `"${d.full_name || ''}","${d.blood_type || ''}","${d.age || ''}","${d.city || ''}","${d.gender || ''}","${d.is_diabetic ? 'Yes' : 'No'}","${d.is_smoker ? 'Yes' : 'No'}","${d.approval_status || 'pending'}","${d.created_at ? new Date(d.created_at).toLocaleDateString() : ''}"\r\n`;
    });

    // Organ Donors Section
    csv += "\r\n=== ORGAN DONORS ===\r\n";
    csv += "Full Name,Blood Type,Age,City,Gender,Medical Conditions,Organ Type,Approval Status,Registered At\r\n";
    (organDonors || []).forEach((d: any) => {
      csv += `"${d.full_name || ''}","${d.blood_type || ''}","${d.age || ''}","${d.city || ''}","${d.gender || ''}","${d.medical_conditions || 'None'}","${d.organ_type || ''}","${d.approval_status || 'pending'}","${d.created_at ? new Date(d.created_at).toLocaleDateString() : ''}"\r\n`;
    });

    // Hospitals Section
    csv += "\r\n=== HOSPITALS ===\r\n";
    csv += "Hospital Name,City,Type,Specialization,Verified,Approval Status,Registered At\r\n";
    (hospitals || []).forEach((h: any) => {
      csv += `"${h.hospital_name || ''}","${h.city || ''}","${h.hospital_type || ''}","${h.specialization || ''}","${h.is_verified ? 'Yes' : 'No'}","${h.approval_status || 'pending'}","${h.created_at ? new Date(h.created_at).toLocaleDateString() : ''}"\r\n`;
    });

    const filename = `OPAL-AI-Dataset-${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
