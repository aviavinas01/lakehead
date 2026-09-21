/*
 * The entry point cPanel's "Setup Node.js App" starts the server through.
 *
 * ------------------------------------------------------------------
 * WHY THIS FILE EXISTS AT ALL, when there is a perfectly good
 * dist/server.js sitting next to it.
 *
 * cPanel runs Node apps behind Phusion Passenger, and Passenger loads the
 * startup file with `require()`. This package is ESM ("type": "module" in
 * package.json), so every .js file in dist/ is an ES module.
 *
 * MEASURED, NOT ASSUMED: on Node 22.18 `require()` of an ES module works —
 * Node enabled that by default in 22.12 — so on that version Passenger
 * could load dist/server.js directly and this file would be unnecessary.
 *
 * It is kept anyway, because "unnecessary on the version we happen to have"
 * is not the same as safe:
 *
 *   · below Node 22.12 the same require() throws ERR_REQUIRE_ESM, and a
 *     shared host is free to change which 22.x it offers, or to be asked
 *     for 20 or 18 later;
 *   · require(esm) still refuses any module graph containing top-level
 *     await. Nothing in dist/ uses one today. Nothing has to, either — and
 *     the day something does, the failure would arrive at deploy time in a
 *     Passenger log rather than anywhere useful.
 *
 * A .cjs file is CommonJS whatever package.json says, so Passenger can
 * require THIS, and CommonJS reaches an ES module through the dynamic
 * `import()` function, which has none of those conditions. One small
 * bridge, no version to keep an eye on, and the real server is untouched.
 *
 * IT IS ALSO WHERE "you forgot to build" GETS A SENTENCE. Without the check
 * below, a missing dist/ surfaces as a module-resolution stack trace inside
 * Passenger's loader. With it, the log says which command to run.
 *
 * NOTHING ELSE BELONGS IN HERE. The port, the signals, the shutdown and the
 * error handling all live in src/ and work the same wherever they run — see
 * config/lifecycle.ts, which Passenger's restart signal (SIGTERM) now goes
 * through properly.
 * ------------------------------------------------------------------
 *
 * In cPanel → Setup Node.js App:
 *   Application root          the folder holding this file
 *   Application startup file  passenger.cjs
 *   Application mode          Production
 */

const { existsSync } = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const entry = path.join(__dirname, "dist", "server.js");

if (!existsSync(entry)) {
  console.error(
    "[passenger] dist/server.js is missing.\n" +
      "            The TypeScript has not been compiled on this server.\n" +
      "            Run `npm install` then `npm run build` in " +
      __dirname
  );
  process.exit(1);
}

/* pathToFileURL, not the bare path: dynamic import() of an absolute path
   string is not portable, and a file:// URL is what it actually wants. */
import(pathToFileURL(entry).href).catch((err) => {
  console.error("[passenger] the server failed to start:", err);
  process.exit(1);
});
