import { sendEmail } from "@/lib/mailer";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, hospital_name, status } = await request.json();

    if (!email || !hospital_name || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const isApproved = status === "approved";

    await sendEmail({
      to: email,
      subject: isApproved 
        ? `Verification Approved: ${hospital_name}` 
        : `Registration Update: ${hospital_name}`,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #0a0a0a; color: #ffffff; border-radius: 16px; border: 1px solid #1a1a1a;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #dc2626; font-size: 28px; margin: 0;">OPAL-AI</h1>
            <p style="color: #6b7280; font-size: 14px;">Institutional Notifications</p>
          </div>

          <h2 style="color: ${isApproved ? '#16a34a' : '#dc2626'}; text-align: center;">Registration ${isApproved ? 'Approved' : 'Rejected'}</h2>
          
          <p style="color: #9ca3af; line-height: 1.6;">Hello,</p>
          <p style="color: #9ca3af; line-height: 1.6;">This is an automated notification regarding the registration of <strong>${hospital_name}</strong>.</p>
          
          <div style="padding: 24px; background-color: #1a1a1a; border-radius: 12px; margin: 24px 0; border: 1px solid #1f2937;">
            <p style="margin: 0; font-weight: bold; font-size: 18px; color: ${isApproved ? '#16a34a' : '#dc2626'};">
              Status: ${isApproved ? 'APPROVED' : 'REJECTED'}
            </p>
          </div>

          ${isApproved 
            ? `<p style="color: #9ca3af; line-height: 1.6;">Your hospital has been verified. You can now log in to the Control Room and access real-time donor matching.</p>
               <div style="text-align: center; margin-top: 32px;">
                 <a href="${process.env.NEXT_PUBLIC_SITE_URL}/auth/login" style="background-color: #dc2626; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Access Dashboard</a>
               </div>`
            : `<p style="color: #9ca3af; line-height: 1.6;">Unfortunately, your registration could not be verified at this time. This may be due to incomplete licensing documentation or a failure to meet our surgical protocol requirements.</p>
               <p style="color: #6b7280; line-height: 1.6; font-size: 14px;">If you believe this is an error, please contact our support team.</p>`
          }

          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #1f2937; text-align: center;">
            <p style="font-size: 12px; color: #4b5563;">OPAL-AI Secure Medical Network &copy; 2026<br/>Saving Lives Through AI Logistics</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
