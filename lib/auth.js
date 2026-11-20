const crypto = require('crypto');

const COOKIE = 'tm_admin';
const MAX_AGE_MS = 1000 * 60 * 60 * 12; // 12 hours

function secret() {
  return process.env.SESSION_SECRET || `tm:${process.env.ADMIN_PASSWORD || ''}`;
}

function sign(value) {
  return crypto.createHmac('sha256', secret()).update(value).digest('hex');
}

function safeEqual(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ab.length !== bb.length) {
    crypto.timingSafeEqual(ab, ab); // keep timing roughly constant
    return false;
  }
  return crypto.timingSafeEqual(ab, bb);
}

function loginEnabled() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

function checkPassword(password) {
  if (!loginEnabled()) return false;
  return safeEqual(password || '', process.env.ADMIN_PASSWORD);
}

function issueSession(res) {
  const expires = Date.now() + MAX_AGE_MS;
  const token = `${expires}.${sign(String(expires))}`;
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: MAX_AGE_MS,
  });
}

function clearSession(res) {
  res.clearCookie(COOKIE);
}

function isAuthed(req) {
  if (!loginEnabled()) return false;
  const token = req.cookies && req.cookies[COOKIE];
  if (!token) return false;
  const [expires, sig] = token.split('.');
  if (!expires || !sig || Number(expires) < Date.now()) return false;
  return safeEqual(sig, sign(expires));
}

function requireAuth(req, res, next) {
  if (isAuthed(req)) return next();
  return res.status(401).json({ error: 'Not signed in' });
}

module.exports = { checkPassword, issueSession, clearSession, isAuthed, requireAuth, loginEnabled };
