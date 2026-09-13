import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { generateOTP, getOTPExpiry } from '@/lib/otp';
import { sendOTPEmail } from '@/lib/mailer';

export async function POST(req) {
  try {
    let { email } = await req.json();
    if (!email) return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    email = email.toLowerCase().trim();

    const { data: user, error } = await supabase
      .from('users').select('id').eq('email', email).single();

    if (error || !user) {
      return NextResponse.json({ message: 'No account found with this email' }, { status: 404 });
    }

    const otp = generateOTP();
    const expires_at = getOTPExpiry();

    await supabase.from('otps').insert({ email, otp, expires_at });

    try {
      const skipEmail = process.env.ENABLE_BYPASS === 'true';
      if (!skipEmail) {
        await sendOTPEmail(email, otp);
      }
      return NextResponse.json({ message: 'OTP sent to your email' });
    } catch (err) {
      console.error('❌ Forgot password email failed:', err.message);
      return NextResponse.json({ message: 'Failed to send OTP email' }, { status: 500 });
    }
  } catch (err) {
    console.error('Forgot password error:', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
