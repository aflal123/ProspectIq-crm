// backend/src/routes/ai.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const aiService = require('../services/aiService');
const supabase = require('../db/supabase');

// Get AI Score for a specific lead
router.post('/score-lead/:leadId', authMiddleware, async (req, res) => {
  try {
    const { leadId } = req.params;

    // Fetch lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (leadError || !lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Fetch notes for this lead
    const { data: notes } = await supabase
      .from('notes')
      .select('content')
      .eq('lead_id', leadId);

    const aiResult = await aiService.scoreLead(lead, notes || []);

    // Optional: Save AI score to lead (good for history)
    await supabase
      .from('leads')
      .update({ 
        ai_score: aiResult.score,
        ai_reasoning: aiResult.reasoning 
      })
      .eq('id', leadId);

    res.json({
      success: true,
      aiScore: aiResult
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to generate AI score' });
  }
});

module.exports = router;