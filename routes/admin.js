const path = require('path');
const express = require('express');
const db = require('../db');
const auth = require('../lib/auth');

const router = express.Router();
const views = path.join(__dirname, '..', 'views');

const STATUSES = ['new', 'contacted', 'booked', 'closed'];

// Pages
router.get(['/admin', '/admin/'], (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.sendFile(path.join(views, auth.isAuthed(req) ? 'admin.html' : 'login.html'));
});

// Auth
router.post('/api/admin/login', (req, res) => {
  if (!auth.loginEnabled()) {
    return res.status(503).json({ error: 'Login is disabled until ADMIN_PASSWORD is set on the server.' });
  }
  if (!auth.checkPassword((req.body || {}).password)) {
    return res.status(401).json({ error: 'Wrong password.' });
  }
  auth.issueSession(res);
  res.json({ ok: true });
});

router.post('/api/admin/logout', (req, res) => {
  auth.clearSession(res);
  res.json({ ok: true });
});

// Data
router.get('/api/admin/inquiries', auth.requireAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM inquiries ORDER BY created_at DESC, id DESC').all();
  res.json(rows);
});

router.patch('/api/admin/inquiries/:id', auth.requireAuth, (req, res) => {
  const status = (req.body || {}).status;
  if (!STATUSES.includes(status)) return res.status(400).json({ error: 'Bad status' });
  const info = db.prepare('UPDATE inquiries SET status = ? WHERE id = ?').run(status, Number(req.params.id));
  if (!info.changes) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

router.delete('/api/admin/inquiries/:id', auth.requireAuth, (req, res) => {
  const info = db.prepare('DELETE FROM inquiries WHERE id = ?').run(Number(req.params.id));
  if (!info.changes) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

module.exports = router;
