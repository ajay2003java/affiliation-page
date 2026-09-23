const express = require('express');
const router = express.Router();
const { db } = require('../db/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Get rewards (Referrer sees own, Super Admin sees all)
router.get('/', authenticateToken, (req, res) => {
  const isSuperAdmin = req.user.role === 'SUPER_ADMIN';

  let query = `
    SELECT 
      r.*,
      o.job_id,
      o.client_name,
      o.service_product,
      o.current_status as opportunity_status,
      o.conversion_date,
      u.name as referrer_name,
      u.email as referrer_email,
      e.name as entity_name,
      e.color_theme as entity_color
    FROM rewards r
    JOIN opportunities o ON r.opportunity_id = o.id
    JOIN users u ON r.user_id = u.id
    JOIN entities e ON o.target_entity_id = e.id
  `;

  const params = [];
  if (!isSuperAdmin) {
    query += ' WHERE r.user_id = ?';
    params.push(req.user.id);
  }

  query += ' ORDER BY r.created_at DESC';
  const rewards = db.prepare(query).all(...params);

  // Summary statistics
  const summary = {
    total: rewards.length,
    total_amount: rewards.reduce((sum, r) => sum + (r.reward_value || 0), 0),
    eligible_count: rewards.filter(r => r.status === 'ELIGIBLE').length,
    eligible_amount: rewards.filter(r => r.status === 'ELIGIBLE').reduce((sum, r) => sum + (r.reward_value || 0), 0),
    provided_count: rewards.filter(r => r.status === 'PROVIDED').length,
    provided_amount: rewards.filter(r => r.status === 'PROVIDED').reduce((sum, r) => sum + (r.reward_value || 0), 0),
    pending_count: rewards.filter(r => r.status === 'NOT_ELIGIBLE').length
  };

  return res.json({ rewards, summary });
});

// Payout Fulfillment by Super Admin
router.patch('/:id/payout', authenticateToken, requireRole('SUPER_ADMIN'), (req, res) => {
  const { id } = req.params;
  const { payout_reference, notes } = req.body;

  const reward = db.prepare('SELECT * FROM rewards WHERE id = ?').get(id);
  if (!reward) {
    return res.status(404).json({ error: 'Reward not found' });
  }

  db.prepare(`
    UPDATE rewards 
    SET status = 'PROVIDED',
        provided_date = datetime('now'),
        payout_reference = ?,
        notes = ?,
        updated_at = datetime('now')
    WHERE id = ?
  `).run(payout_reference || 'Bank/UPI Transfer', notes || 'Paid by Admin', id);

  const updated = db.prepare('SELECT * FROM rewards WHERE id = ?').get(id);
  return res.json({ message: 'Reward payout recorded successfully', reward: updated });
});

module.exports = router;
