# Moving to ProtozoaHost — the runbook

Everything the site needs, moving onto the cPanel account that already hosts
`lakehead.edu.np`, and the old PHP site it replaces. Written to be followed
in order. **Nothing on the live site changes until step 6.**

Status: **step 1 in progress** (host probe — see `tools/host-probe/README.md`).

---

## Where things stand (measured, not assumed)

| | Today | After |
|---|---|---|
| `lakehead.edu.np` | the **old PHP site** (PHP 7.4 — no security fixes since Nov 2022), served from the cPanel server | the new site |
| New site's pages | Vercel, at `lakehead.vercel.app` only — it has never been on the real domain | cPanel (Apache) |
| API | Render, Singapore | cPanel (Node 22, Passenger) |
| Database | MongoDB Atlas | PostgreSQL on the same server, local connections only |
| Uploaded images | Render's disk — **holds 0 files; all 9 images in live posts are already lost** | a private folder on the cPanel disk, backed up by JetBackup |
| Cloudinary | configured in code, **not used by anything live** | removed |
| Email to `@lakehead.edu.np` | **Microsoft 365** (Outlook) | unchanged — not touched at any point |
| Site's own emails | Resend (verified for the domain) | unchanged |
| Server | Hetzner, Germany (`168.119.138.253`) | same |

**Until switchover: no image uploads in the live admin** — they vanish. Any
test booking that arrives needs its signature re-sent.

## DNS records that must never be edited or deleted

The switchover needs no DNS change at all — the domain already points at
this server. If anyone opens the Zone Editor for another reason, these stay
exactly as they are:

| Record | What breaks if touched |
|---|---|
| `MX lakehead.edu.np → lakehead-edu-np.mail.protection.outlook.com` | all email to the domain |
| `CNAME autodiscover → autodiscover.outlook.com` | Outlook setup on phones and laptops |
| `TXT lakehead.edu.np` (the `v=spf1 …` line) | outgoing mail lands in spam |
| `TXT resend._domainkey` and Resend's `send` records | the site's enquiry and booking emails |
| `TXT _dmarc` | mail authentication reports |

---

## The seven steps

| # | Step | Who | State |
|---|---|---|---|
| 1 | **Measure the host** — probe app on `probe.lakehead.edu.np`; create the PostgreSQL database and user | you, in cPanel | **now** |
| 2 | **MongoDB → PostgreSQL** in the code; tested locally against real Postgres | me | after step 1 |
| 3 | **Storage on disk only** — Cloudinary removed; uploads and signatures in private folders outside `public_html`, served only through the app | me | after step 1 |
| 4 | **One domain** — Apache serves the pages, the app serves `/api` and `/uploads`; security headers carried over from Vercel; old-URL redirects; cookies tightened to same-site | me | after step 1 |
| 5 | **Staging** — the whole new site on `staging.lakehead.edu.np`, with the real data copied from Atlas; everything tested while the old site stays live | both | after 2–4 |
| 6 | **Replace the old site** — below | both | after 5 passes |
| 7 | **Clean up** — below | you | 30 days after 6 |

Steps 2–4 depend on what the probe reports: how `/api` reaches Node, which
header carries the visitor's IP, and the PostgreSQL version.

---

## Step 6 — replacing the old site

Done in a quiet hour. The visible outage is a few seconds: the swap is a
folder rename, and the old site stays on disk, one rename away, the whole
time.

### 6.1 Back up everything first

Nothing is moved until all three exist **on your computer**, not only on
the server:

1. **Full account backup** — cPanel → *Backup* → *Download a Full Account
   Backup* (or JetBackup → full backup → download).
2. **The old site's database** — cPanel → *phpMyAdmin* → select the old
   database → *Export* → *Quick* → *SQL* → Go. This holds the appointment
   requests students sent through the old "Book Appointment" form: it is
   personal data, so keep the file somewhere private and do not email it
   around.
3. **The old files on their own** — *File Manager* → `public_html` → select
   all → *Compress* → download the zip.

### 6.2 Look before touching

In *File Manager*, with *Show Hidden Files* on, write down everything in
`public_html`. Three things are **not** part of the old site and stay:

- `.well-known/` — how the SSL certificate renews itself
- `cgi-bin/` — cPanel's own
- anything you recognise as unrelated to the old site (tell me first)

### 6.3 Freeze the admin

Stop editing in the new admin on staging. Run the final Atlas → PostgreSQL
copy (step 5 prepared the script) so the live database holds the latest
posts, enquiries and bookings.

### 6.4 The swap

1. Create `~/old-site-archive-YYYY-MM-DD/` — in your **home** folder, not
   in `public_html`, so it cannot be reached from the web.
2. Move the old site's files from `public_html` into it — everything except
   `.well-known`, `cgi-bin` and the items noted in 6.2.
3. Upload the new site's built files into `public_html`.
4. Point the production Node app at `lakehead.edu.np/api`, and put the new
   `.htaccess` in place (prepared in step 4): the Passenger block cPanel
   writes, HTTPS-only, `www` → `lakehead.edu.np`, the security headers, the
   redirects below, and the single-page-site fallback.

### 6.5 Check it

- The home page, a service page, a destination guide, the blog and a blog
  post load.
- An enquiry sends, and arrives in Outlook.
- A test booking with a signature arrives in the admin, and its signature
  opens.
- The admin signs in.
- Every old address in the table below lands on its new page.
- `https://lakehead.edu.np/api/health` answers.
- Email to `info@lakehead.edu.np` still arrives (nothing touched it, but
  check anyway).

### 6.6 If anything is wrong

Move the new files out of `public_html`, move the archive back in. The old
site is back in under a minute. Nothing else was changed.

---

## Old addresses and where they go

Permanent (301) redirects, so Google moves its ranking to the new pages and
nobody arriving from an old link or bookmark sees an error.

| Old address | New page |
|---|---|
| `/about-us` | `/about` |
| `/contact-us` | `/contact` |
| `/booking-form`, `/booking` | `/contact` |
| `/classes` | `/services/test-preparation` |
| `/dblogs`, `/dblogs/1` … `/dblogs/5` | `/blog` |
| `/service/detail/1` … `/service/detail/9` | `/services` |

The five 2022 blog posts are not carried over — their redirect goes to the
new blog.

---

## Step 7 — clean-up, 30 days after the switch

With nothing having gone wrong:

- Delete `~/old-site-archive-YYYY-MM-DD/`.
- Delete the old MySQL database and its user (the export from 6.1 is the
  kept copy).
- Remove the `probe` and `staging` subdomains.
- Take a final export of the Atlas database, then close **Render**,
  **MongoDB Atlas** and the **Vercel** project. Remove the Cloudinary
  account if one was ever created.
- Remove `render.yaml` and `client/vercel.json` from the repository.

## Worth knowing

**The server is in Germany.** The old site already runs there, so today's
visitors see no change — but the new pages currently come from Vercel's
network, which has points near Nepal, and after the move they come from
Germany. It is still quick for a site this size. If it ever feels slow in
Nepal, putting Cloudflare's free plan in front would cache the pages close
to visitors; that is a later, separate decision.
