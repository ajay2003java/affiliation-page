const express = require('express');
const router = express.Router();
const { db } = require('../db/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { notifyNewReferral, notifyStatusChange } = require('../services/email.service');

// Generate custom memorable Job ID based on client name or entity
function generateJobId(clientName, entityId, intakeType) {
  let prefix = 'OPP';
  if (intakeType === 'CLIENT_INTAKE') {
    prefix = 'INT';
  } else if (clientName) {
    const words = clientName.trim().split(/\s+/);
    if (words.length >= 2) {
      prefix = (words[0][0] + words[1][0] + (words[2] ? words[2][0] : 'S')).toUpperCase();
    } else if (words.length === 1 && words[0].length >= 3) {
      prefix = words[0].substring(0, 3).toUpperCase();
    }
  } else if (entityId) {
    prefix = entityId === 'ottobon' ? 'OTT' : entityId === 'medcy' ? 'MED' : 'SBL';
  }

  const countRow = db.prepare('SELECT COUNT(*) as count FROM opportunities WHERE job_id LIKE ?').get(`${prefix}-%`);
  const nextNum = (countRow ? countRow.count : 0) + 1;
  const padded = String(nextNum).padStart(3, '0');
  return `${prefix}-${padded}`;
}

// 1. GET opportunities (Role-Aware Multi-Tenant Filtering)
router.get('/', authenticateToken, (req, res) => {
  const { entity_id, status, source, search, scope } = req.query;
  const role = req.user.role;

  let query = `
    SELECT 
      o.*,
      e.name as target_entity_name,
      e.color_theme as target_entity_color,
      org.name as target_org_name,
      org.city as target_org_city,
      u.name as referrer_name,
      u.email as referrer_email,
      u.phone as referrer_phone,
      u.organization_name as referrer_org,
      r.id as reward_id,
      r.status as reward_status,
      r.reward_value
    FROM opportunities o
    LEFT JOIN entities e ON o.target_entity_id = e.id
    LEFT JOIN organizations org ON o.target_organization_id = org.id
    LEFT JOIN users u ON o.referring_user_id = u.id
    LEFT JOIN rewards r ON r.opportunity_id = o.id
    WHERE 1=1
  `;
  const params = [];

  // Role Access Rules:
  if (role === 'USER') {
    // Independent Partner/Referrer sees ONLY their own submissions
    query += ` AND o.referring_user_id = ?`;
    params.push(req.user.id);
  } else if (role === 'ADMIN') {
    // Entity / Client Admin (e.g. City Care Hospital / Apex College):
    if (scope === 'outgoing') {
      // Tab 2: Referrals submitted by this Entity to our company
      query += ` AND o.referring_user_id = ?`;
      params.push(req.user.id);
    } else {
      // Tab 1 (Default): Incoming Patient / Student intakes directed to their facility
      if (req.user.organization_id) {
        query += ` AND (o.target_organization_id = ? OR o.client_name = ?)`;
        params.push(req.user.organization_id, req.user.organization_name || '');
      } else {
        query += ` AND o.client_name = ?`;
        params.push(req.user.organization_name || '');
      }
    }
  }

  // Filter by Entity
  if (entity_id && entity_id !== 'all') {
    query += ` AND o.target_entity_id = ?`;
    params.push(entity_id);
  }

  // Filter by Status
  if (status && status !== 'all') {
    query += ` AND o.current_status = ?`;
    params.push(status);
  }

  // Filter by Source (Own vs Referral)
  if (source === 'own') {
    query += ` AND o.referring_user_id IS NULL`;
  } else if (source === 'referral') {
    query += ` AND o.referring_user_id IS NOT NULL`;
  }

  // Search filter
  if (search) {
    query += ` AND (o.job_id LIKE ? OR o.client_name LIKE ? OR o.person_contacted LIKE ? OR o.service_product LIKE ?)`;
    const term = `%${search}%`;
    params.push(term, term, term, term);
  }

  query += ` ORDER BY o.created_at DESC`;

  const rows = db.prepare(query).all(...params);
  return res.json({ opportunities: rows });
});

// 2. GET single opportunity by ID
router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const role = req.user.role;

  let query = `
    SELECT 
      o.*,
      e.name as target_entity_name,
      e.color_theme as target_entity_color,
      org.name as target_org_name,
      u.name as referrer_name,
      u.email as referrer_email,
      u.phone as referrer_phone,
      u.organization_name as referrer_org,
      r.id as reward_id,
      r.status as reward_status,
      r.reward_value
    FROM opportunities o
    LEFT JOIN entities e ON o.target_entity_id = e.id
    LEFT JOIN organizations org ON o.target_organization_id = org.id
    LEFT JOIN users u ON o.referring_user_id = u.id
    LEFT JOIN rewards r ON r.opportunity_id = o.id
    WHERE (o.id = ? OR o.job_id = ?)
  `;
  const params = [id, id];

  if (role === 'USER') {
    query += ` AND o.referring_user_id = ?`;
    params.push(req.user.id);
  } else if (role === 'ADMIN') {
    if (req.user.organization_id) {
      query += ` AND (o.target_organization_id = ? OR o.client_name = ?)`;
      params.push(req.user.organization_id, req.user.organization_name || '');
    }
  }

  const row = db.prepare(query).get(...params);
  if (!row) {
    return res.status(404).json({ error: 'Opportunity not found or access denied' });
  }

  const history = db.prepare('SELECT * FROM status_history WHERE opportunity_id = ? ORDER BY created_at ASC').all(row.id);
  return res.json({ opportunity: row, history });
});

// 3. POST - Create new referral / opportunity
router.post('/', authenticateToken, (req, res) => {
  const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
  const {
    job_id,
    target_entity_id,
    target_organization_id,
    intake_type,
    client_name,
    person_contacted,
    designation_role,
    phone,
    email,
    location,
    service_product,
    requirement_breakdown,
    clinical_intake_notes,
    quoted_price,
    pricing_type,
    product_owner,
    remarks
  } = req.body;

  if (!client_name || !target_entity_id || !service_product) {
    return res.status(400).json({ error: 'Client/Hospital name, target entity, and service/product are required' });
  }

  const oppId = `opp-${Date.now()}`;
  const finalJobId = (job_id && job_id.trim()) ? job_id.trim().toUpperCase() : generateJobId(client_name, target_entity_id, intake_type);
  const referringUserId = isSuperAdmin ? (req.body.referring_user_id || null) : req.user.id;
  const dateAdded = req.body.date_added || new Date().toISOString().split('T')[0];

  const insertOpp = db.prepare(`
    INSERT INTO opportunities (
      id, job_id, date_added, referring_user_id, target_entity_id, target_organization_id, intake_type,
      client_name, person_contacted, designation_role, phone, email, location, service_product,
      requirement_breakdown, clinical_intake_notes, current_status, quoted_price, pricing_type,
      quote_status, product_owner, remarks
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, 'SUBMITTED', ?, ?, 'Draft', ?, ?
    )
  `);

  insertOpp.run(
    oppId,
    finalJobId,
    dateAdded,
    referringUserId,
    target_entity_id,
    target_organization_id || null,
    intake_type || 'COMPANY_GROWTH',
    client_name.trim(),
    person_contacted || null,
    designation_role || null,
    phone || null,
    email || null,
    location || null,
    service_product.trim(),
    requirement_breakdown || null,
    clinical_intake_notes || null,
    quoted_price || 0.00,
    pricing_type || 'One-Time',
    product_owner || (isSuperAdmin ? 'Admin' : 'Pending Intake'),
    remarks || null
  );

  // If referred by a partner, attach reward record
  if (referringUserId) {
    const rewId = `rew-${Date.now()}`;
    const insertReward = db.prepare(`
      INSERT INTO rewards (id, opportunity_id, user_id, reward_type, reward_value, status)
      VALUES (?, ?, ?, 'FIXED_AMOUNT', 5000.00, 'NOT_ELIGIBLE')
    `);
    insertReward.run(rewId, oppId, referringUserId);
  }

  // Add initial status history
  const histId = `hist-${Date.now()}`;
  db.prepare(`
    INSERT INTO status_history (id, opportunity_id, old_status, new_status, changed_by, notes)
    VALUES (?, ?, NULL, 'SUBMITTED', ?, 'Initial submission')
  `).run(histId, oppId, req.user.name);

  // Trigger Email Notification asynchronously
  const insertedOpp = db.prepare(`
    SELECT o.*, org.name as target_org_name, e.name as target_entity_name 
    FROM opportunities o
    LEFT JOIN organizations org ON o.target_organization_id = org.id
    LEFT JOIN entities e ON o.target_entity_id = e.id
    WHERE o.id = ?
  `).get(oppId);

  notifyNewReferral(insertedOpp, req.user).catch(err => {
    console.error('Failed to dispatch new referral email:', err);
  });

  return res.status(201).json({
    message: 'Opportunity created successfully',
    opportunity_id: oppId,
    job_id: finalJobId
  });
});

// 4. PATCH / PUT - Super Admin or Client Admin Edit Opportunity
router.patch('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
  const isClientAdmin = req.user.role === 'ADMIN';

  const opp = db.prepare('SELECT * FROM opportunities WHERE id = ?').get(id);

  if (!opp) {
    return res.status(404).json({ error: 'Opportunity not found' });
  }

  // Client Admin Authorization check
  if (isClientAdmin) {
    if (opp.target_organization_id !== req.user.organization_id && opp.client_name !== req.user.organization_name) {
      return res.status(403).json({ error: 'Access denied to this organization opportunity' });
    }
  } else if (!isSuperAdmin) {
    return res.status(403).json({ error: 'Only administrators can update opportunity records' });
  }

  const fields = [
    'job_id', 'date_added', 'client_name', 'person_contacted', 'designation_role',
    'phone', 'email', 'location', 'service_product', 'requirement_breakdown', 'clinical_intake_notes',
    'current_status', 'last_discussion', 'quoted_price', 'pricing_type',
    'quote_status', 'final_agreed_price', 'next_action', 'follow_up_date',
    'product_owner', 'conversion_date', 'lost_reason', 'remarks', 'target_entity_id', 'target_organization_id'
  ];

  const updates = [];
  const values = [];

  for (const field of fields) {
    if (req.body[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(req.body[field]);
    }
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  // Handle status transition & conversion trigger
  if (req.body.current_status && req.body.current_status !== opp.current_status) {
    const newStatus = req.body.current_status;
    const histId = `hist-${Date.now()}`;
    db.prepare(`
      INSERT INTO status_history (id, opportunity_id, old_status, new_status, changed_by, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(histId, id, opp.current_status, newStatus, req.user.name, req.body.remarks || 'Status updated via tracker');

    if (newStatus === 'CONVERTED') {
      const convDate = req.body.conversion_date || new Date().toISOString().split('T')[0];
      if (!req.body.conversion_date) {
        updates.push('conversion_date = ?');
        values.push(convDate);
      }

      // Elevate reward status to ELIGIBLE
      const agreedPrice = req.body.final_agreed_price || opp.final_agreed_price || opp.quoted_price || 0;
      db.prepare(`
        UPDATE rewards 
        SET status = 'ELIGIBLE', 
            eligible_date = datetime('now'),
            reward_value = CASE WHEN reward_type = 'PERCENTAGE' THEN (? * 0.10) ELSE reward_value END,
            updated_at = datetime('now')
        WHERE opportunity_id = ? AND status = 'NOT_ELIGIBLE'
      `).run(agreedPrice, id);
    }
  }

  updates.push("updated_at = datetime('now')");
  values.push(id);

  const query = `UPDATE opportunities SET ${updates.join(', ')} WHERE id = ?`;
  db.prepare(query).run(...values);

  const updatedOpp = db.prepare('SELECT * FROM opportunities WHERE id = ?').get(id);

  // Trigger status update email notification asynchronously if status changed
  if (req.body.current_status && req.body.current_status !== opp.current_status) {
    notifyStatusChange(
      updatedOpp,
      opp.current_status,
      req.body.current_status,
      req.user.name,
      req.body.remarks || req.body.last_discussion || ''
    ).catch(err => {
      console.error('Failed to dispatch status update email:', err);
    });
  }

  return res.json({ message: 'Opportunity updated successfully', opportunity: updatedOpp });
});

// 5. DELETE
router.delete('/:id', authenticateToken, requireRole('SUPER_ADMIN'), (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM opportunities WHERE id = ?').run(id);
  return res.json({ message: 'Opportunity deleted' });
});

// 6. CSV Export
router.get('/export/csv', authenticateToken, requireRole(['SUPER_ADMIN', 'ADMIN']), (req, res) => {
  const role = req.user.role;
  let query = `
    SELECT 
      o.job_id, o.date_added, o.client_name, o.person_contacted, o.designation_role,
      e.name as entity, org.name as target_hospital_school, o.service_product, o.requirement_breakdown,
      o.current_status, o.last_discussion, o.quoted_price, o.pricing_type, o.quote_status,
      o.final_agreed_price, o.next_action, o.follow_up_date, o.product_owner,
      o.conversion_date, o.lost_reason, o.remarks, u.name as referrer
    FROM opportunities o
    LEFT JOIN entities e ON o.target_entity_id = e.id
    LEFT JOIN organizations org ON o.target_organization_id = org.id
    LEFT JOIN users u ON o.referring_user_id = u.id
  `;
  const params = [];

  if (role === 'ADMIN' && req.user.organization_id) {
    query += ` WHERE (o.target_organization_id = ? OR o.client_name = ?)`;
    params.push(req.user.organization_id, req.user.organization_name || '');
  }

  query += ` ORDER BY o.date_added DESC`;
  const rows = db.prepare(query).all(...params);

  const headers = [
    'Job id', 'Date Added', 'Client / Hospital', 'Person / Patient Contacted', 'Designation / Role',
    'Brand', 'Target Institution', 'Service / Procedure', 'Requirement Breakdown', 'Current Status',
    'Last Discussion', 'Quoted Price', 'Pricing Type', 'Quote Status',
    'Final Agreed Price', 'Next Action', 'Follow-up Date', 'Product Owner',
    'Conversion Date', 'Lost Reason', 'Remarks', 'Referrer'
  ];

  let csvContent = headers.join(',') + '\n';
  rows.forEach(r => {
    const values = [
      r.job_id, r.date_added, `"${r.client_name || ''}"`, `"${r.person_contacted || ''}"`, `"${r.designation_role || ''}"`,
      `"${r.entity || ''}"`, `"${r.target_hospital_school || ''}"`, `"${r.service_product || ''}"`, `"${(r.requirement_breakdown || '').replace(/"/g, '""')}"`,
      r.current_status, `"${(r.last_discussion || '').replace(/"/g, '""')}"`, r.quoted_price || '', r.pricing_type || '',
      r.quote_status || '', r.final_agreed_price || '', `"${(r.next_action || '').replace(/"/g, '""')}"`,
      r.follow_up_date || '', r.product_owner || '', r.conversion_date || '', `"${r.lost_reason || ''}"`,
      `"${(r.remarks || '').replace(/"/g, '""')}"`, `"${r.referrer || ''}"`
    ];
    csvContent += values.join(',') + '\n';
  });

  res.header('Content-Type', 'text/csv');
  res.attachment(`Opportunity_Intake_Tracker_${new Date().toISOString().split('T')[0]}.csv`);
  return res.send(csvContent);
});

module.exports = router;
