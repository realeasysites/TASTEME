require('dotenv').config();
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');

const adminRoutes = require('./routes/admin');
const inquiryRoutes = require('./routes/inquiry');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(express.json({ limit: '50kb' }));
app.use(cookieParser());

// Admin first, so /admin always asks for the password before anything static is served.
app.use(adminRoutes);
app.use('/api', inquiryRoutes);

app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'], maxAge: '1h' }));

app.get('/order', (req, res) => res.redirect(302, 'https://www.toasttab.com/local/order/taste-me-680-us-route-1'));
app.get('/healthz', (req, res) => res.json({ ok: true }));

app.use((req, res) => res.status(404).sendFile(path.join(__dirname, 'public', '404.html')));

app.listen(PORT, () => console.log(`Taste ME site running on http://localhost:${PORT}`));
