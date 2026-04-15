import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client for backend tasks (Using Service Key to bypass RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { matchId, donorId, hospitalId, hospitalName } = body;

    if (!matchId || !donorId) {
      return NextResponse.json({ error: "Missing required tracking IDs" }, { status: 400 });
    }

    // 1. Update Match Status in Database
    const { error: dbError } = await supabase
      .from("match_results")
      .update({ status: "approved" })
      .eq("id", matchId);

    if (dbError) throw dbError;

    // 2. Fetch Contact Info (Mocked Email trigger setup for Demo)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // 3. Send Email Dispatch
    // In production, we fetch donor.email. Defaulting to GMAIL_USER for testing demo.
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: process.env.GMAIL_USER, // Routing to admin email so user can see it in their inbox during FYP demo
        subject: `[URGENT] OPAL-AI Match Procurement Request`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
                <h1 style="color: #6366f1; text-align: center;">OPAL-AI Dispatch System</h1>
                <p>Hello,</p>
                <p>A priority procurement request has been initiated by <b>${hospitalName || 'Verified Facility'}</b>.</p>
                <p><strong>Match Reference ID:</strong> ${matchId}</p>
                <p>Please log in to your portal immediately to review the emergency medical protocol requirements and consent details.</p>
                <div style="text-align: center; margin-top: 30px;">
                    <a href="http://localhost:3000/dashboard/donor" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Access Portal</a>
                </div>
                <hr style="margin-top: 30px; border: none; border-top: 1px solid #e2e8f0;" />
                <p style="font-size: 12px; color: #94a3b8; text-align: center;">This is an automated priority dispatch from OPAL-AI.</p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: "Procurement Initiated & Dispatched" }, { status: 200 });
  } catch (error: any) {
    console.error("Procurement API Error:", error);
    return NextResponse.json(
      { error: "Failed to process procurement logic." },
      { status: 500 }
    );
  }
}
