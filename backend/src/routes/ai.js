// backend/src/routes/ai.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const aiService = require('../services/aiService');
const supabase = require('../db/supabase');

router.post('/score-lead/:leadId', authMiddleware, async (req, res) => {
  try {
    const { leadId } = req.params;

    const { data: lead, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (error || !lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const { data: notes } = await supabase
      .from('notes')
      .select('content')
      .eq('lead_id', leadId);

    const aiResult = await aiService.scoreLead(lead, notes || []);

    // Save AI result back to database
    await supabase
      .from('leads')
      .update({
        ai_score: aiResult.score,
        ai_reason: aiResult.reasoning
      })
      .eq('id', leadId);

    res.json({
      success: true,
      aiScore: aiResult
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'AI scoring failed' });
  }
});

module.exports = router;