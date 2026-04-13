import { sendEmail } from "@/lib/mailer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email || typeof email !== "string") {
      return Response.json(
        { success: false, error: "A valid email address is required." },
        { status: 400 }
      );
    }

    await sendEmail({
      to: email,
      subject: "Welcome to OPAL-AI – Verify Your Email",
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #0a0a0a; color: #ffffff; border-radius: 16px; border: 1px solid #1a1a1a;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #dc2626; font-size: 28px; margin: 0;">OPAL-AI</h1>
            <p style="color: #6b7280; font-size: 14px;">Onboarding Team</p>
          </div>
          
          <h2 style="color: #ffffff; font-size: 22px;">Hello ${name || "New Member"},</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #9ca3af;">Welcome to OPAL-AI. We are excited to have you join our life-saving mission.</p>
          <p style="font-size: 16px; line-height: 1.6; color: #9ca3af;">Please ensure your profile is complete so that our AI can accurately match you with donors or recipients in need.</p>
          
          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #1f2937; text-align: center;">
            <p style="font-size: 12px; color: #4b5563;">OPAL-AI Secure Medical Network &copy; 2026<br/>Saving Lives Through AI Logistics</p>
          </div>
        </div>
      `,
    });

    return Response.json({ success: true }, { status: 200 });
  } catch (err: unknown) {
    return Response.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
