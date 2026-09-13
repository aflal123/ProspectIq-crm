import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth';

export async function GET(req) {
  try {
    const user = getAuthUser(req);
    if (!user) return NextResponse.json({ message: 'No token, access denied' }, { status: 401 });

    let query = supabase
      .from('leads')
      .select('status, deal_value');

    if (user.email !== 'admin@example.com') {
      query = query.eq('assigned_to', user.id);
    }

    const { data: leads, error } = await query;
    if (error) throw error;

    const stats = {
      totalLeads: leads.length,
      newLeads: leads.filter(l => l.status === 'new').length,
      qualifiedLeads: leads.filter(l => l.status === 'qualified').length,
      wonLeads: leads.filter(l => l.status === 'won').length,
      lostLeads: leads.filter(l => l.status === 'lost').length,
      totalDealValue: leads.reduce((sum, l) => sum + (l.deal_value || 0), 0),
      wonDealValue: leads
        .filter(l => l.status === 'won')
        .reduce((sum, l) => sum + (l.deal_value || 0), 0)
    };

    return NextResponse.json({ success: true, data: stats });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    return NextResponse.json({ message: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
