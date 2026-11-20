# Taste ME — Website

Asian fusion sandwich & bakery · 680 US Route 1, Scarborough, ME · (207) 303-0013
Built by **Real Easy Sites**.

## Stack
Node 20 / Express + SQLite (better-sqlite3), with a password-protected inquiry dashboard at `/admin`.

```
server.js          thin entry point
db/                SQLite setup (inquiries table)
lib/               auth.js (password-only admin login), mailer.js (email alerts)
routes/            inquiry.js (public form API), admin.js (dashboard + API)
views/             admin login + dashboard pages
public/            the website (index, menu, 404, css, js, images)
```

## How ordering works
All "Order" buttons go to Taste ME's **Toast online ordering**:
`https://www.toasttab.com/local/order/taste-me-680-us-route-1`
(`/order` on this site also redirects there.) Toast stays the source of truth for live prices and sold-out items.

## Updating the menu
Edit `public/js/menu-data.js`. Each item is `{ name, desc, price, tags }`.
Tags: `new`, `seasonal`, `fav`, `gf`, `veg`, `spicy`.

## Hours
Hours appear in the top bar, the Visit section table, the footer, and the JSON-LD block in `public/index.html`. Update all four when hours change (currently winter hours: 7AM–3PM, closed Tuesday).

## Local dev
```
cp .env.example .env     # set ADMIN_PASSWORD
npm install
npm start                # http://localhost:3000
```

## Deploy on Render
- New **Web Service** from this repo. Build: `npm install` · Start: `npm start`
- Node is pinned to 20.x (`.node-version` + `engines`) because better-sqlite3 needs it.
- Add a **persistent disk** (e.g. mounted at `/var/data`) and set `DB_PATH=/var/data/tasteme.db`, or inquiries reset on every deploy.
- Environment: `ADMIN_PASSWORD`, `SESSION_SECRET`, `NODE_ENV=production`, plus `NOTIFY_EMAIL` / `SMTP_USER` / `SMTP_PASS` for email alerts.

## Admin dashboard
`/admin` → password only. Shows every catering/event inquiry with status (new → contacted → booked → closed) and a Delete button for spam/test entries. Login is disabled until `ADMIN_PASSWORD` is set.

## Domain note
`tastemesandwich.com` currently points at Toast's hosted site. When the domain is pointed to Render, Toast ordering keeps working because every order link uses the toasttab.com URL above.
