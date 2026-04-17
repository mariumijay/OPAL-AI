import { createServerSupabase, getServiceSupabase } from "@/lib/supabase";
import { sendApprovalEmail } from "@/lib/mailer";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = await createServerSupabase(cookieStore);
  const adminClient = getServiceSupabase();

  try {
    // 1. Authorization Audit
    const { data: { user } } = await supabase.auth.getUser();
    const isAdmin = user?.user_metadata?.role === "admin" || user?.email === "ranahaseeb9427@gmail.com";
    
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized: Administrator credentials required." }, { status: 403 });
    }

    const { user_id, user_type, email } = await request.json();

    if (!user_id || !user_type) {
      return NextResponse.json({ error: "Missing Target Identity: user_id and user_type required." }, { status: 400 });
    }

    // 2. Transactional Update Strategy
    // Phase A: Update Specialized Tables
    const table = user_type === 'hospital' 
      ? 'hospitals' 
      : (user_type === 'blood_donor' ? 'blood_donors' : 'organ_donors');
    
    const updatePayload: any = { 
      approval_status: 'approved',
    };
    
    if (user_type === 'hospital') {
      updatePayload.is_verified = true;
    }

    const { error: tableError } = await adminClient
      .from(table)
      .update(updatePayload)
      .eq('user_id', user_id); 

    if (tableError) throw new Error(`Specialized Table Update Failed: ${tableError.message}`);

    // Phase B: Update Profile Role (Sync with Auth logic)
    const newRole = user_type === 'hospital' ? 'hospital' : 'donor';
    const { error: profileError } = await adminClient
      .from('profiles')
      .update({ role: newRole })
      .eq('id', user_id);

    if (profileError) throw new Error(`Profile Role Sync Failed: ${profileError.message}`);

    // Phase C: Update Auth User Metadata (For session persistence)
    const { error: authUpdateError } = await adminClient.auth.admin.updateUserById(user_id, {
      user_metadata: {
        role: newRole,
        is_verified: true,
        approval_status: 'approved',
      }
    });

    if (authUpdateError) throw new Error(`Auth Metadata Sync Failed: ${authUpdateError.message}`);

    // 3. Optional Notification Dispatch
    try {
      if (email) {
        await sendApprovalEmail(email, user_type.replace('_', ' '));
      }
    } catch (emailError) {
      console.error("Critical: User approved but notification failed.", emailError);
      return NextResponse.json({ 
        success: true, 
        warning: "System updated successfully, but notification email was blocked." 
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: `${user_type.toUpperCase()} verified and role permissions updated.` 
    });

  } catch (error: any) {
    console.error("ADMIN CLINICAL APPROVAL FAILURE:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
