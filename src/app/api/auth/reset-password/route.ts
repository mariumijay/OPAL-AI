import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { token, email, newPassword } = await req.json();

    if (!token || !email || !newPassword) {
      return NextResponse.json(
        { error: "All fields required" },
        { status: 400 }
      );
    }

    const supabaseAdmin = getServiceSupabase();

    // Verify token
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from("password_reset_tokens")
      .select("*")
      .eq("token", token)
      .eq("email", email)
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { error: "Invalid or expired reset link" },
        { status: 400 }
      );
    }

    // Check expiry
    if (new Date(tokenData.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Reset link has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Get user ID by email
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    const user = users?.users.find(u => u.email === email);

    if (listError || !user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Update password in Supabase Auth
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error("Update Error:", updateError);
      return NextResponse.json(
        { error: "Failed to update password" },
        { status: 500 }
      );
    }

    // Delete used token
    await supabaseAdmin
      .from("password_reset_tokens")
      .delete()
      .eq("token", token);

    return NextResponse.json(
      { message: "Password updated successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
