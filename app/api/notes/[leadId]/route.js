import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth';

export async function GET(req, { params }) {
  try {
    const user = getAuthUser(req);
    if (!user) return NextResponse.json({ message: 'No token, access denied' }, { status: 401 });

    const { leadId } = await params;
    const { data, error } = await supabase
      .from('notes')
      .select('*, users(name)')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Fetch notes error:', err);
    return NextResponse.json({ message: 'Failed to fetch notes' }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const user = getAuthUser(req);
    if (!user) return NextResponse.json({ message: 'No token, access denied' }, { status: 401 });

    const { leadId } = await params;
    const body = await req.json();
    const content = body?.content;

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json({ message: 'Note content is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('notes')
      .insert({
        lead_id: leadId,
        content,
        created_by: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err) {
    console.error('Add note error:', err);
    return NextResponse.json({ message: 'Failed to add note', detail: err.message }, { status: 500 });
  }
}
