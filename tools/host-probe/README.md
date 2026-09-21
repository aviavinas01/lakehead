# Host probe — step 1 of the migration

A throwaway app that measures the ProtozoaHost cPanel account before the real
site moves onto it. It changes nothing permanent. **Delete it when done**
(step 8).

It answers, in one visit: the exact Node version and whether Passenger can
start the site the way the real server starts; whether a Node app mounted at
`/api` can share a domain with the static site Apache serves; which header
carries a visitor's real IP; the PostgreSQL version and what the app's user
may do; whether the server can call out to Resend, Google and YouTube; and
where the site's private data folder can live.

---

## 0. Two things to look up first

- **Terminal:** in cPanel, search for **"Terminal"** (usually under
  *Advanced*). Also check **Security → SSH Access**. Tell me which exist.
- **Resource limits:** open **Resource Usage** (or the stats in cPanel's
  left sidebar) and note the limits for *Physical Memory*, *Entry Processes*
  and *Number of Processes*.

## 1. Create the database (it will become the real one)

**PostgreSQL Databases** in cPanel:

1. *Create New Database* → `lakehead`
2. *Add New User* → `lakehead_app`, with a password of **32 letters and
   digits, no symbols**. Length is where the strength comes from; symbols
   only cause trouble inside connection strings. Save it in a password
   manager — you will need it again.
3. *Add User to Database* → that user, that database, **ALL** privileges.

cPanel puts your account name in front of both, e.g. `cpuser_lakehead` and
`cpuser_lakehead_app`. Note the **full** names.

## 2. Create a test subdomain

**Domains → Create A New Domain** → `probe.lakehead.edu.np`. Untick
*Share document root*. Then **SSL/TLS Status → Run AutoSSL** so it has
HTTPS.

This does not touch the live site at `lakehead.edu.np` — a subdomain has
its own folder.

## 3. Upload the app — NOT into public_html

**File Manager** → your home folder (the level *above* `public_html`) →
create a folder **`lakehead-probe`** → upload exactly these four files:

    probe.mjs
    passenger.cjs
    package.json
    package-lock.json

`package-lock.json` pins the exact version of every package the server
installs, so the host gets precisely what was tested. Do not upload
`node_modules` or the `static` folder here.

## 4. Create the Node.js app

**Setup Node.js App → Create Application**:

| Field | Value |
|---|---|
| Node.js version | **22.x** (the highest 22 offered) |
| Application mode | Production |
| Application root | `lakehead-probe` |
| Application URL | `probe.lakehead.edu.np` and, in the path box beside it, **`api`** |
| Application startup file | `passenger.cjs` |

Under **Environment variables**, add:

| Name | Value |
|---|---|
| `PROBE_KEY` | any 32+ letters and digits — this is the page's password |
| `PROBE_PG_URL` | `postgresql://FULLUSER:PASSWORD@localhost:5432/FULLDBNAME` |

Use the **full, prefixed** names from step 1. Then press **Save**, then
**Run NPM Install**, then **Restart**.

## 5. Put the test page on the subdomain

**File Manager** → the subdomain's *document root* (shown on the Domains
page) → upload `static/index.html` and the whole `static/about/` folder, so
the document root contains `index.html` and `about/test.txt`.

Then, in the same folder, turn on **Settings → Show Hidden Files**, open the
existing **`.htaccess`** (the Node.js app screen created it) and **paste the
contents of `static/htaccess-rules.txt` at the bottom**.

> Keep the block marked `CLOUDLINUX PASSENGER CONFIGURATION` that is already
> in that file. It is what connects `/api` to the Node app; deleting it
> breaks step 6.

## 6. Visit it

Open `https://probe.lakehead.edu.np/` and follow the checklist on the page:

1. `/` shows "Apache served this page"
2. `/about` shows **the same page** (not an error)
3. `/about/test.txt` shows one line of text
4. `/somewhere/deep/...` shows the same page
5. `/uploads/probe-check` shows **"OK - the Node app answered"** and a path
6. Enter your `PROBE_KEY` and press **Run the report**

## 7. Send me

- The whole report (the JSON). It contains no passwords — the database
  password and the key are never printed — so it is safe to paste.
- What steps 6.1–6.5 showed (for 6.5, the path it printed).
- **Your own public IP** (search "what is my ip"), so I can find it in the
  report.
- What you found in step 0.

## 8. Then delete the probe

**Setup Node.js App** → delete the probe application → **File Manager** →
delete the `lakehead-probe` folder and the subdomain's `index.html`,
`about/` and the pasted rules → **Domains** → remove the subdomain.

**Keep the database and its user** — the real site will use them.
