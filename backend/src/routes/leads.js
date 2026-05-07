
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const supabase = require('../db/supabase');  

// GET All Leads
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*, users(name)')
      .order('created_at', { ascending: false });

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
    const leadData = {
      ...rest,
      name: lead_name || name,           // accept both lead_name and name
      assigned_to: req.user.id,          // track which user created this lead
    };

    const { data, error } = await supabase
      .from('leads')
      .insert(leadData)
      .select()
      .single();

    if (error) {
      console.error('Lead insert error:', JSON.stringify(error));
      throw error;
    }

    res.status(201).json({ 
      success: true, 
      message: 'Lead created successfully',
      data 
    });
  } catch (err) {
    console.error('Create lead error:', err);
    res.status(500).json({ message: 'Failed to create lead', detail: err.message });
  }
});

// UPDATE Lead
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('leads')
      .update(req.body)
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