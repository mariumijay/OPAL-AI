import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { sendPasswordResetEmail } from "@/lib/mailer";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const supabaseAdmin = getServiceSupabase();

    // Verify user exists
    const { data: user, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = user?.users.find(u => u.email === email);

    if (userError || !existingUser) {
      // Security best practice: don't reveal if user exists
      return NextResponse.json(
        { message: "If an account exists with this email, a reset link has been sent." },
        { status: 200 }
      );
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store token in Supabase
    const { error: dbError } = await supabaseAdmin
      .from("password_reset_tokens")
      .upsert({
        email,
        token: resetToken,
        expires_at: expiresAt.toISOString(),
      }, { onConflict: 'email' });

    if (dbError) {
      console.error("DB Error:", dbError);
      return NextResponse.json(
        { error: "Failed to generate reset token" },
        { status: 500 }
      );
    }

    // Build reset link
    const resetLink = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // Send email via Nodemailer
    try {
      console.log(`Attempting to send reset email to: ${email}`);
      await sendPasswordResetEmail(email, resetLink);
      console.log("Email sent successfully!");
    } catch (mailError) {
      console.error("Nodemailer Error:", mailError);
      return NextResponse.json(
        { error: "Failed to send email. Institutional mail server returned an error." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Reset link sent to your email" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
