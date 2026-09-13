import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import supabase from '@/lib/supabase';

export async function POST(req) {
  try {
    let { email, otp, newPassword } = await req.json();
    if (!email || !otp || !newPassword) {
      return NextResponse.json({ message: 'Email, OTP, and new password are required' }, { status: 400 });
    }
    email = email.toLowerCase().trim();

    const { data: otpRecord, error } = await supabase
      .from('otps')
      .select('*')
      .eq('email', email)
      .eq('otp', otp)
      .eq('used', false)
      .single();

    if (error || !otpRecord) {
      return NextResponse.json({ message: 'Invalid OTP' }, { status: 400 });
    }

    const now = new Date();
    const expiry = new Date(otpRecord.expires_at);
    if (now > expiry) {
      return NextResponse.json({ message: 'OTP has expired' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const { error: updateErr } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('email', email);

    if (updateErr) throw updateErr;

    await supabase
      .from('otps')
      .update({ used: true })
      .eq('id', otpRecord.id);

    return NextResponse.json({ success: true, message: 'Password has been reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    return NextResponse.json({ message: 'Server error during password reset' }, { status: 500 });
  }
}
