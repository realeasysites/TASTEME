const nodemailer = require('nodemailer');

let transporter = null;
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  const port = Number(process.env.SMTP_PORT || 465);
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

function esc(s) {
  return String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

async function notifyInquiry(inq) {
  if (!transporter || !process.env.NOTIFY_EMAIL) return;
  const rows = [
    ['Type', inq.type],
    ['Name', inq.name],
    ['Phone', inq.phone],
    ['Email', inq.email],
    ['Date', inq.event_date],
    ['Guests', inq.guests],
    ['Message', inq.message],
  ]
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;font-weight:bold">${k}</td><td>${esc(v)}</td></tr>`)
    .join('');

  try {
    await transporter.sendMail({
      from: `"Taste ME Website" <${process.env.SMTP_USER}>`,
      to: process.env.NOTIFY_EMAIL,
      replyTo: inq.email || undefined,
      subject: `New ${inq.type} inquiry — ${inq.name}`,
      html: `<h2 style="color:#005ab4">New inquiry from tastemesandwich.com</h2><table>${rows}</table>`,
    });
  } catch (err) {
    console.error('Email notify failed:', err.message);
  }
}

module.exports = { notifyInquiry };
