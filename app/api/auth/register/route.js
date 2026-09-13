import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import supabase from '@/lib/supabase';

export async function POST(req) {
  try {
    let { name, email, password } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Name, email and password are required' }, { status: 400 });
    }
    email = email.toLowerCase().trim();

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json({ message: 'User with this email already exists' }, { status: 409 });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user
    const { data, error } = await supabase
      .from('users')
      .insert({
        name,
        email,
        password: hashedPassword
      })
      .select('id, name, email')
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      user: data
    }, { status: 201 });

  } catch (err) {
    console.error('Register API Error:', err);
    return NextResponse.json({ message: 'Failed to register user', error: err.message }, { status: 500 });
  }
}
