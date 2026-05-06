// backend/src/services/aiService.js
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const aiService = {
  async scoreLead(lead, notes = []) {
    const notesText = notes.map(n => n.content).join("\n");

    const prompt = `
You are an expert B2B sales analyst.

Lead Information:
- Name: ${lead.lead_name}
- Company: ${lead.company_name}
- Email: ${lead.email || 'N/A'}
- Source: ${lead.lead_source}
- Deal Value: $${lead.deal_value || 0}
- Status: ${lead.status}
- Notes: ${notesText || 'No notes yet'}

Score this lead 0-100. Consider buying intent, company fit, deal size, engagement.

Return **only** valid JSON:
{
  "score": number,
  "reasoning": "2-3 sentence professional summary",
  "strengths": ["...", "..."],
  "risks": ["...", "..."],
  "recommendedAction": "Call immediately / Send proposal / Follow up in 3 days / etc"
}
`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        response_format: { type: "json_object" }
      });

      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error("AI Error:", error.message);
      return {
        score: 45,
        reasoning: "AI scoring temporarily unavailable.",
        strengths: [],
        risks: ["Technical issue"],
        recommendedAction: "Review manually"
      };
    }
  }
};

module.exports = aiService;