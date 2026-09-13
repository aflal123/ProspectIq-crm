import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth';

export async function GET(req, { params }) {
  try {
    const user = getAuthUser(req);
    if (!user) return NextResponse.json({ message: 'No token, access denied' }, { status: 401 });

    const { id } = await params;
    const { data, error } = await supabase
      .from('leads')
      .select('*, users(name)')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ message: 'Lead not found' }, { status: 404 });

    if (user.email !== 'admin@example.com' && data.assigned_to !== user.id) {
      return NextResponse.json({ message: 'Access denied to this lead' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Get lead error:', err);
    return NextResponse.json({ message: 'Failed to fetch lead details' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const user = getAuthUser(req);
    if (!user) return NextResponse.json({ message: 'No token, access denied' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { name, company_name, email, phone, lead_source, status, deal_value } = body;

    const payload = {
      name, company_name, email, phone,
      lead_source, status,
      updated_at: new Date().toISOString(),
      ...(deal_value !== undefined ? { deal_value: deal_value === '' ? null : deal_value } : {})
    };

    const { data, error } = await supabase
      .from('leads')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Lead updated successfully',
      data
    });
  } catch (err) {
    console.error('Update lead error:', err);
    return NextResponse.json({ message: 'Failed to update lead' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const user = getAuthUser(req);
    if (!user) return NextResponse.json({ message: 'No token, access denied' }, { status: 401 });

    const { id } = await params;
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Lead deleted successfully' });
  } catch (err) {
    console.error('Delete lead error:', err);
    return NextResponse.json({ message: 'Failed to delete lead' }, { status: 500 });
  }
}
