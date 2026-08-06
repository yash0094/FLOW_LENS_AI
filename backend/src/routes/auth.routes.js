const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { passport, googleEnabled } = require('../config/passport');

const router = express.Router();

function signToken(user) {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function publicUser(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    avatar_url: u.avatar_url,
    z_threshold: u.z_threshold,
    has_seen_tutorial: !!u.has_seen_tutorial,
  };
}

router.get('/google-status', (req, res) => res.json({ enabled: googleEnabled }));

router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are all required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) return res.status(409).json({ error: 'An account with this email already exists.' });

  const totalUsers = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  const role = totalUsers === 0 ? 'admin' : 'user';
  const id = uuidv4();
  const hash = bcrypt.hashSync(password, 10);
  db.prepare('INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)').run(
    id,
    name,
    email.toLowerCase(),
    hash,
    role
  );
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  const token = signToken(user);
  res.json({ token, user: publicUser(user) });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get((email || '').toLowerCase());
  if (!user || !user.password_hash) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }
  const ok = bcrypt.compareSync(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid email or password.' });
  const token = signToken(user);
  res.json({ token, user: publicUser(user) });
});

// --- Google OAuth ---
router.get('/google', (req, res, next) => {
  if (!googleEnabled) return res.status(503).send('Google Sign-In is not configured on this server.');
  passport.authenticate('google', { scope: ['profile', 'email', 'https://www.googleapis.com/auth/spreadsheets.readonly'], session: false })(
    req,
    res,
    next
  );
});

router.get(
  '/google/callback',
  (req, res, next) => {
    if (!googleEnabled) return res.status(503).send('Google Sign-In is not configured on this server.');
    passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=google` })(req, res, next);
  },
  (req, res) => {
    const token = signToken(req.user);
    res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${token}`);
  }
);

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

router.patch('/settings', requireAuth, (req, res) => {
  const { z_threshold, has_seen_tutorial } = req.body;
  if (z_threshold !== undefined) {
    db.prepare('UPDATE users SET z_threshold = ? WHERE id = ?').run(Number(z_threshold), req.user.id);
  }
  if (has_seen_tutorial !== undefined) {
    db.prepare('UPDATE users SET has_seen_tutorial = ? WHERE id = ?').run(has_seen_tutorial ? 1 : 0, req.user.id);
  }
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  res.json({ user: publicUser(user) });
});

// Admin: list all users, promote/demote roles
router.get('/users', requireAuth, requireAdmin, (req, res) => {
  const users = db.prepare('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC').all();
  res.json({ users });
});

router.patch('/role', requireAuth, requireAdmin, (req, res) => {
  const { userId, role } = req.body;
  if (!['admin', 'user'].includes(role)) return res.status(400).json({ error: 'Role must be admin or user.' });
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, userId);
  res.json({ success: true });
});

module.exports = router;
