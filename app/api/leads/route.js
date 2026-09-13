import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth';

export async function GET(req) {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ message: 'No token, access denied' }, { status: 401 });
    }

    let query = supabase
      .from('leads')
      .select('*, users(name)')
      .order('created_at', { ascending: false });

    if (user.email !== 'admin@example.com') {
      query = query.eq('assigned_to', user.id);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({
      success: true,
      count: data.length,
      data
    });
  } catch (err) {
    console.error('Fetch leads error:', err);
    return NextResponse.json({ message: 'Failed to fetch leads' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ message: 'No token, access denied' }, { status: 401 });
    }

    const body = await req.json();
    const { lead_name, name, ...rest } = body;
    const finalName = lead_name || name;

    if (!finalName) {
      return NextResponse.json({ success: false, message: 'Lead name is required' }, { status: 400 });
    }

    const leadData = {
      ...rest,
      name: finalName,
      assigned_to: user.id || null,
      updated_at: new Date().toISOString(),
    };
    if (leadData.deal_value === '') leadData.deal_value = null;

    const { data, error } = await supabase
      .from('leads')
      .insert(leadData)
      .select()
      .single();

    if (error) {
      console.error('Lead insert error:', error);
      return NextResponse.json({
        success: false,
        message: 'Database error while creating lead',
        detail: error.message || error.details
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Lead created successfully',
      data
    }, { status: 201 });

  } catch (err) {
    console.error('Create lead error:', err);
    return NextResponse.json({
      success: false,
      message: 'Failed to create lead',
      detail: err?.message || String(err)
    }, { status: 500 });
  }
}
