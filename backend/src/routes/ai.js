// backend/src/routes/ai.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const aiService = require('../services/aiService');
const supabase = require('../db/supabase');

// ── 1. Score a single lead ────────────────────────────────────
router.post('/score-lead/:leadId', authMiddleware, async (req, res) => {
  try {
    const { leadId } = req.params;
    const { data: lead, error } = await supabase.from('leads').select('*').eq('id', leadId).single();
    if (error || !lead) return res.status(404).json({ message: 'Lead not found' });

    const { data: notes } = await supabase.from('notes').select('content').eq('lead_id', leadId);
    const aiResult = await aiService.scoreLead(lead, notes || []);

    await supabase.from('leads').update({ ai_score: aiResult.score, ai_reason: aiResult.reasoning }).eq('id', leadId);
    res.json({ success: true, aiScore: aiResult });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'AI scoring failed' });
  }
});

// ── 2. AI Email Composer ──────────────────────────────────────
router.post('/compose-email', authMiddleware, async (req, res) => {
  try {
    const { leadId, tone } = req.body; // tone: friendly | formal | urgent | followup

    const { data: lead, error } = await supabase.from('leads').select('*').eq('id', leadId).single();
    if (error || !lead) return res.status(404).json({ message: 'Lead not found' });

    const { data: notes } = await supabase.from('notes').select('content').eq('lead_id', leadId);
    const notesText = notes?.map(n => n.content).join('\n') || 'No notes yet';

    const prompt = `You are an expert B2B sales copywriter.

Write a personalized sales email to:
- Name: ${lead.lead_name}
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

    const { OpenAI } = require('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content);
    res.json({ success: true, email: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Email composition failed' });
  }
});

// ── 3. AI Sales Coach ─────────────────────────────────────────
router.post('/sales-coach', authMiddleware, async (req, res) => {
  try {
    const { leadId, question } = req.body;

    const { data: lead, error } = await supabase.from('leads').select('*').eq('id', leadId).single();
    if (error || !lead) return res.status(404).json({ message: 'Lead not found' });

    const { data: notes } = await supabase.from('notes').select('content').eq('lead_id', leadId);
    const notesText = notes?.map(n => n.content).join('\n') || 'No notes yet';

    const prompt = `You are an expert B2B sales coach. A sales rep needs help with a specific lead.

Lead Profile:
- Name: ${lead.lead_name}
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

    const { OpenAI } = require('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content);
    res.json({ success: true, coaching: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sales coaching failed' });
  }
});

// ── 4. AI Pipeline Health Report ──────────────────────────────
router.post('/pipeline-health', authMiddleware, async (req, res) => {
  try {
    const { data: leads, error } = await supabase.from('leads').select('*');
    if (error) throw error;

    if (!leads || leads.length === 0) {
      return res.json({ success: true, report: { healthScore: 0, summary: 'No leads in pipeline yet.', priorities: [], atRisk: [], forecast: '$0', recommendations: [] } });
    }

    const leadsSummary = leads.map(l =>
      `- ${l.lead_name} (${l.company_name || 'N/A'}) | Status: ${l.status} | Value: LKR ${l.deal_value || 0} | AI Score: ${l.ai_score || 'unscored'}`
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

    const { OpenAI } = require('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content);
    res.json({ success: true, report: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Pipeline analysis failed' });
  }
});

module.exports = router;