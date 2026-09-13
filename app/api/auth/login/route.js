import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import supabase from '@/lib/supabase';
import { generateOTP, getOTPExpiry } from '@/lib/otp';
import { sendOTPEmail } from '@/lib/mailer';

export async function POST(req) {
  try {
    let { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    email = email.toLowerCase().trim();

    // Find user by email in DB
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    // Compare typed password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    // Generate OTP
    const otp = generateOTP();
    const expires_at = getOTPExpiry();

    // Cleanup existing unused OTPs for this email
    await supabase.from('otps').delete().eq('email', email).eq('used', false);

    // Save new OTP to DB
    await supabase.from('otps').insert({
      email,
      otp,
      expires_at
    });

    // Send OTP email or log in dev mode
    try {
      console.log(`📧 [DEV] OTP for ${email}: ${otp}`);

      const skipEmail = process.env.ENABLE_BYPASS === 'true';
      if (!skipEmail) {
        await sendOTPEmail(email, otp);
      }
      return NextResponse.json({ message: 'OTP sent to your email' });
    } catch (err) {
      console.error('❌ Login Email Proceeding despite error:', err.message);
      return NextResponse.json({ message: 'Proceed to verification' });
    }

  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ message: 'Server error during login' }, { status: 500 });
  }
}
