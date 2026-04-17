import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { donorFormSchema } from "@/lib/schemas/donor";
import { sendDonorWelcomeEmail } from "@/lib/mailer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 1. Validation
    const result = donorFormSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ 
        success: false, 
        error: "Validation failed", 
        details: result.error.flatten().fieldErrors 
      }, { status: 400 });
    }

    const data = result.data;
    const adminSupabase = getServiceSupabase();
    
    // 2. Security Check: Duplicate Email
    const { data: existingUsersData } = await adminSupabase.auth.admin.listUsers();
    if (existingUsersData?.users.some(u => u.email === data.email)) {
      return NextResponse.json({ success: false, error: "An account already exists with this email address." }, { status: 409 });
    }

    // 3. Create Auth User
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        first_name: data.firstName,
        last_name: data.lastName,
        role: 'donor'
      }
    });

    if (authError) throw authError;
    const userId = authData.user?.id;
    if (!userId) throw new Error("Auth storage failed: User ID not generated");

    // 4. Create Profile (The Source of Truth for Roles)
    const { error: profileError } = await adminSupabase.from('profiles').insert([{
      id: userId,
      email: data.email,
      role: 'donor',
      full_name: `${data.firstName} ${data.lastName}`
    }]);

    if (profileError) throw profileError;

    // 5. Targeted Data Entry (No Ghost Tables)
    const fullName = `${data.firstName} ${data.lastName}`;
    
    // Blood Branch
    if (data.donationType === "Blood Donation Only" || data.donationType === "Both") {
       const { error: bError } = await adminSupabase.from('blood_donors').insert([{
        user_id: userId,
        full_name: fullName,
        email: data.email,
        phone: data.contactNumber,
        age: data.age,
        gender: data.gender,
        blood_type: data.bloodType,
        cnic: data.cnic,
        hepatitis_status: data.hepStatus,
        medical_conditions: data.medicalConditions,
        city: data.city,
        latitude: data.latitude,
        longitude: data.longitude,
        is_available: true,
        approval_status: 'pending'
      }]);
      if (bError) throw bError;
    }

    // Organ Branch
    if (data.donationType === "Organ Donation Only" || data.donationType === "Both") {
       const { error: oError } = await adminSupabase.from('organ_donors').insert([{
        user_id: userId,
        full_name: fullName,
        email: data.email,
        phone: data.contactNumber,
        age: data.age,
        gender: data.gender,
        blood_type: data.bloodType,
        cnic: data.cnic,
        organs_available: data.organsWilling || [],
        hiv_status: data.hivStatus,
        hepatitis_status: data.hepStatus,
        diabetes: data.diabetes === "Yes",
        smoker: data.smoker === "Yes",
        height_cm: data.height,
        weight_kg: data.weight,
        is_living_donor: data.donorStatus === "Living",
        next_of_kin_name: data.nextOfKinName,
        next_of_kin_contact: data.nextOfKinContact,
        consent_given: !!data.consent,
        city: data.city,
        latitude: data.latitude,
        longitude: data.longitude,
        is_available: true,
        approval_status: 'pending'
      }]);
      if (oError) throw oError;
    }

    // 6. Communication logic
    try {
      await sendDonorWelcomeEmail(data.email, fullName, data.bloodType);
    } catch (e) {
      console.error("Delayed Notification Warning: Welcome email could not be sent.", e);
    }

    return NextResponse.json({ 
      success: true, 
      message: "Donor account established. Your application is now in the verification queue.",
      redirect: "/auth/pending-approval"
    }, { status: 201 });

  } catch (error: any) {
    console.error("CRITICAL REGISTRATION FAILURE:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
