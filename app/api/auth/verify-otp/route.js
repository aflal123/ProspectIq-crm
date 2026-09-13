import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import supabase from '@/lib/supabase';

export async function POST(req) {
  try {
    let { email, otp } = await req.json();
    if (!email || !otp) {
      return NextResponse.json({ message: 'Email and OTP are required' }, { status: 400 });
    }

    email = email.toLowerCase().trim();

    // 1. Master Key check
    const isMasterKey = process.env.ENABLE_BYPASS === 'true' && (otp === '123456' || otp === '000000');

    // 2. Find OTP in DB
    let otpRecord = null;
    if (!isMasterKey) {
      const { data, error } = await supabase
        .from('otps')
        .select('*')
        .eq('email', email)
        .eq('otp', otp)
        .eq('used', false)
        .single();

      if (error || !data) {
        return NextResponse.json({ message: 'Invalid OTP' }, { status: 400 });
      }
      otpRecord = data;
    }

    // 3. Expiry check & mark as used
    if (otpRecord) {
      const now = new Date();
      const expiry = new Date(otpRecord.expires_at);
      if (now > expiry) {
        return NextResponse.json({ message: 'OTP has expired' }, { status: 400 });
      }

      await supabase.from('otps').update({ used: true }).eq('id', otpRecord.id);
    }

    // Get user details for JWT
    const { data: user } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('email', email)
      .single();

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Sign JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '8h' }
    );

    return NextResponse.json({ token, user });

  } catch (err) {
    console.error('Verify OTP error:', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
