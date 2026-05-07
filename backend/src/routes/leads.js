
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const supabase = require('../db/supabase');  

// GET All Leads
router.get('/', authMiddleware, async (req, res) => {
  try {
    let query = supabase
      .from('leads')
      .select('*, users(name)')
      .order('created_at', { ascending: false });

    // If user is not admin, only show their own leads
    if (req.user.email !== 'admin@example.com') {
      query = query.eq('assigned_to', req.user.id);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ 
      success: true, 
      count: data.length,
      data 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch leads' });
  }
});

// CREATE Lead
router.post('/', authMiddleware, async (req, res) => {
  try {
    // Map frontend field names to actual DB column names
    const { lead_name, name, ...rest } = req.body;
    const finalName = lead_name || name;

    if (!finalName) {
      return res.status(400).json({ success: false, message: 'Lead name is required' });
    }

    const leadData = {
      ...rest,
      name: finalName,                   // accept both lead_name and name
      assigned_to: req.user.id || null,  // track which user created this lead, fallback to null if token lacks id
    };
    if (leadData.deal_value === '') leadData.deal_value = null;

    const { data, error } = await supabase
      .from('leads')
      .insert(leadData)
      .select()
      .single();

    if (error) {
      console.error('Lead insert error:', error);
      return res.status(400).json({ 
        success: false, 
        message: 'Database error while creating lead', 
        detail: error.message || error.details || JSON.stringify(error) 
      });
    }

    res.status(201).json({ 
      success: true, 
      message: 'Lead created successfully',
      data 
    });
  } catch (err) {
    console.error('Create lead error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create lead', 
      detail: err?.message || String(err)
    });
  }
});

// UPDATE Lead
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const payload = { ...req.body };
    if (payload.deal_value === '') payload.deal_value = null;

    const { data, error } = await supabase
      .from('leads')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ 
      success: true, 
      message: 'Lead updated successfully',
      data 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update lead' });
  }
});

// DELETE Lead
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: 'Lead deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete lead' });
  }
});

module.exports = router;