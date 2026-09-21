# Running the API on cPanel (ProtozoaHost)

Phase 1 of moving off Render. **This step changes no data.** MongoDB Atlas and
Cloudinary keep working exactly as they do now — only the machine running
Express changes. If anything misbehaves, rollback is one line (§8).

---

## 0. What you need first

| | |
|---|---|
| A subdomain for the API | e.g. `api.yourdomain.com` — cPanel → **Domains** → Create A New Domain. You have unlimited subdomains and 0/5 addon domains used. |
| SSL on that subdomain | cPanel → **SSL/TLS Status** → run AutoSSL. **Not optional** — the session cookie is `secure` + `sameSite=none` in production, so the browser silently drops it over plain HTTP and admin sign-in will fail with no visible error. |
| Node 22 | cPanel → **Setup Node.js App**. Confirmed available on your plan. |

Point the subdomain's document root somewhere *other* than the app folder —
Passenger serves the app, and a document root full of source is a document
root somebody can read `.env` out of.

---

## 1. Get the code onto the server

cPanel → **Git™ Version Control** → Create, and clone the repository. Then in
cPanel → **Terminal** (or over SSH):

```bash
cd ~/lakehead-api/server      # wherever the repo landed
npm install                   # dev dependencies included — tsc is one of them
npm run build                 # produces dist/
```

`dist/` is in `.gitignore`, so it is **not** in the repository and has to be
built here. That is deliberate: a committed build is a build that silently
goes stale.

> `npm install` must run *before* you set `NODE_ENV=production` in §3. With
> that variable set, npm skips devDependencies, TypeScript is never
> installed, and `npm run build` fails with "tsc: not found".

---

## 2. Create the Node.js app

cPanel → **Setup Node.js App** → Create Application:

| Field | Value |
|---|---|
| Node.js version | 22.x |
| Application mode | Production |
| Application root | the folder holding `package.json` (e.g. `lakehead-api/server`) |
| Application URL | your API subdomain |
| Application startup file | `passenger.cjs` |

**`passenger.cjs`, not `dist/server.js`.** Passenger loads the startup file
with `require()`, and this package is ESM. On Node 22.12+ that happens to
work; below it, it throws `ERR_REQUIRE_ESM`, and it breaks on any version the
moment something in the graph uses top-level await. The `.cjs` bridge has
none of those conditions, and it turns "you forgot to build" into a sentence
instead of a stack trace. See the comment in the file.

---

## 3. Environment variables

Set these in the Node.js App screen (not in a `.env` file — cPanel injects
them, and a `.env` in a web-reachable folder is a leak waiting to happen).

**Required — the app refuses to start without them:**

| Variable | Note |
|---|---|
| `MONGO_URI` | same Atlas string Render uses |
| `JWT_SECRET` | ≥32 chars, same value as Render or every session is logged out |
| `CLIENT_URL` | the **site's** origin, e.g. `https://yourdomain.com` — this is the CORS allow-list |
| `ADMIN_EMAIL` | |
| `ADMIN_PASSWORD` | ≥8 chars |
| `ADMIN_GATE_CODE` | ≥12 chars |
| `NODE_ENV` | `production` — set it **after** §1 |

**Copy across from Render if set:** `JWT_EXPIRES_IN`, `GOOGLE_MAPS_API_KEY`,
`GOOGLE_PLACE_ID`, `YOUTUBE_PLAYLIST_ID`, `YOUTUBE_CHANNEL_ID`,
`RESEND_API_KEY`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_SECURE`, `MAIL_USER`,
`MAIL_PASS`, `MAIL_FROM`, `MAIL_TO`, and the three `CLOUDINARY_*` values.

**Do not set `PORT`.** Passenger owns it. (The schema tolerates a nonsense
value now — it used to crash the boot with a Zod error about a port that
Passenger ignores anyway.)

**Atlas network access:** add the cPanel server's IP in Atlas → Network
Access, or the connection will hang and then time out. Find the IP in cPanel
→ **Server Information** → Shared IP Address.

---

## 4. Start it, and read the log

Click **Restart** in the Node.js App screen. Then:

```bash
curl -s https://api.yourdomain.com/api/health | head -40
```

Expect JSON with `status`, the database state, and an `uploads` block. If it
does not answer, the Passenger log is at
`~/logs/<subdomain>.error.log` or via **Errors** in cPanel. The messages to
look for are ours and say what to do: `[passenger] dist/server.js is missing`,
`[db] attempt 1/6 failed`, or a Zod list of missing variables.

---

## 5. Check the things that break quietly

Do these **before** pointing the site at it. None of them show up in a health
check.

- [ ] `/api/health` reports the database connected
- [ ] `GET /api/v1/posts` returns your real articles
- [ ] Existing Cloudinary images still load (they are absolute URLs — unchanged)
- [ ] **Admin sign-in works end to end** — the cookie is the fragile part. If
      the gate opens but the password is always "invalid", the cookie is being
      dropped: check SSL is live on the subdomain.
- [ ] **Upload a large image.** In Cloudinary mode the file is buffered in
      memory, and shared hosting has far less of it than Render. If big
      uploads fail, that is expected here and Phase 2 fixes it by streaming
      to disk instead.
- [ ] The first request after ~20 minutes idle — Passenger stops idle apps, so
      it will be slow, then fine. In-memory caches (Google rating, YouTube,
      TikTok) reset on that restart and refetch.

---

## 6. Point the site at it

In `client/vercel.json`, change both rewrite destinations:

```json
{ "source": "/api/:path*",     "destination": "https://api.yourdomain.com/api/:path*" },
{ "source": "/uploads/:path*", "destination": "https://api.yourdomain.com/uploads/:path*" }
```

Keeping the rewrite (rather than calling the API subdomain directly from the
browser) is what keeps the session cookie first-party. Do not "simplify" it by
setting `VITE_API_URL` to the API host — that makes the cookies third-party
and Safari, Brave and Chrome Incognito drop them silently. The note in
`client/src/api/client.ts` explains this at length.

Redeploy the client. Nothing else in the client changes.

---

## 7. Afterwards

- Leave the Render service **suspended, not deleted**, for a week or two.
- `render.yaml` stays in the repo for the same reason.
- Keep `CLOUDINARY_*` set until Phase 2 is done and verified.

---

## 8. Rollback

Put the two `vercel.json` destinations back to
`https://lakehead.onrender.com/...`, resume the Render service, redeploy the
client. That is the whole rollback — no data moved in this phase, so there is
nothing to restore.

---

## What Phase 1 does not do

Images still go to Cloudinary and data still lives in Atlas. Phase 2 moves
uploads to this server's disk (the disk backend already exists in
`services/storage.service.ts`, and `UPLOADS_DIR` overrides where it writes);
Phase 3 moves the database to PostgreSQL. Neither is safe until this one is
proven.
