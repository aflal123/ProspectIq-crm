const { Resend } = require('resend');

/**
 * Professional Email Service using Resend SDK
 * Compliant with production guardrails
 */
const sendOTPEmail = async (toEmail, otp) => {
  // Use the sanitized key from index.js or re-sanitize here
  const cleanKey = (process.env.RESEND_API_KEY || '').trim();
  console.log(`📡 Resend Audit: Key present? ${!!cleanKey}, Length: ${cleanKey.length}`);
  const resend = new Resend(cleanKey);

  // Send email using the { data, error } pattern
  const { data, error } = await resend.emails.send({
    from: 'ProspectIQ <auth@contact.prospectiq.online>',
    to: [toEmail],
    subject: `${otp} is your verification code`,
    html: `<strong>Hello, your verification code is ${otp}</strong>`,
    text: `Hello, your verification code is ${otp}`, // Added for professional compliance
  });

  // Handle errors as per Resend best practices
  if (error) {
    console.error('❌ Resend SDK Error:', error.name, error.message);
    
    // In bypass mode, we log but don't crash
    if (process.env.ENABLE_BYPASS === 'true') {
      console.warn('⚠️ Bypass active: Ignoring email error.');
      return;
    }
    
    throw new Error(`Email delivery failed: ${error.message}`);
  }

  console.log('✅ Email delivered successfully:', data.id);
  return data;
};

module.exports = { sendOTPEmail };