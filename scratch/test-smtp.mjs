import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'ranahaseeb9427@gmail.com',
    pass: 'cijbxyihqiseklhr',
  },
});

console.log('Testing SMTP connection...');

try {
  await transporter.verify();
  console.log('✅ SMTP Connection: SUCCESS - Server ready!');

  const info = await transporter.sendMail({
    from: '"OPAL-AI Support" <ranahaseeb9427@gmail.com>',
    to: 'ranahaseeb9427@gmail.com',
    subject: 'OPAL-AI Email System Test',
    html: '<h1 style="color:#DC2626">OPAL-AI Email Working!</h1><p>Your email system is configured correctly.</p>',
  });

  console.log('✅ Email Sent! Message ID:', info.messageId);
} catch (error) {
  console.error('❌ SMTP Error:', error.message);
  console.error('Full Error:', error);
}
