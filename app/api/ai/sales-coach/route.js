import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth';
import { OpenAI } from 'openai';

export async function POST(req) {
  try {
    const user = getAuthUser(req);
    if (!user) return NextResponse.json({ message: 'No token, access denied' }, { status: 401 });

    const { leadId, question } = await req.json();
    const { data: lead, error } = await supabase.from('leads').select('*').eq('id', leadId).single();
    if (error || !lead) return NextResponse.json({ message: 'Lead not found' }, { status: 404 });

    const { data: notes } = await supabase.from('notes').select('content').eq('lead_id', leadId);
    const notesText = notes?.map(n => n.content).join('\n') || 'No notes yet';

    const prompt = `You are an expert B2B sales coach. A sales rep needs help with a specific lead.

Lead Profile:
- Name: ${lead.lead_name || lead.name}
- Company: ${lead.company_name || 'Unknown'}
- Source: ${lead.lead_source}
- Status: ${lead.status}
- Deal Value: LKR ${lead.deal_value || 0}
- Notes History: ${notesText}

The sales rep asks: "${question}"

Give sharp, practical, actionable advice. Be direct. No fluff.

Return ONLY valid JSON:
{
  "advice": "2-3 paragraphs of direct coaching advice",
  "callScript": "A short 3-5 sentence script they can use right now",
  "objections": ["Objection 1 → How to handle it", "Objection 2 → How to handle it", "Objection 3 → How to handle it"],
  "nextStep": "Single most important action to take today"
}`;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content);
    return NextResponse.json({ success: true, coaching: result });
  } catch (err) {
    console.error('Sales coach error:', err);
    return NextResponse.json({ message: 'Sales coaching failed' }, { status: 500 });
  }
}
