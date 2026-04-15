// Live test for toggle-donor email notification
// Run: node scratch/test-toggle-email.mjs <donor_id> <type: blood|organ>

import nodemailer from 'nodemailer';

const GMAIL_USER = 'ranahaseeb9427@gmail.com';
const GMAIL_PASS = 'cijbxyihqiseklhr';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: { user: GMAIL_USER, pass: GMAIL_PASS },
});

// Simulate what the backend does for Suspension email
async function testSuspensionEmail(toEmail, donorName) {
  console.log(`\n📧 Sending SUSPENSION email to: ${toEmail}`);
  try {
    const info = await transporter.sendMail({
      from: `"OPAL-AI Support" <${GMAIL_USER}>`,
      to: toEmail,
      subject: 'Urgent: Account Status Update | OPAL-AI',
      html: `
        <div style="background:#050505;padding:40px;font-family:sans-serif">
          <h1 style="color:#DC2626">Account Suspended</h1>
          <p style="color:#9ca3af">Dear ${donorName},</p>
          <p style="color:#9ca3af">Your donor profile has been temporarily suspended.</p>
          <div style="background:#1a1a1a;border:1px solid #ef4444;padding:20px;border-radius:8px;margin:20px 0">
            <p style="color:#ef4444;font-weight:bold">Reason: Administrative Protocol Review</p>
          </div>
          <p style="color:#6b7280;font-size:12px">© 2026 OPAL-AI Platform</p>
        </div>
      `
    });
    console.log('✅ Suspension email sent! ID:', info.messageId);
  } catch (err) {
    console.error('❌ Suspension email FAILED:', err.message);
  }
}

// Simulate Reactivation email
async function testActivationEmail(toEmail, donorName) {
  console.log(`\n📧 Sending ACTIVATION email to: ${toEmail}`);
  try {
    const info = await transporter.sendMail({
      from: `"OPAL-AI Support" <${GMAIL_USER}>`,
      to: toEmail,
      subject: 'Account Re-Activated! | OPAL-AI',
      html: `
        <div style="background:#050505;padding:40px;font-family:sans-serif">
          <h1 style="color:#22c55e">Account Re-Activated!</h1>
          <p style="color:#9ca3af">Great news, ${donorName}!</p>
          <p style="color:#9ca3af">Your donor profile has been re-activated. You are now visible in our life-saving matching network.</p>
          <p style="color:#6b7280;font-size:12px">© 2026 OPAL-AI Platform</p>
        </div>
      `
    });
    console.log('✅ Activation email sent! ID:', info.messageId);
  } catch (err) {
    console.error('❌ Activation email FAILED:', err.message);
  }
}

// Test both with your own email as recipient
const TEST_EMAIL = GMAIL_USER;
const TEST_NAME = 'Test Donor';

await testSuspensionEmail(TEST_EMAIL, TEST_NAME);
await new Promise(r => setTimeout(r, 2000));
await testActivationEmail(TEST_EMAIL, TEST_NAME);

console.log('\n✅ Test complete. Check your Gmail inbox + spam folder.');
