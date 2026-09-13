import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

function checkAdminAuth(req) {
  const pwd = req.headers.get('x-admin-password');
  return pwd === ADMIN_PASSWORD;
}

export async function GET(req) {
  try {
    if (!checkAdminAuth(req)) {
      return NextResponse.json({ success: false, message: 'Unauthorized admin access' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Fetch users error:', err);
    return NextResponse.json({ success: false, message: 'Failed to fetch users' }, { status: 500 });
  }
}
