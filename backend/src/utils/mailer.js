const { Resend } = require('resend');
const axios = require('axios');
const nodemailer = require('nodemailer');

const sendOTPEmail = async (toEmail, otp) => {
  // 1. Primary Choice: BREVO API (Allows sending to anyone instantly)
  if (process.env.BREVO_API_KEY) {
    try {
      await axios.post('https://api.brevo.com/v3/smtp/email', {
        sender: { name: "ProspectIQ", email: "noreply@prospectiq.com" },
        to: [{ email: toEmail }],
        subject: "Your ProspectIQ Login OTP",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>ProspectIQ</h2>
            <p>Your login code is: <strong style="font-size: 24px;">${otp}</strong></p>
            <p>This code will expire in 5 minutes.</p>
          </div>
        `
      }, {
        headers: { 'api-key': process.env.BREVO_API_KEY, 'Content-Type': 'application/json' }
      });
      console.log(`✅ Brevo: OTP sent to ${toEmail}`);
      return;
    } catch (err) {
      console.error('❌ Brevo failed:', err.response?.data?.message || err.message);
    }
  }

  // 2. Secondary Choice: RESEND API
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'ProspectIQ <onboarding@resend.dev>',
        to: toEmail,
        subject: 'Your ProspectIQ Login OTP',
        html: `<strong>Your login code is: ${otp}</strong>`,
      });
      console.log(`✅ Resend: OTP sent to ${toEmail}`);
      return;
    } catch (err) {
      console.error('❌ Resend failed:', err.message);
    }
  }

  // 3. Last Resort: Gmail SMTP (Local)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });

  await transporter.sendMail({
    from: `"ProspectIQ" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Your ProspectIQ Login OTP',
    html: `<p>Your login code is: <b>${otp}</b></p>`
  });
  console.log(`✅ SMTP: OTP sent to ${toEmail}`);
};

module.exports = { sendOTPEmail };