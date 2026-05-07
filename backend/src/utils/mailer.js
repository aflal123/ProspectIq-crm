const { Resend } = require('resend');

const sendOTPEmail = async (toEmail, otp) => {
  // Use Resend with the Official Onboarding Sender (Authorized by Gmail)
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { data, error } = await resend.emails.send({
        from: 'ProspectIQ <onboarding@resend.dev>',
        to: toEmail,
        subject: `${otp} is your verification code`,
        html: `<strong>Hello, your verification code is ${otp}</strong>`,
      });
      
      if (error) {
        console.error('❌ Resend API Error:', error);
        throw new Error(error.message);
      }
      
      console.log(`✅ Resend Success: OTP sent to ${toEmail}. ID: ${data.id}`);
      return;
    } catch (err) {
      console.error('❌ Resend catch error:', err.message);
      throw err;
    }
  }
  
  throw new Error('No valid Email API key found (RESEND_API_KEY missing)');
};

module.exports = { sendOTPEmail };