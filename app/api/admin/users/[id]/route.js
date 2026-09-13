import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

function checkAdminAuth(req) {
  const pwd = req.headers.get('x-admin-password');
  return pwd === ADMIN_PASSWORD;
}

export async function DELETE(req, { params }) {
  try {
    if (!checkAdminAuth(req)) {
      return NextResponse.json({ success: false, message: 'Unauthorized admin access' }, { status: 401 });
    }

    const { id } = await params;
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true, message: 'User deleted' });
  } catch (err) {
    console.error('Delete user error:', err);
    return NextResponse.json({ success: false, message: 'Failed to delete user' }, { status: 500 });
  }
}
