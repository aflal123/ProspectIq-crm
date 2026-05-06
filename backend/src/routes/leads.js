
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const supabase = require('../db/supabase');  

// GET All Leads
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
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
    const { data, error } = await supabase
      .from('leads')
      .insert(req.body)
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ 
      success: true, 
      message: 'Lead created successfully',
      data 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create lead' });
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