const express = require('express');
const router = express.Router();
const { db } = require('../db/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Get all 3 company entities and their services
router.get('/', (req, res) => {
  const entities = db.prepare('SELECT * FROM entities ORDER BY id ASC').all();
  return res.json({ entities });
});

// Get Super Admin Global Analytics & Stats
router.get('/admin/stats', authenticateToken, requireRole('SUPER_ADMIN'), (req, res) => {
  const opps = db.prepare('SELECT * FROM opportunities').all();
  const users = db.prepare("SELECT * FROM users WHERE role = 'USER'").all();
  const rewards = db.prepare('SELECT * FROM rewards').all();

  const totalOpps = opps.length;
  const convertedOpps = opps.filter(o => o.current_status === 'CONVERTED').length;
  const inPipelineOpps = opps.filter(o => !['CONVERTED', 'NOT_CONVERTED'].includes(o.current_status)).length;
  const totalPipelineValue = opps.reduce((sum, o) => sum + (o.quoted_price || 0), 0);
  const totalWonValue = opps.filter(o => o.current_status === 'CONVERTED').reduce((sum, o) => sum + (o.final_agreed_price || o.quoted_price || 0), 0);

  // Stats by Entity
  const byEntity = {
    ottobon: {
      name: 'Ottobon Academy',
      total: opps.filter(o => o.target_entity_id === 'ottobon').length,
      converted: opps.filter(o => o.target_entity_id === 'ottobon' && o.current_status === 'CONVERTED').length
    },
    medcy: {
      name: 'Medcy Health Tech',
      total: opps.filter(o => o.target_entity_id === 'medcy').length,
      converted: opps.filter(o => o.target_entity_id === 'medcy' && o.current_status === 'CONVERTED').length
    },
    sbloom: {
      name: 'sBloom',
      total: opps.filter(o => o.target_entity_id === 'sbloom').length,
      converted: opps.filter(o => o.target_entity_id === 'sbloom' && o.current_status === 'CONVERTED').length
    }
  };

  return res.json({
    total_opportunities: totalOpps,
    active_pipeline: inPipelineOpps,
    converted_count: convertedOpps,
    conversion_rate: totalOpps > 0 ? Math.round((convertedOpps / totalOpps) * 100) : 0,
    pipeline_value: totalPipelineValue,
    won_revenue: totalWonValue,
    total_referrers: users.length,
    total_rewards_paid: rewards.filter(r => r.status === 'PROVIDED').reduce((sum, r) => sum + (r.reward_value || 0), 0),
    pending_rewards_eligible: rewards.filter(r => r.status === 'ELIGIBLE').reduce((sum, r) => sum + (r.reward_value || 0), 0),
    by_entity: byEntity
  });
});

module.exports = router;
