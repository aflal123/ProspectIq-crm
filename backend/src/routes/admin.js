const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');
require('dotenv').config();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Admin Login
router.post('/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, message: 'Admin authenticated' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid admin password' });
  }
});

// Simple Admin Middleware
const adminAuth = (req, res, next) => {
  const password = req.headers['x-admin-password'];
  if (password === ADMIN_PASSWORD) {
    next();
  } else {
    res.status(401).json({ success: false, message: 'Unauthorized admin access' });
  }
};

// GET all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

// DELETE a user
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
});

module.exports = router;
