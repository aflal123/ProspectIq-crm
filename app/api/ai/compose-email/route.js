import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth';
import { OpenAI } from 'openai';

export async function POST(req) {
  try {
    const user = getAuthUser(req);
    if (!user) return NextResponse.json({ message: 'No token, access denied' }, { status: 401 });

    const { leadId, tone } = await req.json();
    const { data: lead, error } = await supabase.from('leads').select('*').eq('id', leadId).single();
    if (error || !lead) return NextResponse.json({ message: 'Lead not found' }, { status: 404 });

    const { data: notes } = await supabase.from('notes').select('content').eq('lead_id', leadId);
    const notesText = notes?.map(n => n.content).join('\n') || 'No notes yet';

    const prompt = `You are an expert B2B sales copywriter.

Write a personalized sales email to:
- Name: ${lead.lead_name || lead.name}
- Company: ${lead.company_name || 'their company'}
- Lead Source: ${lead.lead_source}
- Current Status: ${lead.status}
- Deal Value: LKR ${lead.deal_value || 0}
- Notes/History: ${notesText}

Tone: ${tone}
- friendly: warm, conversational, build rapport
- formal: professional, respectful, business-focused
- urgent: create urgency, time-sensitive, FOMO-driven
- followup: reference previous contact, nudge gently

Return ONLY valid JSON:
{
  "subject": "email subject line",
  "body": "full email body with \\n for line breaks",
  "callToAction": "the exact CTA at the end"
}`;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content);
    return NextResponse.json({ success: true, email: result });
  } catch (err) {
    console.error('Compose email error:', err);
    return NextResponse.json({ message: 'Email composition failed' }, { status: 500 });
  }
}
