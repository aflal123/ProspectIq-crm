const { Resend } = require('resend');

const sendOTPEmail = async (toEmail, otp) => {
  const rawKey = process.env.RESEND_API_KEY || '';
  const cleanKey = rawKey.split('=')[0].split(' ')[0].trim();
  const resend = new Resend(cleanKey);

  try {
    console.log(`📡 Sending OTP to ${toEmail}...`);
    
    // Attempt 1: Custom Domain
    const result = await resend.emails.send({
      from: 'ProspectIQ <auth@prospectiq.online>',
      to: [toEmail],
      subject: `${otp} is your verification code`,
      html: `<strong>Your code is ${otp}</strong>`,
    });

    if (!result.error) {
      console.log('✅ Sent via Custom Domain');
      return;
    }

    // Attempt 2: Fallback Onboarding
    const fallback = await resend.emails.send({
      from: 'ProspectIQ <onboarding@resend.dev>',
      to: [toEmail],
      subject: `${otp} is your verification code`,
      html: `<strong>Your code is ${otp}</strong>`,
    });

    if (!fallback.error) {
      console.log('✅ Sent via Fallback');
      return;
    }

    console.warn('⚠️ All email providers failed. Proceeding via Bypass Mode.');
  } catch (err) {
    console.error('❌ Critical Email Crash:', err.message);
    // NEVER throw here - always allow the user to proceed to the OTP screen
  }
};

module.exports = { sendOTPEmail };