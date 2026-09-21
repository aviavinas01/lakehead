/*
 * The same bridge the real server uses (server/passenger.cjs): Passenger
 * require()s this CommonJS file, which starts the ES module. If the probe
 * answers at all, this mechanism works on the host.
 */
const path = require("node:path");
const { pathToFileURL } = require("node:url");

import(pathToFileURL(path.join(__dirname, "probe.mjs")).href).catch((err) => {
  console.error("[probe] failed to start:", err);
  process.exit(1);
});
