const nodemailer = require('nodemailer');

// Startup check for credentials
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.warn('⚠️ WARNING: EMAIL_USER or EMAIL_PASS is not set. OTP emails will fail to send!');
}

const transporter = nodemailer.createTransport({
  service: 'gmail', // Using the built-in service helper for Gmail
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false // Helps with some network/domain restrictions
  }
});

const sendOTPEmail = async (toEmail, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || `"ProspectIQ" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Your ProspectIQ Login OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 420px; margin: auto; background-color: #ffffff; border: 1px solid #E5E5E5;">
        <div style="background-color: #2563eb; padding: 24px 32px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 2px;">ProspectIQ</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0 0; font-size: 12px;">CRM for modern sales teams</p>
        </div>
        <div style="padding: 32px;">
          <p style="color: #333333; font-size: 15px; margin: 0 0 24px 0;">Your one-time login code is:</p>
          <div style="background-color: #F5F5F5; border: 1px solid #E5E5E5; padding: 20px; text-align: center; margin-bottom: 24px;">
            <h2 style="color: #000000; font-size: 36px; letter-spacing: 12px; margin: 0; font-weight: 700;">${otp}</h2>
          </div>
          <p style="color: #666666; font-size: 13px; margin: 0 0 8px 0;">⏱ This code expires in <strong style="color: #000000;">5 minutes</strong>.</p>
          <p style="color: #666666; font-size: 13px; margin: 0;">If you didn't request this, you can safely ignore this email.</p>
        </div>
        <div style="background-color: #F5F5F5; padding: 16px 32px; border-top: 1px solid #E5E5E5;">
          <p style="color: #999999; font-size: 11px; margin: 0; text-align: center;">© 2026 ProspectIQ · All rights reserved</p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
  console.log(`✅ OTP Email sent successfully to: ${toEmail}`);
};

module.exports = { sendOTPEmail };