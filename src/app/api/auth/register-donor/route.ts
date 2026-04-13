import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase, getServiceSupabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/mailer";
import { geocodeCity } from "@/lib/geocode";
import { donorFormSchema, type DonorFormValues } from "@/lib/schemas/donor";


interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  userId?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const body: unknown = await request.json();
    
    // Validate with Zod
    const validation = donorFormSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        success: false, 
        error: "Validation failed", 
      }, { status: 400 });
    }

    const { 
      email, password, firstName, lastName, age, gender, city, contactNumber, 
      bloodType, hepStatus, hivStatus, diabetes, smoker, medications, 
      medicalConditions, height, weight, donorStatus, organsWilling, 
      donatingItems, nextOfKinName, nextOfKinContact, consent, donationType 
    } = validation.data;

    // 1. Create User via Admin API
    const adminSupabase = getServiceSupabase();
    let authData;
    try {
        const result = await adminSupabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { first_name: firstName, last_name: lastName, role: 'donor' }
        });
        if (result.error) throw result.error;
        authData = result.data;
    } catch (e: any) {
        throw new Error(`AUTH_STEP_FAILED: ${e.message}`);
    }
 
    const userId = authData.user?.id;
    if (!userId) throw new Error("AUTH_ID_MISSING");
 
    // Small delay to ensure DB replication
    await new Promise(resolve => setTimeout(resolve, 500));

    // Geocode city (Hardcoded to avoid external fetch for now)
    const lat = 31.5204;
    const lon = 74.3587;
    const fullName = `${firstName} ${lastName}`;

    // 2. Insert into Central 'donors' table
    try {
        const birthDate = new Date(new Date().getFullYear() - age, 0, 1).toISOString().split('T')[0];
        const { error: centralErr } = await adminSupabase.from('donors').insert([{
            user_id: userId,
            first_name: firstName,
            last_name: lastName,
            birth_date: birthDate,
            city: city,
            latitude: lat,
            longitude: lon,
            blood_type: bloodType,
            contact_number: contactNumber,
            gender: gender,
            is_blood_donor: donationType === "Blood Donation Only" || donationType === "Both",
            is_organ_donor: donationType === "Organ Donation Only" || donationType === "Both",
            status: 'active',
            created_at: new Date().toISOString()
        }]);
        if (centralErr) throw centralErr;
    } catch (e: any) {
        throw new Error(`CENTRAL_DB_STEP_FAILED: ${e.message}`);
    }

    // 3. Insert into separate tables
    if (donationType === "Blood Donation Only" || donationType === "Both") {
        try {
            const { error: bloodErr } = await adminSupabase.from('blood_donors').insert([{
                user_id: userId,
                full_name: fullName,
                email: email,
                phone: contactNumber,
                age: age,
                blood_type: bloodType,
                hepatitis_status: hepStatus,
                medical_conditions: medicalConditions || null,
                city: city,
                latitude: lat,
                longitude: lon,
                is_available: true
            }]);
            if (bloodErr) throw bloodErr;
        } catch (e: any) {
            throw new Error(`BLOOD_DB_STEP_FAILED: ${e.message}`);
        }
    }

    if (donationType === "Organ Donation Only" || donationType === "Both") {
        try {
            const { error: organErr } = await adminSupabase.from('organ_donors').insert([{
                user_id: userId,
                full_name: fullName,
                email: email,
                phone: contactNumber,
                age: age,
                blood_type: bloodType,
                organs_available: organsWilling || [],
                hiv_status: hivStatus || 'Negative',
                hepatitis_status: hepStatus,
                diabetes: diabetes === "Yes",
                smoker: smoker === "Yes",
                height_cm: height || null,
                weight_kg: weight || null,
                is_living_donor: donorStatus === "Living",
                next_of_kin_name: nextOfKinName || '—',
                next_of_kin_contact: nextOfKinContact || '—',
                consent_given: !!consent,
                city: city,
                latitude: lat,
                longitude: lon,
                is_available: true
            }]);
            if (organErr) throw organErr;
        } catch (e: any) {
            throw new Error(`ORGAN_DB_STEP_FAILED: ${e.message}`);
        }
    }

    /* Email Temporarily Disabled to isolate crash
    await sendEmail({ ... });
    */

    return NextResponse.json({ 
      success: true, 
      message: "Registration successful. Your account is now active.", 
      userId 
    }, { status: 201 });

  } catch (error: any) {
    console.error("DONOR REGISTRATION CRITICAL ERROR:", error);
    const message = error.message || "Something went wrong";
    
    return NextResponse.json({ 
      success: false, 
      error: `SERVER_ERROR: ${message}`,
      details: typeof error.details === 'string' ? error.details : "Internal details logged to console"
    }, { status: 500 });
  }
}
