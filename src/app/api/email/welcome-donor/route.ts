import { NextResponse } from "next/server";
import { sendDonorWelcomeEmail } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const { email, name, bloodType } = await req.json();

    if (!email || !name || !bloodType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await sendDonorWelcomeEmail(email, name, bloodType);

    return NextResponse.json({ success: true, message: "Welcome email sent" });
  } catch (error: any) {
    console.error("Email API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
