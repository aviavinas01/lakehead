// npx tsx src/scripts/checkLifecycle.ts
//
// The shutdown path, driven for real in child processes: the ACTUAL
// lifecycle module, a real listening server, and assertions on the exit code
// and the ORDER of what it closed.
//
// It has to be child processes. The whole point of the module is that it
// ends the process it is in, so testing it in-process would end this script
// on the first assertion. Nothing here touches the database — `onClose` is a
// stand-in that records that it was called, which is the only thing the
// lifecycle promises about it.
//
// ------------------------------------------------------------------
// WHY THE SIGNAL CASES ARE SPLIT IN TWO.
//
// Windows cannot deliver a catchable SIGTERM. `child.kill("SIGTERM")` there
// terminates the process outright — measured, not assumed: the child exits
// with a null code, a SIGTERM signal, and its handler never runs. Render is
// Linux and does deliver it, so the code is right; the local harness simply
// cannot exercise that one step.
//
// So signals are tested in the two halves that CAN be checked anywhere:
//
//   · that a handler is registered for each signal, exactly once;
//   · that the shutdown it invokes does the right thing, by calling it
//     directly — which runs every line the signal path would run except the
//     OS's delivery of the signal itself.
//
// On Linux the end-to-end signal case runs too, and is skipped here with a
// note rather than silently passing.
// ------------------------------------------------------------------
import { fileURLToPath } from "node:url";
import path from "node:path";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { connect as netConnect } from "node:net";
import { installLifecycle } from "../config/lifecycle.js";

let fails = 0;
const ok = (label: string, cond: boolean, detail = "") => {
  if (!cond) fails++;
  console.log(`${cond ? "ok  " : "FAIL"}  ${label}${detail ? `  — ${detail}` : ""}`);
};
const skip = (label: string, why: string) => console.log(`skip  ${label}  — ${why}`);

const SIGNALS_DELIVERABLE = process.platform !== "win32";
const here = path.dirname(fileURLToPath(import.meta.url));
const selfUrl = fileURLToPath(import.meta.url);
const tsxCli = path.join(here, "..", "..", "node_modules", "tsx", "dist", "cli.mjs");

interface Outcome {
  code: number | null;
  signal: NodeJS.Signals | null;
  out: string;
}

/** Runs this same file as a child in the mode named by argv[2]. `onReady`
    fires once the child has printed READY. */
const child = (
  mode: string,
  onReady?: (proc: ReturnType<typeof spawn>) => void
): Promise<Outcome> =>
  new Promise((resolve) => {
    const proc = spawn(process.execPath, [tsxCli, selfUrl, mode], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    let out = "";
    let fired = false;
    const take = (b: Buffer) => {
      out += b.toString();
      if (!fired && onReady && out.includes("READY")) {
        fired = true;
        /* Guarded: the child may already have gone, and a kill on a dead pid
           throws ESRCH and would take this script down with it. */
        try {
          onReady(proc);
        } catch {
          /* the assertions below say whether that mattered */
        }
      }
    };
    proc.stdout.on("data", take);
    proc.stderr.on("data", take);
    proc.on("close", (code, signal) => resolve({ code, signal, out }));
  });

const mode = process.argv[2];

/* ---------------------------------------------------------------- */
/* The child                                                          */
/* ---------------------------------------------------------------- */
if (mode) {
  const server = createServer((_req, res) => res.end("ok"));

  const lifecycle = installLifecycle({
    getServer: () => server,
    onClose: async () => {
      console.log("ONCLOSE-CALLED");
    },
    graceMs: mode === "grace" ? 200 : 10_000,
  });

  server.listen(0, () => {
    console.log("READY");

    switch (mode) {
      case "listeners":
        /* What the OS would have to find in order to deliver anything. */
        for (const sig of ["SIGTERM", "SIGINT"] as const) {
          console.log(`LISTENERS ${sig} ${process.listenerCount(sig)}`);
        }
        console.log(
          `LISTENERS uncaughtException ${process.listenerCount("uncaughtException")}`
        );
        console.log(
          `LISTENERS unhandledRejection ${process.listenerCount("unhandledRejection")}`
        );
        process.exit(0);
        break;

      case "direct":
        /* Every line the SIGTERM path runs, minus the OS delivering it. */
        void lifecycle.shutdown("SIGTERM", 0);
        break;

      case "twice":
        /* Three calls racing. A second run would call exit() twice and let
           whichever won decide the code. */
        void lifecycle.shutdown("SIGTERM", 0);
        void lifecycle.shutdown("SIGINT", 0);
        void lifecycle.shutdown("uncaught exception", 1);
        break;

      case "grace": {
        /* A raw socket held open, so server.close() can never call back and
           the backstop is the only thing that can end the process. A plain
           TCP connection is enough: Node waits for every open connection,
           idle or not. */
        const port = (server.address() as { port: number }).port;
        const held = netConnect(port, "127.0.0.1");
        held.on("error", () => {});
        held.on("connect", () => {
          setTimeout(() => void lifecycle.shutdown("SIGTERM", 0), 40);
        });
        break;
      }

      case "throw":
        /* Not inside a request — exactly the case asyncHandler cannot catch. */
        setTimeout(() => {
          throw new Error("boom from a timer");
        }, 10);
        break;

      case "reject":
        setTimeout(() => {
          void Promise.reject(new Error("nobody awaited this"));
        }, 10);
        break;

      case "sigterm":
      case "sigint":
        /* Waits to be signalled. Only reachable where signals work. */
        setInterval(() => {}, 1000);
        break;
    }
  });
} else {
  /* ---------------------------------------------------------------- */
  /* The parent                                                         */
  /* ---------------------------------------------------------------- */
  console.log("--- 1. a handler is registered for each of the four ---");
  let r = await child("listeners");
  for (const sig of ["SIGTERM", "SIGINT", "uncaughtException", "unhandledRejection"]) {
    ok(
      `${sig} has exactly one handler`,
      r.out.includes(`LISTENERS ${sig} 1`),
      r.out.match(new RegExp(`LISTENERS ${sig} \\d+`))?.[0] ?? "none"
    );
  }

  console.log("\n--- 2. the shutdown path itself (what a signal invokes) ---");
  r = await child("direct");
  ok("exits 0 — a deploy is not an error", r.code === 0, `code ${r.code}`);
  ok("says why it is closing", r.out.includes("[shutdown] SIGTERM — closing"));
  ok("closes the http server", r.out.includes("http server closed"));
  ok("closes the database", r.out.includes("ONCLOSE-CALLED"));
  ok(
    "closes sockets BEFORE the database",
    r.out.indexOf("http server closed") < r.out.indexOf("ONCLOSE-CALLED"),
    "a request still finishing needs the database"
  );

  console.log("\n--- 3. it runs once, however many times it is called ---");
  r = await child("twice");
  ok("exits 0 — the first call decided the code", r.code === 0, `code ${r.code}`);
  ok(
    "closed the database exactly once",
    r.out.split("ONCLOSE-CALLED").length - 1 === 1,
    `${r.out.split("ONCLOSE-CALLED").length - 1} times`
  );
  ok(
    "announced the shutdown exactly once",
    (r.out.match(/— closing/g) ?? []).length === 1,
    `${(r.out.match(/— closing/g) ?? []).length} announcements`
  );

  console.log("\n--- 4. an uncaught exception from a timer ---");
  r = await child("throw");
  ok("exits 1 — this one IS an error", r.code === 1, `code ${r.code}`);
  ok("logs it as fatal", r.out.includes("[fatal] uncaught exception"));
  ok("names the error", r.out.includes("boom from a timer"));
  ok("still closes the http server", r.out.includes("http server closed"));
  ok("still closes the database on the way out", r.out.includes("ONCLOSE-CALLED"));

  console.log("\n--- 5. an unhandled promise rejection ---");
  r = await child("reject");
  ok("exits 1", r.code === 1, `code ${r.code}`);
  ok("logs it as fatal", r.out.includes("[fatal] unhandled promise rejection"));
  ok("names the reason", r.out.includes("nobody awaited this"));
  ok("still closes the database", r.out.includes("ONCLOSE-CALLED"));

  console.log("\n--- 6. the backstop, when something will not close ---");
  r = await child("grace");
  ok("still exits rather than hanging", r.code !== null, `code ${r.code}`);
  ok("keeps the code it was given", r.code === 0, `code ${r.code}`);

  console.log("\n--- 7. end-to-end signal delivery ---");
  if (SIGNALS_DELIVERABLE) {
    r = await child("sigterm", (proc) => proc.kill("SIGTERM"));
    ok("SIGTERM exits 0", r.code === 0, `code ${r.code}, signal ${r.signal}`);
    ok("SIGTERM was handled, not fatal", r.signal === null, String(r.signal));
    ok("SIGTERM closed the database", r.out.includes("ONCLOSE-CALLED"));

    r = await child("sigint", (proc) => proc.kill("SIGINT"));
    ok("SIGINT exits 0", r.code === 0, `code ${r.code}`);
    ok("SIGINT closed the database", r.out.includes("ONCLOSE-CALLED"));
  } else {
    skip(
      "SIGTERM/SIGINT delivered by the OS",
      "Windows terminates instead of signalling; section 1 proves the handlers " +
        "are registered and section 2 proves what they invoke. Runs on Render."
    );
  }

  console.log(fails === 0 ? "\nALL PASS" : `\n${fails} FAILED`);
  process.exit(fails === 0 ? 0 : 1);
}
