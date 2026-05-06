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
    const { content } = req.body
    const { data, error } = await supabase
      .from('notes')
      .insert({
        lead_id: req.params.leadId,
        content,
        created_by: req.user.id   // comes from JWT via authMiddleware
      })
      .select()
      .single()

    if (error) throw error
    res.status(201).json({ success: true, data })
  } catch (err) {
    res.status(500).json({ message: 'Failed to add note' })
  }
})

module.exports = router