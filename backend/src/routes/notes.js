const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const supabase = require('../db/supabase')

// GET notes for a lead
router.get('/:leadId', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*, users(name)')
      .eq('lead_id', req.params.leadId)
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json({ success: true, data })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notes' })
  }
})

// ADD note to a lead
router.post('/:leadId', authMiddleware, async (req, res) => {
  try {
    const content = req.body?.content;
    if (!content || typeof content !== 'string' || content.trim() === '') {
      return res.status(400).json({ message: 'Note content is required' })
    }

    const { data, error } = await supabase
      .from('notes')
      .insert({
        lead_id: req.params.leadId,
        content,
        created_by: req.user.id   // comes from JWT via authMiddleware
      })
      .select()
      .single()

    if (error) {
      console.error('Insert note error:', error);
      throw error;
    }
    res.status(201).json({ success: true, data })
  } catch (err) {
    console.error('Failed to add note:', err);
    res.status(500).json({ message: 'Failed to add note', detail: err.message || err.details })
  }
})

module.exports = router