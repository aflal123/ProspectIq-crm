const nodemailer = require('nodemailer');

const sendOTPEmail = async (toEmail, otp) => {
  try {
    // Port 465 is the industry standard for SSL. It bypasses many cloud firewalls.
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // Use SSL
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      connectionTimeout: 10000, // 10 seconds
    });

    await transporter.sendMail({
      from: `"ProspectIQ" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `${otp} is your verification code`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>ProspectIQ Verification</h2>
          <p>Your code is: <strong style="font-size: 24px;">${otp}</strong></p>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `
    });

    console.log(`✅ Gmail SSL: OTP sent to ${toEmail}`);
    return;
  } catch (err) {
    console.error('❌ Gmail SSL Failed:', err.message);
    
    // If we are in bypass mode, don't crash the whole login if email fails
    if (process.env.ENABLE_BYPASS === 'true') {
      console.log('⚠️ Bypass enabled: Proceeding despite email failure.');
      return;
    }
    
    throw new Error('Email service currently unavailable. Please try again later.');
  }
};

module.exports = { sendOTPEmail };