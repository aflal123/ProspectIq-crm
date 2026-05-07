const { Resend } = require('resend');

const sendOTPEmail = async (toEmail, otp) => {
  const cleanKey = (process.env.RESEND_API_KEY || '').split('=')[0].split(' ')[0].trim();
  const resend = new Resend(cleanKey);

  // 1. Try with your Professional Custom Domain
  console.log(`📡 Attempting to send via contact.prospectiq.online...`);
  const result = await resend.emails.send({
    from: 'ProspectIQ <auth@contact.prospectiq.online>',
    to: [toEmail],
    subject: `${otp} is your verification code`,
    html: `<strong>Your code is ${otp}</strong>`,
    text: `Your code is ${otp}`,
  });

  // 2. SMART FALLBACK: If custom domain fails, use the official test sender
  if (result.error) {
    console.warn('⚠️ Custom domain not ready. Falling back to test sender...');
    const fallback = await resend.emails.send({
      from: 'ProspectIQ <onboarding@resend.dev>',
      to: [toEmail],
      subject: `${otp} is your verification code`,
      html: `<strong>Your code is ${otp}</strong>`,
      text: `Your code is ${otp}`,
    });

    if (fallback.error) {
      console.error('❌ Both senders failed:', fallback.error.message);
      
      if (process.env.ENABLE_BYPASS === 'true') return;
      throw new Error(fallback.error.message);
    }
    
    console.log('✅ Sent via Fallback Sender');
    return fallback.data;
  }

  console.log('✅ Sent via Custom Domain');
  return result.data;
};

module.exports = { sendOTPEmail };