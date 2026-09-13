import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const scoreLead = async (lead, notes = []) => {
  try {
    const notesText = notes.map(n => n.content).join('\n') || 'No notes available';

    const prompt = `
You are an expert AI sales lead scoring assistant for a CRM system.
Analyze the following lead details and interaction notes, then provide a lead quality score (0-100) and brief reasoning.

Lead Info:
- Name: ${lead.name || lead.lead_name || 'N/A'}
- Company: ${lead.company_name || 'N/A'}
- Status: ${lead.status || 'new'}
- Source: ${lead.lead_source || 'N/A'}
- Deal Value: LKR ${lead.deal_value || 0}
- Notes History:
${notesText}

Rules:
- Score 0 to 100 based on likelihood to close and engagement.
- Provide a concise reasoning sentence.

Return ONLY valid JSON with keys "score" (number) and "reasoning" (string).
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return {
      score: result.score ?? 50,
      reasoning: result.reasoning || 'Evaluated based on current lead status and activity.'
    };
  } catch (err) {
    console.error('AI Score Lead Error:', err);
    return { score: 50, reasoning: 'Default score applied (AI evaluation fallback).' };
  }
};
