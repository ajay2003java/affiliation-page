const express = require('express');
const router = express.Router();
const { db } = require('../db/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Get all onboarded client organizations with detailed performance metrics
router.get('/', authenticateToken, (req, res) => {
  const orgs = db.prepare("SELECT * FROM organizations ORDER BY name ASC").all();

  const enrichedOrgs = orgs.map(org => {
    // 1. Find assigned primary admin
    const adminUser = db.prepare(`
      SELECT id, name, email, phone, role, status, created_at
      FROM users
      WHERE organization_id = ? OR (role = 'ADMIN' AND organization_name = ?)
      LIMIT 1
    `).get(org.id, org.name);

    // 2. Fetch all leads / admissions / patient intakes for this client
    const leads = db.prepare(`
      SELECT o.*, u.name as referrer_name, u.email as referrer_email, u.phone as referrer_phone, u.organization_name as referrer_org
      FROM opportunities o
      LEFT JOIN users u ON o.referring_user_id = u.id
      WHERE o.target_organization_id = ? 
         OR (o.client_name = ? AND o.target_organization_id IS NULL)
      ORDER BY o.date_added DESC
    `).all(org.id, org.name);

    const totalLeads = leads.length;
    const convertedLeads = leads.filter(l => l.current_status === 'CONVERTED' || l.quote_status === 'agreed');
    const inDiscussionLeads = leads.filter(l => l.current_status !== 'CONVERTED' && l.current_status !== 'NOT CONVERTED');

    // 3. Compute revenue earned through referrals / admissions
    const totalRevenue = convertedLeads.reduce((sum, l) => {
      return sum + (Number(l.final_agreed_price) || Number(l.quoted_price) || 0);
    }, 0);

    // 4. Compute rewards disbursed for these leads
    const oppIds = leads.map(l => `'${l.id}'`).join(',');
    let totalRewardsPaid = 0;
    if (oppIds.length > 0) {
      const rewardRow = db.prepare(`
        SELECT SUM(reward_value) as total 
        FROM rewards 
        WHERE opportunity_id IN (${oppIds}) AND status = 'PAID'
      `).get();
      totalRewardsPaid = rewardRow?.total || 0;
    }

    // 5. Active referral programs launched by this client
    const defaultPrograms = [
      {
        id: `prog-${org.id}-1`,
        title: org.category === 'Healthcare' 
          ? 'Patient Consultation & Surgical Care Referral Program' 
          : 'Admissions & Student Referral Drive 2026',
        reward_per_lead: org.reward_amount || 5000,
        status: 'ACTIVE',
        target_audience: org.category === 'Healthcare' ? 'Doctors & General Practitioners' : 'Alumni, Teachers & Education Consultants',
        terms: 'Disbursed directly upon successful admission / patient appointment completion.'
      },
      {
        id: `prog-${org.id}-2`,
        title: 'EduOps / Digital Management Suite Partner Program',
        reward_per_lead: 3500,
        status: 'ACTIVE',
        target_audience: 'Institutional Directors & Principals',
        terms: 'Credited instantly upon system deployment agreement.'
      }
    ];

    return {
      ...org,
      admin: adminUser || {
        name: org.contact_person || 'Facility Admin',
        email: org.email,
        phone: org.phone,
        role: 'ADMIN',
        status: org.status
      },
      leads_summary: {
        total: totalLeads,
        converted: convertedLeads.length,
        in_discussion: inDiscussionLeads.length,
        conversion_rate: totalLeads > 0 ? Math.round((convertedLeads.length / totalLeads) * 100) : 0,
        total_revenue_earned: totalRevenue,
        rewards_paid: totalRewardsPaid
      },
      leads: leads,
      programs_launched: defaultPrograms
    };
  });

  return res.json({ organizations: enrichedOrgs });
});

// Super Admin onboards a new client organization & generates Client Admin user
router.post('/', authenticateToken, requireRole('SUPER_ADMIN'), (req, res) => {
  const { name, category, city, contact_person, phone, email, admin_password } = req.body;

  if (!name || !category || !email) {
    return res.status(400).json({ error: 'Organization name, category, and email are required' });
  }

  const orgId = `org-${Date.now()}`;
  const userId = `usr-admin-${Date.now()}`;

  try {
    const insertOrg = db.prepare(`
      INSERT INTO organizations (id, name, category, city, contact_person, phone, email, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
    `);
    insertOrg.run(orgId, name.trim(), category, city || null, contact_person || null, phone || null, email.trim().toLowerCase());

    // Create primary Client Admin account
    const insertAdminUser = db.prepare(`
      INSERT INTO users (id, email, name, phone, password_hash, role, organization_id, organization_name, industry, status)
      VALUES (?, ?, ?, ?, ?, 'ADMIN', ?, ?, ?, 'ACTIVE')
    `);
    insertAdminUser.run(
      userId,
      email.trim().toLowerCase(),
      contact_person || `${name} Admin`,
      phone || null,
      admin_password || 'admin123',
      orgId,
      name.trim(),
      category
    );

    return res.status(201).json({
      message: 'Client organization onboarded successfully',
      organization_id: orgId,
      admin_email: email.trim().toLowerCase()
    });
  } catch (err) {
    console.error('Error onboarding organization:', err);
    return res.status(409).json({ error: 'An organization with this name or email already exists' });
  }
});

module.exports = router;
