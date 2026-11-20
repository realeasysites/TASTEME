const express = require('express');
const db = require('../db');
const { notifyInquiry } = require('../lib/mailer');

const router = express.Router();

const TYPES = ['Catering', 'Party Order', 'Private Event', 'General Question'];

// Tiny in-memory rate limit: 5 submissions per IP per 10 minutes.
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  list.push(now);
  hits.set(ip, list);
  return list.length > 5;
}

const clean = (v, max = 500) => String(v || '').trim().slice(0, max);

router.post('/inquiry', (req, res) => {
  const b = req.body || {};

  // Honeypot: real people never fill the hidden "company" field.
  if (b.company) return res.json({ ok: true });
  if (rateLimited(req.ip)) return res.status(429).json({ error: 'Too many submissions. Please call us instead.' });

  const inq = {
    name: clean(b.name, 120),
    phone: clean(b.phone, 40),
    email: clean(b.email, 160),
    type: TYPES.includes(b.type) ? b.type : 'General Question',
    event_date: clean(b.event_date, 40),
    guests: clean(b.guests, 20),
    message: clean(b.message, 2000),
  };

  if (!inq.name) return res.status(400).json({ error: 'Please add your name.' });
  if (!inq.phone && !inq.email) return res.status(400).json({ error: 'Please add a phone number or email so we can reach you.' });
  if (inq.email && !/^\S+@\S+\.\S+$/.test(inq.email)) return res.status(400).json({ error: 'That email doesn’t look right.' });

  const info = db
    .prepare(
      `INSERT INTO inquiries (name, phone, email, type, event_date, guests, message)
       VALUES (@name, @phone, @email, @type, @event_date, @guests, @message)`
    )
    .run(inq);

  notifyInquiry(inq);
  res.json({ ok: true, id: info.lastInsertRowid });
});

module.exports = router;
