const { Resend } = require('resend');

/**
 * Pure Resend Email Engine
 * Optimized for prospectiq.online production launch
 */
const sendOTPEmail = async (toEmail, otp) => {
  // 1. Sanitize the API Key (Remove any glued text from Railway)
  const rawKey = process.env.RESEND_API_KEY || '';
  const cleanKey = rawKey.split('=')[0].split(' ')[0].trim();
  
  const resend = new Resend(cleanKey);

  try {
    console.log(`📡 Resend: Sending OTP to ${toEmail}...`);
    
    const { data, error } = await resend.emails.send({
      from: 'ProspectIQ <onboarding@contact.prospectiq.online>',
      to: [toEmail],
      subject: `${otp} is your verification code`,
      html: `
        <div style="font-family: sans-serif; max-width: 400px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
          <h2 style="color: #2563eb; margin-top: 0;">ProspectIQ</h2>
          <p style="font-size: 16px; color: #333;">Your one-time verification code is:</p>
          <div style="background: #f8fafc; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #000;">${otp}</span>
          </div>
          <p style="font-size: 14px; color: #64748b;">This code will expire in 10 minutes.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">&copy; 2026 ProspectIQ CRM. All rights reserved.</p>
        </div>
      `,
    });

    if (error) {
      console.error('❌ Resend API Error:', error.message);
      return null;
    }

    console.log('✅ Email Sent Successfully [ID:', data.id, ']');
    return data;
  } catch (err) {
    console.error('❌ Resend SDK Crash:', err.message);
    return null;
  }
};

module.exports = { sendOTPEmail };