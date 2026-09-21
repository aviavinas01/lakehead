/*
 * HOST PROBE — a throwaway app that measures the cPanel hosting before the
 * real site is moved onto it. Deploy it, visit it once, send the report,
 * then DELETE it (see README.md). It is not part of the website.
 *
 * WHAT IT ANSWERS, each of which the migration depends on:
 *
 *   · Node      exact version; that Passenger starts an ES module through
 *               passenger.cjs, the way the real server will be started.
 *   · Routing   whether a Node app mounted at /api receives "/api/..." or
 *               has the prefix stripped — which decides how the real
 *               server's routes are mounted.
 *   · Visitor IP which header carries it and how many proxies sit in front
 *               — the login rate limiter trusts exactly that many, and a
 *               wrong count either locks every visitor into one shared
 *               allowance or lets an attacker invent a fresh IP per request.
 *   · Postgres  version, whether the app's user can create tables, whether
 *               UUIDs and JSONB are available — the schema is built on both.
 *   · Network   whether the server may make outbound HTTPS calls (mail,
 *               Google reviews and YouTube all need to).
 *   · Disk      where home is, that a data folder OUTSIDE public_html is
 *               writable, and how much room there is.
 *
 * SAFE TO RUN ON THE REAL ACCOUNT, deliberately:
 *   · Every path answers 404 unless ?key= matches PROBE_KEY exactly, and it
 *     refuses to start at all without a long key. The report names
 *     environment VARIABLES but never prints their values, and the
 *     database password is never echoed.
 *   · It writes one tiny file in ~/lakehead-data and deletes it again. It
 *     reads nothing else from disk and changes nothing in the database: its
 *     one table is TEMPORARY and vanishes with the connection.
 *   · No framework — Node's own http module, and `pg` for the database
 *     test. The fewer packages on the host, the less there is to audit.
 */

import http from "node:http";
import os from "node:os";
import fs from "node:fs/promises";
import path from "node:path";
import { timingSafeEqual } from "node:crypto";

const STARTED = new Date();
const KEY = process.env.PROBE_KEY ?? "";

if (KEY.length < 24) {
  /* Better not to run at all than to run a diagnostics page anyone can read. */
  console.error("[probe] PROBE_KEY must be set to at least 24 characters. Refusing to start.");
  process.exit(1);
}

const keyMatches = (given) => {
  const a = Buffer.from(String(given ?? ""));
  const b = Buffer.from(KEY);
  return a.length === b.length && timingSafeEqual(a, b);
};

/** Resolves to a value or to { error } — a probe must never hang or throw. */
const within = (ms, promise) =>
  Promise.race([
    promise,
    new Promise((resolve) => setTimeout(() => resolve({ error: `timed out after ${ms}ms` }), ms)),
  ]).catch((e) => ({ error: String(e?.code ?? e?.message ?? e) }));

async function outbound(url) {
  const t = Date.now();
  const r = await within(
    8000,
    fetch(url, { method: "HEAD", redirect: "manual" }).then((res) => ({ status: res.status }))
  );
  return { url, ...r, ms: Date.now() - t };
}

async function postgres() {
  const url = process.env.PROBE_PG_URL;
  if (!url) return { skipped: "PROBE_PG_URL not set" };

  let pg;
  try {
    pg = (await import("pg")).default;
  } catch {
    return { error: "the pg package is not installed — press 'Run NPM Install'" };
  }

  const client = new pg.Client({ connectionString: url, connectionTimeoutMillis: 6000 });
  const out = {};
  try {
    await client.connect();
    const one = async (label, sql) => {
      try {
        const res = await client.query(sql);
        out[label] = res.rows[0] ? Object.values(res.rows[0])[0] : null;
      } catch (e) {
        out[label] = { error: e.message };
      }
    };
    await one("version", "select version()");
    await one("server_version_num", "show server_version_num");
    await one("current_user", "select current_user");
    await one("database", "select current_database()");
    await one("encoding", "show server_encoding");
    await one("timezone", "show timezone");
    await one("listen_addresses", "show listen_addresses");
    await one("can_create_in_public", "select has_schema_privilege(current_user, 'public', 'CREATE')");
    await one("is_db_owner", "select pg_get_userbyid(datdba) = current_user from pg_database where datname = current_database()");
    await one("gen_random_uuid", "select gen_random_uuid()::text");
    await one("jsonb", `select ('{"a":1}'::jsonb ->> 'a')`);
    await one("extensions_available",
      "select string_agg(name, ',' order by name) from pg_available_extensions where name in ('pgcrypto','citext','pg_trgm','uuid-ossp')");
    /* A TEMPORARY table: proves create/insert/select work, and is gone the
       moment this connection closes. Nothing permanent is written. */
    try {
      await client.query("create temporary table probe_t (id uuid primary key default gen_random_uuid(), doc jsonb)");
      await client.query(`insert into probe_t (doc) values ('{"ok":true}')`);
      const r = await client.query("select count(*)::int as n from probe_t");
      out.temp_table_roundtrip = r.rows[0].n === 1 ? "ok" : r.rows[0];
    } catch (e) {
      out.temp_table_roundtrip = { error: e.message };
    }
  } catch (e) {
    return { error: `could not connect: ${e.code ?? ""} ${e.message}` };
  } finally {
    await client.end().catch(() => {});
  }
  return out;
}

async function disk() {
  const home = os.homedir();
  const dataDir = path.join(home, "lakehead-data");
  const out = {
    home,
    cwd: process.cwd(),
    app_dir: path.dirname(new URL(import.meta.url).pathname),
    data_dir: dataDir,
    data_dir_is_inside_public_html: dataDir.startsWith(path.join(home, "public_html")),
  };
  const probeFile = path.join(dataDir, ".probe-write-test");
  try {
    await fs.mkdir(dataDir, { recursive: true, mode: 0o700 });
    await fs.writeFile(probeFile, "ok");
    await fs.unlink(probeFile);
    out.data_dir_writable = true;
  } catch (e) {
    out.data_dir_writable = { error: e.code ?? e.message };
  }
  try {
    const st = await fs.statfs(home);
    out.free_gb = Math.round(((st.bavail * st.bsize) / 1024 ** 3) * 10) / 10;
  } catch (e) {
    out.free_gb = { error: e.code ?? e.message };
  }
  return out;
}

async function report(req) {
  const h = req.headers;
  return {
    probe: "lakehead host probe",
    generated_at: new Date().toISOString(),
    process_started_at: STARTED.toISOString(),
    node: {
      version: process.version,
      openssl: process.versions.openssl,
      platform: `${process.platform} ${os.release()} ${process.arch}`,
      running_as_esm: true,
      cpus: os.cpus().length,
      /* On CloudLinux these are the MACHINE's figures, not the account's
         limit — the real cap is on cPanel's Resource Usage page. */
      machine_total_mem_mb: Math.round(os.totalmem() / 1024 ** 2),
      process_rss_mb: Math.round(process.memoryUsage().rss / 1024 ** 2),
      tz: process.env.TZ ?? null,
    },
    passenger: {
      PORT: process.env.PORT ?? null,
      env_var_names: Object.keys(process.env)
        .filter((k) => /^(PASSENGER|NODE|PORT|TZ|LANG|PROBE)/.test(k))
        .sort(),
    },
    request: {
      method: req.method,
      /* THE ROUTING ANSWER: if the app is mounted at /api and this still
         begins with "/api", the prefix reaches the app intact.

         PATH ONLY. The query string carries ?key=, and this report is meant
         to be pasted into a chat — echoing the whole URL would hand the key
         to whoever reads it. */
      path_as_received: new URL(req.url ?? "/", "http://probe.local").pathname,
      host: h.host ?? null,
      socket_remote_address: req.socket.remoteAddress ?? null,
      x_forwarded_for: h["x-forwarded-for"] ?? null,
      x_forwarded_proto: h["x-forwarded-proto"] ?? null,
      x_forwarded_host: h["x-forwarded-host"] ?? null,
      x_real_ip: h["x-real-ip"] ?? null,
      forwarded: h["forwarded"] ?? null,
      via: h["via"] ?? null,
      note: "Compare x_forwarded_for with your own IP (search 'what is my ip'). Tell me which position it is in.",
    },
    outbound_https: await Promise.all([
      outbound("https://api.resend.com/"),
      outbound("https://places.googleapis.com/"),
      outbound("https://www.googleapis.com/"),
      outbound("https://www.youtube.com/"),
      outbound("https://registry.npmjs.org/"),
    ]),
    postgres: await postgres(),
    disk: await disk(),
  };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://probe.local");

  /* THE UPLOADS TEST. cPanel mounts a Node app at ONE path (/api), but the
     real server also answers /uploads. The rules file rewrites /uploads/...
     to /api/uploads/... inside Apache; if this answers when the browser asked
     for /uploads/probe-check, that hand-over works. Deliberately needs no
     key and reveals nothing but the path it saw. */
  if (req.method === "GET" && url.pathname.endsWith("/uploads/probe-check")) {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" });
    res.end(`OK - the Node app answered. Path it received: ${url.pathname}\n`);
    return;
  }

  /* One route, whether or not the /api prefix survives — we are measuring
     exactly that. Everything else, and a wrong key, is a plain 404. */
  const isReport = url.pathname === "/api/report" || url.pathname === "/report";
  if (req.method !== "GET" || !isReport || !keyMatches(url.searchParams.get("key"))) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
    return;
  }
  try {
    const body = JSON.stringify(await report(req), null, 2);
    res.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    });
    res.end(body);
  } catch (e) {
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end(`probe failed: ${e.message}`);
  }
});

/* Passenger ignores the port and binds its own socket; locally this is 3000. */
server.listen(process.env.PORT || 3000, () => {
  console.log("[probe] listening");
});
