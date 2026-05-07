const { Resend } = require('resend');

const sendOTPEmail = async (toEmail, otp) => {
  // 1. Professional Choice: RESEND (Now using your custom domain!)
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      // Using your new professional subdomain
      const { data, error } = await resend.emails.send({
        from: 'ProspectIQ <auth@contact.prospectiq.online>',
        to: toEmail,
        subject: `${otp} is your verification code`,
        html: `
          <div style="font-family: sans-serif; max-width: 400px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
            <h2 style="color: #2563eb; margin-top: 0;">ProspectIQ</h2>
            <p style="font-size: 16px; color: #333;">Your one-time verification code is:</p>
            <div style="background: #f8fafc; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #000;">${otp}</span>
            </div>
            <p style="font-size: 14px; color: #64748b;">This code will expire in 5 minutes. If you didn't request this, please ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">&copy; 2026 ProspectIQ CRM. All rights reserved.</p>
          </div>
        `,
      });
      
      if (error) {
        console.error('❌ Resend API Error:', error);
        throw new Error(error.message);
      }
      
      console.log(`✅ Production Email Sent: ${toEmail} [ID: ${data.id}]`);
      return;
    } catch (err) {
      console.error('❌ Email Failed:', err.message);
      
      // Keep bypass as a fallback only if explicitly enabled in env
      if (process.env.ENABLE_BYPASS === 'true') {
        return;
      }
      throw err;
    }
  }
  
  throw new Error('Email service configuration missing.');
};

module.exports = { sendOTPEmail };