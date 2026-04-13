import { NextResponse } from "next/server";
import { sendHospitalRegistrationEmail } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const { email, hospitalName, license } = await req.json();

    if (!email || !hospitalName || !license) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await sendHospitalRegistrationEmail(email, hospitalName, license);

    return NextResponse.json({ success: true, message: "Hospital notification sent" });
  } catch (error: any) {
    console.error("Email API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
