const nodemailer = require('nodemailer');

// Values from .env.local
const GMAIL_USER = 'ranahaseeb9427@gmail.com';
const GMAIL_APP_PASSWORD = 'cijbxyihqiseklhr'; // Removed spaces

async function testEmail() {
  console.log('Using Gmail User:', GMAIL_USER);
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  });

  try {
    console.log('Attempting to send email...');
    const info = await transporter.sendMail({
      from: `"OPAL-AI Test" <${GMAIL_USER}>`,
      to: GMAIL_USER, // Send to self
      subject: 'Test Email from OPAL-AI (No Spaces)',
      text: 'If you receive this, your Gmail SMTP configuration is working without spaces!',
    });
    console.log('Email sent successfully:', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

testEmail();
