import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth';
import { OpenAI } from 'openai';

export async function POST(req) {
  try {
    const user = getAuthUser(req);
    if (!user) return NextResponse.json({ message: 'No token, access denied' }, { status: 401 });

    const { data: leads, error } = await supabase.from('leads').select('*');
    if (error) throw error;

    if (!leads || leads.length === 0) {
      return NextResponse.json({
        success: true,
        report: { healthScore: 0, summary: 'No leads in pipeline yet.', priorities: [], atRisk: [], forecast: '$0', recommendations: [] }
      });
    }

    const leadsSummary = leads.map(l =>
      `- ${l.lead_name || l.name} (${l.company_name || 'N/A'}) | Status: ${l.status} | Value: LKR ${l.deal_value || 0} | AI Score: ${l.ai_score || 'unscored'}`
    ).join('\n');

    const prompt = `You are a senior sales manager reviewing a pipeline.

Current Pipeline (${leads.length} leads):
${leadsSummary}

Analyse this pipeline and return ONLY valid JSON:
{
  "healthScore": number (0-100 overall pipeline health),
  "summary": "2-3 sentence executive summary of the pipeline state",
  "priorities": ["Top 3 leads to focus on RIGHT NOW with reason"],
  "atRisk": ["Leads that are going cold or need urgent attention"],
  "forecast": "Estimated revenue this month based on pipeline",
  "recommendations": ["3-4 specific actionable recommendations to improve the pipeline"]
}`;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content);
    return NextResponse.json({ success: true, report: result });
  } catch (err) {
    console.error('Pipeline health error:', err);
    return NextResponse.json({ message: 'Pipeline analysis failed' }, { status: 500 });
  }
}
