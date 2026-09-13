import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth';
import { scoreLead } from '@/lib/aiService';

export async function POST(req, { params }) {
  try {
    const user = getAuthUser(req);
    if (!user) return NextResponse.json({ message: 'No token, access denied' }, { status: 401 });

    const { leadId } = await params;
    const { data: lead, error } = await supabase.from('leads').select('*').eq('id', leadId).single();
    if (error || !lead) return NextResponse.json({ message: 'Lead not found' }, { status: 404 });

    const { data: notes } = await supabase.from('notes').select('content').eq('lead_id', leadId);
    const aiResult = await scoreLead(lead, notes || []);

    await supabase.from('leads').update({ ai_score: aiResult.score, ai_reason: aiResult.reasoning }).eq('id', leadId);
    return NextResponse.json({ success: true, aiScore: aiResult });
  } catch (err) {
    console.error('AI Score lead error:', err);
    return NextResponse.json({ message: 'AI scoring failed' }, { status: 500 });
  }
}
