const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { db } = require('../db/database');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');

// Unified Login Endpoint
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const user = db.prepare("SELECT * FROM users WHERE email = ? AND status = 'ACTIVE'").get(email.trim().toLowerCase());
  
  if (!user) {
    return res.status(401).json({ error: 'User not found or account inactive' });
  }

  // Password verification (demo plain or hashed)
  if (password && user.password_hash && user.password_hash !== password) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  const tokenPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    organization_id: user.organization_id,
    organization_name: user.organization_name,
    industry: user.industry,
    intent_selected: (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') ? 1 : (user.intent_selected ? 1 : 0)
  };

  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  return res.json({
    message: 'Login successful',
    token,
    user: tokenPayload,
    redirectUrl: user.role === 'SUPER_ADMIN' ? '/admin' : user.role === 'ADMIN' ? '/client-admin' : '/portal'
  });
});

// Self Register for Partners / Referrers
router.post('/register', (req, res) => {
  const { name, email, phone, organization_name, industry, password } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.trim().toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const newId = `usr-${Date.now()}`;
  const insertUser = db.prepare(`
    INSERT INTO users (id, email, name, phone, password_hash, role, organization_name, industry, intent_selected, status)
    VALUES (?, ?, ?, ?, ?, 'USER', ?, ?, 0, 'ACTIVE')
  `);

  insertUser.run(
    newId,
    email.trim().toLowerCase(),
    name.trim(),
    phone || null,
    password || 'user123',
    organization_name || null,
    industry || 'Other'
  );

  const tokenPayload = {
    id: newId,
    email: email.trim().toLowerCase(),
    name: name.trim(),
    role: 'USER',
    organization_id: null,
    organization_name: organization_name || null,
    industry: industry || 'Other',
    intent_selected: 0
  };

  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

  return res.status(201).json({
    message: 'Registration successful',
    token,
    user: tokenPayload,
    redirectUrl: '/portal'
  });
});

// Select Post-Login Intent (Option 1: Business / Increase Footfalls vs Option 2: Normal Referrer)
router.post('/select-intent', authenticateToken, (req, res) => {
  const { intent, business_name, category, city, phone, reward_amount } = req.body;
  const userId = req.user.id;

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (intent === 'BUSINESS') {
    if (!business_name || !business_name.trim()) {
      return res.status(400).json({ error: 'Business name is required' });
    }

    const orgId = user.organization_id || `org-${Date.now()}`;
    const rewardVal = parseFloat(reward_amount) || 5000.00;

    // Check if organization exists or insert
    const existingOrg = db.prepare('SELECT id FROM organizations WHERE id = ?').get(orgId);
    if (existingOrg) {
      db.prepare(`
        UPDATE organizations 
        SET name = ?, category = ?, city = ?, phone = ?, reward_amount = ?, is_self_serve = 1, status = 'ACTIVE'
        WHERE id = ?
      `).run(business_name.trim(), category || 'Other', city || null, phone || user.phone || null, rewardVal, orgId);
    } else {
      db.prepare(`
        INSERT INTO organizations (id, name, category, city, contact_person, phone, email, is_self_serve, reward_amount, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, 'ACTIVE')
      `).run(orgId, business_name.trim(), category || 'Other', city || null, user.name, phone || user.phone || null, user.email, rewardVal);
    }

    // Update user to ADMIN of this organization
    db.prepare(`
      UPDATE users 
      SET role = 'ADMIN', organization_id = ?, organization_name = ?, industry = ?, intent_selected = 1
      WHERE id = ?
    `).run(orgId, business_name.trim(), category || 'Other', userId);

    const updatedUser = db.prepare('SELECT id, email, name, phone, role, organization_id, organization_name, industry, intent_selected, status FROM users WHERE id = ?').get(userId);

    const tokenPayload = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      organization_id: updatedUser.organization_id,
      organization_name: updatedUser.organization_name,
      industry: updatedUser.industry,
      intent_selected: 1
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      message: 'Business account set up successfully',
      token,
      user: updatedUser,
      redirectUrl: '/client-admin'
    });
  } else {
    // Option 2: Normal Referrer
    db.prepare(`
      UPDATE users 
      SET role = 'USER', intent_selected = 1
      WHERE id = ?
    `).run(userId);

    const updatedUser = db.prepare('SELECT id, email, name, phone, role, organization_id, organization_name, industry, intent_selected, status FROM users WHERE id = ?').get(userId);

    const tokenPayload = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: 'USER',
      organization_id: updatedUser.organization_id,
      organization_name: updatedUser.organization_name,
      industry: updatedUser.industry,
      intent_selected: 1
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      message: 'Referrer profile active',
      token,
      user: updatedUser,
      redirectUrl: '/user'
    });
  }
});

// Get Current Logged In User
router.get('/me', authenticateToken, (req, res) => {
  const user = db.prepare('SELECT id, email, name, phone, role, organization_id, organization_name, industry, intent_selected, status FROM users WHERE id = ?').get(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
    user.intent_selected = 1;
  }
  return res.json({ user });
});

// Change Password for Logged-In Users & Admins
router.post('/change-password', authenticateToken, (req, res) => {
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }

  if (new_password.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long' });
  }

  const user = db.prepare('SELECT id, password_hash FROM users WHERE id = ?').get(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Validate current password
  if (user.password_hash && user.password_hash !== current_password) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  // Update password
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(new_password, req.user.id);

  return res.json({ message: 'Password updated successfully! Please use your new password next time you log in.' });
});

// Quick Switcher Users (For easy testing)
router.get('/demo-accounts', (req, res) => {
  const users = db.prepare('SELECT id, email, name, role, organization_name, industry FROM users LIMIT 10').all();
  return res.json({ users });
});

module.exports = router;
