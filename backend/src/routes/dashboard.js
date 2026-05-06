const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const supabase = require('../db/supabase')

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { data: leads, error } = await supabase
      .from('leads')
      .select('status, deal_value')

    if (error) throw error

    const stats = {
      totalLeads: leads.length,
      newLeads: leads.filter(l => l.status === 'new').length,
      qualifiedLeads: leads.filter(l => l.status === 'qualified').length,
      wonLeads: leads.filter(l => l.status === 'won').length,
      lostLeads: leads.filter(l => l.status === 'lost').length,
      totalDealValue: leads.reduce((sum, l) => sum + (l.deal_value || 0), 0),
      wonDealValue: leads
        .filter(l => l.status === 'won')
        .reduce((sum, l) => sum + (l.deal_value || 0), 0)
    }

    res.json({ success: true, data: stats })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch dashboard stats' })
  }
})

module.exports = router