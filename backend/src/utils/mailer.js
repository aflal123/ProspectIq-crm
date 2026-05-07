const nodemailer = require('nodemailer');
const axios = require('axios');

// Startup check for credentials
if (!process.env.EMAIL_USER && !process.env.BREVO_API_KEY) {
  console.warn('⚠️ WARNING: No email credentials set!');
}

const sendOTPEmail = async (toEmail, otp) => {
  // 1. If BREVO_API_KEY is set, use the professional API (Always works in Cloud)
  if (process.env.BREVO_API_KEY) {
    try {
      await axios.post('https://api.brevo.com/v3/smtp/email', {
        sender: { name: "ProspectIQ", email: process.env.EMAIL_USER || "noreply@prospectiq.com" },
        to: [{ email: toEmail }],
        subject: "Your ProspectIQ Login OTP",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 420px; margin: auto; padding: 20px; border: 1px solid #E5E5E5;">
            <h2 style="color: #2563eb;">ProspectIQ</h2>
            <p>Your login code is:</p>
            <h1 style="letter-spacing: 10px; font-size: 32px; text-align: center;">${otp}</h1>
            <p style="color: #666;">This code expires in 5 minutes.</p>
          </div>
        `
      }, {
        headers: { 'api-key': process.env.BREVO_API_KEY, 'Content-Type': 'application/json' }
      });
      console.log(`✅ Brevo API: OTP sent to ${toEmail}`);
      return;
    } catch (err) {
      console.error('❌ Brevo API failed:', err.response?.data || err.message);
      throw new Error('Email API failed: ' + (err.response?.data?.message || err.message));
    }
  }

  // 2. Fallback to Gmail SMTP (Works for Localhost)
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    timeout: 5000
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `"ProspectIQ" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Your ProspectIQ Login OTP',
    html: `<p>Your login code is: <b>${otp}</b></p>`
  });
  console.log(`✅ SMTP: OTP sent to ${toEmail}`);
};

module.exports = { sendOTPEmail };