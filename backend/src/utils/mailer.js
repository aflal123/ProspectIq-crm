const { Resend } = require('resend');

const sendOTPEmail = async (toEmail, otp) => {
  const rawKey = process.env.RESEND_API_KEY || '';
  const cleanKey = rawKey.split('=')[0].split(' ')[0].trim();
  const resend = new Resend(cleanKey);

  try {
    // Attempt with your Professional Custom Domain
    const { data, error } = await resend.emails.send({
      from: 'ProspectIQ <auth@contact.prospectiq.online>',
      to: [toEmail],
      subject: `${otp} is your verification code`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>ProspectIQ Verification</h2>
          <p>Your one-time code is:</p>
          <h1 style="color: #2563eb; letter-spacing: 4px;">${otp}</h1>
          <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
        </div>
      `,
    });

    if (error) {
      console.error('❌ Resend API Error:', error.message);
      
      // Fallback to onboarding sender if custom domain isn't ready
      const fallback = await resend.emails.send({
        from: 'ProspectIQ <onboarding@resend.dev>',
        to: [toEmail],
        subject: `${otp} is your verification code`,
        html: `<p>Your verification code is <strong>${otp}</strong></p>`,
      });
      
      if (fallback.error) {
        console.error('❌ Fallback failed:', fallback.error.message);
        return;
      }
      
      console.log('✅ Sent via Fallback [ID:', fallback.data.id, ']');
      return fallback.data;
    }

    console.log('✅ Sent via Custom Domain [ID:', data.id, ']');
    return data;
  } catch (err) {
    console.error('❌ Mailer Crash:', err.message);
  }
};

module.exports = { sendOTPEmail };