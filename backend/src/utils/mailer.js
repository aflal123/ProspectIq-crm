const { Resend } = require('resend');
const axios = require('axios');
const nodemailer = require('nodemailer');

const sendOTPEmail = async (toEmail, otp) => {
  // 1. Primary: BREVO API
  if (process.env.BREVO_API_KEY) {
    try {
      await axios.post('https://api.brevo.com/v3/smtp/email', {
        sender: { name: "ProspectIQ", email: "ahamedaflal100@gmail.com" },
        to: [{ email: toEmail }],
        subject: `${otp} is your code`,
        htmlContent: `<p>Hello, your verification code is <b>${otp}</b>. It expires in 5 minutes.</p>`
      }, {
        headers: { 
          'api-key': process.env.BREVO_API_KEY,
          'x-sib-api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json' 
        }
      });
      console.log(`✅ Brevo: OTP sent to ${toEmail}`);
      return;
    } catch (err) {
      console.error('❌ Brevo API Error:', err.response?.data || err.message);
      throw err;
    }
  }

  // 2. Secondary: RESEND API
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'ProspectIQ <onboarding@resend.dev>',
        to: toEmail,
        subject: `${otp} is your code`,
        html: `<strong>Your code is ${otp}</strong>`,
      });
      console.log(`✅ Resend: OTP sent to ${toEmail}`);
      return;
    } catch (err) {
      console.error('❌ Resend failed:', err.message);
    }
  }

  // 3. Fallback: Gmail SMTP
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });

  await transporter.sendMail({
    from: `"ProspectIQ" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `${otp} is your code`,
    html: `<p>Your code is <b>${otp}</b></p>`
  });
  console.log(`✅ SMTP: OTP sent to ${toEmail}`);
};

module.exports = { sendOTPEmail };