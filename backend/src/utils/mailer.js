const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 5000,
  greetingTimeout: 5000,
  socketTimeout: 5000,
});

const sendOTPEmail = async (toEmail, otp) => {
  const mailOptions = {
    from: `"ProspectIQ" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
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
};

module.exports = { sendOTPEmail };